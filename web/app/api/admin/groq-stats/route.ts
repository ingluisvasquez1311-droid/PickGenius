import { NextRequest, NextResponse } from 'next/server';
import { groqService } from '@/lib/services/groqService';
import { getUserProfile } from '@/lib/userService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Simple security check (could be enhanced)
        // Ideally we'd check the session/token here

        const stats = groqService.getStats();

        return NextResponse.json({
            success: true,
            timestamp: Date.now(),
            ...stats
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Handle reset or other actions
        const body = await request.json();

        if (body.action === 'reset') {
            groqService.reset();
            return NextResponse.json({ success: true, message: 'Stats reseteadas' });
        }

        return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
