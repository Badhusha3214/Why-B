const Coupon = require('../models/coupon.model');
const AppError = require('../utils/AppError');

exports.getAll = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const items = await Coupon.find(filter);
    res.status(200).json({ status: 'success', results: items.length, data: items });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const item = await Coupon.findById(req.params.id);
    if (!item) return next(new AppError('Coupon not found', 404));
    res.status(200).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.validate = async (req, res, next) => {
  try {
    const { code } = req.params;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: 'active' });
    if (!coupon) return next(new AppError('Invalid or expired coupon', 400));
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return next(new AppError('Coupon has expired', 400));
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return next(new AppError('Coupon usage limit reached', 400));
    res.status(200).json({ status: 'success', data: coupon });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const item = await Coupon.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return next(new AppError('Coupon not found', 404));
    res.status(200).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await Coupon.findByIdAndDelete(req.params.id);
    if (!item) return next(new AppError('Coupon not found', 404));
    res.status(204).json({ status: 'success', data: null });
  } catch (err) { next(err); }
};
