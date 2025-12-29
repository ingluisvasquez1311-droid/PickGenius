const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), 'web/.env.local') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const axios = require('axios');

async function testGemini() {
    const apiKeys = process.env.GEMINI_API_KEYS || '';
    const singleKey = process.env.GEMINI_API_KEY || '';
    const apiKey = singleKey || apiKeys.split(',')[0].trim();

    if (!apiKey) {
        console.error('❌ Error: No se encontró GEMINI_API_KEY en web/.env.local');
        return;
    }

    console.log('🔍 Listando modelos disponibles para tu llave API...');

    try {
        // Primero listamos para ver qué modelos tienes activos
        const listResponse = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        const models = listResponse.data.models || [];
        console.log('\n✅ MODELOS ENCONTRADOS:');
        models.forEach(m => console.log(` - ${m.name} (vía ${m.supportedGenerationMethods.join(', ')})`));

        // Intentar una predicción con el primer modelo de la serie 1.5 que encontremos
        const targetModel = models.find(m => m.name.includes('gemini-1.5-flash'))?.name
            || models.find(m => m.name.includes('gemini-1.5-pro'))?.name
            || 'models/gemini-pro';

        console.log(`\n🔮 Probando predicción con: ${targetModel}...`);

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${apiKey}`,
            {
                contents: [{ role: 'user', parts: [{ text: 'ERES PICKGENIUS ORACLE. Hola!' }] }],
                generationConfig: { temperature: 0.7 }
            }
        );

        console.log('✅ ÉXITO: El modelo respondió correctamente.');
    } catch (error) {
        console.error('❌ Error en el diagnóstico:', error.response?.data || error.message);
    }
}

testGemini();
