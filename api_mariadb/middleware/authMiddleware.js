const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// Middleware ตรวจสอบ token (ใช้เมื่อต้องการ)
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'ไม่พบ access token'
      });
    }

    // ตรวจสอบ token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ดึงข้อมูล user ล่าสุดจาก database
    const user = await UserModel.getUserById(decoded.id);
    
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Token ไม่ถูกต้องหรือผู้ใช้ถูกระงับ'
      });
    }

    // เก็บข้อมูล user ไว้ใน req เพื่อใช้ใน controller
    req.user = user;
    console.log(`✅ Authentication success: ${user.username} (${user.role})`);
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token หมดอายุ กรุณาเข้าสู่ระบบใหม่'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token ไม่ถูกต้อง'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบ token'
    });
  }
};

// Middleware ตรวจสอบสิทธิ์ admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'ต้องเข้าสู่ระบบก่อน'
    });
  }

  if (req.user.role !== 'admin') {
    console.log(`❌ Access denied: ${req.user.username} is not admin`);
    return res.status(403).json({
      success: false,
      message: 'ไม่มีสิทธิ์เข้าถึง (admin only)'
    });
  }

  console.log(`✅ Admin access granted: ${req.user.username}`);
  next();
};

// วิธีใช้งาน:
// 1. ใส่ในไฟล์ routes ที่ต้องการ authentication
// const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
// 
// 2. ใช้กับ route ที่ต้องการ
// router.get('/protected', authenticateToken, controller.someMethod);
// router.get('/admin-only', authenticateToken, requireAdmin, controller.adminMethod);

module.exports = {
  authenticateToken,
  requireAdmin
};