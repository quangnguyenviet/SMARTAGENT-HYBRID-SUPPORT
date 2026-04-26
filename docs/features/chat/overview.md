# Tổng Quan Tính Năng Chat (Chat Module Overview)

Tính năng Chat (Chat Module) là trái tim của hệ thống **SmartAgent Hybrid Support**, đóng vai trò là cầu nối giao tiếp trực tiếp giữa Khách hàng, Trí tuệ nhân tạo (AI) và Nhân viên hỗ trợ/Sales. 

Mục tiêu cốt lõi của tính năng này là đảm bảo luồng tin nhắn xuyên suốt, độ trễ thấp và khả năng "chuyển giao" (handover) mượt mà giữa AI và con người mà không làm gián đoạn trải nghiệm của khách hàng.

---

## 1. Các Thành Phần Chính (Key Components)

1. **Client Interface (Khách hàng - `/chat`)**:
   - Khung chat dành cho khách hàng tích hợp trên website.
   - Giao tiếp với backend để gửi tin nhắn, nhận phản hồi từ AI hoặc từ Nhân viên hỗ trợ.
   - Hoạt động qua REST API (cho lịch sử) và WebSocket (để nhận/gửi tin nhắn realtime).

2. **Admin Dashboard (Nhân viên/Sales - `/admin`)**:
   - Màn hình trung tâm dành cho nhân viên quản lý hàng loạt các cuộc hội thoại.
   - Nhận tín hiệu Push Realtime từ hệ thống khi có tin nhắn hoặc cuộc hội thoại mới thông qua WebSocket channel dành riêng cho Admin (`/topic/admin/conversations`).
   - Cung cấp các công cụ để "Giành quyền" (Take Over) hội thoại từ bot khi khách hàng có tiềm năng chốt đơn cao.

3. **Backend Service (Spring Boot)**:
   - Cung cấp REST endpoints để tạo hội thoại, lấy dữ liệu quá khứ.
   - Quản lý STOMP WebSocket Broker cho các luồng tin nhắn thời gian thực.
   - Chứa logic `ChatService` để lưu trữ dữ liệu xuống Database và phát thông điệp broadcast (push notification) tới các client đang lắng nghe.

4. **Database & Cache**:
   - **PostgreSQL**: Lưu trữ vĩnh viễn cấu trúc dữ liệu của các Hội thoại (`conversations`) và Tin nhắn (`messages`).
   - **Redis**: Lưu trạng thái phiên làm việc (Session state, ví dụ: ai đang kiểm soát luồng chat - Bot hay Người) nhằm tăng tốc độ xử lý khi thực hiện Handover.

---

## 2. Luồng Hoạt Động Chính (Main Flows)

### 2.1. Luồng tạo hội thoại và gửi tin (Khách hàng)
- Khách hàng lần đầu truy cập sẽ gọi API tạo một Conversation ID mới.
- Mọi tin nhắn khách hàng gửi đi sẽ được lưu vào hệ thống và được đẩy tiếp (forward) vào WebSocket của phòng chat cụ thể đó.
- Ngay sau đó, tin nhắn được đánh chặn bởi **AI Orchestrator Module**. 
  - Orchestrator sẽ gọi API phân tích (AiScoringClient) để lấy điểm Intent/Sentiment.
  - Tự động lưu `PotentialLead` và cộng điểm `leadScore`.
  - Nếu khách gõ các từ khóa nhạy cảm (như "nhân viên", "người thật") hoặc điểm số cao, Orchestrator sẽ tự động cập nhật trạng thái `HANDED_OVER`.
  - Nếu không, Bot sẽ tự động lấy câu trả lời từ AI và phản hồi lại cho khách.

### 2.2. Luồng theo dõi thời gian thực (Admin)
- Admin vào Dashboard sẽ thiết lập kết nối WebSocket với topic chung (`/topic/admin/conversations`).
- Bất cứ khi nào Khách hàng có thao tác mới, thay vì Admin phải Refresh trang (Polling), backend tự động gửi một thông báo (Push Event Payload) cập nhật. Admin lập tức nhìn thấy tin nhắn nhảy lên đầu danh sách.
- *Xem thêm biểu đồ chi tiết: [Sequence Diagram - Admin Realtime Push](./sequence.md)*

### 2.3. Chuyển giao AI & Người thật (Handover)
- Ở trạng thái ban đầu (`ACTIVE`), Bot (AI) sẽ tự động trả lời các câu hỏi thường gặp của khách thông qua `OrchestratorService`.
- Khi điểm "tiềm năng" đạt mức cao (hoặc khách đang bức xúc/gõ từ khóa muốn gặp người thật), hệ thống tự động ngắt cờ `isBotActive = false` và cập nhật thành `HANDED_OVER`.
- Admin nhận được Notification realtime. Lúc này, AI sẽ ngừng can thiệp, Admin sẽ nói chuyện trực tiếp với Khách hàng.

---

## 3. Liên Kết Liên Quan
- [Luồng Sequence chi tiết: Admin Push Realtime](./sequence.md)
- [Tài liệu Kiến trúc tổng thể](../../memory-bank/systemPatterns.md)
- [Tài liệu Ngữ cảnh Sản phẩm](../../memory-bank/productContext.md)
