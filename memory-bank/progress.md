# Theo Dõi Tiến Độ (Progress)

## Trạng Thái Tổng Quan
- **Giai đoạn (Phase)**: Khởi tạo (Phase 0)
- **Tình trạng**: Đang định hình tài liệu hệ thống và kiến trúc dựa trên ý tưởng từ `README.md`.

## Những Việc Đã Hoàn Thành (What Works)
- [x] Lên ý tưởng dự án và xác định các tính năng cốt lõi (Quy định tại `README.md`).
- [x] Định nghĩa mục tiêu trọng tâm: Tối ưu chốt đơn (Sales-ready) qua AI Handover.
- [x] Thiết lập cấu trúc Memory Bank với thông tin ngữ cảnh đầy đủ:
  - `projectbrief.md`
  - `productContext.md`
  - `systemPatterns.md`
  - `techContext.md`
  - `activeContext.md`

## Những Việc Đang Thực Hiện (Current Status)
- [x] Phê duyệt và chốt danh sách Tech Stack công nghệ (React, Spring Boot Monolith, FastAPI, Postgres, Redis).
- [x] Khởi tạo Spring Boot Backend Project cơ bản (Maven, Flyway migrations).
- [x] **Thiết kế chi tiết Chat Module** (1.1-1.4 trong checklist):
  - Package structure & analysis
  - Core classes & interfaces (2 entities, 2 repositories, service layer)
  - WebSocket & real-time communication (handler, config, 9 event types)
  - REST API endpoints & DTOs (9 endpoints, 6 DTOs)
- [ ] Thiết kế chi tiết Orchestrator Module (2.1-2.5 trong checklist)
- [ ] Thiết kế chi tiết Security Module (3.1-3.5 trong checklist)

## Những Việc Cần Làm Tiếp Theo (What's Left to Build)
- **Thiết Kế (Design)**:
  - Thiết kế chi tiết Orchestrator Module (AI integration, lead scoring, handover logic)
  - Thiết kế chi tiết Security Module (JWT, authentication, authorization)
  - Vẽ các sơ đồ kiến trúc (Architecture Diagram, Sequence Diagram, Data Flow)
  - Thiết kế Mockup/Wireframe cho Sales-Centric Dashboard.
- **Phát Triển (Development)**:
  - Implement classes & interfaces theo design (Chat Module - ready to implement)
  - Implement Orchestrator Module classes
  - Implement Security Module classes
  - Khởi tạo Frontend Project (React + Tailwind CSS).
  - Tích hợp kết nối kênh Chat (vd: Zalo, Facebook Messenger, Website).
  - Xây dựng mô-đun AI Intent & Sentiment Analysis.
  - Xây dựng hệ thống Routing / Handover Engine.
  - Xây dựng giao diện Dashboard cho Agent.
- **Kiểm Thử (Testing)**:
  - Kiểm thử độ mượt mà khi chuyển giao giữa Bot và Người.
  - Đánh giá tốc độ phản hồi của AI Sales Assist.
