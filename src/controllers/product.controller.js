const productModel = require('../models/product.model');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// ---------- HELPERS ----------
const validateId = (id) => {
  const parsed = parseInt(id);
  if (isNaN(parsed) || parsed <= 0) {
    throw new AppError('Invalid product ID. Must be a positive integer.', 400);
  }
  return parsed;
};

const findProductOrThrow = async (id) => {
  const product = await productModel.findById(id);
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

const parseNumeric = (value) => {
  if (value === undefined || value === null) return undefined;
  return typeof value === 'number' ? value : parseFloat(value);
};

// ---------- CONTROLLERS ----------
const getAllProducts = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      productModel.findAll({ search, limit: parseInt(limit), offset }),
      productModel.countAll({ search })
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get products error:', error);
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    const product = await findProductOrThrow(id);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    logger.error('Get product by id error:', error);
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock_quantity, image_url } = req.body;

    if (!name || !description || price === undefined || stock_quantity === undefined) {
      return next(new AppError('Name, description, price and stock_quantity are required', 400));
    }

    const newProduct = await productModel.create({
      name,
      description,
      price: parseNumeric(price),
      stock_quantity: parseInt(stock_quantity),
      image_url,
    });

    logger.info(`Product created: ${name}`);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    logger.error('Create product error:', error);
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    await findProductOrThrow(id);

    const { name, description, price, stock_quantity, image_url } = req.body;

    const updatedProduct = await productModel.update(id, {
      name,
      description,
      price: parseNumeric(price),
      stock_quantity: stock_quantity !== undefined ? parseInt(stock_quantity) : undefined,
      image_url,
    });

    logger.info(`Product updated: ID ${id}`);
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    logger.error('Update product error:', error);
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    await findProductOrThrow(id);
    await productModel.remove(id);

    logger.info(`Product deleted: ID ${id}`);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    logger.error('Delete product error:', error);
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};