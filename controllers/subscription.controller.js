import Subscription from '../models/subscription.model.js';

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    // Check if the user is requesting their own subscriptions
    if (req.user.id !== req.params.id) {
      const error = new Error('You are not the owner of this account');
      error.statusCode = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.params.id });

    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionDetails = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id).populate('user', 'name email');

    if (!subscription) {
      const error = new Error('Subscription not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    });

    if (!subscription) {
      const error = new Error('Subscription not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findByIdAndDelete(req.params.id);

    if (!subscription) {
      const error = new Error('Subscription not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, message: 'Subscription deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error('Subscription not found');
      error.statusCode = 404;
      throw error;
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingRenewals = async (req, res, next) => {
  try {
    const today = new Date();
    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(today.getDate() + 10);

    const subscriptions = await Subscription.find({
      renewalDate: { $gte: today, $lte: tenDaysFromNow },
      status: 'active'
    }).populate('user', 'name email');

    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};
