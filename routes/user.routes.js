import { Router } from 'express';

const userRouter = Router();

// /api/v1/users
userRouter.get('/', (req, res) => res.send({ title: 'GET all users' }));

// /api/v1/users/:id
userRouter.get('/:id', (req, res) => res.send({ title: 'GET user details' }));

// /api/v1/users (POST)
userRouter.post('/', (req, res) => res.send({ title: 'CREATE new user' }));

// /api/v1/users/:id (PUT)
userRouter.put('/:id', (req, res) => res.send({ title: 'UPDATE user' }));

// /api/v1/users/:id (DELETE)
userRouter.delete('/:id', (req, res) => res.send({ title: 'DELETE user' }));

export default userRouter;
