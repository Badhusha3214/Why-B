const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/product.controller');

// GET /api/v1/products          - list with filters & pagination
// POST /api/v1/products         - create
// POST /api/v1/products/bulk-delete - bulk delete
// GET /api/v1/products/:id      - single
// PATCH /api/v1/products/:id    - update
// DELETE /api/v1/products/:id   - delete

router.route('/').get(ctrl.getAll).post(ctrl.create);
router.post('/bulk-delete', ctrl.bulkDelete);
router.route('/:id').get(ctrl.getOne).patch(ctrl.update).delete(ctrl.remove);

module.exports = router;
