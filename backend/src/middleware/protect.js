const jwt      = require('jsonwebtoken');
const User     = require('../models/user.model');
const AppError = require('../utils/AppError');

// ─── protect ──────────────────────────────────────────────────────────────
// Verifies JWT from Authorization header (Bearer token) or cookie.
// Attaches the authenticated user to req.user.
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) return next(new AppError('Not authenticated. Please log in.', 401));

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return next(new AppError('Invalid or expired token. Please log in again.', 401));
    }

    // Check user still exists
    const user = await User.findById(decoded.id);
    if (!user) return next(new AppError('User no longer exists', 401));

    if (user.status === 'inactive')
      return next(new AppError('Account is deactivated', 403));

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat))
      return next(new AppError('Password was recently changed. Please log in again.', 401));

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// ─── restrictTo ───────────────────────────────────────────────────────────
// Usage: restrictTo('admin')  or  restrictTo('admin', 'user')
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  next();
};

module.exports = { protect, restrictTo };
