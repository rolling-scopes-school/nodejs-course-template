const Task = require("./task.model");
let tasks = require("../../mockData/tasks");

const getTasksByBoardId = async boardId => {
    return tasks.filter(task => task.boardId === boardId);
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
    if (task) {
        if (taskId) task.id = taskId;
        if (title) task.title = title;
        if (order !== undefined) task.order = order;
        if (description) task.description = description;
        if (userId) task.userId = userId;
        if (newBoardId) task.boardId = newBoardId;
        if (columnId) task.columnId = columnId;
    }
    return task;
};

const deleteTask = async (boardId, taskId) => {
    const task = tasks.filter(task => task.id === taskId);
    if (task) {
        tasks = tasks.filter(item => item.id !== id);
    }
    return tasks;
};

const clearRemovedUserFromTasks = async userId => {
    tasks.forEach(task => {
        if (task.userId === userId) {
            task.userId = null;
        }
    });
};

const deleteTasksByBoardId = async boardId => {
    tasks = tasks.filter(task => task.boardId !== boardId);
    return;
};

module.exports = {
    getTasksByBoardId,
    createNewTask,
    getTaskByIdAndBoardId,
    updateTaskByIdAndBoardId,
    deleteTask,
    clearRemovedUserFromTasks,
    deleteTasksByBoardId,
};
