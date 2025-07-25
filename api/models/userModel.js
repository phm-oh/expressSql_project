const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
  // ดึงข้อมูล user ทั้งหมด (สำหรับ admin)
  static async getAllUsers() {
    const client = await pool.connect();
    try {
      console.log('📊 กำลังดึงข้อมูล user ทั้งหมด...');
      const result = await client.query(
        'SELECT id, username, email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC'
      );
      console.log(`✅ ดึงข้อมูล user สำเร็จ: ${result.rows.length} คน`);
      return result.rows;
    } catch (error) {
      console.error('❌ ดึงข้อมูล user ไม่สำเร็จ:', error.message);
      throw new Error(`ดึงข้อมูล user ไม่สำเร็จ: ${error.message}`);
    } finally {
      client.release();
    }
  }

  // ดึงข้อมูล user ตาม ID
  static async getUserById(id) {
    const client = await pool.connect();
    try {
      console.log(`🔍 กำลังค้นหา user ID: ${id}`);
      const result = await client.query(
        'SELECT id, username, email, full_name, role, is_active, created_at FROM users WHERE id = $1',
        [id]
      );
      const user = result.rows[0] || null;
      console.log(user ? `✅ พบ user: ${user.username}` : `❌ ไม่พบ user ID: ${id}`);
      return user;
    } catch (error) {
      console.error(`❌ ค้นหา user ID ${id} ไม่สำเร็จ:`, error.message);
      throw new Error(`ดึงข้อมูล user ไม่สำเร็จ: ${error.message}`);
    } finally {
      client.release();
    }
  }

  // ค้นหา user โดย username (สำหรับ login)
  static async getUserByUsername(username) {
    const client = await pool.connect();
    try {
      console.log(`🔍 กำลังค้นหา user: ${username}`);
      const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`❌ ค้นหา user ${username} ไม่สำเร็จ:`, error.message);
      throw new Error(`ค้นหา user ไม่สำเร็จ: ${error.message}`);
    } finally {
      client.release();
    }
  }

  // ค้นหา user โดย email
  static async getUserByEmail(email) {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`❌ ค้นหา email ${email} ไม่สำเร็จ:`, error.message);
      throw new Error(`ค้นหา email ไม่สำเร็จ: ${error.message}`);
    } finally {
      client.release();
    }
  }

  // สร้าง user ใหม่ (register)
  static async createUser(userData) {
    const { username, email, password, full_name, role = 'user' } = userData;
    const client = await pool.connect();
    
    try {
      console.log(`➕ กำลังสร้าง user ใหม่: ${username}`);
      
      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await client.query(
        `INSERT INTO users (username, email, password, full_name, role) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, username, email, full_name, role, is_active, created_at`,
        [username, email, hashedPassword, full_name, role]
      );
      
      console.log(`✅ สร้าง user สำเร็จ: ${result.rows[0].username} (ID: ${result.rows[0].id})`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ สร้าง user ไม่สำเร็จ:`, error.message);
      
      // ตรวจสอบ error แบบละเอียด
      if (error.code === '23505') {
        if (error.constraint.includes('username')) {
          throw new Error('Username นี้ถูกใช้แล้ว');
        }
        if (error.constraint.includes('email')) {
          throw new Error('Email นี้ถูกใช้แล้ว');
        }
      }
      throw new Error(`สร้าง user ไม่สำเร็จ: ${error.message}`);
    } finally {
      client.release();
    }
  }

  // อัพเดท user
  static async updateUser(id, userData) {
    const { username, email, full_name, role, is_active } = userData;
    const client = await pool.connect();
    
    try {
      console.log(`📝 กำลังแก้ไข user ID: ${id}`);
      const result = await client.query(
        `UPDATE users 
         SET username = $1, email = $2, full_name = $3, role = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6 
         RETURNING id, username, email, full_name, role, is_active, created_at, updated_at`,
        [username, email, full_name, role, is_active, id]
      );
      
      const user = result.rows[0] || null;
      console.log(user ? `✅ แก้ไข user สำเร็จ: ${user.username}` : `❌ ไม่พบ user ID: ${id}`);
      return user;
    } catch (error) {
      console.error(`❌ แก้ไข user ID ${id} ไม่สำเร็จ:`, error.message);
      
      if (error.code === '23505') {
        if (error.constraint.includes('username')) {
          throw new Error('Username นี้ถูกใช้แล้ว');
        }
        if (error.constraint.includes('email')) {
          throw new Error('Email นี้ถูกใช้แล้ว');
        }
      }
      throw new Error(`แก้ไข user ไม่สำเร็จ: ${error.message}`);
    } finally {
      client.release();
    }
  }

  // ลบ user
  static async deleteUser(id) {
    const client = await pool.connect();
    try {
      console.log(`🗑️ กำลังลบ user ID: ${id}`);
      const result = await client.query(
        'DELETE FROM users WHERE id = $1 RETURNING id, username, email, full_name',
        [id]
      );
      const user = result.rows[0] || null;
      console.log(user ? `✅ ลบ user สำเร็จ: ${user.username}` : `❌ ไม่พบ user ID: ${id}`);
      return user;
    } catch (error) {
      console.error(`❌ ลบ user ID ${id} ไม่สำเร็จ:`, error.message);
      throw new Error(`ลบ user ไม่สำเร็จ: ${error.message}`);
    } finally {
      client.release();
    }
  }

  // เปลี่ยนรหัสผ่าน
  static async changePassword(id, newPassword) {
    const client = await pool.connect();
    try {
      console.log(`🔐 กำลังเปลี่ยนรหัสผ่าน user ID: ${id}`);
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const result = await client.query(
        'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username',
        [hashedPassword, id]
      );
      
      const user = result.rows[0] || null;
      console.log(user ? `✅ เปลี่ยนรหัสผ่านสำเร็จ: ${user.username}` : `❌ ไม่พบ user ID: ${id}`);
      return user;
    } catch (error) {
      console.error(`❌ เปลี่ยนรหัสผ่าน user ID ${id} ไม่สำเร็จ:`, error.message);
      throw new Error(`เปลี่ยนรหัสผ่านไม่สำเร็จ: ${error.message}`);
    } finally {
      client.release();
    }
  }

  // ตรวจสอบรหัสผ่าน
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = UserModel;