
import { API_BASE_URL } from '@env';
import instance from '../../tokenRequest/axios_interceptor';
import { UserResponse } from '../dto/UserDto';
import { UserUpdate, UserUpdateResponse } from '../dto/UserUpdateDto.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';


export class MemberRemoteDataSource {

  async getMyInfo(): Promise<UserResponse> {
    const response = await instance.get(
      `${API_BASE_URL}/api/v2/members/get/member`
    );
    console.log('MemberRemoteDataSource: ', response.data.data);
    return response.data.data;
  }

  async withDrawUser(): Promise<{
    code: number,
    msg: string,
  }> {
    try {
      const res = await instance.delete(
        `${API_BASE_URL}/api/v2/members/delete/member`
      );
      console.log('회원탈퇴: ', JSON.stringify(res.data));
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      return {
        code: res.data.code,
        msg: res.data.msg,
      };
    } catch (error) {
      throw error;
    }
  }

  async uploadProfileImage(fileUri: string): Promise<{ code: number, msg?: string }> {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri.startsWith('file://') ? fileUri : `file://${fileUri}`,
      name: `profile_${Date.now()}.png`,
      type: 'image/png',
    } as any);

    const res = await instance.post(`${API_BASE_URL}/api/v2/members/upload/profile`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      authRequired: true,
    } as any);

    console.log('MemberRemoteDatasource: ', res.data);

    return res.data;
  }

  async updateUserProfile(data: UserUpdate): Promise<UserUpdateResponse> {
    try {
      const res = await instance.get(
        `${API_BASE_URL}/api/v2/members/update/member`,
        data
      );
      return res.data;

    } catch (error: any) {
      console.log('MemberReomoteDataSource_updateUserProfile: ', '오류');
    }
  }

  async getUserProfileImage(): Promise<Blob | null> {
    try {
      const res = await instance.get(
        `${API_BASE_URL}/api/v2/members/profile`, {
        responseType: 'blob',
      }
      );

      const contentType = res.headers['content-type'];

      if (contentType?.startsWith('image/')) {
        const blob = res.data;
        return blob;
      }
      else {
        console.warn('❓ 알 수 없는 Content-Type 응답:', contentType);
        return null;
      }

    } catch (error: any) {
      console.log('MemberReomoteDataSource_getUserProfileImage: ', '오류');
      return null;
    }
  }


}
