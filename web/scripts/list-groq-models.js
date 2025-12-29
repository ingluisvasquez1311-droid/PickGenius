const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), 'web/.env.local') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const axios = require('axios');

async function listGroqModels() {
    const apiKeys = process.env.GROQ_API_KEYS || '';
    const singleKey = process.env.GROQ_API_KEY || '';
    const apiKey = singleKey || apiKeys.split(',')[0].trim();

    if (!apiKey) {
        console.error('❌ Error: No se encontró GROQ_API_KEY en web/.env.local');
        return;
    }

    console.log('🔍 Consultando arsenal de Groq...');

    try {
        const response = await axios.get('https://api.groq.com/openai/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        console.log('\n✅ MODELOS DISPONIBLES EN GROQ:');
        const models = response.data.data.sort((a, b) => a.id.localeCompare(b.id));
        models.forEach(m => {
            console.log(` - ${m.id}`);
        });

        console.log('\n📌 RECOMENDACIÓN:');
        console.log('Llama-3.3-70b-versatile es el actual FLAGSHIP para velocidad/inteligencia.');
        console.log('Si aparece 405b, ese es el más grande, pero suele ser más lento.');
    } catch (error) {
        console.error('❌ Error al listar modelos:', error.response?.data || error.message);
    }
}

listGroqModels();
