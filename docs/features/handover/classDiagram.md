# Class Diagram: Handover/Take Over

Sơ đồ lớp mô tả các thành phần tham gia vào luồng giành quyền hỗ trợ.

```mermaid
classDiagram
    class ChatController {
        <<REST Controller>>
        -ChatService chatService
        +takeOver(Long id, TakeOverRequest dto) ResponseEntity
    }

    class ChatService {
        <<Interface>>
        +takeOver(Long conversationId, Long agentId) void
        +disableBot(Long conversationId) void
    }

    class ChatServiceImpl {
        -ConversationRepository conversationRepo
        -SimpMessagingTemplate messagingTemplate
        +takeOver(Long conversationId, Long agentId) void
        +disableBot(Long conversationId) void
    }

    class OrchestratorService {
        -ChatService chatService
        -NotificationService notificationService
        +processUserMessage() void
        -sendLeadEmail() void
    }

    class Conversation {
        -Long id
        -Boolean isBotActive
        -String status
        -Long assignedAgentId
        +setBotActive(boolean active)
        +setStatus(String status)
    }

    class NotificationService {
        <<Interface>>
        +sendLeadNotification(data) void
    }

    ChatController --> ChatService : calls
    ChatServiceImpl ..|> ChatService : implements
    OrchestratorService --> ChatService : trigger automatic handover
    OrchestratorService --> NotificationService : notify agent
    ChatServiceImpl --> Conversation : updates state
```
