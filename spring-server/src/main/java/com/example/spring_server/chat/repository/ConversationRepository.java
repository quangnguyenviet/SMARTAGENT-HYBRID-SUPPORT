package com.example.spring_server.chat.repository;

import com.example.spring_server.chat.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ConversationRepository
 * 
 * Provides CRUD operations & custom queries for Conversation entity.
 */
@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    /**
     * Find all conversations by customerId
     */
    List<Conversation> findByCustomerId(Long customerId);
    
    /**
     * Find active conversations by customerId
     */
    List<Conversation> findByCustomerIdAndStatus(Long customerId, String status);
    
    /**
     * Find conversations by channel
     */
    List<Conversation> findByChannel(String channel);
    
    /**
     * Find conversation by customerId & channel
     */
    Optional<Conversation> findByCustomerIdAndChannel(Long customerId, String channel);
}
