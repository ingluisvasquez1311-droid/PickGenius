import asyncio
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from playwright.async_api import async_playwright, Browser, Page
import redis
import hashlib
import os

class CacheBrowserSystem:
    """
    Sistema que usa navegador real para obtener datos y cache para servir a robots.
    Tu navegador obtiene los datos → Cache → Robots leen de cache
    """
    
    def __init__(self, redis_host='localhost', redis_port=6379):
        # Configuración de Redis (cache)
        self.redis_client = redis.Redis(
            host=redis_host,
            port=redis_port,
            decode_responses=True,
            socket_timeout=5
        )
        
        # Rutas absolutas para evitar duplicación de carpetas
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.debug_dir = os.path.join(self.base_dir, 'debug_screenshots')
        self.user_data_dir = os.path.join(self.base_dir, 'browser_session')
        
        if not os.path.exists(self.debug_dir):
            os.makedirs(self.debug_dir)
        if not os.path.exists(self.user_data_dir):
            os.makedirs(self.user_data_dir)
        
        # Configuración de endpoints (Actualizado 2025 - Más robusto)
        self.endpoints = {
            'sofascore': {
                'url': 'https://www.sofascore.com',
                'active': True,
                'sport_urls': {
                    'football': '',
                    'basketball': '/basketball',
                    'tennis': '/tennis',
                    'baseball': '/baseball',
                    'american-football': '/american-football',
                    'ice-hockey': '/ice-hockey'
                },
                'selectors': {
                    'matches': 'a[href*="/match/"], [data-testid="event_cell"]',
                    'score': '[data-testid="event_cell_score"], [class*="Score"], bdi[class*="textStyle_body"]',
                    'team': '[data-testid*="team_name"], bdi[class*="TeamName"], span[class*="ParticipantName"]'
                }
            },
            'aiscore': {
                'url': 'https://www.aiscore.com',
                'active': True,
                'sport_urls': {
                    'football': '',
                    'basketball': '/basketball',
                    'tennis': '/tennis',
                    'baseball': '/baseball',
                    'american-football': '/american-football',
                    'ice-hockey': '/ice-hockey'
                },
                'selectors': {
                    'matches': '.match-container, .match-item, a[class*="match-list-item"]',
                    'score': '.score-home, .score-away, .score-v',
                    'team': '.home-name, .away-name, .team-name'
                }
            }
        }
        
        self.browser_context = None
        self.stats = {
            'cache_hits': 0,
            'browser_requests': 0,
            'errors': 0
        }

    async def init_browser(self):
        """Inicializa navegador persistente con anti-detección"""
        if self.browser_context:
            return
            
        print("🌐 Iniciando navegador real (Modo Humano)...")
        pw = await async_playwright().start()
        
        # Usamos launch_persistent_context para mantener cookies y evitar Cloudflare
        # Headless=False temporalmente para permitir ver qué pasa si hay bloqueos, o True para producción
        self.browser_context = await pw.chromium.launch_persistent_context(
            user_data_dir=self.user_data_dir,
            headless=True,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--disable-cache',
                '--disk-cache-size=0',
                '--window-position=0,0',
                '--ignore-certifcate-errors'
            ]
        )
        
        # Script para inyectar y ocultar automatización de forma agresiva
        stealth_script = """
            // 1. Ocultar WebDriver
            Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
            
            // 2. Mocking de Hardware y Plugins
            Object.defineProperty(navigator, 'languages', {get: () => ['es-ES', 'es', 'en-US', 'en']});
            Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
            Object.defineProperty(navigator, 'deviceMemory', {get: () => 8});
            Object.defineProperty(navigator, 'hardwareConcurrency', {get: () => 8});

            // 3. Mocking de Canvas para evitar tracking
            const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function(parameter) {
                if (parameter === 37445) return 'Intel Inc.';
                if (parameter === 37446) return 'Intel(R) Iris(R) Xe Graphics';
                return originalGetParameter.apply(this, arguments);
            };
        """
        await self.browser_context.add_init_script(stealth_script)
        print("✅ Navegador inicializado con Huellas Humanas Avanzadas")

    async def close_browser(self):
        """Cierra el navegador de forma segura"""
        if self.browser_context:
            try:
                # Cerrar todas las páginas primero para evitar pipes abiertos
                pages = self.browser_context.pages
                for page in pages:
                    try:
                        await page.close()
                    except:
                        pass
                await self.browser_context.close()
                print("🔒 Navegador cerrado correctamente")
            except Exception as e:
                if "closed pipe" not in str(e).lower():
                    print(f"⚠️ Error cerrando navegador: {e}")
            finally:
                self.browser_context = None

    async def refresh_all_sports(self, sports: List[str], data_type: str = 'live'):
        """Refresca múltiples deportes en paralelo o secuencia"""
        print(f"\n" + "="*60)
        print(f"🔄 REFRESCANDO DATOS DE {len(sports)} DEPORTES ({data_type})")
        print("="*60 + "\n")
        
        for sport in sports:
            print(f"\n📊 Procesando {sport.upper()}...")
            success = False
            
            # Intentar con cada endpoint activo
            for name, config in self.endpoints.items():
                if not config['active']: continue
                
                print(f"   👉 Probando {name}...")
                data = await self._fetch_with_browser(name, sport, data_type)
                
                if data and data['data'] and len(data['data']) > 0:
                    # Guardar en Redis
                    cache_key = f"sports_cache:{hashlib.md5(f'{name}_{sport}_{data_type}'.encode()).hexdigest()}"
                    self.redis_client.set(cache_key, json.dumps(data), ex=3600 if data_type == 'scheduled' else 600)
                    print(f"✅ {sport} - {name}: {len(data['data'])} partidos")
                    success = True
                    break 
                else:
                    print(f"   ⚠️ Sin datos en {name}, intentando siguiente...")
            
            if not success:
                print(f"❌ FALLO: No se encontraron partidos para {sport}")

    async def _fetch_with_browser(self, endpoint: str, sport: str, data_type: str) -> Optional[Dict]:
        """Obtiene datos usando navegador real (como humano)"""
        
        if not hasattr(self, 'browser_context') or not self.browser_context:
            await self.init_browser()
        
        config = self.endpoints[endpoint]
        
        try:
            page = await self.browser_context.new_page()
            
            # Configurar como usuario real
            await page.set_extra_http_headers({
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            })
            
            # Construir URL según el mapeo de deportes
            path = config['sport_urls'].get(sport, f"/{sport}")
            url = f"{config['url']}{path}"
            
            # Ajuste de ruta para AiScore (Lógica de livescore vs scheduled)
            if endpoint == 'aiscore':
                if data_type == 'live':
                    if path == '': # Futbol
                        url += "/live"
                    else: # Otros
                        url += "/livescore"
                elif data_type == 'scheduled':
                    # Para scheduled, AiScore usa la URL base del deporte o día específico
                    if path == '': url += "/scheduled-matches"
                    else: url += "/scheduled-matches"
            
            print(f"🌐 Navegador real → {endpoint}: {url}")
            
            # Navegar con tiempo de espera generoso
            await page.goto(url, wait_until='networkidle', timeout=60000)
            await page.wait_for_timeout(8000)  # Increased wait for dynamic content
            
            # Si es Sofascore y queremos Live, clic en el botón Live
            if endpoint == 'sofascore' and data_type == 'live':
                try:
                    await page.click('text=LIVE', timeout=5000)
                    await page.wait_for_timeout(3000)
                except:
                    pass
            
            await self._handle_overlays(page)
            
            # DEBUG: Screenshot para ver qué está capturando
            debug_path = os.path.join(self.debug_dir, f'{endpoint}_{sport}_{data_type}.png')
            await page.screenshot(path=debug_path)
            print(f"📸 Screenshot guardado: {debug_path}")
            
            data = await self._extract_data(page, config['selectors'], data_type, f"{endpoint}_{sport}")
            
            await page.close()
            self.stats['browser_requests'] += 1
            
            return {
                'source': endpoint,
                'sport': sport,
                'type': data_type,
                'data': data,
                'timestamp': datetime.now().isoformat(),
                'method': 'browser'
            }
            
        except Exception as e:
            self.stats['errors'] += 1
            print(f"❌ Error en navegador ({endpoint}/{sport}): {e}")
            return None

    async def _extract_data(self, page: Page, selectors: Dict, data_type: str, debug_name: str) -> List:
        """Extrae partidos de la página actual de forma robusta"""
        try:
            # Scroll para activar carga perezosa
            await page.evaluate("window.scrollTo(0, 1000)")
            await page.wait_for_timeout(2000)
            
            # Intentar esperar al selector principal
            try:
                await page.wait_for_selector(selectors['matches'], timeout=5000)
            except:
                pass

            # JS inyectado para extracción masiva (incluye tiempo e IDs)
            matches = await page.evaluate(r"""
                (args) => {
                    const { selectors, data_type } = args;
                    const items = document.querySelectorAll(selectors.matches);
                    return Array.from(items).map(item => {
                        // Capturar hora/estado primero para poder filtrarlo de los nombres
                        const timeElement = item.querySelector('.time, .status, .match-time, [class*="Time"], [class*="status"], [class*="EventCellStatus"]');
                        const timeText = timeElement?.innerText?.trim() || '';

                        const scoreElements = item.querySelectorAll(selectors.score);
                        const teamElements = item.querySelectorAll(selectors.team);
                        
                        // Extraer nombres reales filtrando basura (ej: horas, scores pegados)
                        let names = Array.from(teamElements)
                            .map(el => el.innerText?.trim())
                            .filter(text => {
                                if (!text || text.length < 2) return false;
                                if (text.includes(':')) return false; // Elimina horas como 15:00
                                if (/^\d+$/.test(text)) return false; // Elimina puntuaciones puras
                                if (text.toLowerCase() === 'live') return false;
                                if (text.toLowerCase() === 'vs') return false;
                                return true;
                            });

                        let home = names[0] || 'Unknown';
                        let away = names[names.length - 1] || 'Unknown';
                        
                        // Si falló por selectores genéricos, intentar por data-testid (SofaScore)
                        if (home === 'Unknown' || home.length < 3) {
                            home = item.querySelector('[data-testid*="participant_home"], [data-testid*="team_name_home"]')?.innerText?.trim() || home;
                        }
                        if (away === 'Unknown' || away === home) {
                            away = item.querySelector('[data-testid*="participant_away"], [data-testid*="team_name_away"]')?.innerText?.trim() || away;
                        }

                        // Limpieza de Puntuación
                        let homeScore = scoreElements[0]?.innerText?.trim() || '0';
                        let awayScore = scoreElements[1]?.innerText?.trim() || '0';
                        
                        if (homeScore.includes('\n')) {
                            const parts = homeScore.split('\n');
                            homeScore = parts[0];
                            awayScore = parts[1] || awayScore;
                        }

                        // Extraer ID del partido
                        let matchId = '';
                        const link = item.closest('a') || item.querySelector('a');
                        if (link && link.href) {
                            const m = link.href.match(/\/match\/.*[\/-]([0-9a-zA-Z]+)$/) || link.href.match(/\/([0-9a-zA-Z]+)$/);
                            if (m) matchId = m[1];
                        }

                        // IDs de equipos
                        const logos = item.querySelectorAll('img[src*="team"], img[src*="/t/"]');
                        let homeId = '';
                        let awayId = '';
                        if (logos[0]?.src) {
                            const m = logos[0].src.match(/team[s]?\/([0-9]+)/) || logos[0].src.match(/\/t\/([0-9]+)/);
                            if (m) homeId = m[1];
                        }
                        if (logos[1]?.src) {
                            const m = logos[1].src.match(/team[s]?\/([0-9]+)/) || logos[1].src.match(/\/t\/([0-9]+)/);
                            if (m) awayId = m[1];
                        }

                        // Liga/Torneo
                        let leagueName = 'Unknown League';
                        let leagueId = '';
                        const leagueElement = item.closest('[class*="EventCellGroup"]') || 
                                           item.previousElementSibling?.closest('[class*="CategoryHeader"]') ||
                                           document.querySelector('[class*="TournamentName"]');
                        
                        if (leagueElement) {
                            leagueName = leagueElement.innerText?.split('\n')[0]?.trim() || leagueName;
                            const leagueImage = leagueElement.querySelector('img[src*="tournament"], img[src*="unique-tournament"]');
                            if (leagueImage && leagueImage.src) {
                                const lm = leagueImage.src.match(/tournament\/([0-9]+)/) || leagueImage.src.match(/unique-tournament\/([0-9]+)/);
                                if (lm) leagueId = lm[1];
                            }
                        }

                        return {
                            id: matchId,
                            home_id: homeId,
                            away_id: awayId,
                            home_team: home,
                            away_team: away,
                            home_score: homeScore,
                            away_score: awayScore,
                            status: data_type,
                            start_time_raw: timeText,
                            league_name: leagueName,
                            league_id: leagueId
                        };
                    }).filter(m => m.home_team !== 'Unknown' && m.home_team.length > 2);
                }
            """, {"selectors": selectors, "data_type": data_type})
            return matches
        except Exception as e:
             print(f"⚠️ Error en extracción JS: {e}")
             return []

    async def _handle_overlays(self, page: Page):
        """Intenta cerrar banners de cookies y overlays"""
        overlays = [
            '#onetrust-accept-btn-handler',
            'button:has-text("Aceptar")',
            'button:has-text("Accept")',
            '.sn-b-accept',
            '.accept-cookies-button'
        ]
        for selector in overlays:
            try:
                if await page.is_visible(selector, timeout=1000):
                    await page.click(selector)
            except:
                pass

    def get_stats(self):
        """Retorna estadísticas clave"""
        total = self.stats['cache_hits'] + self.stats['browser_requests']
        hit_rate = (self.stats['cache_hits'] / total * 100) if total > 0 else 0
        return {
            **self.stats,
            'cache_hit_rate': f"{hit_rate:.1f}%"
        }

if __name__ == "__main__":
    async def test():
        system = CacheBrowserSystem()
        await system.refresh_all_sports(['football', 'basketball'])
        await system.close_browser()
    asyncio.run(test())
