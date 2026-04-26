# Skill: Generate Git Commit Message

## Goal
Tự động phân tích các thay đổi trong mã nguồn (git diff / git status) và sinh ra nội dung commit message chuẩn theo định dạng **Conventional Commits** để lịch sử Git luôn rõ ràng, dễ theo dõi.

## Trigger
Người dùng yêu cầu: "Tạo commit", "Viết commit message cho tôi", hoặc "Dùng commit skill".

## Execution Steps

### 1. Phân tích các thay đổi (Diff Analysis)
- Sử dụng lệnh `git status` để xem các file bị thay đổi (modified, added, deleted).
- Sử dụng lệnh `git diff` hoặc `git diff --staged` để xem chi tiết code bị sửa đổi.
- Hiểu ngữ cảnh của thay đổi: Sửa bug? Thêm tính năng mới? Refactor code? Hay chỉ cập nhật tài liệu?

### 2. Xác định Loại Commit (Type)
Dựa theo **Conventional Commits**, chọn một "type" phù hợp nhất:
- `feat`: Thêm một tính năng mới (Ví dụ: Thêm API đăng ký).
- `fix`: Sửa một lỗi (Ví dụ: Sửa lỗi NullPointerException).
- `docs`: Cập nhật tài liệu (Ví dụ: Thêm Swagger, sửa README, Memory Bank).
- `style`: Đổi format code (khoảng trắng, dấu phẩy, v.v. Không ảnh hưởng logic).
- `refactor`: Viết lại code nhưng không đổi logic (không fix bug, không thêm tính năng).
- `test`: Thêm hoặc sửa Unit test / Integration test.
- `chore`: Cập nhật cấu hình build, dependencies, tooling.

### 3. Viết Commit Message
- **Định dạng chuẩn:**
  ```text
  <type>([optional scope]): <mô tả ngắn gọn bằng tiếng Anh hoặc tiếng Việt>

  [optional body: Giải thích chi tiết LÝ DO thay đổi (tại sao làm vậy?)]
  ```
- **Quy tắc:**
  - Header (dòng đầu) không quá 50-72 ký tự.
  - Body cách Header một dòng trống.

### 4. Gợi ý lệnh Git
- Trả về commit message đã sinh ra ở trong một khối block code.
- Cung cấp sẵn luôn lệnh `git commit -m "..."` để người dùng chỉ việc copy-paste vào terminal.

**Ví dụ kết quả mong đợi:**
```bash
git commit -m "feat(payment): integrate ZaloPay callback logic

- Added HMAC validation for ZaloPay webhook
- Triggered Kafka EnrollmentEvent on success
- Handled invalid MAC scenarios"
```

### 5. Thông báo hoàn tất
- Yêu cầu người dùng review lại nội dung commit xem đã khớp ý muốn chưa trước khi họ tự chạy lệnh.
