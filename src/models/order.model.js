const pool = require('../config/db');

const createOrder = async (userId, items, totalAmount, stripePaymentId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Create order
    const orderQuery = `
      INSERT INTO orders (user_id, total_amount, stripe_payment_id, status)
      VALUES ($1, $2, $3, 'paid')
      RETURNING *
    `;
    const orderResult = await client.query(orderQuery, [userId, totalAmount, stripePaymentId]);
    const order = orderResult.rows[0];

    // 2. Create order items & decrement stock
    for (const item of items) {
      // Insert order item
      const itemQuery = `
        INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(itemQuery, [order.id, item.product_id, item.quantity, item.price]);

      // Decrement stock
      const stockQuery = `
        UPDATE products
        SET stock_quantity = stock_quantity - $1
        WHERE id = $2 AND stock_quantity >= $1
        RETURNING stock_quantity
      `;
      const stockResult = await client.query(stockQuery, [item.quantity, item.product_id]);

      if (stockResult.rows.length === 0) {
        throw new Error(`Insufficient stock for product ID ${item.product_id}`);
      }
    }

    // 3. Clear cart
    const cartQuery = 'SELECT id FROM carts WHERE user_id = $1';
    const cartResult = await client.query(cartQuery, [userId]);
    if (cartResult.rows.length > 0) {
      await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartResult.rows[0].id]);
    }

    await client.query('COMMIT');
    return order;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const findByUserId = async (userId) => {
  const query = `
    SELECT id, user_id, total_amount, status, stripe_payment_id, created_at
    FROM orders
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

const findById = async (id) => {
  const orderQuery = `
    SELECT id, user_id, total_amount, status, stripe_payment_id, created_at
    FROM orders
    WHERE id = $1
  `;
  const orderResult = await pool.query(orderQuery, [id]);

  if (orderResult.rows.length === 0) return null;

  const order = orderResult.rows[0];

  const itemsQuery = `
    SELECT oi.id, oi.quantity, oi.price_at_purchase,
           p.id as product_id, p.name, p.image_url
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = $1
  `;
  const itemsResult = await pool.query(itemsQuery, [id]);
  order.items = itemsResult.rows;

  return order;
};

const findAll = async () => {
  const query = `
    SELECT id, user_id, total_amount, status, stripe_payment_id, created_at
    FROM orders
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const updateStatus = async (id, status) => {
  const query = `
    UPDATE orders
    SET status = $1
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [status, id]);
  return result.rows[0];
};

module.exports = {
  createOrder,
  findByUserId,
  findById,
  findAll,
  updateStatus,
};