import { AuthResult } from "../domain/AuthResult";

export interface ISocialAuthDataSource {
  login(): Promise<AuthResult>;

  getLoginUrl(): Promise<{loginUrl: string}>
}