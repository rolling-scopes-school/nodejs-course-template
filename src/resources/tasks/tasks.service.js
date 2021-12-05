const { validate } = require('uuid');
const { NOT_FOUND_ARGS, BAD_REQUEST_ARGS } = require('../../common/constants');
const { HttpError } = require('../../common/error');
const tasksRepository = require('./tasks.memory.repository');
const boardsRepository = require('../boards/boards.memory.repository');

const getAll = async (boardId) => {
  if (!validate(boardId)) {
    throw new HttpError(
      ...BAD_REQUEST_ARGS,
      `The ${boardId} (boardId) is not uuid.`
    );
  }
  if (!(await boardsRepository.getById(boardId))) {
    throw new HttpError(
      ...NOT_FOUND_ARGS,
      `The board with ${boardId} is not found.`
    );
  }
  return tasksRepository.getAll(boardId);
};

const getById = async (boardId, taskId) => {
  if (!validate(boardId)) {
    throw new HttpError(
      ...BAD_REQUEST_ARGS,
      `The ${boardId} (boardId) is not uuid.`
    );
  }
  if (!(await boardsRepository.getById(boardId))) {
    throw new HttpError(
      ...NOT_FOUND_ARGS,
      `The board with ${boardId} (boardId) is not found.`
    );
  }
  if (!validate(taskId)) {
    throw new HttpError(
      ...BAD_REQUEST_ARGS,
      `The ${taskId} (taskId) is not uuid.`
    );
  }
  const task = await tasksRepository.getById(boardId, taskId);
  if (!task) {
    throw new HttpError(
      ...NOT_FOUND_ARGS,
      `The task with ${taskId} (taskId) is not found.`
    );
  }

  return task;
};

const create = async (boardId, data) => {
  if (!validate(boardId)) {
    throw new HttpError(
      ...BAD_REQUEST_ARGS,
      `The ${boardId} (boardId) is not uuid.`
    );
  }
  if (!(await boardsRepository.getById(boardId))) {
    throw new HttpError(
      ...NOT_FOUND_ARGS,
      `The board with ${boardId} (boardId) is not found.`
    );
  }
  return tasksRepository.create(boardId, data);
};

const updateById = async (boardId, taskId, data) => {
  if (!validate(boardId)) {
    throw new HttpError(
      ...BAD_REQUEST_ARGS,
      `The ${boardId} (boardId) is not uuid.`
    );
  }
  if (!(await boardsRepository.getById(boardId))) {
    throw new HttpError(
      ...NOT_FOUND_ARGS,
      `The board with ${boardId} (boardId) is not found.`
    );
  }
  if (!validate(taskId)) {
    throw new HttpError(
      ...BAD_REQUEST_ARGS,
      `The ${taskId} (taskId) is not uuid.`
    );
  }
  if (!(await tasksRepository.getById(boardId, taskId))) {
    throw new HttpError(
      ...NOT_FOUND_ARGS,
      `The task with "${taskId}" (taskId) is not found.`
    );
  }

  return tasksRepository.updateById(boardId, taskId, data);
};

const deleteById = async (boardId, taskId) => {
  if (!validate(boardId)) {
    throw new HttpError(
      ...BAD_REQUEST_ARGS,
      `The ${boardId} (boardId) is not uuid.`
    );
  }
  if (!(await boardsRepository.getById(boardId))) {
    throw new HttpError(
      ...NOT_FOUND_ARGS,
      `The board with ${boardId} (boardId) is not found.`
    );
  }
  if (!validate(taskId)) {
    throw new HttpError(
      ...BAD_REQUEST_ARGS,
      `The ${taskId} (taskId) is not uuid.`
    );
  }
  if (!(await tasksRepository.getById(boardId, taskId))) {
    throw new HttpError(
      ...NOT_FOUND_ARGS,
      `The task with "${taskId}" (taskId) is not found.`
    );
  }

  await tasksRepository.deleteById(boardId, taskId);
};

module.exports = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
