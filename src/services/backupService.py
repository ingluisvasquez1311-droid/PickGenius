"""
Sistema de backups automáticos para Firestore
Exporta datos a JSON y opcionalmente a Cloud Storage
"""
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
from datetime import datetime
import gzip
from typing import List

class BackupService:
    """Servicio de backups automáticos"""
    
    def __init__(self, backup_dir='backups'):
        self.backup_dir = backup_dir
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)
        
        # Initialize Firebase
        if not firebase_admin._apps:
            cred_path = 'firebase-credentials.json'
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        
        self.db = firestore.client()
    
    def backup_collection(self, collection_name: str, compress=True) -> str:
        """
        Hace backup de una colección completa
        Returns: ruta del archivo de backup
        """
        print(f"📦 Iniciando backup de {collection_name}...")
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{collection_name}_{timestamp}.json"
        
        if compress:
            filename += '.gz'
        
        filepath = os.path.join(self.backup_dir, filename)
        
        # Obtener todos los documentos
        docs = self.db.collection(collection_name).stream()
        
        # Convertir a lista de dicts
        data = []
        count = 0
        
        for doc in docs:
            doc_data = doc.to_dict()
            doc_data['_id'] = doc.id  # Guardar ID del documento
            data.append(doc_data)
            count += 1
            
            if count % 1000 == 0:
                print(f"   Procesados {count} documentos...")
        
        print(f"   Total documentos: {count}")
        
        # Guardar a archivo
        json_data = json.dumps(data, indent=2, default=str)
        
        if compress:
            with gzip.open(filepath, 'wt', encoding='utf-8') as f:
                f.write(json_data)
        else:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(json_data)
        
        file_size = os.path.getsize(filepath) / (1024 * 1024)  # MB
        print(f"✅ Backup completado: {filepath} ({file_size:.2f} MB)")
        
        return filepath
    
    def backup_all_collections(self, collections: List[str]) -> List[str]:
        """Hace backup de múltiples colecciones"""
        print(f"\n🔄 Iniciando backup de {len(collections)} colecciones...")
        
        backup_files = []
        
        for collection in collections:
            try:
                filepath = self.backup_collection(collection)
                backup_files.append(filepath)
            except Exception as e:
                print(f"❌ Error en backup de {collection}: {e}")
        
        print(f"\n✅ Backup completado: {len(backup_files)} archivos creados")
        return backup_files
    
    def restore_collection(self, backup_file: str, collection_name: str):
        """
        Restaura una colección desde un backup
        WARNING: Esto sobrescribirá datos existentes
        """
        print(f"🔄 Restaurando {collection_name} desde {backup_file}...")
        
        # Leer backup
        if backup_file.endswith('.gz'):
            with gzip.open(backup_file, 'rt', encoding='utf-8') as f:
                data = json.load(f)
        else:
            with open(backup_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        
        print(f"   Documentos en backup: {len(data)}")
        
        # Restaurar documentos
        batch = self.db.batch()
        batch_count = 0
        total_restored = 0
        
        for doc_data in data:
            doc_id = doc_data.pop('_id', None)
            
            if doc_id:
                doc_ref = self.db.collection(collection_name).document(doc_id)
            else:
                doc_ref = self.db.collection(collection_name).document()
            
            batch.set(doc_ref, doc_data)
            batch_count += 1
            
            if batch_count >= 500:
                batch.commit()
                total_restored += batch_count
                batch = self.db.batch()
                batch_count = 0
                print(f"   Restaurados {total_restored} documentos...")
        
        # Commit final
        if batch_count > 0:
            batch.commit()
            total_restored += batch_count
        
        print(f"✅ Restauración completada: {total_restored} documentos")
    
    def cleanup_old_backups(self, days_to_keep=30):
        """Elimina backups antiguos"""
        print(f"\n🧹 Limpiando backups antiguos (>{days_to_keep} días)...")
        
        cutoff_time = datetime.now().timestamp() - (days_to_keep * 24 * 60 * 60)
        deleted_count = 0
        
        for filename in os.listdir(self.backup_dir):
            filepath = os.path.join(self.backup_dir, filename)
            
            if os.path.isfile(filepath):
                file_time = os.path.getmtime(filepath)
                
                if file_time < cutoff_time:
                    os.remove(filepath)
                    deleted_count += 1
                    print(f"   Eliminado: {filename}")
        
        print(f"✅ Limpieza completada: {deleted_count} archivos eliminados")

# Script principal
if __name__ == "__main__":
    import sys
    
    backup_service = BackupService()
    
    # Colecciones a respaldar
    collections = [
        'nba_regular_season_box_scores_2010_2024_part_3',
        'nba_regular_season_box_scores_2024_25'
    ]
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "backup":
            # Hacer backup
            backup_service.backup_all_collections(collections)
            
        elif command == "restore":
            # Restaurar desde backup
            if len(sys.argv) < 4:
                print("Uso: python backupService.py restore <archivo_backup> <nombre_coleccion>")
                sys.exit(1)
            
            backup_file = sys.argv[2]
            collection_name = sys.argv[3]
            
            confirm = input(f"⚠️ Esto sobrescribirá datos en {collection_name}. ¿Continuar? (s/n): ")
            if confirm.lower() == 's':
                backup_service.restore_collection(backup_file, collection_name)
            else:
                print("Restauración cancelada")
        
        elif command == "cleanup":
            # Limpiar backups antiguos
            days = int(sys.argv[2]) if len(sys.argv) > 2 else 30
            backup_service.cleanup_old_backups(days)
    else:
        print("Uso:")
        print("  python backupService.py backup")
        print("  python backupService.py restore <archivo> <coleccion>")
        print("  python backupService.py cleanup [dias]")
