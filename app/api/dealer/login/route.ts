import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Dealer {
  code: string;
  name: string;
  company: string;
}

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: '코드를 입력해주세요.' }, { status: 400 });

    const filePath = path.join(process.cwd(), 'data', 'dealers.json');
    const dealers: Dealer[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const matched = dealers.find(d => d.code === code.trim().toUpperCase());
    if (!matched) return NextResponse.json({ error: '유효하지 않은 딜러 코드입니다.' }, { status: 401 });

    return NextResponse.json({ ok: true, dealer: matched });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
