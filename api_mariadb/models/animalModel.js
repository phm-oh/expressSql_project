const { pool } = require('../config/database');

class AnimalModel {
  // ดึงข้อมูลทั้งหมด
  static async getAllAnimals() {
    try {
      console.log('📊 กำลังดึงข้อมูลสัตว์ทั้งหมด...');
      const [rows] = await pool.execute('SELECT * FROM animals ORDER BY created_at DESC');
      console.log(`✅ ดึงข้อมูลสัตว์สำเร็จ: ${rows.length} รายการ`);
      return rows;
    } catch (error) {
      console.error('❌ ดึงข้อมูลสัตว์ไม่สำเร็จ:', error.message);
      throw new Error(`ดึงข้อมูลสัตว์ไม่สำเร็จ: ${error.message}`);
    }
  }

  // ดึงข้อมูลตาม ID
  static async getAnimalById(id) {
    try {
      console.log(`🔍 กำลังค้นหาสัตว์ ID: ${id}`);
      const [rows] = await pool.execute('SELECT * FROM animals WHERE id = ?', [id]);
      const animal = rows[0] || null;
      console.log(animal ? `✅ พบสัตว์: ${animal.name}` : `❌ ไม่พบสัตว์ ID: ${id}`);
      return animal;
    } catch (error) {
      console.error(`❌ ค้นหาสัตว์ ID ${id} ไม่สำเร็จ:`, error.message);
      throw new Error(`ดึงข้อมูลสัตว์ ID ${id} ไม่สำเร็จ: ${error.message}`);
    }
  }

  // เพิ่มข้อมูลใหม่
  static async createAnimal(animalData) {
    const { name, species, age, habitat, weight, is_endangered } = animalData;
    
    try {
      console.log(`➕ กำลังเพิ่มสัตว์ใหม่: ${name}`);
      const [result] = await pool.execute(
        `INSERT INTO animals (name, species, age, habitat, weight, is_endangered) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, species, age, habitat, weight || null, is_endangered || false]
      );
      
      // ดึงข้อมูลสัตว์ที่เพิ่งสร้าง
      const [newAnimal] = await pool.execute('SELECT * FROM animals WHERE id = ?', [result.insertId]);
      
      console.log(`✅ เพิ่มสัตว์สำเร็จ: ${newAnimal[0].name} (ID: ${newAnimal[0].id})`);
      return newAnimal[0];
    } catch (error) {
      console.error(`❌ เพิ่มสัตว์ไม่สำเร็จ:`, error.message);
      throw new Error(`เพิ่มข้อมูลสัตว์ไม่สำเร็จ: ${error.message}`);
    }
  }

  // แก้ไขข้อมูล
  static async updateAnimal(id, animalData) {
    const { name, species, age, habitat, weight, is_endangered } = animalData;
    
    try {
      console.log(`📝 กำลังแก้ไขสัตว์ ID: ${id}`);
      const [result] = await pool.execute(
        `UPDATE animals 
         SET name = ?, species = ?, age = ?, habitat = ?, weight = ?, is_endangered = ?
         WHERE id = ?`,
        [name, species, age, habitat, weight || null, is_endangered || false, id]
      );
      
      if (result.affectedRows === 0) {
        console.log(`❌ ไม่พบสัตว์ ID: ${id}`);
        return null;
      }
      
      // ดึงข้อมูลสัตว์ที่แก้ไขแล้ว
      const [updatedAnimal] = await pool.execute('SELECT * FROM animals WHERE id = ?', [id]);
      
      console.log(`✅ แก้ไขสัตว์สำเร็จ: ${updatedAnimal[0].name}`);
      return updatedAnimal[0];
    } catch (error) {
      console.error(`❌ แก้ไขสัตว์ ID ${id} ไม่สำเร็จ:`, error.message);
      throw new Error(`แก้ไขข้อมูลสัตว์ไม่สำเร็จ: ${error.message}`);
    }
  }

  // ลบข้อมูล
  static async deleteAnimal(id) {
    try {
      console.log(`🗑️ กำลังลบสัตว์ ID: ${id}`);
      
      // ดึงข้อมูลสัตว์ก่อนลบ
      const [animalToDelete] = await pool.execute('SELECT * FROM animals WHERE id = ?', [id]);
      
      if (animalToDelete.length === 0) {
        console.log(`❌ ไม่พบสัตว์ ID: ${id}`);
        return null;
      }
      
      // ลบสัตว์
      const [result] = await pool.execute('DELETE FROM animals WHERE id = ?', [id]);
      
      if (result.affectedRows > 0) {
        console.log(`✅ ลบสัตว์สำเร็จ: ${animalToDelete[0].name}`);
        return animalToDelete[0];
      }
      
      return null;
    } catch (error) {
      console.error(`❌ ลบสัตว์ ID ${id} ไม่สำเร็จ:`, error.message);
      throw new Error(`ลบข้อมูลสัตว์ไม่สำเร็จ: ${error.message}`);
    }
  }

  // ค้นหาตามสายพันธุ์
  static async searchBySpecies(species) {
    try {
      console.log(`🔍 กำลังค้นหาสัตว์สายพันธุ์: ${species}`);
      const [rows] = await pool.execute(
        'SELECT * FROM animals WHERE species LIKE ? ORDER BY name',
        [`%${species}%`]
      );
      console.log(`✅ ค้นหาสำเร็จ: พบ ${rows.length} รายการ`);
      return rows;
    } catch (error) {
      console.error(`❌ ค้นหาสัตว์สายพันธุ์ "${species}" ไม่สำเร็จ:`, error.message);
      throw new Error(`ค้นหาสัตว์ไม่สำเร็จ: ${error.message}`);
    }
  }
}

module.exports = AnimalModel;