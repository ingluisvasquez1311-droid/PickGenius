const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');
const fs = require('fs');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function audit() {
    const results = {
        stats: {},
        sample: null,
        error: null,
        timestamp: new Date().toISOString()
    };

    try {
        const snapshot = await db.collection('events').get();

        snapshot.forEach(doc => {
            const data = doc.data();
            const sport = data.sport || 'unknown';
            const status = data.status || 'unknown';

            if (!results.stats[sport]) results.stats[sport] = {};
            if (!results.stats[sport][status]) results.stats[sport][status] = 0;
            results.stats[sport][status]++;
        });

        if (snapshot.size > 0) {
            const data = snapshot.docs[0].data();
            results.sample = {
                id: snapshot.docs[0].id,
                sport: data.sport,
                status: data.status,
                startTime: data.startTime,
                home: data.homeTeam?.name,
                away: data.awayTeam?.name
            };
        }

    } catch (error) {
        results.error = error.message;
    } finally {
        fs.writeFileSync('backend/audit_results.json', JSON.stringify(results, null, 2));
        process.exit(0);
    }
}

audit();
