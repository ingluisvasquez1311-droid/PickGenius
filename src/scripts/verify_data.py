"""
Script para verificar la integridad de datos NBA en Firestore
Cuenta documentos, verifica campos requeridos e identifica huecos
"""
import firebase_admin
from firebase_admin import credentials, firestore
import os
from collections import defaultdict

# Initialize Firebase
cred_path = os.path.join(os.getcwd(), 'firebase-credentials.json')
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

def count_documents(collection_name):
    """Cuenta documentos en una colección"""
    print(f"\n📊 Contando documentos en '{collection_name}'...")
    try:
        docs = db.collection(collection_name).stream()
        count = sum(1 for _ in docs)
        print(f"   Total: {count:,} documentos")
        return count
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return 0

def verify_data_integrity(collection_name, sample_size=100):
    """Verifica integridad de datos en una colección"""
    print(f"\n🔍 Verificando integridad de datos en '{collection_name}'...")
    
    required_fields = [
        'gameId', 'teamTricode', 'personName', 'points', 
        'reboundsTotal', 'assists', 'season_year', 'game_date'
    ]
    
    try:
        docs = db.collection(collection_name).limit(sample_size).stream()
        
        total_checked = 0
        missing_fields = defaultdict(int)
        valid_docs = 0
        
        for doc in docs:
            total_checked += 1
            data = doc.to_dict()
            
            is_valid = True
            for field in required_fields:
                if field not in data or data[field] is None:
                    missing_fields[field] += 1
                    is_valid = False
            
            if is_valid:
                valid_docs += 1
        
        print(f"   Documentos verificados: {total_checked}")
        print(f"   ✅ Documentos válidos: {valid_docs} ({valid_docs/total_checked*100:.1f}%)")
        
        if missing_fields:
            print(f"   ⚠️  Campos faltantes encontrados:")
            for field, count in missing_fields.items():
                print(f"      - {field}: {count} documentos")
        else:
            print(f"   ✅ Todos los documentos tienen campos requeridos")
        
        return valid_docs == total_checked
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def count_by_team(collection_name):
    """Cuenta documentos por equipo"""
    print(f"\n📈 Contando documentos por equipo en '{collection_name}'...")
    
    try:
        docs = db.collection(collection_name).stream()
        
        team_counts = defaultdict(int)
        for doc in docs:
            data = doc.to_dict()
            team = data.get('teamTricode', 'UNKNOWN')
            team_counts[team] += 1
        
        # Ordenar por equipo
        sorted_teams = sorted(team_counts.items())
        
        print(f"\n   {'Equipo':<10} {'Documentos':>12}")
        print(f"   {'-'*10} {'-'*12}")
        
        for team, count in sorted_teams:
            print(f"   {team:<10} {count:>12,}")
        
        print(f"\n   Total equipos: {len(team_counts)}")
        
        # Identificar equipos con pocos datos
        avg_count = sum(team_counts.values()) / len(team_counts) if team_counts else 0
        low_data_teams = [team for team, count in team_counts.items() if count < avg_count * 0.5]
        
        if low_data_teams:
            print(f"\n   ⚠️  Equipos con datos por debajo del promedio:")
            for team in low_data_teams:
                print(f"      - {team}: {team_counts[team]:,} documentos (promedio: {avg_count:,.0f})")
        
        return team_counts
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return {}

def count_by_season(collection_name):
    """Cuenta documentos por temporada"""
    print(f"\n📅 Contando documentos por temporada en '{collection_name}'...")
    
    try:
        docs = db.collection(collection_name).stream()
        
        season_counts = defaultdict(int)
        for doc in docs:
            data = doc.to_dict()
            season = data.get('season_year', 'UNKNOWN')
            season_counts[season] += 1
        
        # Ordenar por temporada
        sorted_seasons = sorted(season_counts.items())
        
        print(f"\n   {'Temporada':<12} {'Documentos':>12}")
        print(f"   {'-'*12} {'-'*12}")
        
        for season, count in sorted_seasons:
            print(f"   {season:<12} {count:>12,}")
        
        return season_counts
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return {}

def get_sample_document(collection_name):
    """Obtiene un documento de ejemplo"""
    print(f"\n📄 Documento de ejemplo de '{collection_name}':")
    
    try:
        docs = db.collection(collection_name).limit(1).stream()
        
        for doc in docs:
            data = doc.to_dict()
            print(f"\n   ID: {doc.id}")
            for key, value in data.items():
                print(f"   {key}: {value}")
            return data
        
        print("   ⚠️  No se encontraron documentos")
        return None
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return None

if __name__ == "__main__":
    print("=" * 70)
    print("🏀 VERIFICACIÓN DE DATOS NBA EN FIRESTORE")
    print("=" * 70)
    
    collections = [
        'nba_regular_season_box_scores_2010_2024_part_3',
        'nba_regular_season_box_scores_2024_25'
    ]
    
    for collection in collections:
        print(f"\n{'='*70}")
        print(f"📦 COLECCIÓN: {collection}")
        print(f"{'='*70}")
        
        # Contar documentos
        total_docs = count_documents(collection)
        
        if total_docs > 0:
            # Verificar integridad
            verify_data_integrity(collection, sample_size=min(100, total_docs))
            
            # Contar por equipo
            count_by_team(collection)
            
            # Contar por temporada
            count_by_season(collection)
            
            # Mostrar ejemplo
            get_sample_document(collection)
        else:
            print(f"\n   ⚠️  Colección vacía o no existe")
    
    print(f"\n{'='*70}")
    print("✅ Verificación completada")
    print(f"{'='*70}")
