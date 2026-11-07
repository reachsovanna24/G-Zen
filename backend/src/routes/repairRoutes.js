const express = require('express');
const router = express.Router();
const repairController = require('../controllers/repairController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Public customer routes
router.post('/', repairController.createBooking);
router.get('/track/:ticket', repairController.getBookingByTicket);

// Admin-only routes
router.get('/admin/all', verifyToken, requireAdmin, repairController.getAllBookings);
router.post('/admin/walkin', verifyToken, requireAdmin, repairController.createWalkinBooking);
router.put('/admin/:id/status', verifyToken, requireAdmin, repairController.updateBookingStatus);
router.delete('/admin/:id', verifyToken, requireAdmin, repairController.deleteBooking);

module.exports = router;

