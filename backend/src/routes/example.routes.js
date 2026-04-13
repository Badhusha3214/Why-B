const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/example.controller');

router.route('/').get(ctrl.getAll).post(ctrl.create);
router.route('/:id').get(ctrl.getOne).patch(ctrl.update).delete(ctrl.remove);

module.exports = router;
