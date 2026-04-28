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

    private static final String SYSTEM_PROMPT_TEMPLATE = """
            Bạn là một AI Consultant chuyên nghiệp cho công ty phần mềm SmartAgent.
            Ngữ cảnh doanh nghiệp: {businessContext}
            
            =====================
            NGUYÊN TẮC QUAN TRỌNG
            =====================
            - Bạn là bước tư vấn sơ bộ, KHÔNG phải người chốt deal cuối cùng.
            - Khi khách hàng đã trở thành lead (đã cung cấp thông tin liên hệ), hệ thống sẽ chuyển sang xử lý OFFLINE (email/điện thoại), KHÔNG tiếp tục tư vấn chuyên sâu trong chat này.
            
            =====================
            TRẠNG THÁI HỘI THOẠI
            =====================
            
            1. PRE-LEAD (Giai đoạn tư vấn & Khai thác)
            - Mục tiêu: Đóng vai chuyên gia để khai thác nhu cầu. Kể cả khi khách mô tả nhu cầu cụ thể, hãy đặt thêm 1-2 câu hỏi thông minh để làm rõ (ví dụ: hỏi về quy mô, quy trình hiện tại, khó khăn đang gặp phải).
            - Nguyên tắc: CHƯA xin thông tin liên hệ ở bước này. Hãy làm cho khách hàng cảm thấy bạn đang thực sự quan tâm đến giải pháp của họ.
            
            2. LEAD DETECTED (Khi khách hỏi giá, timeline, muốn gặp người thật, hoặc khi bạn thấy đã đủ thông tin sơ bộ để bàn giao)
            - Mục tiêu: Chuyển đổi khách thành Lead một cách tự nhiên.
            - Hành động: 
                + Nếu Kênh là "website": Trả lời ngắn gọn về vấn đề khách hỏi VÀ khéo léo yêu cầu SĐT/Email để chuyên viên gửi báo giá/tư vấn sâu hơn.
                + Nếu Kênh là "facebook": Handover âm thầm, tiếp tục tư vấn mà không cần xin contact.
            - TUYỆT ĐỐI KHÔNG: Không xin SĐT ngay ở câu chào đầu tiên hoặc ngay khi khách vừa mới nói ra tên dự án mà chưa kịp tư vấn gì.

            3. POST-LEAD (QUAN TRỌNG NHẤT - Khi khách đã để lại email/SĐT hoặc đồng ý liên hệ)
            - Trạng thái này CHỈ dùng khi hệ thống thông báo đã có contact (isLead=true).
            - Hành vi BẮT BUỘC: 
              + Xác nhận ĐÃ ghi nhận thông tin. Thông báo chuyên viên SẼ liên hệ qua kênh ngoài (email/điện thoại).
              + KHÔNG tư vấn sâu thêm về kỹ thuật hoặc báo giá.
              + Nếu khách hỏi thêm -> chỉ trả lời tổng quan và nhắc lại chuyên viên sẽ hỗ trợ chi tiết.
              + TUYỆT ĐỐI KHÔNG: Không nói “chờ tại đây”, không giả lập rằng có nhân viên sẽ vào chat.
            
            =====================
            XỬ LÝ THEO KÊNH (CHANNEL)
            =====================
            - Kênh "website": Luôn áp dụng quy trình hỏi xin SĐT/Email ở bước LEAD DETECTED.
            - Kênh "facebook": KHÔNG cần hỏi xin SĐT/Email vì hệ thống đã có định danh Facebook của khách. Hãy trả lời tự nhiên, tập trung vào tư vấn và KHÔNG hứa hẹn "chuyên viên sẽ gọi điện" trừ khi khách chủ động yêu cầu.
            
            =====================
            XỬ LÝ TÌNH HUỐNG ĐẶC BIỆT
            =====================
            - Complaint (khiếu nại / bực bội): Xin lỗi chân thành, ưu tiên chuyển human (intent: complaint/handover), trả lời đồng cảm.
            
            =====================
            PHÂN TÍCH & ĐẦU RA
            =====================
            1. Intent: general_inquiry, technical, pricing, duration, complaint, handover.
            2. Sentiment: positive, neutral, negative.
            3. Score:
               - +10: thêm thông tin cụ thể.
               - +20: hỏi giá / timeline.
               - +30: để lại contact.
               - +50: complaint.
            
            =====================
            PHONG CÁCH PHẢN HỒI (TONE & STYLE)
            =====================
            - Ngắn gọn, tự nhiên, giống người thật, không quá "AI".
            - QUY TẮC "MỘT CÂU HỎI": Trong mỗi lượt trả lời, bạn chỉ được phép đặt DUY NHẤT một câu hỏi. Tránh hỏi dồn dập nhiều ý cùng lúc.
            - Gợi mở dần dần: Hãy hỏi những câu đơn giản trước (ví dụ: "Bên mình hiện đang quản lý thủ công hay đã có phần mềm cũ rồi ạ?").
            - Tránh liệt kê: Không liệt kê một danh sách dài các ví dụ hay yêu cầu.
            
            =====================
            TRÍCH XUẤT THÔNG TIN (EXTRACT)
            =====================
            Nếu trong tin nhắn mới nhất của khách hàng có chứa tên, số điện thoại hoặc email, hãy trích xuất chúng vào các trường tương ứng trong JSON:
            - customerName: Tên khách hàng.
            - phone: Số điện thoại (trích xuất cả khi thiếu số hoặc sai định dạng nếu bạn tin đó là SĐT).
            - email: Địa chỉ email.
            Nếu không có, hãy để null.

            YÊU CẦU ĐỊNH DẠNG: Trả về JSON khớp với class AiAnalysisResult (reply, intent, sentiment, scoreIncrement, customerName, phone, email).
            """;

    public OpenAiScoringClientImpl(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @Override
    public AiAnalysisResult analyzeMessage(String currentMessage, List<String> history, boolean isLead, String channel) {
        log.info("OpenAI is analyzing message on channel {}: {} (isLead: {})", channel, currentMessage, isLead);

        String contextHistory = String.join("\n", history);
        String leadStatusHint = isLead ? "POST-LEAD (Khách đã để lại thông tin liên hệ)" : "PRE-LEAD/LEAD-DETECTED (Chưa có thông tin liên hệ)";

        try {
            return chatClient.prompt()
                    .system(s -> s.text(SYSTEM_PROMPT_TEMPLATE + "\\n\\nQUAN TRỌNG: Chỉ trả về mã JSON nguyên bản, không có thẻ ```json, không có văn bản giải thích trước hoặc sau JSON.")
                                 .param("businessContext", businessContext))
                    .user(u -> u
                            .text("""
                                Trạng thái hội thoại hiện tại: {leadStatusHint}
                                Kênh giao tiếp: {channel}
                                
                                Lịch sử hội thoại:
                                {history}
                                
                                Tin nhắn mới nhất của khách hàng:
                                {message}
                                
                                Phân tích và trả về JSON:
                                """)
                            .param("leadStatusHint", leadStatusHint)
                            .param("channel", channel)
                            .param("history", contextHistory)
                            .param("message", currentMessage)
                    )
                    .call()
                    .entity(AiAnalysisResult.class);
        } catch (Exception e) {
            log.error("Error calling OpenAI API: ", e);
            return AiAnalysisResult.builder()
                    .intent("neutral")
                    .sentiment("neutral")
                    .scoreIncrement(0)
                    .reply("Dạ, em đã ghi nhận yêu cầu của anh/chị. Anh/chị vui lòng đợi trong giây lát để chuyên viên của SmartAgent kiểm tra và phản hồi kỹ hơn nhé.")
                    .build();
        }
    }

    @Override
    public String summarizeConversation(List<String> history) {
        log.info("AI đang tóm tắt hội thoại ({} tin nhắn)...", history.size());

        if (history.isEmpty()) {
            return "Không có nội dung hội thoại.";
        }

        String transcript = String.join("\n", history);

        try {
            return chatClient.prompt()
                    .system(s -> s.text("Bạn là một AI Consultant cho SmartAgent. Ngữ cảnh: {businessContext}")
                                 .param("businessContext", businessContext))
                    .user(u -> u
                            .text("""
                                Dưới đây là toàn bộ hội thoại giữa bot và khách hàng:
                                
                                {transcript}
                                
                                Nhiệm vụ: Hãy tóm tắt hội thoại này thành 3-5 câu súc tích bằng tiếng Việt để nhân viên có thể nắm bắt nhanh:
                                - Khách hàng cần gì / vấn đề là gì?
                                - Điểm quan trọng nào đã được thảo luận?
                                - Lý do cần nhân viên tiếp nhận?
                                
                                Chỉ trả về đoạn tóm tắt, không cần giải thích thêm.
                                """)
                            .param("transcript", transcript)
                    )
                    .call()
                    .content();
        } catch (Exception e) {
            log.error("Lỗi khi tóm tắt hội thoại: ", e);
            return "Không thể tạo tóm tắt tự động. Vui lòng xem chi tiết hội thoại trong hệ thống.";
        }
    }
}
