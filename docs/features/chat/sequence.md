# Sequence Diagram: Push Realtime cho Admin Dashboard

Tài liệu này mô tả luồng hoạt động (sequence) của tính năng đẩy dữ liệu (push) realtime cho Admin Dashboard thông qua kênh WebSocket. Việc này thay thế giải pháp polling, giúp Admin theo dõi các cuộc hội thoại và tin nhắn mới ngay lập tức.

## Biểu Đồ Tuần Tự (Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    
    participant AdminClient as AdminClient (React)
    participant CustomerClient as CustomerClient (React)
    participant ChatController as ChatController
    participant ChatWebSocketController as ChatWebSocketController
    participant ChatService as ChatService
    participant OrchestratorService as OrchestratorService
    participant AiScoringClient as AiScoringClient
    participant Repositories as Conversation/Message<br/>Repositories
    participant SimpMessagingTemplate as SimpMessagingTemplate
    participant WSBroker as WebSocket Broker

    %% Giai đoạn 1: Admin Khởi tạo kết nối
    rect rgb(0, 0, 0)
    Note over AdminClient, WSBroker: 1. Khởi tạo kết nối & Subscribe Topic
    AdminClient->>WSBroker: Connect WebSocket STOMP (/ws)
    WSBroker-->>AdminClient: Connected
    AdminClient->>WSBroker: subscribeToAdminTopic()<br/>-> /topic/admin/conversations
    end

    %% Giai đoạn 2: Khách hàng Tương tác
    rect rgb(0, 0, 0)
    Note over CustomerClient, Repositories: 2. Khách hàng tạo hội thoại / gửi tin nhắn
    
    %% Khách tạo hội thoại qua REST
    CustomerClient->>ChatController: startConversation(Request dto) (REST HTTP)
    ChatController->>ChatService: createConversation(customerId)
    ChatService->>Repositories: save(Conversation)
    Repositories-->>ChatService: Conversation Entity
    ChatService-->>ChatController: return
    ChatController-->>CustomerClient: ResponseEntity (OK)

    %% Khách gửi tin nhắn qua WebSocket
    CustomerClient->>ChatWebSocketController: sendMessage() -> handleIncomingMessage(payload)
    ChatWebSocketController->>ChatService: saveMessage(dto)
    ChatService->>Repositories: save(Message)
    Repositories-->>ChatService: Message Entity
    ChatService-->>ChatWebSocketController: Broadcast user message

    %% Orchestrator can thiệp
    Note over ChatWebSocketController, AiScoringClient: Orchestrator đánh giá AI (Bất đồng bộ)
    ChatWebSocketController->>OrchestratorService: processUserMessage()
    OrchestratorService->>AiScoringClient: analyzeMessage(currentMsg, history)
    AiScoringClient-->>OrchestratorService: AiAnalysisResult (intent, score, reply)
    OrchestratorService->>Repositories: Update Lead Score & PotentialLead
    
    alt If Intent == Handover or Score >= 50
        OrchestratorService->>ChatService: updateConversationStatus(HANDED_OVER)
        ChatService->>SimpMessagingTemplate: Broadcast LEAD_SCORE_UPDATED / HANDOVER_TRIGGERED
    else If Status is still ACTIVE
        OrchestratorService->>ChatService: sendMessage(botReply)
        ChatService->>Repositories: save(Bot Message)
        ChatService->>SimpMessagingTemplate: Broadcast bot message
    end
    end
    
    %% Giai đoạn 3: Push Notification Realtime cho Admin
    rect rgb(0, 0, 0)
    Note over ChatService, AdminClient: 3. Đẩy sự kiện Realtime tới Admin Dashboard
    ChatService->>SimpMessagingTemplate: broadcastAdminEvent(EventPayload)
    SimpMessagingTemplate->>WSBroker: send to /topic/admin/conversations
    Note right of WSBroker: Payload: EventType (CONVERSATION_UPDATED, NEW_MESSAGE)
    WSBroker->>AdminClient: Broadcast Message (JSON Payload)
    AdminClient->>AdminClient: renderConversations() (Update State & Re-render)
    end
```

## Chú Thích Các Bước

1. **Khởi tạo kết nối Admin (`AdminClient`)**: Khi Admin vào màn hình `/admin`, giao diện React ngay lập tức tạo kết nối STOMP qua WebSocket Broker và gọi `subscribeToAdminTopic()` để đăng ký lắng nghe tại topic `/topic/admin/conversations`.
2. **Khách hàng tương tác (`CustomerClient`)**: Tùy vào hành động cụ thể, giao diện khách hàng sẽ gọi `ChatController` qua HTTP REST (khi khởi tạo hội thoại mới) hoặc thông qua `ChatWebSocketController` (khi gửi tin nhắn realtime). Từ đó, `ChatService` sẽ điều phối luồng và gọi Repositories (`ConversationRepository`, `MessageRepository`) để lưu CSDL.
3. **Push Event Realtime (`ChatService`)**: Đây là logic cốt lõi. Sau khi dữ liệu được lưu thành công, `ChatService` sẽ gọi tới hàm `broadcastAdminEvent()`, bản chất là truyền qua `SimpMessagingTemplate` để bắn một thông điệp Broadcast.
4. **Cập nhật UI (`AdminClient`)**: WebSocket Broker phân phối tin nhắn dạng JSON Event cho AdminClient. Frontend lập tức gọi hàm `renderConversations()` để tự động cập nhật State (đưa hội thoại lên top, thêm tin nhắn), hiển thị trực tiếp mà không cần chờ chu kỳ lấy dữ liệu (polling) tiếp theo.
