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

const getTaskById = async (id) => {
    return tasks.find(task => task.id === id);
};

const updateTaskById = async (id, data) => {
    const task = await getTaskById(id);
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

const deleteTask = async taskId => {
    const task = await getTaskById(taskId);
    if (task) {
        tasks = tasks.filter(task => task.id !== taskId);
    }
    return task;
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
};

module.exports = {
    getTasksByBoardId,
    createNewTask,
    getTaskById,
    updateTaskById,
    deleteTask,
    clearRemovedUserFromTasks,
    deleteTasksByBoardId,
};
