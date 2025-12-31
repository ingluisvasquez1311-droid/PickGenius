import asyncio
import json
import os
import requests
import redis
import time
from datetime import datetime, timedelta

# URLs obtenidas de capturas del usuario (Kambi direct API)
ENDPOINTS = {
    "live": "https://us1.offering-api.kambicdn.com/offering/v2018/betplay/event/live/open.json",
    # URL exacta pegada por el usuario (ajustada a 4 'all')
    "scheduled": "https://us1.offering-api.kambicdn.com/offering/v2018/betplay/listView/all/all/all/all/starting-within.json"
}

# Configuración Redis
REDIS_HOST = 'localhost'
REDIS_PORT = 6379

def fetch_kambi_data(mode="live", url_override=None, extra_params=None):
    url = url_override or ENDPOINTS.get(mode)
    print(f"🚀 Conectando a Kambi ({mode}: {url})...")
    
    params = {
        "lang": "es_CO",
        "market": "CO",
        "client_id": "200",
        "channel_id": "1",
        "ncid": str(int(datetime.now().timestamp() * 1000)),
        "useCombined": "true",
        "useCombinedLive": "true"
    }
    
    if extra_params:
        params.update(extra_params)

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://tienda.betplay.com.co/",
        "Origin": "https://tienda.betplay.com.co/",
        "Accept": "application/json, text/javascript, */*; q=0.01"
    }

    try:
        response = requests.get(url, params=params, headers=headers, timeout=15)
        
        if response.status_code == 429:
            print(f"⚠️ Rate limited (429) en {mode}. Esperando...")
            return None

        response.raise_for_status()
        return parse_kambi_response(response.json(), mode)
    except Exception as e:
        print(f"❌ Error en modo {mode}: {e}")
        return []

def parse_kambi_response(data, mode):
    events = []
    
    # Estructura v2018 / starting-within
    target_events = data.get('events', [])
    if not target_events and isinstance(data, list):
        target_events = data
    if not target_events:
        target_events = data.get('liveEvents', [])
    
    # Fallback para listView structure
    if not target_events and isinstance(data, dict) and 'group' in data:
         target_events = data.get('group', {}).get('events', [])

    for event_obj in target_events:
        # Kambi v2018 scheduled suele tener el evento directamente en event_obj o en event_obj['event']
        event = event_obj.get('event', {})
        if not event or not isinstance(event, dict):
            event = event_obj
        
        # Intentar sacar equipos (Kambi usa homeName/awayName o name y separar por ' - ')
        home = event.get('homeName')
        away = event.get('awayName')
        
        if not home and 'name' in event:
            parts = event['name'].split(' - ')
            if len(parts) == 2:
                home, away = parts[0], parts[1]

        odds = {}
        # Buscar cuotas en mainBetOffer o en offer (algunas versiones)
        offer = event_obj.get('mainBetOffer') or event_obj.get('offer')
        if not offer and 'betOffers' in event_obj:
            # Buscar la que sea 'Match' o tipo 1 (Gana/Empate/Gana)
            for bo in event_obj['betOffers']:
                if bo.get('main'):
                    offer = bo
                    break
        
        if offer and 'outcomes' in offer:
            for outcome in offer['outcomes']:
                label = outcome.get('label')
                price = (outcome.get('odds', 0) / 1000) or (outcome.get('oddsFractional', 0)) # v2 usa odds, v2018 a veces otro
                if label:
                    odds[label] = price

        if home and away: # Si hay equipos, lo guardamos aunque no tenga cuotas aún (para seguimiento)
            events.append({
                "id": str(event.get('id')),
                "sport": event.get('sport'),
                "league": event.get('group'),
                "homeTeam": home,
                "awayTeam": away,
                "odds": odds,
                "live": event.get('live', False) or mode == 'live',
                "last_updated": datetime.now().isoformat()
            })
    
    print(f"✅ Se capturaron {len(events)} eventos ({mode}).")
    return events

def save_and_sync(events):
    if not events: return
    
    # 1. Guardar en Archivo Estable para la API de Next.js
    data_dir = os.path.join(os.getcwd(), 'data', 'betplay')
    if not os.path.exists(data_dir): os.makedirs(data_dir)
    
    latest_path = os.path.join(data_dir, "latest_betplay_odds.json")
    output = { 
        "timestamp": datetime.now().isoformat(), 
        "count": len(events),
        "events": events 
    }
    
    with open(latest_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=4, ensure_ascii=False)
    
    # También guardar histórico con timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    history_path = os.path.join(data_dir, f"history_{timestamp}.json")
    with open(history_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=4, ensure_ascii=False)

    # 2. Sincronizar con Redis para acceso ultra-rápido del Oráculo
    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
        r.set("betplay_odds:latest", json.dumps(output), ex=3600) # Expira en 1 hora
        print(f"🧠 Datos sincronizados en Redis (betplay_odds:latest)")
    except Exception as e:
        print(f"⚠️ No se pudo conectar a Redis: {e}")
    
    print(f"✅ Proceso completado. Total: {len(events)} eventos disponibles.")

if __name__ == "__main__":
    print("🔥 PickGenius BetPlay Master Collector v2.2")
    
    # 1. LIVE
    live = fetch_kambi_data("live")
    
    print("⏳ Esperando 3 segundos para evitar rate-limit...")
    time.sleep(3)
    
    # 2. SCHEDULED (PRÓXIMOS)
    now = datetime.now()
    future = now + timedelta(hours=24)
    # Formato detectado: 20251230T154344-0400
    offset = "-0400" 
    from_ts = now.strftime("%Y%m%dT%H%M%S") + offset
    to_ts = future.strftime("%Y%m%dT%H%M%S") + offset
    
    scheduled_params = {
        "from": from_ts,
        "to": to_ts
    }
    
    scheduled = fetch_kambi_data("scheduled", extra_params=scheduled_params)
    
    # Mezclar y eliminar duplicados por ID
    final_list = (live or []) + (scheduled or [])
    all_events = {e['id']: e for e in final_list}.values()
    save_and_sync(list(all_events))
