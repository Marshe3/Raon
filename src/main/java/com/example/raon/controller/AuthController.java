package com.example.raon.controller;

import com.example.raon.domain.RefreshToken;
import com.example.raon.domain.UserEntity;
import com.example.raon.repository.RefreshTokenRepository;
import com.example.raon.repository.UserRepository;
import com.example.raon.util.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    /**
     * Refresh Token을 사용하여 새로운 Access Token 발급 (쿠키 방식)
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = getRefreshTokenFromCookie(request);

        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Refresh token is required"));
        }

        try {
            // 1. Refresh Token 유효성 검증
            if (!jwtTokenProvider.validateToken(refreshToken)) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired refresh token"));
            }

            // 2. Refresh Token 타입 확인
            String tokenType = jwtTokenProvider.getTokenType(refreshToken);
            if (!"refresh".equals(tokenType)) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid token type. Expected refresh token"));
            }

            // 3. DB에서 Refresh Token 조회
            RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken)
                    .orElseThrow(() -> new RuntimeException("Refresh token not found in database"));

            // 4. Refresh Token 만료 확인
            if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                refreshTokenRepository.delete(storedToken);
                return ResponseEntity.status(401).body(Map.of("error", "Refresh token expired"));
            }

            // 5. 사용자 정보 조회
            Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 6. 새로운 Access Token 생성
            String newAccessToken = jwtTokenProvider.generateAccessToken(
                    user.getUserId(),
                    user.getEmail(),
                    user.getNickname()
            );

            log.info("Successfully refreshed access token for user: {}", userId);

            // 7. 새로운 Access Token을 쿠키로 설정
            addTokenCookie(response, "accessToken", newAccessToken, 3600); // 1시간

            return ResponseEntity.ok(Map.of("message", "Token refreshed successfully"));

        } catch (Exception e) {
            log.error("Failed to refresh token", e);
            return ResponseEntity.status(401).body(Map.of("error", "Failed to refresh token: " + e.getMessage()));
        }
    }

    /**
     * 로그아웃 (Refresh Token 삭제 및 쿠키 제거)
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = getRefreshTokenFromCookie(request);

        if (refreshToken != null && !refreshToken.isEmpty()) {
            try {
                // DB에서 Refresh Token 삭제
                refreshTokenRepository.findByToken(refreshToken)
                        .ifPresent(refreshTokenRepository::delete);

                log.info("Successfully logged out");
            } catch (Exception e) {
                log.error("Failed to delete refresh token from database", e);
            }
        }

        // 쿠키 삭제
        deleteTokenCookie(response, "accessToken");
        deleteTokenCookie(response, "refreshToken");

        return ResponseEntity.ok(Map.of("message", "Successfully logged out"));
    }

    /**
     * 쿠키에서 Refresh Token 추출
     */
    private String getRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    /**
     * JWT 토큰을 쿠키로 추가
     */
    private void addTokenCookie(HttpServletResponse response, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true); // XSS 공격 방지
        cookie.setSecure(false); // 개발 환경에서는 false (운영 환경에서는 true로 변경)
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        cookie.setAttribute("SameSite", "Lax"); // CSRF 방어
        response.addCookie(cookie);
    }

    /**
     * 쿠키 삭제
     */
    private void deleteTokenCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0); // 즉시 만료
        response.addCookie(cookie);
    }
}
