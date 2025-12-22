import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { groqService } from '@/lib/services/groqService';
import { NewsAnalysisSchema } from '@/lib/schemas/prediction-schemas';

const parser = new Parser();

// Simple in-memory cache
let newsCache: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET() {
    try {
        const now = Date.now();

        // Return cache if valid
        if (newsCache && (now - lastFetchTime < CACHE_DURATION)) {
            console.log('📰 Serving news from cache');
            return NextResponse.json({ success: true, data: newsCache });
        }

        console.log('🔄 Fetching fresh news from RSS...');

        // 1. Fetch RSS Feed (ESPN or similar)
        const feed = await parser.parseURL('https://www.espn.com/espn/rss/news');

        // Take top 3 news items
        const topItems = feed.items.slice(0, 3);

        // 2. Process with Groq AI
        const processedNews = await Promise.all(topItems.map(async (item: any, index: number) => {
            try {
                // Determine mock image based on content (since RSS usually lacks good images)
                // In a real app, we would scrape the OG:Image, but for stability we use keyword matching
                let imageUrl = "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1000&auto=format&fit=crop"; // Generic Sport
                const LowerTitle = item.title?.toLowerCase() || "";

                if (LowerTitle.includes('nba') || LowerTitle.includes('lakers') || LowerTitle.includes('lebron')) {
                    imageUrl = "https://images.unsplash.com/photo-1546519638-68e109498ee2?q=80&w=1000&auto=format&fit=crop";
                } else if (LowerTitle.includes('soccer') || LowerTitle.includes('football') || LowerTitle.includes('madrid') || LowerTitle.includes('messi')) {
                    imageUrl = "https://images.unsplash.com/photo-1510660603728-40a256df2e7b?q=80&w=1000&auto=format&fit=crop";
                }

                // AI Analysis usando groqService
                const aiResult = await groqService.createPrediction({
                    messages: [
                        {
                            role: "system",
                            content: `You are a sports betting analyst AI. 
                            Analyze the news headline and summary. 
                            Output a JSON object with: 
                            - bettingSignal: A short, punchy sentence explaining how this affects betting (e.g. "Lakers odds improve", "Avoid Moneyline").
                            - sentiment: "positive", "negative", or "neutral".
                            - impactScore: number 0-100.
                            - brutalTitle: Rewrite the title in a short, "brutal/cyberpunk" style (max 6 words).`
                        },
                        {
                            role: "user",
                            content: `Title: ${item.title}\nSummary: ${item.contentSnippet || item.content}`
                        }
                    ],
                    model: "llama-3.3-70b-versatile",
                    response_format: { type: "json_object" },
                    schema: NewsAnalysisSchema
                });

                return {
                    id: `rss-${index}-${Date.now()}`,
                    title: aiResult.brutalTitle || item.title,
                    summary: item.contentSnippet?.substring(0, 100) + "...",
                    source: "ESPN / AI Stats",
                    url: item.link,
                    imageUrl: imageUrl,
                    publishedAt: item.pubDate || new Date().toISOString(),
                    aiAnalysis: {
                        sentiment: aiResult.sentiment || 'neutral',
                        bettingSignal: aiResult.bettingSignal || "Analizando impacto en cuotas...",
                        impactScore: aiResult.impactScore || 50
                    }
                };

            } catch (err) {
                console.error("Error processing item with AI:", err);

                // FALLBACK: Return item without AI improvement if API Key fails (401) or other error
                return {
                    id: `err-${index}`,
                    title: item.title,
                    summary: item.contentSnippet || item.content || "Noticias de última hora",
                    source: "ESPN",
                    url: item.link,
                    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1000&auto=format&fit=crop",
                    publishedAt: item.pubDate || new Date().toISOString(),
                    aiAnalysis: {
                        sentiment: 'neutral',
                        bettingSignal: "Análisis en proceso...",
                        impactScore: 50
                    }
                };
            }
        }));

        // Update Cache
        newsCache = processedNews;
        lastFetchTime = now;

        return NextResponse.json({ success: true, data: processedNews });

    } catch (error: any) {
        console.error('❌ News API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
