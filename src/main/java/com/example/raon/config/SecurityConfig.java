// src/main/java/com/example/raon/config/SecurityConfig.java
package com.example.raon.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.raon.service.CustomOAuth2UserService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;

    public SecurityConfig(CustomOAuth2UserService customOAuth2UserService) {
        this.customOAuth2UserService = customOAuth2UserService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // ✅ CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // ✅ CSRF: 프론트에서 쿠키/헤더 세팅이 번거로우면 API는 통째로 제외
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .ignoringRequestMatchers(
                    "/api/**",          // 백엔드 REST API
                    "/raon/api/**"      // 리버스 프록시로 앞에 /raon 붙는 경우
                )
            )
            .authorizeHttpRequests(auth -> auth
                // 정적/로그인 엔드포인트
                .requestMatchers(
                    "/", "/index.html", "/favicon.ico",
                    "/assets/**", "/static/**",
                    "/login/**", "/oauth2/**",
                    "/loginSuccess", "/loginFailure"
                ).permitAll()

                // 백오피스/디버그/채팅 (개발 중 편의상 오픈)
                .requestMatchers(
                    "/api/backoffice/**",
                    "/api/persoai/**",
                    "/api/sessions/**",
                    "/api/chat/**",
                    "/api/debug/**",
                    "/raon/api/backoffice/**",
                    "/raon/api/persoai/**",
                    "/raon/api/sessions/**",
                    "/raon/api/chat/**",
                    "/raon/api/debug/**"
                ).permitAll()

                // 현재 로그인 사용자 조회는 인증 필요(원한다면 permitAll로 바꿔도 됨)
                .requestMatchers(HttpMethod.GET, "/api/users/me", "/raon/api/users/me").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/users/me", "/raon/api/users/me").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/users/me", "/raon/api/users/me").authenticated()

                // 나머지는 인증
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                .defaultSuccessUrl("http://localhost:3000/", true)
                .failureUrl("http://localhost:3000/login?error=true")
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("http://localhost:3000/")
                .deleteCookies("JSESSIONID")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c = new CorsConfiguration();
        // 프론트 개발 서버
        c.setAllowedOrigins(List.of("http://localhost:3000"));
        // ✅ PATCH/DELETE/OPTIONS 포함
        c.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // ✅ CSRF 헤더 포함
        c.setAllowedHeaders(List.of("*", "X-XSRF-TOKEN", "X-CSRF-TOKEN", "Content-Type", "Authorization"));
        c.setAllowCredentials(true);
        c.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", c);
        return source;
    }
}
