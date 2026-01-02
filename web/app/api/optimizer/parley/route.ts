import { NextRequest, NextResponse } from 'next/server';
import Groq from "groq-sdk";
import fs from 'fs';
import path from 'path';

const getGroqClient = () => {
    const keys = (process.env.GROQ_API_KEYS || "").split(",").map(k => k.trim()).filter(Boolean);
    if (keys.length === 0) throw new Error("No Groq API keys found");
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return new Groq({ apiKey: randomKey });
};

async function getLiveEvents() {
    try {
        const rootDir = process.cwd().includes('web') ? path.join(process.cwd(), '..') : process.cwd();
        const betplayDir = path.join(rootDir, 'data', 'betplay');
        const latestFile = path.join(betplayDir, "latest_betplay_odds.json");
        if (!fs.existsSync(latestFile)) {
            console.error("Latest odds file not found at:", latestFile);
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

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const risk = searchParams.get('risk') || 'safe'; // safe, bold, bomb, nba_props
        const sport = searchParams.get('sport') || 'all';
        const query = searchParams.get('q') || ''; // Search term

        let events = await getLiveEvents();

        // 1. Filter by Sport
        if (sport !== 'all') {
            const filterMap: Record<string, string> = {
                'football': 'FOOTBALL',
                'basketball': 'BASKETBALL',
                'nba': 'BASKETBALL',
                'tennis': 'TENNIS',
                'nfl': 'AMERICAN_FOOTBALL',
                'baseball': 'BASEBALL',
                'hockey': 'ICE_HOCKEY'
            };
            const target = filterMap[sport] || sport.toUpperCase();
            if (target) {
                events = events.filter((e: any) => e.sport === target);
            }

            // EXTRA: If NBA is selected, filter strictly by league/tournament name
            if (sport === 'nba') {
                events = events.filter((e: any) =>
                    (e.league?.toUpperCase().includes('NBA')) ||
                    (e.tournament?.name?.toUpperCase().includes('NBA'))
                );
            }
        }

        // 2. Filter by Search Query
        if (query && query.length > 2) {
            const lowerQ = query.toLowerCase();
            events = events.filter((e: any) =>
                e.homeTeam.name.toLowerCase().includes(lowerQ) ||
                e.awayTeam.name.toLowerCase().includes(lowerQ) ||
                e.tournament.name.toLowerCase().includes(lowerQ)
            );
        }

        const groq = getGroqClient();

        let riskInstructions = "";
        let purpose = "";

        // Customize Prompt based on Risk/Mode
        switch (risk) {
            case 'safe':
                riskInstructions = "Nivel SEGURO: 2-3 picks de altísima probabilidad (>85%). Cuota total 1.80-2.50. Prioriza Ganador (BetPlay) o Doble Oportunidad.";
                purpose = "Construir banca sin riesgo.";
                break;
            case 'bold':
                riskInstructions = "Nivel VALIENTE: 3-5 picks de valor matemático (>75%). Cuota total 5.00-10.00. Busca Totales (Over/Under) ajustados de BetPlay.";
                purpose = "Equilibrio riesgo/recompensa.";
                break;
            case 'bomb':
                riskInstructions = "Nivel BOMBA: 6-10 picks de alto riesgo. Cuota total 25.00+. Busca sorpresas o cuotas altas en el mercado BetPlay.";
                purpose = "Loteria deportiva inteligente.";
                break;
            case 'nba_props':
                riskInstructions = "MODO NBA DEEP PROPS: Concéntrate EXCLUSIVAMENTE en mercados de la NBA: Hándicap BetPlay, Totales de Puntos, Ganador 1ra Mitad, y Player Props (Puntos, Asistencias, Rebotes). Filtra solo juegos de las próximas 24 horas.";
                purpose = "Análisis profundo de matchups de la NBA y métricas avanzadas.";
                break;
            default:
                riskInstructions = "Balanceado: 3 picks sólidos de BetPlay.";
        }

        const systemPrompt = `Eres el "Smart Parley Architect" de PickGenius. Tu misión es construir la apuesta combinada (parley) perfecta usando exclusivamente cuotas de BetPlay.
        
        MODO ACTUAL: ${risk.toUpperCase()}
        OBJETIVO: ${purpose}
        INSTRUCCIONES ESPECÍFICAS: ${riskInstructions}

        REGLAS CRÍTICAS:
        1. HORIZONTE 24H: Solo selecciona eventos que ocurran EN VIVO ahora mismo o en las PRÓXIMAS 24 HORAS. Descarta juegos lejanos.
        2. TERMINOLOGÍA BETPLAY: No uses términos técnicos como "Moneyline". Usa "Ganador (BetPlay)", "Total de Puntos/Goles" o "Hándicap BetPlay".
        3. NBA EXCLUSIVA: Si el deporte es NBA, no mezcles con otras ligas de baloncesto. Solo NBA Pro.
        4. Si hay un término de búsqueda "${query}", prioriza equipos que coincidan.
        5. ESTRICTAMENTE responde en formato JSON.

        FORMATO DE RESPUESTA JSON:
        {
            "riskLevel": "${risk}",
            "totalOdds": "5.45",
            "picks": [
                {
                    "match": "Lakers vs Celtics",
                    "market": "Lakers a Ganar (BetPlay)",
                    "odds": 1.90,
                    "reason": "Análisis breve del por qué basado en rendimiento reciente."
                }
            ],
            "expertAdvise": "Consejo breve y profesional para maximizar tu banca."
        }`;

        const userPrompt = `Genera un parley óptimo con estos eventos disponibles: ${JSON.stringify(events.slice(0, 30))}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || '{}');

        // Fallback for missing odds in AI response
        if (!result.odds && result.totalOdds) result.odds = result.totalOdds;

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Optimizer Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
