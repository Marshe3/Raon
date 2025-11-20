// src/main/java/com/example/raon/controller/SessionController.java
package com.example.raon.controller;

import com.example.raon.domain.ChatRoom;
import com.example.raon.dto.MessageDto;
import com.example.raon.dto.MessageSaveRequest;
import com.example.raon.dto.SessionCreateRequest;
import com.example.raon.dto.SessionResponse;
import com.example.raon.dto.ResumeResponse;
import com.example.raon.security.UserPrincipal;
import com.example.raon.service.ChatRoomService;
import com.example.raon.service.PersoAISessionService;
import com.example.raon.service.ResumeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final PersoAISessionService sessionService;
    private final ChatRoomService chatRoomService;
    private final ResumeService resumeService;

    @PostMapping(
        value = "/create",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> createSession(
            @RequestBody SessionCreateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        try {
            log.info("🚀 세션 생성 요청: {}", request);

            // 사용자의 기본 이력서 조회 및 컨텍스트 추가
            if (principal != null) {
                Long userId = principal.getUserId();
                try {
                    // 기본 이력서가 있으면 가져오기
                    List<ResumeResponse> resumes = resumeService.getAllResumes(userId);
                    Optional<ResumeResponse> defaultResume = resumes.stream()
                            .filter(ResumeResponse::getIsDefault)
                            .findFirst();

                    if (defaultResume.isPresent()) {
                        String resumeContext = buildResumeContext(defaultResume.get());

                        Map<String, Object> extraData = request.getExtraData();
                        if (extraData == null) {
                            extraData = new HashMap<>();
                            request.setExtraData(extraData);
                        }
                        extraData.put("resume_context", resumeContext);
                        log.info("📄 이력서 컨텍스트 추가: userId={}", userId);
                    } else {
                        log.info("ℹ️ 사용자 {}의 기본 이력서가 없습니다", userId);
                    }
                } catch (Exception e) {
                    log.warn("⚠️ 이력서 조회 중 오류 (무시하고 계속): {}", e.getMessage());
                }
            }

            // 이전 채팅방 ID가 있으면 컨텍스트 생성
            if (request.getPreviousChatRoomId() != null) {
                String previousContext = chatRoomService.buildContextFromPreviousChatRoom(
                        request.getPreviousChatRoomId(), 10); // 최근 10개 메시지

                if (previousContext != null) {
                    // extraData에 컨텍스트 추가
                    Map<String, Object> extraData = request.getExtraData();
                    if (extraData == null) {
                        extraData = new HashMap<>();
                        request.setExtraData(extraData);
                    }
                    extraData.put("previous_context", previousContext);
                    log.info("📝 이전 대화 컨텍스트 추가: chatRoomId={}", request.getPreviousChatRoomId());
                }
            }

            SessionResponse response = sessionService.createSession(request);
            log.info("✅ 세션 생성 성공: {}", response.getSessionId());

            // 채팅방 생성 또는 재사용
            ChatRoom chatRoom;
            if (request.getPreviousChatRoomId() != null) {
                // 자동 재연결: 기존 채팅방 재사용
                chatRoom = chatRoomService.getChatRoomById(request.getPreviousChatRoomId());
                chatRoom.updateSessionId(response.getSessionId());
                chatRoomService.saveChatRoom(chatRoom);
                log.info("✅ 기존 채팅방 재사용: chatRoomId={}, newSessionId={}",
                        chatRoom.getId(), response.getSessionId());
            } else {
                // 최초 세션 생성: 새 채팅방 생성
                chatRoom = chatRoomService.getOrCreateChatRoom(response.getSessionId());
                log.info("✅ 새 채팅방 생성: chatRoomId={}", chatRoom.getId());
            }

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("sessionId", response.getSessionId());
            responseData.put("chatRoomId", chatRoom.getId());

            if (response.getSdp() != null) {
                responseData.put("sdp", response.getSdp());
            }
            if (response.getIceServers() != null) {
                responseData.put("iceServers", response.getIceServers());
            }

            return ResponseEntity.ok(responseData);
        } catch (Exception e) {
            log.error("❌ 세션 생성 실패: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "세션 생성 실패");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<?> getSession(@PathVariable String sessionId) {
        try {
            log.info("🔍 세션 조회 요청: {}", sessionId);
            SessionResponse response = sessionService.getSession(sessionId);
            log.info("✅ 세션 조회 성공: {}", sessionId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ 세션 조회 실패: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "세션 조회 실패");
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        }
    }

    @PostMapping("/{sessionId}/messages")
    public ResponseEntity<?> saveMessage(
            @PathVariable String sessionId,
            @RequestBody MessageSaveRequest request) {
        try {
            log.info("💬 메시지 저장 요청: sessionId={}, role={}", sessionId, request.getRole());
            MessageDto message = chatRoomService.saveMessage(sessionId, request);
            log.info("✅ 메시지 저장 성공: messageId={}", message.getMessageId());
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            log.error("❌ 메시지 저장 실패: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "메시지 저장 실패");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/{sessionId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable String sessionId) {
        try {
            log.info("📜 메시지 조회 요청: sessionId={}", sessionId);
            List<MessageDto> messages = chatRoomService.getMessages(sessionId);
            log.info("✅ 메시지 조회 성공: sessionId={}, count={}", sessionId, messages.size());
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            log.error("❌ 메시지 조회 실패: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "메시지 조회 실패");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @DeleteMapping("/{sessionId}/messages")
    public ResponseEntity<?> clearMessages(@PathVariable String sessionId) {
        try {
            log.info("🗑️ 메시지 삭제 요청: sessionId={}", sessionId);
            chatRoomService.clearMessages(sessionId);
            log.info("✅ 메시지 삭제 성공: sessionId={}", sessionId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ 메시지 삭제 실패: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "메시지 삭제 실패");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @DeleteMapping("/cleanup")
    public ResponseEntity<?> cleanupAllSessions() {
        try {
            log.info("🧹 모든 활성 세션 정리 요청");
            int deletedCount = sessionService.cleanupAllSessions();
            log.info("✅ 세션 정리 완료: {} 개 삭제", deletedCount);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("deletedCount", deletedCount);
            response.put("message", deletedCount + "개의 세션이 정리되었습니다");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ 세션 정리 실패: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "세션 정리 실패");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 이력서 정보를 AI가 이해할 수 있는 컨텍스트 문자열로 변환
     */
    private String buildResumeContext(ResumeResponse resume) {
        StringBuilder context = new StringBuilder();

        context.append("=== 지원자 이력서 정보 ===\n\n");

        // 기본 정보
        context.append("📋 기본 정보\n");
        context.append("- 이름: ").append(resume.getName()).append("\n");
        if (resume.getEmail() != null) {
            context.append("- 이메일: ").append(resume.getEmail()).append("\n");
        }
        if (resume.getPhone() != null) {
            context.append("- 연락처: ").append(resume.getPhone()).append("\n");
        }
        if (resume.getDesiredPosition() != null) {
            context.append("- 희망직무: ").append(resume.getDesiredPosition()).append("\n");
        }
        context.append("\n");

        // 학력
        if (resume.getEducations() != null && !resume.getEducations().isEmpty()) {
            context.append("🎓 학력\n");
            for (var edu : resume.getEducations()) {
                context.append("- ").append(edu.getSchoolName());
                if (edu.getMajor() != null && !edu.getMajor().isEmpty()) {
                    context.append(" (").append(edu.getMajor()).append(")");
                }
                if (edu.getAttendancePeriod() != null) {
                    context.append(" [").append(edu.getAttendancePeriod()).append("]");
                }
                if (edu.getStatus() != null) {
                    context.append(" - ").append(edu.getStatus());
                }
                if (edu.getGpa() != null) {
                    context.append(" (학점: ").append(edu.getGpa()).append(")");
                }
                context.append("\n");
            }
            context.append("\n");
        }

        // 경력
        if (resume.getCareers() != null && !resume.getCareers().isEmpty()) {
            context.append("💼 경력\n");
            for (var career : resume.getCareers()) {
                context.append("- ").append(career.getCompanyName());
                if (career.getPosition() != null) {
                    context.append(" / ").append(career.getPosition());
                }
                if (career.getEmploymentPeriod() != null) {
                    context.append(" [").append(career.getEmploymentPeriod()).append("]");
                }
                if (Boolean.TRUE.equals(career.getIsCurrent())) {
                    context.append(" (현재 재직중)");
                }
                context.append("\n");
                if (career.getResponsibilities() != null && !career.getResponsibilities().isEmpty()) {
                    context.append("  담당업무: ").append(career.getResponsibilities()).append("\n");
                }
                if (career.getAchievements() != null && !career.getAchievements().isEmpty()) {
                    context.append("  주요성과: ").append(career.getAchievements()).append("\n");
                }
            }
            context.append("\n");
        }

        // 기술 및 역량
        if (resume.getSkills() != null && !resume.getSkills().isEmpty()) {
            context.append("🛠️ 기술 및 역량\n");
            context.append(resume.getSkills()).append("\n\n");
        }

        context.append("=== 이력서 정보 끝 ===\n");

        return context.toString();
    }
}
