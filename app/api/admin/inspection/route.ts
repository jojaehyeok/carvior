import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://carvior.store/api/v1';

// GET /api/admin/inspection?bookingId=123
export async function GET(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get('bookingId');
  if (!bookingId) return NextResponse.json({ error: 'bookingId 필요' }, { status: 400 });

  try {
    const res = await fetch(`${BACKEND_URL}/external/inspection/report/${bookingId}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Backend ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
