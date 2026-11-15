/**
 * 입금 계좌 — 한 군데서만 고친다.
 *
 * 2026-11 법인 전환으로 바뀐 계좌다. 예전 개인사업자 계좌(카카오뱅크 3333-35-1997303)는
 * 폐업과 함께 막혔으니 어디에도 남겨두면 안 된다. 돈이 안 들어오는 계좌를 띄우면
 * 고객은 보냈다고 생각하고 우리는 못 받는다.
 */
export const BANK_INFO = {
  bank: '농협',
  number: '351-1415-1061-83',
  holder: '카비어 주식회사',
} as const;

export const BANK_INFO_LINE = `${BANK_INFO.bank} ${BANK_INFO.number} (${BANK_INFO.holder})`;
