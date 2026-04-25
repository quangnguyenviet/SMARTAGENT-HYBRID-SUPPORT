package com.example.spring_server.chat.handler;

import com.example.spring_server.chat.dto.MessageDTO;
import com.example.spring_server.chat.dto.WebSocketMessageDTO;
import com.example.spring_server.chat.service.ChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

/**
 * ChatWebSocketHandler
 * 
 * Handles WebSocket lifecycle events (connect, message, disconnect).
 * Manages real-time communication between client & server.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketHandler extends TextWebSocketHandler {
    
    private final ChatService chatService;
    private final ObjectMapper objectMapper;
    
    /**
     * Store active WebSocket sessions mapped by conversation ID
     * Key: conversationId, Value: WebSocketSession
     */
    private final ConcurrentHashMap<Long, WebSocketSession> activeSessions = new ConcurrentHashMap<>();
    
    /**
     * Called when a WebSocket connection is established
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        log.info("WebSocket connection established: {}", session.getId());
        
        try {
            // Send connection confirmation to client
            WebSocketMessageDTO confirmMsg = WebSocketMessageDTO.builder()
                    .eventType(WebSocketEventType.CONNECTION_ESTABLISHED.getValue())
                    .sender("system")
                    .content("Connected to chat server")
                    .build();
            
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(confirmMsg)));
        } catch (IOException e) {
            log.error("Error sending connection confirmation", e);
        }
    }
    
    /**
     * Called when a text message is received from client
     */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            String payload = message.getPayload();
            WebSocketMessageDTO incomingMsg = objectMapper.readValue(payload, WebSocketMessageDTO.class);
            
            log.info("Received WebSocket message: eventType={}, conversationId={}", 
                    incomingMsg.getEventType(), incomingMsg.getConversationId());
            
            WebSocketEventType eventType = WebSocketEventType.fromValue(incomingMsg.getEventType());
            
            switch (eventType) {
                case USER_MESSAGE:
                    handleUserMessage(session, incomingMsg);
                    break;
                case TYPING_INDICATOR:
                    handleTypingIndicator(session, incomingMsg);
                    break;
                default:
                    log.warn("Unhandled event type: {}", eventType);
            }
            
        } catch (Exception e) {
            log.error("Error handling WebSocket message", e);
            sendErrorMessage(session, "Failed to process message: " + e.getMessage());
        }
    }
    
    /**
     * Called when WebSocket connection is closed
     */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long conversationId = null;
        
        // Find and remove session from active sessions
        for (ConcurrentHashMap.Entry<Long, WebSocketSession> entry : activeSessions.entrySet()) {
            if (entry.getValue().equals(session)) {
                conversationId = entry.getKey();
                activeSessions.remove(entry.getKey());
                break;
            }
        }
        
        log.info("WebSocket connection closed: {}, conversationId: {}, status: {}", 
                session.getId(), conversationId, status);
    }
    
    /**
     * Handle user message event
     */
    private void handleUserMessage(WebSocketSession session, WebSocketMessageDTO msg) {
        try {
            Long conversationId = msg.getConversationId();
            
            // Store session mapping
            activeSessions.put(conversationId, session);
            
            // Create MessageDTO from WebSocket message
            MessageDTO messageDTO = MessageDTO.builder()
                    .sender(msg.getSender())
                    .senderType(msg.getSenderType())
                    .content(msg.getContent())
                    .build();
            
            // Save message to database via ChatService
            MessageDTO savedMsg = chatService.sendMessage(conversationId, messageDTO);
            
            // Send acknowledgement
            WebSocketMessageDTO ackMsg = WebSocketMessageDTO.builder()
                    .eventType(WebSocketEventType.MESSAGE_ACK.getValue())
                    .conversationId(conversationId)
                    .metadata(savedMsg.getId())
                    .build();
            
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(ackMsg)));
            
            // TODO: Publish event to Orchestrator Module for scoring & handover decision
            log.info("Message saved and ACK sent: messageId={}", savedMsg.getId());
            
        } catch (IOException e) {
            log.error("Error handling user message", e);
        }
    }
    
    /**
     * Handle typing indicator event
     */
    private void handleTypingIndicator(WebSocketSession session, WebSocketMessageDTO msg) {
        // For now, just log. Can be used for UI feedback
        log.debug("Typing indicator: conversationId={}, sender={}", 
                msg.getConversationId(), msg.getSender());
    }
    
    /**
     * Send error message to client
     */
    private void sendErrorMessage(WebSocketSession session, String errorMessage) {
        try {
            WebSocketMessageDTO errorMsg = WebSocketMessageDTO.builder()
                    .eventType(WebSocketEventType.ERROR.getValue())
                    .sender("system")
                    .content(errorMessage)
                    .build();
            
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(errorMsg)));
        } catch (IOException e) {
            log.error("Error sending error message", e);
        }
    }
    
    /**
     * Broadcast message to a specific conversation's active session
     * (Can be called from Orchestrator to send bot response)
     */
    public void broadcastMessageToConversation(Long conversationId, WebSocketMessageDTO message) {
        WebSocketSession session = activeSessions.get(conversationId);
        if (session != null && session.isOpen()) {
            try {
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
                log.info("Broadcasted message to conversationId: {}", conversationId);
            } catch (IOException e) {
                log.error("Error broadcasting message to conversation: {}", conversationId, e);
            }
        } else {
            log.warn("No active session for conversationId: {}", conversationId);
        }
    }
}
