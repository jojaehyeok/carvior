import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'store-items.json');

function readItems(): StoreItem[] {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function writeItems(items: StoreItem[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(items, null, 2), 'utf-8');
}

export interface StoreItem {
  id: string;
  bookingId: number;
  carNumber: string;
  titleKo: string;
  titleEn: string;
  trim: string;
  year: number;
  mileage: number;
  fuel: string;
  displacement: string;
  transmission: string;
  color: string;
  colorKo: string;
  accident: boolean;
  priceKRW: number;
  priceUSD: number;
  category: string;
  region: string;
  inspectedAt: string;
  registeredAt: string;
  status: 'active' | 'sold' | 'hidden';
  photos: {
    exterior: string[];
    interior: string[];
    engine: string[];
    wheel: string[];
    undercarriage: string[];
    damage: string[];
    extra: string[];
  };
  specs: { label: string; value: string }[];
  options: string[];
  adminMemo: string;
}

// GET /api/admin/store-items
export async function GET() {
  return NextResponse.json(readItems());
}

// POST /api/admin/store-items  — 신규 등록
export async function POST(req: NextRequest) {
  try {
    const body: Omit<StoreItem, 'id' | 'registeredAt'> = await req.json();
    const items = readItems();

    if (items.find(i => i.bookingId === body.bookingId)) {
      return NextResponse.json({ error: '이미 등록된 예약입니다.' }, { status: 409 });
    }

    const newItem: StoreItem = {
      ...body,
      id: String(body.bookingId),
      status: body.status ?? 'active',   // 셀프등록은 바로 노출
      registeredAt: new Date().toISOString(),
    };

    items.unshift(newItem);
    writeItems(items);

    // 관리자 SMS 알림 (fire-and-forget)
    const priceMan = newItem.priceKRW ? Math.round(newItem.priceKRW / 10_000) : 0;
    fetch('https://carvior.store/api/v1/admin/notify/self-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        carNumber: newItem.carNumber,
        title: newItem.titleKo,
        price: String(priceMan),
        contact: newItem.adminMemo?.match(/연락처:([^\s/]+)/)?.[1]?.trim() ?? '',
      }),
    }).catch(() => {});

    return NextResponse.json(newItem, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH /api/admin/store-items?id=xxx — 수정 (status 변경, 가격 수정 등)
export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id 필요' }, { status: 400 });

  try {
    const patch = await req.json();
    const items = readItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return NextResponse.json({ error: '없는 아이템' }, { status: 404 });

    items[idx] = { ...items[idx], ...patch };
    writeItems(items);
    return NextResponse.json(items[idx]);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/admin/store-items?id=xxx — 삭제
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id 필요' }, { status: 400 });

  const items = readItems();
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) {
    return NextResponse.json({ error: '없는 아이템' }, { status: 404 });
  }
  writeItems(filtered);
  return NextResponse.json({ ok: true });
}
