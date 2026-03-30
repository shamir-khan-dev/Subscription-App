import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import User from '../models/user.model.js';

const authorize = async (req, res, next) => {
  try {
    let token;

    // Check if the authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      const error = new Error('Unauthorized - No token provided');
      error.statusCode = 401;
      throw error;
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find the user associated with the token
    const user = await User.findById(decoded.userId);

    if (!user) {
      const error = new Error('Unauthorized - User not found');
      error.statusCode = 401;
      throw error;
    }

    // Attach the user to the request object so subsequent routes can use it
    req.user = user;

    next();
  } catch (error) {
    // If token is invalid or expired, jwt.verify throws an error
    res.status(401).json({ 
      success: false, 
      message: 'Unauthorized', 
      error: error.message 
    });
  }
};

export default authorize;
