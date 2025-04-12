import { API_BASE_URL } from "@env";
import { getToken, isTokenExpired, tokenRefresh, isRefreshTokenExpired } from "./Token";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1000,
});

instance.interceptors.request.use(
  async (config) => {
    const accessToken = await getToken();
    config.headers["Content-Type"] = "application/json";
    config.headers["Authorization"] = `${accessToken}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const tokenExpired = await isTokenExpired();
        const refreshExpired = typeof isRefreshTokenExpired === "function"
          ? await isRefreshTokenExpired()
          : true;

        if (refreshExpired) {
            await AsyncStorage.clear();
            
          return Promise.reject(new Error("리프레시 토큰 만료"));
        }

        if (tokenExpired) {
          await tokenRefresh();
        }

        const newToken = await getToken();
        error.config.headers = {
          "Content-Type": "application/json",
          Authorization: `${newToken}`,
        };

        return await axios.request(error.config);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
