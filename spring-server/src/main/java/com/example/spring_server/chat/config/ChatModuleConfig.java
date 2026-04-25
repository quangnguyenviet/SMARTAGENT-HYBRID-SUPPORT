package com.example.spring_server.chat.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * ChatModuleConfig
 * 
 * Bean definitions for Chat Module.
 */
@Configuration
public class ChatModuleConfig {
    
    /**
     * ObjectMapper bean for JSON serialization/deserialization
     * Used in WebSocket handlers and REST controllers
     */
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
