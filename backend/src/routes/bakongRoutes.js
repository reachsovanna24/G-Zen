const express = require('express');
const router = express.Router();
const bakongController = require('../controllers/bakongController');

// Standalone KHQR generation and NBC settlement check
router.post('/generate', bakongController.generateKhqr);
router.get('/check/:md5', bakongController.checkSettlement);
router.get('/health', bakongController.getHealth);

module.exports = router;
