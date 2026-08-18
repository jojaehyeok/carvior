'use client';

type Listing = { mileage: number; priceManwon: number };

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

export default function PriceChart({ listings, targetMileage }: { listings: Listing[]; targetMileage?: number }) {
  const points = listings
    .filter((l) => l.mileage > 0 && l.priceManwon > 0)
    .map((l) => ({ x: l.mileage / 10000, y: l.priceManwon }));

  if (points.length < 4) return null;

  const predict = quadFit(points);
  if (!predict) return null;

  const W = 640, H = 300, PAD_L = 60, PAD_B = 30, PAD_T = 16, PAD_R = 16;
  const xs = points.map((p) => p.x);
  const maxX = Math.max(...xs, (targetMileage ?? 0) / 10000) * 1.08 || 1;
  const minX = 0;
  const ys = points.map((p) => p.y);
  const maxY = Math.max(...ys) * 1.08;
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

  const yTicks = 5;
  const yGrid = Array.from({ length: yTicks + 1 }, (_, i) => (maxY / yTicks) * i);

  return (
    <div className="mb-8">
      {targetY != null && (
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 mb-1">내 차 예상시세 (무사고 기준)</p>
          <p className="text-3xl font-black text-gray-900">
            {rangeLow.toLocaleString()} ~ {rangeHigh.toLocaleString()}
            <span className="text-lg font-bold text-gray-400 ml-1">만원</span>
          </p>
        </div>
      )}
      <div className="overflow-x-auto">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ minWidth: W }}>
          {yGrid.map((y, i) => (
            <g key={i}>
              <line x1={PAD_L} x2={W - PAD_R} y1={sy(y)} y2={sy(y)} stroke="#f1f1f1" strokeWidth={1} />
              <text x={PAD_L - 8} y={sy(y) + 4} fontSize={11} fill="#9ca3af" textAnchor="end">
                {y >= 10000 ? `${(y / 10000).toFixed(1)}억` : `${Math.round(y).toLocaleString()}`}
              </text>
            </g>
          ))}
          <line x1={PAD_L} x2={W - PAD_R} y1={H - PAD_B} y2={H - PAD_B} stroke="#e5e7eb" strokeWidth={1} />
          {[0, maxX / 2, maxX].map((x, i) => (
            <text key={i} x={sx(x)} y={H - PAD_B + 18} fontSize={11} fill="#9ca3af" textAnchor="middle">
              {Math.round(x * 10) / 10}만km
            </text>
          ))}

          {points.map((p, i) => (
            <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3.5} fill="#bfdbfe" />
          ))}

          <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth={2.5} />

          {targetY != null && (
            <>
              <line
                x1={sx(targetMileage! / 10000)} x2={sx(targetMileage! / 10000)}
                y1={sy(targetY)} y2={H - PAD_B}
                stroke="#2563eb" strokeWidth={1} strokeDasharray="3,3"
              />
              <circle cx={sx(targetMileage! / 10000)} cy={sy(targetY)} r={6} fill="#2563eb" stroke="#fff" strokeWidth={2} />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
