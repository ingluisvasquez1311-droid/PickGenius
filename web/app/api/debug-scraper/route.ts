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
            console.log(`🔌 [Debug Bridge] Checking "Home IP" connection: ${bridgeUrl}/api/health`);

            // Advanced Stealth Headers for the test itself
            const stealthHeaders = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'ngrok-skip-browser-warning': 'true',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
                'Sec-Fetch-Mode': 'cors'
            };

            const bridgeResponse = await fetch(`${bridgeUrl}/api/health`, {
                headers: stealthHeaders,
                signal: AbortSignal.timeout(10000)
            });

            bridgeResult = {
                url: bridgeUrl,
                status: bridgeResponse.status,
                ok: bridgeResponse.ok,
                latency: Date.now() - startBridge,
                mimicry: "Enabled (Stealth Headers Active)"
            };

            if (!bridgeResponse.ok) {
                bridgeError = `HTTP ${bridgeResponse.status} ${bridgeResponse.statusText}`;
            }
        } catch (e: any) {
            bridgeError = e.message;
            console.error(`❌ [Debug Bridge] Sync Failed:`, e.message);
        }
    }

    const diagnostics = {
        timestamp: new Date().toISOString(),
        status: bridgeResult?.ok ? "✅ ONLINE (Home IP Bridge Active)" : "❌ OFFLINE (Check ngrok)",
        bridge_tunnel: {
            configured: !!bridgeUrl,
            url: bridgeUrl,
            success: !!bridgeResult?.ok,
            error: bridgeError,
            details: bridgeResult
        },
        stealth_config: {
            mimic_browser: true,
            user_agent: "Chrome 120 (Mimic)",
            home_ip_priority: true,
            scraper_api: "REMOVED"
        },
        environment: {
            is_vercel: !!process.env.VERCEL,
            node_env: vars.NODE_ENV
        },
        instruction: bridgeResult?.ok
            ? "El túnel está operando. Los datos se solicitan como un navegador real desde tu IP residencial."
            : "ERROR: Vercel no puede conectar con tu PC. Asegúrate de que ngrok esté corriendo y la URL configurada en Vercel sea la correcta."
    };

    return NextResponse.json(diagnostics, { status: 200 });
}
