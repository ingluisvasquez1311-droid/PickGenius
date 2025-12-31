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
        const { strategy, sport, matches, props } = await req.json();
        const groq = getGroqClient();

        console.log(`Generando Parley Optimizado (${strategy}) para ${sport}`);

        const systemPrompt = `Eres el PickGenius Parley Optimizer. Tu objetivo es crear la apuesta combinada (Parley) más inteligente basándote en la estrategia seleccionada.
        
        ESTRATEGIA: ${strategy}
        
        Reglas de Oro:
        1. El parley debe tener entre 2 y 3 piernas para maximizar el valor/riesgo.
        2. Si la estrategia es 'correlation', busca un resultado de partido que potencie un prop de jugador (ej: Victoria Madrid + Gana Vinicius).
        3. Si la estrategia es 'streaks', prioriza equipos/jugadores con rachas positivas.
        4. Si la estrategia es 'hedge', busca un equilibrio entre un favorito claro y un mercado de valor.
        
        Responde ÚNICAMENTE en formato JSON válido con esta estructura:
        {
            "title": "Nombre del Parley (Ej: El Tridente de Madrid)",
            "odds": "Cuota Total Proyectada",
            "legs": [
                { "event": "Partido", "selection": "Mercado", "reason": "Breve por qué" }
            ],
            "confidence": 85,
            "aiVerdict": "Análisis final del porqué esta es la mejor combinación hoy."
        }`;

        const userPrompt = `Datos actuales:
        PARTIDOS: ${JSON.stringify(matches)}
        PROPS: ${JSON.stringify(props)}
        
        Genera el mejor parley para hoy.`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.6,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Optimizer API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
