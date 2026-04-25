# Ngữ Cảnh Kỹ Thuật (Tech Context)

## Trạng Thái Công Nghệ Hiện Tại
Dự án đang trong giai đoạn khởi tạo ý tưởng. Các công nghệ dưới đây là **đề xuất (proposed)** và sẽ được cập nhật khi dự án đi vào triển khai thực tế.

## Ngăn Xếp Công Nghệ (Proposed Tech Stack)

### 1. Frontend (Sales-Centric Dashboard)
- **Framework**: React.js hoặc Vue.js / Next.js (Nếu cần tối ưu SEO cho trang web).
- **Styling**: TailwindCSS hoặc UI Component Framework (MUI, Ant Design).
- **Real-time**: Socket.IO-client hoặc native WebSockets cho các tính năng realtime chat và notifications.

### 2. Backend (Core Services)
- **Ngôn ngữ/Framework**: Node.js (NestJS / Express) hoặc Python (FastAPI/Django) - Python rất mạnh để dễ dàng tích hợp các mô hình AI/NLP, Node.js mạnh về I/O realtime. Có thể kết hợp cả hai theo kiến trúc Microservices.
- **Real-time Communication**: Socket.IO hoặc SignalR / WebSocket server.
- **Message Broker**: RabbitMQ hoặc Kafka (Dùng để xử lý hàng đợi tin nhắn và kiến trúc Event-driven cho Handover).

### 3. AI & NLP Engine
- **LLM/NLP**: OpenAI API (GPT-4) hoặc các mô hình mã nguồn mở (Llama 3, Mistral) thông qua LangChain / LlamaIndex.
- **Sentiment & Intent Analysis**: Có thể fine-tune mô hình nhỏ để chạy nhanh (latency thấp) hoặc dùng zero-shot classification qua LLM.

### 4. Cơ Sở Dữ Liệu (Database)
- **Primary Database**: PostgreSQL / MySQL (Lưu trữ user, agent, cấu hình).
- **NoSQL / Chat History**: MongoDB (Lưu trữ cấu trúc tin nhắn linh hoạt) hoặc ElasticSearch (Được dùng để tìm kiếm ngữ cảnh hội thoại nhanh chóng).
- **Cache**: Redis (Lưu trữ phiên session, trạng thái hiện tại của hội thoại đang là Bot hay Human giữ).

## Yêu Cầu Kỹ Thuật Quan Trọng
- **Độ trễ thấp (Low Latency)**: Việc chuyển giao Handover cần diễn ra ở mức millisecond. Phản hồi của AI Sales Assist giới hạn trong 1-3 giây.
- **Tính sẵn sàng cao (High Availability)**: Hệ thống phải hoạt động 24/7 để không mất khách hàng.
