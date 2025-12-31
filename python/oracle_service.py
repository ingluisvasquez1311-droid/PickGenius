import os
import json
import asyncio
from groq import Groq
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Cargar variables de entorno desde el root o web
base_path = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(base_path, '..', '.env.local'))
load_dotenv(os.path.join(base_path, '..', 'web', '.env.local'))

class PickGeniusOracle:
    """
    El cerebro de PickGenius.
    Usa Groq (DeepSeek-R1) para generar predicciones deportivas basadas en datos reales.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        # 1. Intentar cargar desde variables de entorno directas
        self.api_key = api_key or os.getenv('GROQ_API_KEY')
        
        # 2. Si no hay una sola, intentar la lista rotativa (la primera)
        if not self.api_key and os.getenv('GROQ_API_KEYS'):
            self.api_key = os.getenv('GROQ_API_KEYS').split(',')[0].strip()
            
        if not self.api_key:
            print("⚠️ Warning: No GROQ_API_KEY found in .env.local. Oracle will be in mock mode.")
            self.client = None
        else:
            self.client = Groq(api_key=self.api_key)
            print(f"✅ Oracle initialized with key: {self.api_key[:10]}...")
            
        # El nuevo 'Modo Dios' recomendado: Llama 3.3 70B Versatile
        self.model = "llama-3.3-70b-versatile"
        print(f"🧬 AI Model set to: {self.model} (Pro Oracle)")
        
    async def generate_prediction(self, sport: str, home_team: str, away_team: str, home_score=None, away_score=None, real_odds: Dict = None) -> Dict:
        """Generates a professional prediction including value analysis if odds are provided"""
        
        if not self.client:
            return self._mock_prediction(home_team, away_team)
            
        is_live = home_score is not None
        score_info = f" (Marcador actual: {home_score}-{away_score})" if is_live else ""
        
        # Definir contexto específico por deporte para mayor precisión
        sport_context = {
            "football": "Enfoque en posesión, tiros a puerta y tarjetas. Términos: Goles, Córners.",
            "basketball": "Enfoque en rebotes, asistencias y triples. Términos: Puntos, Posesiones.",
            "tennis": "Enfoque en aces, dobles faltas y quiebres. Términos: Sets, Games.",
            "baseball": "Enfoque en hits, home runs y ponches. Términos: Carreras, Entradas.",
            "nfl": "Enfoque en yardas de pase/carrera y field goals. Términos: Touchdowns, Puntos.",
            "nhl": "Enfoque en tiros a meta y power plays. Términos: Goles, Periodos."
        }
        
        context = sport_context.get(sport.lower(), "Analiza variables técnicos de este deporte.")
        
        odds_info = ""
        if real_odds:
            odds_info = f"\nCUOTAS REALES (BetPlay): {json.dumps(real_odds)}"
            context += "\nIMPORTANTE: Compara tu probabilidad estimada con las cuotas reales para detectar valor (Value Bet)."
        
        prompt = f"""
        ERES PICKGENIUS ORACLE, EL MEJOR ANALISTA DE APUESTAS DEL MUNDO.
        Analiza este partido de {sport}: {home_team} vs {away_team}{score_info}.{odds_info}
        CONTEXTO TÉCNICO: {context}
        
        REGLAS ESTRICTAS:
        1. Responde ÚNICAMENTE en formato JSON válido.
        2. Usa terminología profesional de {sport}.
        3. NO menciones "goles" si el deporte es {sport} y no aplica (ej: NFL, Basketball).
        4. El campo 'confidence' debe ser un número entre 0 y 100.
        5. En 'keyFactors', incluye al menos una métrica proyectada (ej: "Proyección: 210+ puntos").
        
        ESTRUCTURA JSON:
        {{
            "winner": "Nombre del equipo o Empate",
            "confidence": 85,
            "reasoning": "Breve análisis profesional técnico detallando por qué este equipo ganará",
            "bettingTip": "Recomendación específica de mercado (Ej: Over 2.5, Handicap +3.5, etc)",
            "keyFactors": ["Factor 1", "Factor 2", "Métrica Proyectada"],
            "valueVerdict": "EXCELENTE | BUENO | NEUTRAL (Determina si la cuota de BetPlay tiene valor real)"
        }}
        """
        
        try:
            # Ejecutar en hilo separado para no bloquear el loop de asyncio
            future = asyncio.get_event_loop().run_in_executor(
                None, 
                lambda: self.client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.6,
                    response_format={"type": "json_object"}
                )
            )
            response = await future
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"❌ Oracle Error: {e}")
            return self._mock_prediction(home_team, away_team)

    def _mock_prediction(self, home_team: str, away_team: str) -> Dict:
        """Falla-seguro en caso de error de API"""
        return {
            "winner": home_team,
            "confidence": 50,
            "reasoning": "Análisis preliminar basado en tendencia histórica (IA Offline).",
            "bettingTip": "Victoria local (conservador)",
            "keyFactors": ["Localía", "Historial directo"]
        }

if __name__ == "__main__":
    # Prueba rápida
    async def test():
        oracle = PickGeniusOracle()
        pred = await oracle.generate_prediction("football", "Real Madrid", "Barcelona")
        print(json.dumps(pred, indent=2))
        
    asyncio.run(test())
