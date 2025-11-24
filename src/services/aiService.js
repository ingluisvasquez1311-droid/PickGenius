const { HfInference } = require('@huggingface/inference');
const config = require('../config/env');

class AIService {
    constructor() {
        this.apiKey = process.env.HUGGINGFACE_API_KEY || config.huggingface?.apiKey;
        if (!this.apiKey) {
            console.warn('⚠️ Hugging Face API Key is missing!');
        } else {
            this.hf = new HfInference(this.apiKey);
            console.log('✅ Qwen AI initialized successfully');
        }
    }

    async analyzeMatch(matchData) {
        try {
            if (!this.hf) {
                throw new Error('AI model not initialized. Check API Key.');
            }

            const prompt = `Actúa como un experto analista deportivo de apuestas (Parleys).
Analiza el siguiente partido de la NBA basándote en las estadísticas históricas de equipos y jugadores proporcionadas.

Datos del partido: ${JSON.stringify(matchData)}

Tu tarea es generar una predicción detallada que incluya:
1. Ganador del partido (Moneyline).
2. Total de puntos (Over/Under estimado).
3. **Predicciones de Jugadores (Player Props):** Identifica 2-3 jugadores clave y predice si superarán sus promedios (ej. "LeBron James +25.5 Puntos").

Formato de respuesta:
- **Ganador:** [Equipo] ([Probabilidad]%)
- **Análisis:** [Breve explicación basada en stats]
- **Jugadores a seguir:**
  1. [Nombre Jugador]: [Predicción] (Razón: [Breve motivo])
  2. [Nombre Jugador]: [Predicción] (Razón: [Breve motivo])`;

            const response = await this.hf.chatCompletion({
                model: 'Qwen/Qwen2.5-72B-Instruct',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('Error in AI analysis:', error.message);
            return `Error: ${error.message}`;
        }
    }
}

module.exports = new AIService();
