const { v4: uuidv4 } = require('uuid');

class Column {
  constructor({ id = uuidv4(), title, order = [] }) {
    this.id = id;
    this.title = title;
    this.order = order;
  }

  static toResponse(column) {
    const { title, order } = column;
    return { title, order };
  }
}

module.exports = {
  Column,
};
