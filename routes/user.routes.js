import { Router } from 'express';
import { getCurrentUser, getUsers } from '../controllers/user.controller.js';
import authorize from '../middlewares/auth.middleware.js';

const userRouter = Router();

userRouter.get('/', getUsers);
userRouter.get('/:id', authorize, getCurrentUser);

export default userRouter;
