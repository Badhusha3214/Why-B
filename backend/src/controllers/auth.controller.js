const jwt      = require('jsonwebtoken');
const User     = require('../models/user.model');
const AppError = require('../utils/AppError');

// ─── Helper: sign JWT ──────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// ─── Helper: send token in cookie + JSON ──────────────────────────────────
const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // not accessible via JS — protects against XSS
    sameSite: 'strict',
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

// ─── Register (User) ──────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return next(new AppError('Email already registered', 409));

    const user = await User.create({ name, email, password, role: 'user' });
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ─── Login (User) ─────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new AppError('Email and password are required', 400));

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password)))
      return next(new AppError('Incorrect email or password', 401));

    if (user.status === 'inactive')
      return next(new AppError('Your account has been deactivated', 403));

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─── Admin Login ──────────────────────────────────────────────────────────
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new AppError('Email and password are required', 400));

    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!user || !(await user.correctPassword(password)))
      return next(new AppError('Invalid admin credentials', 401));

    if (user.status === 'inactive')
      return next(new AppError('Admin account is deactivated', 403));

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 5 * 1000), // expire in 5 seconds
    httpOnly: true,
    sameSite: 'strict',
  });
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

// ─── Get current logged-in user ───────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

// ─── Change password ──────────────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return next(new AppError('Current and new password are required', 400));

    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.correctPassword(currentPassword)))
      return next(new AppError('Current password is incorrect', 401));

    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};
