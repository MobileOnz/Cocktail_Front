export interface SignUpRequest {
  code: string;          // 인증 코드 (UUID)
  nickName: string;      // 닉네임
  deviceNumber: string;  // 디바이스 고유 식별자
  ageTerm: boolean;      // 연령 약관 동의
  serviceTerm: boolean;  // 서비스 이용약관 동의
  marketingTerm: boolean; // 마케팅 수신 동의
  adTerm: boolean;       // 광고성 정보 수신 동의
}