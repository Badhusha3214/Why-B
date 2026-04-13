const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/category.controller');

// GET /api/v1/categories
// POST /api/v1/categories
// GET /api/v1/categories/:id
// PATCH /api/v1/categories/:id
// DELETE /api/v1/categories/:id

router.route('/').get(ctrl.getAll).post(ctrl.create);
router.route('/:id').get(ctrl.getOne).patch(ctrl.update).delete(ctrl.remove);

module.exports = router;
