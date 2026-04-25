# Tổng quan Tính năng Admin Chat với Khách hàng

Tài liệu này mô tả tính năng cho phép Nhân viên hỗ trợ (Agent) gửi tin nhắn trực tiếp cho Khách hàng thông qua Dashboard Admin sau khi đã thực hiện "Take Over".

## 1. Mục tiêu
- Cho phép giao tiếp 2 chiều thời gian thực giữa Admin và Khách hàng.
- Tin nhắn của Admin phải được phân biệt rõ với tin nhắn của Bot AI.
- Đảm bảo Bot không tự động trả lời đè lên tin nhắn của Admin.

## 2. Các thành phần tham gia
- **Admin Dashboard**: Giao diện gửi tin nhắn, hiển thị lịch sử hội thoại.
- **Backend (Spring Boot)**: Xử lý tiếp nhận tin nhắn từ Admin, lưu vào Database và chuyển tiếp tới Khách hàng qua WebSocket.
- **WebSocket (STOMP)**: Kênh truyền tải tin nhắn thời gian thực.
- **Customer Chat Window**: Giao diện nhận tin nhắn từ Admin.

## 3. Ghi chú Kỹ thuật
- **Topic gửi tin (Admin -> Server)**: `/app/chat.sendMessage` (qua WebSocket)
- **Topic nhận tin (Server -> Customer)**: `/topic/chat/{conversationId}`
- **Sender Type**: Tin nhắn từ Admin phải có `senderType = 'agent'`.
- **Logic chặn Bot**: Khi `Conversation.isBotActive = false`, Orchestrator sẽ bỏ qua việc xử lý tin nhắn để tránh Bot trả lời tự động.

## 4. Liên kết
- [Biểu đồ Lớp (Class Diagram)](./classDiagram.md)
- [Biểu đồ Tuần tự (Sequence Diagram)](./sequence.md)
