# Theo Dõi Tiến Độ (Progress)

## Trạng Thái Tổng Quan
- **Giai đoạn (Phase)**: Triển khai MVP Chat (sau Phase 0)
- **Tình trạng**: Đã có backend chat hoạt động và frontend admin/customer để test thực tế.

## Những Việc Đã Hoàn Thành (What Works)
- [x] Lên ý tưởng dự án và xác định các tính năng cốt lõi (Quy định tại `README.md`).
- [x] Định nghĩa mục tiêu trọng tâm: Tối ưu chốt đơn (Sales-ready) qua AI Handover.
- [x] Thiết lập cấu trúc Memory Bank với thông tin ngữ cảnh đầy đủ:
  - `projectbrief.md`
  - `productContext.md`
  - `systemPatterns.md`
  - `techContext.md`
  - `activeContext.md`
- [x] Hoàn thành Chat Module backend (REST + WebSocket + Flyway schema).
- [x] Ổn định tích hợp realtime chat (CORS, sự kiện WS, serialization thời gian).
- [x] Hoàn thành giao diện khách hàng (`ChatWindow`) và giao diện admin (`AdminDashboard`).
- [x] Điều hướng bằng React Router (`/chat`, `/admin`) và cập nhật style tổng thể.
- [x] Tạo commit tính năng mới: `09c1391` (admin dashboard + routed chat views).
- [x] Bổ sung push realtime cho admin (STOMP WebSocket broker, loại bỏ hoàn toàn polling).

## Những Việc Đang Thực Hiện (Current Status)
- [x] Chốt và áp dụng stack frontend: React + Tailwind + react-router-dom.
- [x] Mở rộng API admin lấy danh sách hội thoại và lịch sử để giám sát.
- [x] Triển khai cơ chế auto-refresh (polling) cho admin dashboard (Sau đó đã nâng cấp thay thế bằng luồng WebSocket STOMP Pub/Sub).
- [x] **Đã hoàn thành**: Chuyển đổi toàn bộ kiến trúc sang STOMP Message Broker, admin nhận realtime push không cần polling.
- [x] Dọn các artifacts cài npm nhầm trong `spring-server` (`node_modules`, `package.json`, `package-lock.json`).
- [x] Thiết kế/triển khai Orchestrator Module (AI integration, lead scoring, handover logic, Mock AI).
- [x] Thiết kế và triển khai giao diện 3 cột Sales-Centric cho Admin Dashboard (hiển thị Lead Score, Bot Status, Intent).
- [ ] Thiết kế/triển khai Security Module (JWT, authentication, authorization).

## Những Việc Cần Làm Tiếp Theo (What's Left to Build)
- **Thiết Kế (Design)**:
  - [x] Thiết kế chi tiết Orchestrator Module (AI integration, lead scoring, handover logic).
  - [x] Thiết kế Mockup/Wireframe và code giao diện 3 cột cho Sales-Centric Dashboard.
  - [ ] Thiết kế chi tiết Security Module (JWT, authentication, authorization).
  - [ ] Vẽ các sơ đồ kiến trúc (Architecture Diagram, Sequence Diagram, Data Flow)
- **Phát Triển (Development)**:
  - [x] Implement Orchestrator Module classes (AiScoringClient, OrchestratorService, PotentialLead).
  - [ ] Implement Security Module classes.
  - [ ] Tích hợp kết nối kênh Chat (vd: Zalo, Facebook Messenger, Website).
  - [ ] Xây dựng mô-đun AI Intent & Sentiment Analysis (thực tế).
  - [ ] Xây dựng hệ thống Routing / Handover Engine (hoàn thiện).
  - [x] Xây dựng giao diện Dashboard cho Agent (Bản Mock 3 cột hiện đại).
- **Kiểm Thử (Testing)**:
  - Kiểm thử độ mượt mà khi chuyển giao giữa Bot và Người.
  - Đánh giá tốc độ phản hồi của AI Sales Assist.
