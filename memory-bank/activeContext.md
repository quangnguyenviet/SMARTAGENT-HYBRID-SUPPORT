# Ngữ Cảnh Hiện Tại (Active Context)

## Trạng Thái Dự Án
Dự án **SmartAgent Hybrid Support** đã chuyển từ giai đoạn định hình tài liệu sang giai đoạn triển khai MVP cho Chat nội bộ.

- Backend Chat Module đã hoạt động ổn định với REST + WebSocket.
- Frontend đã có 2 luồng chính bằng React Router: màn khách hàng (`/chat`) và màn admin (`/admin`).
- Đã có commit triển khai UI/admin mới: `09c1391`.

## Công Việc Đang Thực Hiện
- **✅ Chat module backend** (đã implement):
  - Conversation/Message entities + repositories.
  - REST API cho tạo hội thoại, gửi tin nhắn, lấy lịch sử.
  - WebSocket xử lý real-time message events.
  - API admin lấy danh sách hội thoại (`GET /api/conversations`).
- **✅ Frontend chat/admin** (đã implement):
  - `ChatWindow` cho khách hàng.
  - `AdminDashboard` xem danh sách hội thoại và lịch sử chat (Đã nâng cấp lên giao diện 3 cột chuẩn Sales-Centric).
  - Điều hướng bằng `react-router-dom` (`/admin`, `/chat`).
- **✅ Push realtime cho admin dashboard & Customer Chat** (đã implement):
  - Thay thế toàn bộ Raw WebSocket bằng kiến trúc STOMP Message Broker.
  - Tích hợp `@stomp/stompjs` trên cả `ChatWindow` (khách) và `AdminDashboard` (quản trị).
  - Loại bỏ hoàn toàn cơ chế polling, chuyển sang pub/sub realtime (cập nhật list hội thoại, nảy tin nhắn ngay lập tức không cần reload).
- **✅ Orchestrator Module (MVP)**:
  - Triển khai `OrchestratorService` và mock `AiScoringClient`.
  - Tự động bắt tin nhắn, chấm điểm (Lead Score), xác định Intent.
  - Tự động thay đổi trạng thái Bot/Handover dựa trên rule.

## Các Quyết Định Mới Nhất
- Giữ kiến trúc Hybrid (AI + Human), nhưng ưu tiên hoàn thiện luồng chat người-thật trước khi tích hợp bot.
- Tích hợp **STOMP Message Broker** thay vì Raw WebSocket để dễ dàng mở rộng và phân luồng topic (Pub/Sub) cho tính năng chat realtime ở quy mô lớn.
- Dùng React Router để tách rõ màn vận hành nội bộ (`/admin`) và màn chat khách (`/chat`).
- Loại bỏ mô hình polling cho dashboard admin, thay bằng luồng WebSocket STOMP hoàn chỉnh.

## Bước Tiếp Theo
3. **✅ Bắt đầu Orchestrator Module** (đã hoàn thành bản thiết kế và mock).
4. Thiết kế Security Module (JWT, role-based access).
5. Bổ sung test tích hợp cho flow chat end-to-end.
