const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/shop.controller');
const { protect } = require('../middleware/protect');

// All shop routes require a logged-in user (not admin)
router.use(protect);

router.get('/me',              ctrl.getMe);
router.patch('/me',            ctrl.updateMe);
router.get('/orders',          ctrl.getMyOrders);
router.post('/orders',         ctrl.createOrder);
router.get('/coupon/:code',    ctrl.validateCoupon);
router.post('/reviews',        ctrl.submitReview);

module.exports = router;
