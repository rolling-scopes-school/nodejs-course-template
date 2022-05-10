export interface IUser {
  id: string;
  name: string;
  login: string;
}

export interface IUserDB extends IUser {
  email: string;
}
