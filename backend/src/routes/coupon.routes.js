const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/coupon.controller');

// GET /api/v1/coupons                   - list
// POST /api/v1/coupons                  - create
// GET /api/v1/coupons/validate/:code    - validate coupon code
// GET /api/v1/coupons/:id               - single
// PATCH /api/v1/coupons/:id             - update
// DELETE /api/v1/coupons/:id            - delete

router.route('/').get(ctrl.getAll).post(ctrl.create);
router.get('/validate/:code', ctrl.validate);
router.route('/:id').get(ctrl.getOne).patch(ctrl.update).delete(ctrl.remove);

module.exports = router;
