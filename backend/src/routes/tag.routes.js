const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tag.controller');

// GET /api/v1/tags
// POST /api/v1/tags
// GET /api/v1/tags/:id
// PATCH /api/v1/tags/:id
// DELETE /api/v1/tags/:id

router.route('/').get(ctrl.getAll).post(ctrl.create);
router.route('/:id').get(ctrl.getOne).patch(ctrl.update).delete(ctrl.remove);

module.exports = router;
