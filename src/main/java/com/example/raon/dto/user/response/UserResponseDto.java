package com.example.raon.dto.user.response;

import com.example.raon.domain.SocialType;
import com.example.raon.domain.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponseDto {

    private Long userId;
    private String email;
    private String nickname;
    private String profileImage;
    private SocialType socialType;
    private LocalDateTime joinDate;

    public UserResponseDto(User user) {
        this.userId = user.getUserId();
        this.email = user.getEmail();
        this.nickname = user.getNickname();
        this.profileImage = user.getProfileImage();
        this.socialType = user.getSocialType();
        this.joinDate = user.getJoinDate();
    }
}