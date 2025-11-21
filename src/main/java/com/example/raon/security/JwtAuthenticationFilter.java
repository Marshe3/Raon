package com.example.raon.security;

import com.example.raon.util.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            // 1. Authorization 헤더에서 JWT 토큰 추출
            String jwt = getJwtFromRequest(request);

            // 2. 토큰 유효성 검증
            if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {
                // 3. Access Token인지 확인
                String tokenType = jwtTokenProvider.getTokenType(jwt);
                if (!"access".equals(tokenType)) {
                    log.warn("Invalid token type: {}. Expected 'access'", tokenType);
                    filterChain.doFilter(request, response);
                    return;
                }

                // 4. JWT에서 사용자 정보 추출
                Long userId = jwtTokenProvider.getUserIdFromToken(jwt);
                String email = jwtTokenProvider.getEmailFromToken(jwt);
                String name = jwtTokenProvider.getNameFromToken(jwt);

                // 5. UserPrincipal 생성
                UserPrincipal userPrincipal = new UserPrincipal(userId, email, name);

                // 6. Spring Security 인증 객체 생성
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 7. SecurityContext에 인증 정보 저장
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("JWT authentication successful for user: {}", email);
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Request의 Authorization 헤더 또는 쿠키에서 JWT 토큰 추출
     * 1순위: Authorization 헤더 (Bearer {token})
     * 2순위: accessToken 쿠키
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        // 1. Authorization 헤더에서 추출
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            log.info("[JWT] Token found in Authorization header");
            return bearerToken.substring(7);
        }

        // 2. 쿠키에서 추출
        if (request.getCookies() != null) {
            log.info("[JWT] Checking cookies. Total: {}", request.getCookies().length);
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                log.info("[JWT] Cookie: {} (path: {}, domain: {})", cookie.getName(), cookie.getPath(), cookie.getDomain());
                if ("accessToken".equals(cookie.getName())) {
                    log.info("[JWT] ✓ accessToken found in cookie!");
                    return cookie.getValue();
                }
            }
            log.info("[JWT] ✗ accessToken NOT found in cookies");
        } else {
            log.info("[JWT] ✗ No cookies in request");
        }

        log.info("[JWT] No JWT token found");
        return null;
    }
}
