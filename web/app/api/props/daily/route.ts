import { NextRequest, NextResponse } from 'next/server';
import { propsService } from '@/lib/services/propsService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sport = searchParams.get('sport') || 'basketball';

        console.log(`📊 [API] Fetching props for ${sport}`);
        const props = await propsService.getDailyProps(sport);

        return NextResponse.json({
            success: true,
            count: props.length,
            data: props
        });
    } catch (error: any) {
        console.error('❌ [API Error] Props:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
