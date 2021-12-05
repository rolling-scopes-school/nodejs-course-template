const { validate } = require('uuid');
const {
  NOT_FOUND_ARGS,
  BAD_REQUEST_ARGS,
  CONFLICT_ARGS,
} = require('../../common/constants');
const { HttpError } = require('../../common/error');
const usersRepository = require('./users.memory.repository');
const tasksRepository = require('../tasks/tasks.memory.repository');

const getAll = async () => usersRepository.getAll();

const getById = async (id) => {
  if (!validate(id)) {
    throw new HttpError(...BAD_REQUEST_ARGS, `The ${id} (id) is not uuid.`);
  }
  const user = await usersRepository.getById(id);
  if (!user) {
    throw new HttpError(
      ...NOT_FOUND_ARGS,
      `The user with ${id} (id) is not found.`
    );
  }

  return user;
};

const create = async (data) => {
  if (await usersRepository.getByLogin(data.login)) {
    throw new HttpError(
      ...CONFLICT_ARGS,
      `The user with "${data.login}" login is already exists.`
    );
  }

  return usersRepository.create(data);
};

const updateById = async (id, data) => {
  if (!validate(id)) {
    throw new HttpError(...BAD_REQUEST_ARGS, `The ${id} (id) is not uuid.`);
  }

  if (!(await usersRepository.getById(id))) {
    throw new HttpError(
      ...NOT_FOUND_ARGS,
      `The user with ${id} (id) is not found.`
    );
  }

  return usersRepository.updateById(id, data);
};

const deleteById = async (id) => {
  if (!validate(id)) {
    throw new HttpError(...BAD_REQUEST_ARGS, `The ${id} (id) is not uuid.`);
  }

  if (!(await usersRepository.getById(id))) {
    throw new HttpError(
      ...NOT_FOUND_ARGS,
      `The user with ${id} (id) is not found.`
    );
  }

  await usersRepository.deleteById(id);
  await tasksRepository.whenUserDeleted(id);
};

module.exports = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
