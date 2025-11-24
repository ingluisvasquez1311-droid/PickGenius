"""
Script de monitoreo para verificar el estado de sincronización en tiempo real
"""
import firebase_admin
from firebase_admin import credentials, firestore
import os
from datetime import datetime, timedelta
from collections import defaultdict
import time

# Initialize Firebase
cred_path = os.path.join(os.getcwd(), 'firebase-credentials.json')
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
db = firestore.client()

def monitor_sync_progress(collection_name: str, interval_seconds: int = 30, duration_minutes: int = 60):
    """
    Monitorea el progreso de sincronización en tiempo real
    """
    print("=" * 70)
    print(f"📊 MONITOR DE SINCRONIZACIÓN - {collection_name}")
    print("=" * 70)
    print(f"Intervalo: {interval_seconds}s | Duración: {duration_minutes}min")
    print(f"Inicio: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    start_time = datetime.now()
    end_time = start_time + timedelta(minutes=duration_minutes)
    
    previous_count = 0
    iteration = 0
    
    while datetime.now() < end_time:
        iteration += 1
        current_time = datetime.now()
        
        # Contar documentos
        try:
            docs = db.collection(collection_name).stream()
            current_count = sum(1 for _ in docs)
            
            # Calcular estadísticas
            new_docs = current_count - previous_count
            elapsed = (current_time - start_time).total_seconds()
            rate = current_count / elapsed if elapsed > 0 else 0
            
            # Mostrar progreso
            print(f"\n[{current_time.strftime('%H:%M:%S')}] Iteración #{iteration}")
            print(f"  Total documentos: {current_count:,}")
            print(f"  Nuevos desde última verificación: {new_docs:,}")
            print(f"  Tasa promedio: {rate:.2f} docs/seg")
            
            if new_docs > 0:
                print(f"  ✅ Sincronización activa")
            else:
                print(f"  ⏸️  Sin cambios")
            
            previous_count = current_count
            
        except Exception as e:
            print(f"  ❌ Error: {e}")
        
        # Esperar antes de la siguiente verificación
        if datetime.now() < end_time:
            time.sleep(interval_seconds)
    
    print("\n" + "=" * 70)
    print(f"Monitor finalizado - Total final: {previous_count:,} documentos")
    print("=" * 70)

def get_sync_summary(collections: list):
    """
    Obtiene un resumen del estado de sincronización de múltiples colecciones
    """
    print("\n" + "=" * 70)
    print("📊 RESUMEN DE SINCRONIZACIÓN")
    print("=" * 70)
    print(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    for collection_name in collections:
        try:
            # Contar total
            docs = db.collection(collection_name).stream()
            total = sum(1 for _ in docs)
            
            # Contar por equipo
            docs = db.collection(collection_name).stream()
            team_counts = defaultdict(int)
            for doc in docs:
                data = doc.to_dict()
                team = data.get('teamTricode', 'UNKNOWN')
                team_counts[team] += 1
            
            print(f"📦 {collection_name}")
            print(f"   Total documentos: {total:,}")
            print(f"   Equipos con datos: {len(team_counts)}")
            
            if team_counts:
                avg = total / len(team_counts)
                print(f"   Promedio por equipo: {avg:,.0f}")
                
                # Equipos con menos datos
                low_teams = [t for t, c in team_counts.items() if c < avg * 0.5]
                if low_teams:
                    print(f"   ⚠️  Equipos con pocos datos: {', '.join(low_teams)}")
            
            print()
            
        except Exception as e:
            print(f"   ❌ Error: {e}\n")
    
    print("=" * 70)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "monitor":
            # Monitorear en tiempo real
            collection = sys.argv[2] if len(sys.argv) > 2 else 'nba_regular_season_box_scores_2024_25'
            interval = int(sys.argv[3]) if len(sys.argv) > 3 else 30
            duration = int(sys.argv[4]) if len(sys.argv) > 4 else 60
            
            monitor_sync_progress(collection, interval, duration)
        
        elif command == "summary":
            # Resumen de todas las colecciones
            collections = [
                'nba_regular_season_box_scores_2010_2024_part_3',
                'nba_regular_season_box_scores_2024_25'
            ]
            get_sync_summary(collections)
    else:
        print("Uso:")
        print("  python monitor_sync.py monitor [colección] [intervalo_seg] [duración_min]")
        print("  python monitor_sync.py summary")
        print("\nEjemplos:")
        print("  python monitor_sync.py monitor nba_regular_season_box_scores_2024_25 30 60")
        print("  python monitor_sync.py summary")
