"""
Script para generar datos de prueba en Firestore
Esto te permite ver el dashboard funcionando mientras esperas la sincronización real
"""
import firebase_admin
from firebase_admin import credentials, firestore
import random
from datetime import datetime, timedelta

print("🏀 Generando datos de prueba para el dashboard...")

# Initialize Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate('firebase-credentials.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Equipos NBA
teams = ['LAL', 'BOS', 'GSW', 'MIA', 'PHI', 'MIL', 'BKN', 'DAL', 'PHX', 'DEN']

# Jugadores de ejemplo
players = [
    'LeBron James', 'Stephen Curry', 'Kevin Durant', 'Giannis Antetokounmpo',
    'Luka Doncic', 'Joel Embiid', 'Jayson Tatum', 'Nikola Jokic',
    'Damian Lillard', 'Anthony Davis', 'Devin Booker', 'Jimmy Butler'
]

def generate_sample_data(collection_name, season, num_games=50):
    """Genera datos de prueba para una colección"""
    print(f"\n📦 Generando datos para {collection_name}...")
    
    batch = db.batch()
    batch_count = 0
    total_docs = 0
    
    for game_num in range(num_games):
        game_id = f"00224{season.replace('-', '')}{game_num:04d}"
        game_date = (datetime.now() - timedelta(days=random.randint(1, 180))).strftime('%Y-%m-%d')
        
        # Generar stats para 2 equipos (10-15 jugadores cada uno)
        for team in random.sample(teams, 2):
            num_players = random.randint(10, 15)
            
            for player_num in range(num_players):
                player_name = random.choice(players)
                person_id = random.randint(1000, 9999)
                
                doc_id = f"{game_id}_{person_id}"
                doc_ref = db.collection(collection_name).document(doc_id)
                
                data = {
                    'gameId': game_id,
                    'teamTricode': team,
                    'personName': player_name,
                    'points': random.randint(0, 40),
                    'reboundsTotal': random.randint(0, 15),
                    'assists': random.randint(0, 12),
                    'fieldGoalsPercentage': f"{random.uniform(30, 60):.1f}",
                    'threePointersMade': random.randint(0, 8),
                    'minutes': f"{random.randint(15, 40)}:00",
                    'season_year': season,
                    'game_date': game_date
                }
                
                batch.set(doc_ref, data)
                batch_count += 1
                total_docs += 1
                
                # Commit cada 500 documentos
                if batch_count >= 500:
                    batch.commit()
                    print(f"   ✅ Guardados {total_docs} documentos...")
                    batch = db.batch()
                    batch_count = 0
    
    # Commit final
    if batch_count > 0:
        batch.commit()
    
    print(f"   ✅ Total: {total_docs} documentos creados")
    return total_docs

# Generar datos de prueba
print("\n" + "="*60)
print("Generando datos de prueba...")
print("="*60)

total_2023 = generate_sample_data('nba_regular_season_box_scores_2010_2024_part_3', '2023-24', num_games=30)
total_2024 = generate_sample_data('nba_regular_season_box_scores_2024_25', '2024-25', num_games=50)

print("\n" + "="*60)
print("✅ DATOS DE PRUEBA GENERADOS")
print("="*60)
print(f"Colección 2023-24: {total_2023} documentos")
print(f"Colección 2024-25: {total_2024} documentos")
print("\n🎉 Ahora puedes ver el dashboard funcionando!")
print("   Recarga la página del dashboard en tu navegador")
print("\n⚠️  IMPORTANTE: Estos son datos de PRUEBA")
print("   Para datos reales, ejecuta: python src\\scripts\\fetch_missing_data.py")
