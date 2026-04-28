package com.example.spring_server.messenger.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FacebookWebhookPayload {
    private String object;
    private List<Entry> entry;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Entry {
        private String id;
        private long time;
        private List<Messaging> messaging;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Messaging {
        private Sender sender;
        private Recipient recipient;
        private long timestamp;
        private Message message;
        private Postback postback;
    }

    @Data
    public static class Sender {
        private String id;
    }

    @Data
    public static class Recipient {
        private String id;
    }

    @Data
    public static class Message {
        private String mid;
        private String text;
    }

    @Data
    public static class Postback {
        private String title;
        private String payload;
    }
}
