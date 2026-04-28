package com.example.spring_server.settings.repository;

import com.example.spring_server.settings.entity.BotSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BotSettingsRepository extends JpaRepository<BotSettings, Long> {
    // Vì chỉ có 1 row cấu hình duy nhất, ta có thể lấy row đầu tiên
}
