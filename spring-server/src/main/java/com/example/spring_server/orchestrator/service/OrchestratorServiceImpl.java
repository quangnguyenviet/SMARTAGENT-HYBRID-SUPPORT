package com.example.spring_server.orchestrator.service;

import com.example.spring_server.chat.dto.AdminDashboardEvent;
import com.example.spring_server.chat.dto.MessageDTO;
import com.example.spring_server.chat.entity.Conversation;
import com.example.spring_server.chat.entity.PotentialLead;
import com.example.spring_server.chat.repository.ConversationRepository;
import com.example.spring_server.chat.repository.MessageRepository;
import com.example.spring_server.chat.repository.PotentialLeadRepository;
import com.example.spring_server.chat.service.ChatService;
import com.example.spring_server.orchestrator.client.AiScoringClient;
import com.example.spring_server.orchestrator.dto.AiAnalysisResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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

    @Async
    @Override
    @Transactional
    public void processUserMessage(Long conversationId, String content) {
        log.info("Orchestrator starting analysis for conversation: {}", conversationId);

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElse(null);

        if (conversation == null) {
            log.warn("Conversation {} not found.", conversationId);
            return;
        }

        // Nếu bot không còn được phép tự động trả lời, hoặc hội thoại đã đóng thì bỏ qua
        if (Boolean.FALSE.equals(conversation.getIsBotActive()) || !"ACTIVE".equals(conversation.getStatus())) {
            log.info("Bot is inactive or conversation is not ACTIVE for id: {}. Ignoring.", conversationId);
            return;
        }

        // Lấy 5 tin nhắn gần nhất để làm ngữ cảnh cho AI
        List<String> history = messageRepository.findByConversationIdOrderByTimestampAsc(conversationId).stream()
                .map(m -> m.getSenderType() + ": " + m.getContent())
                .collect(Collectors.toList());

        // Gọi AI phân tích
        AiAnalysisResult analysis = aiScoringClient.analyzeMessage(content, history);

        // Cập nhật Lead Score
        int currentScore = conversation.getLeadScore() != null ? conversation.getLeadScore() : 0;
        int newScore = currentScore + analysis.getScoreIncrement();
        conversation.setLeadScore(newScore);
        
        // Cập nhật hoặc tạo PotentialLead
        PotentialLead lead = potentialLeadRepository.findByConversationId(conversationId)
                .orElse(PotentialLead.builder().conversation(conversation).build());
                
        if (analysis.getIntent() != null && !analysis.getIntent().equals("neutral")) {
            lead.setIntentSummary(analysis.getIntent());
        }
        
        // Lưu dữ liệu
        potentialLeadRepository.save(lead);
        conversationRepository.save(conversation);

        // Bắn event báo điểm số thay đổi cho Admin Dashboard
        messagingTemplate.convertAndSend("/topic/admin/conversations", 
                AdminDashboardEvent.builder()
                    .eventType(AdminDashboardEvent.EventType.LEAD_SCORE_UPDATED)
                    .conversation(chatService.getConversation(conversationId).orElse(null))
                    .build());

        // Kiểm tra điều kiện Handover (Chuyển giao cho người thật)
        if ("handover".equals(analysis.getIntent()) || newScore >= 50) {
            log.info("Triggering HANDOVER for conversation {}", conversationId);
            
            // Tắt bot
            conversation.setIsBotActive(false);
            conversationRepository.save(conversation);
            
            // Cập nhật trạng thái
            chatService.updateConversationStatus(conversationId, "HANDED_OVER");
            
            // Trả lời câu cuối cùng thông báo chuyển giao
            MessageDTO botReply = MessageDTO.builder()
                    .sender("AI Assistant")
                    .senderType("bot")
                    .content(analysis.getReply() != null ? analysis.getReply() : "Hệ thống đang kết nối bạn với nhân viên tư vấn...")
                    .build();
            chatService.sendMessage(conversationId, botReply);
            
        } else {
            // Vẫn ở trạng thái ACTIVE, Bot tự trả lời
            if (analysis.getReply() != null && !analysis.getReply().isEmpty()) {
                MessageDTO botReply = MessageDTO.builder()
                        .sender("AI Assistant")
                        .senderType("bot")
                        .content(analysis.getReply())
                        .build();
                chatService.sendMessage(conversationId, botReply);
            }
        }
    }
}
