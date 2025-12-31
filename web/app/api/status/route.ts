import { NextResponse } from 'next/server';
import { apiStats, sofafetch } from '@/lib/api-utils';

export async function GET() {
    const startTime = Date.now();
    let sofaLatency = -1;
    let sofaStatus = 'OFFLINE';

    try {
        // Perform a lightweight health check to Sofascore
        const sofaStart = Date.now();
        await sofafetch('https://api.sofascore.com/api/v1/sport/football/events/live', { revalidate: 0 });
        sofaLatency = Date.now() - sofaStart;
        sofaStatus = 'ONLINE';
    } catch (error) {
        console.error("Health check failed for Sofascore:", error);
        sofaStatus = 'DEGRADED';
    }

    const uptime = Date.now() - apiStats.start_time;

    return NextResponse.json({
        system: {
            status: sofaStatus === 'ONLINE' ? 'HEALTHY' : 'ISSUES',
            uptime_ms: uptime,
            uptime_human: formatDuration(uptime),
            version: '4.2.8_STABLE',
            environment: process.env.NODE_ENV
        },
        connectivity: {
            sofascore: {
                status: sofaStatus,
                latency_ms: sofaLatency,
                endpoint: 'api.sofascore.com'
            },
            proxy: {
                status: 'ONLINE',
                provider: 'wsrv.nl',
                features: ['webp', 'resize', 'stealth']
            }
        },
        metrics: {
            total_requests: apiStats.requests_total,
            successful_requests: apiStats.requests_success,
            failed_requests: apiStats.requests_failed,
            success_rate: apiStats.requests_total > 0
                ? ((apiStats.requests_success / apiStats.requests_total) * 100).toFixed(2) + '%'
                : '100%',
            last_request_at: apiStats.last_request_time
                ? new Date(apiStats.last_request_time).toISOString()
                : null
        },
        logs: apiStats.errors.slice(0, 5)
    });
}

function formatDuration(ms: number) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
}
