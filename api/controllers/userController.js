const UserModel = require('../models/userModel');

class UserController {
  // GET /api/users - ดึงข้อมูล user ทั้งหมด (admin เท่านั้น)
  static async getAllUsers(req, res) {
    try {
      const users = await UserModel.getAllUsers();
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูล user สำเร็จ',
        data: users,
        count: users.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/users/:id - ดึงข้อมูล user ตาม ID (admin เท่านั้น)
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserModel.getUserById(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `ไม่พบข้อมูล user ID: ${id}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูล user สำเร็จ',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/users/:id - แก้ไขข้อมูล user (admin เท่านั้น)
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      // ตรวจสอบข้อมูลจำเป็น
      if (!userData.username || !userData.email || !userData.full_name) {
        return res.status(400).json({
          success: false,
          message: 'กรุณากรอกข้อมูล: username, email, full_name'
        });
      }

      const updatedUser = await UserModel.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: `ไม่พบข้อมูล user ID: ${id}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'แก้ไขข้อมูล user สำเร็จ',
        data: updatedUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/users/:id - ลบ user (admin เท่านั้น)
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      // ป้องกันไม่ให้ admin ลบตัวเอง
      if (req.user && req.user.id == id) {
        return res.status(400).json({
          success: false,
          message: 'ไม่สามารถลบตัวเองได้'
        });
      }

      const deletedUser = await UserModel.deleteUser(id);
      
      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: `ไม่พบข้อมูล user ID: ${id}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'ลบ user สำเร็จ',
        data: deletedUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/users/:id/password - เปลี่ยนรหัสผ่าน (ต้อง login + สิทธิ์พิเศษ)
  static async changePassword(req, res) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      
      // ตรวจสอบสิทธิ์: admin เปลี่ยนได้ทุกคน, user ธรรมดาเปลี่ยนได้แค่ตัวเอง
      if (req.user.role !== 'admin' && req.user.id != id) {
        return res.status(403).json({
          success: false,
          message: 'ไม่มีสิทธิ์เปลี่ยนรหัสผ่านของผู้อื่น'
        });
      }
      
      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: 'กรุณากรอกรหัสผ่านใหม่'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
        });
      }

      const result = await UserModel.changePassword(id, newPassword);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: `ไม่พบข้อมูล user ID: ${id}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'เปลี่ยนรหัสผ่านสำเร็จ'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/users/profile/me - ดูข้อมูลตัวเอง (ต้อง login)
  static async getMyProfile(req, res) {
    try {
      // ได้ user มาจาก middleware แล้ว
      const user = await UserModel.getUserById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบข้อมูลผู้ใช้'
        });
      }

      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลโปรไฟล์สำเร็จ',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/users/profile/me - แก้ไขข้อมูลตัวเอง (เพิ่มเติม)
  static async updateMyProfile(req, res) {
    try {
      const userData = req.body;
      const userId = req.user.id;
      
      // จำกัดฟิลด์ที่ user ธรรมดาแก้ไขได้
      const allowedFields = {
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name
      };
      
      // ตรวจสอบข้อมูลจำเป็น
      if (!allowedFields.username || !allowedFields.email || !allowedFields.full_name) {
        return res.status(400).json({
          success: false,
          message: 'กรุณากรอกข้อมูล: username, email, full_name'
        });
      }

      const updatedUser = await UserModel.updateUser(userId, {
        ...allowedFields,
        role: req.user.role, // คงค่าเดิม
        is_active: req.user.is_active // คงค่าเดิม
      });

      res.status(200).json({
        success: true,
        message: 'แก้ไขข้อมูลโปรไฟล์สำเร็จ',
        data: updatedUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = UserController;