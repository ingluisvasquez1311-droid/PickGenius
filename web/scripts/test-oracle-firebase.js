const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), 'web/.env.local') });
const admin = require('firebase-admin');
const axios = require('axios');
const fs = require('fs');

function log(msg) {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] ${msg}\n`;
    process.stdout.write(msg + '\n'); // Usar stdout directamente para evitar recursión
    fs.appendFileSync('oracle_debug.log', formatted);
}

async function runRealTest() {
    try {
        fs.writeFileSync('oracle_debug.log', ''); // Reset log
        log('🚀 INICIANDO DIAGNÓSTICO MAESTRO DEL ORÁCULO 🚀');

        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKeyRaw = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || process.env.FIREBASE_PRIVATE_KEY;

        if (!projectId || !clientEmail || !privateKeyRaw) {
            throw new Error('Faltan variables críticas de Firebase en .env.local');
        }

        if (admin.apps.length === 0) {
            const jsonPath = path.resolve(process.cwd(), 'firebase-service-account.json');
            if (fs.existsSync(jsonPath)) {
                log('📄 Cargando directamente desde archivo JSON...');
                const cert = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                admin.initializeApp({
                    credential: admin.credential.cert(cert),
                    projectId: cert.project_id
                });
            } else {
                log('🔑 Usando variables de entorno...');
                // Limpieza de llave
                let privateKey = privateKeyRaw.replace(/\\n/g, '\n').trim();
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey
                    }),
                    projectId
                });
            }
        }

        const db = admin.firestore();
        log('✅ Firebase Admin Inicializado');

        log('\n2️⃣ Verificando datos en Firestore...');
        const collections = ['events', 'matches', 'predictions'];
        for (const col of collections) {
            const snap = await db.collection(col).limit(1).get();
            log(` 📊 Colección "${col}": ${snap.empty ? 'VACÍA ❌' : 'TIENE DATOS ✅'}`);
        }

        // Intentar con startTime (que vimos en el navegador)
        let eventsSnap = await db.collection('events').orderBy('startTime', 'desc').limit(1).get();

        if (eventsSnap.empty) {
            log('⚠️ No se encontró startTime, buscando por ID o cualquier documento...');
            eventsSnap = await db.collection('events').limit(1).get();
        }

        if (eventsSnap.empty) {
            throw new Error('No se encontraron eventos en la colección "events".');
        }

        const event = eventsSnap.docs[0].data();
        const home = event.homeTeam?.name || event.homeTeam || 'Local';
        const away = event.awayTeam?.name || event.awayTeam || 'Visitante';

        // Handle Firestore Timestamp or number
        const ts = event.startTime || event.startTimestamp;
        const date = ts ? (ts.toDate ? ts.toDate().toLocaleString() : new Date(ts * 1000).toLocaleString()) : 'Desconocida';

        log(`\n🏆 PARTIDO ELEGIDO: ${home} vs ${away}`);
        log(`📅 FECHA: ${date}`);

        log('\n3️⃣ Consultando al Oráculo Supremo (GPT-OSS 120B)...');
        const apiKey = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '').split(',')[0].trim();

        const prompt = `ERES PICKGENIUS ORACLE (EL ORÁCULO). ANALIZA ${home} vs ${away}. RESPONDE JSON: {winner, confidence, reasoning, bettingTip}`;

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'openai/gpt-oss-120b',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                response_format: { type: 'json_object' }
            },
            { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
        ).catch(async () => {
            log('⚠️ Usando Llama 3.3 como respaldo...');
            return await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    response_format: { type: 'json_object' }
                },
                { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
            );
        });

        log('\n✅ PREDICCIÓN FINALIZADA:');
        log(JSON.stringify(JSON.parse(response.data.choices[0].message.content), null, 2));

    } catch (error) {
        log(`\n❌ ERROR: ${error.message}`);
    }
}

runRealTest();
