# Sequence Diagram: Web Channel Flow

Tài liệu này mô tả chi tiết luồng hoạt động (sequence) của kênh Web (Chat Widget) từ lúc khởi tạo đến khi thu thập thông tin khách hàng (Lead) và tương tác với Admin.

## 1. Khởi tạo kết nối (Connection & Handshake)

Khi khách hàng truy cập website, Widget sẽ kiểm tra Session và thiết lập kết nối realtime.

```mermaid
sequenceDiagram
    autonumber
    
    participant User as Khách hàng (Browser)
    participant Widget as Web Chat Widget
    participant Server as Spring Boot Server
    participant DB as Database

    User->>Widget: Truy cập Website
    Widget->>Widget: Check sessionStorage (customerId/conversationId)
    
    alt Chưa có hội thoại
        Widget->>Server: POST /api/conversations (channel='WEB')
        Server->>DB: Lưu Conversation mới
        Server-->>Widget: Trả về conversationId & customerId
        Widget->>Widget: Lưu vào sessionStorage
    else Đã có hội thoại
        Widget->>Server: GET /api/conversations/{id}/messages/recent
        Server-->>Widget: Trả về lịch sử tin nhắn gần nhất
    end

    Widget->>Server: Kết nối WebSocket (/ws) via STOMP
    Server-->>Widget: Connected
    Widget->>Server: Subscribe /topic/chat/{conversationId}
```

## 2. Luồng gửi tin nhắn & AI Phản hồi (Messaging Flow)

Mô tả cách tin nhắn được truyền tải realtime qua WebSocket và được AI xử lý.

```mermaid
sequenceDiagram
    autonumber
    
    participant User as Khách hàng
    participant Widget as Web Chat Widget
    participant WS as WebSocket Broker
    participant WSC as ChatWebSocketController
    participant CS as ChatService
    participant OS as OrchestratorService
    participant AI as Gemini AI
    participant Admin as Admin Dashboard

    User->>Widget: Nhập tin nhắn & Gửi
    Widget->>Widget: Hiển thị tin nhắn tạm thời (UI)
    Widget->>WS: SEND /app/chat.sendMessage (USER_MESSAGE)
    
    WS->>WSC: Dispatch message payload
    WSC->>CS: sendMessage(conversationId, content)
    CS->>DB: Lưu Message (senderType='user')
    CS->>WS: Broadcast to /topic/chat/{id}
    WS-->>Widget: Cập nhật trạng thái 'Đã gửi'
    WS-->>Admin: Hiển thị tin nhắn mới (realtime)

    WSC->>OS: processUserMessage(id, content)
    OS->>AI: Phân tích Intent & Chấm điểm Lead
    AI-->>OS: Trả về Intent + Phản hồi + Lead Score
    
    OS->>CS: sendBotReply(reply)
    CS->>DB: Lưu Message (senderType='bot')
    CS->>WS: Broadcast to /topic/chat/{id}
    WS-->>Widget: Hiển thị phản hồi của Bot
```

## 3. Luồng Thu thập thông tin (Lead Capture Flow)

Khi AI nhận diện khách hàng tiềm năng (Score >= 50), hệ thống sẽ yêu cầu thông tin liên hệ.

```mermaid
sequenceDiagram
    autonumber
    
    participant OS as OrchestratorService
    participant AI as Gemini AI
    participant CS as ChatService
    participant WS as WebSocket Broker
    participant Widget as Web Chat Widget
    participant User as Khách hàng

    Note over OS, AI: Trong quá trình xử lý tin nhắn
    AI-->>OS: Lead Score: 65, status: 'COLLECTING_INFO'
    
    OS->>CS: sendBotReply("Vui lòng để lại SĐT để chúng tôi hỗ trợ tốt nhất")
    CS->>WS: Broadcast tin nhắn Bot
    WS-->>Widget: Hiển thị yêu cầu thu thập thông tin
    
    User->>Widget: Nhập SĐT/Email
    Widget->>WS: SEND /app/chat.sendMessage
    WS->>OS: processUserMessage
    
    OS->>OS: Trích xuất SĐT/Email từ text
    OS->>DB: Cập nhật PotentialLead (name, phone, email)
    OS->>CS: sendBotReply("Cảm ơn bạn! Nhân viên sẽ liên hệ sớm.")
```

## 4. Admin Tiếp quản (Handover)

Khi Admin muốn can thiệp vào cuộc trò chuyện.

```mermaid
sequenceDiagram
    autonumber
    
    participant Admin as Admin Dashboard
    participant CC as ChatController
    participant CS as ChatService
    participant WS as WebSocket Broker
    participant Widget as Web Chat Widget

    Admin->>CC: POST /api/conversations/{id}/takeover
    CC->>CS: takeOver(id, agentId)
    CS->>DB: Update conversation status = 'MANUAL', isBotActive = false
    CS->>WS: Broadcast event 'HANDOVER'
    WS-->>Widget: (Tùy chọn) Thông báo nhân viên đã vào hỗ trợ
    
    Admin->>WS: SEND /app/chat.sendMessage (AGENT_MESSAGE)
    WS-->>Widget: Hiển thị tin nhắn từ Admin
```

## Ghi chú kỹ thuật
1. **WebSocket Protocol**: Sử dụng STOMP trên nền tảng WebSocket tiêu chuẩn.
2. **Persistence**: Lịch sử tin nhắn luôn được lưu vào Database trước khi broadcast.
3. **Typing Indicator**: Widget gửi event `TYPING_INDICATOR` lên `/app/chat.sendMessage` để Admin biết khách đang soạn tin.
