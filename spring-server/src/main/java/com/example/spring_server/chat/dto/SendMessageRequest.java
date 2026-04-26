package com.example.spring_server.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * SendMessageRequest
 * 
 * Request DTO for sending a message
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendMessageRequest {
    private String sender;
    private String senderType;  // USER, BOT, AGENT
    private String content;
}
