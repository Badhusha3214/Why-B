const Product = require('../models/product.model');
const AppError = require('../utils/AppError');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category, tag, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const items = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('tags', 'name slug color')
      .populate('components', 'name type price')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Product.countDocuments(filter);
    res.status(200).json({ status: 'success', total, page: Number(page), data: items });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const item = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('tags', 'name slug color')
      .populate('components');
    if (!item) return next(new AppError('Product not found', 404));
    res.status(200).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const item = await Product.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Product.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
    if (!item) return next(new AppError('Product not found', 404));
    res.status(200).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await Product.findByIdAndDelete(req.params.id);
    if (!item) return next(new AppError('Product not found', 404));
    res.status(204).json({ status: 'success', data: null });
  } catch (err) { next(err); }
};

exports.bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return next(new AppError('ids array is required', 400));
    await Product.deleteMany({ _id: { $in: ids } });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) { next(err); }
};
