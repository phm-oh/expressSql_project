const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
  // ดึงข้อมูล user ทั้งหมด (สำหรับ admin)
  static async getAllUsers() {
    try {
      console.log('📊 กำลังดึงข้อมูล user ทั้งหมด...');
      const [rows] = await pool.execute(
        'SELECT id, username, email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC'
      );
      console.log(`✅ ดึงข้อมูล user สำเร็จ: ${rows.length} คน`);
      return rows;
    } catch (error) {
      console.error('❌ ดึงข้อมูล user ไม่สำเร็จ:', error.message);
      throw new Error(`ดึงข้อมูล user ไม่สำเร็จ: ${error.message}`);
    }
  }

  // ดึงข้อมูล user ตาม ID
  static async getUserById(id) {
    try {
      console.log(`🔍 กำลังค้นหา user ID: ${id}`);
      const [rows] = await pool.execute(
        'SELECT id, username, email, full_name, role, is_active, created_at FROM users WHERE id = ?',
        [id]
      );
      const user = rows[0] || null;
      console.log(user ? `✅ พบ user: ${user.username}` : `❌ ไม่พบ user ID: ${id}`);
      return user;
    } catch (error) {
      console.error(`❌ ค้นหา user ID ${id} ไม่สำเร็จ:`, error.message);
      throw new Error(`ดึงข้อมูล user ไม่สำเร็จ: ${error.message}`);
    }
  }

  // ค้นหา user โดย username (สำหรับ login)
  static async getUserByUsername(username) {
    try {
      console.log(`🔍 กำลังค้นหา user: ${username}`);
      const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0] || null;
    } catch (error) {
      console.error(`❌ ค้นหา user ${username} ไม่สำเร็จ:`, error.message);
      throw new Error(`ค้นหา user ไม่สำเร็จ: ${error.message}`);
    }
  }

  // ค้นหา user โดย email
  static async getUserByEmail(email) {
    try {
      const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0] || null;
    } catch (error) {
      console.error(`❌ ค้นหา email ${email} ไม่สำเร็จ:`, error.message);
      throw new Error(`ค้นหา email ไม่สำเร็จ: ${error.message}`);
    }
  }

  // สร้าง user ใหม่ (register)
  static async createUser(userData) {
    const { username, email, password, full_name, role = 'user' } = userData;
    
    try {
      console.log(`➕ กำลังสร้าง user ใหม่: ${username}`);
      
      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await pool.execute(
        `INSERT INTO users (username, email, password, full_name, role) 
         VALUES (?, ?, ?, ?, ?)`,
        [username, email, hashedPassword, full_name, role]
      );
      
      // ดึงข้อมูล user ที่เพิ่งสร้าง
      const [newUser] = await pool.execute(
        'SELECT id, username, email, full_name, role, is_active, created_at FROM users WHERE id = ?',
        [result.insertId]
      );
      
      console.log(`✅ สร้าง user สำเร็จ: ${newUser[0].username} (ID: ${newUser[0].id})`);
      return newUser[0];
    } catch (error) {
      console.error(`❌ สร้าง user ไม่สำเร็จ:`, error.message);
      
      // ตรวจสอบ error แบบละเอียด
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('username')) {
          throw new Error('Username นี้ถูกใช้แล้ว');
        }
        if (error.message.includes('email')) {
          throw new Error('Email นี้ถูกใช้แล้ว');
        }
      }
      throw new Error(`สร้าง user ไม่สำเร็จ: ${error.message}`);
    }
  }

  // อัพเดท user
  static async updateUser(id, userData) {
    const { username, email, full_name, role, is_active } = userData;
    
    try {
      console.log(`📝 กำลังแก้ไข user ID: ${id}`);
      const [result] = await pool.execute(
        `UPDATE users 
         SET username = ?, email = ?, full_name = ?, role = ?, is_active = ?
         WHERE id = ?`,
        [username, email, full_name, role, is_active, id]
      );
      
      if (result.affectedRows === 0) {
        console.log(`❌ ไม่พบ user ID: ${id}`);
        return null;
      }
      
      // ดึงข้อมูล user ที่แก้ไขแล้ว
      const [updatedUser] = await pool.execute(
        'SELECT id, username, email, full_name, role, is_active, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );
      
      console.log(`✅ แก้ไข user สำเร็จ: ${updatedUser[0].username}`);
      return updatedUser[0];
    } catch (error) {
      console.error(`❌ แก้ไข user ID ${id} ไม่สำเร็จ:`, error.message);
      
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('username')) {
          throw new Error('Username นี้ถูกใช้แล้ว');
        }
        if (error.message.includes('email')) {
          throw new Error('Email นี้ถูกใช้แล้ว');
        }
      }
      throw new Error(`แก้ไข user ไม่สำเร็จ: ${error.message}`);
    }
  }

  // ลบ user
  static async deleteUser(id) {
    try {
      console.log(`🗑️ กำลังลบ user ID: ${id}`);
      
      // ดึงข้อมูล user ก่อนลบ
      const [userToDelete] = await pool.execute(
        'SELECT id, username, email, full_name FROM users WHERE id = ?',
        [id]
      );
      
      if (userToDelete.length === 0) {
        console.log(`❌ ไม่พบ user ID: ${id}`);
        return null;
      }
      
      // ลบ user
      const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
      
      if (result.affectedRows > 0) {
        console.log(`✅ ลบ user สำเร็จ: ${userToDelete[0].username}`);
        return userToDelete[0];
      }
      
      return null;
    } catch (error) {
      console.error(`❌ ลบ user ID ${id} ไม่สำเร็จ:`, error.message);
      throw new Error(`ลบ user ไม่สำเร็จ: ${error.message}`);
    }
  }

  // เปลี่ยนรหัสผ่าน
  static async changePassword(id, newPassword) {
    try {
      console.log(`🔐 กำลังเปลี่ยนรหัสผ่าน user ID: ${id}`);
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const [result] = await pool.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, id]
      );
      
      if (result.affectedRows === 0) {
        console.log(`❌ ไม่พบ user ID: ${id}`);
        return null;
      }
      
      // ดึงข้อมูล user
      const [user] = await pool.execute(
        'SELECT id, username FROM users WHERE id = ?',
        [id]
      );
      
      console.log(`✅ เปลี่ยนรหัสผ่านสำเร็จ: ${user[0].username}`);
      return user[0];
    } catch (error) {
      console.error(`❌ เปลี่ยนรหัสผ่าน user ID ${id} ไม่สำเร็จ:`, error.message);
      throw new Error(`เปลี่ยนรหัสผ่านไม่สำเร็จ: ${error.message}`);
    }
  }

  // ตรวจสอบรหัสผ่าน
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = UserModel;