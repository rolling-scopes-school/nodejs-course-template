const users = require("../../mockData/users");
const User = require("./user.model");
const taskService = require("../tasks/task.service");
const boardsService = require('../boards/board.service');

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

const findTasksByBoardId = async boardId => {
  return await taskService.getTasksByBoardId(boardId);
};

const updateTasksData = async (BoardId, task) => {
  return await taskService.updateTaskByBoardIdAndTaskId(
    BoardId,
    task.id,
    {
      ...task,
      userId: null
    }
  );
};

const replaceActiveUserTasksToNull = async (userId) => {
  const boards = await boardsService.getAll();
  boards.forEach(board => {
    const tasks = findTasksByBoardId(board.id);
    if (tasks.length) {
      tasks.forEach(task => {
        if (task.userId === userId) {
          updateTasksData(board.id, task)
        }
      })
    }
  });
};

const deleteUserById = async id => {
  const user = await getUserById(id);
  if (user) {
    users.slice(users.indexOf(user), 1);
    await replaceActiveUserTasksToNull(id);
    return true;
  }
  return false;
};

module.exports = { getAll, createNewUser, getUserById, updateUserById, deleteUserById };
