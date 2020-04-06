const boardsRepo = require("./board.memory.repository");
const tasksService = require("../tasks/task.service");

const getAll = () => boardsRepo.getAll();

const createNewBoard = board => boardsRepo.createNewBoard(board);

const getBoardById = id => boardsRepo.getBoardById(id);

const updateBoardById = (id, data) => boardsRepo.updateBoardById(id, data);

const deleteBoardById = async id => {
    await tasksService.deleteTasksByBoardId(id);
    return boardsRepo.deleteBoardById(id);
};

module.exports = { getAll, createNewBoard, getBoardById, updateBoardById, deleteBoardById };
