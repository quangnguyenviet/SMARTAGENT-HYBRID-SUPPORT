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

### 4. AI-Driven Handover & Channel Routing
- **Nhiệm vụ**: Quản lý việc chuyển giao quyền giữa Bot và Human linh hoạt theo kênh.
- **Quy tắc Handover theo kênh (Channel-based)**:
  - **Website**: Yêu cầu thu thập thông tin (SĐT/Email) qua Mini-form trước khi bàn giao.
  - **Facebook**: Triển khai **Silent Handover**. Bot tự động tắt và chuyển trạng thái âm thầm để nhân viên tiếp quản tự nhiên.
- **Duy trì Bot Active (POST-LEAD)**: Bot vẫn hoạt động sau khi có contact để xử lý các câu hỏi xã giao cho đến khi nhân viên thực sự Take Over.

### 5. AI-Driven Contact Extraction Pattern
- **Cơ chế**: Sử dụng kết quả trích xuất từ AI (Gemini) để nhận diện Tên, SĐT, Email (hỗ trợ cả văn bản tự do và định dạng không chuẩn).

### 6. Conversational UX Pattern (One Question Rule)
- **Thiết kế**: Ràng buộc AI chỉ đặt duy nhất một câu hỏi gợi mở trong mỗi lượt phản hồi để giữ mạch hội thoại tự nhiên.

### 7. Sales-Centric Dashboard & Hot Lead Prioritization
- **Nhiệm vụ**: Giao diện tập trung dành cho nhân viên bán hàng với cơ chế ưu tiên.
- **Thiết kế hiện tại**:
	- Dashboard admin 3 cột: Smart Inbox - Workspace - AI Insights.
	- **Hot Lead Badge**: Hiển thị Lead Score 🔥 nổi bật kèm hiệu ứng pulse cho các hội thoại tiềm năng (Score >= 50).
	- **Status Sync**: Cập nhật trạng thái và typing indicator qua STOMP WebSocket realtime.
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
