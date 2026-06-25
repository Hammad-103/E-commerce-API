const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => console.log('📦 Connected to PostgreSQL (Neon)'));
pool.on('error', (err) => console.error('❌ Unexpected DB error', err));

module.exports = pool;