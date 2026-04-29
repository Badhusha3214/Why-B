const Review = require('../models/review.model');
const AppError = require('../utils/AppError');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, product } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (product) filter.product = product;
    const items = await Review.find(filter)
      .populate('product', 'name')
      .populate('customer', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Review.countDocuments(filter);
    res.status(200).json({ status: 'success', total, page: Number(page), data: items });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const item = await Review.findById(req.params.id)
      .populate('product', 'name')
      .populate('customer', 'name email');
    if (!item) return next(new AppError('Review not found', 404));
    res.status(200).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, adminReply } = req.body;
    const item = await Review.findByIdAndUpdate(
      req.params.id,
      { status, ...(adminReply !== undefined && { adminReply }) },
      { returnDocument: 'after', runValidators: true }
    );
    if (!item) return next(new AppError('Review not found', 404));
    res.status(200).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await Review.findByIdAndDelete(req.params.id);
    if (!item) return next(new AppError('Review not found', 404));
    res.status(204).json({ status: 'success', data: null });
  } catch (err) { next(err); }
};
