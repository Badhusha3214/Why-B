const Banner = require('../models/banner.model');
const AppError = require('../utils/AppError');

exports.getAll = async (req, res, next) => {
  try {
    const { position, status } = req.query;
    const filter = {};
    if (position) filter.position = position;
    if (status) filter.status = status;
    const items = await Banner.find(filter).sort({ order: 1 });
    res.status(200).json({ status: 'success', results: items.length, data: items });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const item = await Banner.findById(req.params.id);
    if (!item) return next(new AppError('Banner not found', 404));
    res.status(200).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const item = await Banner.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Banner.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
    if (!item) return next(new AppError('Banner not found', 404));
    res.status(200).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await Banner.findByIdAndDelete(req.params.id);
    if (!item) return next(new AppError('Banner not found', 404));
    res.status(204).json({ status: 'success', data: null });
  } catch (err) { next(err); }
};

exports.reorder = async (req, res, next) => {
  try {
    const { items } = req.body; // [{ id, order }]
    if (!Array.isArray(items)) return next(new AppError('items array is required', 400));
    await Promise.all(items.map(({ id, order }) => Banner.findByIdAndUpdate(id, { order })));
    res.status(200).json({ status: 'success', message: 'Banners reordered' });
  } catch (err) { next(err); }
};
