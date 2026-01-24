import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Groq from "groq-sdk";

// 1. OBTENER TODAS LAS CLAVES DISPONIBLES (Parseo Robusto)
const getAllKeys = () => {
    const raw = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
    return raw.replace(/["']/g, "")
        .split(/[,;\s\n]+/)
        .map(k => k.trim())
        .filter(k => k.startsWith('gsk_'));
};

const MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-70b-versatile",
    "mixtral-8x7b-32768"
];

async function getLatestBetPlayOdds(sportFilter: string) {
    try {
        const rootDir = process.cwd().includes('web') ? path.join(process.cwd(), '..') : process.cwd();
        const betplayDir = path.join(rootDir, 'data', 'betplay');
        const latestFile = path.join(betplayDir, "latest_betplay_odds.json");

        if (!fs.existsSync(latestFile)) return [];

        const content = fs.readFileSync(latestFile, 'utf-8');
        const data = JSON.parse(content);
        let events = data.events || [];

        if (sportFilter && sportFilter !== 'all') {
            const filterMap: Record<string, string> = {
                'football': 'FOOTBALL',
                'basketball': 'BASKETBALL',
                'tennis': 'TENNIS'
            };
            const target = filterMap[sportFilter];
            if (target) {
                events = events.filter((e: any) => e.sport === target);
            }
        }

        return events;
    } catch (error) {
        console.error("Error reading BetPlay odds:", error);
        return [];
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sport = searchParams.get('sport') || 'all';
        const allKeys = getAllKeys();

        const betplayEvents = await getLatestBetPlayOdds(sport);

        if (betplayEvents.length === 0) {
            return NextResponse.json({ valueBets: [] });
        }

        // Tomar una muestra representativa (ej: los primeros 25 eventos con cuotas)
        const sampleEvents = betplayEvents.slice(0, 25);

        const systemPrompt = `Eres el Motor "Value Hunter Pro" de PickGenius. Tu única función es identificar errores matemáticos en las cuotas de las casas de apuestas.

        CONCEPTOS CLAVE:
        - Probabilidad Implícita = (1 / Cuota) * 100.
        - Probabilidad Real = La probabilidad que TÚ estimas basada en tu conocimiento deportivo PRO de ${sport === 'all' ? 'varios deportes' : sport}.
        - Edge (Ventaja) = Probabilidad Real - Probabilidad Implícita.
        - Kelly Stake = Una sugerencia de gestión de bankroll (1-5 unidades) basada en la confianza.

        TU TAREA:
        1. Analiza la lista de eventos y cuotas proporcionada.
        2. Encuentra las mejores oportunidades (máximo 12) donde tu Probabilidad Real sea MAYOR que la Implícita.
        3. Sé estricto. Si la cuota ya está bien ajustada, no la selecciones. Busca el VALOR.
        4. Si es Basketball, busca props de jugadores si aparecen, o mercados de puntos totales.
        5. Si es Tennis, busca mercados de sets o games.

        RESPONDE ÚNICAMENTE CON ESTE FORMATO JSON:
        {
            "valueBets": [
                {
                    "match": "Equipo A vs Equipo B o Jugador X",
                    "league": "Liga",
                    "market": "Mercado (ej: Gana Local, Over 2.5 Goles, Mas de 24.5 Puntos)",
                    "odds": 2.50,
                    "impliedProb": "40%",
                    "realProb": "55%", 
                    "edge": "+15%",
                    "kellyStake": "3u",
                    "verdict": "MUY ALTO | ALTO | MEDIO",
                    "reasoning": "Breve análisis técnico profesional de 1 línea en español."
                }
            ]
        }`;

        const userPrompt = `Analiza estos eventos reales de Kambi/BetPlay para ${sport.toUpperCase()} y extrae el valor matemático oculto. DATA: ${JSON.stringify(sampleEvents)}`;

        // Retry Logic
        for (const model of MODELS) {
            const shuffledKeys = [...allKeys].sort(() => 0.5 - Math.random());
            const maxAttempts = Math.min(3, shuffledKeys.length);

            for (let i = 0; i < maxAttempts; i++) {
                const apiKey = shuffledKeys[i];
                try {
                    const groq = new Groq({ apiKey });
                    const completion = await groq.chat.completions.create({
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: userPrompt }
                        ],
                        model: model,
                        temperature: 0.3,
                        response_format: { type: "json_object" }
                    });

                    const result = JSON.parse(completion.choices[0]?.message?.content || '{"valueBets": []}');
                    return NextResponse.json(result);

                } catch (error: any) {
                    // Try next
                    console.warn(`Value API Warn: ${model} failed, trying next.`);
                }
            }
        }

        throw new Error("All models failed for Value Bets");

    } catch (error: any) {
        console.error("Value API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
