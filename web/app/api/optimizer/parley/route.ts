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
        const risk = searchParams.get('risk') || 'safe'; // safe, bold, bomb
        const sport = searchParams.get('sport') || 'all';

        let events = await getLiveEvents();

        // Filter by sport if needed
        if (sport !== 'all') {
            const filterMap: Record<string, string> = {
                'football': 'FOOTBALL',
                'basketball': 'BASKETBALL',
                'tennis': 'TENNIS',
                'nfl': 'AMERICAN_FOOTBALL',
                'baseball': 'BASEBALL'
            };
            const target = filterMap[sport];
            if (target) {
                events = events.filter((e: any) => e.sport === target);
            }
        }

        const groq = getGroqClient();

        const systemPrompt = `Eres el "Smart Parley Architect" de PickGenius. Tu misión es construir la apuesta combinada (parley) perfecta según el nivel de riesgo solicitado.
        
        NIVELES DE RIESGO:
        1. SAFE (Seguro): 2-3 picks de altísima probabilidad (confianza > 85%). Cuota total objetivo: 1.80 - 2.50.
        2. BOLD (Valiente): 3-5 picks con buen valor (confianza > 75%). Cuota total objetivo: 5.00 - 10.00.
        3. BOMB (Bomba): 6-10 picks con alto multiplicador. Cuota total objetivo: 25.00+. 

        REGLAS:
        - Selecciona solo entre los mejores picks disponibles en la data.
        - Asegúrate de que los equipos y mercados sean claros.
        - ESTRICTAMENTE responde en formato JSON.

        FORMATO DE RESPUESTA:
        {
            "riskLevel": "${risk}",
            "totalOdds": 5.45,
            "confidence": 82,
            "picks": [
                {
                    "match": "Lakers vs Celtics",
                    "market": "Lakers Gana (Moneyline)",
                    "odds": 1.90,
                    "reason": "Dominio histórico y rache actual de LeBron."
                }
            ],
            "expertAdvise": "Consejo pro sobre este parley."
        }`;

        const userPrompt = `Genera un parley de tipo ${risk.toUpperCase()} usando estos eventos: ${JSON.stringify(events.slice(0, 20))}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.4,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
        return NextResponse.json(result);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
