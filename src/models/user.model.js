const pool = require('../config/db');

const create = async ({ name, email, password_hash, role = 'customer' }) => {
  const query = `
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at
  `;
  const values = [name, email, password_hash, role];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const findByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const findById = async (id) => {
  const query = `SELECT id, name, email, role, created_at FROM users WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const update = async (id, { name, email, role }) => {
  const query = `
    UPDATE users 
    SET name = COALESCE($1, name), email = COALESCE($2, email), role = COALESCE($3, role)
    WHERE id = $4
    RETURNING id, name, email, role, created_at
  `;
  const result = await pool.query(query, [name, email, role, id]);
  return result.rows[0];
};

const remove = async (id) => {
  const query = `DELETE FROM users WHERE id = $1`;
  await pool.query(query, [id]);
};

module.exports = { create, findByEmail, findById, update, remove };