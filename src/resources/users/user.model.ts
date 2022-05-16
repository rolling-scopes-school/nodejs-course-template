import { v4 as uuid } from 'uuid';
import { UserInfo } from './user.interface';

export default class User {
  private readonly id: string;

  private readonly name: string;

  private readonly login: string;

  private readonly password: string;

  constructor({
    id = uuid(),
    name = 'USER',
    login = 'user',
    password = 'P@55w0rd',
  } = {}) {
    this.id = id;
    this.name = name;
    this.login = login;
    this.password = password;
  }

  static toResponse(user: UserInfo) {
    const { id, name, login } = user;
    return { id, name, login };
  }
}
