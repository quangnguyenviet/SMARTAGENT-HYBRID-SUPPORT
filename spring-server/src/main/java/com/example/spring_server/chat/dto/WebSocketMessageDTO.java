package com.example.spring_server.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * WebSocketMessageDTO
 * 
 * Specialized DTO for WebSocket communication.
 * Includes event_type to distinguish different message types.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WebSocketMessageDTO {
    
    /**
     * Event type: USER_MESSAGE, BOT_RESPONSE, HANDOVER_NOTIFICATION, etc.
     */
    private String eventType;
    
    /**
     * Conversation ID
     */
    private Long conversationId;
    
    /**
     * Sender identifier
     */
    private String sender;
    
    /**
     * Type of sender: USER, BOT, AGENT
     */
    private String senderType;
    
    /**
     * Message content
     */
    private String content;
    
    /**
     * Additional metadata (e.g., score, sentiment for bot response)
     */
    private Object metadata;
}
