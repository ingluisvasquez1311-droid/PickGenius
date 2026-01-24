require('dotenv').config({ path: '.env.local' });
const Groq = require("groq-sdk");

console.log("⚡ VERIFICACIÓN DE ESTADO: MODO DIOS (Llama 3.3 70B) ⚡");

// 1. Obtener claves (lógica robusta)
const raw = process.env.GROQ_API_KEYS || "";
const keys = raw.split(/[,;\s\n]+/).map(k => k.trim()).filter(k => k.startsWith('gsk_'));

if (keys.length === 0) {
    console.error("❌ ERROR: No se encontraron claves API en .env.local");
    process.exit(1);
}

console.log(`🔑 Se encontraron ${keys.length} claves disponibles.`);

// Usar una clave aleatoria para equilibrar carga
const apiKey = keys[Math.floor(Math.random() * keys.length)];
const maskedKey = apiKey.substring(0, 8) + "...";

console.log(`🤖 Intentando conectar con Llama 3.3 70B usando ${maskedKey}`);

const groq = new Groq({ apiKey });

async function testGodMode() {
    try {
        const start = Date.now();
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Eres una IA avanzada. Responde con una sola frase épica confirmando que estás operativa."
                },
                {
                    role: "user",
                    content: "Estado del sistema."
                }
            ],
            model: "llama-3.3-70b-versatile", // EL MODELO POTENTE
            temperature: 0.7,
            max_tokens: 100
        });

        const duration = Date.now() - start;
        console.log("\n✅ ¡ÉXITO! EL MODO DIOS ESTÁ OPERATIVO.");
        console.log(`⏱️ Tiempo de respuesta: ${duration}ms`);
        console.log(`📝 Respuesta: "${completion.choices[0]?.message?.content}"`);
        console.log("\n🚀 Conclusión: Las APIs se han desbloqueado y el sistema está listo.");

    } catch (error) {
        console.error("\n❌ FALLO EN MODO DIOS:");
        console.error(`   Error: ${error.status || error.message}`);

        if (error.status === 429) {
            console.error("   ⚠️ CAUSA: Límite de cuota (Rate Limit) todavía activo.");
            console.error("      Nota: Los límites suelen reiniciarse a las 00:00 UTC. Verifica tu zona horaria.");
        } else if (error.status === 400 || error.status === 404) {
            console.error("   ⚠️ CAUSA: Modelo no encontrado o deprecado.");
        }
    }
}

testGodMode();
