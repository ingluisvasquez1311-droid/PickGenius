import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const vars = {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || null,
        NODE_ENV: process.env.NODE_ENV,
    };

    // 1. Bridge/Tunnel Test
    const bridgeUrl = vars.NEXT_PUBLIC_API_URL;
    let bridgeResult = null;
    let bridgeError = null;

    if (bridgeUrl) {
        try {
            const startBridge = Date.now();
            console.log(`🔌 [Debug Bridge] Checking connection to: ${bridgeUrl}/api/health`);

            const bridgeResponse = await fetch(`${bridgeUrl}/api/health`, {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                    'User-Agent': 'Vercel-Bridge-Monitor'
                },
                signal: AbortSignal.timeout(8000)
            });

            bridgeResult = {
                url: bridgeUrl,
                status: bridgeResponse.status,
                ok: bridgeResponse.ok,
                latency: Date.now() - startBridge,
                message: bridgeResponse.ok ? "✅ CONEXIÓN EXITOSA CON PC LOCAL" : "❌ ERROR EN PUENTE LOCAL"
            };

            if (!bridgeResponse.ok) {
                bridgeError = `HTTP ${bridgeResponse.status} ${bridgeResponse.statusText}`;
            }
        } catch (e: any) {
            bridgeError = e.message;
            console.error(`❌ [Debug Bridge] Connection Failed:`, e.message);
        }
    }

    const diagnostics = {
        timestamp: new Date().toISOString(),
        status: bridgeResult?.ok ? "ONLINE" : "OFFLINE",
        bridge_tunnel: {
            configured: !!bridgeUrl,
            url: bridgeUrl,
            success: !!bridgeResult?.ok,
            error: bridgeError,
            details: bridgeResult
        },
        environment: {
            node_env: vars.NODE_ENV,
            is_vercel: !!process.env.VERCEL,
            scraper_api_disabled: true
        },
        instruction: bridgeResult?.ok
            ? "Túnel configurado correctamente. Los datos en vivo deberían cargar."
            : "REVISA: 1. ngrok debe estar corriendo. 2. La URL en Vercel debe ser la actual de ngrok. 3. Haz 'Redeploy' en Vercel tras cambiar la URL."
    };

    return NextResponse.json(diagnostics, { status: 200 });
}
