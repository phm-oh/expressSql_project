// test_simple.js - ทดสอบการเชื่อมต่อก่อน สร้าง database
require('dotenv').config();
const mysql = require('mysql2');

async function testBasicConnection() {
  console.log('🚀 ทดสอบการเชื่อมต่อ MariaDB/MySQL');
  console.log('===================================');
  
  // เชื่อมต่อแบบไม่ระบุ database ก่อน
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  }).promise();
  
  try {
    console.log('🔌 กำลังทดสอบการเชื่อมต่อ...');
    
    // ทดสอบการเชื่อมต่อ
    const [rows] = await connection.execute('SELECT NOW() as current_time, VERSION() as db_version');
    console.log('✅ เชื่อมต่อ MariaDB สำเร็จ!');
    console.log('⏰ เวลาปัจจุบัน:', rows[0].current_time);
    console.log('📊 เวอร์ชัน:', rows[0].db_version);
    
    // ตรวจสอบว่ามี database skill68 หรือยัง
    console.log('\n🔍 ตรวจสอบ database skill68...');
    const [databases] = await connection.execute('SHOW DATABASES LIKE "skill68"');
    
    if (databases.length === 0) {
      console.log('❌ ไม่พบ database skill68');
      console.log('➕ กำลังสร้าง database skill68...');
      
      await connection.execute('CREATE DATABASE skill68 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
      console.log('✅ สร้าง database skill68 สำเร็จ!');
    } else {
      console.log('✅ พบ database skill68 แล้ว');
    }
    
    // ตรวจสอบตาราง users
    console.log('\n🔍 ตรวจสอบตาราง users...');
    await connection.execute('USE skill68');
    
    try {
      const [tables] = await connection.execute('SHOW TABLES LIKE "users"');
      if (tables.length === 0) {
        console.log('❌ ไม่พบตาราง users');
        console.log('💡 ต้องรัน schema.sql เพื่อสร้างตาราง');
      } else {
        console.log('✅ พบตาราง users แล้ว');
        
        // นับจำนวน users
        const [count] = await connection.execute('SELECT COUNT(*) as total FROM users');
        console.log(`👥 จำนวน users: ${count[0].total} คน`);
      }
    } catch (err) {
      console.log('❌ ไม่พบตาราง users - ต้องสร้างใหม่');
    }
    
    console.log('\n🎉 การทดสอบเสร็จสิ้น!');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    console.error('💡 กรุณาตรวจสอบ:');
    console.error('   1. MariaDB/MySQL เปิดอยู่หรือไม่');
    console.error('   2. username/password ถูกต้องหรือไม่');
    console.error('   3. port 3306 ใช้งานได้หรือไม่');
  } finally {
    await connection.end();
    console.log('👋 ปิดการเชื่อมต่อแล้ว');
  }
}

testBasicConnection();