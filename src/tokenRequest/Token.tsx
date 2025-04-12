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
export async function isRefreshTokenExpired(): Promise<boolean> {
    const token = await AsyncStorage.getItem("refreshToken");
    if (!token) return true;
  
    try {
      const decoded: any = jwtDecode(token);
      const exp = decoded.exp * 1000; // 밀리초 단위
      return Date.now() > exp;
    } catch (err) {
      console.warn("리프레시 토큰 디코딩 실패", err);
      return true; // 디코딩 실패 시 만료된 것으로 처리
    }
  }

export async function tokenRefresh() {
    try{
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        console.log("🔄 보내는 refresh token:", refreshToken);
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

    } catch (error) {
    console.error('토큰 갱신 실패:', error);
    throw error;
  }
    
}