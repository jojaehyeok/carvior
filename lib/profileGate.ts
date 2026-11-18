/**
 * '나중에 하기'를 누른 흔적.
 *
 * sessionStorage 라 탭을 닫으면 사라진다 — 다음에 들어오시면 한 번 더 여쭌다.
 * 영구히 끄지 않는 이유는, 번호가 없으면 마이페이지에서 자기 검차 신청을 못 보기
 * 때문이다. 한 번 거절했다고 영영 안 묻는 건 본인에게 손해다.
 *
 * 페이지 파일이 아니라 여기에 둔다 — 레이아웃이 페이지 모듈을 끌어오면 안 된다.
 */
export const SKIP_KEY = 'carvior.profileSkipped';

/** 이 길에서는 묻지 않는다 — 로그인·가입 중이거나 이미 묻는 중인 자리다. */
export const GATE_EXEMPT = ['/welcome', '/login', '/register', '/policy'];
