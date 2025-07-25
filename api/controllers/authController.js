const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

class AuthController {
  // POST /api/auth/register - สมัครสมาชิก
  static async register(req, res) {
    try {
      const { username, email, password, full_name } = req.body;
      
      // ตรวจสอบข้อมูลจำเป็น
      if (!username || !email || !password || !full_name) {
        return res.status(400).json({
          success: false,
          message: 'กรุณากรอกข้อมูล: username, email, password, full_name'
        });
      }

      // ตรวจสอบความยาวรหัสผ่าน
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
        });
      }

      // ตรวจสอบว่า username หรือ email ถูกใช้แล้วหรือไม่
      const existingUser = await UserModel.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username นี้ถูกใช้แล้ว'
        });
      }

      const existingEmail = await UserModel.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email นี้ถูกใช้แล้ว'
        });
      }

      // สร้าง user ใหม่
      const newUser = await UserModel.createUser({
        username,
        email,
        password,
        full_name
      });

      res.status(201).json({
        success: true,
        message: 'สมัครสมาชิกสำเร็จ',
        data: newUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/auth/login - เข้าสู่ระบบ
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      // ตรวจสอบข้อมูลจำเป็น
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'กรุณากรอก username และ password'
        });
      }

      // ค้นหา user
      const user = await UserModel.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Username หรือ Password ไม่ถูกต้อง'
        });
      }

      // ตรวจสอบว่า user ถูก block หรือไม่
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'บัญชีของคุณถูกระงับ กรุณาติดต่อผู้ดูแลระบบ'
        });
      }

      // ตรวจสอบรหัสผ่าน
      const isPasswordValid = await UserModel.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Username หรือ Password ไม่ถูกต้อง'
        });
      }

      // สร้าง JWT Token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' } // Token หมดอายุใน 24 ชม.
      );

      // ส่งข้อมูล user (ไม่รวม password)
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        message: 'เข้าสู่ระบบสำเร็จ',
        data: {
          user: userWithoutPassword,
          token: token
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/auth/verify - ตรวจสอบ token
  static async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'ไม่พบ token'
        });
      }

      // ตรวจสอบ token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // ดึงข้อมูล user ล่าสุดจาก database
      const user = await UserModel.getUserById(decoded.id);
      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Token ไม่ถูกต้อง'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Token ถูกต้อง',
        data: {
          user: user,
          decoded: decoded
        }
      });
    } catch (error) {
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

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = AuthController;