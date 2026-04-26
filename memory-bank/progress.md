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
- [x] Triển khai Orchestrator Module: AI Scoring (Mock), phân tích Intent/Sentiment, và Handover logic.
- [x] Tích hợp AI thực tế: OpenAI (Hoàn thành triển khai và cấu hình).
- [x] Triển khai tính năng Take Over (Giành quyền hỗ trợ) từ Admin Dashboard.
- [x] Hoàn thiện luồng Admin Chat với giao diện cao cấp (Premium Indigo) cho khách hàng.
- [x] Thiết kế và triển khai giao diện 3 cột Sales-Centric cho Admin Dashboard.

## Những Việc Đang Thực Hiện (Current Status)
- [x] Thiết kế/triển khai Orchestrator Module (AI integration, lead scoring, handover logic, Real AI).
- [x] Chuyển đổi toàn bộ kiến trúc sang STOMP Message Broker (Admin/Client realtime).
- [x] Tích hợp AI thực tế (OpenAI bridge cho Gemini).
- [/] Thiết kế/triển khai Security Module (JWT, authentication, authorization).

## Những Việc Cần Làm Tiếp Tiếp Theo (What's Left to Build)
- **Thiết Kế (Design)**:
  - [ ] Thiết kế chi tiết Security Module (Xác thực Agent/Admin).
  - [ ] Vẽ các sơ đồ kiến trúc (Architecture Diagram, Sequence Diagram).
- **Phát Triển (Development)**:
  - [ ] Triển khai JWT Authentication và phân quyền Endpoint.
  - [ ] Lưu trữ Intent Summary và Estimated Value vào DB (Table `potential_leads`).
  - [ ] Implement Security Module classes.
  - [ ] Tích hợp kết nối kênh Chat (vd: Zalo, Facebook Messenger, Website).
  - [ ] Xây dựng mô-đun AI Intent & Sentiment Analysis (thực tế).
  - [ ] Xây dựng hệ thống Routing / Handover Engine (hoàn thiện).
  - [x] Xây dựng giao diện Dashboard cho Agent (Bản Mock 3 cột hiện đại).
- **Kiểm Thử (Testing)**:
  - [x] Kiểm thử độ mượt mà khi chuyển giao giữa Bot và Người (Take Over flow).
  - [x] Kiểm thử luồng tin nhắn thời gian thực đa chiều (Customer <-> Bot <-> Admin).
  - [ ] Đánh giá tốc độ phản hồi của AI Sales Assist thực tế.
