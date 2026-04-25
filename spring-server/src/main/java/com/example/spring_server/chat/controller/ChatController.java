package com.example.spring_server.chat.controller;

import com.example.spring_server.chat.dto.*;
import com.example.spring_server.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ChatController
 * 
 * REST API endpoints for Chat module operations.
 * Handles conversation & message management.
 */
@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
@Slf4j
public class ChatController {
    
    private final ChatService chatService;
    
    /**
     * Create a new conversation
     * POST /api/conversations
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ConversationDTO>> createConversation(
            @RequestBody CreateConversationRequest request) {
        
        log.info("Creating conversation: customerId={}, channel={}", 
                request.getCustomerId(), request.getChannel());
        
        try {
            ConversationDTO conversation = chatService.createConversation(
                    request.getCustomerId(), 
                    request.getChannel()
            );
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.ok(conversation, "Conversation created successfully"));
        } catch (Exception e) {
            log.error("Error creating conversation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create conversation: " + e.getMessage()));
        }
    }

    /**
     * Get all conversations for admin dashboard
     * GET /api/conversations
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ConversationDTO>>> getAllConversations() {

        log.info("Fetching all conversations for admin dashboard");

        try {
            List<ConversationDTO> conversations = chatService.getAllConversations();
            return ResponseEntity.ok(ApiResponse.ok(conversations,
                    "Found " + conversations.size() + " conversations"));
        } catch (Exception e) {
            log.error("Error fetching all conversations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch conversations: " + e.getMessage()));
        }
    }
    
    /**
     * Get conversation by ID
     * GET /api/conversations/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ConversationDTO>> getConversation(
            @PathVariable Long id) {
        
        log.info("Fetching conversation: id={}", id);
        
        try {
            return chatService.getConversation(id)
                    .map(conv -> ResponseEntity.ok(ApiResponse.ok(conv)))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.error("Conversation not found")));
        } catch (Exception e) {
            log.error("Error fetching conversation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch conversation: " + e.getMessage()));
        }
    }
    
    /**
     * Get all conversations for a customer
     * GET /api/conversations/customer/{customerId}
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<ConversationDTO>>> getConversationsByCustomer(
            @PathVariable Long customerId) {
        
        log.info("Fetching conversations for customer: customerId={}", customerId);
        
        try {
            List<ConversationDTO> conversations = chatService.getConversationsByCustomerId(customerId);
            return ResponseEntity.ok(ApiResponse.ok(conversations, 
                    "Found " + conversations.size() + " conversations"));
        } catch (Exception e) {
            log.error("Error fetching conversations for customer", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch conversations: " + e.getMessage()));
        }
    }
    
    /**
     * Get message history for a conversation
     * GET /api/conversations/{id}/messages
     */
    @GetMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getConversationHistory(
            @PathVariable Long id) {
        
        log.info("Fetching message history for conversation: id={}", id);
        
        try {
            List<MessageDTO> messages = chatService.getConversationHistory(id);
            return ResponseEntity.ok(ApiResponse.ok(messages, 
                    "Found " + messages.size() + " messages"));
        } catch (IllegalArgumentException e) {
            log.error("Conversation not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Conversation not found"));
        } catch (Exception e) {
            log.error("Error fetching message history", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch messages: " + e.getMessage()));
        }
    }
    
    /**
     * Get recent N messages for a conversation
     * GET /api/conversations/{id}/messages?limit=10
     */
    @GetMapping("/{id}/messages/recent")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getRecentMessages(
            @PathVariable Long id,
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Fetching recent messages for conversation: id={}, limit={}", id, limit);
        
        try {
            List<MessageDTO> messages = chatService.getRecentMessages(id, limit);
            return ResponseEntity.ok(ApiResponse.ok(messages, 
                    "Found " + messages.size() + " recent messages"));
        } catch (IllegalArgumentException e) {
            log.error("Conversation not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Conversation not found"));
        } catch (Exception e) {
            log.error("Error fetching recent messages", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch messages: " + e.getMessage()));
        }
    }
    
    /**
     * Send a message in a conversation (REST API alternative to WebSocket)
     * POST /api/conversations/{id}/messages
     */
    @PostMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<MessageDTO>> sendMessage(
            @PathVariable Long id,
            @RequestBody SendMessageRequest request) {
        
        log.info("Sending message in conversation: id={}, sender={}", id, request.getSender());
        
        try {
            MessageDTO messageDTO = MessageDTO.builder()
                    .sender(request.getSender())
                    .senderType(request.getSenderType())
                    .content(request.getContent())
                    .build();
            
            MessageDTO savedMessage = chatService.sendMessage(id, messageDTO);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.ok(savedMessage, "Message sent successfully"));
        } catch (IllegalArgumentException e) {
            log.error("Conversation not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Conversation not found"));
        } catch (Exception e) {
            log.error("Error sending message", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to send message: " + e.getMessage()));
        }
    }
    
    /**
     * Update conversation status
     * PATCH /api/conversations/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateConversationStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        
        log.info("Updating conversation status: id={}, status={}", id, status);
        
        try {
            chatService.updateConversationStatus(id, status);
            return ResponseEntity.ok(ApiResponse.ok(null, "Conversation status updated successfully"));
        } catch (IllegalArgumentException e) {
            log.error("Conversation not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Conversation not found"));
        } catch (Exception e) {
            log.error("Error updating conversation status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update status: " + e.getMessage()));
        }
    }
    
    /**
     * Close a conversation
     * PUT /api/conversations/{id}/close
     */
    @PutMapping("/{id}/close")
    public ResponseEntity<ApiResponse<Void>> closeConversation(
            @PathVariable Long id) {
        
        log.info("Closing conversation: id={}", id);
        
        try {
            chatService.closeConversation(id);
            return ResponseEntity.ok(ApiResponse.ok(null, "Conversation closed successfully"));
        } catch (IllegalArgumentException e) {
            log.error("Conversation not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Conversation not found"));
        } catch (Exception e) {
            log.error("Error closing conversation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to close conversation: " + e.getMessage()));
        }
    }
    
    /**
     * Delete a conversation
     * DELETE /api/conversations/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteConversation(
            @PathVariable Long id) {
        
        log.info("Deleting conversation: id={}", id);
        
        try {
            chatService.deleteConversation(id);
            return ResponseEntity.ok(ApiResponse.ok(null, "Conversation deleted successfully"));
        } catch (IllegalArgumentException e) {
            log.error("Conversation not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Conversation not found"));
        } catch (Exception e) {
            log.error("Error deleting conversation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete conversation: " + e.getMessage()));
        }
    }
}
