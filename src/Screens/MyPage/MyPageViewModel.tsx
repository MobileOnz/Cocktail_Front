import { useMemo } from 'react';
import { MemberRemoteDataSource } from '../../model/DataSource/MemberDataSource';
import { MemberRepository } from '../../model/Repository/MemberRepository';
// import { AuthRepository } from "../../model/Repository/AuthRepository";
import { AuthRemoteDataSource } from '../../model/DataSource/AuthRemoteDataSource';

const MyPageViewModel = () => {
  const repository = useMemo(
    () =>
      new MemberRepository(
        new MemberRemoteDataSource(),
        new AuthRemoteDataSource()
      ),
    []
  );

  const getMemberInfo = async () => {
    try {
      const result = await repository.getMyInfo();
      console.log('MyPageViewModel: ', result);
      return result;
    } catch (e: any) {
      if (e.response?.status === 401) {
        return null; // 비로그인 상태
      }
      throw e;
    }
  };

  const logOut = async () => {
    try {
      const status = await repository.logout();
      console.log('로그아웃 처리 완료');
      return status;
    } catch (error) {
      console.error('로그아웃 실패', error);
    }
  };

  return { getMemberInfo, logOut };
};

export default MyPageViewModel;
