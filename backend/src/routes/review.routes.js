const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/review.controller');

// GET /api/v1/reviews                       - list (filter by status, product)
// GET /api/v1/reviews/:id                   - single
// PATCH /api/v1/reviews/:id/status          - approve / reject / reply
// DELETE /api/v1/reviews/:id                - delete

router.route('/').get(ctrl.getAll);
router.route('/:id').get(ctrl.getOne).delete(ctrl.remove);
router.patch('/:id/status', ctrl.updateStatus);

module.exports = router;
