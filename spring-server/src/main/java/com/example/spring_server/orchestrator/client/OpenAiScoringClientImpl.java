package com.example.spring_server.orchestrator.client;

import com.example.spring_server.orchestrator.dto.AiAnalysisResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * OpenAiScoringClientImpl
 * 
 * Triển khai AI thực tế sử dụng OpenAI thông qua Spring AI.
 */
@Service
@ConditionalOnProperty(name = "app.ai.use-mock", havingValue = "false")
@Slf4j
public class OpenAiScoringClientImpl implements AiScoringClient {

    private final ChatClient chatClient;

    @Value("${app.ai.business-context}")
    private String businessContext;

    public OpenAiScoringClientImpl(ChatClient.Builder builder) {
        this.chatClient = builder
                .defaultSystem("""
                    Bạn là một AI Consultant chuyên nghiệp cho công ty phần mềm SmartAgent.
                    Ngữ cảnh doanh nghiệp: {businessContext}
                    
                    QUY TRÌNH TƯ VẤN (3 GIAI ĐOẠN):
                    - GĐ 1 (Sàng lọc & Tư vấn sơ bộ): Khi khách mới nêu nhu cầu chung chung, bạn PHẢI đặt câu hỏi khai thác thêm (Ví dụ: 'Bạn cần các tính năng chính nào?', 'Số lượng nhân viên quy mô bao nhiêu?', 'Chạy trên Web hay Mobile?'). Hãy đưa ra 1-2 lời khuyên chuyên môn ngắn gọn để khách thấy tin tưởng.
                    - GĐ 2 (Phát hiện tín hiệu mua hàng): Chỉ khi khách hỏi về 'giá cả', 'chi phí', 'thời gian hoàn thành', hoặc yêu cầu 'tư vấn trực tiếp/gặp mặt', bạn mới đặt intent là 'handover'.
                    - GĐ 3 (Handover): Thông báo hệ thống đang kết nối với chuyên gia để báo giá và đề xuất solution chi tiết.
                    
                    NHIỆM VỤ CỤ THỂ:
                    1. Phân tích tin nhắn dựa trên lịch sử hội thoại.
                    2. Xác định Intent (pricing, duration, handover, technical, general_inquiry, neutral).
                    3. Đánh giá cảm xúc (positive, negative, neutral).
                    4. Chấm điểm tiềm năng (scoreIncrement):
                       - +5: Khách trả lời các câu hỏi khai thác của bạn.
                       - +15: Khách mô tả bài toán rất chi tiết.
                       - +20: Khách hỏi giá, thời gian, hoặc yêu cầu gặp người thật (Trigger Handover).
                    5. Ước tính giá trị (estimatedValue) nếu khách nhắc đến ngân sách.
                    
                    YÊU CẦU TRẢ LỜI (REPLY):
                    - Lịch sự, chuyên nghiệp, xưng hô phù hợp (anh/chị).
                    - KHÔNG chuyển giao ngay ở câu đầu tiên nếu khách chưa hỏi chi tiết hoặc hỏi giá.
                    
                    YÊU CẦU ĐỊNH DẠNG: Trả về kết quả JSON khớp với Java class AiAnalysisResult.
                    """)
                .build();
    }

    @Override
    public AiAnalysisResult analyzeMessage(String currentMessage, List<String> history) {
        log.info("OpenAI is analyzing message: {}", currentMessage);

        String contextHistory = String.join("\n", history);

        try {
            return chatClient.prompt()
                    .system(s -> s.param("businessContext", businessContext))
                    .user(u -> u
                            .text("""
                                Lịch sử hội thoại:
                                {history}
                                
                                Tin nhắn mới nhất của khách hàng:
                                {message}
                                """)
                            .param("history", contextHistory)
                            .param("message", currentMessage)
                    )
                    .call()
                    .entity(AiAnalysisResult.class);
        } catch (Exception e) {
            log.error("Error calling OpenAI API: ", e);
            // Fallback an toàn khi API gặp lỗi
            return AiAnalysisResult.builder()
                    .intent("neutral")
                    .sentiment("neutral")
                    .scoreIncrement(0)
                    .reply("Dạ, em đã ghi nhận yêu cầu của anh/chị. Anh/chị vui lòng đợi trong giây lát để chuyên viên của SmartAgent kiểm tra và phản hồi kỹ hơn nhé.")
                    .build();
        }
    }
}
