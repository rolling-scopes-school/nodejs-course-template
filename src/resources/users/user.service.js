const usersRepo = require("./user.memory.repository");
const taskService = require("../tasks/task.service")

const getAll = () => usersRepo.getAll();

const createNewUser = userData => usersRepo.createNewUser(userData);

const getUserById = id => usersRepo.getUserById(id);

const updateUserById = (id, data) => usersRepo.updateUserById(id, data);

const deleteUserById = async id => {
    await taskService.clearRemovedUserFromTasks(id);
    return usersRepo.deleteUserById(id);
};

module.exports = { getAll, createNewUser, getUserById, updateUserById, deleteUserById };
