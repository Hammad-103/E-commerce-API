# E-Commerce API

A production-ready RESTful API for an e-commerce platform built with Node.js, Express, and PostgreSQL.

## 🚀 Features

- **JWT Authentication** with httpOnly cookies
- **Product Management** (CRUD with search & pagination)
- **Shopping Cart** (Add, Update, Remove with stock validation)
- **Checkout** (Mock payment integration - ready for Stripe/Safepay)
- **Order Management** (User orders with BOLA protection)
- **Security**: OWASP Top 10 compliant (Helmet, Rate Limiting, SQL Injection protection, BOLA/IDOR prevention)
- **Logging**: Winston + Morgan for request/error logging

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT (httpOnly Cookies)
- **Logging**: Winston, Morgan
- **Security**: Helmet, CORS, express-rate-limit

## 📁 Project Structure
src/
├── config/ # Database configuration
├── models/ # Data layer (SQL queries)
├── controllers/ # Business logic
├── routes/ # API endpoints
├── middleware/ # Auth, validation, error handling
├── utils/ # Helpers (AppError, logger)
└── db/ # Schema and initialization scripts

text

## 🔧 Installation & Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ecommerce-api
Install dependencies:

bash
npm install
Create .env file:

env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://...
JWT_SECRET=your_super_secret_key
COOKIE_DOMAIN=localhost
LOG_LEVEL=debug
Initialize database:

bash
npm run init-db
Start the server:

bash
npm run dev
📌 API Endpoints
Method	Endpoint	Description	Auth
POST	/api/auth/register	Register new user	Public
POST	/api/auth/login	Login user	Public
POST	/api/auth/logout	Logout user	Auth
GET	/api/auth/me	Get current user	Auth
GET	/api/products	List products (search/pagination)	Public
GET	/api/products/:id	Get single product	Public
POST	/api/products	Create product	Admin
PATCH	/api/products/:id	Update product	Admin
DELETE	/api/products/:id	Delete product	Admin
GET	/api/cart	Get user cart	Auth
POST	/api/cart/items	Add item to cart	Auth
PATCH	/api/cart/items/:id	Update cart item	Auth
DELETE	/api/cart/items/:id	Remove cart item	Auth
POST	/api/checkout	Place order (Mock Payment)	Auth
GET	/api/orders	Get user orders	Auth
GET	/api/orders/:id	Get single order	Auth
GET	/api/orders/admin/all	Get all orders	Admin
PATCH	/api/orders/:id/status	Update order status	Admin
  Testing
Postman collection is included in /postman-collection.json. Import it to test all endpoints.



   Security Features
JWT stored in httpOnly cookies (XSS protection)

SQL Injection prevention (parameterized queries)

Rate Limiting (100 requests/15 mins global, 20/15 mins for auth)

Helmet.js for security headers

CORS with strict origin whitelist

BOLA/IDOR protection (ownership checks on all resources)

Input validation & sanitization (express-validator)

OWASP Top 10 compliance
