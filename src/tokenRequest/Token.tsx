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
        const refreshToken = AsyncStorage.getItem("refreshToken");
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`,null,{
            headers: {
                Authorization: `${refreshToken}`,
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
    
  }
    
}