export class PromptBuilder {
    static build(sport: string, matchContext: any, realMarketLine: any): string {
        const isLive = matchContext.status && !matchContext.status.includes('Not') && matchContext.status !== "0'";
        let prompt = '';

        if (sport === 'basketball') {
            const isNBA = matchContext.tournament?.toLowerCase().includes('nba') ||
                matchContext.home?.toLowerCase().includes('pelicans') || matchContext.home?.toLowerCase().includes('celtics') ||
                matchContext.home?.toLowerCase().includes('lakers') || matchContext.home?.toLowerCase().includes('warriors') ||
                matchContext.home?.toLowerCase().includes('bulls') || matchContext.home?.toLowerCase().includes('heat') ||
                matchContext.home?.toLowerCase().includes('suns') || matchContext.home?.toLowerCase().includes('nicks') ||
                matchContext.away?.toLowerCase().includes('celtics');

            const mainOverUnder = realMarketLine?.line || (isNBA ? 226.5 : 158.5);
            const spreadMarket = matchContext.marketOdds?.find((m: any) => m.marketName?.toLowerCase().includes('spread') || m.marketName?.toLowerCase().includes('handicap'));
            const mainSpread = spreadMarket?.choices?.[0]?.name || (isNBA ? "-8.5" : "-4.5");

            const propsList = realMarketLine?.props?.playerProps?.map((p: any) =>
                `${p.name} (${p.market}): O/U ${p.line}`
            ).join(', ') || 'N/A';

            prompt = `
            Eres el "Oráculo PickGenius", experto analista de Betplay Colombia.
            **ID EVENTO:** ${matchContext.id || 'N/A'}
            **FECHA CONSULTA:** ${new Date().toISOString()}
            **TORNEO:** ${matchContext.tournament || 'Basketball'}
            **LÍNEAS LÍDERES (BETPLAY):** O/U ${mainOverUnder}, Hándicap ${mainSpread}
            **PROPS CLAVE (REBOTES/ASIST/PTS):** ${propsList}

            **OBJETIVO CRÍTICO:**
            Analiza el partido de ${matchContext.home} vs ${matchContext.away}.
            Tu misión es dar al cliente la opción MÁS VIABLE para ganar en Betplay Colombia.
            Identifica el "PICK DE ORO": La línea más segura (ej: si el O/U es ${mainOverUnder}, quizás un Over ${mainOverUnder - (isNBA ? 6 : 4)} sea el Pick de Oro).

            **INSTRUCCIONES:**
            1. Analiza O/U ${mainOverUnder} y Hándicap ${mainSpread}.
            2. Si ves valor en los PROPS (${propsList}), úsalos como alternativas.
            3. Proporciona alternativas de valor y un veredicto definitivo.

            RETURN JSON (STRICT FORMAT):
            {
                "winner": "${matchContext.home}",
                "confidence": 85,
                "reasoning": "...",
                "bettingTip": "Pick de Oro: Más de ${mainOverUnder - (isNBA ? 6 : 4)}",
                "keyFactors": ["Factor 1", "Factor 2", "Factor 3"],
                "predictions": {
                    "totalPoints": "${mainOverUnder}",
                    "overUnder": { "line": ${mainOverUnder}, "pick": "Más de/Menos de" },
                    "spread": { "line": "${mainSpread}", "pick": "Cubre" },
                    "alternativePicks": [
                        { "type": "Valor (Riesgo Alto)", "line": ${mainOverUnder + (isNBA ? 6 : 4)}, "pick": "Más de", "rationale": "Para una cuota más agresiva." }
                    ],
                    "playerProps": "Ojo con: ${propsList.substring(0, 50)}..."
                }
            }
            `;
        } else if (sport === 'football') {
            const minutesPlayed = Math.floor((matchContext.timeElapsed || 0) / 60);
            const homeScore = parseInt(matchContext.score?.split('-')[0] || '0');
            const awayScore = parseInt(matchContext.score?.split('-')[1] || '0');

            const h2hGoals = matchContext.h2hHistory?.map((game: any) => {
                const scores = game.score?.split('-') || [];
                return parseInt(scores[0] || '0') + parseInt(scores[1] || '0');
            }).filter((total: number) => !isNaN(total)) || [];

            const h2hAvgGoals = h2hGoals.length > 0
                ? (h2hGoals.reduce((a: number, b: number) => a + b, 0) / h2hGoals.length).toFixed(1)
                : '2.5';

            const mainOverUnder = realMarketLine?.line || 2.5;
            const spreadMarket = matchContext.marketOdds?.find((m: any) => m.marketName?.toLowerCase().includes('handicap') || m.marketName?.toLowerCase().includes('asian'));
            const mainSpread = spreadMarket?.choices?.[0]?.name || "-0.5";

            const cornersLine = realMarketLine?.props?.corners?.line || 9.5;
            const cardsLine = realMarketLine?.props?.cards?.line || 4.5;

            const projectedGoals = minutesPlayed > 10 && isLive
                ? (((homeScore + awayScore) / minutesPlayed) * 90).toFixed(1)
                : h2hAvgGoals;

            prompt = `
            Eres un experto analista de Fútbol hablando en ESPAÑOL, experto en Betplay Colombia.
            **LÍNEAS REALES (BETPLAY COLOMBIA):** 
            - Goles O/U: ${mainOverUnder}
            - Esquinas O/U: ${cornersLine}
            - Tarjetas O/U: ${cardsLine}
            - Hándicap: ${mainSpread}

            **OBJETIVO CRÍTICO:**
            Identifica el "PICK DE ORO": La opción más segura del partido (ej: "Más de 1.5 goles" si la línea es 2.5).

            RETURN JSON (STRICT FORMAT):
            {
                "winner": "${matchContext.home}",
                "confidence": 75,
                "reasoning": "...",
                "bettingTip": "Pick de Oro: Más de 1.5 goles (Seguridad Alta)",
                "keyFactors": ["Historial H2H over 1.5", "Ataque del local sólido", "Bajas en defensa visitante"],
                "predictions": {
                    "totalGoals": "${projectedGoals}",
                    "overUnder": { "line": ${mainOverUnder}, "pick": "Más de" },
                    "handicap": { "line": "${mainSpread}", "pick": "Cubre" },
                    "corners": { "total": ${cornersLine}, "pick": "Más de" },
                    "cards": { "yellowCards": ${cardsLine}, "pick": "Baja" },
                    "bothTeamsScore": { "pick": "Sí", "confidence": "Alta" }
                }
            }
            `;
        } else if (sport.toLowerCase().includes('nfl') || sport.toLowerCase().includes('american')) {
            const mainOverUnder = realMarketLine?.line || 44.5;
            const playerProps = realMarketLine?.props?.playerProps?.map((p: any) =>
                `${p.name} (${p.market}): O/U ${p.line}`
            ).join(', ') || 'Sin props destacados';

            prompt = `
            Analista ELITE de NFL para Betplay Colombia. 
            **LÍNEAS BETPLAY:** O/U ${mainOverUnder}.
            **PROPS JUGADORES (BETPLAY):** ${playerProps}

            RETURN JSON (STRICT FORMAT):
            {
                "winner": "${matchContext.home}",
                "confidence": 80,
                "reasoning": "Basado en línea de ${mainOverUnder}...",
                "bettingTip": "Spread: ${matchContext.home} -3.5",
                "keyFactors": ["Ventaja campo", "Eficiencia zona roja", "Defensa contra el pase"],
                "predictions": {
                    "totalPoints": "${mainOverUnder}",
                    "overUnder": { "line": ${mainOverUnder}, "pick": "Más de" },
                    "spread": { "line": "-3.5", "pick": "Cubre" },
                    "yards": { "total": 350, "pick": "Más de" },
                    "touchdowns": { "total": 4.5, "pick": "Under" },
                    "playerProps": "Considerar props de: ${playerProps}" 
                }
            }
            `;
        } else if (sport.toLowerCase().includes('nhl') || sport.toLowerCase().includes('hockey')) {
            const mainOverUnder = realMarketLine?.line || 6.0;
            prompt = `
            Experto NHL para Betplay Colombia. **MATCH:** ${matchContext.home} vs ${matchContext.away}.
            **LÍNEAS REALES (BETPLAY COLOMBIA):** O/U: ${mainOverUnder}.
            
            RETURN JSON (STRICT FORMAT):
            {
                "winner": "${matchContext.home}",
                "confidence": 78,
                "reasoning": "...",
                "bettingTip": "Puck Line: ${matchContext.home} +1.5",
                "keyFactors": ["Portería sólida", "Power play eficiente", "Bajas rival"],
                "predictions": {
                    "overUnder": { "line": ${mainOverUnder}, "pick": "Más de" },
                    "puckLine": { "line": "-1.5", "pick": "Cubre" }
                }
            }
            `;
        } else if (sport.toLowerCase().includes('baseball') || sport.toLowerCase().includes('mlb')) {
            const mainOverUnder = realMarketLine?.line || 8.5;
            const propsList = realMarketLine?.props?.playerProps?.map((p: any) =>
                `${p.name} (${p.market}): O/U ${p.line}`
            ).join(', ') || 'N/A';

            prompt = `
            Analista MLB para Betplay Colombia. 
            **LÍNEAS BETPLAY:** O/U ${mainOverUnder}.
            **EXTRAS (INNINGS/STRIKEOUTS):** ${propsList}
            
            RETURN JSON (STRICT FORMAT):
            {
                "winner": "${matchContext.home}",
                "confidence": 75,
                "reasoning": "...",
                "bettingTip": "Hándicap: ${matchContext.home} -1.5",
                "keyFactors": ["Abridor dominante", "Bullpen fresco", "Historial vs bateadores"],
                "predictions": {
                    "totalRuns": "${mainOverUnder}",
                    "overUnder": { "line": ${mainOverUnder}, "pick": "Más de" },
                    "runLine": { "line": "-1.5", "pick": "Cubre" },
                    "first5": { "pick": "${matchContext.home}", "winner": "${matchContext.home}" },
                    "props": "${propsList}"
                }
            }
            `;
        } else if (sport.toLowerCase().includes('tennis')) {
            const mainOverUnder = realMarketLine?.line || 22.5;
            const propsList = realMarketLine?.props?.playerProps?.map((p: any) =>
                `${p.name} (${p.market}): O/U ${p.line}`
            ).join(', ') || 'N/A';

            prompt = `
            Experto Tenis (ATP/WTA) para Betplay Colombia. **MATCH:** ${matchContext.home} vs ${matchContext.away}.
            **LÍNEAS BETPLAY:** Total Juegos (O/U): ${mainOverUnder}.
            **SETS/GAMES:** ${propsList}
            
            RETURN JSON (STRICT FORMAT):
            {
                "winner": "${matchContext.home}",
                "confidence": 75,
                "reasoning": "...",
                "bettingTip": "Pick de Oro: Más de ${mainOverUnder} juegos",
                "keyFactors": ["Superficie rápida", "Servicio dominante", "Fatiga del rival"],
                "predictions": {
                    "totalGames": "${mainOverUnder}",
                    "overUnder": { "line": ${mainOverUnder}, "pick": "Más de" },
                    "setBetting": { "pick": "2-1", "winner": "${matchContext.home}" },
                    "props": "${propsList}"
                }
            }
            `;
        }

        return prompt;
    }
}
