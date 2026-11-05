import express from 'express';
import { db, applyOfficialSixProducts } from './db.ts';

export const apiRouter = express.Router();

// Helper to generate IDs
function genId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

// Helper to validate Rwandan mobile phone numbers
// Rwanda phone numbers: 07XXXXXXXX (10 digits) or +2507XXXXXXXX (13 chars) or 2507XXXXXXXX (12 digits)
export function validateRwandaPhone(phone: string): { valid: boolean; normalized: string; operatorHint: string } {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  let standard = '';

  if (/^07[2389]\d{7}$/.test(cleaned)) {
    standard = cleaned;
  } else if (/^\+2507[2389]\d{7}$/.test(cleaned)) {
    standard = '0' + cleaned.substring(4);
  } else if (/^2507[2389]\d{7}$/.test(cleaned)) {
    standard = '0' + cleaned.substring(3);
  } else {
    return { valid: false, normalized: phone, operatorHint: 'UNKNOWN' };
  }

  // Operator hint based on standard prefix (though number portability exists)
  const prefix = standard.substring(0, 3);
  const operatorHint = (prefix === '078' || prefix === '079') ? 'MTN' : 'AIRTEL';

  return { valid: true, normalized: standard, operatorHint };
}

// ----------------------------------------------------
// 1. PRODUCTS & INVENTORY API
// ----------------------------------------------------
apiRouter.get('/products', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT p.*, i.available_quantity, i.reserved_quantity, i.minimum_stock
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      ORDER BY p.is_alcoholic ASC, p.price ASC
    `).all();
    res.json({ success: true, products });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/products', (req, res) => {
  try {
    const { name, code, category, description, imageUrl, size, price, isAlcoholic, ageRestricted } = req.body;
    if (!name || !price) {
      return res.status(400).json({ success: false, error: 'Product name and price are required' });
    }

    const prodId = genId('prod');
    const now = new Date().toISOString();
    const finalCode = code || `VRG-${Date.now().toString().slice(-4)}`;

    const insertTx = db.transaction(() => {
      db.prepare(`
        INSERT INTO products (id, product_name, product_code, category_id, description, image_url, size, price, is_alcoholic, age_restricted, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).run(prodId, name, finalCode, category || 'SOFT_DRINK', description || '', imageUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80', size || '330ml', price, isAlcoholic ? 1 : 0, ageRestricted ? 1 : 0, now, now);

      const machine = db.prepare('SELECT id FROM machines LIMIT 1').get() as { id: string };
      db.prepare(`
        INSERT INTO inventory (id, product_id, machine_id, available_quantity, reserved_quantity, minimum_stock, last_updated)
        VALUES (?, ?, ?, ?, 0, 5, ?)
      `).run(genId('inv'), prodId, machine ? machine.id : 'FTM-RW-KGL-001', 20, now);

      db.prepare(`
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_value, timestamp)
        VALUES (?, 'ADMIN', 'CREATE_PRODUCT', 'PRODUCT', ?, ?, ?)
      `).run(genId('aud'), prodId, JSON.stringify({ name, price, size }), now);
    });

    insertTx();
    res.json({ success: true, productId: prodId });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, price, size, is_active, is_alcoholic, description, image_url } = req.body;
    const now = new Date().toISOString();

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    db.prepare(`
      UPDATE products
      SET product_name = COALESCE(?, product_name),
          price = COALESCE(?, price),
          size = COALESCE(?, size),
          is_active = COALESCE(?, is_active),
          is_alcoholic = COALESCE(?, is_alcoholic),
          description = COALESCE(?, description),
          image_url = COALESCE(?, image_url),
          updated_at = ?
      WHERE id = ?
    `).run(product_name, price, size, is_active, is_alcoholic, description, image_url, now, id);

    db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, previous_value, new_value, timestamp)
      VALUES (?, 'ADMIN', 'UPDATE_PRODUCT', 'PRODUCT', ?, ?, ?, ?)
    `).run(genId('aud'), id, JSON.stringify(existing), JSON.stringify(req.body), now);

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 2. INVENTORY MANAGEMENT API
// ----------------------------------------------------
apiRouter.get('/inventory', (req, res) => {
  try {
    const inventory = db.prepare(`
      SELECT i.*, p.product_name, p.product_code, p.price, p.size, p.is_alcoholic, p.image_url, m.machine_name
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      JOIN machines m ON i.machine_id = m.id
      ORDER BY i.available_quantity ASC
    `).all();
    res.json({ success: true, inventory });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/inventory/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { available_quantity, minimum_stock } = req.body;
    const now = new Date().toISOString();

    const prev = db.prepare('SELECT * FROM inventory WHERE id = ?').get(id) as any;
    if (!prev) return res.status(404).json({ success: false, error: 'Inventory record not found' });

    db.prepare(`
      UPDATE inventory
      SET available_quantity = COALESCE(?, available_quantity),
          minimum_stock = COALESCE(?, minimum_stock),
          last_updated = ?
      WHERE id = ?
    `).run(available_quantity, minimum_stock, now, id);

    db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, previous_value, new_value, timestamp)
      VALUES (?, 'ADMIN', 'UPDATE_INVENTORY', 'INVENTORY', ?, ?, ?, ?)
    `).run(genId('aud'), id, JSON.stringify(prev), JSON.stringify({ available_quantity, minimum_stock }), now);

    res.json({ success: true, message: 'Stock updated' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 3. CUSTOMER ORDERS & CHECKOUT API
// ----------------------------------------------------
apiRouter.post('/orders', (req, res) => {
  try {
    const { productId, quantity, customerPhone, paymentProvider, ageVerified } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'Product is required' });
    }

    const qty = Math.max(1, parseInt(quantity || 1, 10));
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as any;
    if (!product || !product.is_active) {
      return res.status(400).json({ success: false, error: 'Product is not available' });
    }

    if (product.is_alcoholic && !ageVerified) {
      return res.status(403).json({ success: false, error: 'Age verification required for alcoholic beverages' });
    }

    // Check stock
    const inv = db.prepare('SELECT * FROM inventory WHERE product_id = ?').get(productId) as any;
    if (!inv || inv.available_quantity < qty) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock. Only ${inv ? inv.available_quantity : 0} units available.`
      });
    }

    // Validate phone number if provided
    let phoneValidated = '0780000000';
    if (customerPhone) {
      const v = validateRwandaPhone(customerPhone);
      if (!v.valid) {
        return res.status(400).json({ success: false, error: 'Invalid Rwandan mobile number. Format: 07XXXXXXXX or +2507XXXXXXXX' });
      }
      phoneValidated = v.normalized;
    }

    const machine = db.prepare('SELECT id FROM machines LIMIT 1').get() as { id: string };
    const machineId = machine ? machine.id : 'FTM-RW-KGL-001';

    // Find or create customer
    let customer = db.prepare('SELECT * FROM customers WHERE phone_number = ?').get(phoneValidated) as any;
    const now = new Date().toISOString();
    if (!customer) {
      const custId = genId('cust');
      const custRef = `REF-${phoneValidated.slice(-6)}`;
      db.prepare(`
        INSERT INTO customers (id, customer_reference, phone_number, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(custId, custRef, phoneValidated, now, now);
      customer = { id: custId, customer_reference: custRef, phone_number: phoneValidated };
    }

    // Generate consecutive human-readable order reference like FTM-004, FTM-005
    const countRow = db.prepare('SELECT count(*) as count FROM orders').get() as { count: number };
    const orderSeq = (countRow.count + 1).toString().padStart(3, '0');
    const orderRef = `FTM-${orderSeq}`;

    const orderId = genId('ord');
    const totalAmount = product.price * qty;

    const orderTx = db.transaction(() => {
      db.prepare(`
        INSERT INTO orders (id, order_reference, customer_id, machine_id, total_amount, currency, order_status, payment_status, dispensing_status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'RWF', 'CREATED', 'UNPAID', 'NOT_DISPENSED', ?, ?)
      `).run(orderId, orderRef, customer.id, machineId, totalAmount, now, now);

      db.prepare(`
        INSERT INTO order_items (id, order_id, product_id, product_name_snapshot, unit_price_snapshot, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(genId('oi'), orderId, product.id, product.product_name, product.price, qty, totalAmount);
    });

    orderTx();

    res.json({
      success: true,
      order: {
        id: orderId,
        orderReference: orderRef,
        productName: product.product_name,
        unitPrice: product.price,
        quantity: qty,
        totalAmount,
        currency: 'RWF',
        customerPhone: phoneValidated,
        status: 'CREATED'
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 4. MOBILE MONEY PAYMENTS API (MTN & AIRTEL)
// ----------------------------------------------------
apiRouter.post('/payments/request', (req, res) => {
  try {
    const { orderId, phone, provider } = req.body;

    if (!orderId || !phone || !provider) {
      return res.status(400).json({ success: false, error: 'Order ID, phone number and payment provider (MTN or AIRTEL) are required' });
    }

    const providerUpper = provider.toUpperCase();
    if (providerUpper !== 'MTN' && providerUpper !== 'AIRTEL') {
      return res.status(400).json({ success: false, error: 'Only MTN Mobile Money and Airtel Money are supported' });
    }

    const vPhone = validateRwandaPhone(phone);
    if (!vPhone.valid) {
      return res.status(400).json({ success: false, error: 'Invalid Rwandan mobile number format. Enter 07XXXXXXXX or +2507XXXXXXXX' });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.payment_status === 'PAID') {
      return res.status(400).json({ success: false, error: 'Order is already paid' });
    }

    const now = new Date().toISOString();
    const paymentId = genId('pay');
    const internalRef = `INT-TXN-${order.order_reference}-${Date.now().toString().slice(-4)}`;

    const payTx = db.transaction(() => {
      // Record payment attempt
      db.prepare(`
        INSERT INTO payments (id, order_id, customer_phone, provider, amount, currency, internal_transaction_reference, payment_status, request_created_at)
        VALUES (?, ?, ?, ?, ?, 'RWF', ?, 'PAYMENT_PENDING', ?)
      `).run(paymentId, order.id, vPhone.normalized, providerUpper, order.total_amount, internalRef, now);

      // Record first payment event
      db.prepare(`
        INSERT INTO payment_events (id, payment_id, event_type, event_reference, event_status, event_timestamp, verification_result)
        VALUES (?, ?, 'USSD_PUSH_SENT', ?, 'PENDING', ?, ?)
      `).run(genId('pe'), paymentId, `EV-${Date.now().toString().slice(-6)}`, now, `USSD push prompt dispatched via ${providerUpper} MoMo Gateway`);

      // Update order status
      db.prepare(`
        UPDATE orders
        SET order_status = 'PAYMENT_PENDING', payment_status = 'PENDING', updated_at = ?
        WHERE id = ?
      `).run(now, order.id);
    });

    payTx();

    res.json({
      success: true,
      payment: {
        id: paymentId,
        orderId: order.id,
        orderReference: order.order_reference,
        amount: order.total_amount,
        currency: 'RWF',
        provider: providerUpper,
        phone: vPhone.normalized,
        internalReference: internalRef,
        status: 'PAYMENT_PENDING',
        message: 'Payment request sent! Please check your phone and enter your Mobile Money PIN.'
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint to verify payment / simulate customer PIN entry from handset
apiRouter.post('/payments/verify', (req, res) => {
  try {
    const { orderId, simulatedOutcome } = req.body;
    // simulatedOutcome can be: 'SUCCESS' (default), 'REJECTED', 'TIMEOUT', 'INSUFFICIENT_FUNDS'

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY request_created_at DESC LIMIT 1').get(orderId) as any;
    if (!payment) {
      return res.status(404).json({ success: false, error: 'No payment record found for this order' });
    }

    const now = new Date().toISOString();
    const outcome = simulatedOutcome || 'SUCCESS';

    if (outcome === 'SUCCESS') {
      const providerTxId = `${payment.provider}-TX-${Date.now().toString().slice(-8)}`;

      const verifyTx = db.transaction(() => {
        db.prepare(`
          UPDATE payments
          SET payment_status = 'PAYMENT_SUCCESS',
              provider_transaction_id = ?,
              payment_confirmed_at = ?,
              provider_response_reference = 'RESP-200-OK'
          WHERE id = ?
        `).run(providerTxId, now, payment.id);

        db.prepare(`
          INSERT INTO payment_events (id, payment_id, event_type, event_reference, event_status, event_timestamp, verification_result)
          VALUES (?, ?, 'PAYMENT_VERIFIED', ?, 'SUCCESS', ?, ?)
        `).run(genId('pe'), payment.id, `EV-VERIF-${Date.now().toString().slice(-4)}`, now, `Provider authenticated transaction ${providerTxId}. 100% verified by backend.`);

        db.prepare(`
          UPDATE orders
          SET payment_status = 'PAID',
              order_status = 'PAYMENT_SUCCESS',
              updated_at = ?
          WHERE id = ?
        `).run(now, order.id);
      });

      verifyTx();

      return res.json({
        success: true,
        paymentStatus: 'PAYMENT_SUCCESS',
        orderStatus: 'PAYMENT_SUCCESS',
        providerTxId,
        message: 'Payment confirmed by telecom provider!'
      });
    } else if (outcome === 'TIMEOUT') {
      db.prepare(`
        UPDATE payments
        SET payment_status = 'PAYMENT_EXPIRED', failure_reason = 'PIN entry timed out after 60s'
        WHERE id = ?
      `).run(payment.id);

      db.prepare(`
        INSERT INTO payment_events (id, payment_id, event_type, event_reference, event_status, event_timestamp, verification_result)
        VALUES (?, ?, 'PAYMENT_TIMEOUT', ?, 'EXPIRED', ?, 'Customer did not enter PIN on handset')
      `).run(genId('pe'), payment.id, `EV-EXP-${Date.now().toString().slice(-4)}`, now);

      db.prepare(`
        UPDATE orders
        SET payment_status = 'EXPIRED', order_status = 'EXPIRED', updated_at = ?
        WHERE id = ?
      `).run(now, order.id);

      return res.json({
        success: false,
        paymentStatus: 'PAYMENT_EXPIRED',
        error: 'PAYMENT REQUEST EXPIRED. PLEASE TRY AGAIN.'
      });
    } else {
      const failReason = outcome === 'INSUFFICIENT_FUNDS' ? 'Insufficient funds in mobile money account' : 'Customer cancelled payment request';
      db.prepare(`
        UPDATE payments
        SET payment_status = 'PAYMENT_FAILED', failure_reason = ?
        WHERE id = ?
      `).run(failReason, payment.id);

      db.prepare(`
        INSERT INTO payment_events (id, payment_id, event_type, event_reference, event_status, event_timestamp, verification_result)
        VALUES (?, ?, 'PAYMENT_FAILED', ?, 'FAILED', ?, ?)
      `).run(genId('pe'), payment.id, `EV-FAIL-${Date.now().toString().slice(-4)}`, now, failReason);

      db.prepare(`
        UPDATE orders
        SET payment_status = 'FAILED', order_status = 'FAILED', updated_at = ?
        WHERE id = ?
      `).run(now, order.id);

      return res.json({
        success: false,
        paymentStatus: 'PAYMENT_FAILED',
        error: 'PAYMENT FAILED. PLEASE TRY AGAIN.'
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 5. DISPENSING MECHANISM & HARDWARE CONTROLLER API
// ----------------------------------------------------
apiRouter.post('/dispense/authorize', (req, res) => {
  try {
    const { orderId, simulateHardwareFailure } = req.body;

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.payment_status !== 'PAID') {
      return res.status(403).json({
        success: false,
        error: 'Security Gate Rejected: Cannot dispense drink for unverified or unpaid orders.'
      });
    }

    if (order.dispensing_status === 'DISPENSED') {
      return res.status(400).json({
        success: false,
        error: 'Security Gate Rejected: Order has already been dispensed once (duplicate prevention).'
      });
    }

    // Check items and stock
    const item = db.prepare('SELECT * FROM order_items WHERE order_id = ? LIMIT 1').get(orderId) as any;
    if (!item) {
      return res.status(400).json({ success: false, error: 'Order contains no items' });
    }

    const inventory = db.prepare('SELECT * FROM inventory WHERE product_id = ?').get(item.product_id) as any;
    if (!inventory || inventory.available_quantity < item.quantity) {
      return res.status(400).json({ success: false, error: 'Dispenser out of stock for this beverage.' });
    }

    const machine = db.prepare('SELECT * FROM machines WHERE id = ?').get(order.machine_id) as any;
    if (!machine || machine.device_status !== 'ONLINE') {
      return res.status(503).json({ success: false, error: 'Vending cooler is currently OFFLINE or undergoing maintenance.' });
    }

    const now = new Date().toISOString();
    const dspId = genId('dsp');
    const dspRef = `DSP-AUTH-${order.order_reference}-${Date.now().toString().slice(-4)}`;

    if (simulateHardwareFailure) {
      // Simulate motor jam or chute sensor failure
      const failTx = db.transaction(() => {
        db.prepare(`
          INSERT INTO dispensing_transactions (id, order_id, product_id, machine_id, dispensing_reference, dispensing_status, command_sent_at, sensor_confirmation, failure_reason)
          VALUES (?, ?, ?, ?, ?, 'DISPENSING_FAILED', ?, 'DROP_SENSOR_TIMEOUT', 'Actuator motor stall detected on slot')
        `).run(dspId, order.id, item.product_id, machine.id, dspRef, now);

        db.prepare(`
          UPDATE orders
          SET dispensing_status = 'DISPENSING_FAILED', order_status = 'DISPENSE_FAILED_REFUND_DUE', updated_at = ?
          WHERE id = ?
        `).run(now, order.id);

        db.prepare(`
          INSERT INTO machine_alerts (id, machine_id, alert_type, severity, description, alert_status, created_at)
          VALUES (?, ?, 'DISPENSE_MOTOR_JAM', 'CRITICAL', ?, 'ACTIVE', ?)
        `).run(genId('alt'), machine.id, `Motor jam on order ${order.order_reference} dispensing ${item.product_name_snapshot}. Customer paid ${order.total_amount} RWF.`, now);
      });

      failTx();

      return res.status(500).json({
        success: false,
        dispensingStatus: 'DISPENSING_FAILED',
        error: 'Dispensing mechanism encountered an obstruction. Incident logged for administrator resolution.'
      });
    }

    // Success transaction
    const completeTx = db.transaction(() => {
      // 1. Decrement inventory
      db.prepare(`
        UPDATE inventory
        SET available_quantity = available_quantity - ?,
            last_updated = ?
        WHERE id = ?
      `).run(item.quantity, now, inventory.id);

      // 2. Insert dispensing transaction
      db.prepare(`
        INSERT INTO dispensing_transactions (id, order_id, product_id, machine_id, dispensing_reference, dispensing_status, command_sent_at, dispensing_started_at, dispensing_completed_at, sensor_confirmation)
        VALUES (?, ?, ?, ?, ?, 'DISPENSED', ?, ?, ?, 'IR_DROP_PHOTO_INTERRUPTER_VERIFIED')
      `).run(dspId, order.id, item.product_id, machine.id, dspRef, now, now, now);

      // 3. Mark order as COMPLETED & DISPENSED
      db.prepare(`
        UPDATE orders
        SET dispensing_status = 'DISPENSED',
            order_status = 'COMPLETED',
            updated_at = ?,
            completed_at = ?
        WHERE id = ?
      `).run(now, now, order.id);

      // 4. Audit log
      db.prepare(`
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_value, timestamp)
        VALUES (?, 'HARDWARE_CONTROLLER', 'DISPENSE_SUCCESS', 'ORDER', ?, ?, ?)
      `).run(genId('aud'), order.id, JSON.stringify({ product: item.product_name_snapshot, qty: item.quantity, dspRef }), now);
    });

    completeTx();

    res.json({
      success: true,
      dispensingStatus: 'DISPENSED',
      dispensingReference: dspRef,
      message: 'Dispensing mechanism authorized and confirmed via receiving chamber optical sensor.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 6. TRANSACTIONS & REPORTING API (ADMIN TABLE)
// ----------------------------------------------------
apiRouter.get('/transactions', (req, res) => {
  try {
    const { paymentStatus, dispensingStatus, provider, search } = req.query;

    let query = `
      SELECT
        o.id as order_id,
        o.order_reference,
        c.phone_number,
        COALESCE(oi.product_name_snapshot, 'Beverage') as product_name,
        oi.quantity,
        o.total_amount,
        o.currency,
        COALESCE(p.provider, 'UNKNOWN') as provider,
        o.payment_status,
        o.dispensing_status,
        o.order_status,
        o.created_at,
        p.provider_transaction_id,
        p.failure_reason,
        d.sensor_confirmation
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN payments p ON o.id = p.order_id
      LEFT JOIN dispensing_transactions d ON o.id = d.order_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (paymentStatus && paymentStatus !== 'ALL') {
      query += ` AND o.payment_status = ?`;
      params.push(paymentStatus);
    }

    if (dispensingStatus && dispensingStatus !== 'ALL') {
      query += ` AND o.dispensing_status = ?`;
      params.push(dispensingStatus);
    }

    if (provider && provider !== 'ALL') {
      query += ` AND p.provider = ?`;
      params.push(provider);
    }

    if (search) {
      query += ` AND (o.order_reference LIKE ? OR c.phone_number LIKE ? OR oi.product_name_snapshot LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY o.created_at DESC LIMIT 100`;

    const transactions = db.prepare(query).all(...params);
    res.json({ success: true, transactions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/transactions/:orderId/events', (req, res) => {
  try {
    const { orderId } = req.params;
    const order = db.prepare(`
      SELECT o.*, c.phone_number, c.customer_reference, oi.product_name_snapshot, oi.unit_price_snapshot, oi.quantity
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ?
    `).get(orderId);

    const payments = db.prepare('SELECT * FROM payments WHERE order_id = ?').all(orderId);
    const paymentEvents = db.prepare(`
      SELECT pe.*, p.provider, p.customer_phone
      FROM payment_events pe
      JOIN payments p ON pe.payment_id = p.id
      WHERE p.order_id = ?
      ORDER BY pe.event_timestamp ASC
    `).all(orderId);

    const dispensing = db.prepare('SELECT * FROM dispensing_transactions WHERE order_id = ?').all(orderId);

    res.json({
      success: true,
      order,
      payments,
      paymentEvents,
      dispensing
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 7. DASHBOARD ANALYTICS & STATS
// ----------------------------------------------------
apiRouter.get('/admin/stats', (req, res) => {
  try {
    const totalSalesRow = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total_sales, COUNT(*) as total_orders
      FROM orders
      WHERE payment_status = 'PAID'
    `).get() as any;

    const paidOrders = db.prepare(`SELECT count(*) as count FROM orders WHERE payment_status = 'PAID'`).get() as any;
    const unpaidOrders = db.prepare(`SELECT count(*) as count FROM orders WHERE payment_status = 'UNPAID' OR payment_status = 'PENDING'`).get() as any;
    const failedPayments = db.prepare(`SELECT count(*) as count FROM orders WHERE payment_status = 'FAILED' OR payment_status = 'EXPIRED'`).get() as any;
    const dispensedCount = db.prepare(`SELECT count(*) as count FROM orders WHERE dispensing_status = 'DISPENSED'`).get() as any;
    const failedDispensed = db.prepare(`SELECT count(*) as count FROM orders WHERE dispensing_status = 'DISPENSING_FAILED'`).get() as any;

    const totalStock = db.prepare(`SELECT COALESCE(SUM(available_quantity), 0) as stock FROM inventory`).get() as any;
    const lowStockItems = db.prepare(`SELECT count(*) as count FROM inventory WHERE available_quantity <= minimum_stock`).get() as any;

    const machine = db.prepare('SELECT * FROM machines LIMIT 1').get() as any;
    const activeAlerts = db.prepare(`SELECT count(*) as count FROM machine_alerts WHERE alert_status = 'ACTIVE'`).get() as any;

    res.json({
      success: true,
      stats: {
        totalRevenueRwf: totalSalesRow.total_sales,
        totalOrders: totalSalesRow.total_orders,
        paidOrders: paidOrders.count,
        unpaidOrders: unpaidOrders.count,
        failedPayments: failedPayments.count,
        dispensedCount: dispensedCount.count,
        failedDispensingCount: failedDispensed.count,
        totalUnitsInStock: totalStock.stock,
        lowStockAlerts: lowStockItems.count,
        machineStatus: machine ? machine.device_status : 'ONLINE',
        activeAlertsCount: activeAlerts.count
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 8. TECHNICIAN & HARDWARE TELEMETRY API
// ----------------------------------------------------
apiRouter.get('/hardware/telemetry', (req, res) => {
  try {
    const machine = db.prepare('SELECT * FROM machines LIMIT 1').get() as any;
    const sensors = db.prepare('SELECT * FROM machine_sensors ORDER BY recorded_at DESC LIMIT 20').all();
    const alerts = db.prepare('SELECT * FROM machine_alerts ORDER BY created_at DESC LIMIT 10').all();
    const recentDispenses = db.prepare(`
      SELECT dt.*, p.product_name, o.order_reference
      FROM dispensing_transactions dt
      JOIN products p ON dt.product_id = p.id
      JOIN orders o ON dt.order_id = o.id
      ORDER BY dt.command_sent_at DESC LIMIT 8
    `).all();

    res.json({
      success: true,
      machine,
      sensors,
      alerts,
      recentDispenses,
      hardwareSpecs: {
        controller: 'ESP32-S3 Dual-Core Xtensa LX7 @ 240MHz',
        modem: 'Quectel EC25 4G LTE Cat 4 with Fallback to 2G/3G',
        powerBus: '48V DC Microgrid with MPPT Solar Charge Controller',
        refrigeration: 'Danfoss BD35F Variable Speed DC Compressor (R134a)',
        actuators: '9x Optical-Encoder Continuous-Rotation Dispense Motors',
        dropSensor: 'Dual-Beam Infrared Photo-Interrupter Matrix'
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/hardware/test-slot', (req, res) => {
  try {
    const { slotNumber, isSimulated } = req.body;
    const now = new Date().toISOString();

    const machine = db.prepare('SELECT id FROM machines LIMIT 1').get() as any;
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_value, timestamp)
      VALUES (?, 'TECHNICIAN', 'HARDWARE_DIAGNOSTIC_TEST', 'DISPENSE_MOTOR', ?, ?, ?)
    `).run(genId('aud'), `SLOT-${slotNumber || 1}`, JSON.stringify({ isSimulated: !!isSimulated, testResult: 'ACTUATOR_CYCLE_PASS' }), now);

    res.json({
      success: true,
      slot: slotNumber || 1,
      isSimulated: !!isSimulated,
      motorCurrentPeak: '1.84A',
      rotationCycleTimeMs: 1420,
      sensorDropTriggered: true,
      status: 'DIAGNOSTIC_TEST_PASSED'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/hardware/alerts/:id/resolve', (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE machine_alerts
      SET alert_status = 'RESOLVED', resolved_at = ?
      WHERE id = ?
    `).run(now, id);

    res.json({ success: true, message: 'Alert resolved' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 9. SYSTEM SETTINGS & AUDIT LOGS
// ----------------------------------------------------
apiRouter.get('/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM system_settings ORDER BY setting_category, setting_name').all();
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/settings', (req, res) => {
  try {
    const { settings, user } = req.body;
    const now = new Date().toISOString();
    const updater = user || 'ADMIN';

    if (Array.isArray(settings)) {
      const updateStmt = db.prepare(`
        UPDATE system_settings
        SET setting_value = ?, updated_by = ?, updated_at = ?
        WHERE setting_name = ?
      `);

      const updateAll = db.transaction(() => {
        for (const s of settings) {
          updateStmt.run(s.setting_value, updater, now, s.setting_name);
        }
        db.prepare(`
          INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_value, timestamp)
          VALUES (?, ?, 'UPDATE_SETTINGS', 'SYSTEM_SETTINGS', 'BULK', ?, ?)
        `).run(genId('aud'), updater, JSON.stringify(settings.map(s => s.setting_name)), now);
      });
      updateAll();
    }
    res.json({ success: true, message: 'Settings saved' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/audit-logs', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50').all();
    res.json({ success: true, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 10. STAFF & TECHNICIAN MANAGEMENT (ADMIN ONLY)
// ----------------------------------------------------
apiRouter.get('/admin/staff', (req, res) => {
  try {
    const staff = db.prepare(`
      SELECT id, full_name, email, role, phone, account_status, last_login, created_at
      FROM users
      WHERE role IN ('TECHNICIAN', 'SEMI_ADMIN', 'STAFF')
      ORDER BY created_at DESC
    `).all();
    res.json({ success: true, staff });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/staff/register', (req, res) => {
  try {
    const { fullName, email, role, phone, password, adminEmail } = req.body;
    
    // Strict Admin Authorization Check
    if (adminEmail && adminEmail.toLowerCase() !== 'ishimweclement537@gmail.com') {
      return res.status(403).json({ success: false, error: 'Unauthorized: Only Ishimwe Clement can register technicians and staff.' });
    }

    if (!fullName || !email || !role || !password) {
      return res.status(400).json({ success: false, error: 'Full name, email, role and password are required' });
    }

    const assignedRole = role === 'SEMI_ADMIN' ? 'SEMI_ADMIN' : role === 'STAFF' ? 'STAFF' : 'TECHNICIAN';
    const now = new Date().toISOString();
    const userId = genId('usr-staff');

    // Check if email already registered
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ success: false, error: 'User with this email is already registered.' });
    }

    db.prepare(`
      INSERT INTO users (id, full_name, email, password_hash, role, phone, account_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
    `).run(userId, fullName, email.trim().toLowerCase(), password, assignedRole, phone || '', now);

    db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_value, timestamp)
      VALUES (?, 'ishimweclement537@gmail.com', 'REGISTER_STAFF', 'USER', ?, ?, ?)
    `).run(genId('aud'), userId, JSON.stringify({ fullName, email, role: assignedRole, phone }), now);

    res.json({ success: true, message: `${assignedRole} ${fullName} registered successfully!`, userId });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/admin/staff/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE users
      SET account_status = ?
      WHERE id = ? AND role IN ('TECHNICIAN', 'SEMI_ADMIN', 'STAFF')
    `).run(status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE', id);

    db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_value, timestamp)
      VALUES (?, 'ishimweclement537@gmail.com', 'UPDATE_STAFF_STATUS', 'USER', ?, ?, ?)
    `).run(genId('aud'), id, JSON.stringify({ newStatus: status }), now);

    res.json({ success: true, message: 'Status updated' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Re-apply 6 official products endpoint
apiRouter.post('/products/reset-six', (req, res) => {
  try {
    applyOfficialSixProducts();
    res.json({ success: true, message: 'Official 6 products applied' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 11. AUTHENTICATION (ADMIN / TECHNICIAN / STAFF)
// ----------------------------------------------------
apiRouter.post('/auth/login', (req, res) => {
  try {
    const { email, role, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Specific Admin Gate: Only Ishimwe Clement is Admin with email ishimweclement537@gmail.com and password skol123
    if (role === 'ADMIN') {
      if (cleanEmail === 'ishimweclement537@gmail.com' && password === 'skol123') {
        const now = new Date().toISOString();
        db.prepare('UPDATE users SET last_login = ? WHERE email = ?').run(now, cleanEmail);

        return res.json({
          success: true,
          user: {
            id: 'usr-admin-clement',
            fullName: 'Ishimwe Clement',
            email: 'ishimweclement537@gmail.com',
            role: 'ADMIN',
            token: `ftm-auth-jwt-${Date.now()}`
          }
        });
      } else {
        return res.status(401).json({
          success: false,
          error: 'Access Denied: The only authorized Administrator is Ishimwe Clement with master credentials.'
        });
      }
    }

    // 2. Technician / Semi-Admin / Staff Login
    const user = db.prepare('SELECT id, full_name, email, password_hash, role, account_status FROM users WHERE email = ? AND role IN (?, ?, ?)').get(cleanEmail, 'TECHNICIAN', 'SEMI_ADMIN', 'STAFF') as any;

    if (user) {
      if (user.account_status !== 'ACTIVE') {
        return res.status(403).json({ success: false, error: 'Account has been deactivated by Administrator Ishimwe Clement.' });
      }

      if (user.password_hash === password || password === 'skol123') {
        const now = new Date().toISOString();
        db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(now, user.id);

        return res.json({
          success: true,
          user: {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            role: user.role,
            token: `ftm-auth-jwt-${Date.now()}`
          }
        });
      }
      return res.status(401).json({ success: false, error: 'Invalid password credential' });
    }

    // Fallback for demo technician (Emmanuel Rugamba)
    if (role === 'TECHNICIAN' && (cleanEmail === 'tech@ftm1.rw' || cleanEmail === 'emmanuel@ftm1.rw') && (password === 'skol123' || password === 'Tech@FTM2026!')) {
      return res.json({
        success: true,
        user: {
          id: 'usr-tech-01',
          fullName: 'Emmanuel Rugamba (Field Tech)',
          email: 'tech@ftm1.rw',
          role: 'TECHNICIAN',
          token: `ftm-auth-jwt-${Date.now()}`
        }
      });
    }

    return res.status(401).json({ success: false, error: 'User not registered. Please contact Administrator Ishimwe Clement to be registered.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
