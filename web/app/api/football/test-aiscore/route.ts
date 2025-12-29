import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// API interna de AiScore que suele ser más abierta que el HTML
const AISCORE_INTERNAL_API = 'https://api.aiscore.com/v1/football/match/live';

export async function GET(request: NextRequest) {
    try {
        console.log(`🧪 [TEST] Intentando AiScore Directo con tu IP...`);

        const res = await fetch(AISCORE_INTERNAL_API, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Origin': 'https://www.aiscore.com',
                'Referer': 'https://www.aiscore.com/'
            },
            next: { revalidate: 0 }
        });

        if (res.ok) {
            const data = await res.json();
            console.log("✅ AiScore Directo FUNCIONÓ!");
            return NextResponse.json({ success: true, count: data.data?.length || 0, data: data.data });
        }

        console.error(`❌ AiScore falló: ${res.status}`);
        return NextResponse.json({
            success: false,
            status: res.status,
            message: 'AiScore también bloquea peticiones directas de servidor.'
        }, { status: res.status });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
