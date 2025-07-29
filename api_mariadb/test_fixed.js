// test_fixed.js - แก้ไข SQL syntax แล้ว
require('dotenv').config();
const mysql = require('mysql2');

async function testConnection() {
  console.log('🚀 ทดสอบการเชื่อมต่อ MariaDB/MySQL (แก้ไขแล้ว)');
  console.log('================================================');
  
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  }).promise();
  
  try {
    console.log('🔌 กำลังทดสอบการเชื่อมต่อ...');
    
    // ทดสอบ query ง่ายๆ ก่อน
    const [timeResult] = await connection.execute('SELECT NOW() as time_now');
    console.log('✅ เชื่อมต่อ MariaDB สำเร็จ!');
    console.log('⏰ เวลาปัจจุบัน:', timeResult[0].time_now);
    
    // ดู version
    const [versionResult] = await connection.execute('SELECT VERSION() as version');
    console.log('📊 เวอร์ชัน:', versionResult[0].version);
    
    // ตรวจสอบ databases
    console.log('\n🔍 ตรวจสอบ databases...');
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('📋 รายชื่อ databases:');
    databases.forEach(db => {
      console.log(`   - ${Object.values(db)[0]}`);
    });
    
    // เช็ค skill68
    const [skill68] = await connection.execute('SHOW DATABASES LIKE ?', ['skill68']);
    
    if (skill68.length === 0) {
      console.log('\n➕ กำลังสร้าง database skill68...');
      await connection.execute('CREATE DATABASE skill68 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
      console.log('✅ สร้าง database skill68 สำเร็จ!');
    } else {
      console.log('\n✅ พบ database skill68 แล้ว');
    }
    
    // เข้าใช้ database skill68
    await connection.execute('USE skill68');
    console.log('🎯 ใช้ database skill68');
    
    // ตรวจสอบตาราง
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📊 ตารางใน skill68:');
    if (tables.length === 0) {
      console.log('   (ยังไม่มีตาราง - ต้องรัน schema.sql)');
    } else {
      tables.forEach(table => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
    }
    
    console.log('\n🎉 ทดสอบเสร็จสิ้น! MariaDB พร้อมใช้งาน');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    console.error('\n💡 วิธีแก้ไข:');
    console.error('   1. เช็ค XAMPP - MySQL เปิดหรือยัง?');
    console.error('   2. ลอง: mysql -u root -p (ใน command line)');
    console.error('   3. เช็ค port 3306 ว่าถูกใช้งานไหม');
  } finally {
    await connection.end();
    console.log('👋 ปิดการเชื่อมต่อแล้ว');
  }
}

testConnection();