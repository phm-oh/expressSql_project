const express = require('express');
const AnimalController = require('../controllers/animalController');

const router = express.Router();

// เส้นทาง API แบบ RESTful
router.get('/', AnimalController.getAllAnimals);              // GET /api/animals
router.get('/:id', AnimalController.getAnimalById);           // GET /api/animals/1
router.post('/', AnimalController.createAnimal);              // POST /api/animals
router.put('/:id', AnimalController.updateAnimal);            // PUT /api/animals/1
router.delete('/:id', AnimalController.deleteAnimal);         // DELETE /api/animals/1
router.get('/search/:species', AnimalController.searchBySpecies); // GET /api/animals/search/แมว

module.exports = router;