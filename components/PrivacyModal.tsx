'use client';

import React from 'react';

export default function PrivacyModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-0 sm:pb-4">
            <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
                {/* 헤더 */}
                <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between flex-shrink-0">
                    <div>
                        <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-0.5">CARVIOR</p>
                        <h2 className="text-base font-black text-zinc-900">개인정보 수집 및 이용 동의</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 text-sm font-bold active:scale-95 transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* 내용 */}
                <div className="overflow-y-auto px-6 py-5 space-y-6 text-sm">

                    <section>
                        <h3 className="font-extrabold text-zinc-900 mb-2">1. 수집 및 이용 목적</h3>
                        <ul className="space-y-1 text-zinc-500 leading-relaxed">
                            <li>• 차량 전문 평가 서비스 신청 접수 및 배정</li>
                            <li>• 방문 일정 조율 및 서비스 진행 안내</li>
                            <li>• 평가 완료 후 리포트 발행 및 딜러 매칭</li>
                            <li>• 서비스 관련 문의 응대</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-extrabold text-zinc-900 mb-2">2. 수집하는 개인정보 항목</h3>
                        <div className="space-y-2">
                            <div className="bg-zinc-50 rounded-xl px-4 py-3">
                                <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">필수 항목</p>
                                <p className="text-zinc-600 leading-relaxed">차량번호, 연락처, 방문 주소, 희망 방문 일시</p>
                            </div>
                            <div className="bg-zinc-50 rounded-xl px-4 py-3">
                                <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">선택 항목</p>
                                <p className="text-zinc-600 leading-relaxed">희망 판매가, 차량 상세 정보</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-extrabold text-zinc-900 mb-2">3. 보유 및 이용 기간</h3>
                        <p className="text-zinc-500 leading-relaxed">
                            서비스 제공 완료일로부터 <span className="font-extrabold text-zinc-800">1년</span> 보관 후 파기합니다.<br />
                            단, 관계 법령에 따라 보존이 필요한 경우 해당 기간까지 보관합니다.
                        </p>
                        <div className="mt-2 bg-zinc-50 rounded-xl px-4 py-3 text-xs text-zinc-400 leading-relaxed">
                            소비자 보호법: 계약·청약 철회 기록 5년 /
                            전자상거래법: 대금 결제 기록 5년 /
                            통신비밀보호법: 서비스 방문 기록 3개월
                        </div>
                    </section>

                    <section>
                        <h3 className="font-extrabold text-zinc-900 mb-2">4. 동의 거부 권리 및 불이익</h3>
                        <p className="text-zinc-500 leading-relaxed">
                            귀하는 개인정보 수집 및 이용 동의를 거부할 권리가 있습니다.<br />
                            다만, 필수 항목에 동의하지 않을 경우 평가 서비스 신청이 제한됩니다.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-extrabold text-zinc-900 mb-2">5. 개인정보 처리자</h3>
                        <p className="text-zinc-500 leading-relaxed">
                            상호: 카비어 (T&S무역)<br />
                            담당자 연락처: 010-2285-6017
                        </p>
                    </section>
                </div>

                {/* 하단 버튼 */}
                <div className="px-6 py-4 border-t border-zinc-100 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-zinc-900 text-white font-extrabold rounded-2xl active:scale-[0.98] transition-all text-sm"
                    >
                        확인했습니다
                    </button>
                </div>
            </div>
        </div>
    );
}
