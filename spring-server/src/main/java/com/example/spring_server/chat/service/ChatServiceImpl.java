package com.example.spring_server.chat.service;

import com.example.spring_server.chat.dto.ConversationDTO;
import com.example.spring_server.chat.dto.MessageDTO;
import com.example.spring_server.chat.entity.Conversation;
import com.example.spring_server.chat.entity.Message;
import com.example.spring_server.chat.repository.ConversationRepository;
import com.example.spring_server.chat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.example.spring_server.chat.dto.AdminDashboardEvent;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * ChatServiceImpl
 * 
 * Implementation of ChatService interface.
 * Handles conversation & message persistence, state management.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ChatServiceImpl implements ChatService {
    
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Override
    public ConversationDTO createConversation(Long customerId, String channel) {
        Conversation conversation = new Conversation();
        conversation.setCustomerId(customerId);
        conversation.setChannel(channel);
        conversation.setStatus("ACTIVE");
        
        Conversation saved = conversationRepository.save(conversation);
        ConversationDTO dto = entityToDTO(saved);
        
        // Broadcast to admin dashboard
        messagingTemplate.convertAndSend("/topic/admin/conversations", 
            AdminDashboardEvent.builder()
                .eventType(AdminDashboardEvent.EventType.CONVERSATION_CREATED)
                .conversation(dto)
                .build());
                
        return dto;
    }
    
    @Override
    public Optional<ConversationDTO> getConversation(Long conversationId) {
        return conversationRepository.findById(conversationId)
                .map(this::entityToDTO);
    }

    @Override
    public List<ConversationDTO> getAllConversations() {
        return conversationRepository.findAll(Sort.by(Sort.Direction.DESC, "updatedAt"))
                .stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ConversationDTO> getConversationsByCustomerId(Long customerId) {
        return conversationRepository.findByCustomerId(customerId)
                .stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public MessageDTO sendMessage(Long conversationId, MessageDTO messageDTO) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found: " + conversationId));
        
        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(messageDTO.getSender());
        message.setSenderType(messageDTO.getSenderType());
        message.setContent(messageDTO.getContent());
        
        Message saved = messageRepository.save(message);
        
        // Update conversation updatedAt timestamp
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);
        
        MessageDTO dto = entityToDTO(saved);
        
        // Broadcast to admin dashboard
        messagingTemplate.convertAndSend("/topic/admin/conversations", 
            AdminDashboardEvent.builder()
                .eventType(AdminDashboardEvent.EventType.NEW_MESSAGE)
                .conversation(entityToDTO(conversation))
                .message(dto)
                .build());
                
        // Broadcast to the specific conversation room
        messagingTemplate.convertAndSend("/topic/chat/" + conversationId, dto);
        
        return dto;
    }
    
    @Override
    public List<MessageDTO> getConversationHistory(Long conversationId) {
        // Verify conversation exists
        conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found: " + conversationId));
        
        return messageRepository.findByConversationIdOrderByTimestampAsc(conversationId)
                .stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<MessageDTO> getRecentMessages(Long conversationId, int limit) {
        // Verify conversation exists
        conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found: " + conversationId));
        
        return messageRepository.findRecentMessages(conversationId, limit)
                .stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public void updateConversationStatus(Long conversationId, String status) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found: " + conversationId));
        
        conversation.setStatus(status);
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);
        
        // Broadcast update to admin
        messagingTemplate.convertAndSend("/topic/admin/conversations", 
            AdminDashboardEvent.builder()
                .eventType(AdminDashboardEvent.EventType.CONVERSATION_UPDATED)
                .conversation(entityToDTO(conversation))
                .build());
    }
    
    @Override
    public void closeConversation(Long conversationId) {
        updateConversationStatus(conversationId, "CLOSED");
    }
    
    @Override
    public void deleteConversation(Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found: " + conversationId));
        
        conversationRepository.delete(conversation);
    }
    
    // Helper methods for DTO conversion
    
    private ConversationDTO entityToDTO(Conversation entity) {
        return ConversationDTO.builder()
                .id(entity.getId())
                .customerId(entity.getCustomerId())
                .channel(entity.getChannel())
                .status(entity.getStatus())
                .isBotActive(entity.getIsBotActive())
                .leadScore(entity.getLeadScore())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .lastMessageTime(entity.getMessages().isEmpty() ? 
                        null : 
                        entity.getMessages().get(entity.getMessages().size() - 1).getTimestamp())
                .messageCount((long) entity.getMessages().size())
                .build();
    }
    
    private MessageDTO entityToDTO(Message entity) {
        return MessageDTO.builder()
                .id(entity.getId())
                .conversationId(entity.getConversation().getId())
                .sender(entity.getSender())
                .senderType(entity.getSenderType())
                .content(entity.getContent())
                .timestamp(entity.getTimestamp())
                .build();
    }
}
