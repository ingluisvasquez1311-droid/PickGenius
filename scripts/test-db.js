const { db } = require('../src/config/firebase');

async function testConnection() {
    console.log('Testing Firestore connection...');
    try {
        if (!db) {
            throw new Error('Database instance is null. Check firebase.js configuration.');
        }

        const testRef = db.collection('system').doc('connection_test');
        await testRef.set({
            status: 'connected',
            timestamp: new Date().toISOString(),
            checkedBy: 'Tirens Parleys AI'
        });

        console.log('✅ Connection successful! Wrote to Firestore.');

        const doc = await testRef.get();
        console.log('📄 Read back data:', doc.data());

    } catch (error) {
        console.error('❌ Connection failed:', error);
        process.exit(1);
    }
}

testConnection();
