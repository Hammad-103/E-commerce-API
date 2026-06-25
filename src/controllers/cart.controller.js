const cartModel = require('../models/cart.model');
const productModel = require('../models/product.model');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { cart, items } = await cartModel.getCartWithItems(userId);

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: { items: [], total: 0, item_count: 0 }
      });
    }

    // ✅ Optimized: items mein already stock_quantity hai (model se join kar ke aa rahi hai)
    const validatedItems = items.map(item => {
      const isOutOfStock = item.quantity > item.stock_quantity;
      return {
        ...item,
        out_of_stock: isOutOfStock,
        available_quantity: item.stock_quantity
      };
    });

    const total = validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.status(200).json({
      success: true,
      data: {
        cart_id: cart.id,
        items: validatedItems,
        total: parseFloat(total.toFixed(2)),
        item_count: validatedItems.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  } catch (error) {
    logger.error('Get cart error:', error);
    next(error);
  }
};
const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;
    
    // Validate product exists and has stock
    const product = await productModel.findById(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }
    
    if (product.stock_quantity < quantity) {
      return next(new AppError(`Only ${product.stock_quantity} items available in stock`, 400));
    }
    
    // Get or create cart
    const cart = await cartModel.findOrCreateByUserId(userId);
    
    // Add item to cart
    const cartItem = await cartModel.addItem(cart.id, productId, quantity);
    
    logger.info(`Added to cart: User ${userId}, Product ${productId}, Quantity ${quantity}`);
    
    res.status(200).json({
      success: true,
      data: cartItem
    });
  } catch (error) {
    logger.error('Add to cart error:', error);
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return next(new AppError('Quantity must be at least 1', 400));
    }
    
    // Check if item belongs to user's cart
    const cart = await cartModel.findOrCreateByUserId(userId);
    const cartItem = await cartModel.getItemById(itemId);
    
    if (!cartItem) {
      return next(new AppError('Cart item not found', 404));
    }
    
    if (cartItem.cart_id !== cart.id) {
      return next(new AppError('Access denied. This item is not in your cart.', 403));
    }
    
    // Check stock
    const product = await productModel.findById(cartItem.product_id);
    if (product.stock_quantity < quantity) {
      return next(new AppError(`Only ${product.stock_quantity} items available in stock`, 400));
    }
    
    const updatedItem = await cartModel.updateItemQuantity(itemId, quantity);
    
    logger.info(`Updated cart item: User ${userId}, Item ${itemId}, Quantity ${quantity}`);
    
    res.status(200).json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    logger.error('Update cart item error:', error);
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    
    // Check if item belongs to user's cart
    const cart = await cartModel.findOrCreateByUserId(userId);
    const cartItem = await cartModel.getItemById(itemId);
    
    if (!cartItem) {
      return next(new AppError('Cart item not found', 404));
    }
    
    if (cartItem.cart_id !== cart.id) {
      return next(new AppError('Access denied. This item is not in your cart.', 403));
    }
    
    await cartModel.removeItem(itemId);
    
    logger.info(`Removed from cart: User ${userId}, Item ${itemId}`);
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    logger.error('Remove from cart error:', error);
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
};