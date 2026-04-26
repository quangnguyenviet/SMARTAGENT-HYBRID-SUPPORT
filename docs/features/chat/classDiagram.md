# Class Diagram: Chat Module

Tài liệu này mô tả cấu trúc các lớp (Class Diagram) cơ bản của tính năng Chat trong backend (Spring Boot). Sơ đồ thể hiện mối quan hệ giữa các Entities, Repositories, Service và Controllers.

## Biểu Đồ Lớp (Class Diagram)

```mermaid
classDiagram
    %% Định nghĩa các Entities
    class Conversation {
        -UUID id
        -String customerId
        -String channel
        -String status -- ACTIVE, COLLECTING_CONTACT, HANDED_OVER, CLOSED
        -Boolean isBotActive
        -Integer leadScore
        -Long assignedAgentId
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
        +getId() UUID
        +setStatus(String status) void
    }

    class PotentialLead {
        -UUID id
        -Conversation conversation
        -String intentSummary
        -String customerName
        -String phone
        -String email
        -LocalDateTime contactCollectedAt
        -String priority
    }

    class Message {
        -UUID id
        -Conversation conversation
        -String sender
        -String content
        -LocalDateTime timestamp
        +getId() UUID
        +getContent() String
    }

    %% Định nghĩa Repositories
    class ConversationRepository {
        <<Interface>>
        +findById(UUID id) Optional~Conversation~
        +findAllByOrderByUpdatedAtDesc() List~Conversation~
    }

    class MessageRepository {
        <<Interface>>
        +findByConversationIdOrderByTimestampAsc(UUID conversationId) List~Message~
    }

    class PotentialLeadRepository {
        <<Interface>>
        +findByConversationId(UUID conversationId) Optional~PotentialLead~
    }

    %% Định nghĩa Service
    class ChatService {
        -ConversationRepository conversationRepository
        -MessageRepository messageRepository
        -SimpMessagingTemplate messagingTemplate
        +createConversation(String customerId) Conversation
        +saveMessage(UUID conversationId, MessageDto dto) Message
        +getConversations() List~Conversation~
        +broadcastAdminEvent(EventPayload payload) void
    }

    class OrchestratorService {
        -ChatService chatService
        -AiScoringClient aiScoringClient
        -PotentialLeadRepository potentialLeadRepository
        -NotificationService notificationService
        +processUserMessage(UUID conversationId, String content) void
        -handleContactInfoMessage(Conversation conv, String content)
        -handleFreeTextContactMessage(Conversation conv, String content)
        -requestContactInfo(UUID id, Conversation conv, AiAnalysisResult result)
        -sendLeadEmail(PotentialLead lead, Conversation conv)
    }

    class AiScoringClient {
        <<Interface>>
        +analyzeMessage(String currentMessage, List~String~ history) AiAnalysisResult
        +summarizeConversation(List~String~ history) String
    }

    class NotificationService {
        <<Interface>>
        +sendLeadNotification(LeadNotificationData data) void
    }

    class NotificationServiceImpl {
        -JavaMailSender mailSender
        -TemplateEngine templateEngine
        +sendLeadNotification(LeadNotificationData data) void
    }

    class LeadNotificationData {
        -String customerName
        -String phone
        -String email
        -Integer leadScore
        -String intentSummary
        -String conversationSummary
        -Long conversationId
        -String conversationLink
    }

    %% Định nghĩa Controllers
    class ChatController {
        <<REST Controller>>
        -ChatService chatService
        +startConversation(Request dto) ResponseEntity
        +getConversationList() ResponseEntity
        +getChatHistory(UUID id) ResponseEntity
    }

    class ChatWebSocketController {
        <<WebSocket Controller>>
        -ChatService chatService
        +handleIncomingMessage(MessagePayload payload) void
    }

    %% Thiết lập các mối quan hệ (Relationships)
    Conversation "1" *-- "*" Message : contains
    Conversation "1" -- "0..1" PotentialLead : has
    
    ChatService ..> ConversationRepository : uses
    ChatService ..> MessageRepository : uses
    
    ChatController --> ChatService : injects
    ChatWebSocketController --> ChatService : injects
    ChatWebSocketController --> OrchestratorService : injects
    
    OrchestratorService --> ChatService : uses
    OrchestratorService --> AiScoringClient : uses
    OrchestratorService ..> PotentialLeadRepository : uses
    OrchestratorService --> NotificationService : uses
    
    NotificationServiceImpl ..|> NotificationService : implements
    NotificationService ..> LeadNotificationData : uses
```

## Chú Thích Các Thành Phần

1. **Entities (`Conversation`, `Message`)**:
   - Chịu trách nhiệm ánh xạ (ORM) với các bảng trong cơ sở dữ liệu PostgreSQL.
   - Một hội thoại (`Conversation`) có thể có nhiều tin nhắn (`Message`) theo quan hệ `One-to-Many`.

2. **Repositories (`ConversationRepository`, `MessageRepository`)**:
   - Kế thừa từ `JpaRepository`.
   - Cung cấp các phương thức truy vấn DB (ví dụ lấy danh sách hội thoại sắp xếp theo thời gian mới nhất, hoặc lấy tin nhắn theo `conversationId`).

3. **`ChatService` (Khối Logic Cốt Lõi)**:
   - Nhận yêu cầu từ cả REST API và WebSocket.
   - Thao tác với Repositories để lưu trữ/đọc dữ liệu.
   - Sử dụng `SimpMessagingTemplate` để đẩy thông điệp realtime (chẳng hạn như `broadcastAdminEvent` cho Dashboard Admin).

4. **Controllers (`ChatController`, `ChatWebSocketController`)**:
   - `ChatController`: Là REST API truyền thống, dùng cho các thao tác như tạo phòng lúc đầu, hoặc admin kéo lịch sử hội thoại khi mới mở trang.
   - `ChatWebSocketController`: Xử lý các luồng thông điệp đến qua kênh `/app/...` (MessageMapping).

5. **`WebSocketConfig`**: Cấu hình cơ sở cho STOMP/SockJS, định nghĩa các endpoint và message broker routing (ví dụ: `/topic`).

6. **Clients (`AdminClient`, `CustomerClient`)**:
   - Tượng trưng cho giao diện phía Frontend (React). Giao tiếp với backend qua HTTP REST để lấy dữ liệu tĩnh (như lịch sử), và qua WebSocket STOMP để truyền nhận tin nhắn/sự kiện realtime.
