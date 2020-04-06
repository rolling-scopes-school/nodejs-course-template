const tasksRepo = require("./task.memory.repository");

const getTasksByBoardId = boardId => tasksRepo.getTasksByBoardId(boardId);

const deleteTasksByBoardId = boardId => tasksRepo.deleteTasksByBoardId(boardId);

const createNewTask = (boardId, task) => tasksRepo.createNewTask(boardId, task);

const getTaskById = (id) => tasksRepo.getTaskById(id);

const updateTaskById = (id, data) => tasksRepo.updateTaskById(id, data);

const deleteTask = id => tasksRepo.deleteTask(id);

const clearRemovedUserFromTasks = id => tasksRepo.clearRemovedUserFromTasks(id);

module.exports = {
    getTasksByBoardId,
    createNewTask,
    getTaskById,
    updateTaskById,
    deleteTask,
    clearRemovedUserFromTasks,
    deleteTasksByBoardId,
};
