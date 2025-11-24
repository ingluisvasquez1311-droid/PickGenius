const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

try {
    const serviceAccountPath = path.join(__dirname, '../../firebase-credentials.json');

    // Check if file exists
    if (!fs.existsSync(serviceAccountPath)) {
        console.warn('⚠️ WARNING: firebase-credentials.json not found. Firebase features will not work.');
    } else {
        const serviceAccount = require(serviceAccountPath);

        // Check if it's still the placeholder
        if (serviceAccount.project_id === 'tu-proyecto-id') {
            console.warn('⚠️ WARNING: firebase-credentials.json is using placeholder data. Please update it with your real Google Cloud key.');
        } else {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('✅ Firebase initialized successfully');
        }
    }
} catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
}

const db = admin.apps.length ? admin.firestore() : null;

module.exports = { admin, db };
