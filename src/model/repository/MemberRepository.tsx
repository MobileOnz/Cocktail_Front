import { AuthRemoteDataSource } from '../DataSource/AuthRemoteDataSource';
import { MemberRemoteDataSource } from '../DataSource/MemberDataSource';
import { User } from '../domain/User';
import { UserUpdate, UserUpdateResponse } from '../dto/UserUpdateDto.ts';

export class MemberRepository {
  constructor(
    private memberRemoteDataSource: MemberRemoteDataSource,
    private authRemoteDataSource: AuthRemoteDataSource
  ) { }

  async getMyInfo(): Promise<User> {
    const dto = await this.memberRemoteDataSource.getMyInfo();

    return {
      id: dto.id,
      nickname: dto.nickname,
      email: dto.email,
      socialLogin: dto.socialLogin,
      profileUrl: dto.profile ?? undefined,
      role: dto.role as 'ROLE_USER' | 'ROLE_ADMIN',

      terms: {
        age: dto.ageTerm,
        service: dto.serviceTerm,
        marketing: dto.marketingTerm,
        ad: dto.adTerm,
      },
    };
  }

  async withDrawUser(): Promise<{
    code: number,
    msg: string,
  }> {
    return this.memberRemoteDataSource.withDrawUser();
  }

  async logout(): Promise<number> {
    return this.authRemoteDataSource.logOut();
  }

  async uploadProfileImage(fileUri: string) {
    return this.memberRemoteDataSource.uploadProfileImage(fileUri);
  }

  async updateUserProfile(data: UserUpdate): Promise<UserUpdateResponse> {
    return this.memberRemoteDataSource.updateUserProfile(data);
  }

  async getUserProfileImage(): Promise<Blob | null> {
    return this.memberRemoteDataSource.getUserProfileImage();
  }
}
