export interface UserInfo {
  id: string;
  name: string;
  login: string;
}

export interface UserDB extends UserInfo {
  email: string;
}
