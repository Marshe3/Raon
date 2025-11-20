package com.example.raon.controller;

import com.example.raon.dto.CoverLetterRequest;
import com.example.raon.dto.CoverLetterResponse;
import com.example.raon.security.UserPrincipal;
import com.example.raon.service.CoverLetterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 자소서 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/cover-letters")
@RequiredArgsConstructor
public class CoverLetterController {

    private final CoverLetterService coverLetterService;

    /**
     * 현재 사용자의 모든 자소서 조회
     * GET /api/cover-letters
     */
    @GetMapping
    public ResponseEntity<List<CoverLetterResponse>> getAllCoverLetters(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = principal.getUserId();
        log.info("사용자 {} 의 자소서 목록 조회", userId);

        List<CoverLetterResponse> coverLetters = coverLetterService.getAllCoverLetters(userId);
        return ResponseEntity.ok(coverLetters);
    }

    /**
     * 특정 자소서 조회
     * GET /api/cover-letters/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<CoverLetterResponse> getCoverLetter(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = principal.getUserId();
        log.info("사용자 {} 의 자소서 {} 조회", userId, id);

        try {
            CoverLetterResponse coverLetter = coverLetterService.getCoverLetter(id, userId);
            return ResponseEntity.ok(coverLetter);
        } catch (RuntimeException e) {
            log.error("자소서 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(404).build();
        }
    }

    /**
     * 자소서 생성
     * POST /api/cover-letters
     */
    @PostMapping
    public ResponseEntity<CoverLetterResponse> createCoverLetter(
            @RequestBody CoverLetterRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = principal.getUserId();
        log.info("사용자 {} 의 자소서 생성: {}", userId, request.getTitle());

        try {
            CoverLetterResponse coverLetter = coverLetterService.createCoverLetter(userId, request);
            return ResponseEntity.ok(coverLetter);
        } catch (RuntimeException e) {
            log.error("자소서 생성 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 자소서 수정
     * PUT /api/cover-letters/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<CoverLetterResponse> updateCoverLetter(
            @PathVariable Long id,
            @RequestBody CoverLetterRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = principal.getUserId();
        log.info("사용자 {} 의 자소서 {} 수정", userId, id);

        try {
            CoverLetterResponse coverLetter = coverLetterService.updateCoverLetter(id, userId, request);
            return ResponseEntity.ok(coverLetter);
        } catch (RuntimeException e) {
            log.error("자소서 수정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 자소서 삭제
     * DELETE /api/cover-letters/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoverLetter(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = principal.getUserId();
        log.info("사용자 {} 의 자소서 {} 삭제", userId, id);

        try {
            coverLetterService.deleteCoverLetter(id, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("자소서 삭제 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 기본 자소서로 설정
     * PUT /api/cover-letters/{id}/default
     */
    @PutMapping("/{id}/default")
    public ResponseEntity<Void> setAsDefault(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = principal.getUserId();
        log.info("사용자 {} 의 자소서 {} 를 기본으로 설정", userId, id);

        try {
            coverLetterService.setAsDefault(id, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("기본 자소서 설정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
