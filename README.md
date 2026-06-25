# 🛒 E-Commerce API

A production-ready RESTful API for an e-commerce platform built with **Node.js**, **Express**, and **PostgreSQL**. Implements **JWT authentication**, **shopping cart**, **order management**, and **mock payment** with **OWASP Top 10** security compliance.


---

##  Features

### Core Features
-  **JWT Authentication** with httpOnly cookies (XSS-safe)
-  **Product Management** (CRUD with search, filter & pagination)
-  **Shopping Cart** (Add, Update, Remove with real-time stock validation)
-  **Checkout** (Mock payment ready – can swap with Stripe/Safepay)
-  **Order Management** (View orders, order history with items)
-  **Admin Panel** (Product & inventory management)

### Security & Performance
-  **OWASP Top 10** compliant
-  **SQL Injection** prevention (parameterized queries)
-  **Rate Limiting** (100 req/min global, 20 req/min for auth)
-  **Helmet.js** (14+ security headers)
-  **CORS** with strict origin whitelist
-  **BOLA/IDOR** protection (ownership checks on all resources)
-  **Input Validation & Sanitization** (express-validator)
-  **Request Size Limiting** (10KB DoS protection)
-  **Logging** (Winston + Morgan)

---

##  Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js + Express.js |
| **Database** | PostgreSQL (Neon) |
| **Authentication** | JWT + httpOnly Cookies |
| **Security** | Helmet, CORS, express-rate-limit |
| **Validation** | express-validator |
| **Logging** | Winston + Morgan |
| **Testing** | Jest + Supertest (ready) |
| **Payments** | Mock (Stripe/Safepay ready) |

---

##  Project Structure

```
ecommerce-api/
├── src/
│   ├── config/
│   │   └── db.js                  
│   ├── models/                    
│   │   ├── user.model.js
│   │   ├── product.model.js
│   │   ├── cart.model.js
│   │   └── order.model.js
│   ├── controllers/               
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── cart.controller.js
│   │   ├── checkout.controller.js
│   │   └── order.controller.js
│   ├── routes/                    
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── cart.routes.js
│   │   ├── checkout.routes.js
│   │   └── order.routes.js
│   ├── middleware/                
│   │   ├── auth.js                
│   │   ├── errorHandler.js        
│   │   └── validate.js            
│   ├── utils/
│   │   ├── AppError.js            
│   │   └── logger.js              
│   ├── db/
│   │   ├── schema.sql             
│   │   └── initDb.js              
│   ├── app.js                     
│   └── index.js                   
├── .env.example                   
├── .gitignore
├── package.json
└── README.md
```

---

##  Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Hammad-103/E-commerce-API.git
cd ecommerce-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://your_neon_connection_string
JWT_SECRET=your_super_secret_key_change_this
COOKIE_DOMAIN=localhost
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### 4. Initialize Database
```bash
npm run init-db
```
This creates all tables and seeds a default admin user.

### 5. Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will run on: `http://localhost:5000`

---

##  API Endpoints

###  Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login (returns httpOnly cookie) | Public |
| POST | `/api/auth/logout` | Logout (clears cookie) | Auth |
| GET | `/api/auth/me` | Get current user profile | Auth |

###  Products

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | List products (search + pagination) | Public |
| GET | `/api/products/:id` | Get single product | Public |
| POST | `/api/products` | Create product | Admin |
| PATCH | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |

**Query Parameters** (`GET /api/products`):
- `search` – Search by name/description
- `page` – Page number (default: 1)
- `limit` – Items per page (default: 10)

###  Cart

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/cart` | Get user's cart with items | Auth |
| POST | `/api/cart/items` | Add item to cart | Auth |
| PATCH | `/api/cart/items/:id` | Update item quantity | Auth |
| DELETE | `/api/cart/items/:id` | Remove item from cart | Auth |

**POST Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

###  Checkout

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/checkout` | Place order (mock payment) | Auth |

**Response:**
```json
{
  "success": true,
  "message": "Order placed successfully (Mock Payment)",
  "data": {
    "order_id": 1,
    "total": "1679.95",
    "status": "paid",
    "payment_id": "mock_pay_1719345678_1"
  }
}
```

###  Orders

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/orders` | Get user's orders | Auth |
| GET | `/api/orders/:id` | Get single order with items | Auth |
| GET | `/api/orders/admin/all` | Get all orders (admin) | Admin |
| PATCH | `/api/orders/:id/status` | Update order status | Admin |

**Order Statuses:** `pending`, `paid`, `shipped`, `delivered`, `cancelled`

---

##  Testing

### Default Credentials

**Admin:**
```json
{
  "email": "admin@admin.com",
  "password": "admin123"
}
```

**Customer:**
```json
{
  "email": "customer@test.com",
  "password": "Test@1234"
}
```

### Postman Collection
Import `postman-collection.json` (available in the project root) to test all endpoints.

### Run Tests
```bash
npm test
```

---

##  Security Features

| Feature | Implementation |
|---------|----------------|
| Authentication | JWT stored in httpOnly cookies (XSS safe) |
| SQL Injection | Parameterized queries (`$1, $2`) |
| Rate Limiting | express-rate-limit (100/15min global, 20/15min auth) |
| Security Headers | Helmet.js (14+ headers) |
| CORS | Whitelisted origins only |
| BOLA/IDOR | Ownership checks on all resources |
| Input Validation | express-validator with sanitization |
| Request Size | 10KB limit (DoS protection) |
| Password Hashing | bcrypt (salt rounds: 10) |
| Error Handling | No stack traces in production |
| Logging | Winston (error + combined logs) |

---

##  Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts (name, email, password_hash, role) |
| `products` | Product catalog (name, description, price, stock_quantity) |
| `carts` | User cart (user_id) |
| `cart_items` | Cart items (cart_id, product_id, quantity) |
| `orders` | Order records (user_id, total_amount, status, stripe_payment_id) |
| `order_items` | Order line items (order_id, product_id, quantity, price_at_purchase) |

### Database Indexes
- `idx_users_email` – Fast email lookup
- `idx_products_name` – Product search performance
- `idx_carts_user_id` – Quick cart retrieval
- `idx_orders_user_id` – User order history
- `idx_order_items_order_id` – Order details joins

---

##  Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment (development/production) | development |
| `DATABASE_URL` | Neon PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Required |
| `COOKIE_DOMAIN` | Cookie domain | localhost |
| `LOG_LEVEL` | Log level (debug/info/error) | debug |
| `CORS_ORIGIN` | Allowed origins (comma-separated) | http://localhost:5173 |
