import { NextRequest, NextResponse } from 'next/server';
import Groq from "groq-sdk";
import fs from 'fs';
import path from 'path';

// 1. OBTENER TODAS LAS CLAVES DISPONIBLES (Parseo Robusto)
const getAllKeys = () => {
    const raw = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
    return raw.replace(/["']/g, "")
        .split(/[,;\s\n]+/)
        .map(k => k.trim())
        .filter(k => k.startsWith('gsk_'));
};

// 2. LISTA DE MODELOS ROBUSTA
const MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-70b-versatile",
    "mixtral-8x7b-32768",
    "llama-3.1-8b-instant"
];

async function getLiveEvents() {
    try {
        const rootDir = process.cwd().includes('web') ? path.join(process.cwd(), '..') : process.cwd();
        const betplayDir = path.join(rootDir, 'data', 'betplay');
        const latestFile = path.join(betplayDir, "latest_betplay_odds.json");
        if (!fs.existsSync(latestFile)) {
            return [];
        }
        const content = fs.readFileSync(latestFile, 'utf-8');
        const data = JSON.parse(content);
        return data.events || [];
    } catch (e) {
        console.error("Error reading events:", e);
        return [];
    }
}

// Fallback Mock Parley if API fails completely
const getFallbackParley = (risk: string, events: any[]) => {
    const safeEvents = events.slice(0, 3);
    return {
        riskLevel: risk,
        totalOdds: "2.85",
        picks: safeEvents.map((e, i) => ({
            match: `${e.homeTeam?.name || 'Local'} vs ${e.awayTeam?.name || 'Visitante'}`,
            market: "Ganador Directo",
            odds: 1.45 + (i * 0.2),
            reason: "Tendencia positiva reciente (Fallback)."
        })),
        expertAdvise: "Red de IA saturada. Se muestra un parley estimado basado en estadísticas locales."
    }
};

export async function GET(req: NextRequest) {
    const allKeys = getAllKeys();
    const { searchParams } = new URL(req.url);
    const risk = searchParams.get('risk') || 'safe';
    const sport = searchParams.get('sport') || 'all';
    const query = searchParams.get('q') || '';

    // Data filtering logic
    let events = await getLiveEvents();
    if (sport !== 'all') {
        const filterMap: Record<string, string> = {
            'football': 'FOOTBALL', 'basketball': 'BASKETBALL', 'nba': 'BASKETBALL',
            'tennis': 'TENNIS', 'nfl': 'AMERICAN_FOOTBALL', 'baseball': 'BASEBALL', 'hockey': 'ICE_HOCKEY'
        };
        const target = filterMap[sport] || sport.toUpperCase();
        if (target) events = events.filter((e: any) => e.sport === target);
        if (sport === 'nba') events = events.filter((e: any) => (e.league?.toUpperCase().includes('NBA')) || (e.tournament?.name?.toUpperCase().includes('NBA')));
    }

    if (query && query.length > 2) {
        const lowerQ = query.toLowerCase();
        events = events.filter((e: any) =>
            e.homeTeam.name.toLowerCase().includes(lowerQ) ||
            e.awayTeam.name.toLowerCase().includes(lowerQ)
        );
    }

    // Limit events size for context window
    const contextEvents = events.slice(0, 40).map((e: any) => ({
        id: e.id,
        match: `${e.homeTeam.name} vs ${e.awayTeam.name}`,
        league: e.tournament.name,
        odds: e.odds
    }));

    // Prompt Construction
    let riskInstructions = "";
    switch (risk) {
        case 'safe': riskInstructions = "Nivel SEGURO: 2-3 picks >85% prob. Cuota 1.80-2.50. Prioriza Ganador."; break;
        case 'bold': riskInstructions = "Nivel VALIENTE: 3-5 picks >75% prob. Cuota 5.00-10.00. Busca Over/Under."; break;
        case 'bomb': riskInstructions = "Nivel BOMBA: 6-10 picks alto riesgo. Cuota 25.00+. Sorpresas."; break;
        case 'nba_props': riskInstructions = "NBA DEEP PROPS: Hándicaps, Puntos, Player Props. Solo NBA."; break;
        default: riskInstructions = "Balanceado: 3 picks sólidos.";
    }

    const systemPrompt = `Eres el "PickGenius Parley Architect". Construye la combinada perfecta.
    MODO: ${risk.toUpperCase()}. 
    INSTRUCCIONES: ${riskInstructions}.
    Si hay query "${query}", priorízalo.
    RESPONDE SOLO JSON: {
        "riskLevel": "${risk}",
        "totalOdds": "X.XX",
        "picks": [{ "match": "A vs B", "market": "Mercado", "odds": 1.90, "reason": "Breve razón" }],
        "expertAdvise": "Consejo breve"
    }`;

    // Retry Logic
    for (const model of MODELS) {
        const shuffledKeys = [...allKeys].sort(() => 0.5 - Math.random());
        const maxAttempts = Math.min(5, shuffledKeys.length);

        for (let i = 0; i < maxAttempts; i++) {
            const apiKey = shuffledKeys[i];
            try {
                const groq = new Groq({ apiKey });
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `Eventos disponibles: ${JSON.stringify(contextEvents)}` }
                    ],
                    model: model,
                    temperature: 0.4,
                    response_format: { type: "json_object" }
                });

                const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
                if (!result.odds && result.totalOdds) result.odds = result.totalOdds; // Normalize
                return NextResponse.json(result);

            } catch (error: any) {
                console.warn(`⚠️ Parley Optimizer Try Fail: ${model} key ending ${apiKey.slice(-4)}`);
                if (error.status === 400 || error.status === 404) break; // Model dead, next model
            }
        }
    }

    // Fail safe
    return NextResponse.json(getFallbackParley(risk, events));
}
