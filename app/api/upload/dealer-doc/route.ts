import { NextRequest, NextResponse } from 'next/server';

const NEST = process.env.NEST_API_URL ?? 'http://localhost:4000/api';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const res = await fetch(`${NEST}/v1/users/upload-doc`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) return NextResponse.json({ error: '업로드 실패' }, { status: 500 });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
