package com.example.spring_server.orchestrator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisResult {
    /**
     * Câu trả lời gợi ý hoặc tự động từ AI
     */
    private String reply;
    
    /**
     * Ý định của khách hàng (e.g., inquiry, pricing, handover)
     */
    private String intent;
    
    /**
     * Phân tích cảm xúc (e.g., positive, neutral, negative)
     */
    private String sentiment;
    
    /**
     * Số điểm được cộng thêm dựa vào nội dung tin nhắn
     */
    private int scoreIncrement;

    /**
     * Thông tin trích xuất được từ tin nhắn (nếu có)
     */
    private String customerName;
    private String phone;
    private String email;
    
}
