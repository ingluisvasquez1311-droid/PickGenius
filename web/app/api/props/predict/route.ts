import { NextRequest, NextResponse } from 'next/server';
import { propsService, PlayerProp } from '@/lib/services/propsService';

export async function POST(request: NextRequest) {
    try {
        const prop: PlayerProp = await request.json();

        if (!prop || !prop.id) {
            return NextResponse.json({ success: false, error: 'Missing prop data' }, { status: 400 });
        }

        console.log(`🎯 [API] Predicting prop ${prop.id} for ${prop.player.name}`);
        const prediction = await propsService.predictProp(prop);

        return NextResponse.json({
            success: true,
            data: prediction
        });
    } catch (error: any) {
        console.error('❌ [API Error] Predict Prop:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}