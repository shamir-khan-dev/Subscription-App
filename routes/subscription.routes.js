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

// Static routes FIRST (before /:id to avoid shadowing)

// GET /api/v1/subscriptions — returns the logged-in user's subscriptions
subscriptionRouter.get('/', getUserSubscriptions);

// GET /api/v1/subscriptions/upcoming-renewals
subscriptionRouter.get('/upcoming-renewals', getUpcomingRenewals);

// POST /api/v1/subscriptions
subscriptionRouter.post('/', createSubscription);

// Dynamic :id routes AFTER static routes

// GET /api/v1/subscriptions/user/:id
subscriptionRouter.get('/user/:id', getUserSubscriptions);

// GET /api/v1/subscriptions/:id
subscriptionRouter.get('/:id', getSubscriptionDetails);

// PUT /api/v1/subscriptions/:id
subscriptionRouter.put('/:id', updateSubscription);

// PUT /api/v1/subscriptions/:id/cancel
subscriptionRouter.put('/:id/cancel', cancelSubscription);

// DELETE /api/v1/subscriptions/:id
subscriptionRouter.delete('/:id', deleteSubscription);

export default subscriptionRouter;
