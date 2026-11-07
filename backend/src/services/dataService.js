const { supabase } = require('../config/supabase');
const { User, Product, Order, RepairBooking } = require('../models');
const { seedProducts, seedUsers } = require('../seed/seedData');
const bcrypt = require('bcryptjs');

// ==============================================================================
// Formatters (PostgreSQL snake_case <-> Application camelCase)
// ==============================================================================

function formatUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: (row.email || '').toLowerCase(),
    password: row.password,
    role: row.role || 'customer',
    phone: row.phone || null,
    address: row.address || null,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

function formatProduct(row) {
  if (!row) return null;
  let images = row.images;
  if (typeof images === 'string') {
    try { images = JSON.parse(images); } catch (e) { images = []; }
  }
  let specs = row.specs;
  if (typeof specs === 'string') {
    try { specs = JSON.parse(specs); } catch (e) { specs = {}; }
  }

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: parseFloat(row.price || 0),
    originalPrice: row.original_price ? parseFloat(row.original_price) : (row.originalPrice ? parseFloat(row.originalPrice) : null),
    stock: parseInt(row.stock || 0, 10),
    image: row.image,
    images: Array.isArray(images) ? images : [],
    brand: row.brand || 'Tech',
    description: row.description || '',
    specs: specs || {},
    isFeatured: Boolean(row.is_featured !== undefined ? row.is_featured : row.isFeatured),
    rating: parseFloat(row.rating || 4.8),
    warranty: row.warranty || '1 Year Official Warranty (Cambodia)',
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
  };
}

function formatOrder(row) {
  if (!row) return null;
  let items = row.items;
  if (typeof items === 'string') {
    try { items = JSON.parse(items); } catch (e) { items = []; }
  }
  let shippingAddress = row.shipping_address || row.shippingAddress;
  if (typeof shippingAddress === 'string') {
    try { shippingAddress = JSON.parse(shippingAddress); } catch (e) { shippingAddress = {}; }
  }
  let guestInfo = row.guest_info || row.guestInfo;
  if (typeof guestInfo === 'string') {
    try { guestInfo = JSON.parse(guestInfo); } catch (e) { guestInfo = null; }
  }
  let settlementData = row.settlement_data || row.settlementData;
  if (typeof settlementData === 'string') {
    try { settlementData = JSON.parse(settlementData); } catch (e) { settlementData = null; }
  }

  return {
    id: row.id,
    orderNumber: row.order_number || row.orderNumber,
    userId: row.user_id !== undefined ? row.user_id : row.userId,
    guestInfo: guestInfo || null,
    items: Array.isArray(items) ? items : [],
    subtotal: parseFloat(row.subtotal || 0),
    deliveryFee: parseFloat(row.delivery_fee !== undefined ? row.delivery_fee : (row.deliveryFee || 0)),
    totalAmount: parseFloat(row.total_amount !== undefined ? row.total_amount : (row.totalAmount || 0)),
    shippingAddress: shippingAddress || {},
    paymentMethod: row.payment_method || row.paymentMethod || 'KHQR',
    paymentStatus: row.payment_status || row.paymentStatus || 'Pending',
    transactionRef: row.transaction_ref || row.transactionRef || null,
    status: row.status || 'Pending',
    notes: row.notes || '',
    khqrMd5: row.khqr_md5 || row.khqrMd5 || null,
    khqrString: row.khqr_string || row.khqrString || null,
    khqrImage: row.khqr_image || row.khqrImage || null,
    khqrDeeplink: row.khqr_deeplink || row.khqrDeeplink || null,
    settlementData: settlementData || null,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

function formatRepair(row) {
  if (!row) return null;
  return {
    id: row.id,
    ticketNumber: row.ticket_number || row.ticketNumber,
    customerName: row.customer_name || row.customerName,
    phone: row.phone,
    deviceModel: row.device_model || row.deviceModel,
    serviceType: row.service_type || row.serviceType,
    issueDescription: row.issue_description || row.issueDescription,
    preferredDate: row.preferred_date || row.preferredDate,
    status: row.status || 'Received',
    estimatedPrice: parseFloat(row.estimated_price !== undefined ? row.estimated_price : (row.estimatedPrice || 0)),
    technicianNotes: row.technician_notes || row.technicianNotes || '',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

// ==============================================================================
// User Service
// ==============================================================================

const userService = {
  async findByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Supabase cloud database
    try {
      const { data, error } = await supabase.from('users').eq('email', cleanEmail).select('*').limit(1);
      if (!error && data && data.length > 0) {
        return formatUser(data[0]);
      }
    } catch (e) {
      console.warn('[dataService] Supabase findByEmail fallback:', e.message);
    }

    // 2. Try SQLite
    try {
      if (User && typeof User.findOne === 'function') {
        const u = await User.findOne({ where: { email: cleanEmail } });
        if (u) return formatUser(u);
      }
    } catch (e) {}

    // 3. Fallback admin
    if (cleanEmail === 'admin@gzenphone.kh') {
      const admin = seedUsers.find(u => u.email === 'admin@gzenphone.kh');
      if (admin) return formatUser(admin);
    }

    return null;
  },

  async findById(id) {
    if (!id) return null;
    const numId = parseInt(id, 10);

    // 1. Try Supabase
    try {
      const { data, error } = await supabase.from('users').eq('id', numId).select('*').limit(1);
      if (!error && data && data.length > 0) {
        return formatUser(data[0]);
      }
    } catch (e) {}

    // 2. Try SQLite
    try {
      if (User && typeof User.findByPk === 'function') {
        const u = await User.findByPk(numId);
        if (u) return formatUser(u);
      }
    } catch (e) {}

    // 3. Fallback admin
    if (numId === 1 || numId === 2) {
      return formatUser(seedUsers[0]);
    }

    return null;
  },

  async createUser({ name, email, password, role = 'customer', phone, address }) {
    const cleanEmail = email.trim().toLowerCase();
    const hashedPassword = password.startsWith('$2a$') 
      ? password 
      : await bcrypt.hash(password, 10);

    const payload = {
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'customer',
      phone: phone || null,
      address: address || null,
    };

    let created = null;

    // 1. Save to Supabase Cloud Database
    try {
      const { data, error } = await supabase.from('users').insert(payload);
      if (!error && data && data.length > 0) {
        created = formatUser(data[0]);
      }
    } catch (e) {
      console.warn('[dataService] Supabase createUser error:', e.message);
    }

    // 2. Save to SQLite as secondary store
    try {
      if (User && typeof User.create === 'function') {
        const local = await User.create(payload);
        if (!created && local) created = formatUser(local);
      }
    } catch (e) {}

    if (!created) {
      created = formatUser({ id: Date.now(), ...payload });
    }

    return created;
  },

  async getAllUsers() {
    // 1. Try Supabase
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map(formatUser);
      }
    } catch (e) {}

    // 2. Try SQLite
    try {
      if (User && typeof User.findAll === 'function') {
        const list = await User.findAll({ order: [['createdAt', 'DESC']] });
        if (list && list.length > 0) return list.map(formatUser);
      }
    } catch (e) {}

    return seedUsers.map(formatUser);
  },

  async updateRole(id, role) {
    const numId = parseInt(id, 10);
    try {
      await supabase.from('users').eq('id', numId).update({ role });
    } catch (e) {}
    try {
      if (User && typeof User.findByPk === 'function') {
        const u = await User.findByPk(numId);
        if (u) { u.role = role; await u.save(); }
      }
    } catch (e) {}
    return true;
  },

  async deleteUser(id) {
    const numId = parseInt(id, 10);
    try {
      await supabase.from('users').eq('id', numId).delete();
    } catch (e) {}
    try {
      if (User && typeof User.findByPk === 'function') {
        const u = await User.findByPk(numId);
        if (u) await u.destroy();
      }
    } catch (e) {}
    return true;
  }
};

// ==============================================================================
// Order Service
// ==============================================================================

const orderService = {
  async createOrder(data) {
    const payload = {
      order_number: data.orderNumber,
      user_id: data.userId || null,
      guest_info: data.guestInfo || null,
      items: data.items || [],
      subtotal: parseFloat(data.subtotal || 0),
      delivery_fee: parseFloat(data.deliveryFee || 0),
      total_amount: parseFloat(data.totalAmount || 0),
      shipping_address: data.shippingAddress || {},
      payment_method: data.paymentMethod || 'KHQR',
      payment_status: data.paymentStatus || 'Pending',
      transaction_ref: data.transactionRef || null,
      status: data.status || 'Pending',
      notes: data.notes || '',
      khqr_md5: data.khqrMd5 || null,
      khqr_string: data.khqrString || null,
      khqr_image: data.khqrImage || null,
      khqr_deeplink: data.khqrDeeplink || null,
      settlement_data: data.settlementData || null,
    };

    let created = null;

    // 1. Save directly to Supabase
    try {
      const { data: resData, error } = await supabase.from('orders').insert(payload);
      if (!error && resData && resData.length > 0) {
        created = formatOrder(resData[0]);
      } else if (error) {
        console.error('[dataService] Supabase createOrder error:', error);
      }
    } catch (e) {
      console.error('[dataService] Supabase createOrder error:', e.message);
    }

    // 2. Also save to SQLite
    try {
      if (Order && typeof Order.create === 'function') {
        const local = await Order.create(data);
        if (!created && local) created = formatOrder(local);
      }
    } catch (e) {}

    if (!created) {
      created = formatOrder({ id: Date.now(), ...payload });
    }

    return created;
  },

  async getMyOrders(userId) {
    if (!userId) return [];
    const numId = parseInt(userId, 10);

    // 1. Try Supabase
    try {
      const { data, error } = await supabase.from('orders')
        .eq('user_id', numId)
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(formatOrder);
      }
    } catch (e) {}

    // 2. Try SQLite
    try {
      if (Order && typeof Order.findAll === 'function') {
        const list = await Order.findAll({
          where: { userId: numId },
          order: [['createdAt', 'DESC']],
        });
        if (list && list.length > 0) return list.map(formatOrder);
      }
    } catch (e) {}

    return [];
  },

  async getAllOrders() {
    // 1. Try Supabase
    try {
      const { data, error } = await supabase.from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(formatOrder);
      }
    } catch (e) {}

    // 2. Try SQLite
    try {
      if (Order && typeof Order.findAll === 'function') {
        const list = await Order.findAll({ order: [['createdAt', 'DESC']] });
        if (list && list.length > 0) return list.map(formatOrder);
      }
    } catch (e) {}

    return [];
  },

  async findOrder(identifier) {
    if (!identifier) return null;

    // 1. Try Supabase by order_number
    try {
      const { data: byNum } = await supabase.from('orders')
        .eq('order_number', identifier)
        .select('*')
        .limit(1);
      if (byNum && byNum.length > 0) return formatOrder(byNum[0]);

      if (!isNaN(identifier)) {
        const { data: byId } = await supabase.from('orders')
          .eq('id', parseInt(identifier, 10))
          .select('*')
          .limit(1);
        if (byId && byId.length > 0) return formatOrder(byId[0]);
      }
    } catch (e) {}

    // 2. Try SQLite
    try {
      if (Order && typeof Order.findOne === 'function') {
        const o = await Order.findOne({
          where: {
            [require('sequelize').Op.or]: [
              { orderNumber: identifier },
              { id: isNaN(identifier) ? -1 : parseInt(identifier, 10) }
            ]
          }
        });
        if (o) return formatOrder(o);
      }
    } catch (e) {}

    return null;
  },

  async updateOrder(identifier, updates) {
    const payload = {};
    if (updates.status) payload.status = updates.status;
    if (updates.paymentStatus) payload.payment_status = updates.paymentStatus;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.settlementData) payload.settlement_data = updates.settlementData;

    try {
      if (!isNaN(identifier)) {
        await supabase.from('orders').eq('id', parseInt(identifier, 10)).update(payload);
      } else {
        await supabase.from('orders').eq('order_number', identifier).update(payload);
      }
    } catch (e) {}

    try {
      const o = await this.findOrder(identifier);
      if (o && Order && typeof Order.findByPk === 'function') {
        const local = await Order.findByPk(o.id);
        if (local) {
          if (updates.status) local.status = updates.status;
          if (updates.paymentStatus) local.paymentStatus = updates.paymentStatus;
          if (updates.notes !== undefined) local.notes = updates.notes;
          await local.save();
        }
      }
    } catch (e) {}

    return await this.findOrder(identifier);
  }
};

// ==============================================================================
// Repair Booking Service
// ==============================================================================

const repairService = {
  async createRepair(data) {
    const payload = {
      ticket_number: data.ticketNumber,
      customer_name: data.customerName,
      phone: data.phone,
      device_model: data.deviceModel,
      service_type: data.serviceType,
      issue_description: data.issueDescription,
      preferred_date: data.preferredDate || new Date().toISOString().split('T')[0],
      status: data.status || 'Received',
      estimated_price: parseFloat(data.estimatedPrice || 0),
      technician_notes: data.technicianNotes || '',
    };

    let created = null;

    // 1. Save to Supabase
    try {
      const { data: resData, error } = await supabase.from('repair_bookings').insert(payload);
      if (!error && resData && resData.length > 0) {
        created = formatRepair(resData[0]);
      }
    } catch (e) {
      console.warn('[dataService] Supabase createRepair error:', e.message);
    }

    // 2. Save to SQLite
    try {
      if (RepairBooking && typeof RepairBooking.create === 'function') {
        const local = await RepairBooking.create(data);
        if (!created && local) created = formatRepair(local);
      }
    } catch (e) {}

    if (!created) {
      created = formatRepair({ id: Date.now(), ...payload });
    }

    return created;
  },

  async getByTicket(ticketNumber) {
    if (!ticketNumber) return null;
    const cleanTicket = ticketNumber.trim();

    // 1. Try Supabase
    try {
      const { data, error } = await supabase.from('repair_bookings')
        .eq('ticket_number', cleanTicket)
        .select('*')
        .limit(1);
      if (!error && data && data.length > 0) {
        return formatRepair(data[0]);
      }
    } catch (e) {}

    // 2. Try SQLite
    try {
      if (RepairBooking && typeof RepairBooking.findOne === 'function') {
        const local = await RepairBooking.findOne({ where: { ticketNumber: cleanTicket } });
        if (local) return formatRepair(local);
      }
    } catch (e) {}

    return null;
  },

  async getAllRepairs() {
    // 1. Try Supabase
    try {
      const { data, error } = await supabase.from('repair_bookings')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map(formatRepair);
      }
    } catch (e) {}

    // 2. Try SQLite
    try {
      if (RepairBooking && typeof RepairBooking.findAll === 'function') {
        const list = await RepairBooking.findAll({ order: [['createdAt', 'DESC']] });
        if (list && list.length > 0) return list.map(formatRepair);
      }
    } catch (e) {}

    return [];
  },

  async updateRepair(id, updates) {
    const numId = parseInt(id, 10);
    const payload = {};
    if (updates.status) payload.status = updates.status;
    if (updates.technicianNotes !== undefined) payload.technician_notes = updates.technicianNotes;
    if (updates.estimatedPrice !== undefined) payload.estimated_price = parseFloat(updates.estimatedPrice);
    if (updates.deviceModel) payload.device_model = updates.deviceModel;
    if (updates.serviceType) payload.service_type = updates.serviceType;
    if (updates.issueDescription) payload.issue_description = updates.issueDescription;
    if (updates.customerName) payload.customer_name = updates.customerName;
    if (updates.phone) payload.phone = updates.phone;

    try {
      await supabase.from('repair_bookings').eq('id', numId).update(payload);
    } catch (e) {}

    try {
      if (RepairBooking && typeof RepairBooking.findByPk === 'function') {
        const b = await RepairBooking.findByPk(numId);
        if (b) { Object.assign(b, updates); await b.save(); }
      }
    } catch (e) {}

    return true;
  },

  async deleteRepair(id) {
    const numId = parseInt(id, 10);
    try {
      await supabase.from('repair_bookings').eq('id', numId).delete();
    } catch (e) {}
    try {
      if (RepairBooking && typeof RepairBooking.findByPk === 'function') {
        const b = await RepairBooking.findByPk(numId);
        if (b) await b.destroy();
      }
    } catch (e) {}
    return true;
  }
};

// ==============================================================================
// Product Service
// ==============================================================================

const productService = {
  async getAllProducts(query = {}) {
    let list = [];

    // 1. Try Supabase
    try {
      const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
      if (!error && data && data.length > 0) {
        list = data.map(formatProduct);
      }
    } catch (e) {}

    // 2. Try SQLite
    if (!list.length) {
      try {
        if (Product && typeof Product.findAll === 'function') {
          const sqlProds = await Product.findAll();
          if (sqlProds && sqlProds.length > 0) list = sqlProds.map(formatProduct);
        }
      } catch (e) {}
    }

    // 3. Fallback to seedProducts
    if (!list.length) {
      list = [...seedProducts].map(formatProduct);
    }

    // Apply filtering
    const { category, search, brand, featured, sort } = query;
    if (category && category !== 'All') {
      list = list.filter(p => p.category === category);
    }
    if (brand) {
      list = list.filter(p => p.brand && p.brand.toLowerCase() === brand.toLowerCase());
    }
    if (featured === 'true' || featured === true) {
      list = list.filter(p => p.isFeatured);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return list;
  },

  async getProductById(id) {
    if (!id) return null;
    const numId = parseInt(id, 10);

    // 1. Try Supabase
    try {
      const { data, error } = await supabase.from('products').eq('id', numId).select('*').limit(1);
      if (!error && data && data.length > 0) {
        return formatProduct(data[0]);
      }
    } catch (e) {}

    // 2. Try SQLite
    try {
      if (Product && typeof Product.findByPk === 'function') {
        const p = await Product.findByPk(numId);
        if (p) return formatProduct(p);
      }
    } catch (e) {}

    // 3. Fallback to seedProducts
    const found = seedProducts.find(p => String(p.id) === String(id));
    if (found) return formatProduct(found);

    return null;
  },

  async createProduct(data) {
    const payload = {
      name: data.name,
      category: data.category,
      price: parseFloat(data.price),
      original_price: data.originalPrice ? parseFloat(data.originalPrice) : null,
      stock: parseInt(data.stock, 10),
      image: data.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
      images: Array.isArray(data.images) ? data.images : [],
      description: data.description || '',
      brand: data.brand || 'Tech',
      specs: data.specs || {},
      is_featured: Boolean(data.isFeatured),
      warranty: data.warranty || '1 Year Official Warranty (Cambodia)',
    };

    let created = null;
    try {
      const { data: resData, error } = await supabase.from('products').insert(payload);
      if (!error && resData && resData.length > 0) {
        created = formatProduct(resData[0]);
      }
    } catch (e) {}

    try {
      if (Product && typeof Product.create === 'function') {
        const local = await Product.create(data);
        if (!created && local) created = formatProduct(local);
      }
    } catch (e) {}

    if (!created) {
      created = formatProduct({ id: Date.now(), ...payload });
      seedProducts.unshift(created);
    }

    return created;
  },

  async updateProduct(id, updates) {
    const numId = parseInt(id, 10);
    const payload = {};
    if (updates.name) payload.name = updates.name;
    if (updates.category) payload.category = updates.category;
    if (updates.price !== undefined) payload.price = parseFloat(updates.price);
    if (updates.originalPrice !== undefined) payload.original_price = updates.originalPrice ? parseFloat(updates.originalPrice) : null;
    if (updates.stock !== undefined) payload.stock = parseInt(updates.stock, 10);
    if (updates.image) payload.image = updates.image;
    if (updates.images) payload.images = updates.images;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.brand) payload.brand = updates.brand;
    if (updates.specs) payload.specs = updates.specs;
    if (updates.isFeatured !== undefined) payload.is_featured = Boolean(updates.isFeatured);
    if (updates.warranty) payload.warranty = updates.warranty;

    try {
      await supabase.from('products').eq('id', numId).update(payload);
    } catch (e) {}

    try {
      if (Product && typeof Product.findByPk === 'function') {
        const p = await Product.findByPk(numId);
        if (p) { Object.assign(p, updates); await p.save(); }
      }
    } catch (e) {}

    const seedIdx = seedProducts.findIndex(p => String(p.id) === String(id));
    if (seedIdx !== -1) {
      Object.assign(seedProducts[seedIdx], updates);
    }

    return await this.getProductById(id);
  },

  async deleteProduct(id) {
    const numId = parseInt(id, 10);
    try {
      await supabase.from('products').eq('id', numId).delete();
    } catch (e) {}
    try {
      if (Product && typeof Product.findByPk === 'function') {
        const p = await Product.findByPk(numId);
        if (p) await p.destroy();
      }
    } catch (e) {}
    const seedIdx = seedProducts.findIndex(p => String(p.id) === String(id));
    if (seedIdx !== -1) {
      seedProducts.splice(seedIdx, 1);
    }
    return true;
  }
};

module.exports = {
  userService,
  orderService,
  repairService,
  productService,
  formatUser,
  formatProduct,
  formatOrder,
  formatRepair,
};
