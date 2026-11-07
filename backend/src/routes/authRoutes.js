const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/admin/login', authController.adminLogin);
router.get('/me', verifyToken, authController.getMe);

// Admin User Management
router.get('/admin/users', verifyToken, requireAdmin, authController.getAllUsers);
router.post('/admin/users/create', verifyToken, requireAdmin, authController.adminCreateUser);
router.put('/admin/users/:id/role', verifyToken, requireAdmin, authController.updateUserRole);
router.put('/admin/users/:id/password', verifyToken, requireAdmin, authController.adminResetPassword);
router.delete('/admin/users/:id', verifyToken, requireAdmin, authController.deleteUser);

module.exports = router;

