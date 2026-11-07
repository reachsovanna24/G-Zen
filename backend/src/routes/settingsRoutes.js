const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Public route to get active announcement and store info
router.get('/', settingsController.getSettings);

// Admin-only routes
router.put('/', verifyToken, requireAdmin, settingsController.updateSettings);
router.post('/reset-database', verifyToken, requireAdmin, settingsController.resetDatabase);

module.exports = router;
