const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/order.controller');

// GET /api/v1/orders                        - list (filter by status, paymentStatus)
// GET /api/v1/orders/:id                    - single order
// PATCH /api/v1/orders/:id/status           - update order status
// PATCH /api/v1/orders/:id/payment-status   - update payment status
// DELETE /api/v1/orders/:id                 - delete

router.route('/').get(ctrl.getAll);
router.route('/:id').get(ctrl.getOne).delete(ctrl.remove);
router.patch('/:id/status', ctrl.updateStatus);
router.patch('/:id/payment-status', ctrl.updatePaymentStatus);

module.exports = router;
