const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/component.controller');

// GET /api/v1/components          - list (filter by type, status)
// POST /api/v1/components         - create
// GET /api/v1/components/:id      - single
// PATCH /api/v1/components/:id    - update
// DELETE /api/v1/components/:id   - delete

router.route('/').get(ctrl.getAll).post(ctrl.create);
router.route('/:id').get(ctrl.getOne).patch(ctrl.update).delete(ctrl.remove);

module.exports = router;
