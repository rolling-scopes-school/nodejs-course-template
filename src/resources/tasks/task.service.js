const tasksRepo = require("./task.memory.repository");

const getTasksByBoardId = boardId => tasksRepo.getTasksByBoardId(boardId);

const deleteTasksByBoardId = boardId => tasksRepo.deleteTasksByBoardId(boardId);

const createNewTask = (boardId, task) => tasksRepo.createNewTask(boardId, task);

const getTaskByIdAndBoardId = (boardId, id) => tasksRepo.getTaskByIdAndBoardId(boardId, id);

const updateTaskByIdAndBoardId = (boardId, id, data) => tasksRepo.updateTaskByIdAndBoardId(boardId, id, data);

const deleteTask = id => tasksRepo.deleteTask(id);

const clearRemovedUserFromTasks = id => tasksRepo.clearRemovedUserFromTasks(id);

module.exports = {
    getTasksByBoardId,
    createNewTask,
    getTaskByIdAndBoardId,
    updateTaskByIdAndBoardId,
    deleteTask,
    clearRemovedUserFromTasks,
    deleteTasksByBoardId,
};
