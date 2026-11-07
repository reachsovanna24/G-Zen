const bakongService = require('../services/bakongService');
const { orderService, productService } = require('../services/dataService');
const { Order } = require('../models');

// Phnom Penh District Delivery fee table
const DISTRICT_FEES = {
  'Toul Kork': 1.5,
  'BKK1 (Boeung Keng Kang)': 1.5,
  'Daun Penh': 1.5,
  'Chamkar Mon': 1.5,
  'Prampir Makara': 1.5,
  'Sen Sok': 2.0,
  'Chroy Changvar': 2.5,
  'Meanchey': 2.0,
  'Russey Keo': 2.5,
  'Dangkao': 3.0,
  'Other / Express': 3.0,
};

exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      transactionRef,
      notes,
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.district) {
      return res.status(400).json({ success: false, message: 'Full shipping address including Phnom Penh district is required.' });
    }

    // Validate items and calculate subtotal
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prodId = item.productId || item.product || item.id;
      const product = await productService.getProductById(prodId);

      const qty = parseInt(item.quantity || 1, 10);
      const unitPrice = item.price !== undefined ? parseFloat(item.price) : (product ? product.price : 0);
      const prodName = item.name || (product ? product.name : 'Phone Accessory');

      subtotal += unitPrice * qty;

      validatedItems.push({
        productId: prodId,
        name: prodName,
        price: unitPrice,
        quantity: qty,
        image: item.image || (product ? product.image : ''),
        category: item.category || (product ? product.category : 'Accessories'),
      });
    }

    // Calculate delivery fee
    const deliveryFee = DISTRICT_FEES[shippingAddress.district] !== undefined ? DISTRICT_FEES[shippingAddress.district] : 2.0;
    const totalAmount = parseFloat((subtotal + deliveryFee).toFixed(2));

    // Order number generation
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `GZ-${Date.now().toString().slice(-4)}${randomSuffix}`;

    // Generate authentic Bakong KHQR if payment method is KHQR
    let khqrData = null;
    const isKhqr = (paymentMethod || 'KHQR') === 'KHQR';
    if (isKhqr) {
      try {
        khqrData = await bakongService.generateKhqr({
          amount: totalAmount,
          currency: 'USD',
          billNumber: orderNumber,
          storeLabel: 'G-Zen Store',
          terminalLabel: 'Web-Checkout',
        });
      } catch (khqrErr) {
        console.error('[Order Controller] Bakong KHQR generation warning:', khqrErr.message);
      }
    }

    const order = await orderService.createOrder({
      orderNumber,
      userId: req.user ? req.user.id : null,
      guestInfo: !req.user ? { fullName: shippingAddress.fullName, phone: shippingAddress.phone } : null,
      items: validatedItems,
      subtotal,
      deliveryFee,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'KHQR',
      paymentStatus: (paymentMethod === 'ABA Bank') ? 'Paid' : 'Pending',
      transactionRef: transactionRef || (khqrData ? `BAKONG-${khqrData.md5.slice(0, 8).toUpperCase()}` : null),
      khqrMd5: khqrData ? khqrData.md5 : null,
      khqrString: khqrData ? khqrData.qrString : null,
      khqrImage: khqrData ? khqrData.qrImage : null,
      khqrDeeplink: khqrData ? khqrData.deeplink : null,
      status: 'Pending',
      notes: notes || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully! Thank you for shopping with G-Zen Phone Store.',
      order,
      khqr: khqrData,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ success: false, message: 'Failed to place order.', error: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getMyOrders(req.user.id);

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve all orders.' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, notes } = req.body;

    const validStatuses = ['Pending', 'QC Testing', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await orderService.findOrder(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const updated = await orderService.updateOrder(id, {
      status: status || order.status,
      paymentStatus: paymentStatus || order.paymentStatus,
      notes: notes !== undefined ? notes : order.notes,
    });

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${updated.status}".`,
      order: updated,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
};

exports.createManualOrder = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      district,
      addressNote,
      items,
      paymentMethod,
      paymentStatus,
      notes,
    } = req.body;

    if (!customerName || !phone || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Customer name, phone, and at least one item are required.' });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prodId = item.productId || item.id;
      const product = await productService.getProductById(prodId);
      const qty = parseInt(item.quantity || 1, 10);
      const unitPrice = item.price !== undefined ? parseFloat(item.price) : (product ? product.price : 0);

      subtotal += unitPrice * qty;
      validatedItems.push({
        productId: prodId,
        name: product ? product.name : (item.name || 'Phone Accessory'),
        price: unitPrice,
        quantity: qty,
        image: product ? product.image : '',
        category: product ? product.category : 'Accessories',
      });
    }

    const deliveryFee = district && DISTRICT_FEES[district] !== undefined ? DISTRICT_FEES[district] : 0;
    const totalAmount = parseFloat((subtotal + deliveryFee).toFixed(2));

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `GZ-POS-${Date.now().toString().slice(-4)}${randomSuffix}`;

    const order = await orderService.createOrder({
      orderNumber,
      userId: req.user ? req.user.id : null,
      guestInfo: { fullName: customerName, phone },
      items: validatedItems,
      subtotal,
      deliveryFee,
      totalAmount,
      shippingAddress: {
        fullName: customerName,
        phone,
        district: district || 'In-Store Walk-in / Phnom Penh',
        addressNote: addressNote || 'Walk-in Showroom Order',
      },
      paymentMethod: paymentMethod || 'Cash at Store',
      paymentStatus: paymentStatus || 'Paid',
      transactionRef: paymentMethod === 'KHQR' ? `BAKONG-POS-${randomSuffix}` : `POS-CASH-${randomSuffix}`,
      status: 'Delivered',
      notes: notes || 'Created via Admin Back-Office POS Desk',
    });

    return res.status(201).json({
      success: true,
      message: `Manual order #${order.orderNumber} recorded successfully.`,
      order,
    });
  } catch (error) {
    console.error('Create manual order error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create manual order: ' + error.message });
  }
};

exports.updateOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippingAddress, notes, totalAmount, paymentMethod, paymentStatus, status } = req.body;

    const order = await orderService.findOrder(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const updated = await orderService.updateOrder(id, {
      shippingAddress: shippingAddress || order.shippingAddress,
      notes: notes !== undefined ? notes : order.notes,
      totalAmount: totalAmount !== undefined ? parseFloat(totalAmount) : order.totalAmount,
      paymentMethod: paymentMethod || order.paymentMethod,
      paymentStatus: paymentStatus || order.paymentStatus,
      status: status || order.status,
    });

    return res.status(200).json({
      success: true,
      message: `Order #${updated.orderNumber} details updated.`,
      order: updated,
    });
  } catch (error) {
    console.error('Update order details error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order details.' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderService.findOrder(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order by id error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { supabase } = require('../config/supabase');
    if (!isNaN(id)) {
      await supabase.from('orders').eq('id', parseInt(id, 10)).delete();
    } else {
      await supabase.from('orders').eq('order_number', id).delete();
    }

    try {
      if (Order && typeof Order.findByPk === 'function') {
        const o = await Order.findByPk(id);
        if (o) await o.destroy();
      }
    } catch (e) {}

    return res.status(200).json({ success: true, message: 'Order deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete order.' });
  }
};

/**
 * Real-time settlement verification against NBC ledger using MD5 hash
 */
exports.verifyOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderService.findOrder(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // 1. If already paid, return instantly
    if (order.paymentStatus === 'Paid') {
      return res.status(200).json({
        success: true,
        paid: true,
        status: 'PAID',
        order,
        settlement: order.settlementData || { hash: order.transactionRef, settledAt: order.updatedAt },
        message: 'Payment already verified and confirmed on NBC ledger.',
      });
    }

    // 2. Ensure order has a valid Bakong KHQR MD5 hash
    let activeMd5 = order.khqrMd5;
    if (!activeMd5) {
      const khqr = await bakongService.generateKhqr({
        amount: order.totalAmount,
        currency: 'USD',
        billNumber: order.orderNumber,
        storeLabel: 'G-Zen Store',
      });
      activeMd5 = khqr.md5;
      await orderService.updateOrder(order.id, {
        khqrMd5: khqr.md5,
        khqrString: khqr.qrString,
        khqrImage: khqr.qrImage,
        khqrDeeplink: khqr.deeplink,
      });
    }

    // 3. Query settlement state against gateway API
    const settlement = await bakongService.checkSettlement(activeMd5);

    if (settlement.paid) {
      const updated = await orderService.updateOrder(order.id, {
        paymentStatus: 'Paid',
        status: 'QC Testing',
        settlementData: settlement.data,
      });

      return res.status(200).json({
        success: true,
        paid: true,
        status: 'PAID',
        order: updated,
        settlement: settlement.data,
        message: 'Payment verified and auto-confirmed on NBC ledger!',
      });
    }

    return res.status(200).json({
      success: true,
      paid: false,
      status: 'PENDING',
      message: settlement.message || 'Waiting for transfer on NBC ledger...',
      orderNumber: order.orderNumber,
      khqrMd5: activeMd5,
    });
  } catch (error) {
    console.error('Verify order payment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify payment: ' + error.message });
  }
};

/**
 * Simulate NBC payment confirmation (for instant testing & demos)
 */
exports.simulateOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderService.findOrder(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const crypto = require('crypto');
    const md5Hash = order.khqrMd5 || crypto.createHash('md5').update(`${order.orderNumber}-${Date.now()}`).digest('hex');
    const mockSettlement = bakongService.recordLocalSettlement(md5Hash, {
      hash: `nbc_confirmed_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      fromAccountId: 'customer_mobile@bkrt',
      amount: order.totalAmount,
      currency: 'USD',
      settledAt: new Date().toISOString(),
      orderNumber: order.orderNumber,
    });

    const updated = await orderService.updateOrder(order.id, {
      paymentStatus: 'Paid',
      status: 'QC Testing',
      settlementData: mockSettlement,
    });

    return res.status(200).json({
      success: true,
      paid: true,
      status: 'PAID',
      order: updated,
      settlement: mockSettlement,
      message: 'Simulated payment verified and auto-confirmed successfully on NBC ledger.',
    });
  } catch (error) {
    console.error('Simulate payment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to simulate payment: ' + error.message });
  }
};

/**
 * Retrieve or generate KHQR payload for an order with 3-minute validity
 */
exports.generateOrderKhqr = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderService.findOrder(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const shouldRefresh = req.query.refresh === 'true' || req.query.regenerate === 'true';

    if (!shouldRefresh && order.khqrMd5 && order.khqrImage) {
      return res.status(200).json({
        success: true,
        order,
        khqr: {
          md5: order.khqrMd5,
          qrString: order.khqrString,
          qrImage: order.khqrImage,
          deeplink: order.khqrDeeplink,
          amount: order.totalAmount,
          currency: 'USD',
          billNumber: order.orderNumber,
          expiresInSeconds: 180,
        }
      });
    }

    const khqr = await bakongService.generateKhqr({
      amount: order.totalAmount,
      currency: 'USD',
      billNumber: order.orderNumber,
      storeLabel: 'G-Zen Store',
    });

    const updated = await orderService.updateOrder(order.id, {
      khqrMd5: khqr.md5,
      khqrString: khqr.qrString,
      khqrImage: khqr.qrImage,
      khqrDeeplink: khqr.deeplink,
    });

    return res.status(200).json({
      success: true,
      order: updated,
      khqr: {
        ...khqr,
        expiresInSeconds: 180,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to generate order KHQR: ' + error.message });
  }
};
