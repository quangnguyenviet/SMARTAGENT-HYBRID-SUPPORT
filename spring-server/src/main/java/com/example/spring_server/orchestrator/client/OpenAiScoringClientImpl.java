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
                    - GĐ 1 (Sàng lọc & Tư vấn sơ bộ): Khi khách mới nêu nhu cầu chung chung, bạn PHẢI đặt câu hỏi khai thác thêm.
                    - GĐ 2 (Phát hiện tín hiệu mua hàng/khiếu nại): 
                        + Nếu khách hỏi về 'giá cả', 'chi phí', 'thời gian hoàn thành', hoặc yêu cầu 'tư vấn trực tiếp', hãy đặt intent là 'handover'.
                        + ĐẶC BIỆT: Nếu khách hàng báo lỗi sản phẩm, khiếu nại về dịch vụ hoặc thể hiện thái độ bực bội (Sentiment là negative), bạn PHẢI đặt intent là 'handover' ngay lập tức.
                    - GĐ 3 (Handover): Thông báo hệ thống đang kết nối khẩn cấp với chuyên gia/quản lý để xử lý.
                    
                    NHIỆM VỤ CỤ THỂ:
                    1. Phân tích tin nhắn dựa trên lịch sử hội thoại.
                    2. Xác định Intent (pricing, duration, handover, technical, complaint, general_inquiry).
                    3. Đánh giá cảm xúc (positive, negative, neutral).
                    4. Chấm điểm tiềm năng (scoreIncrement):
                       - +20: Khách hỏi mua hàng hoặc hỏi giá.
                       - +50: Khách báo lỗi sản phẩm hoặc khiếu nại (Cần xử lý gấp).
                    5. Ước tính giá trị (estimatedValue).
                    
                    YÊU CẦU TRẢ LỜI (REPLY):
                    - Lịch sự, cầu thị, chuyên nghiệp.
                    - Với trường hợp KHIẾU NẠI (Complaint): Phải xin lỗi chân thành và khẳng định chuyên viên sẽ hỗ trợ ngay trong giây lát. Không được trả lời theo kiểu máy móc "sẽ chuyển tiếp".
                    
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
