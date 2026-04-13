const Customer = require('../models/customer.model');
const AppError = require('../utils/AppError');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const items = await Customer.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Customer.countDocuments(filter);
    res.status(200).json({ status: 'success', total, page: Number(page), data: items });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const item = await Customer.findById(req.params.id);
    if (!item) return next(new AppError('Customer not found', 404));
    res.status(200).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return next(new AppError('Customer not found', 404));
    res.status(200).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await Customer.findByIdAndDelete(req.params.id);
    if (!item) return next(new AppError('Customer not found', 404));
    res.status(204).json({ status: 'success', data: null });
  } catch (err) { next(err); }
};
