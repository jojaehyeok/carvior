import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA = path.join(process.cwd(), 'data', 'item-stats.json');

function read(): Record<string, { views: number; likes: number }> {
  try { return JSON.parse(fs.readFileSync(DATA, 'utf-8')); }
  catch { return {}; }
}
function write(d: Record<string, { views: number; likes: number }>) {
  fs.mkdirSync(path.dirname(DATA), { recursive: true });
  fs.writeFileSync(DATA, JSON.stringify(d, null, 2), 'utf-8');
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const all = read();
  return NextResponse.json(all[params.id] ?? { views: 0, likes: 0 });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { action } = await req.json(); // 'view' | 'like' | 'unlike'
  const all = read();
  const cur = all[params.id] ?? { views: 0, likes: 0 };
  if (action === 'view')   cur.views  = (cur.views  ?? 0) + 1;
  if (action === 'like')   cur.likes  = (cur.likes  ?? 0) + 1;
  if (action === 'unlike') cur.likes  = Math.max(0, (cur.likes ?? 0) - 1);
  all[params.id] = cur;
  write(all);
  return NextResponse.json(cur);
}
