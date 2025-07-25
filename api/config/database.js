
const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 ตรวจสอบการตั้งค่า Database:');
console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('DB_PORT:', process.env.DB_PORT || 5432);
console.log('DB_NAME:', process.env.DB_NAME || 'zoo_db');
console.log('DB_USER:', process.env.DB_USER || 'postgres');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***มีรหัสผ่าน***' : '❌ไม่มีรหัสผ่าน');

// สร้าง connection pool แบบใหม่
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'zoo_db', 
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ทดสอบการเชื่อมต่อทันทีที่สร้าง pool
async function testConnection() {
  try {
    console.log('🔌 กำลังทดสอบการเชื่อมต่อ PostgreSQL...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log('✅ เชื่อมต่อ PostgreSQL สำเร็จ!');
    console.log('⏰ เวลาปัจจุบัน:', result.rows[0].current_time);
    console.log('📊 เวอร์ชัน PostgreSQL:', result.rows[0].db_version.split(' ')[0]);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ เชื่อมต่อ PostgreSQL ไม่สำเร็จ:', error.message);
    console.error('💡 วิธีแก้ไข:');
    console.error('   1. ตรวจสอบว่า PostgreSQL รันอยู่หรือไม่');
    console.error('   2. ตรวจสอบ .env file');
    console.error('   3. ตรวจสอบรหัสผ่าน postgres user');
    return false;
  }
}

// Event listeners
pool.on('connect', (client) => {
  console.log('🔗 มีการเชื่อมต่อใหม่กับ database');
});

pool.on('error', (err, client) => {
  console.error('💥 เกิดข้อผิดพลาดกับ database connection:', err);
});

pool.on('remove', (client) => {
  console.log('🔌 ตัดการเชื่อมต่อกับ database');
});

// Export pool และ test function
module.exports = {
  pool,
  testConnection
};