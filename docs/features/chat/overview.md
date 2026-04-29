# Tổng Quan Tính Năng Chat (Chat Module Overview)

Tính năng Chat (Chat Module) là trái tim của hệ thống **SmartAgent Hybrid Support**, đóng vai trò là cầu nối giao tiếp trực tiếp giữa Khách hàng, Trí tuệ nhân tạo (AI) và Nhân viên hỗ trợ/Sales. 

Mục tiêu cốt lõi của tính năng này là đảm bảo luồng tin nhắn xuyên suốt, độ trễ thấp và khả năng "chuyển giao" (handover) mượt mà giữa AI và con người mà không làm gián đoạn trải nghiệm của khách hàng.

---

## 1. Các Thành Phần Chính (Key Components)

1. **Client Interface (Web Chat & Facebook Messenger)**:
   - Khung chat dành cho khách hàng tích hợp trên Website và tin nhắn qua Facebook Messenger Page.
   - **Lazy Initialization**: Trên Website, hội thoại chỉ được tạo khi người dùng click vào biểu tượng chat.
   - **Session Persistence**: Duy trì phiên chat xuyên suốt khi refresh trang thông qua `sessionStorage`.
   - Giao tiếp với backend qua REST API (cho lịch sử) và WebSocket/Webhook (realtime).

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
- Ngay sau đó, tin nhắn được xử lý bởi **AI Orchestrator Module** với 3 kịch bản chính:
  1. **Luồng AI tư vấn bình thường**: Bot sử dụng Gemini AI để phân tích tin nhắn và trả lời khách hàng. Hệ thống liên tục chấm điểm `leadScore`.
  2. **Luồng Thu thập thông tin liên hệ (`COLLECTING_CONTACT`)**: Khi `leadScore` đạt mức cao (≥50) hoặc AI phát hiện nhu cầu mua hàng/khiếu nại, Bot sẽ gửi một yêu cầu đặc biệt (`collect_contact`) để kích hoạt **Mini Contact Form** ở phía khách hàng.
  3. **Luồng Xử lý thông tin liên hệ (`[CONTACT]`)**: Khi khách hàng gửi thông tin từ form (có prefix `[CONTACT]`), Orchestrator sẽ:
     - Trích xuất và lưu Tên, SĐT, Email vào `PotentialLead`.
     - Chuyển trạng thái sang `HANDED_OVER` và tắt Bot (`isBotActive = false`).
     - Gọi AI tóm tắt toàn bộ nội dung cuộc hội thoại.
     - Kích hoạt **NotificationService** để gửi Email thông báo khẩn cấp cho nhân viên (bao gồm thông tin liên hệ và đoạn tóm tắt).

### 2.2. Luồng theo dõi thời gian thực (Admin)
- Admin vào Dashboard sẽ thiết lập kết nối WebSocket với topic chung (`/topic/admin/conversations`).
- Bất cứ khi nào Khách hàng có thao tác mới, hệ thống tự động gửi Push Event.
- **Tính năng Inbox Tabs**: Admin Dashboard tự động lọc các hội thoại vào tab "Cần Chăm Sóc" nếu trạng thái là `HANDED_OVER` hoặc `COLLECTING_CONTACT`.
- *Xem thêm biểu đồ chi tiết: [Sequence Diagram - Admin Realtime Push](./sequence.md)*

### 2.3. Chuyển giao AI & Người thật (Handover)
- Luồng Handover giờ đây diễn ra tự động ngay sau khi khách hàng cung cấp thông tin liên hệ.
- Admin nhận được Email thông báo ngay cả khi đang Offline, đảm bảo không bỏ lỡ khách hàng tiềm năng.
- Nhân viên có thể nhấn vào link trong Email để mở trực tiếp hội thoại trên Dashboard và bắt đầu hỗ trợ.

---

## 3. Liên Kết Liên Quan
- [Luồng Sequence chi tiết: Admin Push Realtime](./sequence.md)
- [Tài liệu Kiến trúc tổng thể](../../memory-bank/systemPatterns.md)
- [Tài liệu Ngữ cảnh Sản phẩm](../../memory-bank/productContext.md)
