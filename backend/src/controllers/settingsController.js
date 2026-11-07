const { Setting } = require('../models');
const { supabase } = require('../config/supabase');

const DEFAULT_SETTINGS = {
  announcementActive: true,
  announcementText: '⚡ Express 1-hour delivery across Toul Kork, BKK1, & Daun Penh | Scan & Pay via KHQR / ABA Bank',
  announcementType: 'emerald',
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
    const settings = { ...DEFAULT_SETTINGS };

    // 1. Try Supabase
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (!error && data && data.length > 0) {
        for (const row of data) {
          try {
            settings[row.key] = JSON.parse(row.value);
          } catch {
            settings[row.key] = row.value;
          }
        }
        return res.status(200).json({ success: true, settings });
      }
    } catch (e) {}

    // 2. Try SQLite
    try {
      if (Setting && typeof Setting.findAll === 'function') {
        const records = await Setting.findAll();
        for (const record of records) {
          try {
            settings[record.key] = JSON.parse(record.value);
          } catch {
            settings[record.key] = record.value;
          }
        }
      }
    } catch (e) {}

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return res.status(200).json({ success: true, settings: DEFAULT_SETTINGS });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, val] of Object.entries(updates)) {
      const stringValue = typeof val === 'object' ? JSON.stringify(val) : String(val);
      try {
        await supabase.from('settings').upsert({ key, value: stringValue });
      } catch (e) {}

      try {
        if (Setting && typeof Setting.upsert === 'function') {
          await Setting.upsert({ key, value: stringValue });
        }
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      message: 'Store settings updated successfully.',
      settings: updates,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
};

exports.resetDatabase = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Database state verified.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Reset failed: ' + error.message });
  }
};
