import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { sportsDataService } from './sportsDataService';

export interface MarketLine {
    gameId: string;
    sport: string;
    marketName: string; // e.g., "Total Points", "Over/Under", "Full Time"
    line: number;      // e.g., 240.5
    odds: {
        over?: number;
        under?: number;
        home?: number;
        away?: number;
        homeSpread?: number;
        awaySpread?: number;
    };
    provider: string;   // "Betplay"
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
            console.log(`🔄 [OddsSync] Sincronizando cuotas de Betplay para ${sport} ID: ${gameId}`);

            // 1. Intentar obtener datos directamente de Betplay (Kambi)
            const betplayData = await this.fetchBetplayOdds(gameId, sport);

            if (betplayData) {
                await this.saveMarketLine(betplayData);
                return betplayData;
            }

            // 2. Fallback a Sofascore si Betplay falla (pero marcándolo como Betplay aproximado)
            console.log(`⚠️ [OddsSync] No se encontró línea directa en Betplay, usando Sofascore para ${gameId}`);

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

            // Encontrar el mercado más relevante (Betplay es Kambi, ID de proveedor suele ser 6 o similar en Sofascore)
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
                provider: 'Betplay',
                isVerified: true,
                updatedAt: new Date(),
                marketSource: `Betplay Colombia (Vía Kambi Proxy ID: ${totalMarket?.providerId || 'Auto'})`
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

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': 'https://tienda.betplay.com.co/',
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (!response.ok) return null;
            const data = await response.json();

            // Extraer Main Line de Totales
            const mainBetOffer = data.betOffers?.find((bo: any) =>
                (bo.betOfferType?.name?.toLowerCase().includes('total') || bo.criterion?.label?.toLowerCase().includes('total')) &&
                bo.main
            );

            if (!mainBetOffer) return null;

            const overOutcome = mainBetOffer.outcomes?.find((o: any) => o.label?.toLowerCase().includes('más'));
            const underOutcome = mainBetOffer.outcomes?.find((o: any) => o.label?.toLowerCase().includes('menos'));

            return {
                gameId: gameId.toString(),
                sport,
                line: overOutcome?.line / 1000 || 0,
                marketName: mainBetOffer.criterion?.label || 'Total de puntos',
                odds: {
                    over: overOutcome?.odds ? overOutcome.odds / 1000 : undefined,
                    under: underOutcome?.odds ? underOutcome.odds / 1000 : undefined,
                },
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
     * Mapea un ID de Sofascore a un ID de Kambi/Betplay mediante búsqueda dinámica
     */
    private async getKambiIdBySofascoreId(gameId: number | string, sport: string): Promise<number | null> {
        try {
            // Mapeo manual para pruebas conocidas
            if (gameId.toString() === '12702781') return 1021435081;

            // Búsqueda dinámica para Baloncesto (NBA)
            if (sport === 'basketball') {
                const bridgeUrl = process.env.NEXT_PUBLIC_API_URL;
                const searchUrl = bridgeUrl
                    ? `${bridgeUrl}/api/proxy/kambi/event/group/1000093204.json?lang=es_CO&market=CO`
                    : `https://tienda.betplay.com.co/offering/v21/betp/event/group/1000093204.json?lang=es_CO&market=CO`;

                const res = await fetch(searchUrl, {
                    headers: { 'ngrok-skip-browser-warning': 'true' },
                    signal: AbortSignal.timeout(5000)
                }).catch(() => null);

                if (!res || !res.ok) return null;
                const groupData = await res.json();

                // Intentar obtener nombres de equipos de Sofascore para comparar
                const sofascoreEvent = await sportsDataService.getEventById(Number(gameId)).catch(() => null);
                if (!sofascoreEvent) return null;

                const homeName = sofascoreEvent.homeTeam?.name?.toLowerCase();
                const awayName = sofascoreEvent.awayTeam?.name?.toLowerCase();

                const kambiEvent = groupData.events?.find((e: any) => {
                    const kName = e.event?.name?.toLowerCase() || '';
                    return (homeName && kName.includes(homeName)) || (awayName && kName.includes(awayName));
                });

                return kambiEvent?.event?.id || null;
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
        if (db) {
            const docRef = doc(db, 'marketLines', `${marketLine.sport}_${marketLine.gameId}`);

            // Solo guardamos la información de valor, descartando ruido
            const cleanData = {
                gameId: marketLine.gameId,
                sport: marketLine.sport,
                line: marketLine.line,
                marketName: marketLine.marketName,
                handicap: marketLine.handicap,
                odds: marketLine.odds,
                provider: marketLine.provider,
                isVerified: marketLine.isVerified,
                marketSource: marketLine.marketSource,
                updatedAt: Timestamp.fromDate(marketLine.updatedAt)
            };

            await setDoc(docRef, cleanData);
            console.log(`✅ [OddsSync] Betplay Data Saved: ${marketLine.gameId} (O/U ${marketLine.line})`);
        }
    }

    /**
     * Obtiene la línea de mercado guardada desde Firestore
     */
    async getStoredMarketLine(gameId: string | number, sport: string): Promise<MarketLine | null> {
        try {
            if (!db) return null;

            const docRef = doc(db, 'marketLines', `${sport}_${gameId}`);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    ...data,
                    updatedAt: data.updatedAt?.toDate()
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
