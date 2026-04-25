package com.example.spring_server.chat.repository;

import com.example.spring_server.chat.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * MessageRepository
 * 
 * Provides CRUD operations & custom queries for Message entity.
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    /**
     * Find all messages for a conversation, ordered by timestamp
     */
    List<Message> findByConversationIdOrderByTimestampAsc(Long conversationId);
    
    /**
     * Find recent N messages for a conversation
     */
    @Query(value = "SELECT * FROM messages WHERE conversation_id = ?1 ORDER BY timestamp DESC LIMIT ?2",
           nativeQuery = true)
    List<Message> findRecentMessages(Long conversationId, int limit);
    
    /**
     * Count messages by conversation
     */
    long countByConversationId(Long conversationId);
}
