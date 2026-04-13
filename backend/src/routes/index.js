const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../middleware/protect');

const authRoutes       = require('./auth.routes');
const uploadRoutes     = require('./upload.routes');
const dashboardRoutes  = require('./dashboard.routes');
const productRoutes    = require('./product.routes');
const categoryRoutes   = require('./category.routes');
const tagRoutes        = require('./tag.routes');
const componentRoutes  = require('./component.routes');
const orderRoutes      = require('./order.routes');
const customerRoutes   = require('./customer.routes');
const couponRoutes     = require('./coupon.routes');
const bannerRoutes     = require('./banner.routes');
const reviewRoutes     = require('./review.routes');

// ─── Public: auth ─────────────────────────────────────────────────────────
router.use('/auth', authRoutes);

// ─── Upload (admin only) ──────────────────────────────────────────────────
router.use('/upload', uploadRoutes);

// ─── Public: read-only browsing (products, categories, tags, banners) ────
router.use('/products',   productRoutes);
router.use('/categories', categoryRoutes);
router.use('/tags',       tagRoutes);
router.use('/banners',    bannerRoutes);

// ─── Admin-only routes (JWT required + role=admin) ────────────────────────
router.use('/dashboard',  protect, restrictTo('admin'), dashboardRoutes);
router.use('/components', protect, restrictTo('admin'), componentRoutes);
router.use('/orders',     protect, restrictTo('admin'), orderRoutes);
router.use('/customers',  protect, restrictTo('admin'), customerRoutes);
router.use('/coupons',    protect, restrictTo('admin'), couponRoutes);
router.use('/reviews',    protect, restrictTo('admin'), reviewRoutes);

module.exports = router;
