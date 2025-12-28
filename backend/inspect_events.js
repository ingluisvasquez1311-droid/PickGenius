const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function inspect() {
    console.log('👀 INSPECCIONANDO MUESTRA DE EVENTOS...');
    const snapshot = await db.collection('events').limit(5).get();

    snapshot.forEach(doc => {
        console.log(`\nID: ${doc.id}`);
        console.log(JSON.stringify(doc.data(), null, 2));
    });

    process.exit(0);
}

inspect();
