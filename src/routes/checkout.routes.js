const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const checkoutController = require('../controllers/checkout.controller');

const router = express.Router();

// 🔒 Checkout (Authenticated)
router.post('/', authMiddleware, checkoutController.initiateCheckout);

module.exports = router; // ✅ Yeh line zaroori hai!