import { NextRequest, NextResponse } from 'next/server';
import Groq from "groq-sdk";
import fs from 'fs';
import path from 'path';

// 1. Key Extraction
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

// Helper to get events
async function getLiveEvents(sport: string) {
    try {
        const rootDir = process.cwd().includes('web') ? path.join(process.cwd(), '..') : process.cwd();
        const betplayDir = path.join(rootDir, 'data', 'betplay');
        const latestFile = path.join(betplayDir, "latest_betplay_odds.json");

        if (!fs.existsSync(latestFile)) return [];

        const content = fs.readFileSync(latestFile, 'utf-8');
        const data = JSON.parse(content);
        let events = data.events || [];

        // Filter by sport
        if (sport !== 'all') {
            const filterMap: Record<string, string> = {
                'football': 'FOOTBALL', 'basketball': 'BASKETBALL', 'nba': 'BASKETBALL',
                'tennis': 'TENNIS', 'nfl': 'AMERICAN_FOOTBALL', 'baseball': 'BASEBALL', 'hockey': 'ICE_HOCKEY'
            };
            const target = filterMap[sport] || sport.toUpperCase();
            if (target) events = events.filter((e: any) => e.sport === target);
            if (sport === 'nba') events = events.filter((e: any) => (e.league?.toUpperCase().includes('NBA')) || (e.tournament?.name?.toUpperCase().includes('NBA')));
        }

        return events.slice(0, 15); // Limit to top 15 upcoming/live for AI analysis
    } catch (e) {
        console.error("Error reading events for props:", e);
        return [];
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sport = searchParams.get('sport') || 'basketball';
    const allKeys = getAllKeys();

    if (allKeys.length === 0) {
        return NextResponse.json({ error: "No API keys" }, { status: 500 });
    }

    try {
        const events = await getLiveEvents(sport);

        // If no events, return empty or fallback
        if (events.length === 0) {
            return NextResponse.json({ picks: [] });
        }

        const eventsContext = events.map((e: any) => ({
            match: `${e.homeTeam.name} vs ${e.awayTeam.name}`,
            league: e.tournament.name,
            id: e.homeTeam.id // using home team id as proxy for image lookup later if needed
        }));

        const systemPrompt = `Eres el "Player Props Hunter" de PickGenius. Tu trabajo es identificar las 3-6 mejores oportunidades (props) de jugadores para los siguientes partidos.
        
        DEPORTE: ${sport.toUpperCase()}
        
        INSTRUCCIONES:
        1. Analiza los matchups.
        2. Selecciona jugadores ESTRELLA (ej. LeBron, Curry, Mbappé, Haaland) si están en los partidos. Si no, inventa props plausibles para los equipos listados.
        3. Genera una proyección realista basada en tu conocimiento experto.
        4. RESPONDE SOLO JSON.

        FORMATO JSON REQUERIDO:
        {
            "picks": [
                {
                    "id": 12345, // ID ficticio o real si lo conoces, usa IDs comunes de SportsData
                    "player": "Nombre Jugador",
                    "team": "Equipo",
                    "prop": "Over 24.5 Puntos",
                    "prob": "85%",
                    "odds": 1.85,
                    "reason": "Defensa rival permite muchos puntos en la pintura."
                }
            ]
        }
        
        NOTA: Para los IDs, intenta usar IDs reales si los conoces (ej. LeBron=3455). Si no, usa IDs aleatorios pero consistentes.
        `;

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
                            { role: "user", content: `Partidos disponibles: ${JSON.stringify(eventsContext)}` }
                        ],
                        model: model,
                        temperature: 0.4,
                        response_format: { type: "json_object" }
                    });

                    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
                    return NextResponse.json(result);

                } catch (error: any) {
                    // Try next key/model
                }
            }
        }

        throw new Error("All models failed");

    } catch (error) {
        console.error("Props AI Error:", error);
        return NextResponse.json({
            picks: [],
            error: "Could not generate props"
        });
    }
}
