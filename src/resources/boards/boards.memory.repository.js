const Board = require('./boards.model');

const boards = [];

const getAll = async () => boards;

const getById = async (id) => boards.find((board) => board.id === id);

const getByTitle = async (title) =>
  boards.find((board) => board.title === title);

const getIndexById = async (id) => boards.findIndex((board) => board.id === id);

const create = async (data) => {
  const board = new Board(data);
  boards.push(board);
  return board;
};

const updateById = async (id, data) => {
  const boardIndex = await getIndexById(id);
  boards[boardIndex] = new Board({
    ...data,
    id,
  });
  return boards[boardIndex];
};

const deleteById = async (id) => {
  const boardIndex = await getIndexById(id);
  boards.splice(boardIndex);
};

module.exports = {
  getAll,
  getById,
  getByTitle,
  create,
  updateById,
  deleteById,
};
