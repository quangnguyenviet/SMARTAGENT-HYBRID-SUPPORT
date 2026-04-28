# Theo Dõi Tiến Độ (Progress)

## Trạng Thái Tổng Quan
- **Giai đoạn (Phase)**: MVP hoàn chỉnh — Landing Page + AI Chat + Admin Dashboard + Email Notification
- **Tình trạng**: Hệ thống hoạt động end-to-end. Khách chat → AI chấm điểm → Bot hỏi thao tác contact → Gửi email nhân viên → Admin Take Over.

## Những Việc Đã Hoàn Thành (What Works)

### Nền Tảng & Kiến Trúc
- [x] Lên ý tưởng, xác định tính năng cốt lõi.
- [x] Thiết lập Memory Bank đầy đủ.
- [x] Kiến trúc STOMP Message Broker (Pub/Sub) thay thế hoàn toàn Raw WebSocket/Polling.
- [x] Containerization: Dockerfile + Docker Compose cho toàn bộ hệ thống.

### Backend Chat Module
- [x] Conversation/Message entities + Flyway schema.
- [x] REST API: tạo hội thoại, gửi tin, lấy lịch sử, lấy tất cả hội thoại (Admin).
- [x] WebSocket STOMP: broadcast tin nhắn realtime đến Customer và Admin.
- [x] API `takeover`: nhân viên giành quyền từ Bot.
- [x] Conversation Entity có quan hệ `@OneToOne` với `PotentialLead`.
- [x] `ConversationDTO` bao gồm `leadScore`, `intentSummary`, `sentiment`.
- [x] `ChatServiceImpl.entityToDTO()` map dữ liệu từ `PotentialLead` vào DTO.
- [x] **[NEW]** Real-time Typing Indicator logic in `ChatWebSocketController`.

### Orchestrator & AI Module
- [x] `OrchestratorService`: Tự động phân tích tin nhắn, chấm điểm, kích hoạt Handover.
- [x] Tích hợp AI thực tế: `gemini-1.5-flash` qua OpenAI bridge (`spring-ai-starter-model-openai`).
- [x] AI Prompt 3 giai đoạn (Sàng lọc → Tín hiệu → Handover) với điểm nhạy bén (+10/+20/+30/+50).
- [x] **[NEW]** Refactor AI Consultant flow: Hỗ trợ 3 trạng thái PRE-LEAD, LEAD DETECTED, POST-LEAD.
- [x] **[NEW]** Duy trì Bot hoạt động sau thu thập contact để trả lời khách hàng.
- [x] Structured Output: Kết quả AI trả về dạng `AiAnalysisResult` JSON (đã ép định dạng nghiêm ngặt).
- [x] Sự kiện `LEAD_SCORE_UPDATED` mang đầy đủ `ConversationDTO` để cập nhật Dashboard Admin realtime.
- [x] Cơ chế chuyển đổi Mock/Real AI qua `app.ai.use-mock`.

### Frontend Khách Hàng
- [x] `LandingPage.jsx`: Trang chủ giới thiệu công ty (Glassmorphism, Gradient).
- [x] `ChatWidget.jsx`: Nút chat bong bóng nổi góc phải, popup khi nhấn.
- [x] `ChatWindow.jsx`: Luôn hiển thị UI (không chặn bởi màn Loading). Kết nối WebSocket ổn định do không bị unmount.
- [x] `App.jsx`: `/` → Landing Page, Chat Widget toàn cục, `/admin` → Admin Dashboard.

### Frontend Quản Trị
- [x] `AdminDashboard.jsx`: Giao diện 3 cột (Smart Inbox | Workspace | AI Insights) với Header riêng.
- [x] Cột AI Insights hiển thị `intentSummary` thật từ AI Backend.
- [x] Cập nhật điểm 🔥 và trạng thái hội thoại realtime qua STOMP.
- [x] **[NEW]** Real-time Typing Indicator UI cho cả Khách hàng và Admin.
- [x] Tính năng Take Over: `isBotActive = false`, mở khóa ô nhập liệu Admin.

### Containerization & Infrastructure
- [x] Dockerfile + Docker Compose cho toàn bộ hệ thống.
- [x] **[FIX]** WebSocket/CORS issues trong môi trường Docker (port 80).
- [x] Gmail SMTP config + `app.notification.*` trong `application.yaml`.
- [x] `@EnableAsync` đầu trong `SpringServerApplication`.

### Bot Thu Thập Contact
- [x] V2 Flyway migration: thêm `customer_name`, `phone`, `email`, `contact_collected_at` vào `potential_leads`. Xóa `estimated_value`.
- [x] `PotentialLead` entity: bổ sung 4 field liên hệ.
- [x] `OrchestratorServiceImpl`: refactor toàn bộ với 3 luồng xử lý (form contact, text tự do, AI bình thường). Trigger gửi email khi score ≥ 50.
- [x] `COLLECTING_CONTACT` — trạng thái hội thoại mới giữa ACTIVE và HANDED_OVER.
- [x] `ChatWindow.jsx`: mini contact form (Tên, SĐT, Email) hiển thị khi bot yêu cầu.

### Fix Layout Admin
- [x] `AdminDashboard.jsx`: 3 cột không còn bị kéo dài theo cột cao nhất (`h-screen` + `calc(100vh - 73px)`).
- [x] Đổi tên nhãn "Cần Chăm Sóc" thành "Manual".
- [x] **[FIX]** Sửa lỗi crash màn hình do thiếu `messagesEndRef` trong `ChatWindow.jsx`.

- [ ] Thiết kế/triển khai Security Module (JWT, authentication, authorization).

## Những Việc Cần Làm Tiếp Theo (What's Left to Build)

### Phát Triển (Development)
- [ ] **Security Module**: Đang thiết kế (JWT, authentication, authorization).
- [x] **Đa kênh**: Tích hợp Facebook Messenger (Webhook + Send API) đã hoạt động.
- [x] **Refactor Data**: `customerId` chuyển sang `String` (Flyway V3) hỗ trợ PSID.
- [ ] **Thống kê**: Dashboard tổng hợp số liệu (Lead mới/ngày, tỷ lệ chuyển đổi, v.v.).

### Kiểm Thử (Testing)
- [ ] Test end-to-end: Khách chat → AI → Admin nhận realtime → Take Over → Admin chat.
- [ ] Đánh giá tốc độ phản hồi AI thực tế.
- [ ] Test stress: Nhiều hội thoại đồng thời.

## Commits Quan Trọng
| Commit | Mô tả |
|--------|--------|
| `b00ac7a` | feat: refactor chat flow with multi-state AI consulting and fix Docker CORS issues |
| `78a2f71` | feat: bot auto-collect contact info & email notification to agent |
| `c97c860` | feat: real-time lead scoring, landing page with chat widget, fix JSX errors |
| `33f6b64` | feat: optimize AI prompt for complaint handling |
| `fed93a7` | feat: integrate real AI via OpenAI bridge |
