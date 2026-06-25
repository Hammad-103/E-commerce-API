const pool = require('../config/db');

const findAll = async ({ search = '', limit = 10, offset = 0 } = {}) => {
  const query = `
    SELECT id, name, description, price, stock_quantity, image_url, created_at
    FROM products
    WHERE name ILIKE $1 OR description ILIKE $1
    ORDER BY id DESC
    LIMIT $2 OFFSET $3
  `;
  const values = [`%${search}%`, limit, offset];
  const result = await pool.query(query, values);
  return result.rows;
};

const countAll = async ({ search = '' } = {}) => {
  const query = `
    SELECT COUNT(*) AS total
    FROM products
    WHERE name ILIKE $1 OR description ILIKE $1
  `;
  const result = await pool.query(query, [`%${search}%`]);
  return parseInt(result.rows[0].total);
};

const findById = async (id) => {
  const query = `
    SELECT id, name, description, price, stock_quantity, image_url, created_at
    FROM products WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const create = async ({ name, description, price, stock_quantity, image_url }) => {
  const query = `
    INSERT INTO products (name, description, price, stock_quantity, image_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, description, price, stock_quantity, image_url, created_at
  `;
  const values = [name, description, price, stock_quantity, image_url || null];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const update = async (id, { name, description, price, stock_quantity, image_url }) => {
  const query = `
    UPDATE products
    SET 
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      price = COALESCE($3, price),
      stock_quantity = COALESCE($4, stock_quantity),
      image_url = COALESCE($5, image_url)
    WHERE id = $6
    RETURNING id, name, description, price, stock_quantity, image_url, created_at
  `;
  const values = [name, description, price, stock_quantity, image_url, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const remove = async (id) => {
  const query = `DELETE FROM products WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const decrementStock = async (id, quantity) => {
  const query = `
    UPDATE products
    SET stock_quantity = stock_quantity - $1
    WHERE id = $2 AND stock_quantity >= $1
    RETURNING stock_quantity
  `;
  const result = await pool.query(query, [quantity, id]);
  return result.rows[0];
};

module.exports = { findAll, countAll, findById, create, update, remove, decrementStock };