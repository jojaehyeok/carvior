import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const NEST_BASE = 'http://localhost:4000/api/v1/admin/store-items';
const DATA_PATH = path.join(process.cwd(), 'data', 'store-items.json');

// ── JSON 폴백 헬퍼 ──────────────────────────────────────
function readItems(): StoreItem[] {
  try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8')); }
  catch { return []; }
}
function writeItems(items: StoreItem[]) {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
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
  status: 'active' | 'sold' | 'hidden' | 'pending';
  photos: Record<string, string[]>;
  specs: { label: string; value: string }[];
  options: string[];
  adminMemo: string;
}

// ── NestJS 프록시 (실패 시 JSON 폴백) ───────────────────
async function nestGet(): Promise<Response | null> {
  try {
    const res = await fetch(NEST_BASE, { signal: AbortSignal.timeout(3000) });
    if (res.ok) return res;
  } catch { /* NestJS 미배포 중 */ }
  return null;
}

// GET
export async function GET() {
  const nest = await nestGet();
  if (nest) {
    const data = await nest.json();
    return NextResponse.json(data);
  }
  return NextResponse.json(readItems());
}

// POST
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // NestJS 먼저 시도
    try {
      const res = await fetch(NEST_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
      }
    } catch { /* 폴백 */ }

    // JSON 파일 폴백
    const items = readItems();
    if (items.find(i => i.bookingId === body.bookingId)) {
      return NextResponse.json({ error: '이미 등록된 예약입니다.' }, { status: 409 });
    }
    const newItem: StoreItem = {
      ...body,
      id: String(body.bookingId ?? Date.now()),
      status: 'pending',
      registeredAt: new Date().toISOString(),
    };
    items.unshift(newItem);
    writeItems(items);

    // 관리자 SMS (fire-and-forget)
    const priceMan = newItem.priceKRW ? Math.round(newItem.priceKRW / 10_000) : 0;
    fetch('https://carvior.store/api/v1/admin/notify/self-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        carNumber: newItem.carNumber,
        title: newItem.titleKo,
        price: String(priceMan),
        contact: newItem.adminMemo?.match(/연락처:([^\s/\n]+)/)?.[1]?.trim() ?? '',
      }),
    }).catch(() => {});

    return NextResponse.json(newItem, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// PATCH
export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id 필요' }, { status: 400 });
  try {
    const patch = await req.json();

    try {
      const res = await fetch(`${NEST_BASE}?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) return NextResponse.json(await res.json());
    } catch { /* 폴백 */ }

    const items = readItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return NextResponse.json({ error: '없는 아이템' }, { status: 404 });
    items[idx] = { ...items[idx], ...patch };
    writeItems(items);
    return NextResponse.json(items[idx]);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id 필요' }, { status: 400 });

  try {
    const res = await fetch(`${NEST_BASE}?id=${id}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) return NextResponse.json({ ok: true });
  } catch { /* 폴백 */ }

  const items = readItems();
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) {
    return NextResponse.json({ error: '없는 아이템' }, { status: 404 });
  }
  writeItems(filtered);
  return NextResponse.json({ ok: true });
}
