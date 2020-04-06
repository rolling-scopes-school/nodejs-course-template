const router = require("express").Router();
const Board = require("./board.model");
const boardsService = require("./board.service");

router
    .route("/")
    .get(async (req, res) => {
        const boards = await boardsService.getAll();
        res.status(200).json(boards);
    })
    .post(async (req, res, next) => {
        const newBoard = await boardsService.createNewBoard(req.body);
        if (newBoard) {
            return res.status(200).json(Board.toResponse(newBoard))
        }
        return next({ status: 400, message: "Bad request" })
    });

router
    .route("/:id")
    .get(async (req, res, next) => {
        const board = await boardsService.getBoardById(req.params.id);
        if (board) {
            return res.status(200).json(Board.toResponse(board))
        }
        return next({ status: 404, message: "Board not found" });
    })
    .put(async (req, res, next) => {

        const board = await boardsService.updateBoardById(req.params.id, req.body);
        if (board) {
            return res.status(200).json(board)
        }
        return next({ status: 400, message: "Bad request" });
    })
    .delete(async (req, res, next) => {

        const status = await boardsService.deleteBoardById(req.params.id);
        if (status) {
            return res.status(204).json({ message: "The board has been deleted" })
        }
        return next({ status: 404, message: "Board not found" });
    });


module.exports = router;
