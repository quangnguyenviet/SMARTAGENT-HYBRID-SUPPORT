CREATE TABLE bot_settings (
    id SERIAL PRIMARY KEY,
    handover_threshold INTEGER NOT NULL DEFAULT 50,
    business_prompt TEXT NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert cấu hình mặc định ban đầu
INSERT INTO bot_settings (handover_threshold, business_prompt) 
VALUES (50, 'SmartAgent là công ty chuyên cung cấp giải pháp AI Chatbot Hybrid kết hợp giữa AI và con người. Chúng tôi tập trung vào việc tối ưu chuyển đổi và hỗ trợ khách hàng đa kênh (Web, Facebook).');
