import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import redis

class PickGeniusSync:
    """
    Servicio de sincronización total.
    Toma datos de Redis → Sincroniza con Firebase Firestore.
    Maneja la integración con Betplay.
    """
    
    def __init__(self, service_account_path: str, redis_host='localhost', redis_port=6379):
        # 1. Inicializar Firebase
        try:
            if not firebase_admin._apps:
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
            self.db = firestore.client()
            print("✅ Firebase initialized successfully")
        except Exception as e:
            print(f"❌ Firebase Init Error: {e}")
            self.db = None
            
        # 2. Inicializar Redis
        self.redis_client = redis.Redis(
            host=redis_host,
            port=redis_port,
            decode_responses=True
        )
        
    async def sync_matches_to_firebase(self, sport: str, data_type: str = 'live'):
        """Toma los partidos de Redis y los sube a Firestore 'events'"""
        if not self.db: return
        
        # Buscar llaves en Redis
        pattern = f"sports_cache:*"
        keys = self.redis_client.keys(pattern)
        
        synced_count = 0
        for key in keys:
            try:
                raw_data = self.redis_client.get(key)
                if not raw_data: continue
                
                cache_obj = json.loads(raw_data)
                # Verificar si es el deporte y tipo (live/scheduled) que buscamos
                if cache_obj.get('sport') != sport or cache_obj.get('type') != data_type:
                    continue
                
                matches = cache_obj.get('data', [])
                if not matches: continue

                # Sincronizar en lotes (Batch)
                batch = self.db.batch()
                processed_in_batch = 0

                for match in matches:
                    # NORMALIZACIÓN DE ID: 
                    # Preferimos ID numérico de SofaScore si existe, si no, generamos uno estable.
                    match_id = str(match.get('id', '')).strip()
                    if not match_id or match_id == '0':
                        # Generar ID basado en nombres para consistencia
                        clean_home = "".join(filter(str.isalnum, match['home_team'].lower()))
                        clean_away = "".join(filter(str.isalnum, match['away_team'].lower()))
                        match_id = f"{sport}_{clean_home}_{clean_away}"
                    
                    doc_ref = self.db.collection('events').document(match_id)
                    
                    # Manejo de Horarios
                    start_time = firestore.SERVER_TIMESTAMP
                    if data_type == 'scheduled':
                        # Si es programado y no hay hora real, poner 4 horas al futuro 
                        # para que no desaparezca del filtro de la App
                        start_time = datetime.now() + timedelta(hours=4)
                    
                    # Estructura compatible con el Frontend (SportsDataEvent)
                    sync_data = {
                        "externalId": match_id,
                        "sport": sport,
                        "homeTeam": {
                            "id": match.get('home_id', 'unknown'),
                            "name": match['home_team'],
                            "logo": f"/api/proxy/team-logo/{match.get('home_id', 'unknown')}"
                        },
                        "awayTeam": {
                            "id": match.get('away_id', 'unknown'),
                            "name": match['away_team'],
                            "logo": f"/api/proxy/team-logo/{match.get('away_id', 'unknown')}"
                        },
                        "status": {
                            "type": "inprogress" if data_type == 'live' else "notstarted",
                            "description": match.get('start_time_raw', 'LIVE' if data_type == 'live' else 'Hoy')
                        },
                        "homeScore": {
                            "current": int(match.get('home_score', 0)) if str(match.get('home_score')).isdigit() else 0,
                            "display": int(match.get('home_score', 0)) if str(match.get('home_score')).isdigit() else 0
                        },
                        "awayScore": {
                            "current": int(match.get('away_score', 0)) if str(match.get('away_score')).isdigit() else 0,
                            "display": int(match.get('away_score', 0)) if str(match.get('away_score')).isdigit() else 0
                        },
                        "startTime": start_time,
                        "syncedAt": firestore.SERVER_TIMESTAMP,
                        "source": cache_obj.get('source', 'scraper')
                    }
                    
                    batch.set(doc_ref, sync_data, merge=True)
                    processed_in_batch += 1
                    synced_count += 1
                    
                    # Firestore tiene un límite de 500 operaciones por batch
                    if processed_in_batch >= 400:
                        batch.commit()
                        batch = self.db.batch()
                        processed_in_batch = 0
                
                if processed_in_batch > 0:
                    batch.commit()
                
            except Exception as e:
                print(f"⚠️ Sync match error for key {key}: {e}")
                
        print(f"💾 Synced {synced_count} matches for {sport} ({data_type}) to Firebase")

if __name__ == "__main__":
    async def test():
        base_path = os.path.dirname(os.path.abspath(__file__))
        service_account = os.path.join(base_path, '..', 'firebase-service-account.json')
        sync = PickGeniusSync(service_account)
        await sync.sync_matches_to_firebase('football', 'live')
        
    import asyncio
    asyncio.run(test())
