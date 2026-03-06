# Hướng dẫn Vận hành Hệ thống Quản lý Gym Xala

Chào mừng bạn đến với tài liệu hướng dẫn vận hành hệ thống Gym Xala. Tài liệu này cung cấp các thông tin cần thiết để quản trị viên, huấn luyện viên (PT) và hội viên sử dụng hệ thống một cách hiệu quả.

---

## 1. Thông tin Đăng nhập Mẫu
Sau khi import bộ dữ liệu (`gym_xala_db.sql`), bạn có thể sử dụng các tài khoản sau để thử nghiệm:

| Vai trò | Username | Password | Mục đích thử nghiệm |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `123456` | Quản lý toàn bộ hệ thống, báo cáo, nhân sự. |
| **PT** | `pt_pro_4` | `ptpro4` | Xem lịch dạy, đánh giá học viên. |
| **Member** | `member20` | `Password20` | Đăng ký gói tập, xem lộ trình, chatbot AI. |

---

## 2. Hướng dẫn dành cho Quản trị viên (Admin)

### Quản lý Nhân sự & Hội viên
- Truy cập vào menu **Quản lý Hội viên** hoặc **Quản lý PT** để xem danh sách.
- Bạn có thể **Nâng cấp** một Hội viên lên thành PT nếu họ đủ điều kiện.
- **Khóa/Mở khóa** tài khoản khi cần thiết.

### Quản lý Gói tập
- Admin có quyền thêm mới, chỉnh sửa hoặc tạm dừng các gói tập (Packages).
- Các gói tập được thiết lập sẽ hiển thị trực tiếp trên trang chủ cho khách hàng đăng ký.

### Xem Báo cáo & Thống kê
- Hệ thống cung cấp biểu đồ tăng trưởng hội viên và doanh thu theo tháng.
- Admin có thể xem **Xếp hạng PT** dựa trên số buổi dạy và đánh giá từ học viên.

---

## 3. Hướng dẫn dành cho Huấn luyện viên (PT)

### Quản lý Lịch dạy
- PT đăng nhập và vào trang **Dashboard PT** để xem các khung giờ đã được hội viên đăng ký.
- Quản lý trạng thái buổi tập (Hoàn thành/Hủy).

### Đánh giá & Ghi nhận kết quả
- Sau mỗi buổi tập, PT thực hiện nhập **Đánh giá (Evaluation)** và ghi nhận các bài tập học viên đã thực hiện.
- Thông tin này sẽ giúp học viên theo dõi được sự tiến bộ của mình.

---

## 4. Hướng dẫn dành cho Hội viên (Member)

### Chatbot AI Tư vấn
- Sử dụng tính năng **Chatbot AI** ở góc màn hình để nhận tư vấn về sức khỏe và gợi ý gói tập phù hợp dựa trên chỉ số BMI.

### Đăng ký & Theo dõi Lộ trình
- Hội viên có thể đăng ký các gói tập và chọn PT yêu thích.
- Trang **Lộ trình tập luyện** hiển thị các bài tập được PT thiết kế riêng cho gói tập đó.

---

## 5. Lưu ý Kỹ thuật

### Cách làm sạch và nạp dữ liệu mẫu
1. Sử dụng công cụ quản lý cơ sở dữ liệu (ví dụ: MySQL Workbench, DBeaver).
2. Mở tệp `e:/gym-xala/database/seed_data_professional.sql`.
3. Thực thi (Execute) toàn bộ tệp SQL này để làm mới dữ liệu hệ thống.

### Bảo mật hệ thống
- Hệ thống đã được thiết lập phân quyền nghiêm ngặt (**RBAC**). 
- Các tài khoản không có quyền Admin sẽ bị từ chối truy cập (Lỗi 403) nếu cố tình truy cập vào các đường dẫn quản trị.