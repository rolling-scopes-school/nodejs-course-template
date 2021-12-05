const Task = require('./tasks.model');

const tasks = [];

const getAll = async (boardId) =>
  tasks.filter((task) => task.boardId === boardId);

const getById = async (boardId, taskId) =>
  tasks.find((task) => task.id === taskId && task.boardId === boardId);

const getIndexById = async (boardId, taskId) =>
  tasks.findIndex((task) => task.id === taskId && task.boardId === boardId);

const getIndexesByBoardId = async (boardId) =>
  tasks.reduce(
    (acc, task, index) =>
      task.boardId === boardId ? acc.push(index) && acc : acc,
    []
  );

const getIndexesByUserId = async (userId) =>
  tasks.reduce(
    (acc, task, index) =>
      task.userId === userId ? acc.push(index) && acc : acc,
    []
  );

const create = async (boardId, data) => {
  const task = new Task({ ...data, boardId });
  tasks.push(task);
  return task;
};

const updateById = async (boardId, taskId, data) => {
  const taskIndex = await getIndexById(boardId, taskId);
  tasks[taskIndex] = new Task({
    ...tasks[taskIndex],
    ...data,
  });
  return tasks[taskIndex];
};

const deleteById = async (boardId, taskId) => {
  const taskIndex = await getIndexById(boardId, taskId);
  tasks.splice(taskIndex);
};

const whenBoardDeleted = async (boardId) => {
  const taskIndexes = await getIndexesByBoardId(boardId);
  taskIndexes.forEach((taskIndex) => tasks.splice(taskIndex));
};

const whenUserDeleted = async (userId) => {
  const taskIndexes = await getIndexesByUserId(userId);
  taskIndexes.forEach((taskIndex) => {
    tasks[taskIndex].userId = null;
  });
};

module.exports = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
  whenBoardDeleted,
  whenUserDeleted,
};
