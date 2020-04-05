const Board = require("./board.model");
const boards = require("../../mockData/boards");
const tasksService = require("../tasks/task.service");

const getAll = async () => {
    return boards;
};

const createNewBoard = async board => {
    const newBoard = new Board(board);
    boards.push(newBoard);
    return newBoard;
};

const getBoardById = async id => {
    return boards.find(board => board.id === id);
};

const updateBoardById = async (id, data) => {
    const board = await getBoardById(id);

    const { id: boardId, title, columns } = data;
    let foundBoard = undefined;
    if (board) {
        users.forEach(board => {
            if (board.id === id) {
                foundBoard = {
                    id: boardId ? boardId : board.id,
                    title: title ? title : board.title,
                    columns: columns ? columns : board.columns,
                };
                return foundBoard;
            }
        });
        return foundBoard;
    }
};

const deleteTask = async (task, boardId) => {
    return await tasksService.deleteTaskByBoardIdAndTaskId(boardId, task.id);
};

const deleteTasksByBoardId = async boardId => {
    const tasks = await tasksService.getTasksByBoardId(boardId);
    if (tasks) {
        tasks.forEach( task => {
            deleteTask(task, boardId)
        })
    }
};

const deleteBoardById = async id => {
    const board = await getBoardById(id);
    if (board) {
        boards.slice(boards.indexOf(board), 1);
        await deleteTasksByBoardId(id);
        return true;
    }
    return false;
};

module.exports = { getAll, createNewBoard, getBoardById, updateBoardById, deleteBoardById };
