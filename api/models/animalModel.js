const { pool } = require('../config/database');

class AnimalModel {
  // ดึงข้อมูลทั้งหมด
  static async getAllAnimals() {
    const client = await pool.connect();
    try {
      console.log('📊 กำลังดึงข้อมูลสัตว์ทั้งหมด...');
      const result = await client.query('SELECT * FROM animals ORDER BY created_at DESC');
      console.log(`✅ ดึงข้อมูลสัตว์สำเร็จ: ${result.rows.length} รายการ`);
      return result.rows;
    } catch (error) {
      console.error('❌ ดึงข้อมูลสัตว์ไม่สำเร็จ:', error.message);
      throw new Error(`ดึงข้อมูลสัตว์ไม่สำเร็จ: ${error.message}`);
    } finally {
      client.release();
    }
  }

  // ดึงข้อมูลตาม ID
  static async getAnimalById(id) {
    const client = await pool.connect();
    try {
      console.log(`🔍 กำลังค้นหาสัตว์ ID: ${id}`);
      const result = await client.query('SELECT * FROM animals WHERE id = $1', [id]);
      const animal = result.rows[0] || null;
      console.log(animal ? `✅ พบสัตว์: ${animal.name}` : `❌ ไม่พบสัตว์ ID: ${id}`);
      return animal;
    } catch (error) {
      console.error(`❌ ค้นหาสัตว์ ID ${id} ไม่สำเร็จ:`, error.message);
      throw new Error(`ดึงข้อมูลสัตว์ ID ${id} ไม่สำเร็จ: ${error.message}`);
    } finally {
      client.release();
    }
  }

  // เพิ่มข้อมูลใหม่
  static async createAnimal(animalData) {
    const { name, species, age, habitat, weight, is_endangered } = animalData;
    const client = await pool.connect();
    
    try {
      console.log(`➕ กำลังเพิ่มสัตว์ใหม่: ${name}`);
      const result = await client.query(
        `INSERT INTO animals (name, species, age, habitat, weight, is_endangered) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [name, species, age, habitat, weight || null, is_endangered || false]
      );
      console.log(`✅ เพิ่มสัตว์สำเร็จ: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ เพิ่มสัตว์ไม่สำเร็จ:`, error.message);
      throw new Error(`เพิ่มข้อมูลสัตว์ไม่สำเร็จ: ${error.message}`);
    } finally {
      client.release();
    }
  }

  // แก้ไขข้อมูล
  static async updateAnimal(id, animalData) {
    const { name, species, age, habitat, weight, is_endangered } = animalData;
    const client = await pool.connect();
    
    try {
      console.log(`📝 กำลังแก้ไขสัตว์ ID: ${id}`);
      const result = await client.query(
        `UPDATE animals 
         SET name = $1, species = $2, age = $3, habitat = $4, 
             weight = $5, is_endangered = $6, updated_at = CURRENT_TIMESTAMP
         WHERE id = $7 
         RETURNING *`,
        [name, species, age, habitat, weight || null, is_endangered || false, id]
      );
      const animal = result.rows[0] || null;
      console.log(animal ? `✅ แก้ไขสัตว์สำเร็จ: ${animal.name}` : `❌ ไม่พบสัตว์ ID: ${id} เพื่อแก้ไข`);
      return animal;
    } catch (error) {
      console.error(`❌ แก้ไขสัตว์ ID ${id} ไม่สำเร็จ:`, error.message);
      throw new Error(`แก้ไขข้อมูลสัตว์ไม่สำเร็จ: ${error.message}`);
    } finally {
      client.release();
    }
  }

  // ลบข้อมูล
  static async deleteAnimal(id) {
    const client = await pool.connect();
    try {
      console.log(`🗑️ กำลังลบสัตว์ ID: ${id}`);
      const result = await client.query('DELETE FROM animals WHERE id = $1 RETURNING *', [id]);
      const animal = result.rows[0] || null;
      console.log(animal ? `✅ ลบสัตว์สำเร็จ: ${animal.name}` : `❌ ไม่พบสัตว์ ID: ${id} เพื่อลบ`);
      return animal;
    } catch (error) {
      console.error(`❌ ลบสัตว์ ID ${id} ไม่สำเร็จ:`, error.message);
      throw new Error(`ลบข้อมูลสัตว์ไม่สำเร็จ: ${error.message}`);
    } finally {
      client.release();
    }
  }

  // ค้นหาตามสายพันธุ์
  static async searchBySpecies(species) {
    const client = await pool.connect();
    try {
      console.log(`🔍 กำลังค้นหาสัตว์สายพันธุ์: ${species}`);
      const result = await client.query(
        'SELECT * FROM animals WHERE species ILIKE $1 ORDER BY name',
        [`%${species}%`]
      );
      console.log(`✅ ค้นหาสำเร็จ: พบ ${result.rows.length} รายการ`);
      return result.rows;
    } catch (error) {
      console.error(`❌ ค้นหาสัตว์สายพันธุ์ "${species}" ไม่สำเร็จ:`, error.message);
      throw new Error(`ค้นหาสัตว์ไม่สำเร็จ: ${error.message}`);
    } finally {
      client.release();
    }
  }
}

module.exports = AnimalModel;