package com.example.spring_server.chat.service;

import com.example.spring_server.chat.dto.ConversationDTO;
import com.example.spring_server.chat.dto.MessageDTO;
import com.example.spring_server.chat.entity.Conversation;
import com.example.spring_server.chat.entity.Message;

import java.util.List;
import java.util.Optional;

/**
 * ChatService Interface
 * 
 * Defines business operations for Chat module.
 * Encapsulates conversation & message management logic.
 */
public interface ChatService {
    
    /**
     * Create a new conversation
     * @param customerId - ID of the customer
     * @param channel - Communication channel (e.g., "zalo", "facebook")
     * @return Created ConversationDTO
     */
    ConversationDTO createConversation(String customerId, String channel);
    
    /**
     * Get conversation by ID
     * @param conversationId - ID of the conversation
     * @return ConversationDTO if exists
     */
    Optional<ConversationDTO> getConversation(Long conversationId);

    /**
     * Get all conversations for admin dashboard
     * @return List of ConversationDTOs ordered by most recent activity
     */
    List<ConversationDTO> getAllConversations();
    
    /**
     * Get all conversations for a customer
     * @param customerId - ID of the customer
     * @return List of ConversationDTOs
     */
    List<ConversationDTO> getConversationsByCustomerId(String customerId);
    
    /**
     * Send a message in a conversation
     * @param conversationId - ID of the conversation
     * @param messageDTO - Message data (sender, senderType, content)
     * @return Created MessageDTO
     */
    MessageDTO sendMessage(Long conversationId, MessageDTO messageDTO);
    
    /**
     * Get message history for a conversation
     * @param conversationId - ID of the conversation
     * @return List of MessageDTOs ordered by timestamp
     */
    List<MessageDTO> getConversationHistory(Long conversationId);
    
    /**
     * Get recent N messages for a conversation
     * @param conversationId - ID of the conversation
     * @param limit - Number of recent messages to fetch
     * @return List of MessageDTOs
     */
    List<MessageDTO> getRecentMessages(Long conversationId, int limit);
    
    /**
     * Update conversation status
     * @param conversationId - ID of the conversation
     * @param status - New status (ACTIVE, HANDED_OVER, CLOSED)
     */
    void updateConversationStatus(Long conversationId, String status);
    
    /**
     * Agent takes over the conversation from the Bot
     * @param conversationId - ID of the conversation
     * @param agentId - ID of the agent who takes over
     */
    void takeOver(Long conversationId, Long agentId);
    
    void closeConversation(Long conversationId);
    
    /**
     * Delete a conversation (and all associated messages)
     * @param conversationId - ID of the conversation
     */
    void deleteConversation(Long conversationId);

    /**
     * Cập nhật thông tin khách hàng (Tên, SĐT, Email)
     */
    void updateCustomerInfo(Long conversationId, String name, String phone, String email);
}
