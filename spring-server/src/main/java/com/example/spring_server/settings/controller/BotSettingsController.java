package com.example.spring_server.settings.controller;

import com.example.spring_server.chat.dto.ApiResponse;
import com.example.spring_server.settings.entity.BotSettings;
import com.example.spring_server.settings.service.BotSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings/bot")
@RequiredArgsConstructor
@CrossOrigin // Cho phép frontend gọi trực tiếp nếu cần
public class BotSettingsController {

    private final BotSettingsService botSettingsService;

    @GetMapping
    public ApiResponse<BotSettings> getSettings() {
        return ApiResponse.ok(botSettingsService.getSettings());
    }

    @PutMapping
    public ApiResponse<BotSettings> updateSettings(@RequestBody BotSettings settings) {
        return ApiResponse.ok(botSettingsService.updateSettings(settings));
    }
}
