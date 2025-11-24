const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { db } = require('../config/firebase');

class DataService {
    constructor() {
        this.dataPath = path.join(__dirname, '../../data');
    }

    async loadNBAData(year = '2023-24') {
        try {
            const nbaDir = path.join(__dirname, '../../data/nba');
            const files = fs.readdirSync(nbaDir).filter(f => f.endsWith('.csv'));

            const data = {};

            for (const file of files) {
                const filePath = path.join(nbaDir, file);
                const fileName = file.replace('.csv', '');

                console.log(`📅 Loading ${file} (filtering for ${year || 'all years'})...`);

                const rows = await this.loadCSV(filePath, year);
                data[fileName] = rows;

                console.log(`✅ Loaded ${rows.length} rows from ${file}`);
            }

            return data;
        } catch (error) {
            console.error('Error loading NBA data:', error.message);
            throw error;
        }
    }

    async loadCSV(filePath, year = null) {
        return new Promise((resolve, reject) => {
            const results = [];

            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => {
                    // Filter by season_year if specified
                    if (year && data.season_year && data.season_year !== year) {
                        return; // Skip this row
                    }
                    results.push(data);
                })
                .on('end', () => {
                    resolve(results);
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }

    async saveToFirebase(collection, data) {
        try {
            if (!db) {
                console.warn('Firestore not initialized');
                return;
            }

            const BATCH_SIZE = 500;
            let totalSaved = 0;

            for (let i = 0; i < data.length; i += BATCH_SIZE) {
                const chunk = data.slice(i, i + BATCH_SIZE);
                const batch = db.batch();

                chunk.forEach((item, index) => {
                    const docRef = db.collection(collection).doc(`item_${i + index}`);
                    batch.set(docRef, item);
                });

                await batch.commit();
                totalSaved += chunk.length;
                console.log(`  📦 Saved batch ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length} items`);
            }

            console.log(`✅ Total saved to ${collection}: ${totalSaved} items`);
        } catch (error) {
            console.error('Error saving to Firebase:', error.message);
        }
    }
}

module.exports = new DataService();
