package com.example.raon.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * OAuth2 인증 요청에 prompt=login 파라미터를 추가하여
 * 로그아웃 후 재로그인 시 항상 소셜 계정 인증을 요구하도록 함
 */
public class CustomAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

    private final DefaultOAuth2AuthorizationRequestResolver defaultResolver;

    public CustomAuthorizationRequestResolver(ClientRegistrationRepository clientRegistrationRepository) {
        this.defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(
                clientRegistrationRepository, "/raon/oauth2/authorization");
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest authorizationRequest = defaultResolver.resolve(request);
        return customizeAuthorizationRequest(authorizationRequest);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        OAuth2AuthorizationRequest authorizationRequest = defaultResolver.resolve(request, clientRegistrationId);
        return customizeAuthorizationRequest(authorizationRequest);
    }

    /**
     * OAuth2 인증 요청에 prompt=login 파라미터 추가
     */
    private OAuth2AuthorizationRequest customizeAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest) {
        if (authorizationRequest == null) {
            return null;
        }

        // 기존 파라미터 복사
        Map<String, Object> additionalParameters = new HashMap<>(authorizationRequest.getAdditionalParameters());

        // prompt=login 파라미터 추가 (Google, Kakao 모두 지원)
        // 이 파라미터는 OAuth2 제공자에게 기존 세션을 무시하고 항상 로그인 화면을 표시하도록 지시
        additionalParameters.put("prompt", "login");

        // 새로운 OAuth2AuthorizationRequest 생성
        return OAuth2AuthorizationRequest.from(authorizationRequest)
                .additionalParameters(additionalParameters)
                .build();
    }
}
