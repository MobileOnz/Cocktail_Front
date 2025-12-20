export interface User {
  id: number;
  nickname: string;
  email: string;
  socialLogin: "KAKAO" | "NAVER" | "GOOGLE";
  profileUrl?: string;
  role: "ROLE_USER" | "ROLE_ADMIN";

  terms: {
    age: boolean;
    service: boolean;
    marketing: boolean;
    ad: boolean;
  };
}