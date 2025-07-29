const { Pool } = require('pg');
require('dotenv').config();

// สร้าง connection pool (เหมือนสระว่ายน้ำที่มีการเชื่อมต่อหลายๆ อัน)
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // จำนวน connection สูงสุด
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ทดสอบการเชื่อมต่อ
pool.on('connect', () => {
  console.log('✅ เชื่อมต่อ PostgreSQL สำเร็จ!');
});

pool.on('error', (err) => {
  console.error('❌ เกิดข้อผิดพลาดกับ database:', err);
});

module.exports = pool;