package com.example.raon.controller;

import com.example.raon.domain.UserEntity;
import com.example.raon.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 사용자 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /* =========================
       ✅ 현재 로그인 사용자(me)
       ========================= */

    /** GET /api/users/me */
    @GetMapping("/me")
    public ResponseEntity<UserEntity> me(@AuthenticationPrincipal OAuth2User oauth2User) {
        if (oauth2User == null) return ResponseEntity.status(401).build();

        // 1) 이메일로 우선 조회
        String email = safeGetEmail(oauth2User);
        if (email != null && !email.isBlank()) {
            try {
                UserEntity user = userService.getUserByEmail(email);
                return ResponseEntity.ok(user);
            } catch (IllegalArgumentException ignore) {
                // 이메일로 미등록인 경우 → providerId fallback
            }
        }

        // 2) fallback: providerId(google:sub / kakao:id)로 조회/생성
        String providerId = buildProviderId(oauth2User);
        if (providerId == null) {
            log.warn("me() - providerId 추출 실패. attributes={}", oauth2User.getAttributes());
            return ResponseEntity.badRequest().build();
        }

        UserEntity user = userService.getOrCreateByProviderId(providerId);
        return ResponseEntity.ok(user);
    }

    /** PATCH /api/users/me */
    @PatchMapping("/me")
    public ResponseEntity<UserEntity> updateMe(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @RequestBody ProfileUpdateRequest request
    ) {
        if (oauth2User == null) return ResponseEntity.status(401).build();

        UserEntity me = resolveMe(oauth2User);
        if (me == null) return ResponseEntity.status(400).build();

        UserEntity updated = userService.updateProfile(
                me.getUserId(), // ※ getUserId로 통일
                request.getNickname(),
                request.getProfileImage()
        );
        return ResponseEntity.ok(updated);
    }

    /** DELETE /api/users/me */
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMe(@AuthenticationPrincipal OAuth2User oauth2User) {
        if (oauth2User == null) return ResponseEntity.status(401).build();

        UserEntity me = resolveMe(oauth2User);
        if (me == null) return ResponseEntity.status(400).build();

        userService.deleteUser(me.getUserId()); // ※ getUserId로 통일
        return ResponseEntity.noContent().build();
    }

    /* =========================
       ✅ 기존 엔드포인트들 (그대로)
       ========================= */

    /** GET /api/users/{userId} */
    @GetMapping("/{userId}")
    public ResponseEntity<UserEntity> getUser(@PathVariable Long userId) {
        log.info("사용자 조회 요청 - userId: {}", userId);
        UserEntity user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    /** GET /api/users/email/{email} */
    @GetMapping("/email/{email}")
    public ResponseEntity<UserEntity> getUserByEmail(@PathVariable String email) {
        log.info("이메일로 사용자 조회 - email: {}", email);
        UserEntity user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    /** PATCH /api/users/{userId}/profile */
    @PatchMapping("/{userId}/profile")
    public ResponseEntity<UserEntity> updateProfile(
            @PathVariable Long userId,
            @RequestBody ProfileUpdateRequest request) {

        log.info("프로필 업데이트 요청 - userId: {}", userId);
        UserEntity user = userService.updateProfile(
                userId,
                request.getNickname(),
                request.getProfileImage()
        );
        return ResponseEntity.ok(user);
    }

    /** DELETE /api/users/{userId} */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        log.info("사용자 탈퇴 요청 - userId: {}", userId);
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/users/search?keyword=닉네임 */
    @GetMapping("/search")
    public ResponseEntity<List<UserEntity>> searchUsers(@RequestParam String keyword) {
        log.info("사용자 검색 - keyword: {}", keyword);
        List<UserEntity> users = userService.searchUsersByNickname(keyword);
        return ResponseEntity.ok(users);
    }

    /** GET /api/users/active */
    @GetMapping("/active")
    public ResponseEntity<List<UserEntity>> getActiveUsers() {
        log.info("활성 사용자 목록 조회");
        List<UserEntity> users = userService.getActiveUsers();
        return ResponseEntity.ok(users);
    }

    /** GET /api/users/recent */
    @GetMapping("/recent")
    public ResponseEntity<List<UserEntity>> getRecentUsers() {
        log.info("최근 가입자 조회");
        List<UserEntity> users = userService.getRecentUsers();
        return ResponseEntity.ok(users);
    }

    /** GET /api/users/check-email?email=... */
    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        log.info("이메일 중복 확인 - email: {}", email);
        boolean exists = userService.isEmailExists(email);
        return ResponseEntity.ok(exists);
    }

    /** 프로필 업데이트 요청 DTO */
    @lombok.Data
    public static class ProfileUpdateRequest {
        private String nickname;
        private String profileImage;
    }

    /* =========================
       🔧 내부 헬퍼 (구글/카카오만)
       ========================= */

    /** 구글/카카오 이메일 안전 추출 */
    private String safeGetEmail(OAuth2User u) {
        if (u == null) return null;
        Map<String, Object> a = u.getAttributes();

        // Google 기본: email
        Object ge = a.get("email");
        if (ge instanceof String s && !s.isBlank()) return s;

        // Kakao: kakao_account.email
        Object ka = a.get("kakao_account");
        if (ka instanceof Map<?, ?> m) {
            Object e = m.get("email");
            if (e instanceof String s && !s.isBlank()) return s;
        }
        return null;
    }

    /** providerId: "google:sub" / "kakao:id" 생성 */
    private String buildProviderId(OAuth2User u) {
        if (u == null) return null;
        Map<String, Object> a = u.getAttributes();

        // Google: sub
        Object sub = a.get("sub");
        if (sub instanceof String s && !s.isBlank()) return "google:" + s;

        // Kakao: id (Long/Integer)
        Object kid = a.get("id");
        if (kid != null) return "kakao:" + kid.toString();

        return null;
    }

    /** 현재 로그인 사용자 엔티티 결정 (이메일→없으면 providerId) */
    private UserEntity resolveMe(OAuth2User u) {
        String email = safeGetEmail(u);
        if (email != null && !email.isBlank()) {
            try {
                return userService.getUserByEmail(email);
            } catch (IllegalArgumentException ignore) {
                // 이메일로 미등록일 수 있음 → 아래 fallback
            }
        }
        String providerId = buildProviderId(u);
        if (providerId == null) return null;
        return userService.getOrCreateByProviderId(providerId);
    }
}
