import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from nba_api.stats.endpoints import leaguegamelog, boxscoretraditionalv3
from nba_api.stats.static import teams
import time
import os

# Initialize Firebase
cred_path = os.path.join(os.getcwd(), 'firebase-credentials.json')
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

def get_team_id(abbr):
    """Return the NBA team ID for a given abbreviation (e.g., 'PHI')."""
    for team in teams.get_teams():
        if team['abbreviation'] == abbr:
            return team['id']
    return None

def fetch_season_data(team_abbr, season, collection_name):
    """Fetch all games for *team_abbr* in *season* and store player box‑score stats.
    Data is written to the Firestore *collection_name* (e.g. 'nba_regular_season_box_scores_2025_26').
    """
    print(f"\n🏀 Processing {team_abbr} for season {season}…")
    team_id = get_team_id(team_abbr)
    if not team_id:
        print(f"Error: Team ID not found for {team_abbr}")
        return

    # Retrieve the game log for the team/season
    try:
        game_log = leaguegamelog.LeagueGameLog(
            season=season,
            player_or_team_abbreviation=team_abbr,
            season_type_all_star='Regular Season',
            league_id='00',
            timeout=60
        )
        
        # Use get_data_frames() which is more reliable
        dfs = game_log.get_data_frames()
        if not dfs or len(dfs) == 0 or dfs[0].empty:
            print(f"  No games found for {team_abbr} in season {season}")
            return
        
        # Convert DataFrame to list of dicts
        games = dfs[0].to_dict('records')
        print(f"  Found {len(games)} games.")
    except Exception as e:
        print(f"  Error getting game log: {e}")
        import traceback
        traceback.print_exc()
        return

    batch = db.batch()
    batch_count = 0
    total_saved = 0

    for game in games:
        game_id = game['GAME_ID']
        game_date = game['GAME_DATE']
        try:
            box = boxscoretraditionalv3.BoxScoreTraditionalV3(game_id=game_id)
            player_stats = box.get_normalized_dict().get('PlayerStats', [])
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
                batch_count += 1
                if batch_count >= 400:
                    batch.commit()
                    batch = db.batch()
                    batch_count = 0
                    total_saved += 400
            # Respect rate limits
            time.sleep(0.5)
        except Exception as e:
            print(f"    Error processing game {game_id}: {e}")

    if batch_count > 0:
        batch.commit()
        total_saved += batch_count

    print(f"  ✅ Saved {total_saved} records for {team_abbr} ({season}) to {collection_name}")

if __name__ == "__main__":
    # PHASE 1: Fill 2023‑24 gaps (PHI, MIA)
    print("=== PHASE 1: Filling 2023‑24 gaps (PHI, MIA) ===")
    for team in ['PHI', 'MIA']:
        fetch_season_data(team, '2023-24', 'nba_regular_season_box_scores_2010_2024_part_3')
        time.sleep(1)

    # PHASE 2: Fetch full 2024‑25 season for all teams (CURRENT SEASON)
    print("\n=== PHASE 2: Fetching 2024‑25 season (ALL TEAMS) ===")
    for team in teams.get_teams():
        fetch_season_data(team['abbreviation'], '2024-25', 'nba_regular_season_box_scores_2024_25')
        print("  Waiting 1 second before next team…")
        time.sleep(1)

    print("\n🎉 All done! Database updated.")

