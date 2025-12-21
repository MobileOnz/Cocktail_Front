import { AuthRemoteDataSource } from "../DataSource/AuthRemoteDataSource";
import { ISocialAuthDataSource } from "../DataSource/ISocialAuthDataSource";
import { AuthResult } from "../domain/AuthResult";
import { SignUpRequest } from "../domain/SignupRequest";

export class AuthRepository {
  constructor(
    private naverDataSource: ISocialAuthDataSource,
    private googleDataSource: ISocialAuthDataSource,
    private kakaoDataSource: ISocialAuthDataSource,
    private authRemoteDataSource: AuthRemoteDataSource
  ) {}

  naverLogin(): Promise<AuthResult> {
    return this.naverDataSource.login();
  }

  kakaoLogin(): Promise<AuthResult> {
    return this.kakaoDataSource.login()
  }

  googleLogin(): Promise<AuthResult> {
    return this.googleDataSource.login()
  }

  signUp(req: SignUpRequest) {
    return this.authRemoteDataSource.signUp(req)
  }
  
}