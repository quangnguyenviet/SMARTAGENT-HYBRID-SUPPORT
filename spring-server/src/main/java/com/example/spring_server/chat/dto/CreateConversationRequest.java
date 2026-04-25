package com.example.spring_server.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * CreateConversationRequest
 * 
 * Request DTO for creating a new conversation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateConversationRequest {
    private Long customerId;
    private String channel;
}
