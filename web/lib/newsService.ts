
export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    source: string;
    url: string;
    imageUrl?: string;
    publishedAt: string;
    aiAnalysis?: {
        sentiment: 'positive' | 'negative' | 'neutral';
        bettingSignal: string;
        impactScore: number; // 0-100
    };
}

const MOCK_NEWS: NewsItem[] = [
    {
        id: '1',
        title: "Mbappé fuera de la convocatoria del Real Madrid por molestias",
        summary: "El astro francés no viajará a Sevilla. Ancelotti confirma rotaciones masivas pensando en Champions.",
        source: "Marca",
        url: "#",
        imageUrl: "https://images.unsplash.com/photo-1628891565293-b8163f92f623?q=80&w=1000&auto=format&fit=crop", // Real Madrid / Stadium vibe
        publishedAt: new Date().toISOString(),
        aiAnalysis: {
            sentiment: 'negative',
            bettingSignal: "📉 Real Madrid Win% baja un 12%. Valor en 'Empate' o Sevilla +0.5.",
            impactScore: 85
        }
    },
    {
        id: '2',
        title: "Lakers firman racha de 5 victorias con LeBron en modo MVP",
        summary: "Dominio absoluto en la pintura. Anthony Davis promedia 30 puntos en los últimos 3 juegos.",
        source: "ESPN",
        url: "#",
        imageUrl: "https://images.unsplash.com/photo-1518407613690-d9fc996e726e?q=80&w=1000&auto=format&fit=crop", // Pro Basketball Girl/Guy (Lakers vibe)
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        aiAnalysis: {
            sentiment: 'positive',
            bettingSignal: "🔥 Lakers cubrirán el spread (-4.5). Over de puntos de AD muy probable.",
            impactScore: 92
        }
    },
    {
        id: '3',
        title: "Manchester City: Haaland duda para el derby",
        summary: "Guardiola no asegura la presencia del noruego. Julián Álvarez podría ser titular.",
        source: "Bleacher Report",
        url: "#",
        imageUrl: "https://images.unsplash.com/photo-1626025437642-0b05076ca301?q=80&w=1000&auto=format&fit=crop", // Man City Blue Stadium
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        aiAnalysis: {
            sentiment: 'neutral',
            bettingSignal: "⚠️ Evitar apuestas a 'Haaland Goleador'. Buscar valor en 'Ambos marcan'.",
            impactScore: 78
        }
    }
];

export async function getLatestNews(): Promise<NewsItem[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_NEWS;
}
