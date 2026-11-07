const bakongService = require('../services/bakongService');

exports.generateKhqr = async (req, res) => {
  try {
    const {
      amount,
      currency,
      billNumber,
      storeLabel,
      terminalLabel,
      accountId,
      merchantName,
      merchantCity,
    } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive amount is required.' });
    }

    const bill = billNumber || `GZ-BILL-${Date.now().toString().slice(-6)}`;
    const khqr = await bakongService.generateKhqr({
      amount: parseFloat(amount),
      currency: currency || 'USD',
      billNumber: bill,
      storeLabel,
      terminalLabel,
      accountId,
      merchantName,
      merchantCity,
    });

    return res.status(200).json({
      success: true,
      khqr,
    });
  } catch (error) {
    console.error('Bakong controller generate error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate Bakong KHQR.', error: error.message });
  }
};

exports.checkSettlement = async (req, res) => {
  try {
    const { md5 } = req.params;
    if (!md5 || md5.trim().length !== 32) {
      return res.status(400).json({ success: false, message: 'Invalid 32-character MD5 transaction hash.' });
    }

    const result = await bakongService.checkSettlement(md5.trim());
    return res.status(200).json({
      success: true,
      paid: result.paid,
      status: result.status,
      message: result.message,
      data: result.data,
      raw: result.raw,
      source: result.source,
    });
  } catch (error) {
    console.error('Bakong controller check error:', error);
    return res.status(500).json({ success: false, message: 'Failed to check settlement.', error: error.message });
  }
};

exports.getHealth = async (req, res) => {
  try {
    const health = await bakongService.checkGatewayHealth();
    return res.status(200).json({
      success: true,
      ...health,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
