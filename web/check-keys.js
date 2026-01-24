require('dotenv').config({ path: '.env.local' });
const Groq = require("groq-sdk");

console.log("🔍 Diagnóstico de Claves Groq...");

const rawKeys = process.env.GROQ_API_KEYS || "";
// Intentamos separar por comas Y por saltos de línea, por si acaso
const keys = rawKeys.split(/[,;\n]+/).map(k => k.trim()).filter(k => k.startsWith('gsk_'));

console.log(`📋 Claves detectadas: ${keys.length}`);

if (keys.length === 0) {
    console.error("❌ No se encontraron claves válidas. Revisa el formato en .env.local");
    console.log("   Formato esperado: gsk_key1, gsk_key2, gsk_key3");
    process.exit(1);
}

// Probar cada clave rápidamente
async function checkKeys() {
    for (const [index, key] of keys.entries()) {
        const masked = key.substring(0, 8) + "...";
        process.stdout.write(`🔑 Probando clave [${index + 1}/${keys.length}] ${masked}: `);

        try {
            const groq = new Groq({ apiKey: key });
            await groq.chat.completions.create({
                messages: [{ role: "user", content: "hi" }],
                model: "llama-3.1-8b-instant",
                max_tokens: 1
            });
            console.log("✅ VIVA (Tiene saldo)");
        } catch (error) {
            if (error.status === 429) {
                console.log("❌ RATE LIMIT (Agotada)");
            } else if (error.status === 401) {
                console.log("❌ INVÁLIDA (Error Auth)");
            } else {
                console.log(`⚠️ Error: ${error.status || error.message}`);
            }
        }
    }
}

checkKeys();
