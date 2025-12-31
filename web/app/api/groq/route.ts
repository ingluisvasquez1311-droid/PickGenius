import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

// Helper to get a random key for rotation
const getGroqClient = () => {
    const keys = (process.env.GROQ_API_KEYS || "").split(",").map(k => k.trim()).filter(Boolean);
    if (keys.length === 0) throw new Error("No Groq API keys found");
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return new Groq({ apiKey: randomKey });
};

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();
        const groq = getGroqClient();

        console.log("Generando predicción para:", prompt);

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Eres PickGenius v2.0, la IA de análisis deportivo más avanzada del mundo. Tu misión es encontrar VALOR donde otros solo ven ruido.

                    Contexto de Datos:
                    - Recibirás Alineaciones (Lineups), Estadísticas en Vivo y Líderes (Best Players).
                    - USA ESTOS DATOS. No inventes. Si ves a un jugador clave en la banca, menciónalo. Si ves una defensa débil contra un QB estrella, explótalo.
                    
                    Tu Estilo "Brutal & Sharp":
                    - 🎯 Precisión Quirúrgica: No uses relleno. Ve al grano.
                    - 🧠 IQ Táctico: Analiza duelos individuales (Matchups). Ejemplo: "El LB X no puede cubrir al TE Y".
                    - 💰 Value Hunter: Siempre busca una oportunidad de apuesta con valor positivo (+EV).
                    - 🚫 Cero Consejos Financieros: Habla de probabilidades y análisis deportivo, no de dinero.

                    Estructura de Respuesta Obligatoria:
                    - Comienza SIEMPRE con la etiqueta [CONFIDENCE: XX] donde XX es un número del 1 al 100 representando tu certeza.
                    1. 🔮 **Predicción Maestra** (El resultado más probable).
                    2. 🧩 **Duelo Táctico Clave** (Análisis de Alineaciones/Matchups que decidirán el juego).
                    3. 💎 **Player Prop Oculto** (Una estadística individual con alto valor, ej: +25 Puntos LBJ).
                    4. ⚠️ **Factor X** (Riesgo o jugador sorpresa).

                    Idioma: Español Nativo Deportivo (Usa jerga: "Back-to-back", "Clean Sheet", "Touchdown", "Clutch"). SÉ IMPLACABLE.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile", // Updated model
            temperature: 0.6, // Slightly lower temp for more analytical consistency
            max_tokens: 1024,
        });

        return NextResponse.json({ content: completion.choices[0]?.message?.content || "No se pudo generar predicción." });

    } catch (error: any) {
        console.error("Groq API Error:", error);
        return NextResponse.json({
            content: `⚠️ Error Técnico: ${error.message}`
        }, { status: 500 });
    }
}
