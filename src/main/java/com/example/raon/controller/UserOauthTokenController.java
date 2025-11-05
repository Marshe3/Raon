package com.example.raon.controller;

import com.example.raon.domain.SocialType;
import com.example.raon.domain.UserOauthToken;
import com.example.raon.service.UserOauthTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * OAuth 토큰 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/oauth/tokens")
@RequiredArgsConstructor
public class UserOauthTokenController {
    
    private final UserOauthTokenService tokenService;
    
    /**
     * 사용자의 모든 토큰 조회
     * GET /api/oauth/tokens/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserOauthToken>> getUserTokens(@PathVariable Long userId) {
        log.info("사용자 토큰 조회 - userId: {}", userId);
        List<UserOauthToken> tokens = tokenService.getAllTokensByUserId(userId);
        return ResponseEntity.ok(tokens);
    }
    
    /**
     * 특정 소셜 타입의 토큰 조회
     * GET /api/oauth/tokens/user/{userId}/social/{socialType}
     */
    @GetMapping("/user/{userId}/social/{socialType}")
    public ResponseEntity<UserOauthToken> getToken(
            @PathVariable Long userId,
            @PathVariable SocialType socialType) {
        
        log.info("토큰 조회 - userId: {}, socialType: {}", userId, socialType);
        UserOauthToken token = tokenService.getToken(userId, socialType);
        return ResponseEntity.ok(token);
    }
    
    /**
     * 토큰 삭제
     * DELETE /api/oauth/tokens/user/{userId}/social/{socialType}
     */
    @DeleteMapping("/user/{userId}/social/{socialType}")
    public ResponseEntity<Void> deleteToken(
            @PathVariable Long userId,
            @PathVariable SocialType socialType) {
        
        log.info("토큰 삭제 - userId: {}, socialType: {}", userId, socialType);
        tokenService.deleteToken(userId, socialType);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * 토큰 존재 여부 확인
     * GET /api/oauth/tokens/check?userId=1&socialType=KAKAO
     */
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkTokenExists(
            @RequestParam Long userId,
            @RequestParam SocialType socialType) {
        
        log.info("토큰 존재 확인 - userId: {}, socialType: {}", userId, socialType);
        boolean exists = tokenService.hasToken(userId, socialType);
        return ResponseEntity.ok(exists);
    }
}