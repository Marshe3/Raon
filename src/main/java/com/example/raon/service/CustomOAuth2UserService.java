package com.example.raon.service;

import com.example.raon.domain.SocialType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserService userService;


    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 어떤 OAuth2 제공자인지 확인 (kakao, google 등)
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        
        log.info("OAuth2 Provider: {}", registrationId);

        // 제공자에 따라 다르게 처리
        if ("kakao".equals(registrationId)) {
            return processKakaoUser(oAuth2User);
        } else if ("google".equals(registrationId)) {
            return processGoogleUser(oAuth2User);
        }

        return oAuth2User;
    }

    private OAuth2User processKakaoUser(OAuth2User oAuth2User) {
        Map<String, Object> attributes = oAuth2User.getAttributes();
        log.info("Kakao User Attributes: {}", attributes);

        try {
            // 카카오 사용자 정보 파싱
            Long id = (Long) attributes.get("id");
            if (id == null) {
                log.error("Kakao ID is null");
                throw new OAuth2AuthenticationException("Kakao ID is required");
            }

            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
            if (kakaoAccount == null) {
                log.error("Kakao account is null. User may not have agreed to share account information.");
                throw new OAuth2AuthenticationException("Kakao account information is required");
            }

            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
            if (profile == null) {
                log.error("Kakao profile is null. User may not have agreed to share profile information.");
                throw new OAuth2AuthenticationException("Kakao profile information is required");
            }

            String email = (String) kakaoAccount.get("email"); // 이메일 동의하지 않으면 null일 수 있음
            String nickname = (String) profile.get("nickname");
            String profileImage = (String) profile.get("profile_image_url");

            log.info("Kakao User - ID: {}, Email: {}, Nickname: {}", id, email, nickname);

            // DB에 사용자 정보 저장 또는 업데이트
            userService.createOrUpdateSocialUser(SocialType.KAKAO, String.valueOf(id), email, nickname, profileImage);

            return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "id"
            );
        } catch (Exception e) {
            log.error("Error processing Kakao user: {}", e.getMessage(), e);
            throw new OAuth2AuthenticationException("Failed to process Kakao user information: " + e.getMessage());
        }
    }

    private OAuth2User processGoogleUser(OAuth2User oAuth2User) {
        Map<String, Object> attributes = oAuth2User.getAttributes();
        
        // 구글 사용자 정보 파싱
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");
        String sub = (String) attributes.get("sub"); // Google ID
        
        log.info("Google ID: {}", sub);
        log.info("Google Email: {}", email);
        log.info("Google Name: {}", name);
        log.info("Google Picture: {}", picture);
        
        // DB에 사용자 정보 저장 또는 업데이트
        userService.createOrUpdateSocialUser(SocialType.GOOGLE, sub, email, name, picture);
        
        return new DefaultOAuth2User(
            Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
            attributes,
            "sub"
        );
    }
}