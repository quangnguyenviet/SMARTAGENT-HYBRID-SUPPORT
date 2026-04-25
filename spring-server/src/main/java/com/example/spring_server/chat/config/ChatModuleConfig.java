package com.example.spring_server.chat.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
}
