import asyncio
import sys
import os
import json
import redis
from datetime import datetime

# Añadir ruta para importar módulos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from cache_browser_system import CacheBrowserSystem

class MatchDetailScraper:
    def __init__(self):
        self.redis = redis.Redis(host='localhost', port=6379, db=0)
        self.browser_system = CacheBrowserSystem()

    async def scrape_match_details(self, sport, match_id):
        print(f"🕵️‍♂️ Iniciando extracción API Directa para {sport} ID: {match_id}")
        await self.browser_system.init_browser()
        
        page = await self.browser_system.browser_context.new_page()
        try:
            # 1. Ir a la home primero para "calentar" cookies y headers de antifraude
            print(f"🌐 Navegando a sofascore.com (Set-Cookie)...")
            await page.goto("https://www.sofascore.com", wait_until='networkidle')
            await page.wait_for_timeout(2000)

            # 2. Navegar DIRECTO a la API de estadísticas
            # Esta URL devuelve JSON puro. Al hacerlo desde el navegador, pasamos Cloudflare.
            api_url = f"https://api.sofascore.com/api/v1/event/{match_id}/statistics"
            print(f"🔗 Consultando API: {api_url}")
            
            # Navegar a la API
            response = await page.goto(api_url)
            
            # Extraer el JSON del body (el navegador lo renderiza como texto)
            content = await page.evaluate("() => document.body.innerText")
            
            try:
                data = json.loads(content)
                print("✅ JSON recibido correctamente.")
                
                statistics = {}
                # Procesar formato de API de Sofascore
                if 'statistics' in data and len(data['statistics']) > 0:
                     # Generalmente es groups -> statisticsItems
                     for group in data['statistics'][0].get('groups', []):
                         for item in group.get('statisticsItems', []):
                             name = item.get('name')
                             home = item.get('home')
                             away = item.get('away')
                             if name:
                                 statistics[name] = {'home': home, 'away': away}
                else:
                    print("⚠️ JSON válido pero sin 'statistics'. Posiblemente no ha empezado o no hay cobertura.")
                    print("Contenido raw:", content[:200])

                if statistics:
                    print(f"📊 Estadísticas procesadas: {len(statistics)} métricas.")
                    
                    # Guardar en Redis
                    key = f"match_detail:{sport}:{match_id}"
                    # Guardamos también un flag de 'source: direct_api'
                    self.redis.set(key, json.dumps({
                        'id': match_id,
                        'sport': sport,
                        'statistics': statistics, # Formato simple { "Ball Possession": {home: 50, away: 50} }
                        'raw_api_data': data, # Guardamos data cruda por si acaso
                        'updated_at': datetime.now().isoformat(),
                        'source': 'direct_api'
                    }), ex=600) # 10 minutos
                    
                    print("💾 Guardado en Redis exitosamente.")
                
                return statistics

            except json.JSONDecodeError:
                print("❌ No se recibió un JSON válido. Posible bloqueo o URL incorrecta.")
                print("Contenido recibido:", content[:100])
                return None

        except Exception as e:
            print(f"❌ Error scraping details: {e}")
        finally:
            await page.close()
            await self.browser_system.close_browser()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python pro_test_details.py <sport> <match_id>")
    else:
        scraper = MatchDetailScraper()
        asyncio.run(scraper.scrape_match_details(sys.argv[1], sys.argv[2]))
