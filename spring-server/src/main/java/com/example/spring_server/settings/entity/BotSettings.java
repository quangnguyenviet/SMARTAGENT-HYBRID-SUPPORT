package com.example.spring_server.settings.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "bot_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BotSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "handover_threshold", nullable = false)
    private Integer handoverThreshold;

    @Column(name = "business_prompt", nullable = false, columnDefinition = "TEXT")
    private String businessPrompt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
