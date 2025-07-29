const mysql = require('mysql2');
require('dotenv').config();

console.log('🔍 ตรวจสอบการตั้งค่า MariaDB:');
console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('DB_PORT:', process.env.DB_PORT || 3306);
console.log('DB_NAME:', process.env.DB_NAME || 'skill68');
console.log('DB_USER:', process.env.DB_USER || 'root');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***มีรหัสผ่าน***' : '❌ไม่มีรหัสผ่าน');

// สร้าง connection pool แบบใหม่สำหรับ MariaDB
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'skill68',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
}).promise(); // เพิ่ม .promise() เพื่อใช้ async/await

// ทดสอบการเชื่อมต่อทันทีที่สร้าง pool
async function testConnection() {
  try {
    console.log('🔌 กำลังทดสอบการเชื่อมต่อ MariaDB...');
    
    // ทดสอบด้วย query (แยก query ออกเป็น 2 อัน)
    const [timeRows] = await pool.execute('SELECT NOW() as time_now');
    const [versionRows] = await pool.execute('SELECT VERSION() as version');
    
    console.log('✅ เชื่อมต่อ MariaDB สำเร็จ!');
    console.log('⏰ เวลาปัจจุบัน:', timeRows[0].time_now);
    console.log('📊 เวอร์ชัน MariaDB:', versionRows[0].version);
    
    return true;
  } catch (error) {
    console.error('❌ เชื่อมต่อ MariaDB ไม่สำเร็จ:', error.message);
    console.error('💡 วิธีแก้ไข:');
    console.error('   1. ตรวจสอบว่า MariaDB/MySQL รันอยู่หรือไม่');
    console.error('   2. ตรวจสอบ .env file');
    console.error('   3. ตรวจสอบรหัสผ่าน root user');
    console.error('   4. ตรวจสอบว่า database skill68 ถูกสร้างแล้วหรือยัง');
    return false;
  }
}

// Event listeners สำหรับ debug
pool.on('connection', (connection) => {
  console.log('🔗 มีการเชื่อมต่อใหม่กับ MariaDB connection ID:', connection.threadId);
});

pool.on('error', (err) => {
  console.error('💥 เกิดข้อผิดพลาดกับ MariaDB connection pool:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 พยายามเชื่อมต่อใหม่...');
  }
});

// Export pool และ test function
module.exports = {
  pool,
  testConnection
};