export interface UserUpdate {
  gender?: string;
  name?: string;
  addr?: string;
  age?: number;
  adTerm?: boolean;
  marketingTerm?: boolean;
  nickName?: string;
}

export interface UserUpdateResponse {
  code: number;
  msg: string;
  data: {
    gender: string;
    name: string;
    addr: string;
    age: number;
    nickName: string;
  };
}
