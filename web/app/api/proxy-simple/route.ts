import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // Eliminado por petición del usuario: No queremos datos mock.
    return NextResponse.json({
        success: false,
        message: "Proxy de mock desactivado. Usando fuente real de Scraper/Redis."
    }, { status: 404 });
}
