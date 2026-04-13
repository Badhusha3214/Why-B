const Example = require('../models/example.model');
const AppError = require('../utils/AppError');

exports.getAll = async (req, res, next) => {
  try {
    const items = await Example.find();
    res.status(200).json({ status: 'success', results: items.length, data: items });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const item = await Example.findById(req.params.id);
    if (!item) return next(new AppError('Item not found', 404));
    res.status(200).json({ status: 'success', data: item });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const item = await Example.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Example.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return next(new AppError('Item not found', 404));
    res.status(200).json({ status: 'success', data: item });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await Example.findByIdAndDelete(req.params.id);
    if (!item) return next(new AppError('Item not found', 404));
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};
