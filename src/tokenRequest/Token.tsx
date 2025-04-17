import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { API_BASE_URL } from '@env';

export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem('accessToken');
}

export async function isTokenExpired(): Promise<boolean> {
  const token = await getToken(); 
  if (!token) return true;

  try {
    const decoded: any = jwtDecode(token);
    const exp = decoded.exp * 1000; 
    return Date.now() > exp;
  } catch {
    return true;
  }
}

export async function tokenRefresh() {
    try{
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        console.log("🔄 [tokenRefresh] 보내는 refresh token:", refreshToken);
        if(!refreshToken){
          console.log("리프레시 토큰이 없습니다.");
          return true;
        }
        console.log("보내는 refresh token:", refreshToken);
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`,null,{
            headers: {
              'Refresh-Token': refreshToken,
              },
        });

        const { accessToken : newAccessToken, refreshToken: newRefreshToken } = response.data;

   
    if (newAccessToken) {
      await AsyncStorage.setItem('accessToken', newAccessToken);
    }else{
        console.error("새로운 엑세스 토큰이 들어오지 않았습니다.")
    }
    if (newRefreshToken) {
      await AsyncStorage.setItem('refreshToken', newRefreshToken);
    }else{
        console.error("새로운 리프레시 토큰이 들어오지 않았습니다.")
    }
    return false;

    } catch (error: any) {
      const status = error.response?.status;
  
      if (status === 401 || status === 403) {
        console.warn("리프레시 토큰 만료됨 (로그아웃 필요)");
        return true; // 리프레시 토큰도 만료
      }
  
      console.error("토큰 갱신 중 오류:", error);
      return true; // 기타 에러도 만료로 간주
    }
    
}