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
            headless=False, # MODO VISIBLE: El usuario ve lo que pasa (Anti-Robot Feeling)
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
                    # Guardar en Redis (Bulk)
                    cache_key = f"sports_cache:{hashlib.md5(f'{name}_{sport}_{data_type}'.encode()).hexdigest()}"
                    self.redis_client.set(cache_key, json.dumps(data), ex=3600 if data_type == 'scheduled' else 600)
                    
                    # NUEVO: Guardar partidos individuales para acceso rápido desde API (O(1))
                    # Key format: live_match:{sport}:{id}
                    stored_count = 0
                    for match in data['data']:
                        if match.get('id'):
                            # Normalizar ID para asegurar match con frontend
                            match_id = str(match['id'])
                            individual_key = f"live_match:{sport}:{match_id}"
                            
                            # Enriquecer con timestamp de captura
                            match['last_updated'] = datetime.now().isoformat()
                            
                            # Guardar con TTL corto para asegurar frescura (5 min live, 60 min scheduled)
                            ttl = 300 if data_type == 'live' else 3600
                            self.redis_client.set(individual_key, json.dumps(match), ex=ttl)
                            stored_count += 1
                            
                    print(f"✅ {sport} - {name}: {len(data['data'])} partidos (y {stored_count} keys individuales)")
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
            
            # Navegar (DOM Content Loaded es más rápido y seguro para sitios con streams constantes)
            try:
                await page.goto(url, wait_until='domcontentloaded', timeout=60000)
                # Esperar un poco a que la red se calme, pero no bloquear si no lo hace
                try:
                   await page.wait_for_load_state('networkidle', timeout=5000)
                except:
                   pass
            except Exception as e:
                print(f"⚠️ Alerta de carga lenta: {e}, intentando continuar igual...")

            await page.wait_for_timeout(5000)  # Espera inicial fija
            
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
            # NOTA: Usamos una función JS normal stringificada (raw string) para evitar escapes de Python
            js_script = r"""
                ({ selectors, data_type }) => {
                    // Helper para extracción segura
                    const safeGetText = (el) => {
                        if (!el) return '';
                        return (el.textContent || el.innerText || '').trim();
                    };

                    // Intento 1: Buscar por Cards de Eventos (Selector Genérico Robusto)
                    let items = Array.from(document.querySelectorAll('a[href*="/match/"], div[data-testid="event_cell"], [class*="EventCell"]'));
                    
                    if (items.length === 0) {
                        items = Array.from(document.querySelectorAll('.ReactVirtualized__Grid__innerScrollContainer > div, [class*="sport-event-list"] > div'));
                    }

                    return items.map(item => {
                        // 1. Detección Inteligente de Tiempo/Estado
                        const statusEl = item.querySelector('[class*="Status"], [class*="status"], [class*="Time"], span[color="live"], span[class*="red"]');
                        let timeText = safeGetText(statusEl);
                        
                        if (!timeText) {
                            const allText = safeGetText(item);
                            const timeMatch = allText.match(/\d{2}:\d{2}|LIVE|FT|AET|\d{1,3}'/);
                            if (timeMatch) timeText = timeMatch[0];
                        }

                        // 2. Extracción de Equipos
                        let home = '', away = '';
                        // Intento A: Data-testids
                        const homeEl = item.querySelector('[data-testid="home_team_name"], [class*="HomeTeam"], [class*="home"]');
                        const awayEl = item.querySelector('[data-testid="away_team_name"], [class*="AwayTeam"], [class*="away"]');
                        
                        home = safeGetText(homeEl);
                        away = safeGetText(awayEl);

                        // Intento B: Texto bruto filtrado
                        if (!home || !away) {
                            const texts = Array.from(item.querySelectorAll('span, div'))
                                .map(e => safeGetText(e))
                                .filter(t => t.length > 2 && !t.includes(':') && !/^\d+$/.test(t) && t !== 'LIVE' && t !== '-');
                            
                            if (texts.length >= 2) {
                                home = texts[0];
                                away = texts[1];
                            }
                        }

                        // 2.5 Extracción de IDs para LOGOS (Vital)
                        let homeId = '0';
                        let awayId = '0';
                        const images = item.querySelectorAll('img');
                        images.forEach(img => {
                             const src = img.src || '';
                             // Buscar patrón de ID de Sofascore en URLs de imagenes
                             // Ej: api.sofascore.app/api/v1/team/1234/image
                             const match = src.match(/team\/(\d+)/) || src.match(/team\/(\d+)/);
                             if (match) {
                                 if (homeId === '0') homeId = match[1];
                                 else if (awayId === '0') awayId = match[1];
                             }
                        });

                        // 3. Extracción de Scores
                        let homeScore = 0, awayScore = 0;
                        const scoreEls = item.querySelectorAll('[class*="Score"], [class*="score"], b');
                        // Filtrar solo números puros
                        const scores = Array.from(scoreEls)
                             .map(e => safeGetText(e))
                             .filter(t => /^\d+$/.test(t));
                        
                        if (scores.length >= 2) {
                            homeScore = parseInt(scores[0]);
                            awayScore = parseInt(scores[1]);
                        } else {
                            // Regex sobre todo el texto para "2 - 1"
                            const fullText = safeGetText(item);
                            const scoreMatch = fullText.match(/(\d+)\s*-\s*(\d+)/);
                            if (scoreMatch) {
                                homeScore = parseInt(scoreMatch[1]);
                                awayScore = parseInt(scoreMatch[2]);
                            }
                        }

                        // Generar ID
                        let id = '';
                        const link = item.closest('a') || item.querySelector('a[href*="/match/"]');
                        if (link && link.href) {
                            const parts = link.href.split('/');
                            id = parts[parts.length - 1]; 
                        }
                        if (!id) id = `${home}_${away}`.toLowerCase().replace(/[^a-z0-9]/g, '');

                        // Nombre de la liga (subiendo en el DOM)
                        let league = 'League';
                        try {
                            let parent = item.parentElement;
                            let depth = 0;
                            while (parent && depth < 5) {
                                const leagueEl = parent.querySelector('[class*="Header"], [class*="League"], h3');
                                if (leagueEl) {
                                    league = safeGetText(leagueEl).split('\n')[0];
                                    break;
                                }
                                parent = parent.parentElement;
                                depth++;
                            }
                        } catch(e) {}

                        if (!home || !away || home === away) return null;

                            id: id,
                            home_team: home,
                            away_team: away,
                            home_id: homeId,
                            away_id: awayId,
                            home_score: homeScore,
                            away_score: awayScore,
                            status: data_type === 'live' ? 'inprogress' : 'scheduled',
                            start_time_raw: timeText,
                            league_name: league
                        };

                    }).filter(i => i !== null);
                }
            """
            
            matches = await page.evaluate(js_script, { 'selectors': selectors, 'data_type': data_type })
            
            # --- NUEVA FASE: ENRIQUECIMIENTO DE ESTADÍSTICAS (FETCH INJECTION) ---
            # Si estamos en LIVE, aprovechamos la sesión para pedir las stats internas de cada partido
            # sin navegar. Esto es ULTRA RÁPIDO.
            if data_type == 'live' and matches:
                print(f"   ⚡ Inyectando captura de estadísticas para {len(matches)} partidos...")
                
                stats_script = r"""
                async (matches) => {
                    const results = {};
                    const fetchWithTimeout = (url, ms) => {
                        const controller = new AbortController();
                        const promise = fetch(url, { signal: controller.signal });
                        const timeout = setTimeout(() => controller.abort(), ms);
                        return promise.finally(() => clearTimeout(timeout));
                    };

                    // Ejecutar en lotes de 5 para no saturar
                    const batchSize = 5;
                    for (let i = 0; i < matches.length; i += batchSize) {
                        const batch = matches.slice(i, i + batchSize);
                        await Promise.all(batch.map(async (m) => {
                            if (!m.id) return;
                            try {
                                // Endpoint interno de Sofascore
                                const url = `https://api.sofascore.com/api/v1/event/${m.id}/statistics`;
                                const res = await fetchWithTimeout(url, 3000);
                                if (res.ok) {
                                    const json = await res.json();
                                    // Simplificar estructura
                                    const stats = {};
                                    if (json.statistics && json.statistics.length > 0) {
                                        json.statistics[0].groups.forEach(g => {
                                            g.statisticsItems.forEach(item => {
                                                stats[item.name] = { home: item.home, away: item.away };
                                            });
                                        });
                                    }
                                    results[m.id] = stats;
                                }
                            } catch (e) {
                                // Silent fail
                            }
                        }));
                        // Pequeña pausa entre lotes
                        await new Promise(r => setTimeout(r, 500));
                    }
                    return results;
                }
                """
                
                try:
                    # Ejecutar el fetch masivo desde el navegador
                    stats_map = await page.evaluate(stats_script, matches)
                    
                    # Fusionar resultados con los partidos
                    enrich_count = 0
                    for match in matches:
                        mid = match.get('id')
                        if mid and mid in stats_map and stats_map[mid]:
                            match['statistics'] = stats_map[mid]
                            enrich_count += 1
                            
                    print(f"   📈 Stats capturadas para {enrich_count}/{len(matches)} partidos")
                    
                except Exception as e:
                    print(f"   ⚠️ Error enriqueciendo stats: {e}")

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
