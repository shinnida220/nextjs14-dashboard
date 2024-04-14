import type { NextAuthConfig } from 'next-auth';
import { getProfile } from './auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: {
    maxAge: 3600,
  },
  callbacks: {
    // async signIn({ user, account, profile }) {
    //   console.log({ user, account, profile });
    //   if (account?.provider !== 'credentials') {
    //     return false;
    //   }
    //   const existingUser = await getProfile();
    //   if (existingUser?.otpEnabled) {
    //   }
    //   return true;
    // },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    jwt: ({ token, user, account, profile, isNewUser }) => {
      if (user) {
        console.log({ token, user });
        // This will only be executed at login. Each next invocation will skip this part.
        token.accessToken = (user as any).accessToken;
        token.accessTokenExpiry = (user as any).accessTokenExpiry;
        token.user = user;

        // token.refreshToken = user.data.refreshToken;
        return token;
      }

      // If accessTokenExpiry is 24 hours, we have to refresh token before 24 hours pass.
      const shouldRefreshTime = Math.round(
        (token.accessTokenExpiry as number) - 60 * 60 * 1000 - Date.now(),
      );

      // If the token is still valid, just return it.
      if (shouldRefreshTime > 0) {
        return Promise.resolve(token);
      }

      // If the call arrives after 23 hours have passed, we allow to refresh the token.
      //   token = refreshAccessToken(token);
      return Promise.resolve(token);
    },
    session({ session, token }) {
      const u = session.user;
      return {
        ...session,
        user: { ...(token as any).user },
      };
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
