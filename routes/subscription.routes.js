import { Router } from 'express';

const subscriptionRouter = Router();

// /api/v1/subscriptions
subscriptionRouter.get('/', (req, res) => res.send({ title: 'GET all subscriptions' }));

// /api/v1/subscriptions/:id
subscriptionRouter.get('/:id', (req, res) => res.send({ title: 'GET subscription details' }));

// /api/v1/subscriptions (POST)
subscriptionRouter.post('/', (req, res) => res.send({ title: 'CREATE new subscription' }));

// /api/v1/subscriptions/:id (PUT)
subscriptionRouter.put('/:id', (req, res) => res.send({ title: 'UPDATE subscription' }));

// /api/v1/subscriptions/:id (DELETE)
subscriptionRouter.delete('/:id', (req, res) => res.send({ title: 'DELETE subscription' }));

// /api/v1/subscriptions/user/:id
subscriptionRouter.get('/user/:id', (req, res) => res.send({ title: 'GET all user subscriptions' }));

// /api/v1/subscriptions/:id/cancel
subscriptionRouter.put('/:id/cancel', (req, res) => res.send({ title: 'CANCEL subscription' }));

// /api/v1/subscriptions/upcoming-renewals
subscriptionRouter.get('/upcoming-renewals', (req, res) => res.send({ title: 'GET upcoming renewals' }));

export default subscriptionRouter;
