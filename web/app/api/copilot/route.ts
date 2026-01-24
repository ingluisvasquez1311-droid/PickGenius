import { NextRequest, NextResponse } from 'next/server';
import Groq from "groq-sdk";

// Helper for key rotation (reused logic for robustness)
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

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
        }

        const keys = getAllKeys();
        if (keys.length === 0) {
            return NextResponse.json({ error: "Server misconfiguration: No AI keys" }, { status: 500 });
        }

        const systemPrompt = {
            role: "system",
            content: `Eres "Genius Copilot", el asistente experto de la plataforma PickGenius.
            
            TU PERFIL:
            - Eres un analista deportivo profesional y matemático.
            - Tu tono es profesional, conciso y directo (Estilo "Terminal Financiera").
            - NO das consejos de vida, solo hablas de deportes, estadísticas, probabilidades y funcionamiento de la plataforma.
            - Si te preguntan por picks específicos, recuérdales que usen la herramienta "Picks Pro" o el "Buscador de SureBets".
            - HABLAS SIEMPRE EN ESPAÑOL.

            CONTEXTO DE LA APP:
            - PickGenius ofrece: Predicciones IA, Optimizador de Parleys, Buscador de Props, Calculadora Kelly, Detección de Arbitraje (SureBets).
            - Sistema de créditos "PGc" para operar sin riesgo real.
            
            FORMATO:
            - Respuestas cortas (max 2-3 oraciones a menos que pidan explicación detallada).
            - Usa formato Markdown simple (negritas para énfasis).`
        };

        const fullMessages = [systemPrompt, ...messages];

        // Retry Logic
        let lastError = null;
        for (const model of MODELS) {
            // Shuffle keys for simple load balancing
            const shuffledKeys = [...keys].sort(() => 0.5 - Math.random());

            for (const apiKey of shuffledKeys) {
                try {
                    const groq = new Groq({ apiKey });

                    const completion = await groq.chat.completions.create({
                        messages: fullMessages,
                        model: model,
                        temperature: 0.5,
                        max_tokens: 300,
                    });

                    const reply = completion.choices[0]?.message?.content;
                    return NextResponse.json({ content: reply });

                } catch (error: any) {
                    console.warn(`Copilot Warn: Key failed for ${model}`, error.message);
                    lastError = error;
                    // Continue to next key/model
                }
            }
        }

        throw lastError || new Error("All AI models failed");

    } catch (error: any) {
        console.error("Copilot API Error:", error);
        return NextResponse.json({ error: "AI Service Unavailable" }, { status: 500 });
    }
}
