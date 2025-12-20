
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
}