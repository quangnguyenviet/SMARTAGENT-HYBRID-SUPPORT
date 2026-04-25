package com.example.spring_server.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * MessageDTO
 * 
 * Data Transfer Object for Message.
 * Used in REST API, WebSocket communication, & service layer.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDTO {
    private Long id;
    private Long conversationId;
    private String sender;
    private String senderType;
    private String content;
    private LocalDateTime timestamp;
}
