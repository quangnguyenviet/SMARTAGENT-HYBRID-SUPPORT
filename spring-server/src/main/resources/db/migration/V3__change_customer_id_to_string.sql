-- Thay đổi kiểu dữ liệu của customer_id từ BIGINT sang VARCHAR(100)
-- Lưu ý: CAST dữ liệu cũ sang chuỗi
ALTER TABLE conversations ALTER COLUMN customer_id TYPE VARCHAR(100) USING customer_id::VARCHAR(100);

-- Cập nhật index (nếu cần, nhưng thường PostgreSQL tự cập nhật index type)
-- Tuy nhiên để chắc chắn và sạch sẽ, ta có thể drop và create lại index
DROP INDEX IF EXISTS idx_conversations_customer_id;
CREATE INDEX idx_conversations_customer_id ON conversations(customer_id);
