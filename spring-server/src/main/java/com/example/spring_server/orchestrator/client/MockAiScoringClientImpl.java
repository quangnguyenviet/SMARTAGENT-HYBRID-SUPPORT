package com.example.spring_server.orchestrator.client;

import com.example.spring_server.orchestrator.dto.AiAnalysisResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/**
 * MockAiScoringClientImpl
 * 
 * Bản giả lập (Mock) của AI Service. 
 * Dùng rules cơ bản để phân tích chữ trong tin nhắn thay vì gọi API thực tế.
 */
@Service
@Slf4j
public class MockAiScoringClientImpl implements AiScoringClient {

    @Override
    public AiAnalysisResult analyzeMessage(String currentMessage, List<String> history) {
        log.info("Mock AI is analyzing message: {}", currentMessage);
        
        String lowerMsg = currentMessage.toLowerCase();
        
        AiAnalysisResult result = AiAnalysisResult.builder()
                .intent("neutral")
                .sentiment("neutral")
                .scoreIncrement(0)
                .reply("Dạ, em nghe đây ạ. Anh/chị cần hỗ trợ gì thêm không?")
                .build();

        // Rule 1: Khách hàng muốn gặp nhân viên thật
        if (lowerMsg.contains("nhân viên") || lowerMsg.contains("người thật") || lowerMsg.contains("tư vấn viên")) {
            result.setIntent("handover");
            result.setScoreIncrement(20);
            result.setReply("Dạ vâng, hệ thống đang kết nối anh/chị với chuyên viên tư vấn. Xin vui lòng đợi trong giây lát...");
        } 
        // Rule 2: Khách hàng hỏi giá (Hot Lead)
        else if (lowerMsg.contains("giá") || lowerMsg.contains("bao nhiêu") || lowerMsg.contains("chi phí")) {
            result.setIntent("pricing");
            result.setScoreIncrement(15);
            result.setSentiment("positive");
            result.setEstimatedValue(new BigDecimal("5000000")); // Vd: 5 triệu
            result.setReply("Sản phẩm bên em có nhiều mức giá tùy theo gói cấu hình. Anh/chị có ngân sách khoảng bao nhiêu ạ để em tư vấn cho phù hợp?");
        }
        // Rule 3: Khách hàng không hài lòng
        else if (lowerMsg.contains("lỗi") || lowerMsg.contains("bực") || lowerMsg.contains("chậm")) {
            result.setIntent("complain");
            result.setSentiment("negative");
            result.setScoreIncrement(5); // Có thể chuyển cho nhân viên xử lý khiếu nại
            result.setReply("Dạ em xin lỗi vì sự bất tiện này. Em sẽ ghi nhận lại sự việc và nhờ nhân viên hỗ trợ anh/chị ngay ạ.");
        }
        
        try {
            // Giả lập độ trễ của AI (network + processing)
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        return result;
    }
}
