package com.example.spring_server.chat.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * ChatWebSocketHandshakeInterceptor
 * 
 * Intercepts WebSocket handshake to perform validation & setup.
 * Can be used to extract JWT tokens, validate sessions, etc.
 */
@Slf4j
public class ChatWebSocketHandshakeInterceptor implements HandshakeInterceptor {
    
    /**
     * Called before WebSocket handshake
     * Return false to deny the connection
     */
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        
        log.info("WebSocket handshake attempt: {}", request.getURI());
        
        // TODO: Extract & validate JWT token from query parameter or header
        // Example:
        // String token = request.getURI().getQuery(); // ?token=xxx
        // if (!jwtTokenProvider.validateToken(token)) {
        //     return false;
        // }
        // attributes.put("userId", jwtTokenProvider.extractUserId(token));
        
        return true;  // Allow handshake for now
    }
    
    /**
     * Called after successful WebSocket handshake
     */
    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                              WebSocketHandler wsHandler, Exception exception) {
        if (exception != null) {
            log.error("WebSocket handshake failed", exception);
        } else {
            log.info("WebSocket handshake successful: {}", request.getURI());
        }
    }
}
