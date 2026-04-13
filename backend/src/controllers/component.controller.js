const Component = require('../models/component.model');
const AppError = require('../utils/AppError');

exports.getAll = async (req, res, next) => {
  try {
    const { type, status, search } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const items = await Component.find(filter);
    res.status(200).json({ status: 'success', results: items.length, data: items });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const item = await Component.findById(req.params.id);
    if (!item) return next(new AppError('Component not found', 404));
    res.status(200).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const item = await Component.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Component.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return next(new AppError('Component not found', 404));
    res.status(200).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await Component.findByIdAndDelete(req.params.id);
    if (!item) return next(new AppError('Component not found', 404));
    res.status(204).json({ status: 'success', data: null });
  } catch (err) { next(err); }
};
