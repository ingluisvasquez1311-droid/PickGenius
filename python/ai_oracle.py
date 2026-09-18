"""
PickGenius - AI Oracle
Genera predicciones deportivas avanzadas usando Groq + LLaMA
"""

import json
import logging
from datetime import datetime
from typing import Optional
from groq import Groq, AsyncGroq

logger = logging.getLogger("AIOracle")

SYSTEM_PROMPT = """Eres PickGenius AI Oracle, un sistema experto en análisis y predicción deportiva.
Tu función es analizar datos de partidos deportivos y generar predicciones precisas y detalladas.

Siempre responde en formato JSON válido con la siguiente estructura exacta:
{
  "prediction": "home_win" | "away_win" | "draw",
  "confidence": <número entre 0.0 y 1.0>,
  "probabilities": {
    "home_win": <porcentaje entre 0-100>,
    "draw": <porcentaje entre 0-100>,
    "away_win": <porcentaje entre 0-100>
  },
  "recommended_bet": {
    "market": "h2h" | "over_under" | "both_teams_score",
    "pick": "<descripción de la apuesta>",
    "value_rating": <1-5>,
    "odds": <cuota decimal recomendada>
  },
  "analysis": "<análisis detallado de máximo 200 palabras>",
  "key_factors": ["<factor 1>", "<factor 2>", "<factor 3>"],
  "risk_level": "low" | "medium" | "high",
  "generated_at": "<ISO timestamp>"
}

No incluyas ningún texto fuera del JSON. Solo el objeto JSON puro."""

class AIOracle:
    def __init__(self, groq_api_key: str):
        self.client = AsyncGroq(api_key=groq_api_key)
        self.model = "llama-3.3-70b-versatile"
        logger.info(f"🧠 AI Oracle inicializado con modelo {self.model}")

    def _build_prompt(self, match: dict, odds: Optional[dict] = None) -> str:
        """Construye el prompt para el oráculo"""
        home = match.get("home_team", {})
        away = match.get("away_team", {})

        prompt = f"""Analiza el siguiente partido y genera una predicción:

PARTIDO:
- Deporte: {match.get('sport_name', 'Fútbol')}
- Liga: {match.get('league', 'Desconocida')}
- Local: {home.get('name', 'Desconocido') if isinstance(home, dict) else home}
- Visitante: {away.get('name', 'Desconocido') if isinstance(away, dict) else away}
- Fecha: {match.get('date', 'No disponible')}
- Estadio: {match.get('venue', 'No disponible')}"""

        if odds and odds.get("h2h"):
            h2h = odds["h2h"]
            prompt += f"""

CUOTAS BETPLAY:
- Local gana: {h2h.get('Home', 'N/A')}
- Empate: {h2h.get('Draw', 'N/A')}
- Visitante gana: {h2h.get('Away', 'N/A')}"""

        prompt += "\n\nGenera la predicción en formato JSON:"
        return prompt

    async def predict(self, match: dict, odds: Optional[dict] = None) -> Optional[dict]:
        """Genera una predicción para un partido usando Groq"""
        try:
            prompt = self._build_prompt(match, odds)

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # Más determinístico para predicciones
                max_tokens=800,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content
            prediction = json.loads(content)
            prediction["match_id"] = match.get("id", "")
            prediction["match"] = {
                "home": match.get("home_team", {}).get("name", "") if isinstance(match.get("home_team"), dict) else match.get("home_team", ""),
                "away": match.get("away_team", {}).get("name", "") if isinstance(match.get("away_team"), dict) else match.get("away_team", ""),
                "league": match.get("league", ""),
                "sport": match.get("sport_name", ""),
                "date": match.get("date", ""),
            }
            prediction["generated_at"] = datetime.utcnow().isoformat()

            logger.info(f"✅ Predicción generada: {prediction['match']['home']} vs {prediction['match']['away']} → {prediction.get('prediction')} ({prediction.get('confidence', 0)*100:.0f}%)")
            return prediction

        except json.JSONDecodeError as e:
            logger.error(f"❌ Error parseando JSON de Groq: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ Error en AI Oracle para {match.get('id')}: {e}")
            return None

    async def generate_daily_summary(self, predictions: list) -> str:
        """Genera un resumen diario de predicciones"""
        try:
            summary_prompt = f"""Genera un resumen ejecutivo de las siguientes {len(predictions)} predicciones deportivas del día.
Destaca las apuestas de mayor valor (value_rating >= 4) y las predicciones con mayor confianza (confidence >= 0.7).
Usa un tono analítico y profesional. Máximo 300 palabras.

Predicciones:
{json.dumps([{
    'match': p.get('match', {}),
    'prediction': p.get('prediction'),
    'confidence': p.get('confidence'),
    'recommended_bet': p.get('recommended_bet', {})
} for p in predictions[:10]], ensure_ascii=False, indent=2)}"""

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Eres un analista deportivo experto. Responde siempre en español."},
                    {"role": "user", "content": summary_prompt}
                ],
                temperature=0.5,
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error generando resumen diario: {e}")
            return "Resumen no disponible en este momento."
