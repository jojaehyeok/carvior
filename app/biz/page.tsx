import Link from 'next/link';
import AppFooter from '@/components/footermodal';

/*
  카비어 비즈 — 상사 통합관리 프로그램 소개.

  대상이 다르다. 이 사이트의 다른 화면은 차를 사고파는 개인을 보고 있는데, 여기는
  상사 대표님·사무장님만 본다. 그래서 홈에는 띠 하나만 두고 설득은 전부 이 장에서 한다.

  가입 순서가 이 제품의 뼈대다 — **대표님이 상사를 열고, 직원은 그 상사에 들어온다.**
  직원이 혼자 가입할 수 있으면 어느 상사 사람인지 알 수 없고, 승인할 사람도 없다.

  파는 방식이 특이해서 그걸 숨기지 않는 게 설득의 핵심이다 — 프로그램값을 안 받고
  검차로 받는다. 상사 대표님이 제일 먼저 의심하는 게 "공짜면 뭘 가져가려는 거냐"라,
  그 답을 맨 위에서 먼저 한다.

  ⚠ 지금은 상사를 한 곳씩 연다(테넌트 분리가 Employee까지만 돼 있다). 그래서 버튼이
  "바로 시작"이 아니라 "개설 신청"이다. 신청은 biz.carvior.store 로그인 화면에서 폼으로 받고,
  상사는 사람이 확인하고 연다. 열 수 없는 걸 열린 것처럼 적으면 안 된다.
*/

export const metadata = {
  title: '카비어 비즈 — 상사 통합관리 프로그램 | 카비어',
  description:
    '출퇴근·작업일지·상담·매물사진·전자결재를 한 곳에서. 프로그램 사용료는 받지 않습니다. 검차와 상사 운영, A to Z 한 번에.',
};

/** v1에 들어가는 것. 쓰는 말로 적는다 — "모듈"이 아니라 "출근 찍기"다. */
const FEATURES = [
  {
    title: '출퇴근',
    desc: '직원이 폰으로 찍고, 대표님은 이번 달 누가 몇 번 늦었는지 한 장으로 봅니다. 연차·외근·반차도 여기서 올리고 결재합니다.',
  },
  {
    title: '작업일지',
    desc: '오늘 무슨 차를 보고 누구를 만났는지 팀별로 쌓입니다. 사람이 바뀌어도 기록이 남습니다.',
  },
  {
    title: '상담 기록',
    desc: '전화 온 손님, 무슨 차를 찾는지, 어디까지 얘기됐는지. 담당이 쉬어도 다른 사람이 이어받습니다.',
  },
  {
    title: '매물 사진',
    desc: '폰으로 찍어 올리면 알아서 줄여서 올라갑니다. 상사 로고도 같이 박힙니다 — 어디로 퍼져도 어느 집 차인지 남습니다.',
  },
  {
    title: '전자결재',
    desc: '품의·지출·시말서를 올리고 대표님이 폰으로 결재합니다. 종이로 뽑아야 할 때는 양식 그대로 나옵니다.',
  },
  {
    title: '공지',
    desc: '단톡방에 올리면 묻힙니다. 여기 올리면 누가 읽었는지 보입니다.',
  },
  {
    title: '사내 채팅',
    desc: '업무 얘기는 업무 자리에서. 퇴사해도 대화가 같이 나가지 않습니다.',
  },
  {
    title: '홈 화면',
    desc: '오늘 출근 현황, 결재 대기, 안 읽은 공지를 한 장에. 들어오면 뭘 해야 하는지가 먼저 보입니다.',
  },
];

const STEPS = [
  {
    no: '01',
    title: '대표님이 신청하십니다',
    desc: '상사 이름과 대표님(또는 사무장님) 연락처만 주시면 됩니다. 서류도, 계약서도 없습니다. 직원이 먼저 가입하는 게 아니라 상사부터 엽니다.',
  },
  {
    no: '02',
    title: '저희가 상사를 엽니다',
    desc: '상사와 대표님 계정을 같이 만들어 드립니다. 설치할 것도, 깔 것도 없습니다 — 주소만 받으시면 됩니다.',
  },
  {
    no: '03',
    title: '직원을 받으십시오',
    desc: '그때부터 직원이 우리 상사로 가입 신청을 할 수 있습니다. 대표님·사무장님이 승인해야 들어옵니다 — 승인 전에는 아무것도 못 봅니다.',
  },
];

const FAQ = [
  {
    q: '정말 사용료가 없습니까?',
    a: '없습니다. 설치비도, 월 이용료도, 직원 수에 따른 추가금도 없습니다. 저희는 검차로 받습니다.',
  },
  {
    q: '그럼 검차를 꼭 맡겨야 합니까?',
    a: '아닙니다. 검차는 맡기실 때만 비용이 생깁니다. 프로그램을 쓰는 조건이 검차라면 그건 공짜가 아닙니다.',
  },
  {
    q: '지금 쓰는 프로그램이 있습니다.',
    a: '같이 써보셔도 됩니다. 옮기시라고 말씀드리지 않습니다 — 써보시고 더 나으면 그때 옮기시면 됩니다.',
  },
  {
    q: '정산도 됩니까?',
    a: '지금은 안 됩니다. 아래에 따로 적어 두었습니다.',
  },
  {
    q: '직원이 먼저 가입해도 됩니까?',
    a: '안 됩니다. 대표님이 상사를 연 뒤에야 직원이 가입 신청을 할 수 있습니다. 누가 우리 상사 사람인지는 대표님·사무장님만 아십니다.',
  },
  {
    q: '그만 쓰고 싶으면요?',
    a: '말씀하시면 쌓인 자료를 파일로 내려드리고 닫습니다. 붙잡는 절차 같은 건 없습니다.',
  },
];

export default function BizPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── 히어로 ── */}
      <section className="relative bg-gradient-to-br from-violet-50 via-white to-slate-50 border-b border-violet-100 overflow-hidden">
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-violet-300/20 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-6 pt-14 pb-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2.5 mb-5">
              <img src="/logo-icon.svg" alt="" className="w-9 h-9" />
              <span className="text-slate-900 text-xl font-black">카비어 비즈</span>
              <span className="text-[10px] font-bold text-violet-700 bg-violet-100 border border-violet-200 px-2 py-0.5 rounded-full">
                상사 전용 · 무료
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-[1.25] mb-4">
              검차와 상사 운영,<br />
              <span className="text-violet-500">A to Z 한 번에.</span>
            </h1>

            <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-7">
              출퇴근부터 작업일지·상담 기록·매물 사진·전자결재까지,<br className="hidden sm:block" />
              상사 하루가 한 곳에서 돕니다. <b className="text-slate-700">프로그램 사용료는 받지 않습니다.</b><br className="hidden sm:block" />
              <span className="text-slate-400">대표님·사무장님이 신청하시면 상사를 열어 드립니다.</span>
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://biz.carvior.store"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-violet-600 hover:bg-violet-500 text-white font-black px-7 py-3.5 rounded-xl text-sm transition-colors"
              >
                상사 개설 신청하기 →
              </a>
              <a
                href="https://biz.carvior.store"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-violet-50 border border-violet-200 text-violet-700 font-bold px-7 py-3.5 rounded-xl text-sm transition-colors"
              >
                화면 둘러보기
              </a>
            </div>

            <p className="text-[11px] text-slate-400 mt-4">
              지금은 상사를 한 곳씩 열고 있습니다. 신청하신 순서대로 연락드립니다.
              급하시면 바로 전화 주셔도 됩니다 — <a href="tel:07041382017" className="font-semibold text-slate-500 underline underline-offset-2 hover:text-violet-600">070-4138-2017</a>
            </p>
          </div>
        </div>
      </section>

      {/* ── 왜 공짜인가 ──
           이 장에서 제일 중요한 단락이다. 공짜라는 말만 하면 의심부터 하신다. */}
      <section className="bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <p className="text-xs font-bold tracking-widest uppercase text-violet-400 mb-3">WHY FREE</p>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-6">
            프로그램을 팔지 않습니다.<br />
            저희는 <span className="text-violet-400">검차</span>로 받습니다.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
            <p className="text-slate-300 text-sm leading-relaxed">
              관리 프로그램 월 3~5만원은 영업 다니는 기름값도 안 됩니다. 그 돈을 받으려고
              상사를 설득하는 일에 저희가 시간을 쓸 이유가 없습니다.
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              대신 상사 한 곳이 한 달에 차 서른 대를 매입하면, 그 서른 대의 상태를 보는 일이
              저희 일입니다. <b className="text-white">프로그램은 드리고 검차로 먹고삽니다.</b>{' '}
              검차는 맡기실 때만 비용이 생깁니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── 되는 것 ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-10">
          <p className="text-xs font-bold tracking-widest uppercase text-violet-500 mb-2">WHAT YOU GET</p>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">상사 하루에 필요한 것부터</h2>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            기능을 많이 넣는 대신, 매일 쓰는 것만 제대로 넣었습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
              <h3 className="font-black text-slate-900 text-sm mb-2">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 검차 연결 — 이 제품이 다른 관리 프로그램과 갈라지는 지점 ── */}
      <section className="bg-gradient-to-br from-violet-50 to-slate-50 border-y border-violet-100">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-start justify-between gap-10">
          <div className="max-w-xl">
            <p className="text-xs font-bold tracking-widest uppercase text-violet-500 mb-2">INSPECTION</p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-4">
              매입한 차 옆에서<br />바로 평가사를 부릅니다.
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              매입 목록에서 차 한 줄을 고르고 <b className="text-slate-700">&ldquo;평가사에게 맡기기&rdquo;</b>를
              누르면 끝입니다. 전화 걸 일도, 차량번호를 다시 칠 일도 없습니다.
              전국 진단평가사 네트워크가 받아서 나가고, 나온 리포트는 그 차 밑에 그대로 붙습니다.
            </p>
            <ul className="space-y-2.5">
              {[
                '주문은 관리자만 — 누르면 비용이 생기니 아무나 못 누르게 막아뒀습니다.',
                '진행 상황이 매입 목록에서 그대로 보입니다. 따로 확인 전화를 안 하셔도 됩니다.',
                '리포트는 손님에게 그대로 보내실 수 있습니다. 설명이 짧아집니다.',
              ].map(t => (
                <li key={t} className="flex gap-2.5 text-sm text-slate-600">
                  <span className="text-violet-500 font-black shrink-0">·</span>
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="shrink-0 w-full md:w-80">
            <div className="bg-white border border-violet-100 rounded-2xl p-5 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 mb-3">매입 목록</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                  <span className="text-xs font-bold text-slate-700">12가 3456</span>
                  <span className="text-[10px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                    리포트 완료
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                  <span className="text-xs font-bold text-slate-700">34나 7890</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    평가사 배정됨
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-dashed border-violet-200 px-3 py-2.5">
                  <span className="text-xs font-bold text-slate-400">56다 1234</span>
                  <span className="text-[10px] font-bold text-violet-600">평가사에게 맡기기 →</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                실제 화면을 그린 예시입니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 안 넣은 것 ──
           먼저 말씀드리는 쪽이 낫다. 쓰시다 없는 걸 발견하면 프로그램을 통째로 접으신다. */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7 md:p-9 max-w-4xl">
          <h2 className="text-lg md:text-xl font-black text-slate-900 mb-3">정산은 아직 넣지 않았습니다</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            상사마다 정산 시트지가 다릅니다. 매도비를 어디까지 넣는지, 수수료를 어떻게 나누는지가
            집집마다 달라서, 어설프게 만들어 드리면 숫자가 틀립니다.{' '}
            <b className="text-slate-700">돈 계산이 한 번 틀리면 프로그램을 통째로 못 믿게 됩니다.</b>{' '}
            정산은 쓰시던 방식 그대로 두시고, 사람·일정·소통부터 옮겨 보십시오.
          </p>
        </div>
      </section>

      {/* ── 시작하는 법 ── */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="mb-10">
            <p className="text-xs font-bold tracking-widest uppercase text-violet-500 mb-2">HOW TO START</p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">시작은 전화 한 통입니다</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map(s => (
              <div key={s.no} className="bg-white border border-gray-100 rounded-2xl p-6">
                <p className="text-[11px] font-black text-violet-400 mb-3">{s.no}</p>
                <h3 className="font-black text-slate-900 text-sm mb-2">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 자주 묻는 것 ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-10">자주 묻는 것</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7 max-w-5xl">
          {FAQ.map(f => (
            <div key={f.q}>
              <h3 className="font-black text-slate-900 text-sm mb-2">{f.q}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 마무리 ── */}
      <section className="bg-gradient-to-br from-violet-50 to-slate-50 border-t border-violet-100">
        <div className="max-w-5xl mx-auto px-6 py-14 text-center">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-3">
            한 달만 써보시고 아니면 그만두십시오
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            계약서도 없고, 약정도 없습니다. 대표님·사무장님이 상사 이름과 연락처만 주시면 열어 드립니다.
            <br />
            전화가 편하시면 <a href="tel:07041382017" className="font-bold text-slate-600 underline underline-offset-2 hover:text-violet-600">070-4138-2017</a> 로 주셔도 됩니다.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-7">
            <a
              href="https://biz.carvior.store"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-violet-600 hover:bg-violet-700 text-white font-black px-7 py-3.5 rounded-xl text-sm transition-colors"
            >
              상사 개설 신청하기 →
            </a>
            <Link
              href="/inspection"
              className="bg-white hover:bg-violet-50 border border-violet-200 text-violet-700 font-bold px-7 py-3.5 rounded-xl text-sm transition-colors"
            >
              검차부터 맡겨보기
            </Link>
          </div>
          <p className="text-[11px] text-slate-400 mt-5">평일 09:00 – 18:00</p>
        </div>
      </section>

      <AppFooter />
    </div>
  );
}
