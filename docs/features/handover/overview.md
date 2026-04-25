# Tổng quan Tính năng Take Over (Giành quyền hỗ trợ)

Tài liệu này mô tả chi tiết thiết kế kỹ thuật cho tính năng **Take Over**, cho phép Nhân viên hỗ trợ (Agent) ngắt quyền kiểm soát của Bot và bắt đầu can thiệp trực tiếp vào cuộc hội thoại.

## 1. Mục tiêu
- Đảm bảo việc chuyển giao từ AI sang Người thật diễn ra tức thì.
- Cập nhật trạng thái hội thoại đồng bộ trên cả Dashboard Admin và ChatWindow của khách hàng.
- Khóa/Mở khóa ô nhập liệu (Input field) dựa trên trạng thái kiểm soát.

## 2. Ghi chú Kỹ thuật
- **API Endpoint**: `POST /api/conversations/{id}/takeover`
- **Dữ liệu yêu cầu (Payload)**: `{"agentId": Long}`
- **Logic Backend**:
    - Chuyển `isBotActive` về `false` để `OrchestratorService` ngừng xử lý tin nhắn tự động.
    - Cập nhật `status` thành `HANDED_OVER`.
    - Gắn `agentId` để biết ai chịu trách nhiệm hội thoại này.
- **Logic Frontend**:
    - Lắng nghe sự kiện qua WebSocket. Khi `isBotActive` thay đổi, React sẽ re-render để mở khóa ô nhập liệu.

## 3. Liên kết
- [Biểu đồ Lớp (Class Diagram)](./classDiagram.md)
- [Biểu đồ Tuần tự (Sequence Diagram)](./sequence.md)
