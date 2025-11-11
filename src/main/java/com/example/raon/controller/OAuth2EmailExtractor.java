// src/main/java/com/example/raon/controller/OAuth2EmailExtractor.java
package com.example.raon.controller;

import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Map;

public class OAuth2EmailExtractor {

    public static String getEmail(OAuth2User user) {
        if (user == null) return null;
        Map<String, Object> attrs = user.getAttributes();

        // Google
        Object googleEmail = attrs.get("email");
        if (googleEmail instanceof String s && !s.isBlank()) return s;

        // Kakao
        Object kakaoAccount = attrs.get("kakao_account");
        if (kakaoAccount instanceof Map<?, ?> account) {
            Object kakaoEmail = account.get("email");
            if (kakaoEmail instanceof String s && !s.isBlank()) return s;
        }

        // Naver
        Object naverResp = attrs.get("response");
        if (naverResp instanceof Map<?, ?> resp) {
            Object naverEmail = resp.get("email");
            if (naverEmail instanceof String s && !s.isBlank()) return s;
        }

        return null;
    }

    public static String getProviderId(OAuth2User user) {
        if (user == null) return null;
        Map<String, Object> attrs = user.getAttributes();

        // Google
        Object sub = attrs.get("sub");
        if (sub instanceof String s && !s.isBlank()) return "google:" + s;

        // Kakao
        Object kakaoId = attrs.get("id");
        if (kakaoId != null) return "kakao:" + kakaoId.toString();

        // Naver
        Object naverResp = attrs.get("response");
        if (naverResp instanceof Map<?, ?> resp) {
            Object id = resp.get("id");
            if (id != null) return "naver:" + id.toString();
        }

        return "unknown";
    }
}
