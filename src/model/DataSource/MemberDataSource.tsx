
import { API_BASE_URL } from "@env";
import instance from "../../tokenRequest/axios_interceptor";
import { UserResponse } from "../dto/UserDto";


export class MemberRemoteDataSource {

  async getMyInfo(): Promise<UserResponse> {
    const response = await instance.get(
      `${API_BASE_URL}/api/v2/members/get/member`
    );
    console.log("MemberRemoteDataSource: ", response.data.data)
    return response.data.data;
  }

  async uploadProfileImage(fileUri: string): Promise<{code: number, msg?: string}>{
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

    console.log("MemberRemoteDatasource: ", res.data)

    return res.data;
  }

}