import firebase_admin
from firebase_admin import credentials, firestore
from nba_api.stats.endpoints import leaguegamelog, boxscoretraditionalv3
from nba_api.stats.static import teams
import time
import os

# Initialize Firebase
cred_path = os.path.join(os.getcwd(), 'firebase-credentials.json')
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

def get_team_abbr_by_id(team_id):
    for t in teams.get_teams():
        if t['id'] == team_id:
            return t['abbreviation']
    return None

def get_all_team_abbrs():
    return [t['abbreviation'] for t in teams.get_teams()]

def fetch_missing_for_season(season, collection_name):
    """Detect missing boxscore data for *all* teams in a season and fetch it.
    The collection is expected to contain documents with fields:
        - gameId
        - teamTricode (team abbreviation)
        - season_year
    """
    print(f"\n🔎 Scanning season {season} for missing data in collection '{collection_name}'")
    team_abbrs = get_all_team_abbrs()
    for abbr in team_abbrs:
        # Retrieve the list of games for this team/season
        try:
            game_log = leaguegamelog.LeagueGameLog(
                season=season,
                league_id='00',
                player_or_team_abbreviation=abbr,
                season_type_all_star='Regular Season',
                timeout=60
            )
            
            # Use get_data_frames() which is more reliable
            dfs = game_log.get_data_frames()
            if not dfs or len(dfs) == 0 or dfs[0].empty:
                print(f"  No games found for {abbr} in season {season}. Skipping.")
                continue
            
            # Convert DataFrame to list of dicts
            games = dfs[0].to_dict('records')
        except Exception as e:
            print(f"  Error obtaining game log for {abbr}: {e}")
            continue
        # Query Firestore for existing records of this team/season
        existing = db.collection(collection_name)\
            .where('teamTricode', '==', abbr)\
            .where('season_year', '==', season)\
            .stream()
        existing_game_ids = set(doc.to_dict().get('gameId') for doc in existing)
        # Identify games without any player stats stored
        missing_games = [g for g in games if g['GAME_ID'] not in existing_game_ids]
        if not missing_games:
            print(f"  ✅ All data present for {abbr}")
            continue
        print(f"  📂 {len(missing_games)} missing games for {abbr}. Fetching...")
        batch = db.batch()
        batch_count = 0
        total_saved = 0
        for game in missing_games:
            game_id = game['GAME_ID']
            game_date = game['GAME_DATE']
            try:
                box = boxscoretraditionalv3.BoxScoreTraditionalV3(game_id=game_id)
                player_stats = box.get_normalized_dict().get('PlayerStats', [])
                for stat in player_stats:
                    if stat['teamTricode'] != abbr:
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
                    batch_count += 1
                    if batch_count >= 400:
                        batch.commit()
                        batch = db.batch()
                        batch_count = 0
                        total_saved += 400
                time.sleep(0.5)  # rate‑limit
            except Exception as e:
                print(f"    Error fetching box for game {game_id}: {e}")
        if batch_count > 0:
            batch.commit()
            total_saved += batch_count
        print(f"  ✅ Saved {total_saved} records for {abbr} ({season})")

if __name__ == "__main__":
    # Fill gaps for the 2023‑24 season (already partially loaded)
    fetch_missing_for_season('2023-24', 'nba_regular_season_box_scores_2010_2024_part_3')
    # Fill gaps for the 2024‑25 season (if you have a collection for it, adjust name accordingly)
    # Example collection name: 'nba_regular_season_box_scores_2024_25'
    # fetch_missing_for_season('2024-25', 'nba_regular_season_box_scores_2024_25')
