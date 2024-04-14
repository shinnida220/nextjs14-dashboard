import { DefaultSession } from 'next-auth';

interface ChargeUpUser extends DefaultSession['user'] {
  otpEnabled: boolean;
  otpVerified?: boolean;
  id: string;
  accessToken?: string | null;
  accessTokenExpiry?: number;
  firstName: boolean;
  lastName: boolean;
  isEmailVerified: boolean;
  mobile: string | null;
  isMobileVerified: boolean;
}

declare module 'next-auth' {
  interface Session {
    user: ChargeUpUser;
  }
}
