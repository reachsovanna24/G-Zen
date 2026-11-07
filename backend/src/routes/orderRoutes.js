const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, requireAdmin, optionalAuth } = require('../middleware/auth');

// Customer / Public routes
router.post('/', optionalAuth, orderController.createOrder);
router.get('/my-orders', verifyToken, orderController.getMyOrders);
router.get('/track/:id', orderController.getOrderById);
router.get('/verify-payment/:id', orderController.verifyOrderPayment);
router.post('/simulate-payment/:id', orderController.simulateOrderPayment);
router.get('/khqr/:id', orderController.generateOrderKhqr);

// Admin-only routes
router.get('/admin/all', verifyToken, requireAdmin, orderController.getAllOrders);
router.post('/admin/manual', verifyToken, requireAdmin, orderController.createManualOrder);
router.put('/admin/:id/status', verifyToken, requireAdmin, orderController.updateOrderStatus);
router.put('/admin/:id/details', verifyToken, requireAdmin, orderController.updateOrderDetails);
router.delete('/admin/:id', verifyToken, requireAdmin, orderController.deleteOrder);

module.exports = router;

