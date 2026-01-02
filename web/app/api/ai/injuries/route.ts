import { NextRequest, NextResponse } from 'next/server';
import Groq from "groq-sdk";

const getGroqClient = () => {
    const keys = (process.env.GROQ_API_KEYS || "").split(",").map(k => k.trim()).filter(Boolean);
    if (keys.length === 0) throw new Error("No Groq API keys found");
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return new Groq({ apiKey: randomKey });
};

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sport = searchParams.get('sport') || 'basketball';

        const groq = getGroqClient();

        // System prompt configured as an Medical/Athletic Analyst
        const systemPrompt = `Eres el "AI Sports Medical Consultant" de PickGenius. Tu especialidad es analizar reportes de lesiones, carga de partidos y fatiga para predecir el impacto en el rendimiento de los jugadores.
        
        SITUACIÓN ACTUAL: Reporte de salud para ${sport.toUpperCase()}.
        
        INSTRUCCIONES:
        1. Genera un reporte resumido de los jugadores clave con problemas físicos o bajas confirmadas hoy.
        2. Clasifica el riesgo en: CRÍTICO (Baja), ALTO (Duda/GTD), MEDIO (Limitación de minutos).
        3. Explica brevemente CÓMO afecta esto a las apuestas (ej: "Sin LeBron, Davis tendrá más volumen de tiro").
        4. Responde ESTRICTAMENTE en formato JSON.

        FORMATO DE RESPUESTA:
        {
            "lastUpdated": "2026-01-01T23:00:00Z",
            "criticalAlerts": [
                {
                    "player": "Nombre",
                    "team": "Equipo",
                    "status": "baja/duda",
                    "injury": "Descripción",
                    "bettingImpact": "Consecuencia en el mercado"
                }
            ],
            "generalSummary": "Resumen global de la jornada médica."
        }`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Analiza la situación médica actual para ${sport} en la jornada de hoy.` }
            ],
            model: "llama-3.3-70b-versatile", // Use a fast model for news
            temperature: 0.2,
            response_format: { type: "json_object" }
        });

        const report = JSON.parse(completion.choices[0]?.message?.content || '{}');
        return NextResponse.json(report);

    } catch (error: any) {
        console.error("Injury AI Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
