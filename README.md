# Hướng dẫn Luồng Chọn Huấn luyện viên (PT) và Đặt lịch tập

Tài liệu này ghi nhớ luồng nghiệp vụ gán PT và đặt lịch tập sau khi đăng ký gói tập tại Gym Xala.

## 1. Luồng dành cho Quản trị viên (Admin)
1. Truy cập vào trang **Quản lý Gói tập** (Package Management).
2. Khi tạo mới hoặc chỉnh sửa một gói tập, Admin chọn danh sách các **Huấn luyện viên phụ trách** cho gói đó.
3. Chỉ những PT được chọn mới xuất hiện trong danh sách để Member đăng ký.

## 2. Luồng dành cho Thành viên (Member)
1. **Đăng ký**: Thành viên chọn gói tập và đăng ký.
2. **Chọn PT**: Tại mục **"Gói tập của tôi"**, nếu gói tập chưa có PT, nhấn **"✨ Chọn Huấn luyện viên"**. Hệ thống chỉ hiển thị PT được Admin gán cho gói đó.
3. **Đặt lịch tập**: Thành viên truy cập mục **"📅 Đặt lịch"**.
   - Nếu chưa chọn PT: Hệ thống hiển thị cảnh báo và nút điều hướng về trang chọn PT.
   - Nếu đã có PT: Hệ thống tự động hiển thị các khung giờ rảnh của PT đó.
   - Chọn khung giờ và nhấn **"Đặt ngay"**. Trạng thái lịch sẽ là `PENDING`.

## 3. Luồng dành cho Huấn luyện viên (PT)
1. **Đăng ký lịch**: PT sử dụng mục **"Lịch biểu"** để tạo các khung giờ rảnh.
2. **Duyệt lịch**: Khi có Member đặt lịch, PT sẽ thấy yêu cầu `PENDING`. PT có thể nhấn **"Duyệt"** hoặc **"Từ chối"**.

## 4. Quy tắc Kỹ thuật (Technical Rules)
- **Ràng buộc**: Member chỉ được chọn PT thuộc gói và chỉ được đặt lịch khi đã gán PT.
- **API**: Sử dụng `/api/pt/schedule/available/{ptId}` để lấy lịch trống và `/api/pt/schedule/book/{id}` để đặt.
- **Dữ liệu**: `availablePts` được trả về kèm `MembershipCardResponse` để tối ưu UI/UX.