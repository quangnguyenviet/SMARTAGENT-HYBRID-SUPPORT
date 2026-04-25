# Checklist: Thiết kế Chi tiết Module Spring Boot

**Task**: Thiết kế chi tiết các module Spring Boot (Chat, Orchestrator, Security) - code structure

**Trạng thái**: Bắt đầu (Not Started)

**Mục tiêu**: Xác định rõ package structure, classes, interfaces, và trách nhiệm của từng module trong Modular Monolith.

---

## 1. Chat Module

### 1.1 Package Structure & Analysis ✅
- [x] Xác định package structure: `com.example.spring_server.chat.*`
- [x] Liệt kê các sub-packages cần thiết (controller, service, entity, repository, dto, config, handler)
- [x] Ghi chú: Chat Module quản lý WebSocket connection, message persistence, conversation state

**Kết quả:**
- Created folder structure: `spring-server/src/main/java/com/example/spring_server/chat/`
- 7 sub-packages: controller/, service/, entity/, repository/, dto/, config/, handler/
- Created `README.md` với package descriptions và data flow
- Created `package-info.java` cho từng package với documentation

### 1.2 Core Classes & Interfaces ✅
- [x] Thiết kế Entity `Conversation` (id, customerId, channel, status, createdAt, updatedAt)
- [x] Thiết kế Entity `Message` (id, conversationId, sender, senderType, content, timestamp)
- [x] Thiết kế Repository `ConversationRepository` (JPA)
- [x] Thiết kế Repository `MessageRepository` (JPA)
- [x] Thiết kế Service Interface `ChatService` (methods: createConversation, sendMessage, getConversationHistory)
- [x] Thiết kế Service Implementation `ChatServiceImpl`

**Kết quả:**
- **Entities**:
  - `Conversation.java` - JPA entity với @PrePersist/@PreUpdate lifecycle hooks, one-to-many relationship với Message
  - `Message.java` - JPA entity với many-to-one relationship với Conversation
- **Repositories**:
  - `ConversationRepository` - extends JpaRepository, custom methods: findByCustomerId, findByCustomerIdAndStatus, findByChannel
  - `MessageRepository` - extends JpaRepository, custom methods: findByConversationIdOrderByTimestampAsc, findRecentMessages
- **Service**:
  - `ChatService` interface - 8 methods (create, get, send, retrieve history, update status, close, delete)
  - `ChatServiceImpl` - full implementation with @Transactional, DTO conversion helpers
- **DTOs**:
  - `ConversationDTO` - for REST API responses
  - `MessageDTO` - for messaging operations
  - `WebSocketMessageDTO` - specialized for WebSocket with eventType field

### 1.3 WebSocket & Real-time Communication ✅
- [x] Thiết kế WebSocket Handler class `ChatWebSocketHandler`
- [x] Thiết kế Config class `WebSocketConfig` (register handler, message broker)
- [x] Thiết kế DTO `MessageDTO` (dùng cho gửi/nhận qua WebSocket)
- [x] Định nghĩa các event types (USER_MESSAGE, BOT_RESPONSE, HANDOVER_NOTIFICATION, etc.)

**Kết quả:**
- **Event Types**:
  - `WebSocketEventType.java` - Enum với 9 event types (USER_MESSAGE, BOT_RESPONSE, AGENT_RESPONSE, HANDOVER_NOTIFICATION, TYPING_INDICATOR, MESSAGE_ACK, ERROR, CONNECTION_ESTABLISHED, CONVERSATION_CLOSED)
  
- **Handler**:
  - `ChatWebSocketHandler.java` - extends TextWebSocketHandler, quản lý lifecycle (connect, message, disconnect)
    - `afterConnectionEstablished()` - send connection confirmation
    - `handleTextMessage()` - process incoming messages, route by event type
    - `afterConnectionClosed()` - cleanup
    - `broadcastMessageToConversation()` - send bot/agent responses back to client
  
- **Configuration**:
  - `WebSocketConfig.java` - @EnableWebSocket, register handlers at `/ws/chat` endpoint, CORS settings
  - `ChatWebSocketHandshakeInterceptor.java` - validate handshake, extract JWT (TODO)
  - `ChatModuleConfig.java` - Bean definitions (ObjectMapper)
  
- **Session Management**:
  - ConcurrentHashMap<Long, WebSocketSession> để track active sessions
  - Tự động cleanup khi connection đóng

### 1.4 Controller & API Endpoints ✅
- [x] Thiết kế REST Controller `ChatController`
  - GET `/api/conversations/{id}` - lấy lịch sử hội thoại
  - POST `/api/conversations` - tạo hội thoại mới
  - Endpoints khác: getMessages, deleteConversation

**Kết quả:**
- **Controller**:
  - `ChatController.java` - REST endpoints cho Chat module
  - 9 endpoints (POST, GET, PATCH, PUT, DELETE)
  - Exception handling với HTTP status codes
  - Logging cho tất cả operations

- **Request DTOs**:
  - `CreateConversationRequest` - customerId, channel
  - `SendMessageRequest` - sender, senderType, content

- **Response Wrapper**:
  - `ApiResponse<T>` - Generic wrapper cho JSON responses (success, message, data, timestamp)
  - Helper methods: ok(), error()

- **Endpoints**:
  - POST `/api/conversations` - tạo conversation mới (201 Created)
  - GET `/api/conversations/{id}` - lấy conversation by ID (200)
  - GET `/api/conversations/customer/{customerId}` - lấy tất cả conversations của customer (200)
  - GET `/api/conversations/{id}/messages` - lấy message history (200)
  - GET `/api/conversations/{id}/messages/recent?limit=10` - lấy N tin nhắn gần nhất (200)
  - POST `/api/conversations/{id}/messages` - gửi message (201)
  - PATCH `/api/conversations/{id}/status` - cập nhật status (200)
  - PUT `/api/conversations/{id}/close` - đóng conversation (200)
  - DELETE `/api/conversations/{id}` - xóa conversation (200)

- **Error Handling**:
  - 404 NOT_FOUND - khi conversation không tồn tại
  - 201 CREATED - khi resource được tạo thành công
  - 500 INTERNAL_SERVER_ERROR - cho errors khác
  - All errors wrapped in ApiResponse

---

## 2. Orchestrator Module

### 2.1 Package Structure & Analysis
- [ ] Xác định package structure: `com.example.spring_server.orchestrator.*`
- [ ] Liệt kê các sub-packages (service, dto, config, external)
- [ ] Ghi chú: Orchestrator nhận message từ Chat, gọi AI Service, nhận kết quả scoring, decide handover

### 2.2 Integration with External AI Service
- [ ] Thiết kế Config class `AIServiceConfig` (base URL, API key, timeout settings)
- [ ] Thiết kế REST Client `AIServiceClient` (call LLM API hoặc FastAPI)
- [ ] Thiết kế DTO `AIScoreRequest` (conversationId, messages, context)
- [ ] Thiết kế DTO `AIScoreResponse` (intent, score, sentiment, recommendation)

### 2.3 Orchestration Logic
- [ ] Thiết kế Service Interface `OrchestratorService`
  - Methods: processMessage, scoreConversation, determineHandover, createHandoverNotification
- [ ] Thiết kế Service Implementation `OrchestratorServiceImpl`
- [ ] Thiết kế Entity `LeadScore` (conversationId, score, intent, sentiment, timestamp)
- [ ] Thiết kế Repository `LeadScoreRepository` (JPA)

### 2.4 Handover Logic
- [ ] Thiết kế Service Interface `HandoverService`
  - Methods: initiateHandover, assignToAgent, getAvailableAgents
- [ ] Thiết kế Handover DTO `HandoverRequest` (conversationId, reason, priority)
- [ ] Xác định handover threshold logic (score > 80? transfer to human)

### 2.5 Message Routing
- [ ] Thiết kế Message Queue / Event Publishing (Spring Events hoặc Kafka)
- [ ] Xác định message flow: Chat -> Orchestrator -> AI Service -> Decision -> Redis State Update

---

## 3. Security Module

### 3.1 Package Structure & Analysis
- [ ] Xác định package structure: `com.example.spring_server.security.*`
- [ ] Liệt kê các sub-packages (config, service, jwt, dto)
- [ ] Ghi chú: Security Module quản lý authentication, authorization, JWT, role-based access

### 3.2 JWT & Authentication
- [ ] Thiết kế Config class `SecurityConfig` (Spring Security configuration)
- [ ] Thiết kế Utility class `JwtTokenProvider`
  - Methods: generateToken, validateToken, getClaimsFromToken, extractUserId
- [ ] Thiết kế DTO `JwtTokenResponse` (token, expiresIn)
- [ ] Thiết kế DTO `LoginRequest` (username, password)

### 3.3 User & Role Management
- [ ] Thiết kế Entity `User` (id, username, email, password, role, createdAt)
- [ ] Thiết kế Enum `UserRole` (AGENT, ADMIN, SUPERVISOR, CUSTOMER)
- [ ] Thiết kế Repository `UserRepository` (JPA)
- [ ] Thiết kế Service Interface `AuthService`
  - Methods: login, register, validateToken, refreshToken
- [ ] Thiết kế Service Implementation `AuthServiceImpl`

### 3.4 Filters & Interceptors
- [ ] Thiết kế Filter class `JwtAuthenticationFilter`
  - Validate JWT từ request header, set UserContext
- [ ] Thiết kế Custom Annotation `@RequireRole` (dùng cho method-level authorization)
- [ ] Thiết kế WebSocket Handshake Interceptor (validate JWT trước khi accept WebSocket)

### 3.5 Authorization & Access Control
- [ ] Xác định Permission Matrix: AGENT can read messages, ADMIN can modify users, etc.
- [ ] Thiết kế Service Interface `PermissionService`
  - Methods: hasPermission, canAccessConversation, canModifyLead
- [ ] Thiết kế Aspect class `PermissionCheckAspect` (auto-check @RequireRole)

---

## 4. Cross-Module Integration & Config

### 4.1 Application Configuration
- [ ] Thiết kế Main Application Class `SpringServerApplication`
- [ ] Xác định Bean definitions cho các Services, Repositories
- [ ] Cấu hình `application.yaml`:
  - Database connection (PostgreSQL)
  - Redis configuration
  - AI Service endpoint
  - JWT secret & expiration
  - WebSocket settings

### 4.2 Dependency & Data Flow
- [ ] Ghi chép data flow: Chat Module -> Orchestrator Module (via event/message)
- [ ] Ghi chép data flow: Orchestrator -> AI Service (REST call)
- [ ] Ghi chép Redis cache usage cho conversation state
- [ ] Xác định transaction boundaries (e.g., saveMessage + scoreMessage trong một transaction?)

### 4.3 Exception Handling & Logging
- [ ] Thiết kế Global Exception Handler class `GlobalExceptionHandler`
- [ ] Xác định custom exceptions (AIServiceException, HandoverException, UnauthorizedException)
- [ ] Cấu hình Logging (SLF4J + Logback)

### 4.4 Testing Strategy
- [ ] Liệt kê unit test classes cần thiết cho mỗi module
- [ ] Liệt kê integration test scenarios (Chat + Orchestrator + AI Service flow)
- [ ] Xác định mocking strategy cho AI Service calls

---

## 5. Documentation & Finalization

### 5.1 Architecture Diagram
- [ ] Vẽ Package Diagram cho Spring Boot structure
- [ ] Vẽ Component Diagram (Chat, Orchestrator, Security interactions)
- [ ] Vẽ Sequence Diagram cho message flow (Chat -> Orchestrator -> AI -> Handover)

### 5.2 Code Structure Document
- [ ] Viết tài liệu chi tiết về từng module (README trong /docs/)
- [ ] Ghi chú coding conventions, naming rules, folder structure rules

### 5.3 Commit & Review
- [ ] Commit design document vào git
- [ ] Chuẩn bị cho phase tiếp theo: Implementation of classes & interfaces

---

## Notes
- **Priority**: High - Đây là foundation cho development phase
- **Estimated Duration**: 2-3 ngày (thiết kế + review)
- **Dependencies**: None - có thể bắt đầu ngay
- **Blockers**: None
- **Next Step after this checklist**: Start implementing classes trong Spring Boot project
