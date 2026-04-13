const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Component name is required'], trim: true },
    type: { type: String, enum: ['variant', 'addon', 'bundle', 'part'], default: 'variant' },
    description: { type: String, default: '' },
    price: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, unique: true, sparse: true },
    attributes: { type: Map, of: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Component', componentSchema);
