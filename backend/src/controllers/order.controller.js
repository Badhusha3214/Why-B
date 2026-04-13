const Order = require('../models/order.model');
const AppError = require('../utils/AppError');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const items = await Order.find(filter)
      .populate('customer', 'name email')
      .populate('items.product', 'name price images')
      .populate('coupon', 'code type value')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Order.countDocuments(filter);
    res.status(200).json({ status: 'success', total, page: Number(page), data: items });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const item = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.product')
      .populate('coupon');
    if (!item) return next(new AppError('Order not found', 404));
    res.status(200).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const item = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!item) return next(new AppError('Order not found', 404));
    res.status(200).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    const item = await Order.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true, runValidators: true });
    if (!item) return next(new AppError('Order not found', 404));
    res.status(200).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await Order.findByIdAndDelete(req.params.id);
    if (!item) return next(new AppError('Order not found', 404));
    res.status(204).json({ status: 'success', data: null });
  } catch (err) { next(err); }
};
