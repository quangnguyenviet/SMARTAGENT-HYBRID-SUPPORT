package com.example.spring_server.chat.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * PotentialLead Entity
 * 
 * Lưu trữ thông tin phân tích của AI về khách hàng tiềm năng.
 */
@Entity
@Table(name = "potential_leads")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PotentialLead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @Column(name = "intent_summary", columnDefinition = "TEXT")
    private String intentSummary;

    @Column(name = "estimated_value", precision = 15, scale = 2)
    private BigDecimal estimatedValue;

    @Column(length = 10)
    private String priority; // e.g., HIGH, MEDIUM, LOW
}
