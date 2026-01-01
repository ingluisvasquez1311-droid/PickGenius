import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { AUTHORIZED_ADMIN_EMAIL } from '@/lib/admin';
import { globalCache } from '@/services/cacheService';
import RedisManager from '@/lib/redis';
import Logger from '@/lib/logger';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Admin System Management API
 * GET: Returns real-time health and status metrics.
 * POST: Performs administrative actions like flushing cache.
 */

export async function GET() {
    try {
        const user = await currentUser();
        const primaryEmail = user?.emailAddresses[0]?.emailAddress;
        if (primaryEmail !== AUTHORIZED_ADMIN_EMAIL) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }
        const stats = {
            bridge: {
                status: process.env.NEXT_PUBLIC_API_URL ? 'online' : 'offline',
                url: process.env.NEXT_PUBLIC_API_URL || 'Not configured'
            },
            cache: {
                persistence: typeof window === 'undefined' ? 'hybrid' : 'memory',
                redisStatus: 'checking...'
            },
            environment: process.env.NODE_ENV,
            uptime: process.uptime(),
            timestamp: Date.now()
        };

        // Check Redis connectivity if server-side
        if (typeof window === 'undefined') {
            try {
                const redis = RedisManager.getInstance();
                const ping = await redis.ping();
                stats.cache.redisStatus = ping === 'PONG' ? 'connected' : 'error';
            } catch (e) {
                stats.cache.redisStatus = 'disconnected';
            }
        }

        return NextResponse.json(stats);
    } catch (error: any) {
        Logger.error('Admin System GET error', { error: error.message });
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        const primaryEmail = user?.emailAddresses[0]?.emailAddress;
        if (primaryEmail !== AUTHORIZED_ADMIN_EMAIL) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }
        const body = await req.json();
        const { action } = body;

        if (action === 'flush_cache') {
            Logger.warn('ADMIN ACTION: Flushing Global Cache invoked');
            await globalCache.flush();
            return NextResponse.json({ success: true, message: 'Global cache purged successfully' });
        }

        if (action === 'refresh_odds') {
            Logger.info('ADMIN ACTION: Refreshing BetPlay Odds invoked');

            // Execute the python script to update odds
            let pythonPath = process.env.PYTHON_PATH || 'python';
            const scriptPath = 'c:/Users/Daniel/PickGenius/python/download_betplay_odds.py';

            // Fallback for local dev if default python fails
            if (process.env.NODE_ENV === 'development') {
                const fs = await import('fs');
                const venvPython = 'c:/Users/Daniel/PickGenius/.venv/Scripts/python.exe';
                if (fs.existsSync(venvPython)) {
                    pythonPath = venvPython;
                }
            }

            try {
                const { stdout, stderr } = await execPromise(`"${pythonPath}" "${scriptPath}"`);
                if (stderr && !stderr.includes('Warning')) {
                    Logger.error('Odds Refresh Script Error', { stderr });
                }
                Logger.info('Odds Refresh Script Output', { stdout });
                return NextResponse.json({
                    success: true,
                    message: 'Odds synchronization complete',
                    details: stdout
                });
            } catch (err: any) {
                Logger.error('Failed to execute odds refresh script', { error: err.message });
                return NextResponse.json({ error: `Data Engine sync failed: ${err.message}` }, { status: 500 });
            }
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        Logger.error('Admin System POST error', { error: error.message });
        return NextResponse.json({ error: 'Command failed' }, { status: 500 });
    }
}
