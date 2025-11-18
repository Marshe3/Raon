package com.example.raon.config;

import com.example.raon.repository.RefreshTokenRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 서버 시작 시 기존 JWT Refresh Token을 모두 삭제
 * 개발 환경에서 서버 재시작 시 자동 로그인 방지
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StartupTokenCleanup {

    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * 서버 시작 시간 (이 시간 이전에 발급된 JWT 토큰은 무효화)
     */
    @Getter
    private static LocalDateTime serverStartTime;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void clearRefreshTokensOnStartup() {
        // 서버 시작 시간 기록
        serverStartTime = LocalDateTime.now();
        log.info("🚀 서버 시작 시간 기록: {}", serverStartTime);

        try {
            long count = refreshTokenRepository.count();
            if (count > 0) {
                refreshTokenRepository.deleteAll();
                log.info("🧹 서버 시작: 기존 Refresh Token {} 개 삭제 완료 (개발 환경 자동 로그인 방지)", count);
            } else {
                log.info("✅ 서버 시작: Refresh Token 테이블이 이미 비어있음");
            }
        } catch (Exception e) {
            log.error("❌ Refresh Token 삭제 실패: {}", e.getMessage());
        }
    }
}
