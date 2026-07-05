import NextAuth, { NextAuthOptions } from 'next-auth';
import KakaoProvider from 'next-auth/providers/kakao';
import NaverProvider from 'next-auth/providers/naver';

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
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false;
      try {
        await fetch(`${NEST}/v1/users/social`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider:     account.provider,
            providerId:   account.providerAccountId,
            email:        user.email ?? undefined,
            name:         user.name  ?? undefined,
            profileImage: user.image ?? undefined,
          }),
        });
      } catch {
        // 유저 저장 실패해도 로그인은 허용
      }
      return true;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).provider   = token.provider;
        (session.user as any).providerId = token.sub;
      }
      return session;
    },

    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
  },

  pages: {
    signIn: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
