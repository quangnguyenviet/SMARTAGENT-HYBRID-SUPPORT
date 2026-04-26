package com.example.spring_server.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardEvent {
    
    private EventType eventType;
    private ConversationDTO conversation;
    private MessageDTO message;
    
    public enum EventType {
        CONVERSATION_CREATED,
        CONVERSATION_UPDATED,
        NEW_MESSAGE,
        LEAD_SCORE_UPDATED
    }
}
