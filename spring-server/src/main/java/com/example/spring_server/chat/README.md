# Chat Module

## Mục Đích
Chat Module quản lý toàn bộ logic liên quan đến WebSocket connection, message persistence, và conversation state management. Đây là module trung tâm cho real-time communication giữa Customer và Bot/Agent.

## Package Structure
```
com.example.spring_server.chat/
├── controller/       # REST Controllers cho Chat endpoints
├── service/         # Business logic & orchestration
├── entity/          # JPA Entities (Conversation, Message)
├── repository/      # Repository interfaces (DAO pattern)
├── dto/             # Data Transfer Objects cho API & WebSocket
├── config/          # WebSocket & Module configurations
├── handler/         # WebSocket Handlers & message processors
└── README.md        # This file
```

## Trách Nhiệm Của Từng Package

### controller/
- **ChatController**: REST endpoints để manage conversations
  - `GET /api/conversations/{id}` - lấy lịch sử hội thoại
  - `POST /api/conversations` - tạo hội thoại mới
  - `DELETE /api/conversations/{id}` - xóa hội thoại
  - `GET /api/conversations/{id}/messages` - lấy danh sách messages

### service/
- **ChatService** (Interface): Define business operations
- **ChatServiceImpl**: Implementation của ChatService
  - Quản lý conversation lifecycle
  - Xử lý message persistence
  - Cập nhật conversation state

### entity/
- **Conversation**: JPA Entity đại diện cho một cuộc hội thoại
  - Fields: id, customerId, channel (e.g., "zalo", "fb", "website"), status, createdAt, updatedAt
  - Relationships: one-to-many with Message
  
- **Message**: JPA Entity đại diện cho một tin nhắn
  - Fields: id, conversationId, sender, senderType (USER/BOT/AGENT), content, timestamp
  - Relationships: many-to-one with Conversation

### repository/
- **ConversationRepository** (extends JpaRepository)
  - Custom queries: findByCustomerId, findByChannel, etc.
  
- **MessageRepository** (extends JpaRepository)
  - Custom queries: findByConversationId, findRecentMessages, etc.

### dto/
- **MessageDTO**: DTO cho message gửi/nhận qua WebSocket & REST API
  - Fields: conversationId, sender, senderType, content, timestamp
  
- **ConversationDTO**: DTO cho conversation
  - Fields: id, customerId, channel, status, createdAt, lastMessageTime
  
- **WebSocketMessageDTO**: Specialized DTO cho WebSocket messages
  - Additional fields: event_type (USER_MESSAGE, BOT_RESPONSE, HANDOVER_NOTIFICATION)

### config/
- **WebSocketConfig**: Spring WebSocket configuration
  - Register WebSocket handlers
  - Configure message broker (if using RabbitMQ/Kafka)
  - CORS settings
  
- **ChatModuleConfig**: Bean definitions cho Chat Module
  - Define ChatService bean
  - Define custom converter beans if needed

### handler/
- **ChatWebSocketHandler**: Xử lý WebSocket events
  - afterConnectionEstablished: trigger khi client connect
  - handleTextMessage: xử lý incoming messages
  - afterConnectionClosed: cleanup khi client disconnect
  
- **ChatMessageEventProcessor**: Process messages & trigger downstream actions
  - Save message to DB
  - Publish event to Orchestrator Module (Message scoring, handover logic)

---

## Data Flow
```
Client (WebSocket)
    ↓
ChatWebSocketHandler (afterConnectionEstablished)
    ↓
ChatService.sendMessage()
    ↓
MessageRepository.save() [Persist to PostgreSQL]
    ↓
ChatMessageEventProcessor [Publish event]
    ↓
Orchestrator Module [Score & decide handover]
```

## Key Design Patterns
- **Repository Pattern**: Abstraction for data access
- **Service Pattern**: Business logic encapsulation
- **Handler Pattern**: WebSocket event processing
- **DTO Pattern**: Separation of internal entities from external API contracts
- **Event Publishing**: Loose coupling with Orchestrator Module

---

## Next Steps
1. Implement Conversation & Message entities with JPA annotations
2. Implement ChatService & repositories
3. Configure WebSocket in WebSocketConfig
4. Implement ChatWebSocketHandler
5. Create DTO classes
6. Create REST endpoints in ChatController
