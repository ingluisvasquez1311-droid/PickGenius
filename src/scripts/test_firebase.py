"""
Script rápido para probar conexión a Firebase
"""
import firebase_admin
from firebase_admin import credentials, firestore
import os

try:
    print("🔍 Probando conexión a Firebase...")
    
    # Verificar que existe el archivo
    cred_path = 'firebase-credentials.json'
    if not os.path.exists(cred_path):
        print(f"❌ No se encontró {cred_path}")
        exit(1)
    
    print(f"✅ Archivo {cred_path} encontrado")
    
    # Intentar inicializar
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    
    print("✅ Conexión a Firebase exitosa")
    
    # Probar lectura de colecciones
    print("\n📊 Colecciones disponibles:")
    collections = db.collections()
    for collection in collections:
        print(f"   - {collection.id}")
    
    print("\n✅ Firebase configurado correctamente")
    
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)
