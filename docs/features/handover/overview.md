# Tổng quan Tính năng Take Over (Giành quyền hỗ trợ)

Tài liệu này mô tả chi tiết thiết kế kỹ thuật cho tính năng **Take Over**, cho phép Nhân viên hỗ trợ (Agent) ngắt quyền kiểm soát của Bot và bắt đầu can thiệp trực tiếp vào cuộc hội thoại.

## 1. Mục tiêu
- Đảm bảo việc chuyển giao từ AI sang Người thật diễn ra tức thì.
- Cập nhật trạng thái hội thoại đồng bộ trên cả Dashboard Admin và ChatWindow của khách hàng.
- **Tự động hóa**: Hệ thống tự động kích hoạt Handover ngay khi khách hàng cung cấp thông tin liên hệ thành công.
- **Thông báo đa kênh**: Gửi email thông báo cho nhân viên kèm tóm tắt hội thoại khi Handover được kích hoạt.

## 2. Ghi chú Kỹ thuật
- **API Endpoint (Manual)**: `POST /api/conversations/{id}/takeover`
- **Logic Tự động (Automated)**:
    - Được xử lý tại `OrchestratorService` khi nhận message có prefix `[CONTACT]`.
    - Chuyển `isBotActive` về `false`.
    - Cập nhật `status` thành `HANDED_OVER`.
    - Gọi `AiScoringClient.summarizeConversation()` để tạo đoạn tóm tắt.
    - Gọi `NotificationService` để gửi email.
- **Logic Frontend**:
    - Lắng nghe sự kiện qua WebSocket. Khi `isBotActive` thay đổi, React sẽ re-render để mở/khóa ô nhập liệu và hiển thị mini-form nếu cần.

## 3. Liên kết
- [Biểu đồ Lớp (Class Diagram)](./classDiagram.md)
- [Biểu đồ Tuần tự (Sequence Diagram)](./sequence.md)
