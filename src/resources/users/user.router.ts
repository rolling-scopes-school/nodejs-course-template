// const router = require('express').Router();
import * as express from 'express';
import { Request, Response } from 'express';
import { IUserDB } from './user.interface';
import User from './user.model';
import * as usersService from './user.service';

const userRouter = express.Router();

userRouter.get('/users', async (_req: Request, res: Response) => {
  const users: Array<IUserDB> = usersService.getAll();
  // map user fields to exclude secret fields like "password"
  return res.json(users.map(User.toResponse));
});

export default userRouter;
