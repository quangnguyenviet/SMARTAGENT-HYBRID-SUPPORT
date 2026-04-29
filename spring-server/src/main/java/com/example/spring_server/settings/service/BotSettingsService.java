package com.example.spring_server.settings.service;

import com.example.spring_server.settings.entity.BotSettings;
import com.example.spring_server.settings.repository.BotSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BotSettingsService {

    private final BotSettingsRepository botSettingsRepository;

    @Cacheable(value = "botSettings", key = "'global'")
    public BotSettings getSettings() {
        log.info("Lấy cấu hình Bot từ Database...");
        return botSettingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                    BotSettings defaultSettings = BotSettings.builder()
                            .handoverThreshold(50)
                            .businessPrompt("Cấu hình mặc định")
                            .build();
                    return botSettingsRepository.save(defaultSettings);
                });
    }

    @Transactional
    @CachePut(value = "botSettings", key = "'global'")
    public BotSettings updateSettings(BotSettings newSettings) {
        log.info("Cập nhật cấu hình Bot mới: {}", newSettings);
        BotSettings existing = getSettings();
        existing.setHandoverThreshold(newSettings.getHandoverThreshold());
        existing.setBusinessPrompt(newSettings.getBusinessPrompt());
        return botSettingsRepository.save(existing);
    }
}
