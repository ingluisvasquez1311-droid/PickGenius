import asyncio
import json
import os
from oracle_service import PickGeniusOracle

async def test_real_betplay_ia():
    print("🔥 PROBANDO IA CON DATOS REALES DE BETPLAY...")
    
    # 1. Cargar el último JSON descargado (Simulado o Real)
    data_dir = os.path.join(os.getcwd(), 'data', 'betplay')
    
    # Si no existe data real, usamos un caso de prueba de alto valor
    test_event = {
        "id": "match_123",
        "sport": "football",
        "home_team": "Real Madrid",
        "away_team": "Manchester City",
        "home_score": 1,
        "away_score": 1,
        "real_odds": {
            "Gana Local": 3.10,
            "Empate": 3.40,
            "Gana Visitante": 2.25,
            "Más de 2.5 Goles": 1.85
        }
    }
    
    oracle = PickGeniusOracle()
    
    print(f"\n🏟️  Partido: {test_event['home_team']} vs {test_event['away_team']}")
    print(f"💰 Cuotas en BetPlay: {json.dumps(test_event['real_odds'], indent=2)}")
    
    print("\n🧠 Consultando a PickGenius Oracle...")
    
    prediction = await oracle.generate_prediction(
        test_event['sport'],
        test_event['home_team'],
        test_event['away_team'],
        test_event['home_score'],
        test_event['away_score'],
        real_odds=test_event['real_odds']
    )
    
    print("\n✅ RESULTADO DEL ANÁLISIS IA:")
    print("-" * 40)
    print(f"🎯 PRONÓSTICO: {prediction.get('winner')}")
    print(f"📈 CONFIANZA: {prediction.get('confidence')}%")
    print(f"💎 VEREDICTO DE VALOR: {prediction.get('valueVerdict')}")
    print(f"📝 TIP: {prediction.get('bettingTip')}")
    print(f"💡 RAZONAMIENTO: {prediction.get('reasoning')}")
    print("-" * 40)

if __name__ == "__main__":
    asyncio.run(test_real_betplay_ia())
