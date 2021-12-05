const User = require('./users.model');

const users = [];

const getAll = async () => users;

const getById = async (id) => users.find((user) => user.id === id);

const getByLogin = async (login) => users.find((user) => user.login === login);

const getIndexById = async (id) => users.findIndex((user) => user.id === id);

const create = async (data) => {
  const user = new User(data);
  users.push(user);
  return user;
};

const updateById = async (id, data) => {
  const userIndex = await getIndexById(id);
  users[userIndex] = new User({
    ...data,
    id,
  });
  return users[userIndex];
};

const deleteById = async (id) => {
  const userIndex = await getIndexById(id);
  users.splice(userIndex);
};

module.exports = {
  getAll,
  getById,
  getByLogin,
  create,
  updateById,
  deleteById,
};
