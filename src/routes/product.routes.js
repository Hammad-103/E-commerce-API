const express = require('express');
const { body } = require('express-validator');
const { authMiddleware, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const productController = require('../controllers/product.controller');

const router = express.Router();

// ---------- PUBLIC ROUTES (Sab dekh sakte hain) ----------
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// ---------- ADMIN ROUTES (Sirf admin) ----------
router.post(
  '/',
  authMiddleware,
  isAdmin,
  validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock_quantity').isInt({ min: 0 }).withMessage('Stock quantity must be a positive integer'),
    body('image_url').optional().isURL().withMessage('Image URL must be a valid URL'),
  ]),
  productController.createProduct
);

router.patch(
  '/:id',
  authMiddleware,
  isAdmin,
  validate([
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a positive integer'),
    body('image_url').optional().isURL().withMessage('Image URL must be a valid URL'),
  ]),
  productController.updateProduct
);

router.delete(
  '/:id',
  authMiddleware,
  isAdmin,
  productController.deleteProduct
);

module.exports = router;