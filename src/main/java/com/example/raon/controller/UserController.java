package com.example.raon.controller;

import com.example.raon.domain.User;
import com.example.raon.dto.user.response.UserResponseDto;
import com.example.raon.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
	 public ResponseEntity<User> me(@AuthenticationPrincipal Object principal) {
	     if (principal == null) return ResponseEntity.status(401).build();

	     // JWT 인증인 경우 (UserPrincipal)
	     if (principal instanceof com.example.raon.security.UserPrincipal) {
	         com.example.raon.security.UserPrincipal userPrincipal = (com.example.raon.security.UserPrincipal) principal;
	         Long userId = userPrincipal.getUserId();
	         log.info("JWT authenticated user - userId: {}", userId);
	         User user = userService.getUserById(userId);
	         return ResponseEntity.ok(user);
	     }

	     // OAuth2 인증인 경우
	     if (!(principal instanceof OAuth2User)) {
	         log.warn("Unknown principal type: {}", principal.getClass());
	         return ResponseEntity.status(401).build();
	     }

	     OAuth2User oauth2User = (OAuth2User) principal;
	     if (principal == null) return ResponseEntity.status(401).build();
	
	     // 1) 이메일로 우선 조회
	     String email = safeGetEmail(oauth2User);
	     if (email != null && !email.isBlank()) {
	         try {
	             User user = userService.getUserByEmail(email);
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
	
	     User user = userService.getOrCreateByProviderId(providerId);
	     return ResponseEntity.ok(user);
	 }
	
	 /** PATCH /api/users/me */
	 @PatchMapping("/me")
	 public ResponseEntity<User> updateMe(
	         @AuthenticationPrincipal Object principal,
	         @RequestBody ProfileUpdateRequest request
	 ) {
	     if (principal == null) return ResponseEntity.status(401).build();
	
	     User me = resolveMe(principal);
	     if (me == null) return ResponseEntity.status(400).build();
	
	     User updated = userService.updateProfile(
	             me.getUserId(), // ※ getUserId로 통일
	             request.getNickname(),
	             request.getProfileImage()
	     );
	     return ResponseEntity.ok(updated);
	 }
	
	 /** DELETE /api/users/me */
	 @DeleteMapping("/me")
	 public ResponseEntity<Void> deleteMe(@AuthenticationPrincipal Object principal) {
	     if (principal == null) return ResponseEntity.status(401).build();
	
	     User me = resolveMe(principal);
	     if (me == null) return ResponseEntity.status(400).build();
	
	     userService.deleteUser(me.getUserId()); // ※ getUserId로 통일
	     return ResponseEntity.noContent().build();
	 }
    
    /**
     * 사용자 정보 조회
     * GET /api/users/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> getUser(@PathVariable Long userId) {
        log.info("사용자 조회 요청 - userId: {}", userId);
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(new UserResponseDto(user));
    }
    
    /**
     * 이메일로 사용자 조회
     * GET /api/users/email/{email}
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponseDto> getUserByEmail(@PathVariable String email) {
        log.info("이메일로 사용자 조회 - email: {}", email);
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(new UserResponseDto(user));
    }
    
    /**
     * 프로필 업데이트
     * PATCH /api/users/{userId}/profile
     */
    @PatchMapping("/{userId}/profile")
    public ResponseEntity<UserResponseDto> updateProfile(
            @PathVariable Long userId,
            @RequestBody ProfileUpdateRequest request) {
        
        log.info("프로필 업데이트 요청 - userId: {}", userId);
        User user = userService.updateProfile(
            userId, 
            request.getNickname(), 
            request.getProfileImage()
        );
        return ResponseEntity.ok(new UserResponseDto(user));
    }
    
    /**
     * 사용자 탈퇴
     * DELETE /api/users/{userId}
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        log.info("사용자 탈퇴 요청 - userId: {}", userId);
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * 닉네임으로 사용자 검색
     * GET /api/users/search?keyword=닉네임
     */
    @GetMapping("/search")
    public ResponseEntity<List<UserResponseDto>> searchUsers(
            @RequestParam String keyword) {
        
        log.info("사용자 검색 - keyword: {}", keyword);
        List<User> users = userService.searchUsersByNickname(keyword);
        List<UserResponseDto> response = users.stream()
                .map(UserResponseDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    /**
     * 활성 사용자 목록 조회
     * GET /api/users/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<UserResponseDto>> getActiveUsers() {
        log.info("활성 사용자 목록 조회");
        List<User> users = userService.getActiveUsers();
        List<UserResponseDto> response = users.stream()
                .map(UserResponseDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    /**
     * 최근 가입자 조회 (7일 이내)
     * GET /api/users/recent
     */
    @GetMapping("/recent")
    public ResponseEntity<List<UserResponseDto>> getRecentUsers() {
        log.info("최근 가입자 조회");
        List<User> users = userService.getRecentUsers();
        List<UserResponseDto> response = users.stream()
                .map(UserResponseDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    /**
     * 이메일 중복 확인
     * GET /api/users/check-email?email=test@example.com
     */
    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        log.info("이메일 중복 확인 - email: {}", email);
        boolean exists = userService.isEmailExists(email);
        return ResponseEntity.ok(exists);
    }
    
    /**
     * 프로필 업데이트 요청 DTO
     */
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
	 private User resolveMe(Object principal) {
	     // JWT 인증인 경우
	     if (principal instanceof com.example.raon.security.UserPrincipal) {
	         com.example.raon.security.UserPrincipal userPrincipal = (com.example.raon.security.UserPrincipal) principal;
	         return userService.getUserById(userPrincipal.getUserId());
	     }

	     // OAuth2 인증인 경우
	     if (!(principal instanceof OAuth2User)) return null;
	     OAuth2User u = (OAuth2User) principal;
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