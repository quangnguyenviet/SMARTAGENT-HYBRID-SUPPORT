package com.example.spring_server.orchestrator.client;

import com.example.spring_server.orchestrator.dto.AiAnalysisResult;

import java.util.List;

public interface AiScoringClient {
    
    /**
     * Phân tích tin nhắn mới nhất dựa trên ngữ cảnh lịch sử
     * 
     * @param currentMessage Tin nhắn vừa nhận
     * @param history Lịch sử các tin nhắn trước đó (để AI hiểu ngữ cảnh)
     * @return Kết quả phân tích (điểm số, ý định, câu trả lời)
     */
    AiAnalysisResult analyzeMessage(String currentMessage, List<String> history);
}
