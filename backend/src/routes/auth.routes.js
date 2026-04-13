const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/auth.controller');
const { protect } = require('../middleware/protect');

// ─── Public routes ────────────────────────────────────────────────────────
router.post('/register',      ctrl.register);     // User sign-up
router.post('/login',         ctrl.login);         // User login
router.post('/admin/login',   ctrl.adminLogin);    // Admin login
router.post('/logout',        ctrl.logout);        // Logout (clears cookie)

// ─── Protected routes (valid JWT required) ────────────────────────────────
router.get( '/me',             protect, ctrl.getMe);             // Get own profile
router.patch('/change-password', protect, ctrl.changePassword);  // Update password

module.exports = router;
