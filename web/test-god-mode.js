// Test script "God Mode"
require('dotenv').config({ path: '.env.local' });
const Groq = require("groq-sdk");

console.log("🚀 Iniciando prueba de GOD MODE...");

const allKeys = process.env.GROQ_API_KEYS;
if (!allKeys) {
    console.error("❌ No se encontraron claves en .env.local");
    process.exit(1);
}

const keys = allKeys.split(',').map(k => k.trim());
const apiKey = keys[Math.floor(Math.random() * keys.length)];
console.log(`🔑 Usando clave aleatoria (total: ${keys.length}):`, apiKey.substring(0, 10) + "...");

const groq = new Groq({ apiKey });

// Modelos a probar en orden
const MODELS = [
    "deepseek-r1-distill-llama-70b",
    "llama-3.3-70b-versatile",
    "llama-3.1-70b-versatile",
    "mixtral-8x7b-32768"
];

async function testGodMode() {
    for (const model of MODELS) {
        console.log(`\n⚔️  Probando modelo: ${model}...`);
        try {
            const start = Date.now();
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: "Responde solo con una palabra: 'IMPARABLE'" }],
                model: model,
                max_tokens: 10,
            });
            const duration = Date.now() - start;

            console.log(`✅ ÉXITO con ${model} en ${duration}ms`);
            console.log(`🤖 Respuesta: "${completion.choices[0]?.message?.content}"`);
            return; // Éxito, terminamos
        } catch (error) {
            console.warn(`⚠️  Fallo con ${model}: ${error.message}`);
            if (error.status === 404) console.warn("   (El modelo no existe o no tienes acceso)");
            if (error.status === 429) console.warn("   (Rate limited - Demasiadas peticiones)");
        }
    }
    console.error("\n❌ TODOS LOS MODELOS FALLARON. Revisa tus claves o conexión.");
}

testGodMode();
