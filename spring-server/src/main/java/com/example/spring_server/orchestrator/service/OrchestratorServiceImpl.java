package com.example.spring_server.orchestrator.service;

import com.example.spring_server.chat.dto.AdminDashboardEvent;
import com.example.spring_server.chat.dto.MessageDTO;
import com.example.spring_server.chat.entity.Conversation;
import com.example.spring_server.chat.entity.PotentialLead;
import com.example.spring_server.chat.repository.ConversationRepository;
import com.example.spring_server.chat.repository.MessageRepository;
import com.example.spring_server.chat.repository.PotentialLeadRepository;
import com.example.spring_server.chat.service.ChatService;
import com.example.spring_server.notification.dto.LeadNotificationData;
import com.example.spring_server.notification.service.NotificationService;
import com.example.spring_server.orchestrator.client.AiScoringClient;
import com.example.spring_server.orchestrator.dto.AiAnalysisResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrchestratorServiceImpl implements OrchestratorService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final PotentialLeadRepository potentialLeadRepository;
    private final ChatService chatService;
    private final AiScoringClient aiScoringClient;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @Value("${app.notification.frontend-url}")
    private String frontendUrl;

    // Ngưỡng điểm để kích hoạt thu thập thông tin liên hệ
    private static final int HANDOVER_SCORE_THRESHOLD = 50;

    // Prefix đặc biệt để nhận biết tin nhắn liên hệ từ frontend
    private static final String CONTACT_PREFIX = "[CONTACT]";

    // Regex nhận diện SĐT Việt Nam (9-11 số, có thể bắt đầu bằng +84)
    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "(?:\\+84|0)(\\d{9,10})",
            Pattern.CASE_INSENSITIVE
    );

    // Regex nhận diện email
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}",
            Pattern.CASE_INSENSITIVE
    );

    @Async
    @Override
    @Transactional
    public void processUserMessage(Long conversationId, String content) {
        log.info("Orchestrator bắt đầu xử lý tin nhắn cho hội thoại: {}", conversationId);
        
        // Bật chỉ báo typing cho Bot
        sendBotTyping(conversationId, true);

        Conversation conversation = conversationRepository.findById(conversationId).orElse(null);
        if (conversation == null) {
            log.warn("Không tìm thấy hội thoại {}.", conversationId);
            return;
        }

        // ==============================================================
        // LUỒNG ĐẶC BIỆT: Khách gửi thông tin liên hệ (từ mini-form)
        // ==============================================================
        if (content.startsWith(CONTACT_PREFIX)) {
            handleContactInfoMessage(conversation, content);
            return;
        }

        // ==============================================================
        // LUỒNG ĐẶC BIỆT: Đang ở trạng thái COLLECTING_CONTACT
        // → Thử parse thông tin từ text tự do (dự phòng nếu không dùng form)
        // ==============================================================
        if ("COLLECTING_CONTACT".equals(conversation.getStatus())) {
            handleFreeTextContactMessage(conversation, content);
            return;
        }

        // Nếu bot không còn được phép tự động trả lời, hoặc hội thoại đã đóng thì bỏ qua
        if (Boolean.FALSE.equals(conversation.getIsBotActive()) || !isActiveStatus(conversation.getStatus())) {
            log.info("Bot không hoạt động hoặc hội thoại không ở trạng thái ACTIVE cho id: {}. Bỏ qua.", conversationId);
            return;
        }

        // Cập nhật hoặc tạo PotentialLead
        PotentialLead lead = potentialLeadRepository.findByConversationId(conversationId)
                .orElse(PotentialLead.builder().conversation(conversation).build());

        // Kiểm tra thông tin liên hệ từ database
        boolean hasContactInfoInDb = lead.getPhone() != null || lead.getEmail() != null;
        
        // KIỂM TRA THÊM: Trích xuất nhanh từ tin nhắn hiện tại (tránh việc AI hỏi lại khi khách vừa cung cấp)
        boolean hasContactInCurrentMessage = PHONE_PATTERN.matcher(content).find() || EMAIL_PATTERN.matcher(content).find();
        
        boolean hasContactInfo = hasContactInfoInDb || hasContactInCurrentMessage;

        // Lấy lịch sử tin nhắn để làm ngữ cảnh cho AI
        List<String> history = messageRepository.findByConversationIdOrderByTimestampAsc(conversationId).stream()
                .map(m -> m.getSenderType() + ": " + m.getContent())
                .collect(Collectors.toList());

        // Gọi AI phân tích (Truyền thêm trạng thái Lead)
        AiAnalysisResult analysis = aiScoringClient.analyzeMessage(content, history, hasContactInfo);

        // Cập nhật Lead Score
        int currentScore = conversation.getLeadScore() != null ? conversation.getLeadScore() : 0;
        int newScore = currentScore + analysis.getScoreIncrement();
        conversation.setLeadScore(newScore);

        // Cập nhật hoặc tạo PotentialLead (đã lấy ở trên)

        if (analysis.getIntent() != null && !analysis.getIntent().equals("neutral")) {
            lead.setIntentSummary(analysis.getIntent());
        }
        potentialLeadRepository.save(lead);
        conversationRepository.save(conversation);

        // Thông báo điểm số thay đổi cho Admin Dashboard qua STOMP
        broadcastScoreUpdate(conversationId);

        // ==============================================================
        // KIỂM TRA TRIGGER: Score cao hoặc intent là handover
        // ==============================================================
        boolean shouldHandover = "handover".equals(analysis.getIntent()) || newScore >= HANDOVER_SCORE_THRESHOLD;

        if (shouldHandover) {
            log.info("🎯 Phát hiện khách tiềm năng tại hội thoại {}. Score: {}. Intent: {}",
                    conversationId, newScore, analysis.getIntent());

            if (!hasContactInfo) {
                // Chưa có thông tin → Bot hỏi xin thông tin liên hệ
                requestContactInfo(conversationId, conversation, analysis);
            } else {
                // Đã có thông tin → Chuyển trạng thái Handover + gửi email (Bot vẫn hoạt động)
                triggerHandoverWithNotification(conversationId, conversation, lead, analysis, newScore);
            }

        } else {
            // Điểm chưa đủ, bot tự trả lời tiếp
            sendBotReply(conversationId, analysis.getReply());
        }
    }

    // ==========================================
    // PRIVATE HELPERS
    // ==========================================

    /**
     * Xử lý tin nhắn dạng [CONTACT] gửi từ mini-form frontend
     * Format: [CONTACT] Tên: X | SĐT: Y | Email: Z
     */
    private void handleContactInfoMessage(Conversation conversation, String content) {
        Long conversationId = conversation.getId();
        log.info("Nhận thông tin liên hệ từ form cho hội thoại: {}", conversationId);

        PotentialLead lead = potentialLeadRepository.findByConversationId(conversationId)
                .orElse(PotentialLead.builder().conversation(conversation).build());

        // Parse các trường từ format có cấu trúc
        String payload = content.replace(CONTACT_PREFIX, "").trim();
        String name = extractTagValue(payload, "Tên");
        String phone = extractTagValue(payload, "SĐT");
        String email = extractTagValue(payload, "Email");

        // Gán thông tin
        if (name != null && !name.isBlank()) lead.setCustomerName(name);
        if (phone != null && !phone.isBlank()) lead.setPhone(phone);
        if (email != null && !email.isBlank()) lead.setEmail(email);
        lead.setContactCollectedAt(LocalDateTime.now());
        potentialLeadRepository.save(lead);

        // Chuyển trạng thái sang HANDED_OVER, NHƯNG giữ bot active để trả lời POST-LEAD
        // conversation.setIsBotActive(false); // Xóa dòng này
        conversationRepository.save(conversation);
        chatService.updateConversationStatus(conversationId, "HANDED_OVER");

        // Bot xác nhận và tạm biệt
        String confirmMsg = buildConfirmMessage(lead);
        sendBotReply(conversationId, confirmMsg);

        // Gửi email thông báo cho nhân viên
        sendLeadEmail(lead, conversation);

        // Broadcast Admin Dashboard
        broadcastScoreUpdate(conversationId);
        log.info("✅ Đã xử lý xong thông tin liên hệ và gửi email cho hội thoại: {}", conversationId);
    }

    /**
     * Xử lý khi khách nhập text tự do trong khi bot đang chờ contact info
     * (dự phòng cho trường hợp form không hoạt động)
     */
    private void handleFreeTextContactMessage(Conversation conversation, String content) {
        Long conversationId = conversation.getId();
        log.info("Parse thông tin liên hệ từ text tự do cho hội thoại: {}", conversationId);

        PotentialLead lead = potentialLeadRepository.findByConversationId(conversationId)
                .orElse(PotentialLead.builder().conversation(conversation).build());

        boolean updated = false;

        // Thử trích xuất SĐT
        Matcher phoneMatcher = PHONE_PATTERN.matcher(content);
        if (phoneMatcher.find() && lead.getPhone() == null) {
            lead.setPhone(phoneMatcher.group(0));
            updated = true;
        }

        // Thử trích xuất email
        Matcher emailMatcher = EMAIL_PATTERN.matcher(content);
        if (emailMatcher.find() && lead.getEmail() == null) {
            lead.setEmail(emailMatcher.group(0));
            updated = true;
        }

        if (updated) {
            lead.setContactCollectedAt(LocalDateTime.now());
            potentialLeadRepository.save(lead);
        }

        // Nếu đã có ít nhất 1 thông tin (SĐT hoặc email) → trigger handover
        if (lead.getPhone() != null || lead.getEmail() != null) {
            // conversation.setIsBotActive(false); // Giữ bot active cho POST-LEAD
            conversationRepository.save(conversation);
            chatService.updateConversationStatus(conversationId, "HANDED_OVER");

            String confirmMsg = buildConfirmMessage(lead);
            sendBotReply(conversationId, confirmMsg);
            sendLeadEmail(lead, conversation);
            broadcastScoreUpdate(conversationId);
        } else {
            // Chưa nhận diện được → hỏi lại
            sendBotReply(conversationId,
                    "Mình chưa nhận ra thông tin liên hệ. Bạn có thể cung cấp số điện thoại hoặc email để nhân viên liên hệ lại nhé? 😊");
        }
    }

    /**
     * Bot gửi tin nhắn yêu cầu thông tin liên hệ và chuyển trạng thái sang COLLECTING_CONTACT
     */
    private void requestContactInfo(Long conversationId, Conversation conversation, AiAnalysisResult analysis) {
        // Cập nhật trạng thái hội thoại
        conversation.setStatus("COLLECTING_CONTACT");
        conversationRepository.save(conversation);

        // Bot trả lời tin cuối rồi yêu cầu thông tin
        String leadReply = analysis.getReply() != null && !analysis.getReply().isEmpty()
                ? analysis.getReply()
                : "Tôi thấy bạn có nhu cầu cụ thể. Để nhân viên tư vấn có thể hỗ trợ bạn tốt nhất:";

        sendBotReply(conversationId, leadReply);

        // Gửi tin nhắn đặc biệt kích hoạt form thu thập contact ở frontend
        MessageDTO collectRequest = MessageDTO.builder()
                .sender("AI Assistant")
                .senderType("collect_contact")   // eventType đặc biệt để frontend nhận ra
                .content("Cho mình xin thông tin liên hệ để nhân viên có thể liên hệ lại với bạn nhanh nhất nhé! 📞")
                .build();
        chatService.sendMessage(conversationId, collectRequest);

        log.info("📋 Đã gửi yêu cầu thu thập thông tin liên hệ cho hội thoại: {}", conversationId);
    }

    /**
     * Thực hiện handover khi đã có đầy đủ thông tin liên hệ
     */
    private void triggerHandoverWithNotification(Long conversationId, Conversation conversation,
                                                  PotentialLead lead, AiAnalysisResult analysis, int newScore) {
        // conversation.setIsBotActive(false); // Giữ bot active
        conversationRepository.save(conversation);
        chatService.updateConversationStatus(conversationId, "HANDED_OVER");

        String handoverMsg = analysis.getReply() != null && !analysis.getReply().isEmpty()
                ? analysis.getReply()
                : "Hệ thống đang kết nối bạn với nhân viên tư vấn. Vui lòng chờ trong giây lát! 🙏";
        sendBotReply(conversationId, handoverMsg);

        // Gửi email thông báo
        sendLeadEmail(lead, conversation);
        broadcastScoreUpdate(conversationId);
    }

    /**
     * Gửi email thông báo lead cho nhân viên.
     * Tự động gọi AI tóm tắt hội thoại trước khi gửi.
     */
    private void sendLeadEmail(PotentialLead lead, Conversation conversation) {
        Long conversationId = conversation.getId();
        String conversationLink = frontendUrl + "/admin?conv=" + conversationId;

        // Lấy toàn bộ lịch sử tin nhắn để tóm tắt
        List<String> history = messageRepository.findByConversationIdOrderByTimestampAsc(conversationId).stream()
                .filter(m -> !m.getContent().startsWith(CONTACT_PREFIX)) // Bỏ tin nhắn contact prefix
                .map(m -> {
                    String label = switch (m.getSenderType()) {
                        case "user"  -> "Khách hàng";
                        case "bot"   -> "Bot";
                        case "agent" -> "Nhân viên";
                        default      -> m.getSenderType();
                    };
                    return label + ": " + m.getContent();
                })
                .collect(Collectors.toList());

        // Gọi AI tóm tắt hội thoại (async sẽ xử lý song song)
        String conversationSummary = aiScoringClient.summarizeConversation(history);

        LeadNotificationData notificationData = LeadNotificationData.builder()
                .customerName(lead.getCustomerName())
                .phone(lead.getPhone())
                .email(lead.getEmail())
                .leadScore(conversation.getLeadScore())
                .intentSummary(lead.getIntentSummary())
                .conversationSummary(conversationSummary)
                .conversationId(conversationId)
                .conversationLink(conversationLink)
                .build();

        notificationService.sendLeadNotification(notificationData);
    }


    /**
     * Broadcast điểm số mới lên Admin Dashboard qua STOMP
     */
    private void broadcastScoreUpdate(Long conversationId) {
        messagingTemplate.convertAndSend("/topic/admin/conversations",
                AdminDashboardEvent.builder()
                        .eventType(AdminDashboardEvent.EventType.LEAD_SCORE_UPDATED)
                        .conversation(chatService.getConversation(conversationId).orElse(null))
                        .build());
    }

    /**
     * Gửi tin nhắn bot về phía khách hàng
     */
    private void sendBotReply(Long conversationId, String content) {
        if (content == null || content.isBlank()) return;
        
        // Tắt typing trước khi gửi tin nhắn
        sendBotTyping(conversationId, false);

        MessageDTO botReply = MessageDTO.builder()
                .sender("AI Assistant")
                .senderType("bot")
                .content(content)
                .build();
        chatService.sendMessage(conversationId, botReply);
    }

    /**
     * Gửi trạng thái typing của Bot qua WebSocket
     */
    private void sendBotTyping(Long conversationId, boolean isTyping) {
        try {
            messagingTemplate.convertAndSend("/topic/chat/" + conversationId,
                    com.example.spring_server.chat.dto.WebSocketMessageDTO.builder()
                            .eventType("TYPING_INDICATOR")
                            .conversationId(conversationId)
                            .sender("AI Assistant")
                            .senderType("bot")
                            .content(isTyping ? "typing" : "stopped")
                            .build());
        } catch (Exception e) {
            log.error("Lỗi khi gửi bot typing indicator: {}", e.getMessage());
        }
    }

    /**
     * Build tin nhắn xác nhận đã nhận thông tin liên hệ
     */
    private String buildConfirmMessage(PotentialLead lead) {
        StringBuilder sb = new StringBuilder("✅ Cảm ơn bạn! Mình đã ghi nhận thông tin:");
        if (lead.getCustomerName() != null) sb.append("\n• Tên: ").append(lead.getCustomerName());
        if (lead.getPhone() != null) sb.append("\n• SĐT: ").append(lead.getPhone());
        if (lead.getEmail() != null) sb.append("\n• Email: ").append(lead.getEmail());
        sb.append("\n\nNhân viên sẽ liên hệ với bạn trong thời gian sớm nhất! 🙏");
        return sb.toString();
    }

    /**
     * Parse giá trị từ format: "Tên: X | SĐT: Y | Email: Z"
     */
    private String extractTagValue(String text, String tag) {
        Pattern p = Pattern.compile(tag + ":\\s*([^|\\n]+)", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        return m.find() ? m.group(1).trim() : null;
    }

    /**
     * Kiểm tra trạng thái có hợp lệ để bot xử lý không
     */
    private boolean isActiveStatus(String status) {
        return "ACTIVE".equals(status) || "COLLECTING_CONTACT".equals(status) || "HANDED_OVER".equals(status);
    }
}
