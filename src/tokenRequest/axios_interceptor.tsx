import { API_BASE_URL } from "@env";
import { getToken, tokenRefresh } from "./Token";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";


const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

instance.interceptors.request.use(
  
  async (config) => {
    const accessToken = await getToken(); 
    const { authRequired, authOptional} = config as any; // 토큰 선택, 필수 부분 체크하기 

    if (authRequired){
      if(!accessToken){
        throw new Error ("로그인이 필요합니다. (authRequired)")
      }
      config.headers["Authorization"] = accessToken
    }else if( authOptional){
      if(accessToken){
        config.headers["Authorization"] = accessToken
      }
    }

    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
      console.log("header")
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
   async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;

      const newAccessToken = await tokenRefresh();
      console.log("newAccessToken",newAccessToken)
      if (!newAccessToken) {
        await AsyncStorage.clear();
        return Promise.reject(new Error("리프레시 실패, 재로그인 필요"));
      }

      originalRequest.headers["Authorization"] = newAccessToken
      return instance(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default instance;
