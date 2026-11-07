# G-Zen Phone Store (Phnom Penh, Cambodia)

A modern, production-ready full-stack e-commerce and repair booking web application built with **Vue.js 3** (Composition API, Vite, Pinia, Tailwind CSS) and **Node.js** (Express, Sequelize, SQLite3, JWT, bcryptjs).

---

## 🌟 Key Features

### 🛒 Customer Storefront
- **Flagship Showcase Hero:** Highlights Apple iPhone 16 Pro Max, Samsung Galaxy S25 Ultra, iPad Pro M4, and MacBook Pro M3 Max.
- **Smart Catalog & Filter:** Filter by **Smartphones**, **Tablets**, **Laptops**, and **Accessories** with real-time search and price sorting.
- **Quick View Modal:** High-resolution product specifications preview with instant quantity selection and "Add to Cart".
- **Slide-Over Cart Drawer:** Real-time quantity adjustments, subtotal calculation, and instant Phnom Penh district delivery fees ($1.50 - $3.00).
- **Bakong KHQR Gateway & Auto-Verification (LuyRiel NBC):** Authentic National Bank of Cambodia KHQR modal integrated with [LuyRiel Bakong Gateway](https://www.lorndavid.online/docs), high-contrast EMVCo dynamic QR code, mobile 1-tap Bakong app deeplink, dual USD/KHR amounts, and live 2.5-second auto-verification polling loop that confirms payments against the NBC ledger.
- **Live Order Timeline:** Interactive status tracking (`Pending` -> `QC Testing` -> `Out for Delivery` -> `Delivered`).
- **Repair Booking System:** Book Hardware Repairs (OLED screens, batteries), Software Setup, or Trade-In valuation with instant ticket number generation (`REP-XXXX`) and live technician status lookup.
- **Phnom Penh Location & Floating Telegram:** Store hours (8:00 AM - 8:30 PM), showroom address on Preah Monivong Blvd (BKK1), and floating Telegram customer support (`@gzenphoneshop`).

### 🛡️ Enterprise Store Management Portal
- **Strict Role Isolation:** Regular customers and guests cannot see or access the Admin view. The `/admin` portal is locked behind JWT authentication and role-based guards.
- **Tab 1: Store Analytics:** Real-time Gross Revenue ($), Order counts, Total inventory valuation, and active repair queue.
- **Tab 2: Product Catalog CRUD:** Search and filter by category/stock, instant inline stock adjustments (`+5`, `+1`, `-1`), and rich product creation modal with live image preview, photo presets, and specs builder (Display, Chip, Storage, Color).
- **Tab 3: Order Dispatch & Status:** Search orders, status flow dropdowns (`Pending` -> `QC Testing` -> `Out for Delivery` -> `Delivered`), and detailed invoice preview sheets.
- **Tab 4: Technical Repair Hub:** Review device symptom tickets, diagnosis quotes, technician notes, and status progression (`Received` -> `In Progress` -> `Completed`).

---

## 🔑 Authentication & Access

| Role | Access URL | Credentials | Capabilities |
| :--- | :--- | :--- | :--- |
| **Store Administrator** | `/login` (Staff portal toggle) | `admin@gzenphone.kh` / `admin123` | Full Storefront + Complete Admin Operations Center (`/admin`) |
| **Registered Customer** | `/login` | `customer@example.com` / `customer123` | Storefront, Catalog, Cart, Checkout, Order Tracking |
| **New Customer** | `/register` or inline at `/checkout` | Create account at checkout | Full customer checkout with automatic warranty registration |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or v20 LTS)
- npm (v9+)

### One-Command Quick Start (Both Backend & Frontend)
```bash
# From repository root:
node scripts/start-both.js
```
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

### Or Run Individually:

#### 1. Backend (Express & SQLite)
```bash
cd backend
npm install
npm run start
```

#### 2. Frontend (Vue 3 & Vite)
```bash
cd frontend
npm install
npm run dev
```

### Run Automated Verification Suite
```bash
node scripts/verify-all.js
```

---

## 🏗️ Architecture & Project Structure

```
Track/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # Sequelize SQLite configuration
│   │   │   └── supabase.js          # Supabase cloud client & REST query builder
│   │   ├── models/
│   │   │   ├── User.js              # Customer & Admin accounts with bcryptjs
│   │   │   ├── Product.js           # Tech catalog with specs, categories, stock
│   │   │   ├── Order.js             # Orders with Phnom Penh address & KHQR
│   │   │   └── RepairBooking.js     # Repair service appointments & tickets
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, login, profile check
│   │   │   ├── productController.js # Catalog listing, search, admin CRUD
│   │   │   ├── orderController.js   # Order placement, stock deduction, status update
│   │   │   ├── repairController.js  # Booking submission, ticket lookup, admin status
│   │   │   ├── bakongController.js  # Bakong KHQR generator & settlement check
│   │   │   └── supabaseController.js# Supabase cloud connectivity & order sync
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT verification & Admin role guard
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # /api/auth
│   │   │   ├── productRoutes.js     # /api/products
│   │   │   ├── orderRoutes.js       # /api/orders
│   │   │   ├── repairRoutes.js      # /api/repairs
│   │   │   ├── bakongRoutes.js      # /api/bakong
│   │   │   └── supabaseRoutes.js    # /api/supabase
│   │   ├── seed/
│   │   │   └── seedData.js          # Auto-seeds flagship devices & demo accounts
│   │   └── server.js                # Express app entry on port 5000
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.vue           # Brand logo, role switcher, cart badge
│   │   │   ├── Footer.vue           # Phnom Penh address, opening hours, trust badges
│   │   │   ├── CartDrawer.vue       # Slide-over cart, district selector, subtotal
│   │   │   ├── ProductCard.vue      # Card with stock badge, quick view, add to cart
│   │   │   ├── QuickViewModal.vue   # Specs sheet, quantity selector
│   │   │   ├── KHQRModal.vue        # Bakong KHQR modal with countdown & simulation
│   │   │   └── TelegramButton.vue   # Floating Phnom Penh customer support widget
│   │   ├── views/
│   │   │   ├── HomeView.vue         # Hero banner, category shortcuts, hot deals
│   │   │   ├── ShopView.vue         # Category filter tabs, search, price sort
│   │   │   ├── ProductDetailView.vue# Full specs sheet, warranty, add to cart
│   │   │   ├── CheckoutView.vue     # Phnom Penh delivery, KHQR/ABA/COD selector
│   │   │   ├── OrderSuccessView.vue # Fulfillment timeline tracker, confetti
│   │   │   ├── ServicesView.vue     # Repair booking form & ticket lookup
│   │   │   ├── MyOrdersView.vue     # Customer order history
│   │   │   ├── AdminView.vue        # Analytics, Orders, Product CRUD, Repairs
│   │   │   ├── LoginView.vue        # Login with 1-click demo buttons
│   │   │   └── RegisterView.vue     # Customer registration
│   │   ├── stores/
│   │   │   ├── authStore.js         # JWT auth, user profile, role switcher
│   │   │   ├── cartStore.js         # Slide-over cart, district fees, local storage
│   │   │   └── productStore.js      # Reactive catalog, category & search filter
│   │   ├── services/
│   │   │   └── api.js               # Axios instance with JWT interceptor
│   │   ├── router/
│   │   │   └── index.js             # Vue Router configuration
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css                # Tailwind CSS + custom glassmorphism styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── scripts/
│   ├── start-both.js                # Concurrent launcher
│   └── verify-all.js                # 17-point automated verification suite
├── package.json
└── README.md
```
