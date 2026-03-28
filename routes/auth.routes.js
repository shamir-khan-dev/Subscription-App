import { Router } from 'express';

const authRouter = Router();

// Path: /api/v1/auth/sign-up (POST)
authRouter.post('/sign-up', (req, res) => res.send({ title: 'Sign up' }));

// Path: /api/v1/auth/sign-in (POST)
authRouter.post('/sign-in', (req, res) => res.send({ title: 'Sign in' }));

// Path: /api/v1/auth/sign-out (POST)
authRouter.post('/sign-out', (req, res) => res.send({ title: 'Sign out' }));

export default authRouter;
