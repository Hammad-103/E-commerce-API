const express = require('express');
const { body, param } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');
const cartController = require('../controllers/cart.controller');

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

router.get('/', cartController.getCart);

router.post(
  '/items',
  validate([
    body('productId').isInt({ min: 1 }).withMessage('Valid product ID required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ]),
  cartController.addToCart
);

router.patch(
  '/items/:itemId',
  validate([
    param('itemId').isInt({ min: 1 }).withMessage('Valid item ID required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ]),
  cartController.updateCartItem
);

router.delete(
  '/items/:itemId',
  validate([
    param('itemId').isInt({ min: 1 }).withMessage('Valid item ID required'),
  ]),
  cartController.removeFromCart
);

module.exports = router;