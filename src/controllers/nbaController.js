const nbaService = require('../services/nbaService');
const aiService = require('../services/aiService');
const { db } = require('../config/firebase');

class NBAController {
    async getTodayGames(req, res) {
        try {
            const games = await nbaService.getGames();
            res.json({
                success: true,
                count: games.length,
                games: games
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async analyzeGame(req, res) {
        try {
            const { id } = req.params;
            console.time(`analyzeGame-${id}`);

            const gameRef = db.collection('nba_games').doc(id);
            const gameDoc = await gameRef.get();

            if (!gameDoc.exists) {
                return res.status(404).json({
                    success: false,
                    error: 'Game not found'
                });
            }

            const game = gameDoc.data();
            const homeTeam = game.home_team?.abbreviation;
            const awayTeam = game.visitor_team?.abbreviation;

            console.log(`Analyzing game ${id}: ${homeTeam} vs ${awayTeam}`);

            // Run team and player stats queries in parallel
            const [homeStats, awayStats, homePlayers, awayPlayers] = await Promise.all([
                this.getTeamStats(homeTeam),
                this.getTeamStats(awayTeam),
                this.getPlayerStats(homeTeam),
                this.getPlayerStats(awayTeam)
            ]);

            const analysisData = {
                sport: 'NBA',
                home: game.home_team?.full_name || game.home_team?.name,
                away: game.visitor_team?.full_name || game.visitor_team?.name,
                date: game.date,
                status: game.status,
                homeStats: homeStats,
                awayStats: awayStats,
                homePlayers: homePlayers,
                awayPlayers: awayPlayers
            };

            console.log('Sending data to AI service...');
            const analysis = await aiService.analyzeMatch(analysisData);

            await gameRef.update({
                analysis: analysis,
                analyzedAt: new Date().toISOString()
            });

            console.timeEnd(`analyzeGame-${id}`);

            res.json({
                success: true,
                game: game,
                analysis: analysis,
                stats: { home: homeStats, away: awayStats },
                players: { home: homePlayers, away: awayPlayers }
            });
        } catch (error) {
            console.error('Error in analyzeGame:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getTeamStats(teamAbbr) {
        try {
            if (!db || !teamAbbr) return null;
            console.time(`getTeamStats-${teamAbbr}`);

            const collections = [
                'nba_regular_season_box_scores_2010_2024_part_1',
                'nba_regular_season_box_scores_2010_2024_part_2',
                'nba_regular_season_box_scores_2010_2024_part_3',
                'nba_regular_season_box_scores_2025_26'
            ];

            // Run queries in parallel
            const queryPromises = collections.map(collectionName =>
                db.collection(collectionName)
                    .where('teamTricode', '==', teamAbbr)
                    .limit(100)
                    .get()
                    .then(snapshot => snapshot.empty ? [] : snapshot.docs.map(doc => doc.data()))
                    .catch(err => {
                        console.log(`Error querying ${collectionName}:`, err.message);
                        return [];
                    })
            );

            const results = await Promise.all(queryPromises);
            const allGames = results.flat();

            console.log(`Found ${allGames.length} games for ${teamAbbr}`);

            if (allGames.length === 0) return null;

            // Filter for last season and current season
            const games = allGames
                .filter(game => game.season_year === '2023-24' || game.season_year === '2025-26')
                .sort((a, b) => new Date(b.game_date) - new Date(a.game_date))
                .slice(0, 20);

            console.timeEnd(`getTeamStats-${teamAbbr}`);

            if (games.length === 0) return null;

            const stats = {
                gamesPlayed: games.length,
                avgPoints: this.calculateAverage(games, 'points'),
                avgRebounds: this.calculateAverage(games, 'reboundsTotal'),
                avgAssists: this.calculateAverage(games, 'assists'),
                avgFGPercent: this.calculateAverage(games, 'fieldGoalsPercentage')
            };

            return stats;
        } catch (error) {
            console.error('Error getting team stats:', error.message);
            return null;
        }
    }

    async getPlayerStats(teamAbbr) {
        try {
            if (!db || !teamAbbr) return [];
            console.time(`getPlayerStats-${teamAbbr}`);

            const collections = [
                'nba_regular_season_box_scores_2010_2024_part_1',
                'nba_regular_season_box_scores_2010_2024_part_2',
                'nba_regular_season_box_scores_2010_2024_part_3',
                'nba_regular_season_box_scores_2025_26'
            ];

            // Run queries in parallel
            const queryPromises = collections.map(collectionName =>
                db.collection(collectionName)
                    .where('teamTricode', '==', teamAbbr)
                    .limit(500)
                    .get()
                    .then(snapshot => snapshot.empty ? [] : snapshot.docs.map(doc => doc.data()))
                    .catch(err => {
                        console.log(`Error querying ${collectionName}:`, err.message);
                        return [];
                    })
            );

            const results = await Promise.all(queryPromises);
            const allPlayerGames = results.flat();

            console.log(`Found ${allPlayerGames.length} player stats for ${teamAbbr}`);

            if (allPlayerGames.length === 0) return [];

            const playerGames = allPlayerGames
                .filter(game => game.season_year === '2023-24' || game.season_year === '2025-26');

            console.timeEnd(`getPlayerStats-${teamAbbr}`);

            if (playerGames.length === 0) return [];

            const playerMap = {};

            playerGames.forEach(game => {
                const playerName = game.personName;
                if (!playerName || game.minutes === '' || game.minutes === '0') return;

                if (!playerMap[playerName]) {
                    playerMap[playerName] = {
                        name: playerName,
                        games: [],
                        totalPTS: 0,
                        totalREB: 0,
                        totalAST: 0,
                        totalFG3M: 0
                    };
                }

                playerMap[playerName].games.push(game);
                playerMap[playerName].totalPTS += parseFloat(game.points) || 0;
                playerMap[playerName].totalREB += parseFloat(game.reboundsTotal) || 0;
                playerMap[playerName].totalAST += parseFloat(game.assists) || 0;
                playerMap[playerName].totalFG3M += parseFloat(game.threePointersMade) || 0;
            });

            const players = Object.values(playerMap)
                .filter(player => player.games.length >= 5)
                .map(player => ({
                    name: player.name,
                    gamesPlayed: player.games.length,
                    avgPoints: (player.totalPTS / player.games.length).toFixed(1),
                    avgRebounds: (player.totalREB / player.games.length).toFixed(1),
                    avgAssists: (player.totalAST / player.games.length).toFixed(1),
                    avgThreePointers: (player.totalFG3M / player.games.length).toFixed(1)
                }));

            return players
                .sort((a, b) => parseFloat(b.avgPoints) - parseFloat(a.avgPoints))
                .slice(0, 5);
        } catch (error) {
            console.error('Error getting player stats:', error.message);
            return [];
        }
    }

    calculateAverage(games, field) {
        if (!games || games.length === 0) return 0;
        const sum = games.reduce((acc, game) => acc + (parseFloat(game[field]) || 0), 0);
        return (sum / games.length).toFixed(2);
    }
}

module.exports = new NBAController();
