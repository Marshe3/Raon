package com.example.raon.service;

import com.example.raon.domain.SocialType;
import com.example.raon.domain.UserEntity;
import com.example.raon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 사용자 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    
    private final UserRepository userRepository;
    
    /**
     * 소셜 로그인으로 사용자 생성 또는 조회
     * - 이미 존재하면 마지막 로그인 시간 업데이트
     * - 없으면 새로 생성
     */
    @Transactional
    public UserEntity createOrUpdateSocialUser(SocialType socialType, 
                                               String socialId,
                                               String email,
                                               String nickname,
                                               String profileImage) {
        
        return userRepository.findBySocialTypeAndSocialId(socialType, socialId)
            .map(user -> {
                // 기존 사용자 - 마지막 로그인 시간 업데이트
                user.setLastLogin(LocalDateTime.now());
                log.info("기존 사용자 로그인 - userId: {}, socialType: {}", user.getUserId(), socialType);
                return user;
            })
            .orElseGet(() -> {
                // 새 사용자 생성
                UserEntity newUser = new UserEntity();
                newUser.setSocialType(socialType);
                newUser.setSocialId(socialId);
                newUser.setEmail(email);
                newUser.setNickname(nickname);
                newUser.setProfileImage(profileImage);
                newUser.setLastLogin(LocalDateTime.now());
                
                UserEntity savedUser = userRepository.save(newUser);
                log.info("신규 사용자 생성 - userId: {}, socialType: {}", savedUser.getUserId(), socialType);
                return savedUser;
            });
    }
    
    /**
     * 사용자 ID로 조회
     */
    public UserEntity getUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. userId: " + userId));
    }
    
    /**
     * 이메일로 사용자 조회
     */
    public UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. email: " + email));
    }
    
    /**
     * 소셜 ID로 사용자 조회
     */
    public UserEntity getUserBySocialId(String socialId) {
        return userRepository.findBySocialId(socialId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. socialId: " + socialId));
    }
    
    /**
     * 프로필 정보 업데이트
     */
    @Transactional
    public UserEntity updateProfile(Long userId, String nickname, String profileImage) {
        UserEntity user = getUserById(userId);
        
        if (nickname != null) {
            user.setNickname(nickname);
        }
        if (profileImage != null) {
            user.setProfileImage(profileImage);
        }
        
        log.info("프로필 업데이트 - userId: {}", userId);
        return user;
    }
    
    /**
     * 사용자 탈퇴 (소프트 삭제)
     */
    @Transactional
    public void deleteUser(Long userId) {
        UserEntity user = getUserById(userId);
        user.setDeletedAt(LocalDateTime.now());
        log.info("사용자 탈퇴 - userId: {}", userId);
    }
    
    /**
     * 활성 사용자 목록 조회
     */
    public List<UserEntity> getActiveUsers() {
        return userRepository.findByDeletedAtIsNull();
    }
    
    /**
     * 닉네임으로 사용자 검색
     */
    public List<UserEntity> searchUsersByNickname(String keyword) {
        return userRepository.findByNicknameContaining(keyword);
    }
    
    /**
     * 이메일 중복 확인
     */
    public boolean isEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }
    
    /**
     * 최근 가입자 조회 (7일 이내)
     */
    public List<UserEntity> getRecentUsers() {
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        return userRepository.findByJoinDateAfter(weekAgo);
    }
}