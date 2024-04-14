import NextAuth, { DefaultSession, Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { authConfig } from './auth.config';

// import dbClient from '@/app/lib/db-client';
import type { ApiLoginResponse, ApiUser, User } from '@/app/lib/definitions';
// import bcrypt from 'bcrypt';

import { HttpClient } from './app/lib/http-client';
import { decodeJwt } from './app/lib/utils';
import { ChargeUpUser } from './next-auth';

// async function getUser(email: string): Promise<User | undefined> {
//   try {
//     const user = await dbClient.query(
//       `SELECT * FROM users WHERE email='${email}'`,
//     );
//     return user.rows[0];
//   } catch (error) {
//     console.error('Failed to fetch user:', error);
//     throw new Error('Failed to fetch user.');
//   }
// }
export async function getProfile() {
  try {
    const response =
      await HttpClient.getAxiosInstance().get('/v1/users/profile');
    if (response.statusText?.toLowerCase() === 'ok') {
      return {
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        name: `${response.data.firstName} ${response.data.lastName}`,
        email: response.data.email,
        isEmailVerified: response.data.isEmailVerified,
        mobile: response.data.isEmailVerified,
        isMobileVerified: response.data.isMobileVerified,
        otpEnabled: response.data.totpEnabled,
      };
    }
    return null;
  } catch (error) {}
}

async function login(email: string, password: string): Promise<string | null> {
  try {
    const response = await HttpClient.getAxiosInstance().post<ApiLoginResponse>(
      '/v1/auth/login',
      {
        email,
        password,
      },
    );
    if (response.data?.access_token) {
      return response.data.access_token;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

async function loginWith2FA(token: string): Promise<string | null> {
  try {
    const response = await HttpClient.getAxiosInstance().post<ApiLoginResponse>(
      '/v1/auth/login-2fa',
      { token },
    );
    if (response.data?.access_token) {
      return response.data.access_token;
    }
    return null;
  } catch (error) {
    console.error('Failed to validate 2FA.', error);
    throw new Error('Failed to validate 2FA.');
  }
}

// https://medium.com/ascentic-technology/authentication-with-next-js-13-and-next-auth-9c69d55d6bfd
// https://javascript.plainenglish.io/seamless-authentication-and-authorization-in-nextjs-leveraging-external-jwts-in-next-auth-1af1ef8fd7d8
// https://www.linkedin.com/pulse/nextjs-creating-custom-authentication-system-jwt-vitor-alecrim/
// https://next-auth.js.org/v3/tutorials/refresh-token-rotation
// https://vizzuality.github.io/devismos/docs/researches/next-auth/

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  //   callbacks: {
  //     async signIn({ user, account, profile }) {
  //       console.log({ from: 'callbacks', user, account, profile });
  //       if (account?.provider !== 'credentials') {
  //         return false;
  //       }
  //       const existingUser = await getProfile();
  //       if (existingUser?.otpEnabled) {
  //       }
  //       return true;
  //     },
  //   },
  providers: [
    Credentials({
      type: 'credentials',
      id: 'domain-login',
      name: 'Domain Account',
      async authorize(credentials): Promise<ChargeUpUser | null> {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          // const user = await getUser(email);
          // if (!user) return null;
          // const passwordsMatch = await bcrypt.compare(password, user.password);
          // if (passwordsMatch) return user;
          try {
            const token = await login(email, password);
            if (!token) return null;

            const decoded = decodeJwt(token);
            if (decoded?.id && decoded?.accountType) {
              HttpClient.setAuthorization(token);
              const profileInfo = await getProfile();
              return {
                otpEnabled: decoded.otpEnabled,
                ...(decoded.otpEnabled
                  ? { otpVerified: decoded.otpVerified }
                  : {}),
                id: decoded.id,
                accessToken: token,
                accessTokenExpiry: decoded.exp,
                ...(profileInfo ? profileInfo : {}),
              } as ChargeUpUser;
            }
          } catch (err: any) {
            console.log({ error: err?.message });
          }
          return null;
        }

        // Invalid credentials
        return null;
      },
    }),

    Credentials({
      id: 'tfa-login',
      name: 'Two Factor Auth',
      async authorize(credentials): Promise<ChargeUpUser | null> {
        const parsedCredentials = z
          .object({ token: z.string().length(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { token } = parsedCredentials.data;

          try {
            const accessToken = await loginWith2FA(token);
            if (!accessToken) return null;

            const decoded = decodeJwt(accessToken);
            if (decoded?.id && decoded?.accountType) {
              HttpClient.setAuthorization(accessToken);
              const profileInfo = await getProfile();
              return {
                otpVerified: true,
                id: decoded.id,
                accessToken: token,
                accessTokenExpiry: decoded.exp,
                ...(profileInfo ? profileInfo : {}),
              } as ChargeUpUser;
            }
          } catch (err: any) {
            console.log({ error: err?.message });
          }
          return null;
        }

        // Invalid credentials
        return null;
      },
    }),
  ],
});
