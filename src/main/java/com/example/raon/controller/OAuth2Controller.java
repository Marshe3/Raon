package com.example.raon.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

@RestController
public class OAuth2Controller {

    @GetMapping("/loginSuccess")
    public String loginSuccess(@AuthenticationPrincipal OAuth2User oauth2User) {
        // 제공자별로 처리
        Map<String, Object> userInfo = extractUserInfo(oauth2User);
        
        String email = (String) userInfo.get("email");
        String name = (String) userInfo.get("name");

        return "로그인 성공! Email: " + email + ", Name: " + name;
    }

    @GetMapping("/loginFailure")
    public String loginFailure() {
        return "로그인 실패";
    }

    /**
     * 프론트엔드에서 현재 로그인 상태를 확인하기 위한 API 엔드포인트
     * OAuth2 로그인 후 세션이 유지되고 있는지 확인하고 사용자 정보를 반환
     *
     * @param oauth2User Spring Security에서 자동으로 주입되는 OAuth2 사용자 정보
     * @return 로그인된 경우 사용자 정보 JSON, 비로그인 시 401 상태코드
     */
    @GetMapping("/api/user/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal OAuth2User oauth2User) {
        // 로그인되지 않은 경우 (세션이 없거나 만료된 경우)
        if (oauth2User == null) {
            return ResponseEntity.status(401).build(); // 401 Unauthorized 반환
        }

        // 제공자별로 사용자 정보 추출
        Map<String, Object> userInfo = extractUserInfo(oauth2User);

        return ResponseEntity.ok(userInfo); // 200 OK와 함께 사용자 정보 반환
    }

    /**
     * OAuth2 제공자(카카오/구글)에 따라 사용자 정보를 추출하는 헬퍼 메서드
     *
     * @param oauth2User OAuth2 사용자 객체
     * @return 표준화된 사용자 정보 Map
     */
    private Map<String, Object> extractUserInfo(OAuth2User oauth2User) {
        Map<String, Object> userInfo = new HashMap<>();
        Map<String, Object> attributes = oauth2User.getAttributes();

        // 카카오 로그인인 경우
        if (attributes.containsKey("kakao_account")) {
            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");

            userInfo.put("id", attributes.get("id"));
            userInfo.put("email", kakaoAccount.get("email"));
            userInfo.put("name", profile.get("nickname"));
            userInfo.put("picture", profile.get("profile_image_url"));
            userInfo.put("provider", "kakao");
        }
        // 구글 로그인인 경우
        else if (attributes.containsKey("sub")) {
            userInfo.put("id", attributes.get("sub"));
            userInfo.put("email", attributes.get("email"));
            userInfo.put("name", attributes.get("name"));
            userInfo.put("picture", attributes.get("picture"));
            userInfo.put("provider", "google");
        }

        return userInfo;
    }
}