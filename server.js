const express = require("express");
const cors = require("cors");
const path = require("path");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("orders.json");
const db = low(adapter);

db.defaults({ orders: [], nextId: 1 }).write();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "frontend")));
app.use("/admin", express.static(path.join(__dirname, "admin")));

console.log("✅ Database connected & table ready.");

app.post("/api/orders", (req, res) => {
  const {
    customer_name,
    phone,
    whatsapp,
    address,
    mango_type,
    quantity,
    delivery_area,
    payment_method,
    note,
  } = req.body;
  if (
    !customer_name ||
    !phone ||
    !address ||
    !mango_type ||
    !quantity ||
    !delivery_area ||
    !payment_method
  ) {
    return res
      .status(400)
      .json({ success: false, message: "All required fields must be filled." });
  }
  const id = db.get("nextId").value();
  const order = {
    id,
    customer_name,
    phone,
    whatsapp: whatsapp || "",
    address,
    mango_type,
    quantity: parseFloat(quantity),
    delivery_area,
    payment_method,
    note: note || "",
    order_status: "Pending",
    created_at: new Date().toLocaleString("en-BD"),
  };
  db.get("orders").push(order).write();
  db.update("nextId", (n) => n + 1).write();
  console.log(`📦 New order #${id} from ${customer_name}`);
  res.status(201).json({
    success: true,
    message: "Order placed successfully!",
    orderId: id,
  });
});

app.get("/api/orders", (req, res) => {
  const orders = db.get("orders").value().reverse();
  res.json({ success: true, count: orders.length, orders });
});

app.get("/api/orders/:id", (req, res) => {
  const order = db
    .get("orders")
    .find({ id: parseInt(req.params.id) })
    .value();
  if (!order)
    return res
      .status(404)
      .json({ success: false, message: "Order not found." });
  res.json({ success: true, order });
});

app.patch("/api/orders/:id/status", (req, res) => {
  const { status } = req.body;
  const validStatuses = ["Pending", "Confirmed", "Delivered", "Cancelled"];
  if (!validStatuses.includes(status))
    return res.status(400).json({ success: false, message: "Invalid status." });
  const order = db.get("orders").find({ id: parseInt(req.params.id) });
  if (!order.value())
    return res
      .status(404)
      .json({ success: false, message: "Order not found." });
  order.assign({ order_status: status }).write();
  res.json({ success: true, message: `Order status updated to ${status}` });
});

app.delete("/api/orders/:id", (req, res) => {
  const order = db
    .get("orders")
    .find({ id: parseInt(req.params.id) })
    .value();
  if (!order)
    return res
      .status(404)
      .json({ success: false, message: "Order not found." });
  db.get("orders")
    .remove({ id: parseInt(req.params.id) })
    .write();
  res.json({ success: true, message: "Order deleted successfully." });
});

app.get("/api/stats", (req, res) => {
  const orders = db.get("orders").value();
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.order_status === "Pending").length,
    confirmed: orders.filter((o) => o.order_status === "Confirmed").length,
    delivered: orders.filter((o) => o.order_status === "Delivered").length,
    cancelled: orders.filter((o) => o.order_status === "Cancelled").length,
    total_kg: orders
      .filter((o) => o.order_status !== "Cancelled")
      .reduce((sum, o) => sum + o.quantity, 0),
  };
  res.json({ success: true, stats });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🥭 Fresh Mango BD server running at http://localhost:${PORT}`);
  console.log(`📊 Admin panel at: http://localhost:${PORT}/admin`);
});
