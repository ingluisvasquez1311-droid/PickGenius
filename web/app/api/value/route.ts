import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Groq from "groq-sdk";

const getGroqClient = () => {
    const keys = (process.env.GROQ_API_KEYS || "").split(",").map(k => k.trim()).filter(Boolean);
    if (keys.length === 0) throw new Error("No Groq API keys found");
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return new Groq({ apiKey: randomKey });
};

async function getLatestBetPlayOdds(sportFilter: string) {
    try {
        const betplayDir = path.join(process.cwd(), '..', 'data', 'betplay');
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

        const groq = getGroqClient();
        const betplayEvents = await getLatestBetPlayOdds(sport);

        if (betplayEvents.length === 0) {
            return NextResponse.json({ valueBets: [] });
        }

        // Tomar una muestra representativa (ej: los primeros 15 eventos con cuotas)
        const sampleEvents = betplayEvents.slice(0, 15);

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

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || '{"valueBets": []}');
        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Value API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
