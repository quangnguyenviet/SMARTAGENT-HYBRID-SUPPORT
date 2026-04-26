# Mẫu Hệ Thống & Kiến Trúc (System Patterns)

## Kiến Trúc Hệ Thống
Hệ thống SmartAgent được thiết kế theo hướng **Modular Monolith** kết hợp với **External AI Service** để đơn giản hóa giai đoạn đầu nhưng vẫn đảm bảo tính tách biệt. Các Component chính bao gồm:

### 1. Spring Boot Monolith (Core Backend)
Ứng dụng Spring Boot duy nhất đóng vai trò trung tâm xử lý, được chia thành các module nội bộ:
- **Chat Module**: Đảm nhận việc giữ kết nối WebSocket (STOMP) với client, lưu trữ lịch sử hội thoại.
- **Orchestrator Module**: Điều phối tin nhắn, gọi AI Scorer và quản lý trạng thái Handover.
- **Security Module**: Quản lý xác thực (Đang phát triển).

### 2. Orchestrator Pattern (Kẻ điều phối)
- **Service**: `OrchestratorServiceImpl` là trung tâm xử lý tin nhắn.
- **Quy trình**:
  1. Nhận tin nhắn từ `ChatService`.
  2. Gửi sang `AiScoringClient` (OpenAI/Gemini Bridge) để phân tích.
  3. Dựa trên kết quả (Intent, Lead Score), quyết định:
     - GĐ 1: Bot tư vấn sơ bộ & sàng lọc.
     - GĐ 2: Phát hiện tín hiệu mua hàng/hẹn gặp.
     - GĐ 3: Kích hoạt Handover cho nhân viên.
- **AI Consultation Strategy**: Sử dụng Prompt Engineering để thực hiện quy trình tư vấn chuyên sâu 3 giai đoạn thay vì chỉ trả lời đơn thuần.

### 3. Real-time Pub/Sub Pattern (STOMP)
- **Broker**: Spring STOMP In-memory.
- **Topics**: 
  - `/topic/messages/{convId}`: Luồng tin nhắn realtime.
  - `/topic/conversations`: Cập nhật inbox cho Admin Dashboard.

### 4. AI-Driven Handover & Session State
- **Nhiệm vụ**: Quản lý việc chuyển giao quyền kiểm soát hội thoại giữa Bot và Human.
- **Quy tắc**: Dựa trên kết quả từ AI Service, cập nhật trạng thái session trong **Redis** (ví dụ: `is_bot_active: false`, bật cờ ưu tiên). Redis giúp đồng bộ trạng thái cực nhanh giữa các node.

### 5. Cổng Tương Tác Kép (Dual Interface Gateway)
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
1. Khách truy cập Landing Page (`/`).
2. Nhấn vào Chat Widget ở góc dưới bên phải để mở cửa sổ chat popup.
3. Hệ thống lưu lịch sử qua REST + cập nhật realtime qua STOMP Topic `/topic/chat/{id}`.
4. Màn `/admin` (với Header riêng) nhận cập nhật inbox tức thì.
5. Orchestrator phân tích tin nhắn user để chấm điểm và phát hiện nhu cầu handover.
6. Admin thực hiện Take Over -> `isBotActive = false` -> Hệ thống mở khóa ô nhập liệu cho Admin.
7. Admin chat trực tiếp -> Khách nhận tin nhắn trong widget popup.
