# 🥭 Fresh Mango BD — Complete Setup Guide

A full-stack seasonal mango selling website for Bangladesh customers.

---

## 📁 Project File Structure

```
fresh-mango-bd/
├── server.js           ← Node.js + Express backend
├── package.json        ← Dependencies
├── orders.db           ← SQLite database (auto-created)
├── README.md           ← This file
│
├── frontend/
│   ├── index.html      ← Main website
│   ├── style.css       ← All styles
│   └── script.js       ← Frontend logic + API calls
│
└── admin/
    └── index.html      ← Admin dashboard
```

---

## ⚙️ Installation Steps

### Step 1 — Install Node.js
Download from: https://nodejs.org (choose LTS version)

Verify installation:
```bash
node --version
npm --version
```

### Step 2 — Download the Project
Save all files into a folder named `fresh-mango-bd/`

### Step 3 — Install Dependencies
Open a terminal/command prompt inside the project folder:
```bash
cd fresh-mango-bd
npm install
```

This installs:
- **express** — web server framework
- **better-sqlite3** — lightweight SQLite database
- **cors** — allows frontend to talk to backend
- **nodemon** — auto-restart on file changes (dev only)

---

## 🚀 How to Run the Project

### Start the server:
```bash
node server.js
```

You will see:
```
✅ Database connected & table ready.
🥭 Fresh Mango BD server running at http://localhost:5000
📊 Admin panel at: http://localhost:5000/admin
```

### Open in browser:
| Page | URL |
|------|-----|
| 🌐 Main Website | http://localhost:5000 |
| 📊 Admin Panel | http://localhost:5000/admin |

### During development (auto-restart):
```bash
npm run dev
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orders` | Place new order |
| `GET` | `/api/orders` | Get all orders |
| `GET` | `/api/orders/:id` | Get single order |
| `PATCH` | `/api/orders/:id/status` | Update order status |
| `DELETE` | `/api/orders/:id` | Delete order |
| `GET` | `/api/stats` | Dashboard statistics |

### Example: Place an Order (POST /api/orders)
```json
{
  "customer_name": "Rahim Uddin",
  "phone": "01712345678",
  "address": "House 12, Road 4, Khulna",
  "mango_type": "Himsagar Mango",
  "quantity": 5,
  "delivery_area": "Khulna",
  "payment_method": "Cash on Delivery",
  "note": "Please pack carefully"
}
```

### Example: Update Status (PATCH /api/orders/1/status)
```json
{ "status": "Confirmed" }
```

Valid statuses: `Pending`, `Confirmed`, `Delivered`, `Cancelled`

---

## 🗄️ Database

- The database file `orders.db` is created automatically when you start the server.
- It's a SQLite file — no separate database installation needed.
- You can view it with: https://sqlitebrowser.org (free tool)

### Orders Table Schema:
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Auto-incremented order ID |
| customer_name | TEXT | Customer's full name |
| phone | TEXT | BD phone number |
| address | TEXT | Delivery address |
| mango_type | TEXT | Selected mango variety |
| quantity | REAL | Quantity in KG |
| delivery_area | TEXT | Delivery district |
| payment_method | TEXT | COD / bKash / Nagad |
| note | TEXT | Special instructions |
| order_status | TEXT | Pending/Confirmed/Delivered/Cancelled |
| created_at | TEXT | Order timestamp |

---

## 🔧 Customization

### Change Phone Number & WhatsApp:
In `frontend/index.html`, search for `8801700000000` and replace with your number.

### Change Mango Prices:
In `frontend/index.html`, find the product cards section and update the price values.

### Change Business Address:
Search for "Khulna Sadar, Khulna" and update with your address.

### Change Facebook Link:
Search for `facebook.com/freshmangobd` and replace with your page URL.

---

## 🛡️ Admin Panel Features

- 📊 Dashboard with order statistics (total, pending, confirmed, delivered, cancelled, KG sold)
- 📋 Full orders table with all customer details
- 🔍 Search orders by name or phone
- 🏷️ Filter orders by status
- ✏️ Change order status with dropdown
- 👁️ View full order details in modal
- 🗑️ Delete orders
- 🔄 Auto-refresh every 60 seconds

---

## 🌐 Deploy Online (Optional)

### Easy free hosting options:
1. **Render.com** — Free Node.js hosting
2. **Railway.app** — Free tier available
3. **Cyclic.sh** — Simple deployment

Upload your project files and follow their Node.js deployment guide.

---

## 📞 Support

For help, contact: freshmangobd@gmail.com  
WhatsApp: 01700-000000

---

Made with 🥭 in Bangladesh
