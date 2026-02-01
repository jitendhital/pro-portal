import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/errors.js';

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.access_token;

  if (!token) {
    console.log('verifyToken: No access_token cookie found. Cookies:', req.cookies);
    return next(errorHandler(401, 'Unauthorized'));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('verifyToken: JWT verification failed:', err.message);
      return next(errorHandler(403, 'Forbidden'));
    }
    req.user = user;
    next();
  });
};

export const verifyTokenOptional = (req, res, next) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // If token is invalid, just proceed without setting req.user
      // We don't want to block the request, just treat as anonymous
      return next();
    }
    req.user = user;
    next();
  });
};

