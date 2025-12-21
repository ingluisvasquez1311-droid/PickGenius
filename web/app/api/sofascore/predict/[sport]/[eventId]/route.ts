import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sport: string; eventId: string }> }
) {
    try {
        const { sport, eventId } = await params;

        // 1. Obtener datos del partido desde SportsData
        const [eventResponse, statsResponse] = await Promise.all([
            fetch(`https://www.sofascore.com/api/v1/event/${eventId}`),
            fetch(`https://www.sofascore.com/api/v1/event/${eventId}/statistics`)
        ]);

        if (!eventResponse.ok || !statsResponse.ok) {
            throw new Error('Error fetching match data from SportsData');
        }

        const eventData = await eventResponse.json();
        const statsData = await statsResponse.json();

        // 2. Preparar el contexto para la IA
        const matchContext = {
            homeTeam: eventData.event.homeTeam.name,
            awayTeam: eventData.event.awayTeam.name,
            homeScore: eventData.event.homeScore.current,
            awayScore: eventData.event.awayScore.current,
            status: eventData.event.status.description,
            statistics: statsData.statistics
        };

        // 3. Llamar a Groq API
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            // Si no hay API key, devolver predicción basada en estadísticas
            const homeStats = statsData.statistics?.[0] || {};
            const awayStats = statsData.statistics?.[1] || {};

            const homePossession = homeStats.groups?.find((g: any) =>
                g.groupName === 'Possession'
            )?.statisticsItems?.[0]?.home || 50;

            const homeShots = homeStats.groups?.find((g: any) =>
                g.groupName === 'Shots'
            )?.statisticsItems?.find((s: any) => s.name === 'Total shots')?.home || 0;

            const awayShots = homeStats.groups?.find((g: any) =>
                g.groupName === 'Shots'
            )?.statisticsItems?.find((s: any) => s.name === 'Total shots')?.away || 0;

            const homeShotsOnTarget = homeStats.groups?.find((g: any) =>
                g.groupName === 'Shots'
            )?.statisticsItems?.find((s: any) => s.name === 'Shots on target')?.home || 0;

            const awayShotsOnTarget = homeStats.groups?.find((g: any) =>
                g.groupName === 'Shots'
            )?.statisticsItems?.find((s: any) => s.name === 'Shots on target')?.away || 0;

            // Corners for football or rebounds for basketball
            const homeCorners = homeStats.groups?.find((g: any) =>
                g.groupName === 'TVData' || g.groupName === 'Rebounds'
            )?.statisticsItems?.find((s: any) => s.name === 'Corner kicks' || s.name === 'Rebounds')?.home || 0;

            const awayCorners = homeStats.groups?.find((g: any) =>
                g.groupName === 'TVData' || g.groupName === 'Rebounds'
            )?.statisticsItems?.find((s: any) => s.name === 'Corner kicks' || s.name === 'Rebounds')?.away || 0;

            const winner = homeShots > awayShots ? matchContext.homeTeam : matchContext.awayTeam;
            const confidence = Math.round(50 + (Math.abs(homeShots - awayShots) * 5));

            const prediction = {
                winner: winner,
                confidence: `${Math.min(confidence, 85)}%`,
                reasoning: `${matchContext.homeTeam} domina con ${homePossession}% posesión y ${homeShots} tiros vs ${awayShots}. Marcador: ${matchContext.homeScore}-${matchContext.awayScore}.`,
                details: {
                    goals_points: `${matchContext.homeScore}-${matchContext.awayScore}`,
                    corners_rebounds: sport === 'football' ? `${homeCorners}-${awayCorners} corners` : `${homeCorners}-${awayCorners} rebotes`,
                    cards_fouls: "Stats en vivo",
                    shots_accuracy: `${homeShots}-${awayShots} tiros (${homeShotsOnTarget}-${awayShotsOnTarget} al arco)`
                },
                bettingTip: `${winner} ML`
            };

            return NextResponse.json({
                success: true,
                prediction: JSON.stringify(prediction, null, 2),
                note: "Configure GROQ_API_KEY para predicciones con IA"
            });
        }

        // 4. Generar predicción con Groq
        const groq = new Groq({ apiKey });

        const prompt = `Eres un experto en análisis deportivo. Analiza el siguiente partido de ${sport} y proporciona una predicción detallada.

Partido: ${matchContext.homeTeam} vs ${matchContext.awayTeam}
Marcador actual: ${matchContext.homeScore} - ${matchContext.awayScore}
Estado: ${matchContext.status}

Estadísticas:
${JSON.stringify(matchContext.statistics, null, 2)}

Responde SOLO con un JSON en este formato exacto (sin bloques de código markdown):
{
  "winner": "Nombre del equipo favorito",
  "confidence": "X%",
  "reasoning": "Análisis breve basado en las estadísticas reales (máximo 180 caracteres)",
  "details": {
    "goals_points": "Predicción marcador final (ej: 2-1)",
    "corners_rebounds": "Solo corners si es fútbol o rebotes si es basket (ej: 8-5)",
    "cards_fouls": "Tarjetas amarillas/rojas o faltas",
    "shots_accuracy": "Tiros totales y al arco (ej: 15 tiros, 7 al arco)"
  },
  "bettingTip": "Recomendación específica (ej: ${matchContext.homeTeam} ML @ 1.85)"
}`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 1024
        });

        const prediction = completion.choices[0]?.message?.content || '';

        return NextResponse.json({
            success: true,
            prediction: prediction
        });

    } catch (error: any) {
        console.error('Error generating prediction:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
