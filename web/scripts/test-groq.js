const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), 'web/.env.local') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const axios = require('axios');

async function testGroq() {
    const apiKeys = process.env.GROQ_API_KEYS || '';
    const singleKey = process.env.GROQ_API_KEY || '';
    const apiKey = singleKey || apiKeys.split(',')[0].trim();

    if (!apiKey) {
        console.error('❌ Error: No se encontró GROQ_API_KEY en web/.env.local');
        return;
    }

    console.log('🧠 Invocando al Oráculo Groq (Llama 3.3 70B)...');

    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'user', content: 'ERES PICKGENIUS ORACLE. Genera una predicción deportiva ficticia para Fútbol: Real Madrid vs Barcelona. Responde ÚNICAMENTE en JSON con winner, confidence, reasoning y bettingTip.' }
                ],
                temperature: 0.7,
                response_format: { type: 'json_object' }
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('\n✅ ÉXITO: El Oráculo respondió correctamente:');
        console.log(JSON.stringify(response.data.choices[0].message.content, null, 2));
    } catch (error) {
        console.error('❌ Error en la prueba:', error.response?.data || error.message);
    }
}

testGroq();
