const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const initDatabase = async () => {
  try {
    console.log('📝 Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔨 Creating tables...');
    await pool.query(sql);
    console.log('✅ Database tables created successfully!');

    // Check if admin exists, if not create one
    const adminCheck = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@admin.com']);
    if (adminCheck.rows.length === 0) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
        ['Admin', 'admin@admin.com', hashedPassword, 'admin']
      );
      console.log('👑 Default admin created: admin@admin.com / admin123');
    }

    console.log('🎉 Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
};

initDatabase();