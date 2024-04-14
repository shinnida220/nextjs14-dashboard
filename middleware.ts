import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

// const { auth } = NextAuth(authConfig);
// export const autth = (req: any) => {
//   console.log({ auth: req.auth });
//   const isLoggedIn = !!req.auth;
//   console.log({ route: req.nextUrl.pathname, isLoggedIn });
// if(isApiAuthRoutes /api/auth) return null;
//
// if(isApiAuthRoutes [/login, /signin]) {
//   if (isLoggedIn) {
//      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
//   }
//   return null;
// }
// if(!isLoggedIn && !ispublicRoutes) {
//   return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
// }
// Disable for all other routes
// return null;
// };

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  // matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
  // https://clerk.com/docs/references/nextjs/auth-middleware#usage
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
