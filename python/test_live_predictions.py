import redis
import json
import os
import requests
from dotenv import load_dotenv

# Cargamos el .env desde la raíz del proyecto o desde la carpeta web
load_dotenv('web/.env.local')

# Configuración de Redis
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
r = redis.from_url(REDIS_URL)

# Configuración de Groq (para predicción IA)
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

def get_live_matches():
    """Busca partidos en vivo en las diferentes llaves de deportes en Redis."""
    sports = ['football', 'basketball', 'tennis', 'baseball', 'american-football', 'ice-hockey']
    live_events = []
    
    # El scraper guarda las llaves como 'sports_cache:<hash>'
    # Pero las API de Next.js las consultan usando el formato '{source}_{sport}_live'
    # Vamos a buscar todas las llaves posibles de caché
    keys = r.keys('sports_cache:*')
    
    for key in keys:
        try:
            data = r.get(key)
            if data:
                parsed = json.loads(data)
                # Si la data viene del scraper unificado, tiene un campo 'data' con los eventos
                if isinstance(parsed, dict) and 'data' in parsed:
                    for event in parsed['data']:
                        # Añadimos metadatos de la llave si es posible
                        live_events.append(event)
        except Exception as e:
            continue
            
    return live_events

def predict_match(match):
    """Envía la información del partido a Groq para generar una predicción pro."""
    home = match.get('home_team', 'N/A')
    away = match.get('away_team', 'N/A')
    home_score = match.get('home_score', '0')
    away_score = match.get('away_score', '0')
    league = match.get('league_name', 'Liga Desconocida')
    status = match.get('start_time_raw', 'LIVE')

    print(f"\n" + "="*50)
    print(f"🏟️  PARTIDO: {home} vs {away}")
    print(f"📊 MARCADOR: {home_score} - {away_score} ({status})")
    print(f"🏆 TORNEO: {league}")
    print("="*50)
    
    if not GROQ_API_KEY:
        print("❌ Error: GROQ_API_KEY no encontrada. Por favor revisa web/.env.local")
        return

    prompt = f"""
    Como experto en análisis de datos de PickGenius Pro, analiza este partido en tiempo real:
    - Encuentro: {home} vs {away}
    - Marcador actual: {home_score}-{away_score}
    - Competición: {league}
    - Estado: {status}

    Tu tarea es proporcionar un 'Insight de Valor' (Value Bet) basado en el marcador y la tendencia. 
    Responde en formato directo para un usuario de apuestas:
    1. Pronóstico recomendado (1X2 o Hándicap).
    2. Predicción de Goles/Puntos totales.
    3. Análisis de 2 frases sobre por qué esta es una apuesta de valor.

    Responde en ESPAÑOL y sé muy breve pero contundente.
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
                "temperature": 0.5,
                "max_tokens": 500
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            print("\n🤖 ANÁLISIS IA (PickGenius Master):")
            print(content)
        else:
            print(f"❌ Error API Groq: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Excepción en la llamada IA: {e}")

if __name__ == "__main__":
    print("\n🚀 PICKGENIUS PRO - MÓDULO DE PRUEBAS IA EN VIVO")
    print("-----------------------------------------------")
    
    events = get_live_matches()
    
    if not events:
        print("📭 No hay datos en vivo en Redis en este momento.")
        print("Pista: Asegúrate de que el scraper de Python esté corriendo.")
    else:
        # Filtrar solo fútbol si el usuario lo pidió
        football_events = [e for e in events if e.get('home_team')] # Ajustar filtro si hay algo mejor
        
        print(f"✅ Se encontraron {len(events)} eventos totales en el caché.")
        
        # Analizar los 3 primeros para no saturar
        max_tests = 3
        count = 0
        for ev in events:
            if count >= max_tests: break
            predict_match(ev)
            count += 1
            
    print("\n✨ Prueba de comando finalizada.")
