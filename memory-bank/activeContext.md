# Ngữ Cảnh Hiện Tại (Active Context)

## Trạng Thái Dự Án
Dự án **SmartAgent Hybrid Support** hiện đang ở giai đoạn khởi tạo (Phase 0: Ideation & Documentation). Hệ thống đang được định hình về mặt khái niệm và thiết lập cấu trúc tài liệu cơ bản.

## Công Việc Đang Thực Hiện
- Thiết lập thư mục và cấu trúc Memory Bank.
- Chuyển đổi các yêu cầu kinh doanh từ `README.md` sang các tài liệu kiến trúc, ngữ cảnh kỹ thuật.
- Xác định quy trình nghiệp vụ chính (Smart Screening -> Lead Scoring -> Live Sales -> Post-Sales).

## Các Quyết Định Mới Nhất
- Lựa chọn mô hình Hybrid (AI + Human) với cơ chế Handover dựa trên Intent/Sentiment Analysis làm nòng cốt.
- Thiết kế hệ thống nhắm mục tiêu "Sales-Centric" thay vì chỉ là công cụ Support đơn thuần.
- **Chốt Tech Stack cốt lõi**:
  - Frontend: React.js + Tailwind CSS.
  - Backend: Spring Boot **Modular Monolith** (Gom chung luồng Chat, Orchestrator, Security vào một app).
  - AI Service: Python FastAPI (Gọi LLM API hoặc dùng PhởBERT, chạy độc lập).
  - Database: PostgreSQL & Redis (cho Session State để Handover không độ trễ).

## Bước Tiếp Theo
1. Vẽ các sơ đồ kiến trúc (Architecture Diagram) và luồng dữ liệu (Data Flow Diagram) chi tiết cho kiến trúc Modular Monolith này.
2. Thiết kế Mockup/Wireframe cho Sales-Centric Dashboard.
3. Xây dựng Proof of Concept (PoC) cho luồng Lead Scoring và AI Handover.
