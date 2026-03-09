-- GYM XALA PROFESSIONAL SEED DATA V2 (EXTENDED ROADMAP & EQUIPMENT)
SET FOREIGN_KEY_CHECKS = 0;

-- 0. XÓA BẢNG CŨ
DROP TABLE IF EXISTS member_exercise_status;
DROP TABLE IF EXISTS session_exercise;
DROP TABLE IF EXISTS workout_session;
DROP TABLE IF EXISTS workout_roadmap;
DROP TABLE IF EXISTS exercise_level;
DROP TABLE IF EXISTS standard_exercise;
DROP TABLE IF EXISTS gym_equipment;
DROP TABLE IF EXISTS exercise_category;
-- Lưu ý: Không xóa bảng packages vì nó chứa thông tin gói tập đang kinh doanh. 
-- Tuy nhiên, nếu muốn nạp mới hoàn toàn các gói cừa rồi, hãy uncomment dòng dưới:
-- DROP TABLE IF EXISTS packages;

-- 1. TẠO BẢNG (Chỉ tạo nếu chưa có hoặc đã drop)
CREATE TABLE IF NOT EXISTS packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(19, 2) NOT NULL,
    duration_in_days INT NOT NULL,
    max_sessions INT,
    category VARCHAR(50) DEFAULT 'GENERAL',
    active BOOLEAN DEFAULT TRUE,
    image MEDIUMBLOB,
    promotion TEXT
) ENGINE=InnoDB;

-- Nạp 3 gói tập mặc định nếu chưa có
INSERT IGNORE INTO packages (id, name, description, price, duration_in_days, max_sessions, category, active) VALUES 
(1, 'Gói Cơ Bản (Basic)', 'Phù hợp cho người mới bắt đầu.', 500000, 30, 9, 'GENERAL', 1),
(2, 'Gói Nâng Cao (Plus)', 'Hỗ trợ tập luyện cường độ trung bình.', 1200000, 90, 9, 'MUSCLE', 1),
(3, 'Gói VIP Premium', 'Trải nghiệm dịch vụ 5 sao với PT riêng.', 5000000, 180, 9, 'GENERAL', 1);

CREATE TABLE IF NOT EXISTS exercise_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB;

CREATE TABLE gym_equipment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE standard_exercise (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    equipment_id BIGINT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    FOREIGN KEY (category_id) REFERENCES exercise_category(id),
    FOREIGN KEY (equipment_id) REFERENCES gym_equipment(id)
) ENGINE=InnoDB;

CREATE TABLE exercise_level (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    standard_exercise_id BIGINT NOT NULL,
    level_name VARCHAR(50) NOT NULL,
    sets INT,
    reps INT,
    FOREIGN KEY (standard_exercise_id) REFERENCES standard_exercise(id)
) ENGINE=InnoDB;

CREATE TABLE workout_roadmap (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    package_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT,
    FOREIGN KEY (package_id) REFERENCES packages(id)
) ENGINE=InnoDB;

CREATE TABLE workout_session (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    roadmap_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT,
    FOREIGN KEY (roadmap_id) REFERENCES workout_roadmap(id)
) ENGINE=InnoDB;

CREATE TABLE session_exercise (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    exercise_level_id BIGINT NOT NULL,
    order_index INT,
    FOREIGN KEY (session_id) REFERENCES workout_session(id),
    FOREIGN KEY (exercise_level_id) REFERENCES exercise_level(id)
) ENGINE=InnoDB;

CREATE TABLE member_exercise_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    membership_card_id BIGINT NOT NULL,
    session_exercise_id BIGINT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at DATETIME,
    FOREIGN KEY (membership_card_id) REFERENCES membership_cards(id),
    FOREIGN KEY (session_exercise_id) REFERENCES session_exercise(id)
) ENGINE=InnoDB;

-- 2. DỮ LIỆU THIẾT BỊ (6 loại thiết bị)
INSERT INTO gym_equipment (id, name, description, image_url) VALUES 
(1, 'Máy chạy bộ (Treadmill PRO)', 'Máy chạy bộ cao cấp tích hợp màn hình cảm ứng, đo nhịp tim.', 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=500'),
(2, 'Giàn tạ đa năng (Multipress)', 'Hệ thống giàn tạ hỗ trợ đẩy ngực, vai, kéo xô.', 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=500'),
(3, 'Tạ đôi (Dumbbells Set)', 'Bộ tạ tay từ 2kg đến 40kg chất liệu thép cao cấp.', 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=500'),
(4, 'Máy kéo xô (Lat Pulldown)', 'Thiết bị chuyên dụng phát triển nhóm cơ lưng xô.', 'https://images.unsplash.com/photo-1591940742878-13aba4b7a35e?q=80&w=500'),
(5, 'Máy đạp chân (Leg Press)', 'Máy tập sức mạnh thân dưới, tập trung đùi và mông.', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=500'),
(6, 'Ghế tập bụng (Adjustable Bench)', 'Ghế tùy chỉnh độ dốc cho các bài tập bụng và ngực.', 'https://images.unsplash.com/photo-1583454110551-21f2fa20e32c?q=80&w=500');

-- 3. DANH MỤC BÀI TẬP (6 loại)
INSERT INTO exercise_category (id, name, description) VALUES 
(1, 'Cardio', 'Tăng sức bền, đốt mỡ.'),
(2, 'Ngực & Vai (Chest & Shoulder)', 'Phát triển cơ thân trên phía trước.'),
(3, 'Lưng & Xô (Back)', 'Phát triển chuỗi cơ sau.'),
(4, 'Chân & Mông (Legs & Glutes)', 'Sức mạnh thân dưới.'),
(5, 'Tay (Arms)', 'Biceps và Triceps.'),
(6, 'Cơ lõi (Core/ABS)', 'Ổn định cột sống và cơ bụng.');

-- 4. BÀI TẬP CHUẨN (Gán thiết bị)
INSERT INTO standard_exercise (id, category_id, equipment_id, name, description) VALUES 
(1, 1, 1, 'Chạy bộ biến tốc', 'Chạy nhanh 1 phút, đi bộ 1 phút.'),
(2, 2, 2, 'Đẩy ngực ngang máy', 'Bài tập ngực an toàn với máy Multipress.'),
(3, 3, 4, 'Kéo xô rộng tay', 'Tập trung vào độ rộng của lưng.'),
(4, 4, 5, 'Leg Press cơ bản', 'Đạp chân góc 45 độ.'),
(5, 5, 3, 'Cuốn tạ tay (Bicep Curl)', 'Phát triển bắp tay trước.'),
(6, 6, 6, 'Gập bụng trên ghế', 'Tăng độ khó cho bài Crunch.');

-- 5. MỨC ĐỘ BÀI TẬP (Tăng dần thông số)
INSERT INTO exercise_level (id, standard_exercise_id, level_name, sets, reps) VALUES 
-- Chạy bộ (reps là phút)
(1, 1, 'LOW', 1, 10), (2, 1, 'MEDIUM', 1, 25), (3, 1, 'HIGH', 1, 40),
-- Đẩy ngực
(4, 2, 'LOW', 3, 12), (5, 2, 'MEDIUM', 4, 10), (6, 2, 'HIGH', 5, 8),
-- Kéo xô
(7, 3, 'LOW', 3, 12), (8, 3, 'MEDIUM', 3, 15), (9, 3, 'HIGH', 4, 15),
-- Leg Press
(10, 4, 'LOW', 3, 10), (11, 4, 'MEDIUM', 4, 12), (12, 4, 'HIGH', 5, 15),
-- Bicep Curl
(13, 5, 'LOW', 3, 12), (14, 5, 'MEDIUM', 4, 12), (15, 5, 'HIGH', 4, 15),
-- Gập bụng
(16, 6, 'LOW', 3, 15), (17, 6, 'MEDIUM', 3, 20), (18, 6, 'HIGH', 4, 30);

-- 6. LỘ TRÌNH CHO CÁC GÓI TẬP (Mỗi gói 3 lộ trình)
-- Gói 1 (BASIC - ID: 1)
INSERT INTO workout_roadmap (id, package_id, name, description, order_index) VALUES 
(11, 1, 'Tháng 1: Khởi động cơ bản', 'Làm quen với các động tác nền tảng.', 1),
(12, 1, 'Tháng 2: Sức bền căn bản', 'Tăng thời gian tập và nhịp tim.', 2),
(13, 1, 'Tháng 3: Sức mạnh sơ cấp', 'Bắt đầu làm quen với tạ nhẹ.', 3);

-- Gói 2 (PLUS - ID: 2)
INSERT INTO workout_roadmap (id, package_id, name, description, order_index) VALUES 
(21, 2, 'Giai đoạn 1: Kỹ thuật chuẩn', 'Chỉnh sửa form bài tập chuyên sâu.', 1),
(22, 2, 'Giai đoạn 2: Cường độ cao', 'Tập trung vào đốt mỡ và nhịp tim.', 2),
(23, 2, 'Giai đoạn 3: Phá vỡ giới hạn', 'Thử thách với tạ trung bình.', 3);

-- Gói 3 (PREMIUM - ID: 3)
INSERT INTO workout_roadmap (id, package_id, name, description, order_index) VALUES 
(31, 3, 'Tháng 1-2: Xây dựng nền tảng', 'Làm quen máy móc và nhịp độ cao.', 1),
(32, 3, 'Tháng 3-4: Đốt mỡ chuyên sâu (HIIT)', 'Tăng cường sức bền tim mạch.', 2),
(33, 3, 'Tháng 5-6: Tăng cơ tối đa', 'Tập tạ nặng với PT 1 kèm 1.', 3);

-- 7. BUỔI TẬP (Mỗi lộ trình ít nhất 3 buổi)
-- Gói 1
INSERT INTO workout_session (id, roadmap_id, name, order_index) VALUES 
(101, 11, 'B1: Làm quen Máy chạy bộ', 1), (102, 11, 'B2: Ngực & Vai sơ cấp', 2), (103, 11, 'B3: Core cơ bản', 3),
(104, 12, 'B1: Chạy bộ bền bỉ', 1), (105, 12, 'B2: Toàn thân phối hợp', 2), (106, 12, 'B3: Đạp chân nhẹ', 3),
(107, 13, 'B1: Đẩy ngực tạ nhẹ', 1), (108, 13, 'B2: Kéo xô nhẹ nhàng', 2), (109, 13, 'B3: Squat không tạ', 3);
-- Gói 2
INSERT INTO workout_session (id, roadmap_id, name, order_index) VALUES 
(201, 21, 'B1: Ngực & Tay sau', 1), (202, 21, 'B2: Lưng & Tay trước', 2), (203, 21, 'B3: Chân & Bụng', 3),
(204, 22, 'B1: HIIT Cardio Mạnh', 1), (205, 22, 'B2: Upper Body Power', 2), (206, 22, 'B3: Lower Body Burn', 3),
(207, 23, 'B1: Push Day VIP', 1), (208, 23, 'B2: Pull Day VIP', 2), (209, 23, 'B3: Leg Day Power', 3);
-- Gói 3
INSERT INTO workout_session (id, roadmap_id, name, order_index) VALUES 
(301, 31, 'B1: Full Body Circuit', 1), (302, 31, 'B2: Chest & Shoulder Focus', 2), (303, 31, 'B3: Leg & Core Stability', 3),
(304, 32, 'B1: Treadmill Interval', 1), (305, 32, 'B2: Super-set Upper', 2), (306, 32, 'B3: HIIT Cardio 40p', 3),
(307, 33, 'B1: Heavy Push', 1), (308, 33, 'B2: Heavy Pull', 3), (309, 33, 'B3: Sumo Squat & Deadlift', 3);

-- 8. CHI TIẾT BÀI TẬP (Mức độ LOW-MEDIUM-HIGH)
INSERT INTO session_exercise (session_id, exercise_level_id, order_index) VALUES 
-- Gói 1 (LOW)
(101, 1, 1), (102, 4, 1), (103, 16, 1), (104, 2, 1), (105, 7, 1), (106, 10, 1), (107, 4, 1), (108, 7, 1), (109, 10, 1),
-- Gói 2 (MEDIUM)
(201, 5, 1), (202, 8, 1), (203, 11, 1), (203, 17, 2), (204, 2, 1), (205, 5, 1), (205, 8, 2), (206, 11, 1), (207, 6, 1), (208, 9, 1), (209, 12, 1),
-- Gói 3 (HIGH)
(301, 3, 1), (301, 6, 2), (301, 9, 3), (302, 6, 1), (303, 12, 1), (303, 18, 2), (304, 3, 1), (305, 6, 1), (305, 9, 2), (306, 3, 1), (307, 6, 1), (308, 9, 1), (309, 12, 1), (309, 15, 2);

-- 9. CẬP NHẬT SỐ BUỔI TẬP TỐI ĐA CHO GÓI TẬP
UPDATE packages SET max_sessions = 9 WHERE id IN (1, 2, 3);

SET FOREIGN_KEY_CHECKS = 1;
