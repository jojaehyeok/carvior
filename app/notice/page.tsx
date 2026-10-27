import Link from 'next/link';

// 공지사항 — 지금은 법인전환 안내 한 건뿐이지만, 앞으로 늘어날 걸 보고 목록 구조로 둔다.
// 새 공지는 아래 NOTICES 맨 앞에 추가하면 된다(본문은 JSX라 표·링크도 그대로 쓸 수 있음).
export const metadata = {
  title: '공지사항 | 카비어',
  description: '카비어 공지사항 — 법인전환 안내 등 서비스 운영 소식을 전해드립니다.',
};

const CORP_INFO = [
  { label: '법인명', value: '카비어 주식회사' },
  { label: '영문명', value: 'CarVior Corp.' },
  { label: '사업자등록번호', value: '889-81-03879' },
  { label: '대표자', value: '조재혁, 유진욱' },
  { label: '통신판매업 신고번호', value: '제 2026-경기안산-0474' },
  { label: '주소', value: '경기도 안산시 단원구 원포공원1로 59, A동 5층 2호 (초지동, 신명트윈타워)' },
];

export default function NoticePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm font-bold text-blue-600 mb-2">NOTICE</p>
        <h1 className="text-3xl font-black text-gray-900 mb-10">공지사항</h1>

        <article className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <header className="px-7 py-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                안내
              </span>
              <time className="text-xs text-gray-400" dateTime="2026-10-28">2026. 10. 28.</time>
            </div>
            <h2 className="text-2xl font-black text-gray-900">카비어 법인전환 안내</h2>
          </header>

          <div className="px-7 py-7">
            <p className="text-[15px] leading-relaxed text-gray-700 mb-7">
              카비어를 이용해 주시는 고객 여러분께 감사드립니다.<br />
              카비어가 법인으로 전환되어 아래와 같이 사업자 정보를 안내드립니다.
            </p>

            <dl className="bg-blue-50/60 border border-blue-100 rounded-xl divide-y divide-blue-100 mb-7">
              {CORP_INFO.map((row) => (
                <div key={row.label} className="flex flex-col sm:flex-row gap-1 sm:gap-4 px-5 py-3.5">
                  <dt className="text-sm font-bold text-blue-700 sm:w-44 shrink-0">{row.label}</dt>
                  <dd className="text-sm font-semibold text-gray-900">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="space-y-2 text-[15px] leading-relaxed text-gray-700 mb-7">
              <p>
                서비스 이용 방법은 전과 동일하며, <strong className="font-bold">기존에 접수하신 진단 예약과 계약은
                그대로 유지</strong>됩니다. 이미 발급해 드린 진단 리포트와 결제 내역도 변경 없이 조회하실 수 있습니다.
              </p>
              <p>
                법인전환일 이후 발행되는 세금계산서와 현금영수증은 새 사업자등록번호
                <strong className="font-bold"> 889-81-03879</strong> 로 발행됩니다.
              </p>
              <p>앞으로도 더 나은 서비스로 보답하겠습니다. 변함없는 관심과 성원 부탁드립니다.</p>
            </div>

            <p className="text-right text-sm font-black text-gray-900">카비어 주식회사</p>
          </div>
        </article>

        <div className="mt-10 text-center">
          <Link href="/" className="text-sm font-bold text-gray-500 hover:text-blue-600 hover:underline">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
