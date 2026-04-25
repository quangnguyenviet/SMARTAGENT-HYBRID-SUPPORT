# Ngữ Cảnh Kỹ Thuật (Tech Context)

## Trạng Thái Công Nghệ Hiện Tại
Dự án đã chốt danh sách công nghệ (Tech Stack) cốt lõi. Tạm thời phần Backend (Spring Boot) sẽ được thiết kế theo hướng **Modular Monolith** để đẩy nhanh tốc độ phát triển trong giai đoạn đầu.

## Ngăn Xếp Công Nghệ (Tech Stack)

### 1. Frontend (Giao diện Quản trị & Chat)
- **Framework**: React.js
- **Thư viện UI**: Tailwind CSS (giúp layout Dashboard nhanh, hiện đại) kết hợp với Lucide React cho hệ thống icon.
- **State Management**: React Context API hoặc Redux Toolkit (quản lý danh sách hội thoại realtime).
- **Real-time**: Stomp.js & SockJS (kết nối WebSocket với Spring Boot).
- **Data Visualization**: Recharts (vẽ biểu đồ tỉ lệ chốt đơn, điểm tiềm năng cho Dashboard).

### 2. Backend (Spring Boot - Linh hồn điều phối)
- Thiết kế theo hướng **Modular Monolith** (Tạm thời gom các luồng xử lý vào một ứng dụng Spring Boot duy nhất nhưng chia package rõ ràng để sau này dễ tách thành Microservices).
- **Core Modules**: 
  - *Chat Module*: Xử lý kết nối WebSocket, lưu trữ lịch sử hội thoại vào PostgreSQL.
  - *Orchestrator Module*: Điều phối tin nhắn. Khi có tin nhắn mới, đẩy sang AI Service (bên ngoài) để "chấm điểm".
  - *Security Module*: Spring Security & JWT (phân quyền giữa Agent/Nhân viên và Admin/Quản lý).

### 3. AI/NLP Service (Python - FastAPI)
- Thay vì dùng Java cho NLP, hệ thống sử dụng FastAPI (Python) để tận dụng hệ sinh thái AI phong phú.
- **Mô hình NLP**:
  - *Option 1 (Nhanh & Mạnh)*: Gọi API của Gemini 1.5 Flash hoặc OpenAI. Viết Prompt tối ưu để trả về định dạng JSON (VD: `Intent: Potential, Score: 90`).
  - *Option 2 (Tự chủ)*: Sử dụng thư viện PhởBERT hoặc VinAI/underthesea để phân tích cảm xúc và trích xuất từ khóa tiềm năng cục bộ (tiếng Việt).
- **Communication**: Giao tiếp với Spring Boot qua REST API (sử dụng RestTemplate hoặc OpenFeign bên phía Spring).

### 4. Database & Storage
- **PostgreSQL**: Lưu trữ dữ liệu có cấu trúc (Thông tin khách hàng, Danh sách Lead, Lịch sử chat).
- **Redis**: Lưu trữ "Trạng thái hội thoại" (Session state). Ví dụ: `conversation_123 -> {is_bot_active: true, current_score: 45}`. Giúp quá trình chuyển giao (Handover) diễn ra với độ trễ gần như bằng 0.

## Yêu Cầu Kỹ Thuật Quan Trọng
- **Độ trễ thấp (Low Latency)**: Cực kỳ quan trọng ở khâu Handover. Sự kết hợp của Redis và WebSocket giúp đảm bảo điều này.
- **Tính tách biệt (Decoupling)**: AI Service và Chat Service hoạt động độc lập qua Orchestrator.
