import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js';
import { 
  createSubscription, 
  getUserSubscriptions, 
  getSubscriptionDetails, 
  updateSubscription, 
  deleteSubscription, 
  cancelSubscription, 
  getUpcomingRenewals 
} from '../controllers/subscription.controller.js';

const subscriptionRouter = Router();

subscriptionRouter.use(authorize);

// /api/v1/subscriptions
subscriptionRouter.get('/', (req, res) => res.send({ title: 'GET all subscriptions' }));

// /api/v1/subscriptions/:id
subscriptionRouter.get('/:id', getSubscriptionDetails);

// /api/v1/subscriptions (POST)
subscriptionRouter.post('/', createSubscription);

// /api/v1/subscriptions/:id (PUT)
subscriptionRouter.put('/:id', updateSubscription);

// /api/v1/subscriptions/:id (DELETE)
subscriptionRouter.delete('/:id', deleteSubscription);

// /api/v1/subscriptions/user/:id
subscriptionRouter.get('/user/:id', getUserSubscriptions);

// /api/v1/subscriptions/:id/cancel
subscriptionRouter.put('/:id/cancel', cancelSubscription);

// /api/v1/subscriptions/upcoming-renewals
subscriptionRouter.get('/upcoming-renewals', getUpcomingRenewals);

export default subscriptionRouter;
