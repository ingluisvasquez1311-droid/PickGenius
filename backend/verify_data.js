const admin = require('firebase-admin');

// Inicializar
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.firestore();

async function verify() {
    console.log('🔍 VERIFICANDO DATOS EN FIREBASE...');

    try {
        // Contar Eventos
        const eventsSnap = await db.collection('events').count().get();
        console.log(`📊 Eventos en colección 'events': ${eventsSnap.data().count}`);

        // Contar Odds
        const oddsSnap = await db.collection('odds').count().get();
        console.log(`📊 Odds en colección 'odds': ${oddsSnap.data().count}`);

        // Último Log
        const logsSnap = await db.collection('sync_logs')
            .orderBy('timestamp', 'desc')
            .limit(1)
            .get();

        if (!logsSnap.empty) {
            const log = logsSnap.docs[0].data();
            console.log('\n📝 ÚLTIMO LOG DE SINCRONIZACIÓN:');
            console.log(JSON.stringify(log, null, 2));
        } else {
            console.log('\n⚠️ No se encontraron logs de sincronización');
        }

    } catch (error) {
        console.error('❌ Error verificando datos:', error);
    } finally {
        process.exit(0);
    }
}

verify();
