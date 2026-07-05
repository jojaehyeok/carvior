import { NextRequest, NextResponse } from 'next/server';

const NEST_BASE = 'http://localhost:4000/api/v1/admin/store-items';

async function proxyTo(path: string, init?: RequestInit) {
  const res = await fetch(NEST_BASE + path, init);
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function GET() {
  return proxyTo('');
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return proxyTo('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const body = await req.json();
  return proxyTo(`?id=${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  return proxyTo(`?id=${id}`, { method: 'DELETE' });
}
