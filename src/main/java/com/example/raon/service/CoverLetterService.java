package com.example.raon.service;

import com.example.raon.domain.CoverLetter;
import com.example.raon.domain.User;
import com.example.raon.dto.CoverLetterRequest;
import com.example.raon.dto.CoverLetterResponse;
import com.example.raon.repository.CoverLetterRepository;
import com.example.raon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CoverLetterService {

    private final CoverLetterRepository coverLetterRepository;
    private final UserRepository userRepository;

    private static final int MAX_COVER_LETTER_COUNT = 5;

    /**
     * 사용자의 모든 자소서 조회
     */
    public List<CoverLetterResponse> getAllCoverLetters(Long userId) {
        return coverLetterRepository.findByUser_UserIdOrderByCreatedAtDesc(userId).stream()
                .map(CoverLetterResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 특정 자소서 조회
     */
    public CoverLetterResponse getCoverLetter(Long coverLetterId, Long userId) {
        CoverLetter coverLetter = coverLetterRepository.findById(coverLetterId)
                .orElseThrow(() -> new RuntimeException("자소서를 찾을 수 없습니다."));

        if (!coverLetter.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("권한이 없습니다.");
        }

        return CoverLetterResponse.from(coverLetter);
    }

    /**
     * 자소서 생성
     */
    @Transactional
    public CoverLetterResponse createCoverLetter(Long userId, CoverLetterRequest request) {
        // 최대 개수 체크
        long count = coverLetterRepository.countByUser_UserId(userId);
        if (count >= MAX_COVER_LETTER_COUNT) {
            throw new RuntimeException("자소서는 최대 " + MAX_COVER_LETTER_COUNT + "개까지만 생성할 수 있습니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 기본 자소서로 설정하는 경우 기존 기본 자소서 해제
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            unsetAllDefaultCoverLetters(userId);
        }

        // 자소서 생성
        CoverLetter coverLetter = CoverLetter.builder()
                .user(user)
                .title(request.getTitle())
                .content(request.getContent())
                .companyName(request.getCompanyName())
                .position(request.getPosition())
                .isDefault(request.getIsDefault())
                .build();

        coverLetter = coverLetterRepository.save(coverLetter);

        return CoverLetterResponse.from(coverLetter);
    }

    /**
     * 자소서 수정
     */
    @Transactional
    public CoverLetterResponse updateCoverLetter(Long coverLetterId, Long userId, CoverLetterRequest request) {
        CoverLetter coverLetter = coverLetterRepository.findById(coverLetterId)
                .orElseThrow(() -> new RuntimeException("자소서를 찾을 수 없습니다."));

        if (!coverLetter.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("권한이 없습니다.");
        }

        // 기본 자소서로 설정하는 경우 기존 기본 자소서 해제
        if (Boolean.TRUE.equals(request.getIsDefault()) && !coverLetter.getIsDefault()) {
            unsetAllDefaultCoverLetters(userId);
            coverLetter.setAsDefault();
        } else if (Boolean.FALSE.equals(request.getIsDefault()) && coverLetter.getIsDefault()) {
            coverLetter.unsetAsDefault();
        }

        // 자소서 정보 업데이트
        coverLetter.update(
                request.getTitle(),
                request.getContent(),
                request.getCompanyName(),
                request.getPosition()
        );

        return CoverLetterResponse.from(coverLetter);
    }

    /**
     * 자소서 삭제
     */
    @Transactional
    public void deleteCoverLetter(Long coverLetterId, Long userId) {
        CoverLetter coverLetter = coverLetterRepository.findById(coverLetterId)
                .orElseThrow(() -> new RuntimeException("자소서를 찾을 수 없습니다."));

        if (!coverLetter.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("권한이 없습니다.");
        }

        coverLetterRepository.delete(coverLetter);
    }

    /**
     * 기본 자소서로 설정
     */
    @Transactional
    public void setAsDefault(Long coverLetterId, Long userId) {
        CoverLetter coverLetter = coverLetterRepository.findById(coverLetterId)
                .orElseThrow(() -> new RuntimeException("자소서를 찾을 수 없습니다."));

        if (!coverLetter.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("권한이 없습니다.");
        }

        // 기존 기본 자소서 해제
        unsetAllDefaultCoverLetters(userId);

        // 새로운 기본 자소서 설정
        coverLetter.setAsDefault();
    }

    /**
     * 사용자의 모든 기본 자소서 해제
     */
    private void unsetAllDefaultCoverLetters(Long userId) {
        List<CoverLetter> coverLetters = coverLetterRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
        coverLetters.stream()
                .filter(CoverLetter::getIsDefault)
                .forEach(CoverLetter::unsetAsDefault);
    }
}
