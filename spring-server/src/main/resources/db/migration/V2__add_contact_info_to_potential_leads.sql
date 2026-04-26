-- =========================
-- V2: Thêm thông tin liên hệ khách hàng vào potential_leads
-- Dùng cho tính năng: Bot tự động xin SĐT/email khi phát hiện lead tiềm năng
-- =========================

ALTER TABLE potential_leads
    ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS phone        VARCHAR(20),
    ADD COLUMN IF NOT EXISTS email        VARCHAR(100),
    ADD COLUMN IF NOT EXISTS contact_collected_at TIMESTAMP;

-- Xóa cột estimated_value nếu vẫn còn tồn tại từ V1
ALTER TABLE potential_leads
    DROP COLUMN IF EXISTS estimated_value;
