package com.example.raon.handler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * OAuth2 로그인 실패 핸들러
 * - 사용자가 로그인 취소: 홈화면으로 리다이렉트
 * - 실제 오류 발생: 에러 메시지와 함께 로그인 페이지로 리다이렉트
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {

        String errorCode = "unknown_error";
        String errorDescription = exception.getMessage();

        // OAuth2 인증 예외인 경우 에러 정보 추출
        if (exception instanceof OAuth2AuthenticationException) {
            OAuth2Error error = ((OAuth2AuthenticationException) exception).getError();
            errorCode = error.getErrorCode();
            errorDescription = error.getDescription() != null ? error.getDescription() : errorCode;
        }

        log.error("OAuth2 login failed - Error Code: {}, Description: {}, Exception: {}",
                  errorCode, errorDescription, exception.getClass().getSimpleName());

        // 사용자가 로그인 취소한 경우 (구글/카카오 로그인 화면에서 취소 버튼 클릭)
        if ("access_denied".equals(errorCode)) {
            log.info("User cancelled OAuth2 login. Redirecting to home page.");
            response.sendRedirect(frontendUrl);
            return;
        }

        // 실제 오류 발생 시 - 로그인 페이지로 리다이렉트 (에러 메시지 포함)
        log.warn("OAuth2 authentication error occurred. Redirecting to login page with error message.");
        String encodedError = URLEncoder.encode(errorDescription, StandardCharsets.UTF_8);
        response.sendRedirect(frontendUrl + "/login?error=" + encodedError);
    }
}
