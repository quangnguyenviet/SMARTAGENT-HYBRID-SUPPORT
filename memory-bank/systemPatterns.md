# Mẫu Hệ Thống & Kiến Trúc (System Patterns)

## Kiến Trúc Hệ Thống
Hệ thống SmartAgent được thiết kế theo hướng **Modular Monolith** kết hợp với **External AI Service** để đơn giản hóa giai đoạn đầu nhưng vẫn đảm bảo tính tách biệt. Các Component chính bao gồm:

### 1. Spring Boot Monolith (Core Backend)
Ứng dụng Spring Boot duy nhất sẽ đóng vai trò trung tâm xử lý, được chia thành các module nội bộ:
- **Chat Module**: Đảm nhận việc giữ kết nối WebSocket (Stomp.js/SockJS) với client (khách hàng và nhân viên), lưu trữ dữ liệu vào PostgreSQL.
- **Orchestrator Module**: Đóng vai trò điều phối trung tâm. Nhận tin nhắn từ Chat Module và gọi sang external AI Service qua REST API (OpenFeign/RestTemplate) để xử lý NLP.
- **Security Module**: Quản lý xác thực và phân quyền bằng JWT + Spring Security.

### 2. AI/NLP Service (FastAPI - Python)
- **Nhiệm vụ**: Tiếp nhận tin nhắn từ Orchestrator, xử lý ngôn ngữ tự nhiên để phân tích ý định (Intent), chấm điểm (Lead Score) và trích xuất thực thể.
- **Cơ chế**: Sử dụng Prompt Engineering với LLM (Gemini 1.5/OpenAI) hoặc mô hình NLP cục bộ (PhởBERT) để trả về JSON (Score, Intent).

### 3. AI-Driven Handover & Session State (Redis)
- **Nhiệm vụ**: Quản lý việc chuyển giao quyền kiểm soát hội thoại giữa Bot và Human.
- **Quy tắc**: Dựa trên kết quả từ AI Service, cập nhật trạng thái session trong **Redis** (ví dụ: `is_bot_active: false`, bật cờ ưu tiên). Redis giúp đồng bộ trạng thái cực nhanh giữa các node.

### 3. Cổng Tương Tác Kép (Dual Interface Gateway)
- Xử lý việc routing tin nhắn từ khách hàng đến Chatbot hoặc Nhân viên và ngược lại mà khách hàng không nhận ra sự ngắt quãng.

### 4. Sales-Centric Dashboard & AI Sales Assist
- **Nhiệm vụ**: Giao diện tập trung dành cho nhân viên bán hàng.
- **Thiết kế hiện tại**:
	- Dashboard admin 3 cột: Smart Inbox - Workspace - AI Insights.
	- Cập nhật dữ liệu hoàn toàn qua **STOMP WebSocket Realtime** (topic `/topic/admin/conversations`).
	- Điều hướng tách biệt theo route: `/admin` cho vận hành nội bộ, `/chat` cho giao diện khách.
	- Tính năng **Take Over** để giành quyền từ AI.

## Quy Trình Vận Hành (Workflow Pattern)
1. **Giai đoạn 1 (Smart Screening)**: Bot thu thập thông tin cơ bản.
2. **Giai đoạn 2 (Lead Scoring)**: AI phát hiện Intent (ví dụ: "Mua 100 cái có giảm giá?").
3. **Giai đoạn 3 (Live Sales Engagement)**: Notification "Kèo ngon" được bắn về Dashboard, nhân viên giành quyền xử lý (Take over).
4. **Giai đoạn 4 (Conversion & Feedback)**: Nhân viên chốt đơn, trả quyền cho Bot (Release control). Bot tiếp tục thu thập địa chỉ, thanh toán và đánh giá.

## Mẫu Triển Khai Hiện Tại (As-Is)
1. Khách gửi tin từ màn `/chat`.
2. Hệ thống lưu lịch sử qua REST + cập nhật realtime qua STOMP Topic `/topic/chat/{id}`.
3. Màn `/admin` nhận cập nhật inbox tức thì qua topic `/topic/admin/conversations`.
4. Orchestrator phân tích tin nhắn user để chấm điểm và phát hiện nhu cầu handover.
5. Admin thực hiện Take Over -> `isBotActive = false` -> Hệ thống mở khóa ô nhập liệu cho Admin.
6. Admin chat trực tiếp -> Khách nhận tin nhắn nhãn "Nhân viên hỗ trợ" màu Indigo.
