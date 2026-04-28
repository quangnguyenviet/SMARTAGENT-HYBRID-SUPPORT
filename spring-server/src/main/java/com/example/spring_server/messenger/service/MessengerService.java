package com.example.spring_server.messenger.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class MessengerService {

    @Value("${facebook.page-access-token:}")
    private String pageAccessToken;

    private final String GRAPH_API_URL = "https://graph.facebook.com/v19.0/me/messages";
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Gửi tin nhắn văn bản tới người dùng Facebook qua PSID.
     */
    public void sendMessage(String recipientId, String text) {
        if (pageAccessToken == null || pageAccessToken.isEmpty()) {
            log.warn("Facebook Page Access Token is not configured. Cannot send message.");
            return;
        }

        log.info("Sending Messenger reply to PSID {}: {}", recipientId, text);

        Map<String, Object> body = new HashMap<>();
        
        Map<String, String> recipient = new HashMap<>();
        recipient.put("id", recipientId);
        body.put("recipient", recipient);

        Map<String, String> message = new HashMap<>();
        message.put("text", text);
        body.put("message", message);

        String url = GRAPH_API_URL + "?access_token=" + pageAccessToken;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(url, entity, String.class);
            log.info("Messenger reply sent successfully via Graph API.");
        } catch (Exception e) {
            log.error("Failed to send Messenger reply to {}: {}", recipientId, e.getMessage());
        }
    }
}
