-- init.sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(100),
    student_id VARCHAR(20) UNIQUE
);

INSERT INTO students (fullname, student_id) VALUES 
('Đặng Hoàng Việt', '22671321'),
('Lương Minh Tân', '22670001'),
('Võ Phước Việt', '22670002');