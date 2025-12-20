import { API_BASE_URL } from '@env';
import { getToken, } from './Token';
import axios from 'axios';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

instance.interceptors.request.use(

  async (config) => {
    const accessToken = await getToken();
    if (accessToken) {
      console.log("accessToken 존재: ", accessToken)
      config.headers.Authorization = `${accessToken}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
