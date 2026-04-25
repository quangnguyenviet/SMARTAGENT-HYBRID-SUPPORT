package com.example.spring_server.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocketConfig
 * 
 * Configures STOMP WebSocket endpoints and message brokers.
 * Enables real-time Pub/Sub communication for both Customer and Admin.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Khởi tạo endpoint WebSocket chính cho toàn hệ thống
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:3001");
                // .withSockJS(); // Bỏ qua SockJS để dùng STOMP trực tiếp qua WebSockets chuẩn
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Các destination bắt đầu bằng "/topic" hoặc "/queue" sẽ được Broker xử lý và đẩy xuống client đang subscribe
        registry.enableSimpleBroker("/topic", "/queue");
        
        // Các tin nhắn từ client gửi lên có prefix "/app" sẽ được map vào các @MessageMapping trong Controller
        registry.setApplicationDestinationPrefixes("/app");
    }
}
