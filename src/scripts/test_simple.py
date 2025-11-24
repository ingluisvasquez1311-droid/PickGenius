"""
Script simple para generar datos de prueba
"""
try:
    print("Iniciando script...")
    
    import firebase_admin
    from firebase_admin import credentials, firestore
    print("✅ Imports exitosos")
    
    # Initialize Firebase
    if not firebase_admin._apps:
        print("Inicializando Firebase...")
        cred = credentials.Certificate('firebase-credentials.json')
        firebase_admin.initialize_app(cred)
        print("✅ Firebase inicializado")
    
    db = firestore.client()
    print("✅ Cliente Firestore creado")
    
    # Crear un documento de prueba simple
    print("\nCreando documento de prueba...")
    doc_ref = db.collection('nba_regular_season_box_scores_2024_25').document('test_001')
    doc_ref.set({
        'gameId': '0022400001',
        'teamTricode': 'LAL',
        'personName': 'LeBron James',
        'points': 25,
        'reboundsTotal': 7,
        'assists': 8,
        'fieldGoalsPercentage': '52.4',
        'threePointersMade': 2,
        'minutes': '35:00',
        'season_year': '2024-25',
        'game_date': '2024-11-23'
    })
    
    print("✅ Documento de prueba creado")
    print("\n🎉 ¡Éxito! Ahora recarga el dashboard")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
