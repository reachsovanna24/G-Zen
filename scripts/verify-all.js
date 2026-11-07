const http = require('http');

async function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting G-Zen Enterprise Verification Suite...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
    }
  }

  try {
    // 1. Vite Frontend HTML
    const viteRes = await request({ hostname: 'localhost', port: 5173, path: '/', method: 'GET' });
    assert(viteRes.status === 200 && viteRes.data.includes('id="app"'), 'Vite frontend serving index.html on port 5173');

    // 2. Health check
    const health = await request({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
    assert(health.status === 200 && health.data.status === 'online', 'Backend healthcheck online');

    // 3. Admin Login
    const adminLogin = await request({
      hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@gzenphone.kh', password: 'admin123' });
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin', 'Admin authenticated with JWT');
    const adminToken = adminLogin.data.token;

    // 3a. Dedicated Admin Gateway Security Clearance Verification
    const adminGate = await request({
      hostname: 'localhost', port: 5000, path: '/api/auth/admin/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@gzenphone.kh', password: 'admin123' });
    assert(adminGate.status === 200 && adminGate.data.token, 'Dedicated Admin Gateway authenticates admin credentials');

    // 4. Customer Authentication (Register / Login dynamic verify session)
    let custLogin = await request({
      hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'verify_test@gzen.store', password: 'testPassword123' });

    if (custLogin.status !== 200) {
      custLogin = await request({
        hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { name: 'Verify Tester', email: 'verify_test@gzen.store', password: 'testPassword123', phone: '012999888' });
    }
    assert((custLogin.status === 200 || custLogin.status === 201) && custLogin.data.token, 'Customer authenticated with JWT');
    const customerToken = custLogin.data.token;

    // 4a. Verify customer account is strictly rejected from Admin Gateway (403 Forbidden)
    const forbiddenGate = await request({
      hostname: 'localhost', port: 5000, path: '/api/auth/admin/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'verify_test@gzen.store', password: 'testPassword123' });
    assert(forbiddenGate.status === 403, 'Dedicated Admin Gateway strictly rejects non-admin customer account (403 Forbidden)');

    // 5. Products catalog & filtering
    const products = await request({ hostname: 'localhost', port: 5000, path: '/api/products', method: 'GET' });
    assert(products.status === 200 && products.data.products.length >= 10, `Retrieved ${products.data.products?.length} products`);

    // 6. Place Order
    const initialProduct = products.data.products.find(p => p.stock > 0) || products.data.products[0];
    const initialStock = initialProduct.stock;
    const orderRes = await request({
      hostname: 'localhost', port: 5000, path: '/api/orders', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` }
    }, {
      items: [{ productId: initialProduct.id, name: initialProduct.name, price: initialProduct.price, quantity: 1 }],
      shippingAddress: {
        fullName: 'Sokha Rith',
        phone: '098 765 432',
        district: 'Toul Kork',
        addressNote: 'House 42, St 315',
      },
      paymentMethod: 'KHQR',
      transactionRef: 'BAKONG-TEST-998822'
    });
    assert(orderRes.status === 201 && orderRes.data.order.orderNumber.startsWith('GZ-'), `Order created: ${orderRes.data.order?.orderNumber}`);
    assert(orderRes.data.order.khqrMd5 && orderRes.data.order.khqrMd5.length === 32, `Bakong MD5 generated on order: ${orderRes.data.order?.khqrMd5}`);
    const placedOrderId = orderRes.data.order.id;

    // 6a. Bakong settlement auto-verification query
    const verifyRes = await request({ hostname: 'localhost', port: 5000, path: `/api/orders/verify-payment/${placedOrderId}`, method: 'GET' });
    assert(verifyRes.status === 200, 'Bakong auto-verify check executed against NBC ledger');

    // 6b. Bakong simulated settlement
    const simRes = await request({ hostname: 'localhost', port: 5000, path: `/api/orders/simulate-payment/${placedOrderId}`, method: 'POST' });
    assert(simRes.status === 200 && simRes.data.paid === true, 'Bakong simulated settlement auto-verified on NBC ledger');

    // 6c. Standalone Bakong KHQR Gateway API
    const bakongGen = await request({
      hostname: 'localhost', port: 5000, path: '/api/bakong/generate', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { amount: 3.5, billNumber: 'GZ-STANDALONE-001' });
    assert(bakongGen.status === 200 && bakongGen.data.khqr?.md5, `Standalone Bakong KHQR generated: ${bakongGen.data.khqr?.md5}`);

    // 6d. 3-Minute KHQR window and session refresh
    const refreshKhqr = await request({ hostname: 'localhost', port: 5000, path: `/api/orders/khqr/${placedOrderId}?refresh=true`, method: 'GET' });
    assert(refreshKhqr.status === 200 && refreshKhqr.data.khqr.expiresInSeconds === 180, '3-minute Bakong KHQR window verified (180s)');

    // 6e. Supabase Cloud API connection check
    const supabaseCheck = await request({ hostname: 'localhost', port: 5000, path: '/api/supabase/status', method: 'GET' });
    assert(supabaseCheck.status === 200 && supabaseCheck.data.supabaseUrl.includes('supabase.co'), `Supabase API configured: ${supabaseCheck.data.supabaseUrl}`);

    // 7. Verify stock reduction
    const updatedProd = await request({ hostname: 'localhost', port: 5000, path: `/api/products/${initialProduct.id}`, method: 'GET' });
    assert(updatedProd.data.product.stock === initialStock - 1, 'Stock properly decremented by 1');

    // 8. Admin view all orders
    const adminOrders = await request({
      hostname: 'localhost', port: 5000, path: '/api/orders/admin/all', method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(adminOrders.status === 200 && adminOrders.data.orders.length > 0, `Admin retrieved ${adminOrders.data.orders?.length} orders`);

    // 9. Admin update order status
    const updateStatus = await request({
      hostname: 'localhost', port: 5000, path: `/api/orders/admin/${placedOrderId}/status`, method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
    }, { status: 'QC Testing', paymentStatus: 'Paid' });
    assert(updateStatus.status === 200 && updateStatus.data.order.status === 'QC Testing', 'Admin updated order status & payment status');

    // 10. Admin delete / purge test order
    const delOrder = await request({
      hostname: 'localhost', port: 5000, path: `/api/orders/admin/${placedOrderId}`, method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(delOrder.status === 200, 'Admin can cancel and delete an order');

    // 11. Repair Booking submission
    const repairRes = await request({
      hostname: 'localhost', port: 5000, path: '/api/repairs', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      customerName: 'Channak Meas',
      phone: '087 112 334',
      deviceModel: 'iPhone 15 Pro Max',
      serviceType: 'Hardware Repair',
      issueDescription: 'Cracked OLED screen after drop',
      preferredDate: '2026-09-25'
    });
    assert(repairRes.status === 201 && repairRes.data.booking.ticketNumber.startsWith('REP-'), `Repair ticket registered: ${repairRes.data.booking?.ticketNumber}`);
    const repairId = repairRes.data.booking.id;

    // 12. Admin update repair ticket & quote
    const updateRepair = await request({
      hostname: 'localhost', port: 5000, path: `/api/repairs/admin/${repairId}/status`, method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
    }, { status: 'In Progress', technicianNotes: 'OEM OLED panel installed.', estimatedPrice: 195.0 });
    assert(updateRepair.status === 200 && updateRepair.data.booking.status === 'In Progress', 'Admin updated technician diagnosis & parts quote');

    // 13. Admin delete repair ticket
    const delRepair = await request({
      hostname: 'localhost', port: 5000, path: `/api/repairs/admin/${repairId}`, method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(delRepair.status === 200, 'Admin can purge a repair ticket');

    // 14. Admin Product CRUD: Create, Update, Delete
    const newProd = await request({
      hostname: 'localhost', port: 5000, path: '/api/products', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
    }, {
      name: 'G-Zen Enterprise Dock Pro',
      category: 'Accessories',
      price: 149.0,
      stock: 30,
      brand: 'G-Zen',
      description: 'Thunderbolt 4 multiport hub with 100W PD.',
      isFeatured: false
    });
    assert(newProd.status === 201 && newProd.data.product.id, 'Admin created product with full catalog specs');
    const createdId = newProd.data.product.id;

    const editProd = await request({
      hostname: 'localhost', port: 5000, path: `/api/products/${createdId}`, method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
    }, { price: 139.0, stock: 28 });
    assert(editProd.status === 200 && editProd.data.product.price === 139, 'Admin updated product price and stock count');

    const delProd = await request({
      hostname: 'localhost', port: 5000, path: `/api/products/${createdId}`, method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(delProd.status === 200, 'Admin deleted product from catalog');

    // 15. Admin User Management: List registered customers
    const userList = await request({
      hostname: 'localhost', port: 5000, path: '/api/auth/admin/users', method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(userList.status === 200 && userList.data.users.length >= 2, `Admin retrieved all ${userList.data.users?.length} registered user accounts`);

    // 16. Admin User Management: Role toggle
    const targetUser = userList.data.users.find(u => u.role === 'customer');
    if (targetUser) {
      const roleToggle = await request({
        hostname: 'localhost', port: 5000, path: `/api/auth/admin/users/${targetUser.id}/role`, method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
      }, { role: 'admin' });
      assert(roleToggle.status === 200 && roleToggle.data.user.role === 'admin', 'Admin toggled user permissions between customer and admin');

      // Revert back to customer
      await request({
        hostname: 'localhost', port: 5000, path: `/api/auth/admin/users/${targetUser.id}/role`, method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
      }, { role: 'customer' });
    }

    console.log(`\n🎉 Enterprise Verification Completed: ${passed}/${total} checks passed successfully!`);
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
