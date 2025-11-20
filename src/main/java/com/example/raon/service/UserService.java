package com.example.raon.service;

import com.example.raon.domain.SocialType;
import com.example.raon.domain.User;
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
    public User createOrUpdateSocialUser(SocialType socialType, 
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
                User newUser = new User();
                newUser.setSocialType(socialType);
                newUser.setSocialId(socialId);
                newUser.setEmail(email);
                newUser.setNickname(nickname);
                newUser.setProfileImage(profileImage);
                newUser.setLastLogin(LocalDateTime.now());
                
                User savedUser = userRepository.save(newUser);
                log.info("신규 사용자 생성 - userId: {}, socialType: {}", savedUser.getUserId(), socialType);
                return savedUser;
            });
    }
    
    /**
     * ✅ 이메일 미동의 계정 대비: providerId("google:SUB" / "kakao:12345")로 조회/생성
     * 컨트롤러의 /api/users/me 에서 이메일이 없을 때 호출
     */
    @Transactional
    public User getOrCreateByProviderId(String providerId) {
        ProviderKey key = parseProviderId(providerId); // GOOGLE/KAKAO만 허용
        return userRepository.findBySocialTypeAndSocialId(key.socialType, key.socialId)
            .orElseGet(() -> {
                User u = new User();
                u.setSocialType(key.socialType);
                u.setSocialId(key.socialId);
                // 이메일/닉네임/프로필은 모를 수 있음
                u.setLastLogin(LocalDateTime.now());
                User saved = userRepository.save(u);
                log.info("providerId 신규 사용자 생성 - providerId: {}, userId: {}", providerId, saved.getUserId());
                return saved;
            });
    }

    /* ----------------- 내부 헬퍼 (구글·카카오만) ----------------- */

    private static class ProviderKey {
        final SocialType socialType;
        final String socialId;
        ProviderKey(SocialType t, String id) { this.socialType = t; this.socialId = id; }
    }

    /**
     * "google:sub" 또는 "kakao:12345" 형태만 허용.
     * 그 외는 IllegalArgumentException.
     */
    private ProviderKey parseProviderId(String providerId) {
        if (providerId == null || providerId.isBlank()) {
            throw new IllegalArgumentException("providerId가 비어 있습니다.");
        }
        String[] parts = providerId.split(":", 2);
        if (parts.length != 2 || parts[1].isBlank()) {
            throw new IllegalArgumentException("providerId 형식이 올바르지 않습니다. 예) google:SUB, kakao:12345");
        }
        String prefix = parts[0].toLowerCase();
        String id = parts[1];

        SocialType type;
        switch (prefix) {
            case "google" -> type = SocialType.GOOGLE;
            case "kakao"  -> type = SocialType.KAKAO;
            default       -> throw new IllegalArgumentException("지원하지 않는 provider: " + prefix + " (google/kakao만 허용)");
        }
        return new ProviderKey(type, id);
    }
    
    /**
     * 사용자 ID로 조회
     */
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. userId: " + userId));
    }
    
    /**
     * 이메일로 사용자 조회
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. email: " + email));
    }
    
    /**
     * 소셜 ID로 사용자 조회
     */
    public User getUserBySocialId(String socialId) {
        return userRepository.findBySocialId(socialId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. socialId: " + socialId));
    }
    
    /**
     * 프로필 정보 업데이트
     */
    @Transactional
    public User updateProfile(Long userId, String nickname, String profileImage) {
        User user = getUserById(userId);
        
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
        User user = getUserById(userId);
        user.setDeletedAt(LocalDateTime.now());
        log.info("사용자 탈퇴 - userId: {}", userId);
    }
    
    /**
     * 활성 사용자 목록 조회
     */
    public List<User> getActiveUsers() {
        return userRepository.findByDeletedAtIsNull();
    }
    
    /**
     * 닉네임으로 사용자 검색
     */
    public List<User> searchUsersByNickname(String keyword) {
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
    public List<User> getRecentUsers() {
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        return userRepository.findByJoinDateAfter(weekAgo);
    }
}