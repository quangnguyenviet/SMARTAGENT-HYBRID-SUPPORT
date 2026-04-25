# Mẫu Hệ Thống & Kiến Trúc (System Patterns)

## Kiến Trúc Hệ Thống (Dự Kiến)
Hệ thống SmartAgent được thiết kế theo hướng Microservices hoặc Modular Monolith để dễ dàng mở rộng và tích hợp đa kênh. Các Component chính bao gồm:

### 1. Smart Screening & Intent Engine
- **Nhiệm vụ**: Tiếp nhận tin nhắn, xử lý ngôn ngữ tự nhiên (NLP) để phân tích ý định (Intent) và trích xuất thông tin (Entity Extraction).
- **Cơ chế**: Sử dụng một luồng phân tích thời gian thực (Real-time Pipeline) trên mỗi đoạn hội thoại để liên tục cập nhật điểm số (Lead Score) và trạng thái cảm xúc.

### 2. AI-Driven Handover Module
- **Nhiệm vụ**: Quản lý việc chuyển giao quyền kiểm soát hội thoại giữa Bot và Human.
- **Quy tắc (Rules-Engine)**:
  - Bật "Cờ ưu tiên" (Priority Flag) khi: Intent = Mua sỉ / Hỏi chiết khấu / Hỏi giá.
  - Bật "Cờ cảnh báo" (Alert Flag) khi: Sentiment = Negative / Angry.

### 3. Cổng Tương Tác Kép (Dual Interface Gateway)
- Xử lý việc routing tin nhắn từ khách hàng đến Chatbot hoặc Nhân viên và ngược lại mà khách hàng không nhận ra sự ngắt quãng.

### 4. Sales-Centric Dashboard & AI Sales Assist
- **Nhiệm vụ**: Giao diện tập trung dành cho nhân viên bán hàng.
- **Thiết kế**: Real-time board sử dụng WebSocket. Hội thoại có điểm số tiềm năng cao (High Score) sẽ tự động nổi lên trên đầu danh sách (Push-to-top). Trợ lý AI sẽ gợi ý câu trả lời và template báo giá ở sidebar.

## Quy Trình Vận Hành (Workflow Pattern)
1. **Giai đoạn 1 (Smart Screening)**: Bot thu thập thông tin cơ bản.
2. **Giai đoạn 2 (Lead Scoring)**: AI phát hiện Intent (ví dụ: "Mua 100 cái có giảm giá?").
3. **Giai đoạn 3 (Live Sales Engagement)**: Notification "Kèo ngon" được bắn về Dashboard, nhân viên giành quyền xử lý (Take over).
4. **Giai đoạn 4 (Conversion & Feedback)**: Nhân viên chốt đơn, trả quyền cho Bot (Release control). Bot tiếp tục thu thập địa chỉ, thanh toán và đánh giá.
