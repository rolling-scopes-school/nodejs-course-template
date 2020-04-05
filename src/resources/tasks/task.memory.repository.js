const Task = require("./task.model");
const  tasks = require("../../mockData/tasks");

const getTasksByBoardId = async (boardId) => {
    return tasks.filter(task => task.boardId === boardId)
};

const createNewTask = async (boardId, task) => {
    const newTask = new Task({...task, boardId});
    tasks.push(newTask);
    return newTask
};

const getTaskByIdAndBoardId = async (boardId, id) => {
    return tasks.find(task => task.id === id || task.boardId === boardId);
};

const updateTaskByIdAndBoardId = async (boardId, id, data) => {
    const task = await getTaskByIdAndBoardId(boardId, id);
    const { id: taskId, title, order, description, userId, boardId: newBoardId, columnId } = data;
    let foundTask = undefined;
    if (task) {
        tasks.forEach(task => {
            if (task.id === id) {
                foundTask = {
                    id: taskId ? taskId : task.id,
                    title: title ? title : task.title,
                    order: order ? order : task.order,
                    description: description ? description : task.description,
                    userId: userId ? userId : task.userId,
                    boardId: newBoardId ? newBoardId : task.boardId,
                    columnId: columnId ? columnId : task.columnId,
                };
                return foundTask;
            }
        });
        return foundTask;
    }
};

const deleteTaskByBoardIdAndTaskId = async (boardId, taskId) => {
    const task = await getTaskByIdAndBoardId(boardId, taskId);
    if (task) {
        tasks.slice(tasks.indexOf(task), 1);
        return true;
    }
    return false;
};

module.exports = {
    getTasksByBoardId,
    createNewTask,
    getTaskByIdAndBoardId,
    updateTaskByIdAndBoardId,
    deleteTaskByBoardIdAndTaskId,
};
