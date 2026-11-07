const { supabase, SUPABASE_URL } = require('../config/supabase');
const { Order, User, Product, RepairBooking, Setting } = require('../models');

exports.getStatus = async (req, res) => {
  try {
    const conn = await supabase.checkConnection();
    return res.status(200).json({
      success: true,
      message: 'Supabase configuration connected successfully.',
      supabaseUrl: SUPABASE_URL,
      projectRef: SUPABASE_URL.replace('https://', '').split('.')[0],
      connection: conn,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to verify Supabase connection: ' + error.message,
    });
  }
};

exports.getTableData = async (req, res) => {
  try {
    const { tableName } = req.params;
    const limit = parseInt(req.query.limit || 20, 10);

    const { data, error, status } = await supabase.from(tableName).select('*').limit(limit);

    if (error) {
      return res.status(status || 400).json({ success: false, error });
    }

    return res.status(200).json({
      success: true,
      table: tableName,
      count: Array.isArray(data) ? data.length : 1,
      data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.syncOrderToSupabase = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { id: isNaN(id) ? -1 : parseInt(id, 10) },
          { orderNumber: id }
        ]
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const syncResult = await supabase.syncOrder(order);

    return res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} synced to Supabase.`,
      result: syncResult,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Sync error: ' + error.message });
  }
};

exports.syncAllData = async (req, res) => {
  try {
    const results = {
      users: 0,
      products: 0,
      orders: 0,
      repairs: 0,
    };

    // 1. Sync Users
    const users = await User.findAll();
    for (const u of users) {
      await supabase.syncUser(u);
      results.users++;
    }

    // 2. Sync Products
    const products = await Product.findAll();
    for (const p of products) {
      await supabase.syncProduct(p);
      results.products++;
    }

    // 3. Sync Orders
    const orders = await Order.findAll();
    for (const o of orders) {
      await supabase.syncOrder(o);
      results.orders++;
    }

    // 4. Sync Repairs
    const repairs = await RepairBooking.findAll();
    for (const r of repairs) {
      await supabase.syncRepair(r);
      results.repairs++;
    }

    return res.status(200).json({
      success: true,
      message: 'All local data successfully synced to Supabase cloud database.',
      syncedCounts: results,
      supabaseUrl: SUPABASE_URL,
    });
  } catch (error) {
    console.error('Sync all to Supabase error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to sync data to Supabase: ' + error.message,
    });
  }
};
