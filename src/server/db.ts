import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dbDir = path.resolve('data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'ftm_database.sqlite');
export const db = new Database(dbPath);

// Enable foreign keys and WAL mode for high concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    -- TABLE 1: CUSTOMERS
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      customer_reference TEXT UNIQUE NOT NULL,
      phone_number TEXT NOT NULL,
      account_status TEXT DEFAULT 'ACTIVE',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- TABLE 2: PRODUCTS
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      product_name TEXT NOT NULL,
      product_code TEXT UNIQUE NOT NULL,
      category_id TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      size TEXT NOT NULL,
      price INTEGER NOT NULL,
      is_alcoholic INTEGER NOT NULL DEFAULT 0,
      age_restricted INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- TABLE 3: MACHINES
    CREATE TABLE IF NOT EXISTS machines (
      id TEXT PRIMARY KEY,
      machine_name TEXT NOT NULL,
      machine_serial_number TEXT UNIQUE NOT NULL,
      location TEXT NOT NULL,
      device_status TEXT NOT NULL DEFAULT 'ONLINE',
      firmware_version TEXT NOT NULL DEFAULT 'v2.4.1-esp32s3',
      last_online_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    -- TABLE 4: INVENTORY
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      machine_id TEXT NOT NULL,
      available_quantity INTEGER NOT NULL DEFAULT 0,
      reserved_quantity INTEGER NOT NULL DEFAULT 0,
      minimum_stock INTEGER NOT NULL DEFAULT 5,
      last_updated TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
      FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
    );

    -- TABLE 5: ORDERS
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_reference TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      machine_id TEXT NOT NULL,
      total_amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'RWF',
      order_status TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      dispensing_status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (machine_id) REFERENCES machines(id)
    );

    -- TABLE 6: ORDER_ITEMS
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name_snapshot TEXT NOT NULL,
      unit_price_snapshot INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      subtotal INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    -- TABLE 7: PAYMENTS
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      provider TEXT NOT NULL, -- 'MTN' or 'AIRTEL'
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'RWF',
      provider_transaction_id TEXT,
      internal_transaction_reference TEXT UNIQUE NOT NULL,
      payment_status TEXT NOT NULL,
      request_created_at TEXT NOT NULL,
      payment_confirmed_at TEXT,
      failure_reason TEXT,
      provider_response_reference TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    -- TABLE 8: PAYMENT_EVENTS
    CREATE TABLE IF NOT EXISTS payment_events (
      id TEXT PRIMARY KEY,
      payment_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_reference TEXT NOT NULL,
      event_status TEXT NOT NULL,
      event_timestamp TEXT NOT NULL,
      verification_result TEXT,
      safe_response_metadata TEXT,
      FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
    );

    -- TABLE 9: DISPENSING_TRANSACTIONS
    CREATE TABLE IF NOT EXISTS dispensing_transactions (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      machine_id TEXT NOT NULL,
      dispensing_reference TEXT UNIQUE NOT NULL,
      dispensing_status TEXT NOT NULL,
      command_sent_at TEXT NOT NULL,
      dispensing_started_at TEXT,
      dispensing_completed_at TEXT,
      sensor_confirmation TEXT,
      failure_reason TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (machine_id) REFERENCES machines(id)
    );

    -- TABLE 10: MACHINE_SENSORS
    CREATE TABLE IF NOT EXISTS machine_sensors (
      id TEXT PRIMARY KEY,
      machine_id TEXT NOT NULL,
      sensor_type TEXT NOT NULL,
      sensor_value REAL NOT NULL,
      unit TEXT NOT NULL,
      sensor_status TEXT NOT NULL DEFAULT 'NORMAL',
      recorded_at TEXT NOT NULL,
      FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
    );

    -- TABLE 11: MACHINE_ALERTS
    CREATE TABLE IF NOT EXISTS machine_alerts (
      id TEXT PRIMARY KEY,
      machine_id TEXT NOT NULL,
      alert_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      description TEXT NOT NULL,
      alert_status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at TEXT NOT NULL,
      resolved_at TEXT,
      FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
    );

    -- TABLE 12: USERS (Admin, Technicians, Staff)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL, -- 'ADMIN', 'TECHNICIAN', 'STAFF'
      phone TEXT,
      account_status TEXT NOT NULL DEFAULT 'ACTIVE',
      last_login TEXT,
      created_at TEXT NOT NULL
    );

    -- TABLE 13: SYSTEM_SETTINGS
    CREATE TABLE IF NOT EXISTS system_settings (
      id TEXT PRIMARY KEY,
      setting_name TEXT UNIQUE NOT NULL,
      setting_value TEXT NOT NULL,
      setting_category TEXT NOT NULL,
      updated_by TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- TABLE 14: AUDIT_LOGS
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      previous_value TEXT,
      new_value TEXT,
      timestamp TEXT NOT NULL,
      ip_address TEXT
    );
  `);

  // Ensure phone column exists in users table if previously created
  try {
    db.prepare('ALTER TABLE users ADD COLUMN phone TEXT').run();
  } catch (e) {
    // Column already exists
  }

  seedCoreSystemData();
  applyOfficialSixProducts();
  ensureIshimweAdminUser();
}

/**
 * Ensures the single authorized Admin is Ishimwe Clement with ishimweclement537@gmail.com and password skol123
 */
function ensureIshimweAdminUser() {
  const now = new Date().toISOString();
  const adminEmail = 'ishimweclement537@gmail.com';
  
  // Remove any previous placeholder admin users so Ishimwe Clement is the sole Admin
  db.prepare(`DELETE FROM users WHERE role = 'ADMIN' AND email != ?`).run(adminEmail);

  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail) as any;
  if (!existingAdmin) {
    db.prepare(`
      INSERT INTO users (id, full_name, email, password_hash, role, phone, account_status, created_at)
      VALUES ('usr-admin-clement', 'Ishimwe Clement', ?, 'skol123', 'ADMIN', '+250788123456', 'ACTIVE', ?)
    `).run(adminEmail, now);
  } else {
    db.prepare(`
      UPDATE users 
      SET full_name = 'Ishimwe Clement', password_hash = 'skol123', role = 'ADMIN', account_status = 'ACTIVE'
      WHERE email = ?
    `).run(adminEmail);
  }

  // Ensure initial technician account exists for technician testing
  const techEmail = 'tech@ftm1.rw';
  const existingTech = db.prepare('SELECT id FROM users WHERE email = ?').get(techEmail);
  if (!existingTech) {
    db.prepare(`
      INSERT INTO users (id, full_name, email, password_hash, role, phone, account_status, created_at)
      VALUES ('usr-tech-01', 'Emmanuel Rugamba (Field Tech)', ?, 'skol123', 'TECHNICIAN', '+250788654321', 'ACTIVE', ?)
    `).run(techEmail, now);
  }

  // Ensure initial semi-admin account exists for demo
  const semiEmail = 'semiadmin@ftm1.rw';
  const existingSemi = db.prepare('SELECT id FROM users WHERE email = ?').get(semiEmail);
  if (!existingSemi) {
    db.prepare(`
      INSERT INTO users (id, full_name, email, password_hash, role, phone, account_status, created_at)
      VALUES ('usr-semi-01', 'Alice Mukamana (Operations Semi-Admin)', ?, 'skol123', 'SEMI_ADMIN', '+250788334455', 'ACTIVE', ?)
    `).run(semiEmail, now);
  }
}

/**
 * Delete all old products and apply exactly the 6 requested categories and uploaded beverage images
 */
export function applyOfficialSixProducts() {
  const machineId = 'FTM-RW-KGL-001';
  const now = new Date().toISOString();

  // Exactly 6 products in 6 distinct categories with user-sent attachment paths
  const sixOfficialProducts = [
    {
      id: 'prod-virunga-still',
      name: 'Virunga Still Water',
      code: 'VRG-STILL-500',
      category: 'STILL_WATER',
      desc: 'Natural volcanic mountain spring water bottled by SBL at source. Stay refreshed through every move.',
      image: '/assets/aistudio/global__000054e2ea70026d_0000015f_2_000054e2ea70026d_0000000000000001__b4d07ee9589d44e1_000001f8243018bc_00065f50a0130d5f_4877212e.jpg',
      size: '500ml Glass Bottle',
      price: 500,
      isAlcoholic: 0,
      ageRestricted: 0,
      stock: 30
    },
    {
      id: 'prod-virunga-sparkling',
      name: 'Virunga Sparkling Water',
      code: 'VRG-SPARK-500',
      category: 'SPARKLING_WATER',
      desc: 'Premium sparkling volcanic water with fine effervescent bubbles. Commitment beyond the bottle.',
      image: '/assets/aistudio/global__000054e2ea70026d_0000015f_2_000054e2ea70026d_0000000000000001__499a0b0f3c665ff4_000001f8243018bc_00065f50a0130d5f_be952856.jpg',
      size: '500ml Glass Bottle',
      price: 700,
      isAlcoholic: 0,
      ageRestricted: 0,
      stock: 25
    },
    {
      id: 'prod-skol-panache-lemon',
      name: 'SKOL Panache Lemon',
      code: 'SKL-PANACHE-330',
      category: 'PANACHE_LEMON',
      desc: 'Invigorating malted lemon beverage brewed with real natural citrus juice. Crisp, sweet, and low malt freshness.',
      image: '/assets/aistudio/global__000054e2ea70026d_0000015f_2_000054e2ea70026d_0000000000000001__9712585349dc4c90_000001f8243018bc_00065f50a0130d5f_1714dd3a.jpg',
      size: '330ml Glass Bottle',
      price: 700,
      isAlcoholic: 0,
      ageRestricted: 0,
      stock: 28
    },
    {
      id: 'prod-skol-lager',
      name: 'SKOL Lager',
      code: 'SKL-LAGER-330',
      category: 'SKOL_LAGER',
      desc: 'International quality beer, nationally brewed in Rwanda. Pure barley malt and selected European aroma hops.',
      image: '/assets/aistudio/global__000054e2ea70026d_0000015f_2_000054e2ea70026d_0000000000000001__e758e5ad25235785_000001f8243018bc_00065f50a0130d5f_a72a92ee.jpg',
      size: '330ml Glass Bottle',
      price: 1000,
      isAlcoholic: 1,
      ageRestricted: 1,
      stock: 24
    },
    {
      id: 'prod-skol-malt',
      name: 'SKOL Malt',
      code: 'SKL-MALT-330',
      category: 'SKOL_MALT',
      desc: 'International 100% malt beer. Deep amber color, velvety malt aroma, and rich, full-bodied foam.',
      image: '/assets/aistudio/global__000054e2ea70026d_0000015f_2_000054e2ea70026d_0000000000000001__2bd618b103a16626_000001f8243018bc_00065f50a0130d5f_c2a48512.jpg',
      size: '330ml Glass Bottle',
      price: 1000,
      isAlcoholic: 1,
      ageRestricted: 1,
      stock: 20
    },
    {
      id: 'prod-virunga-silver',
      name: 'Virunga Silver',
      code: 'VRG-SILVER-330',
      category: 'VIRUNGA_SILVER',
      desc: 'Dare to change, release the party. Premium quality crisp craft beer brewed for celebration.',
      image: '/assets/aistudio/global__000054e2ea70026d_0000015f_2_000054e2ea70026d_0000000000000001__0e14be4b0ee06ed8_000001f8243018bc_00065f50a0130d5f_de9d5026.jpg',
      size: '330ml Glass Bottle',
      price: 1100,
      isAlcoholic: 1,
      ageRestricted: 1,
      stock: 22
    }
  ];

  db.exec('PRAGMA foreign_keys = OFF;');
  const resetTx = db.transaction(() => {
    // Delete all old inventory and products
    db.prepare('DELETE FROM inventory').run();
    db.prepare('DELETE FROM products').run();

    // Insert exactly the 6 products
    for (const p of sixOfficialProducts) {
      db.prepare(`
        INSERT INTO products (id, product_name, product_code, category_id, description, image_url, size, price, is_alcoholic, age_restricted, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).run(p.id, p.name, p.code, p.category, p.desc, p.image, p.size, p.price, p.isAlcoholic, p.ageRestricted, now, now);

      db.prepare(`
        INSERT INTO inventory (id, product_id, machine_id, available_quantity, reserved_quantity, minimum_stock, last_updated)
        VALUES (?, ?, ?, ?, 0, 5, ?)
      `).run(`inv-${p.id}`, p.id, machineId, p.stock, now);
    }

    db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_value, timestamp)
      VALUES (?, 'ishimweclement537@gmail.com', 'APPLY_OFFICIAL_6_PRODUCTS', 'CATALOG', 'FTM-RW-KGL-001', 'Deleted old products and seeded exact 6 SKOL/Virunga products and categories', ?)
    `).run(`aud-apply-${Date.now()}`, now);
  });

  resetTx();
  db.exec('PRAGMA foreign_keys = ON;');
}

function seedCoreSystemData() {
  const machineCheck = db.prepare('SELECT count(*) as count FROM machines').get() as { count: number };
  if (machineCheck.count === 0) {
    const now = new Date().toISOString();
    const machineId = 'FTM-RW-KGL-001';

    // Seed Primary Machine
    db.prepare(`
      INSERT INTO machines (id, machine_name, machine_serial_number, location, device_status, firmware_version, last_online_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      machineId,
      'FTM-1 Smart Solar Cooler #1',
      'FTM-ESP32S3-2026-RW01',
      'Kigali City Market Entrance Hub, Rwanda',
      'ONLINE',
      'v2.4.1-esp32s3',
      now,
      now
    );

    // Seed Sensors
    const sensors = [
      { id: 'sns-01', type: 'FRIDGE_TEMP', val: 3.8, unit: '°C' },
      { id: 'sns-02', type: 'AMBIENT_TEMP', val: 24.2, unit: '°C' },
      { id: 'sns-03', type: 'SOLAR_VOLTAGE', val: 49.6, unit: 'V' },
      { id: 'sns-04', type: 'BATTERY_SOC', val: 94.0, unit: '%' },
      { id: 'sns-05', type: 'COMPRESSOR_CURRENT', val: 2.1, unit: 'A' },
      { id: 'sns-06', type: 'DROP_IR_SENSOR', val: 1.0, unit: 'STATE' },
    ];
    for (const s of sensors) {
      db.prepare(`
        INSERT INTO machine_sensors (id, machine_id, sensor_type, sensor_value, unit, sensor_status, recorded_at)
        VALUES (?, ?, ?, ?, ?, 'NORMAL', ?)
      `).run(s.id, machineId, s.type, s.val, s.unit, now);
    }

    // Seed Settings
    const defaultSettings = [
      { name: 'MACHINE_NAME', val: 'FTM-1 Smart Solar Cooler #1', cat: 'GENERAL' },
      { name: 'MACHINE_SERIAL', val: 'FTM-ESP32S3-2026-RW01', cat: 'GENERAL' },
      { name: 'COOLER_THEME', val: 'SKOL_YELLOW_RED_WHITE', cat: 'APPEARANCE' },
      { name: 'OPERATING_LOCATION', val: 'Kigali City Market Hub, Rwanda', cat: 'GENERAL' },
      { name: 'SUPPORTED_LANGUAGES', val: 'english,french,kiswahili,chinese', cat: 'GENERAL' },
      { name: 'TARGET_TEMPERATURE', val: '3.5', cat: 'MACHINE' },
      { name: 'MAX_TEMP_THRESHOLD', val: '6.0', cat: 'MACHINE' },
      { name: 'MTN_MOMO_ENV', val: 'SANDBOX', cat: 'PAYMENT' },
      { name: 'AIRTEL_MONEY_ENV', val: 'SANDBOX', cat: 'PAYMENT' },
      { name: 'PRIMARY_ADMIN_EMAIL', val: 'ishimweclement537@gmail.com', cat: 'SECURITY' }
    ];

    for (const s of defaultSettings) {
      db.prepare(`
        INSERT INTO system_settings (id, setting_name, setting_value, setting_category, updated_by, updated_at)
        VALUES (?, ?, ?, ?, 'SYSTEM_INIT', ?)
      `).run(`set-${s.name.toLowerCase()}`, s.name, s.val, s.cat, now);
    }
  }
}
