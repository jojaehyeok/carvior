import { NextAuthOptions } from 'next-auth';
import KakaoProvider from 'next-auth/providers/kakao';
import NaverProvider from 'next-auth/providers/naver';
import CredentialsProvider from 'next-auth/providers/credentials';

const NEST = process.env.NEST_API_URL ?? 'http://localhost:4000/api';

export const authOptions: NextAuthOptions = {
  providers: [
    KakaoProvider({
      clientId:     process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    NaverProvider({
      clientId:     process.env.NAVER_CLIENT_ID!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email:    { label: '이메일', type: 'email' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(`${NEST}/v1/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          if (!res.ok) return null;
          const user = await res.json();
          // apiToken: 백엔드가 발급한 JWT. 채팅처럼 "남의 것을 보면 안 되는" 기능이
          // 이 토큰으로 사용자를 확인한다(클라이언트가 보내는 userId는 못 믿는다).
          return { id: String(user.id), email: user.email, name: user.name, image: user.profileImage, role: user.role, dealerStatus: user.dealerStatus, apiToken: user.token } as any;
        } catch { return null; }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.type === 'credentials') return true;
      try {
        const res = await fetch(`${NEST}/v1/users/social`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider:     account?.provider,
            providerId:   account?.providerAccountId,
            email:        user.email  ?? undefined,
            name:         user.name   ?? undefined,
            profileImage: user.image  ?? undefined,
          }),
        });
        // 소셜 로그인도 백엔드 토큰을 받아둬야 채팅을 쓸 수 있다. 여기서 user에 실어두면
        // 아래 jwt 콜백이 그대로 세션까지 가져간다(이메일 로그인과 같은 경로).
        if (res.ok) {
          const data = await res.json();
          if (data?.token) (user as { apiToken?: string }).apiToken = data.token;
        }
      } catch { /* DB 저장 실패해도 로그인 허용 */ }
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      // 마이페이지 설정에서 닉네임/프로필사진 저장 후 useSession().update()로 호출되는 경로 —
      // 재로그인 없이 세션 토큰에 바로 반영
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
      }
      if (user) {
        token.role         = (user as any).role;
        token.userId       = (user as any).id;
        token.dealerStatus = (user as any).dealerStatus;
        if ((user as any).apiToken) token.apiToken = (user as any).apiToken;
      }
      // 소셜 로그인 최초 발급 시 DB에서 role 조회
      if (account && account.type !== 'credentials' && token.email) {
        try {
          const res = await fetch(`${NEST}/v1/users/by-email?email=${encodeURIComponent(token.email as string)}`);
          if (res.ok) {
            const u = await res.json();
            token.role = u.role;
            token.userId = String(u.id);
            token.dealerStatus = u.dealerStatus;
          }
        } catch {}
      }
      if (account) token.provider = account.provider;
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id           = token.userId ?? token.sub;
        (session.user as any).role         = token.role;
        (session.user as any).dealerStatus = token.dealerStatus;
        (session.user as any).provider     = token.provider;
        (session.user as any).apiToken     = token.apiToken;
      }
      return session;
    },
  },

  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  jwt:     { maxAge: 30 * 24 * 60 * 60 },
};
