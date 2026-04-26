package com.example.spring_server.chat.handler;

/**
 * WebSocket Event Types
 * 
 * Defines all event types that can be transmitted over WebSocket.
 */
public enum WebSocketEventType {
    
    /**
     * User sends a message to the bot/agent
     */
    USER_MESSAGE("user_message"),
    
    /**
     * Bot sends a response
     */
    BOT_RESPONSE("bot_response"),
    
    /**
     * Agent sends a message (after handover)
     */
    AGENT_RESPONSE("agent_response"),
    
    /**
     * System notification for handover (bot -> agent)
     */
    HANDOVER_NOTIFICATION("handover_notification"),
    
    /**
     * System notification for typing indicator
     */
    TYPING_INDICATOR("typing_indicator"),
    
    /**
     * Acknowledgement of message receipt
     */
    MESSAGE_ACK("message_ack"),
    
    /**
     * Error message
     */
    ERROR("error"),
    
    /**
     * Connection established
     */
    CONNECTION_ESTABLISHED("connection_established"),
    
    /**
     * Conversation closed
     */
    CONVERSATION_CLOSED("conversation_closed");
    
    private final String value;
    
    WebSocketEventType(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
    
    public static WebSocketEventType fromValue(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Unknown event type: " + value);
        }

        for (WebSocketEventType type : WebSocketEventType.values()) {
            if (type.value.equalsIgnoreCase(value) || type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown event type: " + value);
    }
}
