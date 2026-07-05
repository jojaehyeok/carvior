"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import router from "next/router";

export default function AppFooter() {
  const { 
    isOpen: isTermsOpen, 
    onOpen: onTermsOpen, 
    onOpenChange: onTermsOpenChange 
  } = useDisclosure();

  const { 
    isOpen: isPrivacyOpen, 
    onOpen: onPrivacyOpen, 
    onOpenChange: onPrivacyOpenChange 
  } = useDisclosure();

  return (
    <>
      <footer className="w-full py-12 bg-white border-t border-gray-200">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
            {/* 로고 및 설명 */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">카비어(Carvior)</h2>
              <p className="text-sm leading-relaxed text-gray-500">
                전국 어디서나 믿을 수 있는 전문가의 <br />
                정밀한 차량 성능 진단을 경험해보세요.
              </p>
            </div>

            {/* 사업자 정보 (통신판매업 신고번호 추가) */}
            <div className="grid grid-cols-1 gap-8 text-sm text-gray-600 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="mb-3 text-base font-bold text-gray-900">사업자 정보</p>
                <p><span className="text-gray-400">상호명 :</span> 카비어</p>
                <p><span className="text-gray-400">대표자 :</span> 조재혁</p>
                <p><span className="text-gray-400">사업자등록번호 :</span> 783-24-02190</p>
                {/* 🌟 통신판매업 신고번호는 심사 필수 항목입니다. */}
                <p><span className="text-gray-400">통신판매업신고 :</span> 제 2026-경기안산-0474</p> 
                <p><span className="text-gray-400">주소 :</span> 경기도 안산시 단원구 원포공원1로 59 신명트윈타워 A동, 502호</p>
              </div>

              <div className="space-y-2">
                <p className="mb-3 text-base font-bold text-gray-900">고객센터</p>
                <p className="text-lg font-bold text-violet-600">010-2285-6017</p>
                <p><span className="text-gray-400">휴대폰 :</span> 010-2285-6017</p>
                <p><span className="text-gray-400">이메일 :</span> jjhstc2285@naver.com</p>
                <p className="pt-2 text-xs text-gray-400">평일 09:00 - 18:00 (주말/공휴일 휴무)</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 pt-8 mt-12 border-t border-gray-100 md:flex-row">
            <p className="text-xs text-gray-400">© 2026 카비어. All Rights Reserved.</p>
            <div className="flex gap-6 text-xs text-gray-500">
              <button onClick={onTermsOpen} className="transition-colors hover:text-violet-600 hover:underline">이용약관</button>
              <button onClick={onPrivacyOpen} className="font-bold transition-colors hover:text-violet-600 hover:underline">개인정보처리방침</button>
              {/* 🌟 환불정책 링크 추가 (토스 심사용) */}
              <button 
                onClick={() => router.push('/policy/refund')} 
                className="font-medium text-red-500 transition-colors hover:underline"
              >
                취소 및 환불규정
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* 📜 이용약관 전문 모달 */}
      <Modal 
        isOpen={isTermsOpen} 
        onOpenChange={onTermsOpenChange} 
        scrollBehavior="inside" 
        size="4xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="border-b">카비어 서비스 이용약관</ModalHeader>
              <ModalBody className="p-8">
                <div className="space-y-6 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                  <div>
                    <h3 className="mb-4 text-lg font-bold">[1장 총칙]</h3>
                    <p className="font-bold">제 1 조 (목적)</p>
                    <p>본 약관은 이용고객이 국내 최초 차량 성능평가 서비스 카비어(이하 “카비어”라 합니다)이 제공하는 “서비스”를 이용함에 있어 카비어와 이용고객간의 권리와 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                  </div>

                  <div>
                    <p className="font-bold">제 2 조 (정의)</p>
                    <p>본 약관에서 사용하는 주요 용어는 다음과 같습니다.</p>
                    <p>① “카비어”이라 함은 카비어가 중고차를 구매하는 이용고객과 자동차 성능평가사를 연결해주는 서비스를 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 재화, 용역을 거래할 수 있도록 설정한 가상의 영업장 또는 카비어가 운영하는 웹사이트와 어플리케이션을 말하며, 아울러 ”카비어”를 운영하는 사업자의 의미로도 사용합니다.</p>
                    <p>② “서비스”라 함은, 구현되는 단말기(PC, 태블릿, 휴대용 단말기 등의 각 종 유무선 장치)와 상관없이 브랜드명 ‘카비어”을 사용하여 “카비어”가 제공하는 제반 서비스를 말합니다.</p>
                    <p>③ “이용고객” 이라 함은, 카비어의 “서비스”에 접속하여 본 약관에 따라 카비어가 제공하는 서비스를 받는 회원과 비회원을 말합니다.</p>
                    <p>④ “게시물” 이라 함은, “이용고객”이 “서비스”를 이용함에 있어 “서비스상”에 게시한 부호ㆍ문자ㆍ음성ㆍ음향ㆍ화상ㆍ동영상 등의 정보 형태의 글, 사진, 동영상 및 각종 파일과 링크 등을 의미합니다.</p>
                    <p>⑤ “주문거래”라 함은 이용고객이 서비스를 이용함에 있어 결제서비스를 이용하여 매매거래가 이루어지는 일체를 말합니다.</p>
                  </div>

                  <div>
                    <p className="font-bold">제 3 조 (약관의 게시, 효력 및 개정)</p>
                    <p>① 카비어는 본 약관의 내용을 이용고객이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</p>
                    <p>② 카비어는 관련법을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</p>
                    <p>③ 약관 개정 시 적용일자 30일 전부터 공지하며, 이용고객이 개정약관 시행일 7일 후까지 거부의사를 표시하지 않으면 승인한 것으로 봅니다.</p>
                  </div>

                  <h3 className="mb-4 text-lg font-bold">[2장 서비스의 이용]</h3>

                  <div>
                    <p className="font-bold">제 4 조 (서비스 이용)</p>
                    <p>① 서비스 이용은 카비어의 서비스 사용 승낙 직후부터 가능합니다.</p>
                    <p>② 서비스 이용시간은 카비어의 업무상 또는 기술상 불가능한 경우를 제외하고는 연중무휴 1일 24시간을 원칙으로 합니다.</p>
                  </div>

                  <div>
                    <p className="font-bold">제 6 조 (서비스 이용의 제한 및 중지)</p>
                    <p>① 카비어는 다음 사유가 발생한 경우에는 이용고객의 서비스 이용을 제한하거나 중지시킬 수 있습니다.</p>
                    <p>1. 이용고객이 카비어 서비스의 운영을 고의 또는 중과실로 방해하는 경우</p>
                    <p>2. 관련법 위반, 해킹, 악성프로그램 배포 등 서비스 운영에 지장을 주는 경우</p>
                  </div>

                  <div>
                    <p className="font-bold">제 7 조 (권리의 귀속 및 저작물의 이용)</p>
                    <p>① 카비어가 이용고객에게 제공하는 유료 점검 결과 리포트 등 각종 서비스에 대한 저작권을 포함한 일체의 권리는 카비어에 귀속됩니다.</p>
                  </div>

                  <h3 className="mb-4 text-lg font-bold">[3장 위치기반서비스]</h3>

                  <div>
                    <p className="font-bold">제 17 조 (위치기반서비스의 내용)</p>
                    <p>카비어는 위치정보사업자로부터 제공받은 위치정보를 이용하여 현재 위치를 활용한 검색결과(근거리 업체 등)를 제공합니다.</p>
                  </div>

                  <div>
                    <p className="font-bold">제 20 조 (개인위치정보의 이용 또는 제공)</p>
                    <p>① 개인위치정보를 이용하는 카비어의 정보는 아래와 같습니다.</p>
                    <p>가. 상호 : 카비어</p>
                    <p>나. 대표자: 조재혁</p>
                    <p>다. 주소 : 경기도 안산시 단원구 원포공원1로 59 신명트윈타워 A동, 502호</p>
                    <p>라. 대표전화: 010-2285-6017</p>
                  </div>

                  <h3 className="mb-4 text-lg font-bold">[4장 기타]</h3>

                  <div>
                    <p className="font-bold">제 27 조 (면책조항)</p>
                    <p>① 카비어는 천재지변 또는 이에 준하는 불가항력으로 인한 경우 책임을 지지 않습니다.</p>
                    <p>② 수리계약은 이용고객과 수리업체간의 계약이므로 수리과정에서 발생한 하자에 대하여 카비어는 원칙적으로 배상 책임이 없습니다.</p>
                  </div>

                  <div>
                    <p className="font-bold">부칙</p>
                    <p>제1조. 본 약관은 2026년 2월 24일부터 적용됩니다.</p>
                    <p>제2조. 카비어의 위치정보 관리책임자는 다음과 같습니다.</p>
                    <p>1. 이름: 조재혁 / 2. 연락처: 010-2285-6017</p>
                  </div>

                  <div className="pt-4 text-gray-500 border-t border-gray-200">
                    <p>주소: 경기도 안산시 단원구 원포공원1로 59 신명트윈타워 A동, 502호</p>
                    <p>이메일: cs@carvior.com</p>
                    <p>회사: 카비어 / 사업자등록번호: 783-24-02190</p>
                    <p>대표: 조재혁</p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t">
                <Button color="primary" onPress={onClose}>닫기</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 🛡️ 개인정보처리방침 모달 */}
      <Modal isOpen={isPrivacyOpen} onOpenChange={onPrivacyOpenChange} scrollBehavior="inside" size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="border-b">개인정보처리방침</ModalHeader>
              <ModalBody className="p-8">
                <div className="space-y-6 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                  <p><strong>카비어(Carvior)</strong>는 이용자의 개인정보를 소중하게 처리하며, 관련 법령을 준수합니다.</p>
                  
                  <div>
                    <p className="font-bold">1. 개인정보의 수집 및 이용 목적</p>
                    <p>- 차량 점검 서비스 예약 및 수행</p>
                    <p>- 서비스 이용에 따른 본인 확인 및 상담 처리</p>
                  </div>

                  <div>
                    <p className="font-bold">2. 수집하는 개인정보 항목</p>
                    <p>- 필수항목: 성명, 연락처, 차량정보, 점검 희망 주소</p>
                    <p>- 자동수집: IP주소, 서비스 이용 기록</p>
                  </div>

                  <div>
                    <p className="font-bold">3. 개인정보의 보유 및 이용기간</p>
                    <p>- 이용 목적 달성 시 혹은 회원 탈퇴 시 지체 없이 파기합니다.</p>
                    <p>- 관계 법령에 의하여 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.</p>
                  </div>

                  <div>
                    <p className="font-bold">4. 개인정보 보호책임자</p>
                    <p>- 성명: 조재혁 / 연락처: 010-2285-6017</p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t">
                <Button color="primary" onPress={onClose}>닫기</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}