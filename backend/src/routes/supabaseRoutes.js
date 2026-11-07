const express = require('express');
const router = express.Router();
const supabaseController = require('../controllers/supabaseController');

router.get('/status', supabaseController.getStatus);
router.get('/table/:tableName', supabaseController.getTableData);
router.post('/sync-order/:id', supabaseController.syncOrderToSupabase);
router.post('/sync-all', supabaseController.syncAllData);

module.exports = router;
