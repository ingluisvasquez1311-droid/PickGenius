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
        print(f"🕵️‍♂️ Iniciando extracción Deep Analytics para {sport} ID: {match_id}")
        await self.browser_system.init_browser()
        
        page = await self.browser_system.browser_context.new_page()
        try:
            # 1. Ir a la home primero para "calentar" cookies y headers de antifraude
            print(f"🌐 Navegando a sofascore.com (Set-Cookie)...")
            await page.goto("https://www.sofascore.com", wait_until='networkidle')
            await page.wait_for_timeout(2000)

            # 2. Definir Endpoints de Deep Analytics
            endpoints = {
                'statistics': f"https://api.sofascore.com/api/v1/event/{match_id}/statistics",
                'h2h': f"https://api.sofascore.com/api/v1/event/{match_id}/h2h",
                'incidents': f"https://api.sofascore.com/api/v1/event/{match_id}/incidents"
            }
            
            deep_data = {
                'statistics': {},
                'h2h': {},
                'incidents': []
            }

            for key, url in endpoints.items():
                print(f"🔗 Consultando {key}: {url}")
                try:
                    await page.goto(url)
                    content = await page.evaluate("() => document.body.innerText")
                    data = json.loads(content)
                    
                    if key == 'statistics':
                        if 'statistics' in data and len(data['statistics']) > 0:
                            for group in data['statistics'][0].get('groups', []):
                                for item in group.get('statisticsItems', []):
                                    deep_data['statistics'][item.get('name')] = {
                                        'home': item.get('home'),
                                        'away': item.get('away')
                                    }
                    elif key == 'h2h':
                        deep_data['h2h'] = {
                            'matches': data.get('matches', [])[:5], # Últimos 5 encuentros
                            'summary': data.get('teamStats', {}) # Victorias/Empates/Derrotas
                        }
                    elif key == 'incidents':
                        # Filtrar incidentes que parezcan lesiones o tarjetas importantes
                        deep_data['incidents'] = data.get('incidents', [])
                except Exception as e:
                    print(f"⚠️ Error en {key}: {e}")

            # Guardar en Redis
            if deep_data['statistics'] or deep_data['h2h']:
                key = f"match_detail:{sport}:{match_id}"
                save_payload = {
                    'id': match_id,
                    'sport': sport,
                    **deep_data,
                    'updated_at': datetime.now().isoformat(),
                    'source': 'deep_analytics_api'
                }
                self.redis.set(key, json.dumps(save_payload), ex=600)
                print(f"💾 Deep Analytics guardado en Redis para ID: {match_id}")
            
            return deep_data

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
