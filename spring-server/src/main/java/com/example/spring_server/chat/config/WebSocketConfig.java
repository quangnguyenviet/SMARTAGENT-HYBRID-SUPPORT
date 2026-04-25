package com.example.spring_server.chat.config;

import com.example.spring_server.chat.handler.ChatWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocketConfig
 * 
 * Configures WebSocket endpoints, handlers, and interceptors.
 * Enables real-time communication between client & server.
 */
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {
    
    private final ChatWebSocketHandler chatWebSocketHandler;
    
    /**
     * Register WebSocket handlers and set CORS settings
     */
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatWebSocketHandler, "/ws/chat")
                .setAllowedOrigins("http://localhost:5173", "http://localhost:3000")
                .addInterceptors(new ChatWebSocketHandshakeInterceptor());
        
        // Additional WebSocket endpoints can be registered here
        // Example: registry.addHandler(notificationHandler, "/ws/notifications")
    }
}
