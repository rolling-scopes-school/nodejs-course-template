const { v4: uuidv4 } = require('uuid');

class User {
  constructor({ id = uuidv4(), name, login, password }) {
    this.id = id;
    this.name = name;
    this.login = login;
    this.password = password;
  }

  static toResponse(user) {
    const { id, name, login } = user;
    return { id, name, login };
  }
}

module.exports = User;
