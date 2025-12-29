const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

async function diagnose() {
    console.log('🕒 FECHA DEL SISTEMA:', new Date().toISOString());
    console.log('🕒 HORA LOCAL:', new Date().toLocaleString());

    const jsonPath = path.resolve(process.cwd(), 'firebase-service-account.json');
    if (!fs.existsSync(jsonPath)) {
        console.error('❌ NO SE ENCONTRÓ firebase-service-account.json');
        return;
    }

    try {
        const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log('📝 Usando Proyecto:', serviceAccount.project_id);
        console.log('📧 Usando Email:', serviceAccount.client_email);

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id
            });
        }

        const db = admin.firestore();
        console.log('\n🔍 Verificando colecciones...');

        const checkCol = async (name) => {
            const snap = await db.collection(name).limit(1).get();
            console.log(` ✅ ${name}: ${snap.empty ? 'VACÍA' : 'OK (Tiene datos)'}`);
            if (!snap.empty) {
                const doc = snap.docs[0].data();
                const ts = doc.startTimestamp || doc.createdAt || doc.timestamp;
                if (ts) {
                    const d = (typeof ts === 'number') ? new Date(ts * 1000) : (ts.toDate ? ts.toDate() : new Date(ts));
                    console.log(`    🕒 Último dato detectado entorno a: ${d.toLocaleString()}`);
                }
            }
        };

        await checkCol('events');
        await checkCol('matches');
        await checkCol('predictions');

        console.log('\n🏆 DIAGNÓSTICO FINALIZADO CON ÉXITO');

    } catch (e) {
        console.error('\n❌ ERROR DE DIAGNÓSTICO:', e.message);
        if (e.message.includes('UNAUTHENTICATED')) {
            console.log('\n💡 CAUSA PROBABLE: Tu reloj está desincronizado o la llave es inválida en Google Cloud.');
        }
    }
}

diagnose();
