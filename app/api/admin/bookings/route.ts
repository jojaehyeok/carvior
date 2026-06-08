import { NextResponse } from 'next/server';

const BACKEND_URL = 'https://carvior.store/api/v1';

export async function GET() {
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
