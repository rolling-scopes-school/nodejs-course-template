const router = require("express").Router();
const taskService = require("./task.service");

router
    .route("/")
    .get(async (req, res) => {
        res.json(await taskService.getTasksByBoardId(req.boardId))
    })
    .post(async  (req, res, next) => {
        const { boardId, body } = req;
        const task = await taskService.createNewTask(boardId, body);
        if (task) {
            await res.json(task)
        }
        return next({ status: 400, message: "Bad request" });
    });

router
    .route("/:taskId")
    .get(async (req, res, next) => {
        const { boardId } = req;
        const { taskId } = req.params;
        const task = await taskService.getTaskByIdAndBoardId(boardId, taskId);
        if (task) {
            await res.json(task)
        }
        return next({ status: 404, message: "Task not found" });
    })
    .put(async (req, res, next) => {
        const { boardId, body } = req;
        const { taskId } = req.params;
        const task = await taskService.updateTaskByIdAndBoardId(boardId, taskId, body);

        if (task) {
            await res.json(task)
        }
        return next({ status: 404, message: "Task not found" });
    })
    .delete(async (req, res, next) => {
        const { boardId } = req;
        const { taskId } = req.params;
        const status = await taskService.deleteTaskByBoardIdAndTaskId(boardId, taskId);
        if (status) {
            return await res.status(204).json({ message: "The task has been deleted" })
        }
        return next({ status: 404, message: "Task not found" });
    });

module.exports = router;
