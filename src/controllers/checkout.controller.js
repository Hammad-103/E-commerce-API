const cartModel = require('../models/cart.model');
const orderModel = require('../models/order.model');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// -------------------------------
// MOCK / DUMMY CHECKOUT 
// Payment assumed successful instantly.
// -------------------------------
const initiateCheckout = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Cart fetch karo
    const { cart, items } = await cartModel.getCartWithItems(userId);

    if (!cart || items.length === 0) {
      return next(new AppError('Cart is empty. Add items before checkout.', 400));
    }

    // 2. Out-of-stock items ka check
    const outOfStockItems = items.filter(item => item.quantity > item.stock_quantity);
    if (outOfStockItems.length > 0) {
      const names = outOfStockItems.map(item => item.name).join(', ');
      return next(new AppError(`Some items are out of stock: ${names}`, 400));
    }

    // 3. Total calculate karo
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = parseFloat(total.toFixed(2));

    // 4. MOCK PAYMENT ID (Stripe ki jagah fake ID)
    const mockPaymentId = `mock_pay_${Date.now()}_${userId}`;

    // 5. Order create karo (transaction, stock deduct, cart clear - sab automatically ho jayega)
    const order = await orderModel.createOrder(
      userId, 
      items, 
      totalAmount, 
      mockPaymentId
    );

    logger.info(`✅ Mock Order placed: ${order.id} for user ${userId}`);

    // 6. Success response
    res.status(201).json({
      success: true,
      message: 'Order placed successfully (Mock Payment - No real card charged)',
      data: {
        order_id: order.id,
        total: order.total_amount,
        status: order.status,
        payment_id: mockPaymentId,
      },
    });

  } catch (error) {
    logger.error('Checkout error:', error);
    next(error);
  }
};

// Webhook handler dummy (agar koi route accidentally call kare toh)
const handleStripeWebhook = async (req, res) => {
  res.status(200).json({ received: true, message: 'Mock webhook (ignored)' });
};

module.exports = { initiateCheckout, handleStripeWebhook };