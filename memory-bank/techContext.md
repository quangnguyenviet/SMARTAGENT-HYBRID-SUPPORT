# Ngữ Cảnh Kỹ Thuật (Tech Context)

## Trạng Thái Công Nghệ Hiện Tại
Dự án đã chuyển từ chốt stack sang triển khai thực tế cho chat flow.

- Backend Spring Boot đã có API/WS chạy được cho chat.
- Frontend React đã có 2 màn chính: khách hàng và admin.
- Một số lỗi tích hợp quan trọng đã được fix (CORS, Jackson time, WS event mapping).

## Ngăn Xếp Công Nghệ (Tech Stack)

### 1. Frontend (Giao diện Quản trị & Chat)
- **Framework**: React 19 + Vite.
- **Routing**: react-router-dom (`/admin`, `/chat`).
- **Styling**: Tailwind CSS v4 (qua `@tailwindcss/postcss`).
- **Realtime hiện tại**:
  - Chat khách hàng: WebSocket + REST history.
  - Dashboard admin: polling định kỳ để cập nhật danh sách hội thoại và lịch sử đang mở.

### 2. Backend (Spring Boot - Linh hồn điều phối)
- Thiết kế theo hướng **Modular Monolith** (Tạm thời gom các luồng xử lý vào một ứng dụng Spring Boot duy nhất nhưng chia package rõ ràng để sau này dễ tách thành Microservices).
- **Công nghệ**:
  - Build Tool: Maven
  - Migration: Flyway (quản lý schema versioning)
  - ORM: Spring Data JPA / Hibernate
  - REST API: Spring Web MVC
  - Real-time: Spring WebSocket
- **Core Modules**: 
  - *Chat Module*: Xử lý kết nối WebSocket, lưu trữ lịch sử hội thoại vào PostgreSQL.
  - *Orchestrator Module*: Điều phối tin nhắn. Khi có tin nhắn mới, đẩy sang AI Service (bên ngoài) để "chấm điểm".
  - *Security Module*: Spring Security & JWT (phân quyền giữa Agent/Nhân viên và Admin/Quản lý).
- **API đã có**:
  - Chat tạo hội thoại, gửi tin, lấy lịch sử hội thoại.
  - Admin lấy danh sách hội thoại: `GET /api/conversations`.
- **Các fix kỹ thuật đã áp dụng**:
  - CORS config cho frontend local.
  - `ObjectMapper` đăng ký `JavaTimeModule` để serialize `LocalDateTime`.
  - Chuẩn hóa parser `WebSocketEventType` theo cả enum name và wire value.
- **Database Schema** (định nghĩa trong Flyway):
  - `conversations`: Lưu thông tin hội thoại (id, customer_id, channel, status, created_at).
  - `messages`: Lưu các tin nhắn (id, conversation_id, sender, content, timestamp).
  - `leads`: Lưu dữ liệu Lead (id, customer_id, score, status, potential_revenue).

### 3. AI/NLP Service (Python - FastAPI)
- Thay vì dùng Java cho NLP, hệ thống sử dụng FastAPI (Python) để tận dụng hệ sinh thái AI phong phú.
- **Mô hình NLP**:
  - *Option 1 (Nhanh & Mạnh)*: Gọi API của Gemini 1.5 Flash hoặc OpenAI. Viết Prompt tối ưu để trả về định dạng JSON (VD: `Intent: Potential, Score: 90`).
  - *Option 2 (Tự chủ)*: Sử dụng thư viện PhởBERT hoặc VinAI/underthesea để phân tích cảm xúc và trích xuất từ khóa tiềm năng cục bộ (tiếng Việt).
- **Communication**: Giao tiếp với Spring Boot qua REST API (sử dụng RestTemplate hoặc OpenFeign bên phía Spring).

### 4. Database & Storage
- **PostgreSQL**: Lưu trữ dữ liệu có cấu trúc (Thông tin khách hàng, Danh sách Lead, Lịch sử chat).
- **Redis**: Lưu trữ "Trạng thái hội thoại" (Session state). Ví dụ: `conversation_123 -> {is_bot_active: true, current_score: 45}`. Giúp quá trình chuyển giao (Handover) diễn ra với độ trễ gần như bằng 0.

## Ghi Chú Môi Trường
- Có thao tác cài npm nhầm trong thư mục `spring-server`, tạo ra:
  - `spring-server/node_modules/`
  - `spring-server/package.json`
  - `spring-server/package-lock.json`
- Các file này đang để untracked và cần cleanup để tránh nhiễu repo backend Java.

## Yêu Cầu Kỹ Thuật Quan Trọng
- **Độ trễ thấp (Low Latency)**: Cực kỳ quan trọng ở khâu Handover. Sự kết hợp của Redis và WebSocket giúp đảm bảo điều này.
- **Tính tách biệt (Decoupling)**: AI Service và Chat Service hoạt động độc lập qua Orchestrator.
