-- =========================
-- 1. Conversations
-- =========================
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    channel VARCHAR(50) DEFAULT 'web',
    status VARCHAR(20) DEFAULT 'OPEN',
    is_bot_active BOOLEAN DEFAULT TRUE,
    lead_score INTEGER DEFAULT 0,
    assigned_agent_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 2. Messages
-- =========================
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender VARCHAR(100),
    sender_type VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_messages_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE
);

-- =========================
-- 3. Potential Leads
-- =========================
CREATE TABLE potential_leads (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    intent_summary TEXT,
    estimated_value NUMERIC(15,2),
    priority VARCHAR(10),

    CONSTRAINT fk_leads_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE
);

-- =========================
-- 4. Indexes
-- =========================
CREATE INDEX idx_conversations_customer_id 
ON conversations(customer_id);

CREATE INDEX idx_conversations_channel 
ON conversations(channel);

CREATE INDEX idx_messages_conversation_id 
ON messages(conversation_id);

CREATE INDEX idx_messages_timestamp 
ON messages(timestamp DESC);

CREATE INDEX idx_leads_conversation_id 
ON potential_leads(conversation_id);

