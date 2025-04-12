// import { API_BASE_URL } from "@env";
// import { getToken, isTokenExpired, tokenRefresh } from "./Token";
// import axios from "axios";


// const instance  = axios.create({
//     baseURL : API_BASE_URL,
//     timeout : 1000,
// })

// instance.interceptors.request.use(
//     (config) => {
//         const accessToken = getToken;
//         config.headers['Content-Type'] = 'application/json';
//         config.headers['Authorization'] = `${accessToken}`;
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// instance.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         if(error.response?.status === 401){
//             if(isTokenExpired())
//         }
//     }
// )