// ============================
// FRESH MANGO BD — server.js
// Node.js + Express + SQLite
// ============================

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 5000;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, 'frontend')));
// Serve admin panel
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// ===== DATABASE SETUP =====
const db = new Database(path.join(__dirname, 'orders.db'));

// Create orders table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    mango_type TEXT NOT NULL,
    quantity REAL NOT NULL,
    delivery_area TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    note TEXT,
    order_status TEXT DEFAULT 'Pending',
    created_at TEXT DEFAULT (datetime('now','localtime'))
  )
`);

console.log('✅ Database connected & table ready.');

// ===== API ROUTES =====

// POST /api/orders — Place a new order
app.post('/api/orders', (req, res) => {
  try {
    const {
      customer_name, phone, address,
      mango_type, quantity, delivery_area,
      payment_method, note
    } = req.body;

    // Basic validation
    if (!customer_name || !phone || !address || !mango_type || !quantity || !delivery_area || !payment_method) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }

    const stmt = db.prepare(`
      INSERT INTO orders (customer_name, phone, address, mango_type, quantity, delivery_area, payment_method, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      customer_name.trim(),
      phone.trim(),
      address.trim(),
      mango_type,
      parseFloat(quantity),
      delivery_area,
      payment_method,
      note ? note.trim() : ''
    );

    console.log(`📦 New order #${result.lastInsertRowid} from ${customer_name}`);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Order error:', err.message);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// GET /api/orders — Get all orders (admin)
app.get('/api/orders', (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch orders.' });
  }
});

// GET /api/orders/:id — Get single order
app.get('/api/orders/:id', (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PATCH /api/orders/:id/status — Update order status
app.patch('/api/orders/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const result = db.prepare('UPDATE orders SET order_status = ? WHERE id = ?')
                     .run(status, req.params.id);

    if (result.changes === 0) return res.status(404).json({ success: false, message: 'Order not found.' });

    console.log(`🔄 Order #${req.params.id} status → ${status}`);
    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/orders/:id — Delete order
app.delete('/api/orders/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ success: false, message: 'Order not found.' });

    console.log(`🗑️ Order #${req.params.id} deleted.`);
    res.json({ success: true, message: 'Order deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/stats — Summary stats for admin dashboard
app.get('/api/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const pending = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Pending'").get().count;
    const confirmed = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Confirmed'").get().count;
    const delivered = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Delivered'").get().count;
    const cancelled = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Cancelled'").get().count;
    const revenue = db.prepare("SELECT SUM(quantity) as total FROM orders WHERE order_status != 'Cancelled'").get().total || 0;

    res.json({ success: true, stats: { total, pending, confirmed, delivered, cancelled, total_kg: revenue } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Catch-all: serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🥭 Fresh Mango BD server running at http://localhost:${PORT}`);
  console.log(`📊 Admin panel at: http://localhost:${PORT}/admin`);
});
