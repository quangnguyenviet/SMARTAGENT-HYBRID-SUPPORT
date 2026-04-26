# Theo Dõi Tiến Độ (Progress)

## Trạng Thái Tổng Quan
- **Giai đoạn (Phase)**: MVP hoàn chỉnh — Landing Page + AI Chat + Admin Dashboard
- **Tình trạng**: Hệ thống hoạt động end-to-end. Khách chat → AI phân tích → Admin nhận điểm realtime → Take Over.

## Những Việc Đã Hoàn Thành (What Works)

### Nền Tảng & Kiến Trúc
- [x] Lên ý tưởng, xác định tính năng cốt lõi.
- [x] Thiết lập Memory Bank đầy đủ.
- [x] Kiến trúc STOMP Message Broker (Pub/Sub) thay thế hoàn toàn Raw WebSocket/Polling.

### Backend Chat Module
- [x] Conversation/Message entities + Flyway schema.
- [x] REST API: tạo hội thoại, gửi tin, lấy lịch sử, lấy tất cả hội thoại (Admin).
- [x] WebSocket STOMP: broadcast tin nhắn realtime đến Customer và Admin.
- [x] API `takeover`: nhân viên giành quyền từ Bot.
- [x] Conversation Entity có quan hệ `@OneToOne` với `PotentialLead`.
- [x] `ConversationDTO` bao gồm `leadScore`, `intentSummary`, `sentiment`.
- [x] `ChatServiceImpl.entityToDTO()` map dữ liệu từ `PotentialLead` vào DTO.

### Orchestrator & AI Module
- [x] `OrchestratorService`: Tự động phân tích tin nhắn, chấm điểm, kích hoạt Handover.
- [x] Tích hợp AI thực tế: `gemini-1.5-flash` qua OpenAI bridge (`spring-ai-starter-model-openai`).
- [x] AI Prompt 3 giai đoạn (Sàng lọc → Tín hiệu → Handover) với điểm nhạy bén (+10/+20/+30/+50).
- [x] Structured Output: Kết quả AI trả về dạng `AiAnalysisResult` JSON.
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
- [x] Tính năng Take Over: `isBotActive = false`, mở khóa ô nhập liệu Admin.

## Những Việc Đang Thực Hiện (Current Status)
- [ ] Thiết kế/triển khai Security Module (JWT, authentication, authorization).

## Những Việc Cần Làm Tiếp Theo (What's Left to Build)

### Phát Triển (Development)
- [ ] **Security Module**: JWT Authentication, phân quyền Admin/Agent endpoint.
- [ ] **Flyway migration**: Xóa cột `estimated_value` khỏi bảng `potential_leads` (cleanup DB).
- [ ] **Đa kênh**: Tích hợp Zalo, Facebook Messenger vào hệ thống routing.
- [ ] **Thống kê**: Dashboard tổng hợp số liệu (Lead mới/ngày, tỷ lệ chuyển đổi, v.v.).

### Kiểm Thử (Testing)
- [ ] Test end-to-end: Khách chat → AI → Admin nhận realtime → Take Over → Admin chat.
- [ ] Đánh giá tốc độ phản hồi AI thực tế.
- [ ] Test stress: Nhiều hội thoại đồng thời.

## Commits Quan Trọng
| Commit | Mô tả |
|--------|--------|
| `c97c860` | feat: real-time lead scoring, landing page with chat widget, fix JSX errors |
| `33f6b64` | feat: optimize AI prompt for complaint handling |
| `fed93a7` | feat: integrate real AI via OpenAI bridge |
