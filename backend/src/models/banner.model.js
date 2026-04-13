const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Banner title is required'], trim: true },
    subtitle: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, required: [true, 'Banner image is required'] },
    link: { type: String, default: '' },
    position: { type: String, enum: ['home_top', 'home_middle', 'sidebar', 'popup'], default: 'home_top' },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
