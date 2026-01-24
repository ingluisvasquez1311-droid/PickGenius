// Test script para verificar Groq API
const fs = require('fs');
const path = require('path');
const Groq = require("groq-sdk");

console.log("📂 Buscando .env.local en:", process.cwd());

let envContent = '';
try {
    envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
} catch (e) {
    console.error("❌ No se pudo leer .env.local:", e.message);
    process.exit(1);
}

// Simple manual parse for GROQ_API_KEYS
const match = envContent.match(/GROQ_API_KEYS="?([^"\n]+)"?/);
const allKeys = match ? match[1] : null;

if (!allKeys) {
    console.error("❌ No se encontró GROQ_API_KEYS dentro de .env.local");
    process.exit(1);
}

const keys = allKeys.split(',').map(k => k.trim());
console.log(`✅ Se encontraron ${keys.length} claves.`);

// Pick a random key to test
const randomKey = keys[Math.floor(Math.random() * keys.length)];
console.log("🔑 Probando clave aleatoria:", randomKey.substring(0, 10) + "...");

const groq = new Groq({ apiKey: randomKey });

async function testGroq() {
    try {
        console.log("📡 Enviando solicitud a Groq (llama-3.1-70b-versatile)...");
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Responde solo con: OK" }],
            model: "llama-3.1-70b-versatile",
            max_tokens: 10,
        });

        console.log("✅ Groq responde correctamente!");
        console.log("🤖 Respuesta:", completion.choices[0]?.message?.content);
    } catch (error) {
        console.error("❌ Error de Groq:", error.message);
        if (error.status) console.error("Status:", error.status);
    }
}

testGroq();
