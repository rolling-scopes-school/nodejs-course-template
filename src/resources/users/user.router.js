const router = require('express').Router();
const User = require('./user.model');
const usersService = require('./user.service');

router
    .route("/")
    .get(async (req, res) => {
      const users = await usersService.getAll();
      // map user fields to exclude secret fields like "password"
      await res.json(users.map(User.toResponse));
    })
    .post(async (req, res, next) => {
      const newUser = await usersService.createNewUser(req.body);

      if (newUser) {
        return res.json(User.toResponse(newUser));
      }
      return next({ status: 400, message: "Bad request" })
    });

router
    .route("/:id")
    .get(async (req, res, next) => {
      const user = await usersService.getUserById(req.params.id);
      if (user) {
        await res.json(User.toResponse(user))
      }
      return next({ status: 404, message: "User not found" });
    })
    .put(async (req, res, next) => {

      const user = await  usersService.updateUserById(req.params.id, req.body);
      if (user) {
        await res.json(user)
      }
      return next({ status: 400, message: "Bad request" });
    })
    .delete(async (req, res, next) => {

      const status = await  usersService.deleteUserById(req.params.id);
      if (status) {
        return await res.status(204).json({ message: "The user has been deleted" })
      }
      return next({ status: 404, message: "User not found" });
    });

module.exports = router;
