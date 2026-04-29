# Tổng quan Tính năng Thu thập Lead & Thông báo (Lead Capture & Notification)

Tính năng này cho phép hệ thống tự động nhận diện khách hàng tiềm năng, thu thập thông tin liên hệ và gửi thông báo khẩn cấp cho nhân viên thông qua Email.

## 1. Mục tiêu
- Tự động hóa quy trình sàng lọc khách hàng tiềm năng.
- Thu thập thông tin liên hệ (Tên, SĐT, Email) một cách tinh tế thông qua UI/UX mượt mà.
- Đảm bảo nhân viên nhận được thông tin đầy đủ về khách hàng ngay cả khi không trực tuyến trên Dashboard.
- Sử dụng AI để tóm tắt bối cảnh giúp nhân viên hiểu nhanh vấn đề.

## 2. Các giai đoạn xử lý
Hệ thống xử lý qua 3 giai đoạn chính trong `OrchestratorService`:

### GĐ 1: Phân tích & Trigger (COLLECTING_CONTACT)
- Khi AI phân tích tin nhắn và đánh giá `leadScore` >= 50 hoặc Intent là `handover`/`complaint`.
- Bot sẽ gửi một tin nhắn dạng `collect_contact` tới khách hàng.
- Frontend nhận diện và hiển thị **Mini Contact Form**.

### GĐ 2: Thu thập dữ liệu ([CONTACT])
- Khách hàng điền form và gửi đi. Frontend gửi message với prefix `[CONTACT]`.
- Backend parse dữ liệu và lưu vào bảng `potential_leads`.
- Chuyển trạng thái `Conversation` sang `HANDED_OVER`.

### GĐ 3: Tóm tắt & Thông báo (Notification)
- AI thực hiện tóm tắt toàn bộ lịch sử hội thoại (khoảng 3-5 câu).
- `NotificationService` gửi Email (SMTP) tới nhân viên bao gồm:
    - Thông tin khách hàng.
    - Điểm tiềm năng & Ý định.
    - Bản tóm tắt hội thoại của AI.
    - Link truy cập nhanh tới hội thoại trên Dashboard.
- **Cơ chế chống trùng lặp**: Sử dụng cờ `isLeadNotified` trong bảng `potential_leads`. Email sẽ chỉ được gửi **duy nhất một lần** cho mỗi hội thoại, ngay cả khi khách hàng tiếp tục nhắn tin sau khi đã trở thành Lead.

## 3. Thành phần kỹ thuật
- **Frontend**: Component `ChatWindow` xử lý render form động.
- **Backend**:
    - `OrchestratorServiceImpl`: Điều phối luồng xử lý.
    - `AiScoringClient`: Gọi Gemini AI để phân tích và tóm tắt.
    - `NotificationService`: Xử lý gửi mail async (`@Async`).
    - `Thymeleaf`: Template engine cho email.

## 4. Liên kết
- [Biểu đồ Tuần tự (Sequence Diagram)](./sequence.md)
- [Biểu đồ Lớp (Class Diagram)](../chat/classDiagram.md)
