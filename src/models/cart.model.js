const pool = require('../config/db');

// ---------- CART ----------
const findOrCreateByUserId = async (userId) => {
  // Check if cart exists
  let cart = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
  
  if (cart.rows.length === 0) {
    // Create new cart
    cart = await pool.query(
      'INSERT INTO carts (user_id) VALUES ($1) RETURNING *',
      [userId]
    );
  }
  
  return cart.rows[0];
};

const getCartWithItems = async (userId) => {
  const cartQuery = 'SELECT * FROM carts WHERE user_id = $1';
  const cartResult = await pool.query(cartQuery, [userId]);
  
  if (cartResult.rows.length === 0) {
    return { cart: null, items: [] };
  }
  
  const cart = cartResult.rows[0];
  
  const itemsQuery = `
    SELECT 
      ci.id,
      ci.quantity,
      ci.created_at,
      p.id as product_id,
      p.name,
      p.price,
      p.image_url,
      p.stock_quantity
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.cart_id = $1
  `;
  const itemsResult = await pool.query(itemsQuery, [cart.id]);
  
  return { cart, items: itemsResult.rows };
};

const clearCart = async (cartId) => {
  await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
};

// ---------- CART ITEMS ----------
const addItem = async (cartId, productId, quantity) => {
  // Check if item already exists
  const existingQuery = 'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2';
  const existingResult = await pool.query(existingQuery, [cartId, productId]);
  
  if (existingResult.rows.length > 0) {
    // Update quantity
    const updateQuery = `
      UPDATE cart_items 
      SET quantity = quantity + $1 
      WHERE cart_id = $2 AND product_id = $3 
      RETURNING *
    `;
    const result = await pool.query(updateQuery, [quantity, cartId, productId]);
    return result.rows[0];
  } else {
    // Insert new item
    const insertQuery = `
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(insertQuery, [cartId, productId, quantity]);
    return result.rows[0];
  }
};

const updateItemQuantity = async (itemId, quantity) => {
  const query = `
    UPDATE cart_items 
    SET quantity = $1 
    WHERE id = $2 
    RETURNING *
  `;
  const result = await pool.query(query, [quantity, itemId]);
  return result.rows[0];
};

const removeItem = async (itemId) => {
  const query = 'DELETE FROM cart_items WHERE id = $1 RETURNING id';
  const result = await pool.query(query, [itemId]);
  return result.rows[0];
};

const getItemById = async (itemId) => {
  const query = `
    SELECT ci.*, p.stock_quantity 
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.id = $1
  `;
  const result = await pool.query(query, [itemId]);
  return result.rows[0];
};

module.exports = {
  findOrCreateByUserId,
  getCartWithItems,
  clearCart,
  addItem,
  updateItemQuantity,
  removeItem,
  getItemById,
};