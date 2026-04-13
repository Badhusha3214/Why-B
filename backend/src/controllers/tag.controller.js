const Tag = require('../models/tag.model');
const AppError = require('../utils/AppError');

exports.getAll = async (req, res, next) => {
  try {
    const items = await Tag.find();
    res.status(200).json({ status: 'success', results: items.length, data: items });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const item = await Tag.findById(req.params.id);
    if (!item) return next(new AppError('Tag not found', 404));
    res.status(200).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const item = await Tag.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Tag.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return next(new AppError('Tag not found', 404));
    res.status(200).json({ status: 'success', data: item });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await Tag.findByIdAndDelete(req.params.id);
    if (!item) return next(new AppError('Tag not found', 404));
    res.status(204).json({ status: 'success', data: null });
  } catch (err) { next(err); }
};
