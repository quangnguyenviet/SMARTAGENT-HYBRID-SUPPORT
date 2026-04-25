package com.example.spring_server.orchestrator.service;

public interface OrchestratorService {
    
    /**
     * Xử lý tin nhắn của người dùng, gọi AI phân tích và quyết định hành động tiếp theo
     * 
     * @param conversationId ID của cuộc hội thoại
     * @param content Nội dung tin nhắn của người dùng
     */
    void processUserMessage(Long conversationId, String content);
}
