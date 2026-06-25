const express = require('express');
const { authMiddleware, isAdmin } = require('../middleware/auth');
const orderController = require('../controllers/order.controller');

const router = express.Router();

// All order routes require auth
router.use(authMiddleware);

// User gets their own orders
router.get('/', orderController.getUserOrders);

// Get single order (check ownership)
router.get('/:id', orderController.getOrderById);

// Admin routes
router.get('/admin/all', isAdmin, orderController.getAllOrders);
router.patch('/:id/status', isAdmin, orderController.updateOrderStatus);

module.exports = router; // ✅ Yeh line zaroori hai!