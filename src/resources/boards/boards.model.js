const { v4: uuidv4 } = require('uuid');
const { Column } = require('../columns/columns.model');

class Board {
  constructor({ id = uuidv4(), title, columns }) {
    this.id = id;
    this.title = title;
    this.columns = columns.map((column) => new Column(column));
  }

  static toResponse(board) {
    return { ...board, columns: board.columns.map(Column.toResponse) };
  }
}

module.exports = Board;
