// test_final.js - แก้ไข prepared statement สำหรับ MariaDB
require('dotenv').config();
const mysql = require('mysql2');

async function testFinal() {
  console.log('🚀 ทดสอบ MariaDB + สร้างตาราง users');
  console.log('=====================================');
  
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'skill68' // เชื่อมต่อตรงเข้า skill68 เลย
  }).promise();
  
  try {
    console.log('🔌 เชื่อมต่อ MariaDB database skill68...');
    
    // ทดสอบ connection
    const [timeResult] = await connection.execute('SELECT NOW() as time_now');
    console.log('✅ เชื่อมต่อสำเร็จ!');
    console.log('⏰ เวลาปัจจุบัน:', timeResult[0].time_now);
    
    // ตรวจสอบตาราง users
    console.log('\n🔍 ตรวจสอบตาราง users...');
    
    try {
      const [tables] = await connection.execute("SHOW TABLES LIKE 'users'");
      
      if (tables.length === 0) {
        console.log('❌ ไม่พบตาราง users - กำลังสร้าง...');
        
        // สร้างตาราง users
        const createTableSQL = `
          CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            role VARCHAR(20) DEFAULT 'user',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await connection.execute(createTableSQL);
        console.log('✅ สร้างตาราง users สำเร็จ!');
        
        // เพิ่มข้อมูลตัวอย่าง
        console.log('➕ เพิ่มข้อมูลตัวอย่าง...');
        
        const insertSQL = `
          INSERT INTO users (username, email, password, full_name, role) VALUES 
          ('admin', 'admin@test.com', '$2a$10$8K1p/a0dRTUXw/QCZ52yJeO5BZ/7VgU7LY2Cj9E3kN7qQ9z8W1X4S', 'ผู้ดูแลระบบ', 'admin'),
          ('john', 'john@test.com', '$2a$10$8K1p/a0dRTUXw/QCZ52yJeO5BZ/7VgU7LY2Cj9E3kN7qQ9z8W1X4S', 'จอห์น สมิธ', 'user'),
          ('mary', 'mary@test.com', '$2a$10$8K1p/a0dRTUXw/QCZ52yJeO5BZ/7VgU7LY2Cj9E3kN7qQ9z8W1X4S', 'แมรี่ โจนส์', 'user')
        `;
        
        await connection.execute(insertSQL);
        console.log('✅ เพิ่มข้อมูลตัวอย่างสำเร็จ!');
        
        // สร้าง index
        await connection.execute('CREATE INDEX idx_users_username ON users(username)');
        await connection.execute('CREATE INDEX idx_users_email ON users(email)');
        await connection.execute('CREATE INDEX idx_users_role ON users(role)');
        console.log('✅ สร้าง index สำเร็จ!');
        
      } else {
        console.log('✅ พบตาราง users แล้ว');
      }
      
      // นับจำนวน users
      const [count] = await connection.execute('SELECT COUNT(*) as total FROM users');
      console.log(`👥 จำนวน users: ${count[0].total} คน`);
      
      // แสดงรายชื่อ users
      if (count[0].total > 0) {
        const [userList] = await connection.execute('SELECT username, email, role FROM users');
        console.log('📋 รายชื่อ users:');
        userList.forEach(user => {
          console.log(`   - ${user.username} (${user.email}) - ${user.role}`);
        });
      }
      
      // ตรวจสอบโครงสร้างตาราง
      console.log('\n📊 โครงสร้างตาราง users:');
      const [columns] = await connection.execute('DESCRIBE users');
      columns.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''} ${col.Key ? `(${col.Key})` : ''}`);
      });
      
    } catch (tableError) {
      console.error('❌ เกิดข้อผิดพลาดกับตาราง:', tableError.message);
    }
    
    console.log('\n🎉 Setup เสร็จสิ้น! MariaDB พร้อมใช้งาน');
    console.log('🚀 ตอนนี้สามารถรัน server ได้แล้ว: npm start');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  } finally {
    await connection.end();
    console.log('👋 ปิดการเชื่อมต่อแล้ว');
  }
}

testFinal();