const { Order, Product, User } = require('../models');
const bakongService = require('../services/bakongService');
const { supabase } = require('../config/supabase');

const autoSyncOrder = (order) => {
  if (order && supabase && typeof supabase.syncOrder === 'function') {
    supabase.syncOrder(order).catch(err => console.error('[Supabase AutoSync Warning]:', err.message));
  }
};

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
      const product = await Product.findByPk(item.productId || item.product || item.id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product "${item.name}" not found.` });
      }

      const qty = parseInt(item.quantity || 1, 10);
      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
        });
      }

      // Deduct stock
      product.stock -= qty;
      await product.save();

      const itemTotal = product.price * qty;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: qty,
        image: product.image,
        category: product.category,
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

    const order = await Order.create({
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

    autoSyncOrder(order);

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
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone'],
        }
      ]
    });

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

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // If transitioning to Cancelled/Refunded from an active state, restore product stock
    if (['Cancelled', 'Refunded'].includes(status) && !['Cancelled', 'Refunded'].includes(order.status)) {
      if (Array.isArray(order.items)) {
        for (const it of order.items) {
          if (it.productId) {
            const p = await Product.findByPk(it.productId);
            if (p) {
              p.stock += (it.quantity || 1);
              await p.save();
            }
          }
        }
      }
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (notes !== undefined) order.notes = notes;

    await order.save();
    autoSyncOrder(order);

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${order.status}".`,
      order,
    });
  } catch (error) {
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
      items, // array of { productId, quantity, price }
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
      const product = await Product.findByPk(item.productId || item.id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ID ${item.productId} not found.` });
      }

      const qty = parseInt(item.quantity || 1, 10);
      const unitPrice = item.price !== undefined ? parseFloat(item.price) : product.price;

      if (product.stock >= qty) {
        product.stock -= qty;
        await product.save();
      }

      subtotal += unitPrice * qty;
      validatedItems.push({
        productId: product.id,
        name: product.name,
        price: unitPrice,
        quantity: qty,
        image: product.image,
        category: product.category,
      });
    }

    const deliveryFee = district && DISTRICT_FEES[district] !== undefined ? DISTRICT_FEES[district] : 0;
    const totalAmount = parseFloat((subtotal + deliveryFee).toFixed(2));

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `GZ-POS-${Date.now().toString().slice(-4)}${randomSuffix}`;

    const order = await Order.create({
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
      status: 'Delivered', // Walk-in is usually delivered immediately on premise
      notes: notes || 'Created via Admin Back-Office POS Desk',
    });

    autoSyncOrder(order);

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

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (shippingAddress) order.shippingAddress = shippingAddress;
    if (notes !== undefined) order.notes = notes;
    if (totalAmount !== undefined) order.totalAmount = parseFloat(totalAmount);
    if (paymentMethod) order.paymentMethod = paymentMethod;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (status) order.status = status;

    await order.save();
    autoSyncOrder(order);

    return res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} details updated.`,
      order,
    });
  } catch (error) {
    console.error('Update order details error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order details.' });
  }
};

exports.getOrderById = async (req, res) => {
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

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    await order.destroy();
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
    const order = await Order.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { id: isNaN(id) ? -1 : parseInt(id, 10) },
          { orderNumber: id },
          { khqrMd5: id }
        ]
      }
    });

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
    if (!order.khqrMd5) {
      const khqr = await bakongService.generateKhqr({
        amount: order.totalAmount,
        currency: 'USD',
        billNumber: order.orderNumber,
        storeLabel: 'G-Zen Store',
      });
      order.khqrMd5 = khqr.md5;
      order.khqrString = khqr.qrString;
      order.khqrImage = khqr.qrImage;
      order.khqrDeeplink = khqr.deeplink;
      await order.save();
    }

    // 3. Query settlement state against gateway API
    const settlement = await bakongService.checkSettlement(order.khqrMd5);

    if (settlement.paid) {
      order.paymentStatus = 'Paid';
      order.status = 'QC Testing'; // Auto-confirmed on NBC settlement
      order.transactionRef = settlement.data?.hash || settlement.data?.md5 || `BAKONG-${order.khqrMd5.slice(0, 8).toUpperCase()}`;
      order.settlementData = settlement.data;
      await order.save();

      return res.status(200).json({
        success: true,
        paid: true,
        status: 'PAID',
        order,
        settlement: settlement.data,
        message: 'Payment verified and auto-confirmed on NBC ledger!',
      });
    }

    // Still pending payment
    return res.status(200).json({
      success: true,
      paid: false,
      status: 'PENDING',
      message: settlement.message || 'Waiting for transfer on NBC ledger...',
      orderNumber: order.orderNumber,
      khqrMd5: order.khqrMd5,
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
    const order = await Order.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { id: isNaN(id) ? -1 : parseInt(id, 10) },
          { orderNumber: id },
          { khqrMd5: id }
        ]
      }
    });

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

    order.paymentStatus = 'Paid';
    order.status = 'QC Testing'; // Auto-confirmed
    order.khqrMd5 = md5Hash;
    order.transactionRef = mockSettlement.hash;
    order.settlementData = mockSettlement;
    await order.save();
    autoSyncOrder(order);

    return res.status(200).json({
      success: true,
      paid: true,
      status: 'PAID',
      order,
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

    const shouldRefresh = req.query.refresh === 'true' || req.query.regenerate === 'true';

    // If order already has KHQR and not requesting refresh, reuse it
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
          expiresInSeconds: 180, // 3 minutes
        }
      });
    }

    const khqr = await bakongService.generateKhqr({
      amount: order.totalAmount,
      currency: 'USD',
      billNumber: order.orderNumber,
      storeLabel: 'G-Zen Store',
    });

    order.khqrMd5 = khqr.md5;
    order.khqrString = khqr.qrString;
    order.khqrImage = khqr.qrImage;
    order.khqrDeeplink = khqr.deeplink;
    await order.save();
    autoSyncOrder(order);

    return res.status(200).json({
      success: true,
      order,
      khqr: {
        ...khqr,
        expiresInSeconds: 180, // 3 minutes
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to generate order KHQR: ' + error.message });
  }
};



