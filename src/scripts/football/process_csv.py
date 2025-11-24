"""
Servicio para procesar datos CSV de fútbol y cargarlos a Firestore
Enfocado en métricas clave para análisis y predicciones
"""

import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
import os
from datetime import datetime
import glob

class FootballCSVProcessor:
    """Procesa archivos CSV de fútbol y los carga a Firestore"""
    
    def __init__(self):
        # Initialize Firebase
        if not firebase_admin._apps:
            cred = credentials.Certificate('firebase-credentials.json')
            firebase_admin.initialize_app(cred)
        
        self.db = firestore.client()
        self.data_path = 'data/football'
        
        # Mapeo de códigos de liga a nombres
        self.league_codes = {
            'SP1': 'La Liga',
            'E0': 'Premier League',
            'I1': 'Serie A',
            'D1': 'Bundesliga',
            'F1': 'Ligue 1',
            'E1': 'Championship',
            'SP2': 'La Liga 2',
            'I2': 'Serie B',
            'D2': 'Bundesliga 2',
            'F2': 'Ligue 2',
            'B1': 'Belgian Pro League',
            'N1': 'Eredivisie',
            'P1': 'Primeira Liga',
            'T1': 'Super Lig',
            'G1': 'Super League Greece',
            'SC0': 'Scottish Premiership'
        }
    
    def extract_key_metrics(self, row):
        """
        Extrae las métricas clave para análisis:
        - Corners (tiros de esquina)
        - Tiros a puerta
        - Tiros totales
        - Ambos marcan (BTTS - Both Teams To Score)
        - Over/Under goles
        """
        try:
            home_team = row.get('HomeTeam', '')
            away_team = row.get('AwayTeam', '')
            
            # Goles
            home_goals = int(row.get('FTHG', 0))  # Full Time Home Goals
            away_goals = int(row.get('FTAG', 0))  # Full Time Away Goals
            total_goals = home_goals + away_goals
            
            # Corners
            home_corners = int(row.get('HC', 0))  # Home Corners
            away_corners = int(row.get('AC', 0))  # Away Corners
            total_corners = home_corners + away_corners
            
            # Tiros (Shots)
            home_shots = int(row.get('HS', 0))  # Home Shots
            away_shots = int(row.get('AS', 0))  # Away Shots
            total_shots = home_shots + away_shots
            
            # Tiros a puerta (Shots on Target)
            home_shots_target = int(row.get('HST', 0))  # Home Shots on Target
            away_shots_target = int(row.get('AST', 0))  # Away Shots on Target
            total_shots_target = home_shots_target + away_shots_target
            
            # Métricas calculadas
            both_teams_scored = home_goals > 0 and away_goals > 0
            over_15_goals = total_goals > 1.5
            over_25_goals = total_goals > 2.5
            over_35_goals = total_goals > 3.5
            
            return {
                'homeTeam': home_team,
                'awayTeam': away_team,
                'date': row.get('Date', ''),
                
                # Goles
                'homeGoals': home_goals,
                'awayGoals': away_goals,
                'totalGoals': total_goals,
                
                # Corners
                'homeCorners': home_corners,
                'awayCorners': away_corners,
                'totalCorners': total_corners,
                
                # Tiros
                'homeShots': home_shots,
                'awayShots': away_shots,
                'totalShots': total_shots,
                
                # Tiros a puerta
                'homeShotsTarget': home_shots_target,
                'awayShotsTarget': away_shots_target,
                'totalShotsTarget': total_shots_target,
                
                # Métricas de predicción
                'bothTeamsScored': both_teams_scored,
                'over15Goals': over_15_goals,
                'over25Goals': over_25_goals,
                'over35Goals': over_35_goals,
                
                # Resultado
                'result': 'H' if home_goals > away_goals else ('A' if away_goals > home_goals else 'D'),
                'fullTimeResult': row.get('FTR', ''),
                
                # Metadata
                'season': row.get('Season', ''),
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error extracting metrics: {e}")
            return None
    
    def process_csv_file(self, file_path, league_code):
        """Procesa un archivo CSV y retorna lista de documentos"""
        print(f"\n📄 Procesando {file_path}...")
        
        try:
            df = pd.read_csv(file_path)
            print(f"   Filas encontradas: {len(df)}")
            
            league_name = self.league_codes.get(league_code, league_code)
            documents = []
            
            for _, row in df.iterrows():
                metrics = self.extract_key_metrics(row)
                if metrics:
                    metrics['league'] = league_name
                    metrics['leagueCode'] = league_code
                    documents.append(metrics)
            
            print(f"   ✅ {len(documents)} partidos procesados")
            return documents
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return []
    
    def save_to_firestore(self, documents, collection_name='football_matches'):
        """Guarda documentos en Firestore usando batching"""
        print(f"\n💾 Guardando en Firestore ({collection_name})...")
        
        batch = self.db.batch()
        batch_count = 0
        total_saved = 0
        
        for doc in documents:
            # Crear ID único basado en fecha, equipos
            doc_id = f"{doc['date']}_{doc['homeTeam']}_{doc['awayTeam']}".replace(' ', '_').replace('/', '-')
            doc_ref = self.db.collection(collection_name).document(doc_id)
            
            batch.set(doc_ref, doc)
            batch_count += 1
            
            # Commit cada 500 documentos
            if batch_count >= 500:
                batch.commit()
                total_saved += batch_count
                print(f"   ✅ Guardados {total_saved} documentos...")
                batch = self.db.batch()
                batch_count = 0
        
        # Commit final
        if batch_count > 0:
            batch.commit()
            total_saved += batch_count
        
        print(f"   ✅ Total guardado: {total_saved} documentos")
        return total_saved
    
    def process_all_leagues(self, season='2425'):
        """Procesa todas las ligas principales para una temporada"""
        print("=" * 60)
        print("⚽ PROCESANDO DATOS DE FÚTBOL")
        print("=" * 60)
        
        # Ligas principales a procesar
        main_leagues = ['SP1', 'E0', 'I1', 'D1', 'F1']
        
        all_documents = []
        
        for league_code in main_leagues:
            # Buscar archivo para esta liga y temporada
            pattern = f"{self.data_path}/{league_code}_*{season}*.csv"
            files = glob.glob(pattern)
            
            if not files:
                # Intentar sin temporada
                pattern = f"{self.data_path}/{league_code}.csv"
                files = glob.glob(pattern)
            
            if files:
                for file_path in files:
                    docs = self.process_csv_file(file_path, league_code)
                    all_documents.extend(docs)
            else:
                print(f"⚠️  No se encontró archivo para {league_code}")
        
        # Guardar todos los documentos
        if all_documents:
            self.save_to_firestore(all_documents)
        
        print("\n" + "=" * 60)
        print(f"✅ PROCESAMIENTO COMPLETADO")
        print(f"   Total partidos: {len(all_documents)}")
        print("=" * 60)
        
        return len(all_documents)
    
    def get_statistics_summary(self):
        """Obtiene resumen de estadísticas de Firestore"""
        print("\n📊 Resumen de Estadísticas:")
        
        docs = list(self.db.collection('football_matches').stream())
        
        if not docs:
            print("   No hay datos disponibles")
            return
        
        total = len(docs)
        btts_count = sum(1 for doc in docs if doc.to_dict().get('bothTeamsScored'))
        over25_count = sum(1 for doc in docs if doc.to_dict().get('over25Goals'))
        
        print(f"   Total partidos: {total}")
        print(f"   Ambos marcan: {btts_count} ({btts_count/total*100:.1f}%)")
        print(f"   Over 2.5 goles: {over25_count} ({over25_count/total*100:.1f}%)")
        
        # Por liga
        leagues = {}
        for doc in docs:
            data = doc.to_dict()
            league = data.get('league', 'Unknown')
            leagues[league] = leagues.get(league, 0) + 1
        
        print("\n   Por liga:")
        for league, count in sorted(leagues.items()):
            print(f"   - {league}: {count} partidos")

# Script principal
if __name__ == "__main__":
    processor = FootballCSVProcessor()
    
    # Procesar todas las ligas principales
    processor.process_all_leagues(season='2425')
    
    # Mostrar resumen
    processor.get_statistics_summary()
