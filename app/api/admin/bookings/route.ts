import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://carvior.store/api/v1';
const INTERNAL_KEY = process.env.STORE_ITEMS_INTERNAL_KEY ?? '';

// 예약 원본 데이터(차량번호·주소 등)는 관리자 대시보드 전용 — 일반 공개 API 아님
export async function GET(req: NextRequest) {
  const internalKey = req.headers.get('x-internal-key');
  if (!internalKey || internalKey !== INTERNAL_KEY) {
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  }
  try {
    const res = await fetch(`${BACKEND_URL}/external/request/list`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);

    const raw = await res.json();
    const all: any[] = Array.isArray(raw) ? raw : raw.data ?? [];

    const completed = all
      .filter((b: any) => b.status === 'COMPLETED')
      .sort((a: any, b: any) => {
        const dateA = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
        const dateB = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
        return dateB - dateA;
      });

    return NextResponse.json(completed);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
