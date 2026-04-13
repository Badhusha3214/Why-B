const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/banner.controller');

// GET /api/v1/banners                - list (filter by position, status)
// POST /api/v1/banners               - create
// POST /api/v1/banners/reorder       - reorder banners
// GET /api/v1/banners/:id            - single
// PATCH /api/v1/banners/:id          - update
// DELETE /api/v1/banners/:id         - delete

router.route('/').get(ctrl.getAll).post(ctrl.create);
router.post('/reorder', ctrl.reorder);
router.route('/:id').get(ctrl.getOne).patch(ctrl.update).delete(ctrl.remove);

module.exports = router;
