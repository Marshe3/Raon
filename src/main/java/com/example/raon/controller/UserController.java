package com.example.raon.controller;

import com.example.raon.domain.UserEntity;
import com.example.raon.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 사용자 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    /**
     * 사용자 정보 조회
     * GET /api/users/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserEntity> getUser(@PathVariable Long userId) {
        log.info("사용자 조회 요청 - userId: {}", userId);
        UserEntity user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }
    
    /**
     * 이메일로 사용자 조회
     * GET /api/users/email/{email}
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<UserEntity> getUserByEmail(@PathVariable String email) {
        log.info("이메일로 사용자 조회 - email: {}", email);
        UserEntity user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }
    
    /**
     * 프로필 업데이트
     * PATCH /api/users/{userId}/profile
     */
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
    public ResponseEntity<List<UserEntity>> searchUsers(
            @RequestParam String keyword) {
        
        log.info("사용자 검색 - keyword: {}", keyword);
        List<UserEntity> users = userService.searchUsersByNickname(keyword);
        return ResponseEntity.ok(users);
    }
    
    /**
     * 활성 사용자 목록 조회
     * GET /api/users/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<UserEntity>> getActiveUsers() {
        log.info("활성 사용자 목록 조회");
        List<UserEntity> users = userService.getActiveUsers();
        return ResponseEntity.ok(users);
    }
    
    /**
     * 최근 가입자 조회 (7일 이내)
     * GET /api/users/recent
     */
    @GetMapping("/recent")
    public ResponseEntity<List<UserEntity>> getRecentUsers() {
        log.info("최근 가입자 조회");
        List<UserEntity> users = userService.getRecentUsers();
        return ResponseEntity.ok(users);
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
}