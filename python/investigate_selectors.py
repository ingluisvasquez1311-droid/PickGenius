import asyncio
from cache_browser_system import CacheBrowserSystem

async def dump_selectors():
    print("🔍 Iniciando investigación de selectores...")
    system = CacheBrowserSystem()
    await system.init_browser()
    
    endpoints = [
        ('aiscore', 'https://www.aiscore.com/soccer/livescore'),
        ('sofascore', 'https://www.sofascore.com/soccer/livescore')
    ]
    
    for name, url in endpoints:
        print(f"\n🌐 Accediendo a {name}: {url}")
        page = await system.browser_context.new_page()
        try:
            await page.goto(url, wait_until='networkidle', timeout=60000)
            await page.wait_for_timeout(5000)
            
            # Tomar captura
            path = f"python/debug_screenshots/{name}_investigation.png"
            await page.screenshot(path=path)
            print(f"📸 Captura guardada: {path}")
            
            # Analizar posibles selectores
            content = await page.evaluate("""() => {
                const body = document.body.innerText;
                const html = document.documentElement.innerHTML.substring(0, 1000);
                const matchRows = document.querySelectorAll('.match-item, [data-testid="event"], .event__match, .match-list-item').length;
                return { bodySnippet: body.substring(0, 200), htmlSnippet: html, matchCount: matchRows };
            }""")
            
            print(f"✅ Texto detectado: {content['bodySnippet']}...")
            print(f"✅ HTML inicial: {content['htmlSnippet']}...")
            print(f"✅ Partidos detectados con selectores actuales: {content['matchCount']}")
            
        except Exception as e:
            print(f"❌ Error en {name}: {e}")
        finally:
            await page.close()
            
    await system.close_browser()

if __name__ == "__main__":
    asyncio.run(dump_selectors())
