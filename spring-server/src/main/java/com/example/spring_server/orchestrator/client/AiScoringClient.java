package com.example.spring_server.orchestrator.client;

import com.example.spring_server.orchestrator.dto.AiAnalysisResult;

import java.util.List;

public interface AiScoringClient {
    
    /**
     * Phân tích tin nhắn mới nhất dựa trên ngữ cảnh lịch sử và trạng thái Lead.
     *
     * @param currentMessage Tin nhắn vừa nhận
     * @param history Lịch sử các tin nhắn trước đó (để AI hiểu ngữ cảnh)
     * @param isLead Trạng thái đã thu thập đủ thông tin liên hệ chưa
     * @param channel Kênh giao tiếp (web, facebook, ...)
     * @return Kết quả phân tích (điểm số, ý định, câu trả lời)
     */
    AiAnalysisResult analyzeMessage(String currentMessage, List<String> history, boolean isLead, String channel);

    /**
     * Tóm tắt toàn bộ hội thoại thành đoạn văn ngắn gọn cho nhân viên đọc trước khi tiếp nhận.
     *
     * @param history Toàn bộ lịch sử tin nhắn (format "senderType: content")
     * @return Đoạn tóm tắt súc tích bằng tiếng Việt
     */
    String summarizeConversation(List<String> history);
}
