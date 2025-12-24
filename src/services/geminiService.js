const { GoogleGenerativeAI } = require("@google/generative-ai");
const { OpenAI } = require("openai");
const historyService = require('./HistoryService');
const sofaScoreFootballService = require('./football/sofaScoreService');
const sofaScoreBasketballService = require('./basketball/sofaScoreBasketballService');
const groqRotator = require('../utils/groqRotator');

class GeminiService {
    constructor() {
        // Initialize Gemini
        const geminiKey = process.env.GEMINI_API_KEY || 'AIzaSyBrdhKlZ87YB3VWu10Srngha0zPzcM47iA';
        if (geminiKey) {
            this.genAI = new GoogleGenerativeAI(geminiKey);
            this.geminiModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        }

        // Initialize Groq keys handled by rotator
        this.groqService = groqRotator;
        console.log('✅ Groq AI system ready with key rotation');

        // Initialize Claude (Anthropic) as fallback - better free tier
        const claudeKey = process.env.ANTHROPIC_API_KEY;
        if (claudeKey) {
            const Anthropic = require('@anthropic-ai/sdk').default;
            this.anthropic = new Anthropic({ apiKey: claudeKey });
            console.log('✅ Claude (Anthropic) configured as fallback AI');
        }

        if (!geminiKey && !groqKey && !claudeKey) {
            console.warn('⚠️ No AI keys configured. Predictions will be mocked.');
        }
    }

    /**
     * Generar predicción basada en el historial del partido
     */
    async predictMatch(eventId, sport) {
        // 1. Obtener historial
        const history = await historyService.getHistory(eventId);

        // 2. Obtener contexto de la tabla de posiciones (Standings)
        let standingsContext = "";
        try {
            const service = sport === 'basketball' ? sofaScoreBasketballService : sofaScoreFootballService;
            const eventDetails = await service.getEventDetails(eventId);

            if (eventDetails.success && eventDetails.data) {
                const { tournament, season, homeTeam, awayTeam } = eventDetails.data.event;

                // Fetch standings
                const standingsRes = await service.getStandings(tournament.id, season.id);

                if (standingsRes.success && standingsRes.data && standingsRes.data.standings) {
                    const totalStandings = standingsRes.data.standings.find(s => s.type === 'total') || standingsRes.data.standings[0];
                    if (totalStandings && totalStandings.rows) {
                        const homeStanding = totalStandings.rows.find(r => r.team.id === homeTeam.id);
                        const awayStanding = totalStandings.rows.find(r => r.team.id === awayTeam.id);

                        if (homeStanding && awayStanding) {
                            standingsContext = `
                            CONTEXTO DE LA LIGA (${tournament.name}):
                            - ${homeTeam.name}: Posición ${homeStanding.position} (${homeStanding.points} pts).
                            - ${awayTeam.name}: Posición ${awayStanding.position} (${awayStanding.points} pts).
                            - Diferencia de puntos: ${Math.abs(homeStanding.points - awayStanding.points)}.
                            `;
                        }
                    }
                }
            }
        } catch (err) {
            console.warn("⚠️ Could not fetch standings context:", err.message);
        }

        if (!history || history.length === 0) {
            // Si no hay historial pero tenemos contexto de tabla, podemos intentar predecir pre-partido
            if (!standingsContext) {
                return {
                    success: false,
                    error: "No hay suficientes datos históricos para este partido aún."
                };
            }
        }

        // 3. Preparar prompt
        const prompt = this.buildPrompt(history, sport, standingsContext);

        // 1. Intentar con Groq primero (FREE & Fast!)
        if (this.groqService) {
            try {
                console.log('🤖 Trying Groq AI (Primary)...');
                const completion = await this.groqService.chatCompletion({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content: "Eres un analista deportivo experto que hace predicciones basadas en datos en vivo y contexto de liga. Responde SIEMPRE en formato JSON válido."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 800
                });

                const predictionText = completion.choices[0].message.content;

                return {
                    success: true,
                    prediction: predictionText,
                    timestamp: new Date(),
                    provider: 'Groq'
                };
            } catch (error) {
                console.warn(`⚠️ Groq failed: ${error.message}. Trying Gemini...`);
            }
        }

        // 2. Fallback a Gemini
        if (this.geminiModel) {
            try {
                console.log('🤖 Trying Gemini AI (Fallback)...');
                const result = await this.geminiModel.generateContent(prompt);
                const response = await result.response;
                const predictionText = response.text();

                return {
                    success: true,
                    prediction: predictionText,
                    timestamp: new Date(),
                    provider: 'Gemini'
                };
            } catch (error) {
                console.warn(`⚠️ Gemini failed: ${error.message}. Trying Claude...`);
            }
        }

        // 6. Fallback a Claude (Anthropic)
        if (this.anthropic) {
            try {
                console.log('🤖 Trying Claude (Anthropic)...');
                const message = await this.anthropic.messages.create({
                    model: "claude-3-haiku-20240307", // Fast and cheap model
                    max_tokens: 500,
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    system: "Eres un analista deportivo experto que hace predicciones basadas en datos en vivo. Responde siempre en formato JSON."
                });

                const predictionText = message.content[0].text;

                return {
                    success: true,
                    prediction: predictionText,
                    timestamp: new Date(),
                    provider: 'Claude'
                };
            } catch (error) {
                console.error(`❌ Claude also failed: ${error.message}`);
            }
        }

        // 7. Último recurso: Mock
        console.log('📝 Using mock prediction');
        return {
            success: true,
            prediction: this.getMockPrediction(sport),
            timestamp: new Date(),
            provider: 'Mock'
        };
    }

    buildPrompt(history, sport, standingsContext) {
        const lastState = history.length > 0 ? history[history.length - 1].stats : "No live data yet";
        const isEarlyGame = history.length < 5;

        let context = `Analiza este partido de ${sport} en vivo. `;

        if (standingsContext) {
            context += standingsContext;
        }

        if (isEarlyGame) {
            context += "El partido acaba de comenzar o lleva pocos minutos. Basa tu análisis en la POSICIÓN EN LA TABLA y la proyección inicial. ";
        } else {
            context += `Tengo ${history.length} puntos de datos recientes en vivo. `;
        }
        context += `Estado actual del juego: ${JSON.stringify(lastState)}. `;

        context += `
        Basado en la tendencia, las estadísticas actuales y la POSICIÓN EN LA TABLA:
        1. ¿Quién tiene más probabilidad de ganar? (Considera si el favorito está perdiendo o si es un duelo parejo).
        2. ¿Qué dicen los datos sobre goles/puntos esperados?
        3. Dame una predicción de apuesta recomendada.

        Responde SIEMPRE en este formato JSON exacto (sin texto adicional fuera del JSON):
        {
            "winner": "Predicción del ganador",
            "confidence": "Porcentaje de confianza (ej. 85%)",
            "reasoning": "Explicación técnica breve que mencione la posición en tabla y datos en vivo (ej. 'El líder Local domina al colista Visitante con 60% posesión...')",
            "bettingTip": "La mejor apuesta recomendada (ej. 'Más de 2.5 goles' o 'Local gana')",
            "details": {
                "goals_points": "Predicción de goles/puntos (ej. '2-1' o 'Over 200.5')",
                "corners_rebounds": "Predicción de corners/rebotes (ej. 'Más de 9 corners')",
                "cards_fouls": "Predicción de tarjetas/faltas (ej. 'Menos de 4 tarjetas')",
                "shots_accuracy": "Predicción de tiros/efectividad (ej. 'Local +5 tiros al arco')"
            }
        }`;

        return context;
    }

    getMockPrediction(sport) {
        return JSON.stringify({
            winner: "Análisis Simulado",
            confidence: "80%",
            reasoning: "El partido está en fase inicial. El equipo local muestra una ligera iniciativa en ataque.",
            bettingTip: "Esperar 10 min o Apostar Empate 1T",
            details: {
                goals_points: "Menos de 1.5 goles 1T",
                corners_rebounds: "Más de 4 corners",
                cards_fouls: "Juego limpio por ahora",
                shots_accuracy: "Pocos tiros al arco"
            }
        });
    }
}

module.exports = new GeminiService();
