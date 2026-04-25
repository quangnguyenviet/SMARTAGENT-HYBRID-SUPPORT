# Ngữ Cảnh Hiện Tại (Active Context)

## Trạng Thái Dự Án
Dự án **SmartAgent Hybrid Support** hiện đang ở giai đoạn khởi tạo (Phase 0: Ideation & Documentation). Hệ thống đang được định hình về mặt khái niệm và thiết lập cấu trúc tài liệu cơ bản.

## Công Việc Đang Thực Hiện
- **✅ Thiết kế chi tiết Chat Module** (Hoàn thành):
  - Package structure (7 sub-packages): controller, service, entity, repository, dto, config, handler
  - Core entities & repositories: Conversation, Message, ConversationRepository, MessageRepository
  - Service layer: ChatService interface & ChatServiceImpl implementation
  - WebSocket & real-time: ChatWebSocketHandler, WebSocketConfig, 9 event types
  - REST API: ChatController với 9 endpoints, DTOs, response wrapper
- Tiếp tục thiết kế Orchestrator Module (service, DTO, AI integration, handover logic)

## Các Quyết Định Mới Nhất
- Lựa chọn mô hình Hybrid (AI + Human) với cơ chế Handover dựa trên Intent/Sentiment Analysis làm nòng cốt.
- Thiết kế hệ thống nhắm mục tiêu "Sales-Centric" thay vì chỉ là công cụ Support đơn thuần.
- **Chốt Tech Stack cốt lõi**:
  - Frontend: React.js + Tailwind CSS.
  - Backend: Spring Boot **Modular Monolith** (Gom chung luồng Chat, Orchestrator, Security vào một app).
  - AI Service: Python FastAPI (Gọi LLM API hoặc dùng PhởBERT, chạy độc lập).
  - Database: PostgreSQL & Redis (cho Session State để Handover không độ trễ).
- **Khởi tạo Spring Boot Backend**: Dự án Maven cơ bản với Flyway migrations cho Conversations, Messages, và Leads.

## Bước Tiếp Theo
1. ✅ **Thiết kế Chat Module** - Hoàn thành (14 classes/interfaces, 9 endpoints, 9 event types)
2. **Thiết kế Orchestrator Module** - Đang thực hiện (AI integration, scoring, handover logic)
3. **Thiết kế Security Module** - Chờ (JWT, authentication, authorization, role-based access)
4. Vẽ các sơ đồ kiến trúc (Architecture Diagram) và luồng dữ liệu (Data Flow Diagram)
5. Thiết kế Mockup/Wireframe cho Sales-Centric Dashboard
