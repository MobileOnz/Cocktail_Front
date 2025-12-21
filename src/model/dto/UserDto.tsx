export interface UserResponse {
  created_at: string;
  updated_at: string;
  id: number;
  creadential_id: string;
  name: string;
  nickname: string;
  email: string;
  sociallogin: "KAKAO" | "NAVER" | "GOOGLE";
  gender: string | null;
  addr: string | null;
  age: number | null;
  profile: string | null;
  phone: string | null;
  role: string;
  ageTerm: boolean;
  serviceTerm: boolean;
  marketingTerm: boolean;
  adTerm: boolean;
}