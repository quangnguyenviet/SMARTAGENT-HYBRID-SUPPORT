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
     * Cờ đánh dấu Bot AI có đang tự động trả lời hay không
     */
    @Column(name = "is_bot_active", nullable = false)
    private Boolean isBotActive = true;
    
    /**
     * Điểm số đánh giá độ tiềm năng của khách hàng (Lead Score)
     */
    @Column(name = "lead_score", nullable = false)
    private Integer leadScore = 0;
    
    /**
     * ID của nhân viên (agent) được phân công phụ trách khi handover
     */
    @Column(name = "assigned_agent_id")
    private Long assignedAgentId;
    
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

    @OneToOne(mappedBy = "conversation", cascade = CascadeType.ALL)
    private PotentialLead potentialLead;
    
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
