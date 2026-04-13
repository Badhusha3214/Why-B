const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/customer.controller');

// GET /api/v1/customers           - list (filter, search, pagination)
// GET /api/v1/customers/:id       - single
// PATCH /api/v1/customers/:id     - update
// DELETE /api/v1/customers/:id    - delete

router.route('/').get(ctrl.getAll);
router.route('/:id').get(ctrl.getOne).patch(ctrl.update).delete(ctrl.remove);

module.exports = router;
