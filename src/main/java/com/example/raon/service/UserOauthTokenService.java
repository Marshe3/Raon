package com.example.raon.service;

import com.example.raon.domain.SocialType;
import com.example.raon.domain.UserOauthToken;
import com.example.raon.repository.UserOauthTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 사용자 OAuth 토큰 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserOauthTokenService {
    
    private final UserOauthTokenRepository tokenRepository;
    
    /**
     * 토큰 저장 또는 업데이트
     * - 기존 토큰이 있으면 업데이트
     * - 없으면 새로 생성
     */
    @Transactional
    public UserOauthToken saveOrUpdateToken(Long userId,  // Integer → Long
                                            SocialType socialType, 
                                            String encryptedRefreshToken, 
                                            LocalDateTime expiresAt) {
        
        return tokenRepository.findByUserIdAndSocialType(userId, socialType)
            .map(token -> {
                // 기존 토큰 업데이트
                token.updateRefreshToken(encryptedRefreshToken, expiresAt);
                token.incrementTokenVersion();
                log.info("토큰 업데이트 - userId: {}, socialType: {}", userId, socialType);
                return token;
            })
            .orElseGet(() -> {
                // 새 토큰 생성
                UserOauthToken newToken = UserOauthToken.builder()
                    .userId(userId)  // 이제 Long 타입
                    .socialType(socialType)
                    .encryptedRefreshToken(encryptedRefreshToken)
                    .tokenExpiresAt(expiresAt)
                    .build();
                
                log.info("새 토큰 생성 - userId: {}, socialType: {}", userId, socialType);
                return tokenRepository.save(newToken);
            });
    }
    
    /**
     * 토큰 조회
     */
    public UserOauthToken getToken(Long userId, SocialType socialType) {  // Integer → Long
        return tokenRepository.findByUserIdAndSocialType(userId, socialType)
            .orElseThrow(() -> new IllegalArgumentException(
                "토큰을 찾을 수 없습니다. userId: " + userId + ", socialType: " + socialType));
    }
    
    /**
     * 사용자의 모든 토큰 조회
     */
    public List<UserOauthToken> getAllTokensByUserId(Long userId) {  // Integer → Long
        return tokenRepository.findByUserId(userId);
    }
    
    /**
     * 토큰 삭제
     */
    @Transactional
    public void deleteToken(Long userId, SocialType socialType) {  // Integer → Long
        tokenRepository.deleteByUserIdAndSocialType(userId, socialType);
        log.info("토큰 삭제 - userId: {}, socialType: {}", userId, socialType);
    }
    
    /**
     * 만료된 토큰 삭제 (배치 작업용)
     */
    @Transactional
    public void deleteExpiredTokens() {
        List<UserOauthToken> expiredTokens = 
            tokenRepository.findByTokenExpiresAtBefore(LocalDateTime.now());
        
        tokenRepository.deleteAll(expiredTokens);
        log.info("만료된 토큰 {}개 삭제", expiredTokens.size());
    }
    
    /**
     * 토큰 존재 여부 확인
     */
    public boolean hasToken(Long userId, SocialType socialType) {  // Integer → Long
        return tokenRepository.existsByUserIdAndSocialType(userId, socialType);
    }
}