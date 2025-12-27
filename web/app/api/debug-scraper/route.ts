import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
    const vars = {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || null,
        NODE_ENV: process.env.NODE_ENV,
    };

    const bridgeUrl = vars.NEXT_PUBLIC_API_URL;
    const isVercel = !!process.env.VERCEL;

    let bridgeResult = null;
    let dataResult = null;
    let stealthResult = null;

    // 1. Bridge/Tunnel Connectivity Test
    if (bridgeUrl) {
        try {
            const startBridge = Date.now();
            const bridgeResponse = await fetch(`${bridgeUrl}/api/health`, {
                headers: { 'ngrok-skip-browser-warning': 'true' },
                signal: AbortSignal.timeout(8000)
            });

            bridgeResult = {
                status: bridgeResponse.status,
                ok: bridgeResponse.ok,
                latency: Date.now() - startBridge
            };

            // 2. REAL DATA TEST THROUGH BRIDGE (only if on Vercel)
            if (bridgeResponse.ok && isVercel) {
                const startData = Date.now();
                const dataResponse = await fetch(`${bridgeUrl}/api/proxy/sportsdata/sport/football/events/live`, {
                    headers: { 'ngrok-skip-browser-warning': 'true' },
                    signal: AbortSignal.timeout(10000)
                });

                if (dataResponse.ok) {
                    const data = await dataResponse.json();
                    dataResult = {
                        success: true,
                        count: data.events?.length || 0,
                        latency: Date.now() - startData,
                        message: "✅ DATOS REALES RECIBIDOS DESDE CASA"
                    };
                } else {
                    const errorText = await dataResponse.text().catch(() => "Unknown");
                    dataResult = {
                        success: false,
                        status: dataResponse.status,
                        error: errorText.substring(0, 100),
                        message: "❌ EL PUENTE NO DEVOLVIÓ DATOS (Posible bloqueo o error local)"
                    };
                }
            }
        } catch (e: any) {
            bridgeResult = { ...bridgeResult, error: e.message };
            dataResult = { success: false, error: e.message, message: "❌ ERROR DE CONEXIÓN AL REALIZAR TEST DE DATOS" };
        }
    }

    // 3. INTERNAL STEALTH TEST (Mimicry Verification)
    // This tests if the server where this code runs can hit Sofascore
    try {
        const testUrl = 'https://api.sofascore.com/api/v1/sport/football/events/live';
        const startStealth = Date.now();
        const stealthResponse = await fetch(testUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                'Referer': 'https://www.sofascore.com/',
                'Origin': 'https://www.sofascore.com',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
                'Sec-Fetch-Mode': 'cors'
            },
            signal: AbortSignal.timeout(10000)
        });

        stealthResult = {
            status: stealthResponse.status,
            ok: stealthResponse.ok,
            latency: Date.now() - startStealth,
            events: stealthResponse.ok ? (await stealthResponse.json()).events?.length : 0
        };
    } catch (e: any) {
        stealthResult = { error: e.message };
    }

    const diagnostics = {
        timestamp: new Date().toISOString(),
        overall_status: (bridgeResult?.ok && (isVercel ? dataResult?.success : stealthResult?.ok)) ? "✅ SISTEMA OPERATIVO" : "❌ PROBLEMA DETECTADO",
        bridge_tunnel: {
            configured: !!bridgeUrl,
            url: bridgeUrl,
            connection: bridgeResult,
            real_data_flow: dataResult || "N/A (Carga en Vercel para probar flujo)"
        },
        local_stealth_test: {
            description: "Prueba si este servidor (Vercel o PC) puede llegar a Sofascore directamente",
            result: stealthResult
        },
        stealth_config: {
            mimic_browser: true,
            browser_version: "Chrome 120",
            scraper_api: "OFF"
        },
        env: {
            is_vercel: isVercel,
            node_env: vars.NODE_ENV
        }
    };

    return NextResponse.json(diagnostics, { status: 200 });
}