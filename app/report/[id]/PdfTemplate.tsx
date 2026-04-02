import React from "react";

const PART_NAMES = [
  "운전석 앞휀더","운전석 앞도어","운전석 A필러","운전석 사이드실 패널",
  "운전석 B필러","운전석 뒷도어","운전석 C필러","운전석 쿼터패널",
  "후드","루프패널","트렁크 리드",
  "조수석 앞휀더","조수석 A필러","조수석 앞도어","조수석 사이드실 패널",
  "조수석 B필러","조수석 뒷도어","조수석 C필러","조수석 쿼터패널",
  "라디에이터 서포트","프런트 패널",
  "운전석 인사이드 패널","운전석 프런트 사이드멤버","조수석 프런트 사이드멤버",
  "조수석 인사이드 패널","운전석 프런트 휠하우스","조수석 프런트 휠하우스",
  "크로스 멤버","대쉬 패널","플로어 패널","패키지 트레이",
  "운전석 리어 휠하우스","운전석 리어 사이드멤버","트렁크 플로어 패널",
  "조수석 리어 사이드멤버","조수석 리어 휠하우스","리어 패널",
];

const CHECK_POSITIONS = [
  { x:311.83,y:240.14 },{ x:260.03,y:892.29 },{ x:509.3,y:762.29 },
  { x:86.64,y:1111.77 },{ x:508.86,y:1142.25 },{ x:260.03,y:1333.65 },
  { x:512.24,y:1648.91 },{ x:374.88,y:1910.12 },{ x:983.46,y:458.1 },
  { x:983.46,y:1212.79 },{ x:983.46,y:1816.54 },{ x:1667.97,y:240.48 },
  { x:1469.7,y:762.29 },{ x:1718.76,y:892.63 },{ x:1892.36,y:1111.77 },
  { x:1470.94,y:1142.58 },{ x:1718.76,y:1333.98 },{ x:1466.56,y:1648.24 },
  { x:1604.92,y:1910.45 },{ x:988.04,y:2101.36 },{ x:988.04,y:2241.4 },
  { x:723.78,y:2411.14 },{ x:866.79,y:2488.66 },{ x:1099.87,y:2488.4 },
  { x:1244.45,y:2411.14 },{ x:727.0,y:2622.66 },{ x:1237.35,y:2622.66 },
  { x:991.04,y:2784.37 },{ x:991.04,y:2922.09 },{ x:991.04,y:3153.39 },
  { x:995.47,y:3403.48 },{ x:710.25,y:3552.65 },{ x:849.93,y:3590.53 },
  { x:987.15,y:3590.53 },{ x:1124.26,y:3590.53 },{ x:1264.94,y:3550.65 },
  { x:992.15,y:3764.23 },
];

const ORIGINAL_W = 2109;
const ORIGINAL_H = 4001;

const SYMBOL_LABEL: Record<string,string> = {
  X:"교환",W:"판금/도장",M:"탈부착",A:"흠집",U:"요철",T:"깨짐",C:"부식",P:"도장필요",B:"판금",
};
const SYMBOL_COLOR: Record<string,string> = {
  X:"#ef4444",W:"#3b82f6",M:"#eab308",A:"#3b82f6",U:"#a855f7",T:"#6b7280",C:"#22c55e",P:"#ec4899",B:"#8b5cf6",
};

export interface ReportData {
  car_info: { number:string; type:string; mileage:number; color:string; repairCost:number };
  evaluation: { leakDesc:string; driveDesc:string; optionsDesc:string; warningDesc:string; memo:string };
  car_status: {
    keys: { smart:number; folding:number; general:number; special:number };
    paintNeeded:number; wheelScratch:number;
    tireTread: { back:number; front:number };
  };
  damages: string[][];
  images: {
    wheel?:string[]; engine?:string[]; exterior?:string[];
    interior?:string[]; undercarriage?:string[];
    damage?:string[]; extra?:string[]; extraMemo?:string[];
    dashboard?:string[]; registration?:string[]; vin?:string[];
  };
}
export interface GradeInfo { grade:string; color:string; bg:string; desc:string }

// A4 @ 96dpi
export const PDF_W = 794;
export const PDF_H = 1123;

const s: React.CSSProperties = {}; // dummy for type helper

// 도넛
function Donut({ value, label, color }:{ value:number; label:string; color:string }) {
  const r=24, circ=2*Math.PI*r, dash=(value/100)*circ;
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}>
      <svg width={58} height={58} viewBox="0 0 58 58">
        <circle cx={29} cy={29} r={r} fill="none" stroke="#e5e7eb" strokeWidth={7}/>
        <circle cx={29} cy={29} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 29 29)"/>
        <text x={29} y={33} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#111">{value}%</text>
      </svg>
      <span style={{ fontSize:9,color:"#6b7280" }}>{label}</span>
    </div>
  );
}

// 공통 섹션 라벨
function SectionLabel({ text }:{ text:string }) {
  return <div style={{ fontSize:9,fontWeight:700,color:"#1d4ed8",letterSpacing:1.5,textTransform:"uppercase",marginBottom:5 }}>{text}</div>;
}

// 헤더 (두 페이지 공통)
function Header({ carNumber, grade }:{ carNumber:string; grade:GradeInfo }) {
  return (
    <div style={{ backgroundColor:"#1d4ed8",color:"#fff",padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
      <div>
        <div style={{ fontSize:9,letterSpacing:2,opacity:0.7,textTransform:"uppercase" }}>Carvior Safety Report</div>
        <div style={{ fontSize:17,fontWeight:900,marginTop:1 }}>카비어 안심 리포트</div>
        <div style={{ fontSize:11,opacity:0.85,marginTop:1 }}>{carNumber}</div>
      </div>
      <div style={{ backgroundColor:grade.bg,borderRadius:10,padding:"6px 16px",textAlign:"center" }}>
        <div style={{ fontSize:26,fontWeight:900,color:grade.color,lineHeight:1 }}>{grade.grade}</div>
        <div style={{ fontSize:9,color:grade.color,fontWeight:600,marginTop:1 }}>{grade.desc}</div>
      </div>
    </div>
  );
}

// ─── Page 1: 차량정보 + 진단결과 + 손상 ─────────────────────────────────────
function Page1({ data, grade }:{ data:ReportData; grade:GradeInfo }) {
  const { car_info, evaluation, car_status, damages } = data;
  const totalKeys = car_status.keys.smart+car_status.keys.folding+car_status.keys.general+car_status.keys.special;
  const damagedParts = damages.map((syms,i)=>({ name:PART_NAMES[i],symbols:syms })).filter(p=>p.symbols.length>0);
  const isOk = (v:string) => !v||v==="이상 없음";

  // 손상 도면
  const svgW = PDF_W * 0.36;
  const svgH = (ORIGINAL_H/ORIGINAL_W)*svgW;
  const wR = svgW/ORIGINAL_W, hR = svgH/ORIGINAL_H;
  const box = Math.max(wR*110, 9);

  return (
    <div className="pdf-page" style={{ width:PDF_W, height:PDF_H, backgroundColor:"#fff", overflow:"hidden", boxSizing:"border-box" }}>
      <Header carNumber={car_info.number} grade={grade} />

      <div style={{ padding:"12px 24px 0" }}>

        {/* 차량 기본정보 */}
        <SectionLabel text="Vehicle Info" />
        <div style={{ border:"1px solid #e5e7eb",borderRadius:8,overflow:"hidden",marginBottom:10 }}>
          {/* 차번 + 타이어 */}
          <div style={{ backgroundColor:"#f8fafc",padding:"8px 14px",borderBottom:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:9,color:"#9ca3af" }}>차량번호 / 차종</div>
              <div style={{ fontSize:16,fontWeight:900 }}>{car_info.number}</div>
              <div style={{ fontSize:10,color:"#6b7280" }}>{car_info.type||"-"}</div>
            </div>
            <div style={{ display:"flex",gap:14 }}>
              <Donut value={car_status.tireTread.front} label="앞 타이어"
                color={car_status.tireTread.front>=60?"#16a34a":car_status.tireTread.front>=30?"#d97706":"#dc2626"} />
              <Donut value={car_status.tireTread.back} label="뒤 타이어"
                color={car_status.tireTread.back>=60?"#16a34a":car_status.tireTread.back>=30?"#d97706":"#dc2626"} />
            </div>
          </div>
          {/* 스펙 4칸 */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr" }}>
            {[
              { label:"주행거리",value:`${car_info.mileage.toLocaleString()} km` },
              { label:"색상",    value:car_info.color||"-" },
              { label:"열쇠",    value:`${totalKeys}개 (스마트 ${car_status.keys.smart})` },
              { label:"도색필요",value:`${car_status.paintNeeded}개소` },
            ].map((item,i)=>(
              <div key={i} style={{ padding:"7px 12px",borderRight:i<3?"1px solid #e5e7eb":"none" }}>
                <div style={{ fontSize:8,color:"#9ca3af",marginBottom:1 }}>{item.label}</div>
                <div style={{ fontSize:10,fontWeight:700 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 진단결과 + 손상도면 2열 */}
        <div style={{ display:"flex",gap:12 }}>

          {/* 왼쪽 */}
          <div style={{ flex:1 }}>
            <SectionLabel text="Inspection Result" />
            <div style={{ border:"1px solid #e5e7eb",borderRadius:8,overflow:"hidden",marginBottom:8 }}>
              {[
                { label:"누유 상태",value:evaluation.leakDesc,    icon:"💧" },
                { label:"주행 상태",value:evaluation.driveDesc,   icon:"🏁" },
                { label:"옵션 상태",value:evaluation.optionsDesc, icon:"🔧" },
                { label:"경고등",   value:evaluation.warningDesc, icon:"⚡" },
              ].map((item,i)=>{
                const ok=isOk(item.value);
                return (
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 10px",borderBottom:i<3?"1px solid #f3f4f6":"none",backgroundColor:ok?"#f0fdf4":"#fff1f2" }}>
                    <span style={{ fontSize:12 }}>{item.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:8,color:"#9ca3af" }}>{item.label}</div>
                      <div style={{ fontSize:10,fontWeight:600,color:ok?"#15803d":"#b91c1c" }}>{item.value||"이상 없음"}</div>
                    </div>
                    <span style={{ fontSize:10 }}>{ok?"✅":"❌"}</span>
                  </div>
                );
              })}
            </div>

            {evaluation.memo&&(
              <div style={{ backgroundColor:"#f8fafc",border:"1px solid #e5e7eb",borderRadius:7,padding:"7px 10px",marginBottom:8 }}>
                <div style={{ fontSize:8,color:"#9ca3af",marginBottom:2 }}>진단사 고지사항</div>
                <div style={{ fontSize:9,color:"#374151",whiteSpace:"pre-line" }}>{evaluation.memo}</div>
              </div>
            )}

            <SectionLabel text="Damage List" />
            {damagedParts.length>0 ? (
              <div style={{ border:"1px solid #e5e7eb",borderRadius:8,overflow:"hidden" }}>
                {damagedParts.map((part,i)=>(
                  <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 10px",borderBottom:i<damagedParts.length-1?"1px solid #f3f4f6":"none" }}>
                    <span style={{ fontSize:9,color:"#374151" }}>{part.name}</span>
                    <div style={{ display:"flex",gap:3,flexWrap:"wrap" }}>
                      {part.symbols.map(sym=>(
                        <span key={sym} style={{ fontSize:8,fontWeight:700,color:"#ffffff",backgroundColor:SYMBOL_COLOR[sym]??"#6b7280",border:`1px solid ${SYMBOL_COLOR[sym]??"#6b7280"}`,borderRadius:99,padding:"1px 5px" }}>
                          {SYMBOL_LABEL[sym]??sym}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ backgroundColor:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"8px 12px",textAlign:"center" }}>
                <span style={{ fontSize:10,fontWeight:700,color:"#16a34a" }}>✅ 무사고 차량 · 외판 손상 없음</span>
              </div>
            )}
          </div>

          {/* 오른쪽: 손상 도면 */}
          <div style={{ width:svgW }}>
            <SectionLabel text="Damage Map" />
            <div style={{ position:"relative",width:svgW,height:svgH }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/car-damage-bg.svg" alt="도면" style={{ width:svgW,height:svgH,display:"block" }} />
              {CHECK_POSITIONS.map((pos,i)=>{
                const syms=damages[i]??[];
                if(!syms.length) return null;
                const sym=syms[0], clr=SYMBOL_COLOR[sym]??"#ef4444";
                return (
                  <div key={i} style={{ position:"absolute",left:wR*(pos.x+60)-box/2,top:hR*(pos.y+60)-box/2,width:box,height:box,backgroundColor:clr,border:`1.5px solid ${clr}`,borderRadius:box/2,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <span style={{ color:"#ffffff",fontWeight:"bold",fontSize:box*0.5,lineHeight:1 }}>{sym}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 페이지 푸터 */}
      <div style={{ position:"absolute",bottom:10,left:24,right:24,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <span style={{ fontSize:8,color:"#9ca3af" }}>© Carvior · 카비어 안심 리포트</span>
        <span style={{ fontSize:8,color:"#9ca3af" }}>1 / 2</span>
      </div>
    </div>
  );
}

// ─── Page 2: 사진 ─────────────────────────────────────────────────────────────
function Page2({ data, grade }:{ data:ReportData; grade:GradeInfo }) {
  const { car_info, images } = data;

  const docImgs: { label:string; url:string }[] = [
    ...(images.dashboard??[]).map(url=>({ label:"계기판",url })),
    ...(images.registration??[]).map(url=>({ label:"등록증",url })),
    ...(images.vin??[]).map(url=>({ label:"차대번호",url })),
  ];

  const photoCats: { label:string; imgs:string[] }[] = [
    { label:"외관",       imgs:images.exterior??[] },
    { label:"실내",       imgs:images.interior??[] },
    { label:"옵션",       imgs:images.extra??[] },
    { label:"휠",         imgs:images.wheel??[] },
    { label:"엔진",       imgs:images.engine??[] },
    { label:"하부",       imgs:images.undercarriage??[] },
    { label:"외판 데미지", imgs:images.damage??[] },
    { label:"기타사진",   imgs:images.extraMemo??[] },
  ].filter(c=>c.imgs.length>0);

  // 페이지당 4열로 사진 배치 — 한 페이지에 맞게 각 카테고리 최대 4장
  const PHOTO_W = (PDF_W - 48 - 3*8) / 4; // 4열
  const PHOTO_H = PHOTO_W * 0.75;

  return (
    <div className="pdf-page" style={{ width:PDF_W,height:PDF_H,backgroundColor:"#fff",overflow:"hidden",boxSizing:"border-box",position:"relative" }}>
      <Header carNumber={car_info.number} grade={grade} />

      <div style={{ padding:"12px 24px 0" }}>

        {/* 서류 */}
        {docImgs.length>0&&(
          <div style={{ marginBottom:12 }}>
            <SectionLabel text="Documents" />
            <div style={{ display:"flex",gap:8 }}>
              {docImgs.slice(0,4).map((d,i)=>(
                <div key={i} style={{ textAlign:"center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.url} alt={d.label} crossOrigin="anonymous"
                    style={{ width:PHOTO_W,height:PHOTO_H,objectFit:"cover",borderRadius:6,border:"1px solid #e5e7eb",display:"block" }} />
                  <div style={{ fontSize:8,color:"#6b7280",marginTop:3 }}>{d.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 차량 사진 */}
        <SectionLabel text="Photo Gallery" />
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {photoCats.map(cat=>(
            <div key={cat.label}>
              <div style={{ fontSize:9,fontWeight:600,color:"#6b7280",marginBottom:4 }}>{cat.label}</div>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                {cat.imgs.slice(0,4).map((url,i)=>(
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={url} alt={`${cat.label}${i+1}`} crossOrigin="anonymous"
                    style={{ width:PHOTO_W,height:PHOTO_H,objectFit:"cover",borderRadius:6,border:"1px solid #e5e7eb",display:"block" }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position:"absolute",bottom:10,left:24,right:24,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <span style={{ fontSize:8,color:"#9ca3af" }}>© Carvior · 카비어 안심 리포트</span>
        <span style={{ fontSize:8,color:"#9ca3af" }}>2 / 2</span>
      </div>
    </div>
  );
}

// ─── 최종 export ──────────────────────────────────────────────────────────────
export default function PdfTemplate({ data, grade }:{ data:ReportData; grade:GradeInfo }) {
  return (
    <div>
      <Page1 data={data} grade={grade} />
      <Page2 data={data} grade={grade} />
    </div>
  );
}
