// src/main/java/com/example/raon/config/SecurityConfig.java
package com.example.raon.config;

import java.util.Arrays;
import java.util.List;

import com.example.raon.handler.OAuth2LoginSuccessHandler;
import com.example.raon.security.JwtAuthenticationFilter;
import com.example.raon.service.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.client.web.HttpSessionOAuth2AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ClientRegistrationRepository clientRegistrationRepository;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // ✅ CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            // JWT 토큰 기반 인증 - 세션 사용 안함 (Stateless)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                // 정적 리소스 및 로그인 엔드포인트
                .requestMatchers(
                    "/", "/index.html", "/favicon.ico",
                    "/assets/**", "/static/**",
                    "/login/**", "/oauth2/**",
                    "/raon/login/**", "/raon/oauth2/**",
                    "/api/auth/**", "/raon/api/auth/**",
                    "/loginSuccess", "/loginFailure",
                    "/actuator/health", "/raon/actuator/health"
                ).permitAll()

                // 백오피스/디버그/채팅/챗봇/Gemini API (개발 중 편의상 오픈)
                .requestMatchers(
                    "/api/backoffice/**",
                    "/api/persoai/**",
                    "/api/sessions/**",
                    "/api/chat/**",
                    "/api/chatbots/**",
                    "/api/debug/**",
                    "/api/gemini/**",
                    "/raon/api/backoffice/**",
                    "/raon/api/persoai/**",
                    "/raon/api/sessions/**",
                    "/raon/api/chat/**",
                    "/raon/api/chatbots/**",
                    "/raon/api/debug/**",
                    "/raon/api/gemini/**"
                ).permitAll()

                // 사용자 정보 조회/수정/삭제는 인증 필요
                .requestMatchers(HttpMethod.GET, "/api/users/me", "/raon/api/users/me").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/users/me", "/raon/api/users/me").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/users/me", "/raon/api/users/me").authenticated()

                // 나머지는 인증 필요
                .anyRequest().authenticated()
            )
            // JWT 인증 필터 추가 (UsernamePasswordAuthenticationFilter 이전에 실행)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            // 인증되지 않은 요청 처리 (redirect 대신 401 응답)
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"" + authException.getMessage() + "\"}");
                })
            )
            // OAuth2 로그인 설정 (로그인 플로우에서만 사용)
            .oauth2Login(oauth2 -> oauth2
                // 커스텀 Authorization Request Resolver 사용 (prompt=login 파라미터 추가)
                .authorizationEndpoint(authorization -> authorization
                    .authorizationRequestRepository(authorizationRequestRepository())
                    .authorizationRequestResolver(
                        new CustomAuthorizationRequestResolver(clientRegistrationRepository)
                    )
                )
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
                .successHandler(oAuth2LoginSuccessHandler)
                .failureUrl("/login?error=true")  // 상대 경로로 변경
            )
            // 로그아웃 설정 (JWT 토큰 쿠키 삭제)
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/")
                .deleteCookies("refreshToken", "RAON_SESSION")  // JWT 토큰 및 세션 쿠키 삭제
                .clearAuthentication(true)
            );

        return http.build();
    }

    @Bean
    public AuthorizationRequestRepository<OAuth2AuthorizationRequest> authorizationRequestRepository() {
        // 세션 대신 쿠키 기반 repository 사용 (세션 문제 우회)
        return new CookieOAuth2AuthorizationRequestRepository();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c = new CorsConfiguration();
        // 환경별 설정에서 허용된 origin 목록 로드
        c.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        // PATCH/DELETE/OPTIONS 포함
        c.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // 필요한 헤더만 명시적으로 허용
        c.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-XSRF-TOKEN", "X-CSRF-TOKEN"));
        c.setAllowCredentials(true);
        c.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", c);
        return source;
    }
}
