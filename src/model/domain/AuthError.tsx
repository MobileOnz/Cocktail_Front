export enum AuthErrorType {
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  SOCIAL_LOGIN_FAILED = 'SOCIAL_LOGIN_FAILED',
  SERVER_ERROR = 'SERVER_ERROR',
}

export class AuthError extends Error {
  constructor(
    public type: AuthErrorType,
    message?: string
  ) {
    super(message);
  }
}
