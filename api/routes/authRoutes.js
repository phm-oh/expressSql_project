const express = require('express');
const AuthController = require('../controllers/authController');

const router = express.Router();

// เส้นทาง Authentication
router.post('/register', AuthController.register);    // POST /api/auth/register
router.post('/login', AuthController.login);          // POST /api/auth/login  
router.post('/verify', AuthController.verifyToken);   // POST /api/auth/verify

module.exports = router;