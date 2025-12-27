import { AuthResult } from "../domain/AuthResult";

export interface ISocialAuthDataSource {
  login(): Promise<AuthResult>;
}