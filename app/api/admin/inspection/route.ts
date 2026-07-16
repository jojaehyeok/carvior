import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://carvior.store/api/v1';
const INTERNAL_KEY = process.env.STORE_ITEMS_INTERNAL_KEY ?? '';

// GET /api/admin/inspection?bookingId=123 — 진단 리포트 원본(사진 등)은 관리자 대시보드 전용
export async function GET(req: NextRequest) {
  const internalKey = req.headers.get('x-internal-key');
  if (!internalKey || internalKey !== INTERNAL_KEY) {
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  }
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
