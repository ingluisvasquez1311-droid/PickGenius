import asyncio
import os
from oracle_service import PickGeniusOracle

async def test_oracle_env():
    print("🔍 Probando detección de variables de entorno...")
    oracle = PickGeniusOracle()
    
    if oracle.client:
        print(f"✅ ÉXITO: Oracle conectado a Groq con modelo: {oracle.model}")
        print("🔮 Generando predicción de prueba rápida...")
        pred = await oracle.generate_prediction("football", "Chelsea", "Arsenal")
        print(f"Resultado IA: {pred.get('winner')} - Confianza: {pred.get('confidence')}%")
    else:
        print("❌ FALLO: Oracle sigue en modo Mock. Revisa .env.local")

if __name__ == "__main__":
    asyncio.run(test_oracle_env())
