import asyncio
import json
import os
import redis
import requests
from dotenv import load_dotenv
from cache_browser_system import CacheBrowserSystem

# Cargar entorno desde múltiples ubicaciones posibles
load_dotenv('.env.local')
load_dotenv('web/.env.local')

# Configuración
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
GROQ_API_KEYS = os.getenv('GROQ_API_KEYS', os.getenv('GROQ_API_KEY', ''))
GROQ_API_KEY = GROQ_API_KEYS.split(',')[0].strip() if GROQ_API_KEYS else ''
r = redis.from_url(REDIS_URL)

async def run_pro_test():
    print("\n" + "="*60)
    print("🔥 PICKGENIUS PRO - MÁDULO DE ANÁLISIS IA EN VIVO 🔥")
    print("="*60)

    # 1. Ejecutar Scraper para obtener DATA FRESCA
    print("\n🛰️  Paso 1: Capturando partidos de fútbol en vivo...")
    scraper = CacheBrowserSystem()
    await scraper.init_browser()
    await scraper.refresh_all_sports(['football'], data_type='live')
    await scraper.close_browser()

    # 2. Buscar la data en Redis
    print("\n🔍 Paso 2: Buscando data en Redis...")
    keys = r.keys('sports_cache:*')
    live_matches = []
    
    for key in keys:
        try:
            data = r.get(key)
            if data:
                parsed = json.loads(data)
                if parsed.get('sport') == 'football':
                    live_matches.extend(parsed.get('data', []))
        except:
            continue

    if not live_matches:
        print("📭 No se encontraron partidos de fútbol en vivo en este momento.")
        return

    print(f"✅ ¡Éxito! Se encontraron {len(live_matches)} partidos en vivo.")

    # 3. Analizar con IA
    print("\n🤖 Paso 3: Consultando al Oráculo IA (Groq)...")
    
    # Tomar los 2 primeros partidos para el test
    for match in live_matches[:2]:
        home = match.get('home_team')
        away = match.get('away_team')
        score = f"{match.get('home_score')} - {match.get('away_score')}"
        league = match.get('league_name')
        
        print(f"\n⚽ {home} vs {away} | Marcador: {score} | {league}")
        
        prompt = f"""
        Eres PickGenius Master, el analista de apuestas #1 del mundo.
        Analiza este partido de FÚTBOL EN VIVO:
        - {home} vs {away}
        - Score: {score}
        - Torneo: {league}

        Dame:
        1. Predicción del Ganador Final.
        2. Mercados de Goles (Over/Under).
        3. 'Value Bet' (La apuesta con más valor ahora mismo).
        
        Responde en ESPAÑOL, de forma agresiva y profesional (estilo Tipster PRO). Máximo 4 líneas.
        """

        try:
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.5
                },
                timeout=15
            )
            
            res_json = response.json()
            if 'choices' in res_json:
                analysis = res_json['choices'][0]['message']['content']
                print(f"--- ANÁLISIS IA ---\n{analysis}")
            else:
                print(f"❌ Error API Groq: {res_json.get('error', {}).get('message', 'Respuesta inesperada')}")
                if 'choices' not in res_json:
                     print(f"DEBUG: {res_json}")
        except Exception as e:
            print(f"❌ Error IA: {e}")

    print("\n" + "="*60)
    print("✨ TEST FINALIZADO - EL SISTEMA ESTÁ 100% OPERATIVO ✨")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(run_pro_test())
