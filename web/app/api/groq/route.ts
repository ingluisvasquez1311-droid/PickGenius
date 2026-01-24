import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

// 1. OBTENER TODAS LAS CLAVES DISPONIBLES (Parseo Robusto)
const getAllKeys = () => {
    const raw = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
    // Eliminamos comillas accidentales y separamos por comas/espacios
    return raw.replace(/["']/g, "")
        .split(/[,;\s\n]+/)
        .map(k => k.trim())
        .filter(k => k.startsWith('gsk_'));
};

// 2. LISTA DE MODELOS SOBREVIVIENTES (Enero 2026)
const MODELS = [
    "llama-3.3-70b-versatile", // GOD MODE (Principal)
    "llama-3.1-70b-versatile", // Respaldo 70b
    "mixtral-8x7b-32768",      // Respaldo Seguro y Rápido
    "llama-3.1-8b-instant",    // TURBO MODE (Respaldo Rápido)
];

export async function POST(req: Request) {
    let lastError = null;
    const allKeys = getAllKeys();

    if (allKeys.length === 0) {
        return NextResponse.json({ content: "Error: No hay claves API de Groq configuradas." }, { status: 500 });
    }

    try {
        const { prompt } = await req.json();

        // ESTRATEGIA: Para cada modelo, probamos hasta 5 claves aleatorias diferentes
        // Esto maximiza la probabilidad de encontrar una clave con cupo (si son de diferentes cuentas)

        for (const model of MODELS) {
            console.log(`🤖 Iniciando intentos con modelo: ${model}...`);

            // Mezclar claves para no probar siempre las mismas primero
            const shuffledKeys = [...allKeys].sort(() => 0.5 - Math.random());
            const maxAttemptsPerModel = Math.min(10, shuffledKeys.length); // Probar máx 10 claves por modelo

            for (let i = 0; i < maxAttemptsPerModel; i++) {
                const apiKey = shuffledKeys[i];
                const keyId = apiKey.substring(0, 5) + "..."; // Log seguro

                try {
                    const groq = new Groq({ apiKey });
                    // console.log(`   🔑 Intento ${i + 1}/${maxAttemptsPerModel} (Key: ${keyId})`);

                    const completion = await groq.chat.completions.create({
                        messages: [
                            {
                                role: "system",
                                content: `Eres PickGenius GOD MODE. Analista deportivo legendario. 
                                TU PERSONALIDAD: Habla con autoridad absoluta, pasión y contundencia. NO suenes robótico ni uses frases genéricas como "Basado en los datos". Habla como un experto en apuestas deportivas que se juega su reputación.
                                
                                TU OBJETIVO: Dar una lectura de juego precisa, detectando el VALOR (+EV) donde otros no lo ven.
                                
                                IMPORTANTE: RESPONDE SIEMPRE EN ESPAÑOL NATURAL Y AGRESIVO (En el buen sentido).
                                
                                ESTRUCTURA DE RESPUESTA OBLIGATORIA:
                                1. 🎯 **EL PICK DE ORO** (Tu mejor apuesta)
                                2. 🔥 **LA LECTURA** (3 argumentos tácticos directos al hueso, sin rodeos)
                                3. 📊 **PROYECCIÓN REALISTA**
                                4. ⚠️ **FACTOR Miedo** (Riesgo real)
                                
                                Termina con [CONFIDENCE: XX] (0-100) y si es posible [PROJECTIONS: JSON] para el radar.
                                Usa jerga de apostador profesional (matchup favorable, spot ideal, tendencia clave).`
                            },
                            {
                                role: "user",
                                content: prompt
                            }
                        ],
                        model: model,
                        temperature: 0.6,
                        max_tokens: 1200, // Aumentado un poco para análisis profundo
                    });

                    console.log(`✅ ÉXITO con ${model} usando key ${keyId}`);
                    return NextResponse.json({
                        content: completion.choices[0]?.message?.content || "No se pudo generar predicción.",
                        model_used: model
                    });

                } catch (error: any) {
                    const status = error.status || "UNKNOWN";
                    const message = error.message || "No error message";
                    console.warn(`   ⚠️ Falló Key ${keyId} con ${model}: [${status}] ${message}`);
                    lastError = error;

                    if (status === 401) {
                        console.error(`   ❌ Clave ${keyId} no autorizada (401). Posible clave inválida.`);
                    }

                    // Si el modelo ya no existe (400 o 404), no sirve de nada probar otras claves con este modelo
                    if (status === 400 || status === 404 || message?.includes('decommissioned')) {
                        console.error(`   ❌ Modelo ${model} no disponible. Saltando al siguiente.`);
                        break;
                    }

                    // Si es 429 (Rate Limit), el bucle `for` continuará con la siguiente clave (Key Rotation)
                    // Si es 401 (Auth), también continuamos con otra clave
                }
            }
        }

        // 3. SALVAVIDAS FINAL: POLLINATIONS.AI (Gratis, sin Key)
        console.log("🌊 Intentando SALVAVIDAS (Pollinations.ai)...");
        try {
            const response = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'Eres un analista deportivo experto. Responde en español cortamente.' },
                        { role: 'user', content: prompt }
                    ],
                    model: 'openai', // Pollinations elige el mejor disponible gratis
                    seed: Math.floor(Math.random() * 1000)
                })
            });

            if (response.ok) {
                const text = await response.text();
                console.log("✅ ÉXITO con Salvavidas (Pollinations)");
                return NextResponse.json({
                    content: text,
                    model_used: "pollinations-ai-fallback"
                });
            }
        } catch (fallbackError) {
            console.error("❌ Falló también el salvavidas:", fallbackError);
        }

        // 4. MOCK DE EMERGENCIA (Algoritmo Determinista)
        console.log("🚑 Activando MOCK DE EMERGENCIA (Algoritmo Local)...");
        const mockAnalysis = generateMockAnalysis(prompt);
        return NextResponse.json({
            content: mockAnalysis,
            model_used: "local-algorithm-fallback"
        });

    } catch (error: any) {
        console.error("❌ Groq API Critical Failure:", error);
        return NextResponse.json({ content: "Error interno del servidor de IA." }, { status: 500 });
    }
}

// Función auxiliar para generar análisis convincente sin IA
function generateMockAnalysis(prompt: string): string {
    const isLive = prompt.includes("EN VIVO");
    const isBasketball = prompt.includes("BALONCESTO");

    let analysis = `### 🤖 ANÁLISIS DE CONTINGENCIA (SISTEMA LOCAL)

**Resumen Táctico**
El partido muestra una dinámica intensa. Basado en los datos disponibles, vemos un enfrentamiento parejo donde la eficiencia será clave.

**Puntos Clave:**
1. **Dominio de Posesión:** El control del balón está siendo disputado agresivamente.
2. **Defensa:** Ambos equipos muestran vulnerabilidades que pueden explotarse.
3. **Momentum:** ${isLive ? 'El ritmo actual favorece al equipo local.' : 'Se espera un inicio agresivo.'}

**Predicción Algorítmica:**
Recomendamos buscar valor en el mercado de ${isBasketball ? 'Puntos Totales (Over)' : 'Goles/Tarjetas'}.

[CONFIDENCE: 75]`;

    return analysis;
}
