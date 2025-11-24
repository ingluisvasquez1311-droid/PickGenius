"""
Script de prueba para verificar configuración antes de sincronización completa
"""
import sys

def check_python_version():
    print(f"✅ Python {sys.version}")
    if sys.version_info < (3, 8):
        print("⚠️ ADVERTENCIA: Se recomienda Python 3.8 o superior")
        return False
    return True

def check_dependencies():
    print("\n🔍 Verificando dependencias...")
    
    try:
        import firebase_admin
        print("✅ firebase-admin instalado")
    except ImportError:
        print("❌ firebase-admin NO instalado")
        return False
    
    try:
        from nba_api.stats.static import teams
        print("✅ nba-api instalado")
        print(f"   Equipos disponibles: {len(teams.get_teams())}")
    except ImportError:
        print("❌ nba-api NO instalado")
        return False
    
    return True

def check_firebase_credentials():
    print("\n🔍 Verificando credenciales Firebase...")
    import os
    import firebase_admin
    
    cred_path = 'firebase-credentials.json'
    if not os.path.exists(cred_path):
        print(f"❌ No se encontró {cred_path}")
        return False
    
    print(f"✅ Archivo {cred_path} encontrado")
    
    try:
        from firebase_admin import credentials, firestore
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("✅ Conexión a Firebase exitosa")
        return True
    except Exception as e:
        print(f"❌ Error conectando a Firebase: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🏀 VERIFICACIÓN DE ENTORNO - TIRENS PARLEYS NBA SYNC")
    print("=" * 60)
    
    all_ok = True
    
    if not check_python_version():
        all_ok = False
    
    if not check_dependencies():
        all_ok = False
        print("\n💡 Para instalar dependencias ejecuta:")
        print("   pip install -r requirements.txt")
    
    if all_ok and not check_firebase_credentials():
        all_ok = False
    
    print("\n" + "=" * 60)
    if all_ok:
        print("✅ TODO LISTO PARA SINCRONIZACIÓN")
        print("\nPuedes ejecutar:")
        print("  python src/scripts/fetch_missing_data.py")
    else:
        print("❌ HAY PROBLEMAS QUE RESOLVER")
        print("\nRevisa los errores arriba y corrígelos antes de continuar")
    print("=" * 60)
