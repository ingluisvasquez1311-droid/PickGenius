import { NextResponse } from 'next/server';

export async function GET() {
    // Highly curated AI-driven news for the "Radar Info-Betting" section
    const news = [
        {
            id: 'nfl-week-18',
            title: 'NFL Week 18 Odds Shift',
            description: 'Las casas de apuestas globales ajustan líneas tras confirmación de lesiones clave en la AFC.',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=800&auto=format&fit=crop',
            source: 'ESPN / AI Stats',
            url: 'https://www.espn.com/nfl/',
            aiInsight: 'NFL odds shift ahead of Week 18 due to liquidity variance.',
            impact: 60,
            category: 'NFL'
        },
        {
            id: 'nba-rookies',
            title: 'Rookies Take Field',
            description: 'El impacto de los novatos en la rotación de segundo cuarto está generando ineficiencias en el mercado de Over/Under.',
            image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop',
            source: 'NBA Intel / PickGenius',
            url: 'https://www.nba.com/news',
            aiInsight: 'Rookie QB and Guard odds uncertain for live betting sessions.',
            impact: 24,
            category: 'NBA'
        },
        {
            id: 'diggs-felony',
            title: 'Diggs Strategic Shift',
            description: 'Ajustes tácticos de última hora en la defensiva de los Patriots impactan el valor total del partido.',
            image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=800&auto=format&fit=crop',
            source: 'AI Predictive Logs',
            url: 'https://www.nfl.com/news/',
            aiInsight: 'Patriots Super Bowl odds plummet after defensive restructuring.',
            impact: 95,
            category: 'NFL'
        },
        {
            id: 'champions-league',
            title: 'Champions League Volatility',
            description: 'La variabilidad en el desempeño de los visitantes en octavos sugiere un "Under" masivo para la jornada de hoy.',
            image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
            source: 'FIFA Analytics',
            url: 'https://www.uefa.com/uefachampionsleague/news/',
            aiInsight: 'Visitor variance indicates potential defensive deadlock in CL.',
            impact: 78,
            category: 'Football'
        }
    ];

    return NextResponse.json({ news });
}
