package com.example.spring_server.chat.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * PotentialLead Entity
 *
 * Lưu trữ thông tin phân tích của AI về khách hàng tiềm năng,
 * bao gồm thông tin liên hệ do bot thu thập được.
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

    @Column(length = 10)
    private String priority; // HIGH, MEDIUM, LOW

    // --- Thông tin liên hệ do bot thu thập ---

    @Column(name = "customer_name", length = 100)
    private String customerName;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(name = "contact_collected_at")
    private LocalDateTime contactCollectedAt;
}
