'use client';

type Listing = { mileage: number; priceManwon: number };

// 축 눈금을 100/200/500 단위 같은 "깔끔한" 값으로 반올림(닫힌 구간의 최대값도 그 배수로 맞춤)
function niceAxis(rawMax: number, ticks: number) {
  if (rawMax <= 0) return { step: 1, max: ticks };
  const roughStep = rawMax / ticks;
  const exponent = Math.floor(Math.log10(roughStep));
  const fraction = roughStep / Math.pow(10, exponent);
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  const step = niceFraction * Math.pow(10, exponent);
  const max = step * Math.ceil(rawMax / step);
  return { step, max };
}

function quadFit(points: { x: number; y: number }[]) {
  let S0 = 0, S1 = 0, S2 = 0, S3 = 0, S4 = 0, T0 = 0, T1 = 0, T2 = 0;
  for (const { x, y } of points) {
    const x2 = x * x, x3 = x2 * x, x4 = x2 * x2;
    S0 += 1; S1 += x; S2 += x2; S3 += x3; S4 += x4;
    T0 += y; T1 += x * y; T2 += x2 * y;
  }
  const det3 = (m: number[][]) =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const M = [[S0, S1, S2], [S1, S2, S3], [S2, S3, S4]];
  const D = det3(M);
  if (Math.abs(D) < 1e-9) return null;
  const a = det3([[T0, S1, S2], [T1, S2, S3], [T2, S3, S4]]) / D;
  const b = det3([[S0, T0, S2], [S1, T1, S3], [S2, T2, S4]]) / D;
  const c = det3([[S0, S1, T0], [S1, S2, T1], [S2, S3, T2]]) / D;
  return (x: number) => a + b * x + c * x * x;
}

export default function PriceChart({
  listings,
  targetMileage,
  subtitle,
}: {
  listings: Listing[];
  targetMileage?: number;
  subtitle?: string;
}) {
  const points = listings
    .filter((l) => l.mileage > 0 && l.priceManwon > 0)
    .map((l) => ({ x: l.mileage / 10000, y: l.priceManwon }));

  if (points.length < 4) return null;

  const predict = quadFit(points);
  if (!predict) return null;

  const W = 640, H = 300, PAD_L = 64, PAD_B = 30, PAD_T = 16, PAD_R = 16;
  const xs = points.map((p) => p.x);
  const rawMaxX = Math.max(...xs, (targetMileage ?? 0) / 10000) * 1.08 || 1;
  const xAxis = niceAxis(rawMaxX, 5);
  const maxX = xAxis.max;
  const minX = 0;
  const ys = points.map((p) => p.y);
  const yAxis = niceAxis(Math.max(...ys) * 1.08, 4);
  const maxY = yAxis.max;
  const minY = 0;

  const sx = (x: number) => PAD_L + ((x - minX) / (maxX - minX)) * (W - PAD_L - PAD_R);
  const sy = (y: number) => H - PAD_B - ((y - minY) / (maxY - minY)) * (H - PAD_B - PAD_T);

  const curvePath = Array.from({ length: 41 }, (_, i) => {
    const x = minX + ((maxX - minX) * i) / 40;
    return `${i === 0 ? 'M' : 'L'}${sx(x)},${sy(Math.max(0, predict(x)))}`;
  }).join(' ');

  const residuals = points.map((p) => p.y - predict(p.x));
  const meanSq = residuals.reduce((s, r) => s + r * r, 0) / residuals.length;
  const stdev = Math.sqrt(meanSq);

  let targetY: number | null = null;
  let rangeLow = 0, rangeHigh = 0;
  if (targetMileage != null && targetMileage > 0) {
    const tx = targetMileage / 10000;
    targetY = Math.max(0, predict(tx));
    const margin = Math.max(stdev * 0.5, targetY * 0.03);
    rangeLow = Math.round((targetY - margin) / 10) * 10;
    rangeHigh = Math.round((targetY + margin) / 10) * 10;
  }

  const yGrid = Array.from({ length: Math.round(maxY / yAxis.step) + 1 }, (_, i) => yAxis.step * i);
  const targetX = targetMileage != null ? targetMileage / 10000 : null;
  // x축은 0/5만/10만... 처럼 일정 간격 눈금으로 쭉 나열하고, 내 차 위치와 겹치는 눈금만 그
  // 칸을 "내차 N만km"로 대체한다 — 내 차 라벨이 별도로 떠서 다른 눈금과 겹치는 일이 없게.
  const xTicks = Array.from({ length: Math.round(maxX / xAxis.step) + 1 }, (_, i) => xAxis.step * i);
  const nearTargetTick =
    targetX != null ? xTicks.reduce((best, t) => (Math.abs(t - targetX) < Math.abs(best - targetX) ? t : best), xTicks[0]) : null;
  const targetMergedWithTick = targetX != null && nearTargetTick != null && Math.abs(nearTargetTick - targetX) < xAxis.step * 0.3;

  return (
    <div className="mb-8">
      {targetY != null && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-black text-gray-900">내 차 예상시세</h3>
            <span className="text-[11px] font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
              무사고 기준
            </span>
          </div>
          <p className="text-3xl font-black text-gray-900 mb-2">
            {rangeLow.toLocaleString()} ~ {rangeHigh.toLocaleString()}
            <span className="text-lg font-bold text-gray-400 ml-1">만원</span>
          </p>
          {subtitle && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              {subtitle}
            </div>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ minWidth: W }}>
          {yGrid.map((y, i) => (
            <g key={i}>
              <line x1={PAD_L} x2={W - PAD_R} y1={sy(y)} y2={sy(y)} stroke="#f3f4f6" strokeWidth={1} />
              <text x={PAD_L - 10} y={sy(y) + 4} fontSize={11} fill="#9ca3af" textAnchor="end">
                {Math.round(y).toLocaleString()}만원
              </text>
            </g>
          ))}
          <line x1={PAD_L} x2={W - PAD_R} y1={H - PAD_B} y2={H - PAD_B} stroke="#e5e7eb" strokeWidth={1} />

          {points.map((p, i) => (
            <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3} fill="#dbeafe" />
          ))}

          <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round" />

          {xTicks.map((t, i) => {
            if (targetMergedWithTick && t === nearTargetTick) return null;
            const anchor = i === 0 ? 'start' : i === xTicks.length - 1 ? 'end' : 'middle';
            return (
              <text key={i} x={sx(t)} y={H - PAD_B + 19} fontSize={11} fill="#c1c5cc" textAnchor={anchor}>
                {Math.round(t)}만km
              </text>
            );
          })}

          {targetX != null && targetY != null && (
            <>
              <line
                x1={sx(targetX)} x2={sx(targetX)}
                y1={sy(targetY)} y2={H - PAD_B}
                stroke="#2563eb" strokeWidth={1} strokeDasharray="3,3"
              />
              <circle cx={sx(targetX)} cy={sy(targetY)} r={6} fill="#2563eb" stroke="#fff" strokeWidth={2} />
              <text x={sx(targetX)} y={H - PAD_B + 19} fontSize={11} fontWeight={700} fill="#2563eb" textAnchor="middle">
                내차 {Math.round(targetX)}만km
              </text>
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
