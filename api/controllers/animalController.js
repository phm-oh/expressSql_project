const AnimalModel = require('../models/animalModel');

class AnimalController {
  // GET /api/animals - ดึงข้อมูลทั้งหมด
  static async getAllAnimals(req, res) {
    try {
      const animals = await AnimalModel.getAllAnimals();
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลสัตว์สำเร็จ',
        data: animals,
        count: animals.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/animals/:id - ดึงข้อมูลตาม ID
  static async getAnimalById(req, res) {
    try {
      const { id } = req.params;
      const animal = await AnimalModel.getAnimalById(id);
      
      if (!animal) {
        return res.status(404).json({
          success: false,
          message: `ไม่พบข้อมูลสัตว์ ID: ${id}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลสัตว์สำเร็จ',
        data: animal
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/animals - เพิ่มข้อมูลใหม่
  static async createAnimal(req, res) {
    try {
      const animalData = req.body;
      
      // ตรวจสอบข้อมูลจำเป็น
      if (!animalData.name || !animalData.species || !animalData.age) {
        return res.status(400).json({
          success: false,
          message: 'กรุณากรอกข้อมูล: name, species, age'
        });
      }

      const newAnimal = await AnimalModel.createAnimal(animalData);
      
      res.status(201).json({
        success: true,
        message: 'เพิ่มข้อมูลสัตว์สำเร็จ',
        data: newAnimal
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/animals/:id - แก้ไขข้อมูล
  static async updateAnimal(req, res) {
    try {
      const { id } = req.params;
      const animalData = req.body;
      
      const updatedAnimal = await AnimalModel.updateAnimal(id, animalData);
      
      if (!updatedAnimal) {
        return res.status(404).json({
          success: false,
          message: `ไม่พบข้อมูลสัตว์ ID: ${id}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'แก้ไขข้อมูลสัตว์สำเร็จ',
        data: updatedAnimal
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/animals/:id - ลบข้อมูล
  static async deleteAnimal(req, res) {
    try {
      const { id } = req.params;
      const deletedAnimal = await AnimalModel.deleteAnimal(id);
      
      if (!deletedAnimal) {
        return res.status(404).json({
          success: false,
          message: `ไม่พบข้อมูลสัตว์ ID: ${id}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'ลบข้อมูลสัตว์สำเร็จ',
        data: deletedAnimal
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/animals/search/:species - ค้นหาตามสายพันธุ์
  static async searchBySpecies(req, res) {
    try {
      const { species } = req.params;
      const animals = await AnimalModel.searchBySpecies(species);
      
      res.status(200).json({
        success: true,
        message: `ค้นหาสัตว์สายพันธุ์ "${species}" สำเร็จ`,
        data: animals,
        count: animals.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = AnimalController;