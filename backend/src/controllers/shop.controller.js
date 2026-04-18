const Order    = require('../models/order.model');
const Customer = require('../models/customer.model');
const Coupon   = require('../models/coupon.model');
const Product  = require('../models/product.model');
const Review   = require('../models/review.model');
const AppError = require('../utils/AppError');

// ── Helper: find or create customer from JWT user ──────────────────────────
async function getOrCreateCustomer(user) {
  let c = await Customer.findOne({ email: user.email });
  if (!c) c = await Customer.create({ name: user.name, email: user.email, status: 'active' });
  return c;
}

// GET /api/v1/shop/me
exports.getMe = async (req, res, next) => {
  try {
    const customer = await getOrCreateCustomer(req.user);
    res.status(200).json({ status: 'success', data: { user: req.user, customer } });
  } catch (err) { next(err); }
};

// PATCH /api/v1/shop/me
exports.updateMe = async (req, res, next) => {
  try {
    const { name, phone, addresses } = req.body;
    const customer = await Customer.findOneAndUpdate(
      { email: req.user.email },
      { ...(name && { name }), ...(phone !== undefined && { phone }), ...(addresses && { addresses }) },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({ status: 'success', data: customer });
  } catch (err) { next(err); }
};

// GET /api/v1/shop/orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ email: req.user.email });
    if (!customer) return res.status(200).json({ status: 'success', data: [] });
    const orders = await Order.find({ customer: customer._id })
      .populate('items.product', 'name price salePrice images')
      .sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: orders });
  } catch (err) { next(err); }
};

// POST /api/v1/shop/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, notes } = req.body;
    if (!items || !items.length)  return next(new AppError('Order must have at least one item', 400));
    if (!shippingAddress)         return next(new AppError('Shipping address is required', 400));

    const customer = await getOrCreateCustomer(req.user);

    // Enrich items from DB
    let totalAmount = 0;
    const enrichedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId).populate('components');
      if (!product || product.status !== 'active')
        return next(new AppError(`Product not available`, 404));
      const price = product.salePrice || product.price;
      enrichedItems.push({
        product: product._id,
        quantity: item.quantity || 1,
        price,
        components: product.components.map(c => c._id),
      });
      totalAmount += price * (item.quantity || 1);
    }

    // Coupon
    let discountAmount = 0;
    let couponDoc = null;
    if (couponCode) {
      couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase().trim(), status: 'active' });
      if (couponDoc) {
        if (couponDoc.expiresAt && new Date() > new Date(couponDoc.expiresAt)) {
          couponDoc = null;
        } else if (couponDoc.maxUses && couponDoc.usedCount >= couponDoc.maxUses) {
          couponDoc = null;
        } else if (totalAmount < (couponDoc.minOrderAmount || 0)) {
          couponDoc = null;
        } else {
          discountAmount = couponDoc.type === 'percentage'
            ? Math.round((totalAmount * couponDoc.value) / 100)
            : couponDoc.value;
          await Coupon.findByIdAndUpdate(couponDoc._id, { $inc: { usedCount: 1 } });
        }
      }
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);

    // Dummy payment: card = instantly paid, cod = pending
    const paymentStatus = paymentMethod === 'card' ? 'paid' : 'pending';

    const order = await Order.create({
      customer: customer._id,
      items: enrichedItems,
      totalAmount: finalAmount,
      discountAmount,
      coupon: couponDoc?._id || null,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus,
      status: 'pending',
      notes: notes || '',
    });

    await Customer.findByIdAndUpdate(customer._id, {
      $inc: { totalOrders: 1, totalSpent: finalAmount },
    });

    const populated = await Order.findById(order._id)
      .populate('items.product', 'name price salePrice images');

    res.status(201).json({ status: 'success', data: populated });
  } catch (err) { next(err); }
};

// GET /api/v1/shop/coupon/:code
exports.validateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase(), status: 'active' });
    if (!coupon) return next(new AppError('Invalid or expired coupon code', 404));
    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt))
      return next(new AppError('This coupon has expired', 400));
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
      return next(new AppError('Coupon usage limit reached', 400));
    res.status(200).json({ status: 'success', data: coupon });
  } catch (err) { next(err); }
};

// POST /api/v1/shop/reviews
exports.submitReview = async (req, res, next) => {
  try {
    const customer = await getOrCreateCustomer(req.user);
    const { productId, rating, title, body } = req.body;
    if (!productId || !rating || !body) return next(new AppError('productId, rating, and body are required', 400));
    const review = await Review.create({
      product: productId,
      customer: customer._id,
      rating: Number(rating),
      title: title || '',
      body,
      status: 'pending',
    });
    res.status(201).json({ status: 'success', data: review });
  } catch (err) { next(err); }
};
