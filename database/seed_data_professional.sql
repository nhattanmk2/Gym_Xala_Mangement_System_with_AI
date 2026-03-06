-- ==========================================================
-- SEED DATA CHUYÊN NGHIỆP CHO HỆ THỐNG GYM XALA
-- Dùng cho buổi báo cáo Final Presentation
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Làm sạch dữ liệu cũ
TRUNCATE TABLE ai_consultation_history;
TRUNCATE TABLE ai_recommendation_log;
TRUNCATE TABLE workout_session;
TRUNCATE TABLE schedule;
TRUNCATE TABLE member_exercise_status;
TRUNCATE TABLE workout_exercises;
TRUNCATE TABLE workout_plans;
TRUNCATE TABLE membership_cards;
TRUNCATE TABLE member;
TRUNCATE TABLE employee;
TRUNCATE TABLE user_role;
TRUNCATE TABLE users;
TRUNCATE TABLE packages;
TRUNCATE TABLE gym_location;
TRUNCATE TABLE position;
TRUNCATE TABLE role;
TRUNCATE TABLE notifications;

SET FOREIGN_KEY_CHECKS = 1;

-- 2. Quyền truy cập (Roles)
INSERT INTO role (id, name) VALUES (1000, 'ROLE_MEMBER'), (1001, 'ROLE_PT'), (1002, 'ROLE_ADMIN');

-- 3. Vị trí công việc (Positions)
INSERT INTO position (position_id, name) VALUES 
(1, 'HLV Cá nhân'), 
(2, 'HLV Yoga'), 
(3, 'HLV HIIT & Cardio'),
(4, 'Quản lý Chi nhánh');

-- 4. Chi nhánh (Locations)
INSERT INTO gym_location (id, name, address) VALUES 
(1, 'Gym Xala - Trung Tâm', 'Số 102 Trần Phú, Hà Đông, Hà Nội'),
(2, 'Gym Xala - Chi nhánh 2', 'KĐT Văn Quán, Hà Đông, Hà Nội'),
(3, 'Gym Xala - Chi nhánh 3', 'KĐT Xa La, Hà Đông, Hà Nội');

-- 5. Gói tập (Packages)
INSERT INTO packages (id, name, description, price, duration_in_days, category, active) VALUES 
(1, 'Gói Tiêu chuẩn', 'Tập tự do, đầy đủ thiết bị, không có PT kèm riêng.', 500000, 30, 'Standard', 1),
(2, 'Gói PT Cá nhân - 12 Buổi', 'Gói tập có PT kèm riêng trong 1 tháng (12 buổi).', 3500000, 30, 'PT', 1),
(3, 'Gói VIP - Trọn gói 1 Năm', 'Toàn quyền sử dụng dịch vụ tại tất cả chi nhánh, kèm 24 buổi PT.', 12000000, 365, 'VIP', 1),
(4, 'Combo Giảm Cân Thần Tốc', 'Chế độ tập luyện và dinh dưỡng đặc biệt trong 3 tháng.', 8000000, 90, 'Diet', 1);

-- 6. Người dùng (Users)
-- admin/trainer01/member01: password123 ($2b$12$pqCGvmbKmxlObEfLTEwUF.2oj36wjrz38EJzBhd/DBhEtJrBS7v8S)
-- Tôi sẽ dùng lại mã hash cũ nhưng chú ý cập nhật username/password cho khớp README
INSERT INTO users (id, username, password, email, full_name, phone, enabled) VALUES 
(1, 'admin', '$2b$12$pqCGvmbKmxlObEfLTEwUF.2oj36wjrz38EJzBhd/DBhEtJrBS7v8S', 'admin@gymxala.com', 'Quản trị viên Hệ thống', '0987123456', 1),
(2, 'trainer01', '$2b$12$pqCGvmbKmxlObEfLTEwUF.2oj36wjrz38EJzBhd/DBhEtJrBS7v8S', 'pt01@gymxala.com', 'Nguyễn Văn Hùng', '0912345678', 1),
(3, 'trainer02', '$2b$12$pqCGvmbKmxlObEfLTEwUF.2oj36wjrz38EJzBhd/DBhEtJrBS7v8S', 'pt02@gymxala.com', 'Trần Thị Mai', '0912456789', 1),
(4, 'trainer03', '$2b$12$pqCGvmbKmxlObEfLTEwUF.2oj36wjrz38EJzBhd/DBhEtJrBS7v8S', 'pt03@gymxala.com', 'Lê Minh Thành', '0912567890', 1),
(5, 'member01', '$2b$12$pqCGvmbKmxlObEfLTEwUF.2oj36wjrz38EJzBhd/DBhEtJrBS7v8S', 'member01@gmail.com', 'Phạm Minh Đức', '0345678901', 1),
(6, 'member02', '$2b$12$pqCGvmbKmxlObEfLTEwUF.2oj36wjrz38EJzBhd/DBhEtJrBS7v8S', 'member02@gmail.com', 'Hoàng Bảo Ngọc', '0345678902', 1),
(7, 'member03', '$2b$12$pqCGvmbKmxlObEfLTEwUF.2oj36wjrz38EJzBhd/DBhEtJrBS7v8S', 'member03@gmail.com', 'Vũ Anh Tuấn', '0345678903', 1);

-- 7. Phân quyền (User Roles)
INSERT INTO user_role (user_id, role_id) VALUES 
(1, 1002), (2, 1001), (3, 1001), (4, 1001), (5, 1000), (6, 1000), (7, 1000);

-- 8. Nhân viên PT (Employee)
INSERT INTO employee (id, user_id, position_id, address_gym_id, pt_rating, name, phone, pt_specialty, start_work) VALUES 
(1, 2, 1, 1, 4.9, 'Nguyễn Văn Hùng', '0912345678', 'Tăng cơ, Giảm mỡ', '2023-01-01'),
(2, 3, 2, 2, 5.0, 'Trần Thị Mai', '0912456789', 'Yoga, Pilates', '2023-03-15'),
(3, 4, 3, 3, 4.8, 'Lê Minh Thành', '0912567890', 'HIIT, Strength Training', '2023-06-01');

-- 9. Hội viên (Member)
INSERT INTO member (id, user_id, address_gym_id, status, height, weight, name, phone, email, sex, goal_type) VALUES 
(1, 5, 1, 1, 175, 75, 'Phạm Minh Đức', '0345678901', 'member01@gmail.com', 'Nam', 'TANG_CO'),
(2, 6, 2, 1, 160, 52, 'Hoàng Bảo Ngọc', '0345678902', 'member02@gmail.com', 'Nữ', 'GIU_DANG'),
(3, 7, 3, 1, 180, 90, 'Vũ Anh Tuấn', '0345678903', 'member03@gmail.com', 'Nam', 'GIAM_CAN');

-- 10. Đăng ký gói tập (Membership Cards)
INSERT INTO membership_cards (id, member_id, package_id, start_date, end_date, status, created_at) VALUES 
(1, 1, 2, '2024-03-01', '2024-03-31', 'ACTIVE', NOW()),
(2, 2, 1, '2024-02-15', '2024-03-15', 'ACTIVE', NOW()),
(3, 3, 4, '2024-03-01', '2024-06-01', 'PENDING', NOW());

-- 11. Kế hoạch tập luyện mẫu (Workout Plans)
INSERT INTO workout_plans (id, package_id, name, description) VALUES 
(1, 2, 'Lộ trình Tăng cơ 30 ngày', 'Kế hoạch tập trung vào các nhóm cơ chính: Ngực, Lưng, Chân.'),
(2, 4, 'Lộ trình Giảm cân Thần tốc', 'Kết hợp Cardio cường độ cao và kiểm soát Calo.');

-- 12. Bài tập trong kế hoạch (Workout Exercises)
INSERT INTO workout_exercises (id, workout_plan_id, name, reps, sets, description, order_index) VALUES 
(1, 1, 'Bench Press', 12, 4, 'Đẩy tạ đòn trên ghế bằng 12 cái mỗi hiệp.', 1),
(2, 1, 'Squat', 15, 3, 'Gánh tạ đòn 15 cái mỗi hiệp.', 2),
(3, 2, 'Burpees', 20, 5, 'Thực hiện liên tục 20 lần mỗi hiệp.', 1),
(4, 2, 'Plank', 60, 3, 'Giữ tư thế plank trong 60 giây.', 2);

-- 13. Lịch tập (Schedule)
INSERT INTO schedule (id, member_id, pt_id, start_time, end_time, status, package_id) VALUES 
(1, 1, 1, '2024-03-06 09:00:00', '2024-03-06 10:00:00', 'COMPLETED', 2),
(2, 1, 1, '2024-03-08 09:00:00', '2024-03-08 10:00:00', 'PENDING', 2),
(3, 2, NULL, '2024-03-06 17:00:00', '2024-03-06 18:30:00', 'COMPLETED', 1);

-- 14. Buổi tập chi tiết (Workout Session)
INSERT INTO workout_session (id, schedule_id, exercise, evaluation, rating) VALUES 
(1, 1, 'Hôm nay tập Ngực và Vai. Thực hiện Bench Press tốt.', 'Học viên có tiến bộ, cần chú ý nhịp thở.', 5);
