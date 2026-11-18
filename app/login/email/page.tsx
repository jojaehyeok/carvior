import { redirect } from 'next/navigation';

/**
 * 이메일 로그인은 이제 /login 안에 있다.
 *
 * 전에는 소셜이 먼저고 이메일은 '또는' 아래 단추로 여기까지 넘어와야 했다. 그러면
 * 대부분 소셜로 들어오고 우리는 그 사람의 이메일을 못 받는다 — 카카오는 이메일 동의를
 * 안 받은 계정이 많다(lib/auth.ts 참고). 그래서 이메일을 로그인 화면 맨 위로 올렸다.
 *
 * 이 주소는 남겨 둔다. 눌러 둔 즐겨찾기와 지난 링크가 있어서, 없애면 404가 난다.
 * 폼을 두 벌 두면 한쪽만 고쳐 놓고 왜 안 되냐고 하게 되므로, 화면이 아니라 길만 남긴다.
 */
export default function EmailLoginRedirect() {
  redirect('/login');
}
