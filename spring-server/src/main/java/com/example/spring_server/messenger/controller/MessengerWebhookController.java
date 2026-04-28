package com.example.spring_server.messenger.controller;

import com.example.spring_server.chat.dto.ConversationDTO;
import com.example.spring_server.chat.dto.MessageDTO;
import com.example.spring_server.chat.service.ChatService;
import com.example.spring_server.messenger.dto.FacebookWebhookPayload;
import com.example.spring_server.messenger.service.MessengerService;
import com.example.spring_server.orchestrator.service.OrchestratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messenger/webhook")
@RequiredArgsConstructor
@Slf4j
public class MessengerWebhookController {

    @Value("${facebook.verify-token}")
    private String verifyToken;

    private final ChatService chatService;
    private final OrchestratorService orchestratorService;
    private final MessengerService messengerService;

    /**
     * Webhook Verification (GET)
     * Meta dùng để xác thực URL của server chúng ta.
     */
    @GetMapping
    public ResponseEntity<String> verifyWebhook(
            @RequestParam(value = "hub.mode", required = false) String mode,
            @RequestParam(value = "hub.verify_token", required = false) String token,
            @RequestParam(value = "hub.challenge", required = false) String challenge) {

        log.info("Facebook Webhook verification: mode={}, token={}", mode, token);

        if ("subscribe".equals(mode) && verifyToken.equals(token)) {
            log.info("Webhook verified successfully!");
            return ResponseEntity.ok(challenge);
        } else {
            log.warn("Webhook verification failed. Mode: {}, Token: {}", mode, token);
            return ResponseEntity.status(403).body("Verification failed");
        }
    }

    /**
     * Webhook Events (POST)
     * Nhận tin nhắn và sự kiện từ Facebook.
     */
    @PostMapping
    public ResponseEntity<Void> handleEvent(@RequestBody FacebookWebhookPayload payload) {
        log.info("--- FACEBOOK WEBHOOK POST RECEIVED ---");
        log.info("Payload object: {}", payload.getObject());
        
        if ("page".equals(payload.getObject())) {
            log.info("Processing page events, entry count: {}", 
                payload.getEntry() != null ? payload.getEntry().size() : 0);
            
            if (payload.getEntry() != null) {
                payload.getEntry().forEach(entry -> {
                    if (entry.getMessaging() != null) {
                        entry.getMessaging().forEach(this::processMessaging);
                    }
                });
            }
        } else {
            log.warn("Received webhook for non-page object: {}", payload.getObject());
        }

        return ResponseEntity.ok().build();
    }

    private void processMessaging(FacebookWebhookPayload.Messaging messaging) {
        if (messaging.getSender() == null) return;
        
        String psid = messaging.getSender().getId();
        
        // 1. Xử lý tin nhắn văn bản thông thường
        if (messaging.getMessage() != null && messaging.getMessage().getText() != null) {
            String text = messaging.getMessage().getText();
            log.info("Message from Facebook PSID {}: {}", psid, text);
            handleIncomingMessage(psid, text);
        }
        
        // 2. Xử lý sự kiện postback (ví dụ: nhấn nút "Bắt đầu")
        if (messaging.getPostback() != null) {
            String payload = messaging.getPostback().getPayload();
            log.info("Postback from Facebook PSID {}: {}", psid, payload);
            handleIncomingMessage(psid, "[Postback] " + payload);
        }
    }

    private void handleIncomingMessage(String psid, String text) {
        try {
            // Tìm hội thoại ACTIVE hiện có của khách hàng này trên kênh Facebook
            // Nếu không thấy thì tạo mới.
            ConversationDTO conversation = chatService.getConversationsByCustomerId(psid)
                    .stream()
                    .filter(c -> "facebook".equals(c.getChannel()) && !"CLOSED".equals(c.getStatus()))
                    .findFirst()
                    .orElseGet(() -> {
                        log.info("Creating new Facebook conversation for PSID: {}", psid);
                        ConversationDTO newConv = chatService.createConversation(psid, "facebook");
                        
                        // Tự động lấy tên từ Facebook Profile
                        try {
                            java.util.Map<String, String> profile = messengerService.getUserProfile(psid);
                            if (profile != null && profile.containsKey("name")) {
                                String fbName = profile.get("name");
                                log.info("Fetched Facebook profile name: {}", fbName);
                                chatService.updateCustomerInfo(newConv.getId(), fbName, null, null);
                                // Cập nhật lại đối tượng conversation để có tên mới
                                return chatService.getConversation(newConv.getId()).orElse(newConv);
                            }
                        } catch (Exception e) {
                            log.error("Error fetching FB profile for new conversation: {}", e.getMessage());
                        }
                        
                        return newConv;
                    });

            // Lưu tin nhắn vào DB và broadcast qua STOMP cho Admin Dashboard
            MessageDTO messageDTO = MessageDTO.builder()
                    .sender("Facebook User")
                    .senderType("user")
                    .content(text)
                    .build();
            chatService.sendMessage(conversation.getId(), messageDTO);

            // Kích hoạt bộ não AI (Orchestrator) để phân tích và phản hồi
            orchestratorService.processUserMessage(conversation.getId(), text);
            
        } catch (Exception e) {
            log.error("Error handling Facebook message from {}: {}", psid, e.getMessage(), e);
        }
    }
}
