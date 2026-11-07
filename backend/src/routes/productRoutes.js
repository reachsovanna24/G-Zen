const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin-only routes
router.post('/', verifyToken, requireAdmin, productController.createProduct);
router.post('/admin/bulk-stock', verifyToken, requireAdmin, productController.bulkStockUpdate);
router.post('/admin/bulk-discount', verifyToken, requireAdmin, productController.bulkDiscount);
router.post('/admin/:id/clone', verifyToken, requireAdmin, productController.cloneProduct);
router.put('/:id', verifyToken, requireAdmin, productController.updateProduct);
router.delete('/:id', verifyToken, requireAdmin, productController.deleteProduct);

module.exports = router;

