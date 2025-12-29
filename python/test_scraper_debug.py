import asyncio
from cache_browser_system import CacheBrowserSystem

async def test_all_scrapers():
    print("🚀 Iniciando prueba masiva de scrapers...")
    system = CacheBrowserSystem()
    
    tests = [
        ('aiscore', 'football'),
        ('aiscore', 'basketball'),
        ('sofascore', 'football'),
    ]
    
    for endpoint, sport in tests:
        print(f"\n🔍 Probando {sport} en {endpoint}...")
        data = await system.get_data(sport, 'live', endpoint, force_refresh=True)
        
        if data and data.get('data'):
            items = data['data']
            print(f"✅ ÉXITO: {len(items)} partidos encontrados")
            for i, item in enumerate(items[:3]):
                print(f"   [{i+1}] {item.get('home_team')} {item.get('home_score') or '0'}-{item.get('away_score') or '0'} {item.get('away_team')}")
        else:
            print(f"❌ FALLO: No se encontraron datos en {endpoint} para {sport}")
    
    await system.close_browser()

if __name__ == "__main__":
    asyncio.run(test_all_scrapers())
