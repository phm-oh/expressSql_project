// test_mariadb.js - สคริปต์ทดสอบการเชื่อมต่อ MariaDB
const { pool, testConnection } = require('./config/database');

async function runTest() {
  console.log('🚀 เริ่มต้นทดสอบ MariaDB Connection');
  console.log('================================');
  
  // ทดสอบการเชื่อมต่อ
  const isConnected = await testConnection();
  
  if (!isConnected) {
    console.log('❌ ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบการตั้งค่า');
    process.exit(1);
  }
  
  try {
    // ทดสอบการสร้างตาราง (ถ้ายังไม่มี)
    console.log('\n📋 ทดสอบการสร้างตาราง users...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await pool.execute(createTableQuery);
    console.log('✅ สร้างตาราง users สำเร็จ (หรือมีอยู่แล้ว)');
    
    // ตรวจสอบโครงสร้างตาราง
    console.log('\n🔍 ตรวจสอบโครงสร้างตาราง...');
    const [columns] = await pool.execute('DESCRIBE users');
    console.log('📊 โครงสร้างตาราง users:');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''} ${col.Key ? `(${col.Key})` : ''}`);
    });
    
    // ตรวจสอบข้อมูลในตาราง
    console.log('\n📈 ตรวจสอบข้อมูลในตาราง...');
    const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
    console.log(`👥 จำนวน users ในตาราง: ${users[0].count} คน`);
    
    if (users[0].count > 0) {
      const [userList] = await pool.execute('SELECT username, email, role FROM users LIMIT 5');
      console.log('👤 รายชื่อ users:');
      userList.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - ${user.role}`);
      });
    }
    
    console.log('\n✅ ทดสอบทั้งหมดสำเร็จ!');
    console.log('🎉 MariaDB พร้อมใช้งาน!');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการทดสอบ:', error.message);
  }
  
  // ปิด connection pool
  await pool.end();
  console.log('👋 ปิดการเชื่อมต่อแล้ว');
}

// รันทดสอบ
runTest();