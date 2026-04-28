# Ngữ Cảnh Hiện Tại (Active Context)

## Trạng Thái Dự Án
Dự án **SmartAgent Hybrid Support** đã hoàn thiện MVP và vừa trải qua đợt refactor lớn về luồng chat (Chat Flow) để tối ưu hóa trải nghiệm khách hàng theo phong cách "AI Consultant". Hệ thống đã được cấu hình chạy ổn định trên Docker với đầy đủ các bản vá lỗi WebSocket/CORS.

- Commit mới nhất: `e4bd023`.
- Backend: Đã tích hợp AI Prompt 3 giai đoạn (PRE-LEAD, LEAD DETECTED, POST-LEAD).
- Docker: Đã cấu hình CORS cho phép origin `http://localhost`.

## Công Việc Đã Hoàn Thành Trong Phiên Này

### Refactor Chat Flow & AI Logic (Mới)
- **✅ Silent Handover (Facebook)**: Triển khai luồng bàn giao âm thầm cho Messenger. Bot tự động tắt và chuyển trạng thái `HANDED_OVER` mà không gửi tin nhắn hệ thống, giúp nhân viên tiếp quản tự nhiên.
- **✅ AI-Driven Contact Extraction**: Nâng cấp AI để tự động bóc tách Tên, SĐT, Email từ nội dung tin nhắn (hỗ trợ cả trường hợp sai định dạng hoặc thiếu số mà Regex không bắt được).
- **✅ Quy tắc "Một câu hỏi" (One Question Rule)**: Ràng buộc AI chỉ đặt duy nhất 1 câu hỏi mỗi lượt chat để tránh gây áp lực cho khách hàng và giữ hội thoại tự nhiên.
- **✅ Tư vấn chuyên sâu (Consultation First)**: Điều chỉnh Prompt để AI đóng vai chuyên gia tư vấn kỹ hơn trước khi chủ động xin thông tin liên hệ.
- **✅ Sửa lỗi Double-Message**: Khắc phục lỗi Bot vừa cảm ơn nhận SĐT vừa hỏi xin lại SĐT do xung đột logic giữa Regex và AI.
- **✅ Permanent Handover**: Triển khai cơ chế bàn giao vĩnh viễn cho nhân viên khi khách hàng trở thành Lead. AI sẽ thực hiện "lời chào cuối" và tự động khóa (Lockout) để nhường quyền kiểm soát tuyệt đối cho con người.
- **✅ Lead Notification Fix**: Sửa lỗi gửi trùng email thông báo cho Agent bằng cách bổ sung cờ `isLeadNotified`.

### Admin Dashboard Enhancements
- **✅ Lead Score Badge**: Thay đổi hiển thị trên danh sách hội thoại: Hiển thị **Lead Score 🔥** cho khách hàng đang được Bot chăm sóc và **Unread Count** cho khách hàng đã bàn giao.
- **✅ Hot Lead Indicator**: Thêm hiệu ứng nhấp nháy (pulse) và màu sắc nổi bật cho các hội thoại có Lead Score >= 50.
- **✅ Label Renaming**: Đổi tên nhãn "Manual" thành "Nhân viên hỗ trợ" để thân thiện hơn.
- **✅ Customer Naming**: Hiển thị tên thật của khách hàng (thu thập từ Bot) trên Admin Dashboard thay vì chỉ hiển thị mã ID.
- **✅ Channel Filter**: Triển khai bộ lọc kênh (All, Web, Facebook) trên Frontend của trang Admin.

### Containerization (Docker)
- **✅ Dockerfile**: Tạo Dockerfile cho cả `spring-server` và `client`.
- **✅ docker-compose.yml**: Thiết lập orchestration và ánh xạ đầy đủ biến môi trường (Gemini, Mail, Facebook) cho Backend.
- **✅ Biến môi trường**: Chuyển cấu hình sang `.env` để quản lý tập trung cho Docker.

## Các Quyết Định Quan Trọng
- **Triết lý AI Consultant**: Bot là người sàng lọc và làm nóng lead, không thay thế con người chốt deal.
- **Cấu trúc Prompt tập trung**: Sử dụng biến hằng số `SYSTEM_PROMPT_TEMPLATE` để tránh lỗi ghi đè instruction của Spring AI.
- **Giữ Bot Active (POST-LEAD)**: Quyết định không tắt bot ngay lập tức sau khi có contact để bot xử lý các câu hỏi "bao giờ gọi lại", "cảm ơn" của khách.
- **Cấu hình Docker port 80**: Thống nhất dùng `http://localhost` không port làm origin chính cho môi trường deploy.
- **Multi-Subscription WebSocket**: Refactor `chatService.js` để hỗ trợ Admin vừa nhận update hệ thống vừa nhận event chi tiết trong hội thoại (typing).

## Bước Tiếp Theo
1. **Security Module**: Triển khai JWT và phân quyền Admin.
2. **Dashboard Thống kê**: Vẽ biểu đồ chuyển đổi lead.
3. **Kiểm thử Edge Cases**: Test luồng AI khi khách hàng thay đổi ý định hoặc cung cấp thông tin sai.
