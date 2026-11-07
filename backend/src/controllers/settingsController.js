const { Setting, sequelize } = require('../models');
const seedDatabase = require('../seed/seedData');

const DEFAULT_SETTINGS = {
  announcementActive: true,
  announcementText: '⚡ Express 1-hour delivery across Toul Kork, BKK1, & Daun Penh | Scan & Pay via KHQR / ABA Bank',
  announcementType: 'emerald', // 'emerald', 'indigo', 'amber', 'rose'
  storeName: 'G-Zen Phone Store',
  storePhone: '+855 23 999 888 / 012 345 678',
  storeAddress: '#188 Preah Monivong Blvd, Sangkat Boeung Keng Kang 1, Khan Chamkar Mon, Phnom Penh',
  storeHours: 'Mon - Sun: 8:00 AM - 8:30 PM',
  telegramSupport: '@Lee_min_roth',
  freeShippingThreshold: 200,
  bannerNotice: 'Official Apple & Samsung Flagship Retailer in Phnom Penh',
};

exports.getSettings = async (req, res) => {
  try {
    const records = await Setting.findAll();
    const settings = { ...DEFAULT_SETTINGS };

    for (const record of records) {
      try {
        settings[record.key] = JSON.parse(record.value);
      } catch {
        settings[record.key] = record.value;
      }
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve settings.', settings: DEFAULT_SETTINGS });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, val] of Object.entries(updates)) {
      const stringValue = typeof val === 'object' ? JSON.stringify(val) : String(val);
      await Setting.upsert({
        key,
        value: stringValue,
      });
    }

    // Return the merged settings
    const records = await Setting.findAll();
    const settings = { ...DEFAULT_SETTINGS };
    for (const record of records) {
      try {
        settings[record.key] = JSON.parse(record.value);
      } catch {
        settings[record.key] = record.value;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Store configuration and broadcast settings saved.',
      settings,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update store settings.' });
  }
};

exports.resetDatabase = async (req, res) => {
  try {
    console.log('🔄 Admin triggered factory database reset & re-seed...');
    // Drop and re-sync all tables
    await sequelize.sync({ force: true });
    // Re-seed all data
    await seedDatabase();

    return res.status(200).json({
      success: true,
      message: 'Store database successfully reset to clean production state (catalog products and admin account preserved, zero demo data).',
    });
  } catch (error) {
    console.error('Reset database error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset database: ' + error.message });
  }
};
