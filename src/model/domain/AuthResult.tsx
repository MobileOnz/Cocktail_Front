export type AuthResult =
  | {
      type: 'token';
      accessToken: string;
      refreshToken: string;
    }
  | {
      type: 'signup';
      signupCode: string;
    };
