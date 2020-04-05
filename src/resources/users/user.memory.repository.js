const users = require("../../mockData/users");
const User = require("./user.model");

const getAll = async () => {
  return users;
};

const createNewUser = async user => {
  const newUser = new User(user);
  users.push(newUser);
  return newUser
};

const getUserById = async id => {
  return users.find(user => user.id === id);
};

const updateUserById = async (id, data) => {
  const user = await getUserById(id);

  const { name, login, password } = data;
  let foundUser = undefined;
  if (user) {
    users.forEach(user => {
      if (user.id === id) {
        foundUser = {
          name: name ? name : user.name,
          login: login ? login : user.login,
          password: password ? password : user.password,
        };
        return foundUser;
      }
    });
    return foundUser;
  }
};

const deleteUserById = async id => {
  const user = await  getUserById(id);
  if (user) {
    users.slice(users.indexOf(user), 1);
    return true;
  }
  return false;
};

module.exports = { getAll, createNewUser, getUserById, updateUserById, deleteUserById };
