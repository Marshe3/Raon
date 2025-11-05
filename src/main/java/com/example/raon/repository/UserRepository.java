package com.example.raon.repository;

import com.example.raon.domain.SocialType;
import com.example.raon.domain.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 사용자 Repository
 */
@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    
    /**
     * 이메일로 사용자 조회
     */
    Optional<UserEntity> findByEmail(String email);
    
    /**
     * 소셜 ID로 사용자 조회
     */
    Optional<UserEntity> findBySocialId(String socialId);
    
    /**
     * 소셜 타입과 소셜 ID로 사용자 조회
     */
    Optional<UserEntity> findBySocialTypeAndSocialId(SocialType socialType, String socialId);
    
    /**
     * 이메일 존재 여부 확인
     */
    boolean existsByEmail(String email);
    
    /**
     * 소셜 ID 존재 여부 확인
     */
    boolean existsBySocialId(String socialId);
    
    /**
     * 탈퇴하지 않은 사용자 조회 (활성 사용자)
     */
    List<UserEntity> findByDeletedAtIsNull();
    
    /**
     * 탈퇴한 사용자 조회
     */
    List<UserEntity> findByDeletedAtIsNotNull();
    
    /**
     * 특정 기간 이후 가입한 사용자 조회
     */
    List<UserEntity> findByJoinDateAfter(LocalDateTime date);
    
    /**
     * 닉네임으로 사용자 검색 (부분 일치)
     */
    List<UserEntity> findByNicknameContaining(String nickname);
}