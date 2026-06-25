const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const logger = require('./utils/logger');

// ---------- IMPORT ROUTES ----------
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const checkoutRoutes = require('./routes/checkout.routes');   // ✅ ADDED
const orderRoutes = require('./routes/order.routes');         // ✅ ADDED

const app = express();

// ----- 1. SECURITY & MIDDLEWARE (ORDER MATTERS!) -----

// Helmet: 14+ security headers
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS: Strict origin allowed
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Compression: Response size reduce karein
app.use(compression());

// Logging: Morgan use karein (Winston ke saath)
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Body parsers: Limit set karein (DoS attack se bachne ke liye)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie Parser
app.use(cookieParser());

// ----- 2. RATE LIMITING (Brute Force se bachne ke liye) -----
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { success: false, error: { message: 'Too many requests, please try again later.', status: 429 } },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Auth endpoints par sirf 20 requests
  message: { success: false, error: { message: 'Too many login attempts, please try again later.', status: 429 } },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiters
app.use('/api', globalLimiter);      // Saare API calls par basic limit
app.use('/api/auth', authLimiter);   // Auth endpoints par strict limit

// ----- 3. ROUTES -----

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root welcome message (404 na aaye is liye)
app.get('/', (req, res) => {
  res.status(200).json({
    message: '🚀 E-Commerce API is running!',
    docs: '/health',
    version: '1.0.0'
  });
});

// ---------- ✅ ALL API ROUTES REGISTERED HERE ----------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);   // ✅ ADDED
app.use('/api/orders', orderRoutes);        // ✅ ADDED

// ----- 4. 404 HANDLER -----
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// ----- 5. GLOBAL ERROR HANDLER (LAST) -----
app.use(errorHandler);

module.exports = app;