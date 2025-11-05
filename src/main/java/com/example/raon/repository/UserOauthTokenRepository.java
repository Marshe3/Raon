package com.example.raon.repository;

import com.example.raon.domain.UserOauthToken;
import com.example.raon.domain.SocialType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 사용자 OAuth 토큰 Repository
 */
@Repository
public interface UserOauthTokenRepository extends JpaRepository<UserOauthToken, Long> {  // Integer → Long
    
    /**
     * 사용자 ID로 모든 토큰 조회
     */
    List<UserOauthToken> findByUserId(Long userId);  // Integer → Long
    
    /**
     * 사용자 ID와 소셜 타입으로 토큰 조회
     */
    Optional<UserOauthToken> findByUserIdAndSocialType(Long userId, SocialType socialType);  // Integer → Long
    
    /**
     * 만료된 토큰 조회
     */
    List<UserOauthToken> findByTokenExpiresAtBefore(LocalDateTime dateTime);
    
    /**
     * 사용자 ID와 소셜 타입으로 토큰 존재 여부 확인
     */
    boolean existsByUserIdAndSocialType(Long userId, SocialType socialType);  // Integer → Long
    
    /**
     * 사용자 ID와 소셜 타입으로 토큰 삭제
     */
    void deleteByUserIdAndSocialType(Long userId, SocialType socialType);  // Integer → Long
}