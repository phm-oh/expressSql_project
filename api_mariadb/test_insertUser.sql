-- สคริปต์สร้างตารางและข้อมูล user สำหรับ skill68 database
-- ใช้งานใน DBeaver หรือ phpMyAdmin

-- เลือกใช้ database skill68
USE skill68;

-- ลบตาราง users ถ้ามีอยู่แล้ว (ระวัง! จะลบข้อมูลทั้งหมด)
-- DROP TABLE IF EXISTS users;

-- สร้างตาราง users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- เพิ่มข้อมูล user ตัวอย่าง
-- รหัสผ่านทั้งหมดคือ "123456" (ถูก hash ด้วย bcrypt)
INSERT INTO users (username, email, password, full_name, role) VALUES
('admin', 'admin@test.com', '$2a$10$8K1p/a0dRTUXw/QCZ52yJeO5BZ/7VgU7LY2Cj9E3kN7qQ9z8W1X4S', 'ผู้ดูแลระบบ', 'admin'),
('john', 'john@test.com', '$2a$10$8K1p/a0dRTUXw/QCZ52yJeO5BZ/7VgU7LY2Cj9E3kN7qQ9z8W1X4S', 'จอห์น สมิธ', 'user'),
('mary', 'mary@test.com', '$2a$10$8K1p/a0dRTUXw/QCZ52yJeO5BZ/7VgU7LY2Cj9E3kN7qQ9z8W1X4S', 'แมรี่ โจนส์', 'user'),
('teacher', 'teacher@test.com', '$2a$10$8K1p/a0dRTUXw/QCZ52yJeO5BZ/7VgU7LY2Cj9E3kN7qQ9z8W1X4S', 'ครูผู้สอน', 'user'),
('student', 'student@test.com', '$2a$10$8K1p/a0dRTUXw/QCZ52yJeO5BZ/7VgU7LY2Cj9E3kN7qQ9z8W1X4S', 'นักเรียน', 'user');

-- สร้าง index เพื่อเพิ่มประสิทธิภาพ
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- แสดงตารางที่สร้างแล้ว
SHOW TABLES;

-- แสดงโครงสร้างตาราง users
DESCRIBE users;

-- แสดงข้อมูล users ทั้งหมด
SELECT id, username, email, full_name, role, is_active, created_at FROM users;

-- แสดงจำนวน users
SELECT COUNT(*) as total_users FROM users;

-- ข้อมูลสำหรับทดสอบ API
SELECT 
    '========================================' as info,
    'ข้อมูลสำหรับทดสอบ Login API' as description,
    '========================================' as info2;

SELECT 
    username,
    'รหัสผ่าน: 123456' as password_info,
    role,
    email
FROM users
ORDER BY 
    CASE 
        WHEN role = 'admin' THEN 1 
        ELSE 2 
    END, 
    username;