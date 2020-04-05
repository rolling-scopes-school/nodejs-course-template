const tasksRepo = require("./task.memory.repository");

const getTasksByBoardId = boardId => tasksRepo.getTasksByBoardId(boardId);

const createNewTask = (boardId, task) => tasksRepo.createNewTask(boardId, task);

const getTaskByIdAndBoardId = (boardId, id) => tasksRepo.getTaskByIdAndBoardId(boardId, id);

const updateTaskByIdAndBoardId = (boardId, id, data) => tasksRepo.updateTaskByIdAndBoardId(boardId, id, data);

const deleteTaskByBoardIdAndTaskId = (boardId, id) => tasksRepo.deleteTaskByBoardIdAndTaskId(boardId, id);

module.exports = {
    getTasksByBoardId,
    createNewTask,
    getTaskByIdAndBoardId,
    updateTaskByIdAndBoardId,
    deleteTaskByBoardIdAndTaskId,
};
