const orderModel = require('../models/order.model');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await orderModel.findByUserId(userId);

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    logger.error('Get user orders error:', error);
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await orderModel.findById(id);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // BOLA check (ownership)
    if (order.user_id !== userId && userRole !== 'admin') {
      return next(new AppError('Access denied', 403));
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    logger.error('Get order by id error:', error);
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderModel.findAll();
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    logger.error('Get all orders error:', error);
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const order = await orderModel.updateStatus(id, status);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    logger.info(`Order ${id} status updated to ${status}`);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    logger.error('Update order status error:', error);
    next(error);
  }
};

module.exports = {
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};