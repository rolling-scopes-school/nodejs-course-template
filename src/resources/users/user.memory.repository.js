let users = require("../../mockData/users");
const User = require("./user.model");

const getAll = async () => {
  return users;
};

const createNewUser = async userData => {
  const newUser = new User({ ...userData });
  users.push(newUser);
  return newUser;
};

const getUserById = async id => {
  return users.find(user => user.id === id);
};

const updateUserById = async (id, data) => {
  const user = await getUserById(id);
  const { name, login, password } = data;
  if (user) {
    if (name) user.name = name;
    if (login) user.login = login;
    if (password) user.password = password;
  }
  return user;
};

const deleteUserById = async id => {
  const user = await getUserById(id);
  if (user) {
    users = users.filter(user => user.id !== id);
  }
  return user;
};

module.exports = { getAll, createNewUser, getUserById, updateUserById, deleteUserById };
