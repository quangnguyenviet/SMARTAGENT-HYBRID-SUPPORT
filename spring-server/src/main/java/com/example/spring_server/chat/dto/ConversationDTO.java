package com.example.spring_server.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ConversationDTO
 * 
 * Data Transfer Object for Conversation.
 * Used in REST API & service layer to avoid exposing internal entity structure.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationDTO {
    private Long id;
    private String customerId;
    private String channel;
    private String status;
    private Boolean isBotActive;
    private Integer leadScore;
    private String intentSummary;
    private String sentiment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastMessageTime;
    private Long messageCount;
}
