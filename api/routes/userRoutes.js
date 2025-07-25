// const express = require('express');
// const UserController = require('../controllers/userController');

// const router = express.Router();

// // เส้นทาง User Management
// router.get('/', UserController.getAllUsers);                    // GET /api/users
// router.get('/profile/me', UserController.getMyProfile);         // GET /api/users/profile/me
// router.get('/:id', UserController.getUserById);                 // GET /api/users/1
// router.put('/:id', UserController.updateUser);                  // PUT /api/users/1
// router.delete('/:id', UserController.deleteUser);               // DELETE /api/users/1
// router.put('/:id/password', UserController.changePassword);     // PUT /api/users/1/password

// module.exports = router;
//================================================================

const express = require('express');
const UserController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// เส้นทาง User Management (มีการตรวจสอบสิทธิ์)

// Public routes (ไม่ต้อง login)
// - ไม่มี เพราะการจัดการ user ต้อง login ทั้งหมด

// Protected routes (ต้อง login)
router.get('/profile/me', authenticateToken, UserController.getMyProfile);         // GET /api/users/profile/me (ดูข้อมูลตัวเอง)
router.put('/profile/me', authenticateToken, UserController.updateMyProfile);      // PUT /api/users/profile/me (แก้ไขข้อมูลตัวเอง)

// Admin only routes (ต้อง login + เป็น admin)
router.get('/', authenticateToken, requireAdmin, UserController.getAllUsers);                    // GET /api/users (admin เท่านั้น)
router.get('/:id', authenticateToken, requireAdmin, UserController.getUserById);                 // GET /api/users/1 (admin เท่านั้น)
router.put('/:id', authenticateToken, requireAdmin, UserController.updateUser);                  // PUT /api/users/1 (admin เท่านั้น)
router.delete('/:id', authenticateToken, requireAdmin, UserController.deleteUser);               // DELETE /api/users/1 (admin เท่านั้น)

// Special routes (ต้อง login + ตรวจสอบสิทธิ์พิเศษ)
router.put('/:id/password', authenticateToken, UserController.changePassword);     // PUT /api/users/1/password (เปลี่ยนรหัสผ่าน)

module.exports = router;