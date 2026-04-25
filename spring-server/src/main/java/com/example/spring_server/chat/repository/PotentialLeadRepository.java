package com.example.spring_server.chat.repository;

import com.example.spring_server.chat.entity.PotentialLead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PotentialLeadRepository extends JpaRepository<PotentialLead, Long> {
    
    Optional<PotentialLead> findByConversationId(Long conversationId);
}
