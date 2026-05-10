const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

const db = new sqlite3.Database(path.join(__dirname, 'orders.db'), (err) => {
  if (err) console.error(err.message);
  else console.log('✅ Database connected & table ready.');
});

db.run(`CREATE TABLE IF NOT EXISTS orders (
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
)`);

app.post('/api/orders', (req, res) => {
  const { customer_name, phone, address, mango_type, quantity, delivery_area, payment_method, note } = req.body;
  if (!customer_name || !phone || !address || !mango_type || !quantity || !delivery_area || !payment_method) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
  }
  const sql = `INSERT INTO orders (customer_name, phone, address, mango_type, quantity, delivery_area, payment_method, note) VALUES (?,?,?,?,?,?,?,?)`;
  db.run(sql, [customer_name, phone, address, mango_type, parseFloat(quantity), delivery_area, payment_method, note || ''], function(err) {
    if (err) return res.status(500).json({ success: false, message: 'Server error.' });
    console.log(`📦 New order #${this.lastID} from ${customer_name}`);
    res.status(201).json({ success: true, message: 'Order placed successfully!', orderId: this.lastID });
  });
});

app.get('/api/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Could not fetch orders.' });
    res.json({ success: true, count: rows.length, orders: rows });
  });
});

app.get('/api/orders/:id', (req, res) => {
  db.get('SELECT * FROM orders WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error.' });
    if (!row) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, order: row });
  });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Confirmed', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' });
  db.run('UPDATE orders SET order_status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ success: false, message: 'Server error.' });
    if (this.changes === 0) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, message: `Order status updated to ${status}` });
  });
});

app.delete('/api/orders/:id', (req, res) => {
  db.run('DELETE FROM orders WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ success: false, message: 'Server error.' });
    if (this.changes === 0) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, message: 'Order deleted successfully.' });
  });
});

app.get('/api/stats', (req, res) => {
  db.all(`SELECT order_status, COUNT(*) as count FROM orders GROUP BY order_status`, [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error.' });
    const stats = { total: 0, pending: 0, confirmed: 0, delivered: 0, cancelled: 0, total_kg: 0 };
    rows.forEach(r => {
      stats.total += r.count;
      if (r.order_status === 'Pending') stats.pending = r.count;
      if (r.order_status === 'Confirmed') stats.confirmed = r.count;
      if (r.order_status === 'Delivered') stats.delivered = r.count;
      if (r.order_status === 'Cancelled') stats.cancelled = r.count;
    });
    db.get(`SELECT SUM(quantity) as total FROM orders WHERE order_status != 'Cancelled'`, [], (err, row) => {
      stats.total_kg = row ? row.total || 0 : 0;
      res.json({ success: true, stats });
    });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🥭 Fresh Mango BD server running at http://localhost:${PORT}`);
  console.log(`📊 Admin panel at: http://localhost:${PORT}/admin`);
});
