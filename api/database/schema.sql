-- สร้าง database (รันใน pgAdmin ก่อน)
-- CREATE DATABASE user_system_db;

-- สร้างตาราง users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- เพิ่มข้อมูลตัวอย่าง (password คือ "123456" ที่ hash แล้ว)
INSERT INTO users (username, email, password, full_name, role) VALUES
('admin', 'admin@test.com', '$2a$10$8K1p/a0dRTUXw/QCZ52yJeO5BZ/7VgU7LY2Cj9E3kN7qQ9z8W1X4S', 'ผู้ดูแลระบบ', 'admin'),
('john', 'john@test.com', '$2a$10$8K1p/a0dRTUXw/QCZ52yJeO5BZ/7VgU7LY2Cj9E3kN7qQ9z8W1X4S', 'จอห์น สมิธ', 'user'),
('mary', 'mary@test.com', '$2a$10$8K1p/a0dRTUXw/QCZ52yJeO5BZ/7VgU7LY2Cj9E3kN7qQ9z8W1X4S', 'แมรี่ โจนส์', 'user');

-- สร้าง index เพื่อความเร็ว
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);