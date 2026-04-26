package com.example.spring_server.chat.controller;

import com.example.spring_server.chat.dto.MessageDTO;
import com.example.spring_server.chat.dto.WebSocketMessageDTO;
import com.example.spring_server.chat.service.ChatService;
import com.example.spring_server.orchestrator.service.OrchestratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

/**
 * ChatWebSocketController
 * 
 * Handles STOMP WebSocket messages mapped to /app/...
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final ChatService chatService;
    private final OrchestratorService orchestratorService;

    @MessageMapping("/chat.sendMessage")
    public void handleIncomingMessage(@Payload WebSocketMessageDTO incomingMsg) {
        log.info("Received STOMP message: eventType={}, conversationId={}",
                incomingMsg.getEventType(), incomingMsg.getConversationId());

        if ("USER_MESSAGE".equals(incomingMsg.getEventType()) || "AGENT_MESSAGE".equals(incomingMsg.getEventType())) {
            MessageDTO messageDTO = MessageDTO.builder()
                    .sender(incomingMsg.getSender())
                    .senderType(incomingMsg.getSenderType())
                    .content(incomingMsg.getContent())
                    .build();

            // The chatService will save the message and broadcast it via SimpMessagingTemplate
            chatService.sendMessage(incomingMsg.getConversationId(), messageDTO);
            
            // Invoke Orchestrator to analyze the message if it's from a user
            if ("USER_MESSAGE".equals(incomingMsg.getEventType()) || "user".equalsIgnoreCase(incomingMsg.getSenderType())) {
                orchestratorService.processUserMessage(incomingMsg.getConversationId(), incomingMsg.getContent());
            }
            
        } else if ("TYPING_INDICATOR".equals(incomingMsg.getEventType())) {
            log.debug("Typing indicator: conversationId={}, sender={}",
                    incomingMsg.getConversationId(), incomingMsg.getSender());
            // Optionally, we could broadcast typing status back to /topic/chat/{conversationId} here.
        } else {
            log.warn("Unhandled STOMP event type: {}", incomingMsg.getEventType());
        }
    }
}
