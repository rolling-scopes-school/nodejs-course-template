const usersRepo = require('./user.memory.repository');

const getAll = () => usersRepo.getAll();

module.exports = { getAll };
