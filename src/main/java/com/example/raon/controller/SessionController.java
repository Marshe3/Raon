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

            // 프론트엔드에서 전달한 이전 세션 ID가 있으면 컨텍스트 생성
            Map<String, Object> extraDataCheck = request.getExtraData();
            String previousSessionId = extraDataCheck != null ? (String) extraDataCheck.get("previousSessionId") : null;

            if (previousSessionId != null && !previousSessionId.isEmpty()) {
                log.info("🔍 이전 세션 복원 요청: previousSessionId={}", previousSessionId);
                String previousContext = buildContextFromPreviousSession(previousSessionId, 10);

                if (previousContext != null) {
                    Map<String, Object> extraData = request.getExtraData();
                    if (extraData == null) {
                        extraData = new HashMap<>();
                        request.setExtraData(extraData);
                    }
                    extraData.put("previous_context", previousContext);
                    log.info("✅ 이전 세션 대화 컨텍스트 추가 완료");
                    log.info("📝 컨텍스트 내용 (처음 100자):\n{}",
                            previousContext.length() > 100 ? previousContext.substring(0, 100) + "..." : previousContext);
                } else {
                    log.warn("⚠️ 이전 세션의 메시지가 없어 컨텍스트를 생성하지 못했습니다");
                }
            } else {
                log.info("ℹ️ 이전 세션 없음 - 새로운 대화 시작");
            }

            SessionResponse response = sessionService.createSession(request);
            log.info("✅ 세션 생성 성공: {}", response.getSessionId());

            // 각 세션마다 독립적인 채팅방 생성
            ChatRoom chatRoom = chatRoomService.getOrCreateChatRoom(response.getSessionId());
            log.info("✅ 새 채팅방 생성: sessionId={}, chatRoomId={}", response.getSessionId(), chatRoom.getId());

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
     * 이전 세션의 대화 내역을 컨텍스트로 생성
     */
    private String buildContextFromPreviousSession(String previousSessionId, int maxMessages) {
        try {
            List<MessageDto> messages = chatRoomService.getMessages(previousSessionId);

            if (messages.isEmpty()) {
                return null;
            }

            // 최근 N개 메시지만 사용 (토큰 제한 고려)
            int startIndex = Math.max(0, messages.size() - maxMessages);
            List<MessageDto> recentMessages = messages.subList(startIndex, messages.size());

            StringBuilder context = new StringBuilder();
            context.append("=== 이전 대화 내역 ===\n\n");

            for (MessageDto msg : recentMessages) {
                String roleLabel = "user".equals(msg.getRole()) ? "사용자" : "AI";
                context.append(roleLabel)
                       .append(": ")
                       .append(msg.getContent())
                       .append("\n");
            }

            context.append("\n위 대화 내역을 참고하여 사용자와 자연스럽게 대화를 이어가세요.");

            log.info("이전 세션 컨텍스트 생성: sessionId={}, messageCount={}",
                    previousSessionId, recentMessages.size());

            return context.toString();
        } catch (Exception e) {
            log.warn("⚠️ 이전 세션 컨텍스트 생성 실패: {}", e.getMessage());
            return null;
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
