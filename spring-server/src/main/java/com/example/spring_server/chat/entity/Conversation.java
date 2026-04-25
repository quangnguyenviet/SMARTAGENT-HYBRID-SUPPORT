package com.example.spring_server.chat.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Conversation Entity
 * 
 * Đại diện cho một cuộc hội thoại giữa customer và bot/agent.
 * Mỗi conversation có thể chứa nhiều messages.
 */
@Entity
@Table(name = "conversations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Customer ID - định danh khách hàng
     */
    @Column(nullable = false)
    private Long customerId;
    
    /**
     * Channel - kênh giao tiếp (e.g., "zalo", "facebook", "website")
     */
    @Column(nullable = false)
    private String channel;
    
    /**
     * Status của conversation (ACTIVE, HANDED_OVER, CLOSED, ARCHIVED)
     */
    @Column(nullable = false)
    private String status;
    
    /**
     * Thời gian tạo conversation
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    /**
     * Thời gian cập nhật gần nhất
     */
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    /**
     * Relationship: One conversation has many messages
     */
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages = new ArrayList<>();
    
    /**
     * JPA lifecycle callback - auto-set createdAt & updatedAt
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
