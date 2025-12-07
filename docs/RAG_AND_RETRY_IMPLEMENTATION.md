# RAG + Retry로 자소서 첨삭 성능 강화

## 🎯 해결한 문제

### 1. 503 Service Unavailable 에러
```
AI 첨삭 요청 중 오류가 발생했습니다:
{"error":"503 Service Unavailable on POST request...
The model is overloaded. Please try again later."}
```

**원인**: Gemini API 서버 과부하

**해결책**: Retry with Exponential Backoff

---

### 2. 모든 사용자에게 동일한 예시 제공
```
기존: 모든 사용자에게 "스마트 농장" 예시만 보여줌
문제: 프론트엔드 지원자에게 백엔드 예시는 도움이 안 됨
```

**해결책**: RAG (Retrieval-Augmented Generation)

---

## 🔧 구현 내용

### 1. RAG (Retrieval-Augmented Generation)

#### 개념
사용자의 **직무와 기술 스택에 맞는 우수 예시**를 검색하여 프롬프트에 동적으로 주입

#### CoverLetterExampleService
```java
@Service
public class CoverLetterExampleService {
    // 우수 자소서 예시 저장소
    private final List<CoverLetterExample> examples = new ArrayList<>();

    // 직무별 예시
    - 백엔드: "스마트 농장", "결제 시스템 성능 최적화"
    - 프론트엔드: "웹 접근성 개선"
    - AI: "부정 거래 탐지 시스템"
    - 풀스택: "실시간 협업 툴"

    // 검색 로직
    public List<CoverLetterExample> searchRelevant(
        String position,  // 희망 직무
        String skills,    // 기술 스택
        int limit         // 최대 결과 수
    )
}
```

#### 관련성 점수 계산
```java
점수 = 직무 매칭(50점) + 스킬 매칭(각 10점)

예시:
- 백엔드 + Spring, Redis
  → "결제 시스템" 예시: 50 + 10 + 10 = 70점
  → "웹 접근성" 예시: 0점 (프론트엔드)
```

#### 동작 예시

**사용자 1: 백엔드 개발자 (Spring, Redis)**
```
희망 직무: 백엔드
기술: Spring, Redis, MySQL

RAG 선택 결과:
1. "결제 시스템 성능 최적화" (70점)
   - Spring, Redis, JPA, MySQL 사용
2. "스마트 농장 관리 시스템" (50점)
   - 백엔드 관련
```

**사용자 2: 프론트엔드 개발자 (React)**
```
희망 직무: 프론트엔드
기술: React, JavaScript

RAG 선택 결과:
1. "웹 접근성 개선 프로젝트" (60점)
   - React, ARIA, 웹접근성
2. "실시간 협업 툴" (60점)
   - React, WebSocket
```

**사용자 3: AI 개발자 (Python, XGBoost)**
```
희망 직무: AI
기술: Python, XGBoost

RAG 선택 결과:
1. "부정 거래 탐지 시스템" (70점)
   - Python, XGBoost, 머신러닝
```

---

### 2. Retry with Exponential Backoff

#### 개념
API 호출 실패 시 점진적으로 긴 간격으로 재시도

```
시도 1: 즉시 호출
  ↓ 실패 (503)
1초 대기
  ↓
시도 2: 재호출
  ↓ 실패 (503)
2초 대기
  ↓
시도 3: 재호출
  ↓ 성공 ✅
```

#### 구현 코드
```java
// Retry with exponential backoff
ResponseEntity<Map> response = null;
int maxRetries = 3;
int retryDelay = 1000; // 1초

for (int attempt = 1; attempt <= maxRetries; attempt++) {
    try {
        log.info("Gemini API 호출 시도 {}/{}...", attempt, maxRetries);
        response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
        log.info("✅ Gemini API 응답 수신 성공");
        break; // 성공하면 루프 탈출
    } catch (Exception e) {
        String errorMsg = e.getMessage();
        boolean is503 = errorMsg != null && errorMsg.contains("503");

        if (is503 && attempt < maxRetries) {
            log.warn("⚠️ 503 Service Unavailable - {}초 후 재시도...",
                    retryDelay / 1000);
            Thread.sleep(retryDelay);
            retryDelay *= 2; // Exponential backoff: 1초 → 2초 → 4초
        } else {
            throw e; // 503이 아니거나 마지막 시도면 예외 던지기
        }
    }
}
```

#### 로그 예시
```
INFO  - Gemini API 호출 시도 1/3...
WARN  - ⚠️ 503 Service Unavailable - 1초 후 재시도... (1/3)
INFO  - Gemini API 호출 시도 2/3...
WARN  - ⚠️ 503 Service Unavailable - 2초 후 재시도... (2/3)
INFO  - Gemini API 호출 시도 3/3...
INFO  - ✅ Gemini API 응답 수신 성공
```

---

## 📊 효과

### Before (RAG 없음)
```
모든 사용자에게 동일한 예시:
"스마트 농장 관리 시스템"

프론트엔드 지원자: "이 예시가 내 직무랑 안 맞는데..."
AI 지원자: "백엔드 예시는 참고하기 어려워..."
```

### After (RAG 적용)
```
백엔드 지원자 → "결제 시스템 성능 최적화" ✅
프론트엔드 지원자 → "웹 접근성 개선" ✅
AI 지원자 → "부정 거래 탐지 시스템" ✅

각 직무에 맞는 예시로 품질 향상!
```

---

### Before (Retry 없음)
```
503 에러 발생 → 즉시 실패 ❌
사용자: "첨삭이 안 돼요..."
```

### After (Retry 적용)
```
503 에러 발생 → 1초 대기 → 2초 대기 → 성공 ✅
성공률: ~70% → ~95% (추정)
```

---

## 🔍 사용 흐름

### 전체 흐름
```
1. 사용자가 자소서 작성
   - 희망 직무: 백엔드
   - 기술: Spring, Redis

2. "AI 첨삭 받기" 클릭

3. 백엔드에서 RAG 실행
   - searchRelevant("백엔드", "Spring, Redis", 2)
   - 결과: ["결제 시스템", "스마트 농장"]

4. 동적 프롬프트 생성
   ```
   당신은 대기업 인사팀 10년 경력자입니다.

   [우수 자소서 예시 1 - 93점대]
   "결제 시스템 성능 최적화..."

   [우수 자소서 예시 2 - 95점대]
   "스마트 농장 관리 시스템..."

   [평가 대상 자기소개서]
   (사용자의 자소서)
   ```

5. Gemini API 호출 (Retry 적용)
   - 시도 1: 503 에러 → 1초 대기
   - 시도 2: 503 에러 → 2초 대기
   - 시도 3: 성공 ✅

6. AI 첨삭 결과 반환
   - 피드백
   - 수정된 자소서
```

---

## 📁 변경된 파일

### 신규 파일
```
src/main/java/com/example/raon/service/CoverLetterExampleService.java
- RAG용 우수 예시 저장소
- 직무/스킬 기반 검색 로직
```

### 수정된 파일
```
src/main/java/com/example/raon/controller/GeminiController.java
- CoverLetterExampleService 주입
- RAG로 동적 예시 선택
- Retry with exponential backoff 추가
- 로그 강화
```

---

## 🚀 성능 개선 요약

| 항목 | Before | After | 개선 |
|------|--------|-------|------|
| **예시 관련성** | 모든 사용자 동일 | 직무별 맞춤 | 품질 ↑ |
| **503 에러 대응** | 즉시 실패 | 자동 재시도 | 성공률 ↑ |
| **재시도 횟수** | 0회 | 최대 3회 | 안정성 ↑ |
| **대기 시간** | - | 1초 → 2초 → 4초 | 서버 부담 ↓ |
| **로그** | 기본 | 상세 (RAG, Retry) | 디버깅 ↑ |

---

## 📝 로그 예시

### RAG 선택 로그
```
INFO  - AI 첨삭 요청 - 자기소개서 길이: 523
INFO  - ✅ RAG: 2개의 관련 예시 선택됨
INFO  - Gemini API 호출 시도 1/3...
INFO  - ✅ Gemini API 응답 수신 성공
```

### 503 에러 + Retry 로그
```
INFO  - AI 첨삭 요청 - 자기소개서 길이: 523
INFO  - ✅ RAG: 2개의 관련 예시 선택됨
INFO  - Gemini API 호출 시도 1/3...
WARN  - ⚠️ 503 Service Unavailable - 1초 후 재시도... (1/3)
INFO  - Gemini API 호출 시도 2/3...
WARN  - ⚠️ 503 Service Unavailable - 2초 후 재시도... (2/3)
INFO  - Gemini API 호출 시도 3/3...
INFO  - ✅ Gemini API 응답 수신 성공
```

---

## ✅ 커밋 정보

- **커밋 해시**: `1553ac2`
- **커밋 메시지**: "feat: RAG + Retry로 자소서 첨삭 성능 강화"
- **변경 파일**: 2개
  - `CoverLetterExampleService.java` (신규)
  - `GeminiController.java` (수정)

---

## 🎓 학습 포인트

### RAG (Retrieval-Augmented Generation)
- 프롬프트에 관련 정보를 동적으로 주입
- 사용자 맞춤형 응답 생성
- 벡터 DB 없이 간단한 키워드 매칭으로 구현

### Exponential Backoff
- 일시적 장애 대응의 표준 패턴
- 서버 부담 최소화
- AWS, Google Cloud 등 대부분 클라우드 서비스 권장
