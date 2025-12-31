import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const getGroqClient = () => {
    const keys = (process.env.GROQ_API_KEYS || "").split(",").map(k => k.trim()).filter(Boolean);
    if (keys.length === 0) throw new Error("No Groq API keys found");
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return new Groq({ apiKey: randomKey });
};

export async function POST(req: Request) {
    try {
        const { playerName, position, team, sport, lastMatches } = await req.json();

        const groq = getGroqClient();

        // Build detailed stats summary from last 5 matches
        const statsSummary = lastMatches.slice(0, 5).map((match: any, idx: number) => {
            const stats = match.playerStats;
            const opponent = match.homeTeam.name === team ? match.awayTeam.name : match.homeTeam.name;

            if (stats) {
                // Basketball example
                if (stats.points !== undefined) {
                    return `J${idx + 1} vs ${opponent}: ${stats.points || 0} PTS | ${stats.assists || 0} AST | ${stats.totalRebounds || 0} REB | ${stats.steals || 0} ROB | ${stats.blocks || 0} BLQ | ${stats.threePointsMade || 0} 3PT`;
                }
                // Football/Soccer example
                if (stats.goals !== undefined) {
                    return `J${idx + 1} vs ${opponent}: ${stats.goals || 0} GOL | ${stats.assists || 0} AST | ${stats.totalShots || 0} TIROS | ${stats.yellowCards || 0} TA | ${stats.fouls || 0} FALTAS | ${stats.accuratePassesCount || 0} PASES`;
                }
                // Tennis example
                if (stats.aces !== undefined) {
                    return `J${idx + 1} vs ${opponent}: ${stats.aces || 0} ACES | ${stats.doubleFaults || 0} DF | ${stats.firstServePointsWon || 0}% 1S | ${stats.breakPointsSaved || 0} BP SAVED`;
                }
                // Generic fallback
                return `J${idx + 1} vs ${opponent}: Estadísticas registradas`;
            }
            return `J${idx + 1} vs ${opponent}: Sin datos`;
        }).filter(Boolean).join('\n');

        // Calculate averages for available stats
        const statsWithData = lastMatches.slice(0, 5)
            .filter((m: any) => m.playerStats)
            .map((m: any) => m.playerStats);

        if (statsWithData.length === 0) {
            return NextResponse.json({
                error: "No hay suficientes datos para generar predicciones",
                predictions: []
            });
        }

        // Detect sport type and available stats
        const sampleStats = statsWithData[0];
        const isBasketball = sampleStats.points !== undefined;
        const isFootball = sampleStats.goals !== undefined;

        const systemPrompt = `Eres el Motor de Predicción de Props de PickGenius PRO.
        
MISIÓN: Analizar las estadísticas recientes de un jugador y proyectar su rendimiento exacto para el próximo partido, incluyendo mercados secundarios.

REGLAS CRÍTICAS:
1. Indica si el jugador SUPERARÁ o NO su promedio de los últimos 5 partidos.
2. Proyecta un VALOR EXACTO (ej: "Puede hacer 28 puntos").
3. Líneas de apuesta Over/Under SIEMPRE terminan en .5.
4. Incluye confianza (%) y una razón técnica basada puramente en Big Data.
5. Genera entre 6 y 8 predicciones detalladas cubriendo mercados principales y SECUNDARIOS (ej: Robos, Bloqueos, Tarjetas, Córners, Faltas).
6. Responde SOLO en formato JSON válido.`;

        let userPrompt = `Jugador: ${playerName} (${position}, ${team})
        
ESTADÍSTICAS ÚLTIMOS 5 PARTIDOS (Métricas principales y secundarias):
${statsSummary}

INSTRUCCIÓN:
Genera un análisis completo sobre si el jugador cumplirá con sus líneas o no.
Calcula cuánto puede hacer exactamente en categorías principales (Puntos, Goles, Asistencias) y SECUNDARIAS (Robos, Bloqueos, Tarjetas, Tiros, Faltas).
        
Formato de respuesta JSON:
{
  "predictions": [
    {
      "category": "Puntos",
      "line": 24.5,
      "pick": "Over",
      "projectedValue": 28,
      "vsAverage": "Superará su promedio de 22.4",
      "confidence": 88,
      "reason": "Mantiene un volumen de tiros alto y enfrenta a una defensa débil en la pintura."
    },
    {
      "category": "Robos",
      "line": 1.5,
      "pick": "Over",
      "projectedValue": 2,
      "vsAverage": "Superior a su habitual 1.2",
      "confidence": 75,
      "reason": "Enfrenta a un base con alta tasa de pérdidas."
    }
  ]
}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || '{"predictions":[]}');

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Player Analysis API Error:", error);
        return NextResponse.json({
            error: error.message,
            predictions: []
        }, { status: 500 });
    }
}
