const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// หน้าแรก
app.get('/', (req, res) => {
  res.json({
    message: '🔐 ยินดีต้อนรับสู่ User Authentication API (MariaDB)!',
    status: 'Server รันปกติ',
    database: 'MariaDB/MySQL',
    timestamp: new Date().toISOString(),
    endpoints: {
      // Authentication endpoints
      'POST /api/auth/register': 'สมัครสมาชิก',
      'POST /api/auth/login': 'เข้าสู่ระบบ',
      'POST /api/auth/verify': 'ตรวจสอบ token',
      
      // User management endpoints
      'GET /api/users': 'ดึงข้อมูล user ทั้งหมด (admin only)',
      'GET /api/users/:id': 'ดึงข้อมูล user ตาม ID (admin only)',
      'PUT /api/users/:id': 'แก้ไขข้อมูล user (admin only)',
      'DELETE /api/users/:id': 'ลบ user (admin only)',
      'PUT /api/users/:id/password': 'เปลี่ยนรหัสผ่าน',
      'GET /api/users/profile/me': 'ดูข้อมูลตัวเอง (ต้องใช้ token)',
      'PUT /api/users/profile/me': 'แก้ไขข้อมูลตัวเอง (ต้องใช้ token)'
    },
    example_usage: {
      register: {
        method: 'POST',
        url: '/api/auth/register',
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: '123456',
          full_name: 'ทดสอบ ผู้ใช้'
        }
      },
      login: {
        method: 'POST',
        url: '/api/auth/login',
        body: {
          username: 'testuser',
          password: '123456'
        }
      }
    }
  });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({
      success: isConnected,
      message: isConnected ? 'เชื่อมต่อ MariaDB สำเร็จ' : 'เชื่อมต่อ MariaDB ไม่สำเร็จ',
      database: 'MariaDB/MySQL',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      database: 'MariaDB/MySQL',
      timestamp: new Date().toISOString()
    });
  }
});

// ตัวอย่างการใช้งาน API
app.get('/example', (req, res) => {
  res.json({
    message: '📚 ตัวอย่างการใช้งาน API (MariaDB)',
    steps: [
      {
        step: 1,
        description: 'สมัครสมาชิก',
        method: 'POST',
        url: `http://localhost:${PORT}/api/auth/register`,
        body: {
          username: 'newuser',
          email: 'newuser@test.com',
          password: '123456',
          full_name: 'ผู้ใช้ใหม่'
        }
      },
      {
        step: 2,
        description: 'เข้าสู่ระบบ',
        method: 'POST',
        url: `http://localhost:${PORT}/api/auth/login`,
        body: {
          username: 'newuser',
          password: '123456'
        },
        note: 'จะได้ token กลับมา'
      },
      {
        step: 3,
        description: 'ใช้ token ใน header',
        header: 'Authorization: Bearer YOUR_TOKEN_HERE',
        note: 'ใส่ token ใน header เมื่อเรียก API ที่ต้องการ authentication'
      }
    ],
    default_users: [
      { username: 'admin', password: '123456', role: 'admin' },
      { username: 'john', password: '123456', role: 'user' },
      { username: 'mary', password: '123456', role: 'user' }
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - ไม่พบเส้นทาง: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: `ไม่พบเส้นทาง API: ${req.method} ${req.path}`,
    availableEndpoints: [
      'GET /',
      'GET /test-db',
      'GET /example',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/verify',
      'GET /api/users',
      'GET /api/users/:id',
      'PUT /api/users/:id',
      'DELETE /api/users/:id',
      'GET /api/users/profile/me',
      'PUT /api/users/profile/me'
    ]
  });
});

// เริ่มต้น server
async function startServer() {
  try {
    console.log('🚀 กำลังเริ่มต้น User Authentication API Server (MariaDB)...');
    console.log('=======================================================');
    
    // ทดสอบการเชื่อมต่อ MariaDB ก่อน
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ ไม่สามารถเชื่อมต่อ MariaDB ได้');
      console.error('   Server จะรันต่อไป แต่ API จะใช้งานไม่ได้');
      console.error('   กรุณาแก้ไขการตั้งค่า MariaDB');
    }
    
    app.listen(PORT, () => {
      console.log('=======================================================');
      console.log(`🚀 Server รันที่ http://localhost:${PORT}`);
      console.log(`📋 API Documentation: http://localhost:${PORT}`);
      console.log(`📚 ตัวอย่างการใช้งาน: http://localhost:${PORT}/example`);
      console.log(`🧪 ทดสอบ MariaDB: http://localhost:${PORT}/test-db`);
      console.log('=======================================================');
      console.log('🔐 ลองทดสอบ API:');
      console.log(`   Register: POST http://localhost:${PORT}/api/auth/register`);
      console.log(`   Login:    POST http://localhost:${PORT}/api/auth/login`);
      console.log(`   Users:    GET  http://localhost:${PORT}/api/users`);
      console.log('=======================================================');
      
      if (isConnected) {
        console.log('✅ พร้อมใช้งาน - MariaDB เชื่อมต่อสำเร็จ!');
      } else {
        console.log('⚠️  Server รัน แต่ MariaDB ไม่พร้อม!');
      }
    });
    
  } catch (error) {
    console.error('💥 ไม่สามารถเริ่มต้น server ได้:', error);
    process.exit(1);
  }
}

startServer();