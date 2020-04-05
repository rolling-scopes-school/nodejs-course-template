const uuid = require("uuid");

class Board {
    constructor({
        id = uuid(),
        title = "Board title",
        columns = []
    } = {}) {
        this.id = id;
        this.title = title;
        this.columns = columns.map(column => {
            return {
                ...column,
                id: uuid(),
            };
        });
    }

    static toResponse(board) {
        return board;
    }
}

module.exports = Board;
