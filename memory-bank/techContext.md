# Ngữ Cảnh Kỹ Thuật (Tech Context)

## Trạng Thái Công Nghệ Hiện Tại
Dự án đã chuyển từ chốt stack sang triển khai thực tế cho chat flow.

- Backend Spring Boot đã có API/WS chạy được cho chat.
- Frontend React đã có 2 màn chính: khách hàng và admin.
- Một số lỗi tích hợp quan trọng đã được fix (CORS, Jackson time, WS event mapping).

## Ngăn Xếp Công Nghệ (Tech Stack)

### 1. Frontend (Giao diện Quản trị & Chat)
- **Framework**: React 19 + Vite.
- **Routing**: react-router-dom — `/` (Landing Page), `/admin` (Admin Dashboard), `/chat` (Chat standalone).
- **Styling**: Tailwind CSS v4 (qua `@tailwindcss/postcss`).
- **Realtime hiện tại**:
  - Sử dụng **STOMP Message Broker** (Pub/Sub) qua WebSocket cho cả khách hàng và admin.
  - Admin Dashboard nhận tin nhắn và cập nhật danh sách hội thoại ngay lập tức mà không cần reload.
- **Giao diện Khách hàng**:
  - Landing Page hiện đại giới thiệu công ty.
  - Chat Widget (Floating Button) tích hợp popup chat.

### 2. Backend (Spring Boot - Linh hồn điều phối)
- Thiết kế theo hướng **Modular Monolith** (Tạm thời gom các luồng xử lý vào một ứng dụng Spring Boot duy nhất nhưng chia package rõ ràng để sau này dễ tách thành Microservices).
- **Công nghệ**:
  - Build Tool: Maven
  - Migration: Flyway (quản lý schema versioning)
  - ORM: Spring Data JPA / Hibernate
  - Java 21, Spring Boot 3.5.x.
  - **Spring AI**: Sử dụng `spring-ai-starter-model-openai` làm bridge để kết nối với Google Gemini API (tương thích chuẩn OpenAI).
  - **Real-time**: Spring WebSocket + STOMP Message Broker.
  - **Email**: `spring-boot-starter-mail` (JavaMailSender) + `spring-boot-starter-thymeleaf` (HTML template).
  - **Database**: PostgreSQL + Flyway cho migration.
  - **API Doc**: SpringDoc OpenAPI (Swagger).
  - *Orchestrator Module*: Điều phối tin nhắn. Khi có tin nhắn mới, đẩy sang AI thông qua `AiScoringClient` để phân tích Intent/Sentiment và chấm điểm.
  - *Security Module*: Spring Security & JWT (Đang thiết kế).
- **API đã có**:
  - Chat tạo hội thoại, gửi tin, lấy lịch sử hội thoại.
  - Admin lấy danh sách hội thoại: `GET /api/conversations`.
  - API `takeover` để Agent giành quyền từ Bot.
- **Các fix kỹ thuật đã áp dụng**:
  - CORS config cho frontend local.
  - `ObjectMapper` đăng ký `JavaTimeModule` để serialize `LocalDateTime`.
  - Chuẩn hóa parser `WebSocketEventType` theo cả enum name và wire value.
- **Database Schema** (định nghĩa trong Flyway):
  - `conversations`: id, customer_id, channel, status (`ACTIVE` | `COLLECTING_CONTACT` | `HANDED_OVER` | `CLOSED`), lead_score, is_bot_active, assigned_agent_id.
  - `messages`: id, conversation_id, sender, sender_type, content, timestamp.
  - `potential_leads`: id, conversation_id, intent_summary, priority, customer_name, phone, email, contact_collected_at. (Cột `estimated_value` đã bị xóa theo yêu cầu).
- **Notification Module** (`notification/`):
  - `NotificationService` / `NotificationServiceImpl` — gửi email async (@Async) qua `JavaMailSender`.
  - Template Thymeleaf: `lead_notification.html` (dark mode, Lead Score badge, CTA link vào Admin).
  - Cấu hình qua env var: `MAIL_USERNAME`, `MAIL_PASSWORD` (Gmail App Password), `AGENT_EMAIL`, `FRONTEND_URL`.

### 3. AI Service (Google Gemini)
- Hệ thống tích hợp trực tiếp với **Gemini 1.5 Flash** thông qua Spring AI.
- Sử dụng **Prompt Engineering** chuyên sâu 3 giai đoạn (Sàng lọc → Tín hiệu → Chuyển giao).
- Quy tắc chấm điểm: +10 (yêu cầu chi tiết), +20 (hỏi giá/thời gian), +30 (để lại liên hệ), +50 (khiếu nại).
- Structured Output: AI trả về `AiAnalysisResult` JSON gồm `reply`, `intent`, `sentiment`, `scoreIncrement`.
- Cấu hình: `base-url: https://generativelanguage.googleapis.com`, `completions-path: /v1beta/openai/chat/completions`.

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
