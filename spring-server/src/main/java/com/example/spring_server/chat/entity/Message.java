package com.example.spring_server.chat.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Message Entity
 * 
 * Đại diện cho một tin nhắn trong một conversation.
 * Lưu trữ nội dung, người gửi, loại người gửi, và thời gian.
 */
@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Relationship: Many messages belong to one conversation
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;
    
    /**
     * Người gửi (có thể là customer, bot, hoặc agent)
     * Format: "customer_{id}", "bot", "agent_{id}"
     */
    @Column(nullable = false)
    private String sender;
    
    /**
     * Loại người gửi (USER, BOT, AGENT)
     */
    @Column(nullable = false)
    private String senderType;
    
    /**
     * Nội dung tin nhắn
     */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    /**
     * Thời gian gửi tin nhắn
     */
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    /**
     * JPA lifecycle callback - auto-set timestamp
     */
    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
