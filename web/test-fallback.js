require('dotenv').config({ path: '.env.local' });
const Groq = require("groq-sdk");

console.log("🚀 Probando RESPALDO (Turbo Mode)...");

const rawKeys = process.env.GROQ_API_KEYS || "";
const keys = rawKeys.split(/[,;\s\n]+/).map(k => k.trim()).filter(k => k.startsWith('gsk_'));

if (keys.length === 0) {
    console.error("❌ Sin claves.");
    process.exit(1);
}

// Usar una clave al azar
const apiKey = keys[Math.floor(Math.random() * keys.length)];
console.log(`🔑 Usando clave: ${apiKey.substring(0, 10)}...`);

const groq = new Groq({ apiKey });

async function testBackup() {
    try {
        console.log("📡 Conectando con llama-3.1-8b-instant...");
        const start = Date.now();

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Dime 'SISTEMA OPERATIVO' si me lees." }],
            model: "llama-3.1-8b-instant", // Forzamos el modelo rápido
            max_tokens: 10,
        });

        const duration = Date.now() - start;
        console.log(`✅ ¡ÉXITO! Respaldo funcionando en ${duration}ms`);
        console.log(`🤖 Respuesta: "${completion.choices[0]?.message?.content}"`);

    } catch (error) {
        console.error(`❌ El respaldo TAMBIÉN falló: ${error.status || error.message}`);
        if (error.status === 429) console.error("   (Rate Limit Global alcanzado en esta cuenta)");
    }
}

testBackup();
