# Ngữ Cảnh Hiện Tại (Active Context)

## Trạng Thái Dự Án
Dự án **SmartAgent Hybrid Support** đã hoàn thiện MVP với đầy đủ tính năng: Landing Page, Chat Widget, AI Lead Scoring realtime, Admin Dashboard, Handover, và tính năng mới **Bot tự thu thập thông tin liên hệ + gửi email thông báo nhân viên**.

- Commit mới nhất: `78a2f71`.
- Backend hoạt động ổn định với REST + WebSocket STOMP + Email Notification.
- Admin Dashboard đã fix lỗi layout 3 cột bị kéo dài theo nội dung.

## Công Việc Đã Hoàn Thành Trong Phiên Này

### Tính Năng Mới: Bot Thu Thập Contact & Email Thông Báo
- **✅ V2 Flyway Migration**: Thêm 4 cột vào `potential_leads`: `customer_name`, `phone`, `email`, `contact_collected_at`. Xóa `estimated_value`.
- **✅ PotentialLead entity**: Bổ sung 4 field tương ứng (`customerName`, `phone`, `email`, `contactCollectedAt`).
- **✅ Notification Module**: Tạo mới package `notification/` gồm:
  - `NotificationService` (interface)
  - `NotificationServiceImpl` — gửi email async qua Gmail SMTP + Thymeleaf
  - `LeadNotificationData` DTO
  - `lead_notification.html` — email template dark mode premium (Lead Score badge, info grid, AI intent, CTA button)
- **✅ OrchestratorServiceImpl**: Refactor toàn bộ với 3 luồng xử lý:
  1. Nhận tin nhắn `[CONTACT]` từ mini-form → parse, lưu DB, gửi email, handover
  2. Text tự do trong trạng thái `COLLECTING_CONTACT` → regex parse SĐT/email
  3. Luồng AI bình thường → khi score ≥ 50 hoặc intent = handover → yêu cầu contact
- **✅ `COLLECTING_CONTACT` status**: Trạng thái mới giữa ACTIVE và HANDED_OVER.
- **✅ `pom.xml`**: Thêm `spring-boot-starter-mail` và `spring-boot-starter-thymeleaf`.
- **✅ `application.yaml`**: Thêm Gmail SMTP config (`spring.mail.*`) và `app.notification.*`.
- **✅ `@EnableAsync`**: Thêm vào `SpringServerApplication` để `@Async` hoạt động.
- **✅ `ChatWindow.jsx`**: Thêm mini contact form (Tên, SĐT, Email) hiển thị khi nhận `senderType = collect_contact` từ bot. Submit gửi message với prefix `[CONTACT]`.

### Fix Layout Admin Dashboard
- **✅ `AdminDashboard.jsx`**: Đổi outer div từ `min-h-screen` → `h-screen overflow-hidden`. Grid container dùng `height: calc(100vh - 73px)` thay vì `flex-1` → 3 cột không còn bị kéo dài theo cột cao nhất.

## Các Quyết Định Quan Trọng
- **Prefix `[CONTACT]`**: Dùng prefix có cấu trúc thay vì NLP để parse nhanh, chắc chắn, không phụ thuộc AI.
- **Gửi email dù online hay offline**: Email luôn được gửi khi có lead — song song với STOMP realtime cho Admin online.
- **Email chạy `@Async`**: Không block luồng chat chính, khách nhận phản hồi ngay lập tức.
- **Gmail App Password**: Cần env var `MAIL_USERNAME`, `MAIL_PASSWORD`, `AGENT_EMAIL`.
- **Admin layout fixed**: `h-screen` + `calc(100vh - 73px)` cho grid để 3 cột cuộn độc lập nhau.

## Bước Tiếp Theo
1. **Security Module**: JWT Authentication, phân quyền Admin/Agent endpoint.
2. **Test E2E email**: Xác nhận Gmail App Password hoạt động, nhận email đúng format.
3. **Nhiều nhân viên nhận mail**: Mở rộng `AGENT_EMAIL` thành danh sách nếu cần.
4. **Flyway**: Đã có V2 migration, chạy lần đầu sẽ tự apply.
