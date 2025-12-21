import { AuthRemoteDataSource } from "../DataSource/AuthRemoteDataSource";
import { MemberRemoteDataSource } from "../DataSource/MemberDataSource";
import { User } from "../domain/User";

export class MemberRepository {
  constructor(
    private memberRemoteDataSource : MemberRemoteDataSource, 
    private authRemoteDataSource: AuthRemoteDataSource
) {}

  async getMyInfo(): Promise<User> {
    const dto = await this.memberRemoteDataSource.getMyInfo();

    return {
        id: dto.id,
        nickname: dto.nickname,
        email: dto.email,
        socialLogin: dto.social_login,
        profileUrl: dto.profile ?? undefined,
        role: dto.role as "ROLE_USER" | "ROLE_ADMIN",

        terms: {
            age: dto.ageTerm,
            service: dto.serviceTerm,
            marketing: dto.marketingTerm,
            ad: dto.adTerm,
        },
    }
  }

  async logout(): Promise<number> {
    return this.authRemoteDataSource.logOut()
  }
}