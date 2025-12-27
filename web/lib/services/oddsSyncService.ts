import { getFirestore } from '@/lib/firebaseAdmin';

import { sportsDataService } from './sportsDataService';
import { fetchAPI } from '../api';

export interface MarketLine {
    gameId: string;
    sport: string;
    marketName: string;
    line: number;
    odds: {
        over?: number;
        under?: number;
        home?: number;
        away?: number;
        homeSpread?: number;
        awaySpread?: number;
    };
    // New Props Field for Rich Data
    props?: {
        corners?: { line: number; over: number; under: number };
        cards?: { line: number; over: number; under: number };
        btts?: { yes: number; no: number };
        playerProps?: Array<{ name: string; market: string; line: number; over: number; under: number }>; // e.g., LeBron Points O/U 25.5
        teamTotals?: { home: number; away: number }; // O/U lines for each team
    };
    provider: string;
    isVerified: boolean;
    updatedAt: Date;
    marketSource: string;
    handicap?: string;
}

class OddsSyncService {
    /**
     * Sincroniza las cuotas de un evento específico con Firestore prioritizando Betplay
     */
    async syncEventOdds(gameId: number | string, sport: string): Promise<MarketLine | null> {
        try {
            // 1. Intentar obtener datos directamente de Betplay (Kambi)
            const betplayData = await this.fetchBetplayOdds(gameId, sport);

            if (betplayData) {
                await this.saveMarketLine(betplayData);
                return betplayData;
            }

            // 2. Fallback a Sofascore si Betplay falla (pero marcándolo como Betplay aproximado)
            // console.log(`⚠️ [OddsSync] No se encontró línea directa en Betplay, usando Sofascore para ${gameId}`);

            const [winnerOdds, totalOdds, spreadOdds] = await Promise.all([
                sportsDataService.getMatchOdds(Number(gameId), 1).catch(() => null),
                sportsDataService.getMatchOdds(Number(gameId), 12).catch(() => null),
                sportsDataService.getMatchOdds(Number(gameId), 2).catch(() => null)
            ]);

            const allMarkets = [
                ...(winnerOdds?.markets || []),
                ...(totalOdds?.markets || []),
                ...(spreadOdds?.markets || [])
            ];

            if (allMarkets.length === 0) return null;

            // Encontrar el mercado más relevante
            const totalMarket = allMarkets.find((m: any) =>
                m.marketName.toLowerCase().includes('total') || m.marketName.toLowerCase().includes('over/under')
            );

            const handicapMarket = allMarkets.find((m: any) =>
                m.marketName.toLowerCase().includes('spread') || m.marketName.toLowerCase().includes('handicap')
            );

            let line = 0;
            if (totalMarket?.choices?.[0]) {
                const lineMatch = totalMarket.choices[0].name.match(/(\d+\.?\d*)/);
                line = lineMatch ? parseFloat(lineMatch[1]) : 0;
            }

            const marketLine: MarketLine = {
                gameId: gameId.toString(),
                sport,
                line,
                marketName: totalMarket?.marketName || 'Total de puntos',
                handicap: handicapMarket?.choices?.[0]?.name || null,
                odds: {
                    over: totalMarket?.choices?.find((c: any) => c.name.toLowerCase().includes('over'))?.fraction,
                    under: totalMarket?.choices?.find((c: any) => c.name.toLowerCase().includes('under'))?.fraction,
                    homeSpread: handicapMarket?.choices?.[0]?.fraction,
                    awaySpread: handicapMarket?.choices?.[1]?.fraction,
                },
                provider: 'Betplay', // Marcamos como Betplay para consistencia, aunque venga via Sofascore
                isVerified: false, // Pero no verificado direct Kambi
                updatedAt: new Date(),
                marketSource: `Sofascore Fallback (Probable identico a Betplay)`
            };

            await this.saveMarketLine(marketLine);
            return marketLine;

        } catch (error) {
            console.error(`❌ [OddsSync] Error sincronizando cuotas para ${gameId}:`, error);
            return null;
        }
    }

    /**
     * Fetch directo desde la API de Kambi (Betplay) usando el bridge si está disponible
     */
    private async fetchBetplayOdds(gameId: number | string, sport: string): Promise<MarketLine | null> {
        try {
            const kambiEventId = await this.getKambiIdBySofascoreId(gameId, sport);
            if (!kambiEventId) return null;

            const bridgeUrl = process.env.NEXT_PUBLIC_API_URL;
            const baseUrl = bridgeUrl ? `${bridgeUrl}/api/proxy/kambi` : 'https://tienda.betplay.com.co/offering/v21/betp';
            const url = `${baseUrl}/event/${kambiEventId}.json?lang=es_CO&market=CO`;

            const responseData = await fetchAPI(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                    'Referer': 'https://tienda.betplay.com.co/',
                    'Origin': 'https://tienda.betplay.com.co',
                    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="121", "Google Chrome";v="121"',
                    'Sec-Ch-Ua-Mobile': '?0',
                    'Sec-Ch-Ua-Platform': '"Windows"',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-site',
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (!responseData) return null;
            const data = responseData;

            // 1. EXTRACT MAIN LINES (Totals/Spread)
            const mainBetOffer = data.betOffers?.find((bo: any) =>
                (bo.betOfferType?.name?.toLowerCase().includes('total') || bo.criterion?.label?.toLowerCase().includes('total')) &&
                bo.main
            );

            // Fallback: If no "main" total, look for any generic "Total Points/Goals"
            const fallbackTotal = data.betOffers?.find((bo: any) =>
                bo.criterion?.label === 'Total de goles' || bo.criterion?.label === 'Total de puntos'
            );

            const targetOffer = mainBetOffer || fallbackTotal;
            if (!targetOffer) return null;

            const overOutcome = targetOffer.outcomes?.find((o: any) => o.label?.toLowerCase().includes('más'));
            const underOutcome = targetOffer.outcomes?.find((o: any) => o.label?.toLowerCase().includes('menos'));

            // 2. EXTRACT PROPS (Corners, Cards, Player Props)
            const props: MarketLine['props'] = { playerProps: [] };

            // Corners
            const cornersOffer = data.betOffers?.find((bo: any) => bo.criterion?.label?.toLowerCase().includes('esquinas') || bo.criterion?.label?.toLowerCase().includes('corners'));
            if (cornersOffer) {
                const o = cornersOffer.outcomes?.find((o: any) => o.label?.includes('Más'));
                const u = cornersOffer.outcomes?.find((o: any) => o.label?.includes('Menos'));
                if (o && u) {
                    props.corners = { line: o.line / 1000, over: o.odds / 1000, under: u.odds / 1000 };
                }
            }

            // Cards
            const cardsOffer = data.betOffers?.find((bo: any) => bo.criterion?.label?.toLowerCase().includes('tarjetas'));
            if (cardsOffer) {
                const o = cardsOffer.outcomes?.find((o: any) => o.label?.includes('Más'));
                const u = cardsOffer.outcomes?.find((o: any) => o.label?.includes('Menos'));
                if (o && u) {
                    props.cards = { line: o.line / 1000, over: o.odds / 1000, under: u.odds / 1000 };
                }
            }

            // BTTS (Ambos marcan)
            const bttsOffer = data.betOffers?.find((bo: any) => bo.criterion?.label?.toLowerCase().includes('ambos equipos marcan'));
            if (bttsOffer) {
                const yes = bttsOffer.outcomes?.find((o: any) => o.label?.toLowerCase().includes('sí'));
                const no = bttsOffer.outcomes?.find((o: any) => o.label?.toLowerCase().includes('no'));
                if (yes && no) props.btts = { yes: yes.odds / 1000, no: no.odds / 1000 };
            }

            // Player Props & Other Popular Markets
            // Expanded to cover Basketball (Rebounds, Assists), Baseball (Innings), Tennis (Sets)
            const playerOffers = data.betOffers?.filter((bo: any) => {
                const label = bo.criterion?.label?.toLowerCase() || '';
                return label.includes('puntos') ||
                    label.includes('goleador') ||
                    label.includes('yardas') || // NFL
                    label.includes('rebotes') || // Basketball
                    label.includes('asistencias') || // Basketball/Football
                    label.includes('triples') || // Basketball
                    label.includes('entradas') || // Baseball (Innings)
                    label.includes('strike') || // Baseball
                    label.includes('set') // Tennis
            }).slice(0, 8); // Increased limit to capture more variety

            playerOffers?.forEach((po: any) => {
                const playerName = po.outcomes?.[0]?.participant || 'Mercado';
                const marketName = po.criterion?.label;
                const oLine = po.outcomes?.find((o: any) => o.label?.includes('Más'));
                const uLine = po.outcomes?.find((o: any) => o.label?.includes('Menos'));

                if (oLine && uLine) {
                    props.playerProps?.push({
                        name: playerName,
                        market: marketName,
                        line: oLine.line / 1000,
                        over: oLine.odds / 1000,
                        under: uLine.odds / 1000
                    });
                }
            });

            return {
                gameId: gameId.toString(),
                sport,
                line: overOutcome?.line / 1000 || 0,
                marketName: targetOffer.criterion?.label || 'Total',
                odds: {
                    over: overOutcome?.odds ? overOutcome.odds / 1000 : undefined,
                    under: underOutcome?.odds ? underOutcome.odds / 1000 : undefined,
                },
                props: props, // NEW: Attach extracted props
                provider: 'Betplay',
                isVerified: true,
                updatedAt: new Date(),
                marketSource: 'Direct Kambi Feed (Betplay Colombia)'
            };
        } catch (e) {
            console.error("❌ [OddsSync] Error en fetchBetplayOdds:", e);
            return null;
        }
    }

    /**
     * Mapea un ID de Sofascore a un ID de Kambi/Betplay mediante búsqueda inteligente
     */
    private async getKambiIdBySofascoreId(gameId: number | string, sport: string): Promise<number | null> {
        try {
            // 0. Manual Overrides (si existen)
            if (gameId.toString() === '12702781') return 1021435081;

            // 1. Obtener detalles del evento de Sofascore para tener los nombres
            const sofascoreEvent = await sportsDataService.getEventById(Number(gameId)).catch(() => null);
            if (!sofascoreEvent) return null;

            const normalize = (name: string) => name ? name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ fc| cf| club| united| city| real| atletico/g, "").trim() : '';
            const homeName = normalize(sofascoreEvent.homeTeam?.name);
            const awayName = normalize(sofascoreEvent.awayTeam?.name);

            if (!homeName || !awayName) return null;

            // 2. Definir Grupos de Kambi para buscar (Base de Datos Mundial)
            // Estos IDs suelen corresponder a deportes/ligas en Kambi.
            const SPORT_GROUP_IDS: Record<string, number[]> = {
                'basketball': [1000093204, 1000093652, 1000093654, 2000093204], // NBA, Euroleague, International
                'football': [1000093190, 1000094985, 1000093258, 2000093190], // Premier, LaLiga, Serie A, World
                'tennis': [1000093228, 1000093240, 2000093228], // ATP, WTA
                'baseball': [1000093203, 2000093203], // MLB, International
                'american-football': [1000093193, 2000093193], // NFL
                'ice-hockey': [1000093205, 2000093205] // NHL
            };

            // Mapeo simple de sport string a key
            let sportKey = sport.toLowerCase();
            if (sportKey.includes('nfl')) sportKey = 'american-football';
            if (sportKey.includes('hockey')) sportKey = 'ice-hockey';
            if (sportKey.includes('soccer')) sportKey = 'football';

            const groupIds = SPORT_GROUP_IDS[sportKey] || [];
            if (groupIds.length === 0) {
                // Fallback genérico si no hay IDs específicos
                return null;
            }

            const bridgeUrl = process.env.NEXT_PUBLIC_API_URL;

            // 3. Buscar en los grupos definidos
            for (const groupId of groupIds) {
                const searchUrl = bridgeUrl
                    ? `${bridgeUrl}/api/proxy/kambi/event/group/${groupId}.json?lang=es_CO&market=CO`
                    : `https://tienda.betplay.com.co/offering/v21/betp/event/group/${groupId}.json?lang=es_CO&market=CO`;

                const groupData = await fetchAPI(searchUrl, {
                    headers: { 'ngrok-skip-browser-warning': 'true' },
                });

                if (!groupData) continue;

                // 4. Comparación Difusa (Fuzzy Match)
                const kambiEvent = groupData.events?.find((e: any) => {
                    const kName = normalize(e.event?.name);
                    const homeMatch = kName.includes(homeName);
                    const awayMatch = kName.includes(awayName);

                    // Si encuentra AMBOS nombres, es match seguro (100% confidence)
                    if (homeMatch && awayMatch) return true;

                    // Si encuentra UNO y el deporte es individual (Tenis), a veces basta, pero preferimos seguridad.
                    // Para evitar falsos positivos en "City" vs "United", requerimos al menos una coincidencia fuerte.
                    if ((homeMatch || awayMatch) && kName.length > 5) return true;

                    return false;
                });

                if (kambiEvent?.event?.id) {
                    console.log(`✅ [OddsSync] Match Encontrado: ${sofascoreEvent.homeTeam.name} vs ${sofascoreEvent.awayTeam.name} -> Betplay ID ${kambiEvent.event.id}`);
                    return kambiEvent.event.id;
                }
            }
            return null;
        } catch (e) {
            console.error("❌ [OddsSync] Error mapeando IDs:", e);
            return null;
        }
    }

    /**
     * Persiste la línea de mercado en Firebase filtrando solo lo interesante
     */
    private async saveMarketLine(marketLine: MarketLine) {
        const db = getFirestore();
        if (!db) return;

        const docRef = db.collection('marketLines').doc(`${marketLine.sport}_${marketLine.gameId}`);

        // Función de limpieza para evitar errores de Firestore con 'undefined'
        const removeUndefined = (obj: any) => JSON.parse(JSON.stringify(obj));

        // Solo guardamos la información de valor, descartando ruido
        const rawData = {
            gameId: marketLine.gameId,
            sport: marketLine.sport,
            line: marketLine.line,
            marketName: marketLine.marketName,
            handicap: marketLine.handicap,
            odds: marketLine.odds,
            props: marketLine.props,
            provider: marketLine.provider,
            isVerified: marketLine.isVerified,
            marketSource: marketLine.marketSource,
            updatedAt: marketLine.updatedAt?.toISOString() || new Date().toISOString()
        };

        const cleanData = removeUndefined(rawData);

        try {
            await docRef.set(cleanData);
            console.log(`✅ [OddsSync] Betplay Data Saved: ${marketLine.gameId} (O/U ${marketLine.line})`);
        } catch (error) {
            console.error(`❌ [OddsSync] Error saving to Firebase:`, error);
        }
    }

    /**
     * Obtiene la línea de mercado guardada desde Firestore
     */
    async getStoredMarketLine(gameId: string | number, sport: string): Promise<MarketLine | null> {
        try {
            const db = getFirestore();
            if (!db) return null;

            const docRef = db.collection('marketLines').doc(`${sport}_${gameId}`);
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                const data = docSnap.data();
                return {
                    ...data,
                    // Convert Firestore Timestamp to Date if needed
                    updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data?.updatedAt)
                } as MarketLine;
            }
            return null;
        } catch (error) {
            console.error(`❌ [OddsSync] Error obteniendo línea de Firebase:`, error);
            return null;
        }
    }
}

export const oddsSyncService = new OddsSyncService();
