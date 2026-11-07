require('dotenv').config();

const SUPABASE_URL = (
  process.env.SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://mlifkhiluwdlutmmzrcr.supabase.co'
).replace(/\/+$/, '');

const SUPABASE_KEY = (
  process.env.SUPABASE_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  'sb_publishable_YDoHWDT1phpL9lOKtB0xGg_mb11qMBF'
);

/**
 * Common Headers for Supabase PostgREST API
 */
const getHeaders = (customHeaders = {}) => ({
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  ...customHeaders,
});

/**
 * Lightweight, zero-dependency Supabase Query Builder
 * Compatible with Node.js built-in fetch
 */
class SupabaseQueryBuilder {
  constructor(table) {
    this.table = table;
    this.url = `${SUPABASE_URL}/rest/v1/${table}`;
    this.queryParams = [];
    this.method = 'GET';
    this.body = null;
    this.headers = getHeaders();
  }

  select(columns = '*') {
    this.queryParams.push(`select=${encodeURIComponent(columns)}`);
    return this;
  }

  eq(column, value) {
    this.queryParams.push(`${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}`);
    return this;
  }

  neq(column, value) {
    this.queryParams.push(`${encodeURIComponent(column)}=neq.${encodeURIComponent(value)}`);
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.queryParams.push(`order=${encodeURIComponent(column)}.${ascending ? 'asc' : 'desc'}`);
    return this;
  }

  limit(count) {
    this.queryParams.push(`limit=${parseInt(count, 10)}`);
    return this;
  }

  single() {
    this.headers['Accept'] = 'application/vnd.pgrst.object+json';
    return this;
  }

  insert(values) {
    this.method = 'POST';
    this.body = JSON.stringify(values);
    this.headers['Prefer'] = 'return=representation';
    return this;
  }

  upsert(values) {
    this.method = 'POST';
    this.body = JSON.stringify(values);
    this.headers['Prefer'] = 'resolution=merge-duplicates,return=representation';
    return this;
  }

  update(values) {
    this.method = 'PATCH';
    this.body = JSON.stringify(values);
    this.headers['Prefer'] = 'return=representation';
    return this;
  }

  delete() {
    this.method = 'DELETE';
    this.headers['Prefer'] = 'return=representation';
    return this;
  }

  async execute() {
    const fullUrl = this.queryParams.length 
      ? `${this.url}?${this.queryParams.join('&')}` 
      : this.url;

    try {
      const response = await fetch(fullUrl, {
        method: this.method,
        headers: this.headers,
        body: this.body,
        signal: AbortSignal.timeout(8000),
      });

      const contentType = response.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        return {
          data: null,
          error: data || { message: `Supabase returned HTTP ${response.status}` },
          status: response.status,
        };
      }

      return { data, error: null, status: response.status };
    } catch (err) {
      return {
        data: null,
        error: { message: err.message },
        status: 500,
      };
    }
  }

  // Promise-thenable to allow "await supabase.from(...).select()" directly
  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

/**
 * Supabase Client Instance
 */
const supabase = {
  url: SUPABASE_URL,
  key: SUPABASE_KEY,

  from(table) {
    return new SupabaseQueryBuilder(table);
  },

  async rpc(functionName, params = {}) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(8000),
      });
      const data = await response.json();
      return { data, error: !response.ok ? data : null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  },

  /**
   * Health & Connection Check
   */
  async checkConnection() {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'GET',
        headers: getHeaders(),
        signal: AbortSignal.timeout(5000),
      });
      return {
        connected: response.status < 500,
        status: response.status,
        url: SUPABASE_URL,
        authHeaderPresent: Boolean(SUPABASE_KEY),
      };
    } catch (err) {
      return {
        connected: false,
        error: err.message,
        url: SUPABASE_URL,
        authHeaderPresent: Boolean(SUPABASE_KEY),
      };
    }
  },

  /**
   * Sync Order & Bakong Settlement to Supabase
   */
  async syncOrder(order) {
    try {
      const payload = {
        order_number: order.orderNumber,
        subtotal: order.subtotal || 0,
        delivery_fee: order.deliveryFee || 0,
        total_amount: order.totalAmount || 0,
        payment_method: order.paymentMethod || 'KHQR',
        payment_status: order.paymentStatus || 'Pending',
        status: order.status || 'Pending',
        transaction_ref: order.transactionRef || null,
        khqr_md5: order.khqrMd5 || null,
        khqr_string: order.khqrString || null,
        khqr_image: order.khqrImage || null,
        khqr_deeplink: order.khqrDeeplink || null,
        shipping_address: order.shippingAddress || {},
        items: order.items || [],
        notes: order.notes || '',
        guest_info: order.guestInfo || null,
        settlement_data: order.settlementData || null,
      };

      // Check if order already exists
      const { data: existing } = await this.from('orders').eq('order_number', order.orderNumber).select('id');
      if (existing && existing.length > 0) {
        return await this.from('orders').eq('order_number', order.orderNumber).update(payload);
      }
      return await this.from('orders').insert(payload);
    } catch (err) {
      console.error('[Supabase] syncOrder error:', err.message);
      return { error: err };
    }
  },

  /**
   * Sync Repair Booking to Supabase
   */
  async syncRepair(repair) {
    try {
      const payload = {
        ticket_number: repair.ticketNumber,
        customer_name: repair.customerName,
        phone: repair.phone,
        device_model: repair.deviceModel,
        service_type: repair.serviceType,
        issue_description: repair.issueDescription,
        preferred_date: repair.preferredDate || null,
        status: repair.status || 'Received',
        estimated_price: repair.estimatedPrice || 0,
        technician_notes: repair.technicianNotes || null,
      };

      const { data: existing } = await this.from('repair_bookings').eq('ticket_number', repair.ticketNumber).select('id');
      if (existing && existing.length > 0) {
        return await this.from('repair_bookings').eq('ticket_number', repair.ticketNumber).update(payload);
      }
      return await this.from('repair_bookings').insert(payload);
    } catch (err) {
      console.error('[Supabase] syncRepair error:', err.message);
      return { error: err };
    }
  },

  /**
   * Sync Registered User to Supabase
   */
  async syncUser(user) {
    try {
      const payload = {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role || 'customer',
        phone: user.phone || null,
        address: user.address || null,
      };

      const { data: existing } = await this.from('users').eq('email', user.email).select('id');
      if (existing && existing.length > 0) {
        return await this.from('users').eq('email', user.email).update(payload);
      }
      return await this.from('users').insert(payload);
    } catch (err) {
      console.error('[Supabase] syncUser error:', err.message);
      return { error: err };
    }
  },

  /**
   * Sync Catalog Product to Supabase
   */
  async syncProduct(product) {
    try {
      const payload = {
        name: product.name,
        category: product.category,
        price: product.price,
        original_price: product.originalPrice || 0,
        stock: product.stock || 0,
        image: product.image,
        images: product.images || [],
        brand: product.brand || 'Tech',
        description: product.description || '',
        specs: product.specs || {},
        is_featured: Boolean(product.isFeatured),
        rating: product.rating || 4.8,
        warranty: product.warranty || '1 Year Official Warranty (Cambodia)',
      };

      const { data: existing } = await this.from('products').eq('name', product.name).select('id');
      if (existing && existing.length > 0) {
        return await this.from('products').eq('name', product.name).update(payload);
      }
      return await this.from('products').insert(payload);
    } catch (err) {
      console.error('[Supabase] syncProduct error:', err.message);
      return { error: err };
    }
  }
};

module.exports = {
  supabase,
  SUPABASE_URL,
  SUPABASE_KEY,
};
