"""
Script mejorado de sincronización con retry logic y logging detallado
Versión mejorada de fetch_missing_data.py con manejo robusto de errores
"""
import firebase_admin
from firebase_admin import credentials, firestore
from nba_api.stats.endpoints import leaguegamelog, boxscoretraditionalv3
from nba_api.stats.static import teams
import time
import os
import logging
from datetime import datetime
from typing import List, Dict, Optional

# Configurar logging detallado
log_dir = 'logs'
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

log_filename = os.path.join(log_dir, f'sync_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_filename),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Firebase
cred_path = os.path.join(os.getcwd(), 'firebase-credentials.json')
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

# Configuración de retry
MAX_RETRIES = 3
RETRY_DELAY = 5  # segundos

def retry_on_failure(func, *args, max_retries=MAX_RETRIES, delay=RETRY_DELAY, **kwargs):
    """Ejecuta una función con retry logic"""
    for attempt in range(max_retries):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            if attempt < max_retries - 1:
                logger.warning(f"Intento {attempt + 1} falló: {e}. Reintentando en {delay}s...")
                time.sleep(delay)
            else:
                logger.error(f"Falló después de {max_retries} intentos: {e}")
                raise
    return None

def get_team_id(abbr: str) -> Optional[int]:
    """Return the NBA team ID for a given abbreviation"""
    for team in teams.get_teams():
        if team['abbreviation'] == abbr:
            return team['id']
    return None

def fetch_game_log(team_abbr: str, season: str) -> List[Dict]:
    """Obtiene game log con retry logic"""
    logger.info(f"Obteniendo game log para {team_abbr} temporada {season}")
    
    def _fetch():
        game_log = leaguegamelog.LeagueGameLog(
            season=season,
            player_or_team_abbreviation=team_abbr,
            season_type_all_star='Regular Season',
            league_id='00',
            timeout=60
        )
        dfs = game_log.get_data_frames()
        if not dfs or len(dfs) == 0 or dfs[0].empty:
            return []
        return dfs[0].to_dict('records')
    
    return retry_on_failure(_fetch)

def fetch_box_score(game_id: str) -> List[Dict]:
    """Obtiene box score con retry logic"""
    logger.debug(f"Obteniendo box score para juego {game_id}")
    
    def _fetch():
        box = boxscoretraditionalv3.BoxScoreTraditionalV3(game_id=game_id)
        player_stats = box.get_normalized_dict().get('PlayerStats', [])
        return player_stats
    
    return retry_on_failure(_fetch)

def save_to_firestore(batch, data_list: List[Dict], collection_name: str) -> int:
    """Guarda datos en Firestore con manejo de errores"""
    saved_count = 0
    try:
        batch.commit()
        saved_count = len(data_list)
        logger.info(f"Guardados {saved_count} documentos en {collection_name}")
    except Exception as e:
        logger.error(f"Error guardando en Firestore: {e}")
        # Intentar guardar uno por uno si el batch falla
        logger.info("Intentando guardar documentos individualmente...")
        for data in data_list:
            try:
                doc_ref = db.collection(collection_name).document(data['doc_id'])
                doc_ref.set(data['data'], merge=True)
                saved_count += 1
            except Exception as e2:
                logger.error(f"Error guardando documento {data.get('doc_id')}: {e2}")
    
    return saved_count

def fetch_season_data(team_abbr: str, season: str, collection_name: str) -> Dict:
    """
    Fetch all games for team_abbr in season and store player box-score stats
    Returns statistics about the operation
    """
    logger.info(f"🏀 Procesando {team_abbr} para temporada {season}")
    
    stats = {
        'team': team_abbr,
        'season': season,
        'games_found': 0,
        'games_processed': 0,
        'records_saved': 0,
        'errors': 0
    }
    
    team_id = get_team_id(team_abbr)
    if not team_id:
        logger.error(f"Team ID no encontrado para {team_abbr}")
        return stats

    # Retrieve the game log for the team/season
    try:
        games = fetch_game_log(team_abbr, season)
        if not games:
            logger.warning(f"No se encontraron juegos para {team_abbr} en temporada {season}")
            return stats
        
        stats['games_found'] = len(games)
        logger.info(f"Encontrados {len(games)} juegos")
    except Exception as e:
        logger.error(f"Error obteniendo game log: {e}")
        stats['errors'] += 1
        return stats

    batch = db.batch()
    batch_count = 0
    batch_data = []
    total_saved = 0

    for game in games:
        game_id = game['GAME_ID']
        game_date = game['GAME_DATE']
        
        try:
            player_stats = fetch_box_score(game_id)
            
            for stat in player_stats:
                if stat['teamTricode'] != team_abbr:
                    continue
                
                doc_id = f"{game_id}_{stat['personId']}"
                doc_ref = db.collection(collection_name).document(doc_id)
                data = {
                    'gameId': game_id,
                    'teamTricode': stat['teamTricode'],
                    'personName': f"{stat['firstName']} {stat['familyName']}",
                    'points': stat['points'],
                    'reboundsTotal': stat['reboundsTotal'],
                    'assists': stat['assists'],
                    'fieldGoalsPercentage': f"{stat['fieldGoalsPercentage'] * 100:.1f}" if stat['fieldGoalsPercentage'] else '0.0',
                    'threePointersMade': stat['threePointersMade'],
                    'minutes': stat['minutes'],
                    'season_year': season,
                    'game_date': game_date
                }
                
                batch.set(doc_ref, data, merge=True)
                batch_data.append({'doc_id': doc_id, 'data': data})
                batch_count += 1
                
                if batch_count >= 400:
                    saved = save_to_firestore(batch, batch_data, collection_name)
                    total_saved += saved
                    batch = db.batch()
                    batch_data = []
                    batch_count = 0
            
            stats['games_processed'] += 1
            time.sleep(0.5)  # Rate limit
            
        except Exception as e:
            logger.error(f"Error procesando juego {game_id}: {e}")
            stats['errors'] += 1

    # Commit remaining batch
    if batch_count > 0:
        saved = save_to_firestore(batch, batch_data, collection_name)
        total_saved += saved

    stats['records_saved'] = total_saved
    logger.info(f"✅ Guardados {total_saved} registros para {team_abbr} ({season})")
    
    return stats

if __name__ == "__main__":
    logger.info("=" * 70)
    logger.info("🏀 SINCRONIZACIÓN NBA CON RETRY LOGIC Y LOGGING")
    logger.info("=" * 70)
    logger.info(f"Log file: {log_filename}")
    
    all_stats = []
    
    # PHASE 1: Fill 2023-24 gaps (PHI, MIA)
    logger.info("\n=== FASE 1: Rellenando huecos 2023-24 (PHI, MIA) ===")
    for team in ['PHI', 'MIA']:
        stats = fetch_season_data(team, '2023-24', 'nba_regular_season_box_scores_2010_2024_part_3')
        all_stats.append(stats)
        time.sleep(1)

    # PHASE 2: Fetch full 2024-25 season for all teams
    logger.info("\n=== FASE 2: Obteniendo temporada 2024-25 (TODOS LOS EQUIPOS) ===")
    for team in teams.get_teams():
        stats = fetch_season_data(team['abbreviation'], '2024-25', 'nba_regular_season_box_scores_2024_25')
        all_stats.append(stats)
        logger.info("Esperando 1 segundo antes del siguiente equipo...")
        time.sleep(1)

    # Resumen final
    logger.info("\n" + "=" * 70)
    logger.info("📊 RESUMEN DE SINCRONIZACIÓN")
    logger.info("=" * 70)
    
    total_games = sum(s['games_found'] for s in all_stats)
    total_processed = sum(s['games_processed'] for s in all_stats)
    total_records = sum(s['records_saved'] for s in all_stats)
    total_errors = sum(s['errors'] for s in all_stats)
    
    logger.info(f"Total juegos encontrados: {total_games}")
    logger.info(f"Total juegos procesados: {total_processed}")
    logger.info(f"Total registros guardados: {total_records}")
    logger.info(f"Total errores: {total_errors}")
    logger.info(f"\nLog guardado en: {log_filename}")
    logger.info("\n🎉 Sincronización completada!")
