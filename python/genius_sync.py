"""
PickGenius - Genius-Sync Engine
Motor principal de recolección de datos, IA y sincronización
"""

import asyncio
import json
import logging
import os
import time
from datetime import datetime

import redis
import firebase_admin
from firebase_admin import credentials, firestore
from groq import Groq
from dotenv import load_dotenv

from scraper import SportsScraper
from download_betplay_odds import BetPlayOddsDownloader
from ai_oracle import AIOracle

load_dotenv()

# ─── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    handlers=[
        logging.FileHandler("genius_sync.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("GeniusSyncEngine")

# ─── Inicialización de servicios ─────────────────────────────────────────────
def init_firebase():
    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "../firebase-service-account.json")
    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    return firestore.client()

def init_redis():
    return redis.Redis(
        host=os.getenv("REDIS_HOST", "localhost"),
        port=int(os.getenv("REDIS_PORT", 6379)),
        db=0,
        decode_responses=True
    )

# ─── Motor principal ─────────────────────────────────────────────────────────
class GeniusSyncEngine:
    def __init__(self):
        logger.info("🚀 Iniciando Genius-Sync Engine...")
        self.db = init_firebase()
        self.redis = init_redis()
        self.scraper = SportsScraper()
        self.odds_downloader = BetPlayOddsDownloader()
        self.oracle = AIOracle(groq_api_key=os.getenv("GROQ_API_KEY"))
        self.sync_interval = int(os.getenv("SYNC_INTERVAL_SECONDS", 300))  # 5 min
        logger.info("✅ Engine inicializado correctamente")

    def cache_data(self, key: str, data: dict, ttl: int = 600):
        """Almacena datos en Redis con TTL"""
        try:
            self.redis.setex(key, ttl, json.dumps(data, ensure_ascii=False, default=str))
            logger.debug(f"📦 Cacheado: {key}")
        except Exception as e:
            logger.error(f"❌ Error en Redis cache [{key}]: {e}")

    def get_cached(self, key: str):
        """Recupera datos de Redis"""
        try:
            data = self.redis.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            logger.error(f"❌ Error leyendo Redis [{key}]: {e}")
            return None

    def sync_to_firebase(self, collection: str, doc_id: str, data: dict):
        """Sincroniza datos a Firestore"""
        try:
            data["updated_at"] = datetime.utcnow().isoformat()
            self.db.collection(collection).document(doc_id).set(data, merge=True)
            logger.info(f"🔥 Firebase sync: {collection}/{doc_id}")
        except Exception as e:
            logger.error(f"❌ Error en Firebase [{collection}/{doc_id}]: {e}")

    async def run_cycle(self):
        """Ejecuta un ciclo completo de recolección, predicción y sincronización"""
        logger.info("=" * 60)
        logger.info(f"🔄 Iniciando ciclo: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        # 1. Scraping de partidos
        logger.info("📡 Iniciando scraping de partidos...")
        matches = await self.scraper.fetch_all_sports()
        self.cache_data("matches:live", matches.get("live", []), ttl=120)
        self.cache_data("matches:upcoming", matches.get("upcoming", []), ttl=300)
        self.sync_to_firebase("matches", "live", {"matches": matches.get("live", [])})
        self.sync_to_firebase("matches", "upcoming", {"matches": matches.get("upcoming", [])})
        logger.info(f"✅ Scraping completado: {len(matches.get('live', []))} en vivo, {len(matches.get('upcoming', []))} próximos")

        # 2. Descarga de cuotas BetPlay
        logger.info("💰 Descargando cuotas de BetPlay...")
        odds = await self.odds_downloader.fetch_odds()
        self.cache_data("odds:betplay", odds, ttl=300)
        self.sync_to_firebase("odds", "betplay", {"odds": odds})
        logger.info(f"✅ Cuotas descargadas: {len(odds)} eventos")

        # 3. Generación de predicciones IA
        logger.info("🧠 Generando predicciones con AI Oracle...")
        all_matches = matches.get("upcoming", [])[:20]  # Top 20 para predicción
        predictions = []
        for match in all_matches:
            match_odds = next((o for o in odds if o.get("event_id") == match.get("id")), None)
            prediction = await self.oracle.predict(match, match_odds)
            if prediction:
                predictions.append(prediction)
                self.cache_data(f"prediction:{match.get('id')}", prediction, ttl=3600)

        self.sync_to_firebase("predictions", "latest", {
            "predictions": predictions,
            "generated_at": datetime.utcnow().isoformat()
        })
        logger.info(f"✅ Predicciones generadas: {len(predictions)}")
        logger.info("=" * 60)

    async def run(self):
        """Loop principal del engine"""
        logger.info("🏃 Engine corriendo en modo continuo...")
        while True:
            try:
                await self.run_cycle()
            except Exception as e:
                logger.error(f"💥 Error en ciclo principal: {e}", exc_info=True)
            logger.info(f"⏰ Próximo ciclo en {self.sync_interval} segundos...")
            await asyncio.sleep(self.sync_interval)

if __name__ == "__main__":
    engine = GeniusSyncEngine()
    asyncio.run(engine.run())
