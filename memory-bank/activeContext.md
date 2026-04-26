# Ngữ Cảnh Hiện Tại (Active Context)

## Trạng Thái Dự Án
Dự án **SmartAgent Hybrid Support** đã hoàn thiện MVP với giao diện Landing Page + Chat Widget cho khách hàng và hệ thống AI Lead Scoring hoạt động thực tế.

- Backend Chat Module hoạt động ổn định với REST + WebSocket (STOMP).
- Frontend: Landing Page làm trang chủ, Chat Widget nổi ở góc phải, Admin Dashboard 3 cột riêng biệt.
- AI Scoring thực tế (Gemini qua OpenAI bridge) đang cộng điểm và phân tích Intent.
- Commit mới nhất: `c97c860`.

## Công Việc Đã Hoàn Thành Trong Phiên Vừa Rồi

### Giao Diện Khách Hàng (Frontend)
- **✅ Landing Page** (`LandingPage.jsx`): Trang giới thiệu công ty với thiết kế Glassmorphism/Gradient cao cấp.
- **✅ Chat Widget** (`ChatWidget.jsx`): Nút chat bong bóng nổi góc phải, khi nhấn mở popup chat. Component `ChatWindow` được giữ mounted liên tục để kết nối không bị reset.
- **✅ ChatWindow.jsx refactor**: Khôi phục toàn bộ logic kết nối bị mất. Loại bỏ màn hình "Connecting..." chặn toàn bộ giao diện. Ô nhập liệu luôn hiển thị ngay.
- **✅ App.jsx**: Route `/` dẫn đến Landing Page, Chat Widget gắn toàn cục trên tất cả các trang.

### Giao Diện Quản Trị (Admin)
- **✅ AdminDashboard.jsx**: Thêm Header riêng cho trang Admin (sau khi tách khỏi header chung). Cột AI Insights hiển thị dữ liệu thật từ AI thay vì Mock.
- **✅ `getConversationInsights()`**: Ưu tiên `intentSummary` thực từ Backend, chỉ fallback về logic suy luận khi thiếu dữ liệu.

### Backend (Spring Boot)
- **✅ Lead Scoring thực tế**: Sửa lỗi sự kiện `LEAD_SCORE_UPDATED` không mang dữ liệu hội thoại. Admin Dashboard giờ nhận được điểm mới ngay lập tức qua WebSocket.
- **✅ AI Prompt nâng cấp**: Cộng điểm linh hoạt hơn (+10 mỗi yêu cầu cụ thể, +20 hỏi giá, +30 thông tin liên hệ, +50 khiếu nại).
- **✅ Conversation Entity**: Thêm quan hệ `@OneToOne` với `PotentialLead` để map dữ liệu AI vào DTO.
- **✅ ConversationDTO**: Bổ sung trường `intentSummary` và `sentiment`.
- **✅ ChatServiceImpl**: Cập nhật `entityToDTO()` để điền dữ liệu từ `PotentialLead`.
- **✅ Xóa `estimatedValue`**: Loại bỏ hoàn toàn trường này khỏi Entity, DTO, AI Result và UI theo yêu cầu người dùng.
- **✅ Fix compile lỗi**: `chatService.getConversation().orElse(null)` thay thế phương thức không tồn tại.

## Các Quyết Định Quan Trọng
- **Chat Widget không re-mount**: Dùng CSS `hidden/flex` thay vì render có điều kiện `{isOpen && <ChatWindow/>}` để giữ kết nối WebSocket ổn định.
- **Không dùng màn hình Loading chặn toàn bộ UI**: `ChatWindow` luôn hiển thị giao diện, trạng thái kết nối chỉ là chấm nhỏ ở header.
- **Loại bỏ `estimatedValue`**: Theo yêu cầu người dùng, trường này không còn được phân tích hay hiển thị.
- **Gemini model**: Sử dụng `gemini-1.5-flash` (đã sửa lỗi gõ nhầm `2.5`).

## Bước Tiếp Theo
1. **Viết Flyway migration** để xóa cột `estimated_value` khỏi bảng `potential_leads` trong DB (tùy chọn, hiện không gây lỗi).
2. **Thiết kế Security Module** (JWT, phân quyền Admin/Agent).
3. **Test tích hợp** toàn bộ luồng: Khách chat → AI chấm điểm → Admin nhận điểm realtime → Take Over → Admin chat.
