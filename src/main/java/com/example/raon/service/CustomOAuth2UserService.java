package com.example.raon.service;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 어떤 OAuth2 제공자인지 확인 (kakao, google 등)
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        
        System.out.println("OAuth2 Provider: " + registrationId);

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
        
        // 카카오 사용자 정보 파싱
        Long id = (Long) attributes.get("id");
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
        
        String email = (String) kakaoAccount.get("email"); // 이메일 동의하지 않으면 null일 수 있음
        String nickname = (String) profile.get("nickname");
        String profileImage = (String) profile.get("profile_image_url");
        
        System.out.println("Kakao ID: " + id);
        System.out.println("Kakao Email: " + email);
        System.out.println("Kakao Nickname: " + nickname);
        System.out.println("Kakao Profile Image: " + profileImage);
        
        // 여기서 DB에 사용자 정보 저장 또는 조회
        // UserEntity user = userRepository.findByEmail(email)
        //     .orElseGet(() -> {
        //         UserEntity newUser = new UserEntity();
        //         newUser.setEmail(email);
        //         newUser.setNickname(nickname);
        //         newUser.setProfileImage(profileImage);
        //         newUser.setProvider("kakao");
        //         return userRepository.save(newUser);
        //     });
        
        return new DefaultOAuth2User(
            Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
            attributes,
            "id"
        );
    }

    private OAuth2User processGoogleUser(OAuth2User oAuth2User) {
        Map<String, Object> attributes = oAuth2User.getAttributes();
        
        // 구글 사용자 정보 파싱
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");
        String sub = (String) attributes.get("sub"); // Google ID
        
        System.out.println("Google ID: " + sub);
        System.out.println("Google Email: " + email);
        System.out.println("Google Name: " + name);
        System.out.println("Google Picture: " + picture);
        
        // 여기서 DB에 사용자 정보 저장 또는 조회
        // UserEntity user = userRepository.findByEmail(email)
        //     .orElseGet(() -> {
        //         UserEntity newUser = new UserEntity();
        //         newUser.setEmail(email);
        //         newUser.setNickname(name);
        //         newUser.setProfileImage(picture);
        //         newUser.setProvider("google");
        //         return userRepository.save(newUser);
        //     });
        
        return new DefaultOAuth2User(
            Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
            attributes,
            "sub"
        );
    }
}