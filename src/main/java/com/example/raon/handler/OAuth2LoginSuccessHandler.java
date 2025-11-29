package com.example.raon.handler;

import com.example.raon.domain.RefreshToken;
import com.example.raon.domain.SocialType;
import com.example.raon.domain.User;
import com.example.raon.repository.RefreshTokenRepository;
import com.example.raon.repository.UserRepository;
import com.example.raon.service.UserOauthTokenService;
import com.example.raon.util.JwtTokenProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.ResponseCookie;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserOauthTokenService userOauthTokenService;
    private final OAuth2AuthorizedClientService authorizedClientService;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    @Value("${jwt.cookie.access-token-max-age}")
    private int accessTokenCookieMaxAge;

    @Value("${jwt.cookie.refresh-token-max-age}")
    private int refreshTokenCookieMaxAge;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${jwt.cookie.secure:false}")
    private boolean cookieSecure;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();

        String registrationId = oauthToken.getAuthorizedClientRegistrationId();
        SocialType socialType = SocialType.valueOf(registrationId.toUpperCase());

        if (socialType == SocialType.KAKAO) {
            log.info("SuccessHandler Kakao User Attributes: {}", oAuth2User.getAttributes());
        }

        // 사용자 정보에서 socialId 추출
        String socialId = extractSocialId(oAuth2User, registrationId);
        log.info("Extracted socialId: {} for provider: {}", socialId, registrationId);

        // DB에서 사용자 조회
        User user = userRepository.findBySocialTypeAndSocialId(socialType, socialId)
                .orElseThrow(() -> new RuntimeException("OAuth2LoginSuccessHandler: User not found after OAuth2 login. This should not happen."));

        // OAuth Provider 리프레시 토큰 저장 (기존 기능 유지)
        OAuth2AuthorizedClient authorizedClient = authorizedClientService.loadAuthorizedClient(registrationId, authentication.getName());
        OAuth2RefreshToken oauthRefreshToken = authorizedClient.getRefreshToken();

        if (oauthRefreshToken != null) {
            LocalDateTime expiresAt = null;
            Instant expiresAtInstant = oauthRefreshToken.getExpiresAt();
            if (expiresAtInstant != null) {
                expiresAt = LocalDateTime.ofInstant(expiresAtInstant, ZoneId.systemDefault());
            } else {
                // 만료 시간이 제공되지 않는 경우 기본값 설정
                // 카카오: 60일, 구글: 일반적으로 만료시간 제공
                if (socialType == SocialType.KAKAO) {
                    expiresAt = LocalDateTime.now().plusDays(60);
                    log.info("Kakao refresh token expiration not provided. Setting default expiration to 60 days for user: {}", user.getUserId());
                } else {
                    // 다른 Provider의 경우 기본 30일
                    expiresAt = LocalDateTime.now().plusDays(30);
                    log.info("OAuth refresh token expiration not provided. Setting default expiration to 30 days for user: {}, socialType: {}", user.getUserId(), socialType);
                }
            }

            userOauthTokenService.saveOrUpdateToken(user.getUserId(), socialType, oauthRefreshToken.getTokenValue(), expiresAt);
            log.info("Successfully saved or updated OAuth refresh token for user: {}, socialType: {}", user.getUserId(), socialType);
        } else {
            log.warn("OAuth refresh token not found for user: {}, socialType: {}. It might not be provided by the OAuth provider.", user.getUserId(), socialType);
        }

        // ===== 자체 JWT 토큰 발급 =====

        // 1. Access Token 생성
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getUserId(),
                user.getEmail(),
                user.getNickname()
        );
        log.info("Generated access token for user: {}", user.getUserId());

        // 2. Refresh Token 생성
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUserId());
        log.info("Generated refresh token for user: {}", user.getUserId());

        // 3. Refresh Token을 DB에 저장
        LocalDateTime refreshTokenExpiresAt = LocalDateTime.now().plusSeconds(refreshTokenExpiration / 1000);
        RefreshToken refreshTokenEntity = refreshTokenRepository.findByUserId(user.getUserId())
                .map(existingToken -> {
                    existingToken.updateToken(refreshToken, refreshTokenExpiresAt);
                    return existingToken;
                })
                .orElseGet(() -> RefreshToken.builder()
                        .userId(user.getUserId())
                        .token(refreshToken)
                        .expiresAt(refreshTokenExpiresAt)
                        .build());

        refreshTokenRepository.save(refreshTokenEntity);
        log.info("Saved refresh token to database for user: {}", user.getUserId());

        // 4. JWT 토큰을 쿠키로 전달
        addTokenCookie(response, "accessToken", accessToken, accessTokenCookieMaxAge);
        addTokenCookie(response, "refreshToken", refreshToken, refreshTokenCookieMaxAge);

        log.info("Added JWT tokens to cookies (accessToken: {}초, refreshToken: {}초)",
                 accessTokenCookieMaxAge, refreshTokenCookieMaxAge);

        // 5. 프론트엔드 홈으로 리디렉션
        getRedirectStrategy().sendRedirect(request, response, frontendUrl);
    }

    private String extractSocialId(OAuth2User oAuth2User, String registrationId) {
        Map<String, Object> attributes = oAuth2User.getAttributes();
        if (registrationId.equalsIgnoreCase("google")) {
            return (String) attributes.get("sub");
        } else if (registrationId.equalsIgnoreCase("kakao")) {
            return String.valueOf(attributes.get("id"));
        }
        throw new IllegalStateException("Unsupported OAuth2 provider: " + registrationId);
    }

    /**
     * JWT 토큰을 쿠키로 추가하는 헬퍼 메서드
     * ResponseCookie를 사용하여 SameSite 속성을 올바르게 설정
     */
    private void addTokenCookie(HttpServletResponse response, String name, String value, int maxAge) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)           // XSS 공격 방지
                .secure(cookieSecure)     // 환경별 설정 사용
                .path("/")                // 모든 경로에서 접근 가능
                .maxAge(maxAge)           // 쿠키 만료 시간
                .sameSite("Lax")          // CSRF 방어
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
        log.info("Set cookie: {} (maxAge: {}s, secure: {}, sameSite: Lax)", name, maxAge, cookieSecure);
    }
}
