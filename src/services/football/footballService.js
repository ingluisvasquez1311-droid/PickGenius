/**
 * Servicio de fútbol para Node.js
 * Procesa datos CSV y proporciona análisis
 */

const { db } = require('../../config/firebase');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

class FootballService {
    constructor() {
        this.dataPath = path.join(__dirname, '../../../data/football');

        this.leagueCodes = {
            'SP1': 'La Liga',
            'E0': 'Premier League',
            'I1': 'Serie A',
            'D1': 'Bundesliga',
            'F1': 'Ligue 1'
        };
    }

    /**
     * Procesa un archivo CSV y retorna los datos
     */
    async processCSV(filePath) {
        return new Promise((resolve, reject) => {
            const results = [];

            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => {
                    const processed = this.extractKeyMetrics(row);
                    if (processed) results.push(processed);
                })
                .on('end', () => resolve(results))
                .on('error', reject);
        });
    }

    /**
     * Extrae métricas clave de un partido
     */
    extractKeyMetrics(row) {
        try {
            const homeGoals = parseInt(row.FTHG || 0);
            const awayGoals = parseInt(row.FTAG || 0);
            const totalGoals = homeGoals + awayGoals;

            const homeCorners = parseInt(row.HC || 0);
            const awayCorners = parseInt(row.AC || 0);
            const totalCorners = homeCorners + awayCorners;

            const homeShots = parseInt(row.HS || 0);
            const awayShots = parseInt(row.AS || 0);
            const totalShots = homeShots + awayShots;

            const homeShotsTarget = parseInt(row.HST || 0);
            const awayShotsTarget = parseInt(row.AST || 0);
            const totalShotsTarget = homeShotsTarget + awayShotsTarget;

            return {
                homeTeam: row.HomeTeam,
                awayTeam: row.AwayTeam,
                date: row.Date,

                // Goles
                homeGoals,
                awayGoals,
                totalGoals,

                // Corners
                homeCorners,
                awayCorners,
                totalCorners,

                // Tiros
                homeShots,
                awayShots,
                totalShots,

                // Tiros a puerta
                homeShotsTarget,
                awayShotsTarget,
                totalShotsTarget,

                // Métricas de predicción
                bothTeamsScored: homeGoals > 0 && awayGoals > 0,
                over15Goals: totalGoals > 1.5,
                over25Goals: totalGoals > 2.5,
                over35Goals: totalGoals > 3.5,

                // Resultado
                result: homeGoals > awayGoals ? 'H' : (awayGoals > homeGoals ? 'A' : 'D')
            };
        } catch (error) {
            console.error('Error extracting metrics:', error);
            return null;
        }
    }

    /**
     * Carga datos CSV a Firestore
     */
    async loadToFirestore(leagueCode, season = '2425') {
        console.log(`⚽ Cargando ${leagueCode} temporada ${season}...`);

        const fileName = `${leagueCode}_${season}.csv`;
        const filePath = path.join(this.dataPath, fileName);

        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  Archivo no encontrado: ${fileName}`);
            return { success: false, message: 'File not found' };
        }

        try {
            const matches = await this.processCSV(filePath);
            const leagueName = this.leagueCodes[leagueCode] || leagueCode;

            // Guardar en Firestore usando batching
            const batch = db.batch();
            let count = 0;

            for (const match of matches) {
                const docId = `${match.date}_${match.homeTeam}_${match.awayTeam}`
                    .replace(/\s/g, '_')
                    .replace(/\//g, '-');

                const docRef = db.collection('football_matches').doc(docId);
                batch.set(docRef, {
                    ...match,
                    league: leagueName,
                    leagueCode,
                    season,
                    timestamp: new Date().toISOString()
                });

                count++;

                // Commit cada 500
                if (count % 500 === 0) {
                    await batch.commit();
                    console.log(`  ✅ Guardados ${count} partidos...`);
                }
            }

            // Commit final
            await batch.commit();

            console.log(`✅ ${leagueName}: ${matches.length} partidos cargados`);

            return {
                success: true,
                league: leagueName,
                matchesLoaded: matches.length
            };

        } catch (error) {
            console.error(`❌ Error cargando ${leagueCode}:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Carga todas las ligas principales
     */
    async loadAllLeagues(season = '2425') {
        console.log('='.repeat(60));
        console.log('⚽ CARGANDO DATOS DE FÚTBOL');
        console.log('='.repeat(60));

        const mainLeagues = ['SP1', 'E0', 'I1', 'D1', 'F1'];
        const results = [];

        for (const leagueCode of mainLeagues) {
            const result = await this.loadToFirestore(leagueCode, season);
            results.push(result);
        }

        const totalMatches = results
            .filter(r => r.success)
            .reduce((sum, r) => sum + (r.matchesLoaded || 0), 0);

        console.log('='.repeat(60));
        console.log(`✅ CARGA COMPLETADA: ${totalMatches} partidos`);
        console.log('='.repeat(60));

        return {
            success: true,
            totalMatches,
            results
        };
    }

    /**
     * Obtiene estadísticas de predicción
     */
    async getPredictionStats(league = null) {
        try {
            let query = db.collection('football_matches');

            if (league) {
                query = query.where('league', '==', league);
            }

            const snapshot = await query.get();
            const matches = snapshot.docs.map(doc => doc.data());

            const total = matches.length;
            const bttsCount = matches.filter(m => m.bothTeamsScored).length;
            const over25Count = matches.filter(m => m.over25Goals).length;
            const over15Count = matches.filter(m => m.over15Goals).length;

            return {
                total,
                bothTeamsScored: {
                    count: bttsCount,
                    percentage: (bttsCount / total * 100).toFixed(1)
                },
                over25Goals: {
                    count: over25Count,
                    percentage: (over25Count / total * 100).toFixed(1)
                },
                over15Goals: {
                    count: over15Count,
                    percentage: (over15Count / total * 100).toFixed(1)
                },
                avgCorners: (matches.reduce((sum, m) => sum + m.totalCorners, 0) / total).toFixed(1),
                avgShots: (matches.reduce((sum, m) => sum + m.totalShots, 0) / total).toFixed(1)
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            throw error;
        }
    }
}

module.exports = new FootballService();
