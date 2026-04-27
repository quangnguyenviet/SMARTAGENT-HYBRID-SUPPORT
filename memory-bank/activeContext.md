# Ngữ Cảnh Hiện Tại (Active Context)

## Trạng Thái Dự Án
Dự án **SmartAgent Hybrid Support** đã hoàn thiện MVP và vừa trải qua đợt refactor lớn về luồng chat (Chat Flow) để tối ưu hóa trải nghiệm khách hàng theo phong cách "AI Consultant". Hệ thống đã được cấu hình chạy ổn định trên Docker với đầy đủ các bản vá lỗi WebSocket/CORS.

- Commit mới nhất: `b00ac7a`.
- Backend: Đã tích hợp AI Prompt 3 giai đoạn (PRE-LEAD, LEAD DETECTED, POST-LEAD).
- Docker: Đã cấu hình CORS cho phép origin `http://localhost`.

## Công Việc Đã Hoàn Thành Trong Phiên Này

### Refactor Chat Flow & AI Logic (Mới)
- **✅ AI Prompt 3 Giai Đoạn**: Tích hợp luồng tư vấn chuyên nghiệp vào `OpenAiScoringClientImpl.java`.
  - `PRE-LEAD`: Khai thác nhu cầu, đặt câu hỏi thông minh.
  - `LEAD DETECTED`: Khuyến khích để lại contact, tránh báo giá chi tiết.
  - `POST-LEAD`: Xác nhận ghi nhận, thông báo liên hệ sau, dừng tư vấn sâu.
- **✅ Duy trì Bot hoạt động**: Refactor `OrchestratorServiceImpl` để bot không tự tắt ngay khi có contact. Bot đóng vai trò "gatekeeper" cho đến khi Agent thực sự Take Over.
- **✅ Sửa lỗi Race Condition**: Trích xuất SĐT/Email ngay đầu luồng xử lý để AI không hỏi lại thông tin vừa mới cung cấp.
- **✅ Ổn định AI Response**: Ép định dạng JSON nghiêm ngặt và sửa lỗi ghi đè System Prompt khi truyền tham số.

### Docker & WebSocket Fixes
- **✅ CORS Configuration**: Cập nhật `CorsConfig.java` và `WebSocketConfig.java` cho phép origin `http://localhost` (dành cho Docker deployment trên port 80).

### Fix Layout Admin Dashboard
- **✅ `AdminDashboard.jsx`**: Đổi outer div từ `min-h-screen` → `h-screen overflow-hidden`. Grid container dùng `height: calc(100vh - 73px)` thay vì `flex-1` → 3 cột không còn bị kéo dài theo cột cao nhất.

### Containerization (Docker)
- **✅ Dockerfile**: Tạo Dockerfile cho cả `spring-server` và `client`.
- **✅ docker-compose.yml**: Thiết lập orchestration cho toàn bộ hệ thống (DB, Backend, Frontend).
- **✅ Biến môi trường**: Chuyển cấu hình sang `.env` để quản lý tập trung cho Docker.

## Các Quyết Định Quan Trọng
- **Triết lý AI Consultant**: Bot là người sàng lọc và làm nóng lead, không thay thế con người chốt deal.
- **Cấu trúc Prompt tập trung**: Sử dụng biến hằng số `SYSTEM_PROMPT_TEMPLATE` để tránh lỗi ghi đè instruction của Spring AI.
- **Giữ Bot Active (POST-LEAD)**: Quyết định không tắt bot ngay lập tức sau khi có contact để bot xử lý các câu hỏi "bao giờ gọi lại", "cảm ơn" của khách.
- **Cấu hình Docker port 80**: Thống nhất dùng `http://localhost` không port làm origin chính cho môi trường deploy.

## Bước Tiếp Theo
1. **Security Module**: Triển khai JWT và phân quyền Admin.
2. **Dashboard Thống kê**: Vẽ biểu đồ chuyển đổi lead.
3. **Kiểm thử Edge Cases**: Test luồng AI khi khách hàng thay đổi ý định hoặc cung cấp thông tin sai.
