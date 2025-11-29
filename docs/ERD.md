# Raon 프로젝트 ERD (Entity Relationship Diagram)

## 전체 ERD

```mermaid
erDiagram
    User ||--|| RefreshToken : "has"
    User ||--o{ Resume : "creates"
    Resume ||--o{ Education : "contains"
    Resume ||--o{ Career : "contains"
    User ||--o{ CoverLetter : "writes"
    User ||--o{ InterviewFeedback : "receives"
    ChatRoom ||--o{ Message : "contains"
    ChatRoom ||--o| InterviewFeedback : "generates"

    User {
        BIGINT user_id PK "AUTO_INCREMENT"
        VARCHAR(100) email UK "UNIQUE"
        VARCHAR(20) social_type "NOT NULL, KAKAO/GOOGLE"
        VARCHAR(255) social_id UK "UNIQUE, NOT NULL"
        VARCHAR(50) nickname
        VARCHAR(500) profile_image
        DATETIME join_date "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
        DATETIME last_login "NOT NULL"
        DATETIME deleted_at "소프트 삭제"
        DATETIME created_at "NOT NULL"
        DATETIME updated_at "NOT NULL"
    }

    RefreshToken {
        BIGINT id PK "AUTO_INCREMENT"
        BIGINT user_id FK,UK "UNIQUE, NOT NULL"
        VARCHAR(500) token "AES 암호화, NOT NULL"
        DATETIME expires_at "NOT NULL"
        DATETIME created_at "NOT NULL"
    }

    Resume {
        BIGINT resume_id PK "AUTO_INCREMENT"
        BIGINT user_id FK "NOT NULL"
        VARCHAR(100) title "NOT NULL"
        VARCHAR(50) name "NOT NULL"
        VARCHAR(20) phone
        VARCHAR(100) email
        VARCHAR(100) desired_position
        TEXT skills
        BOOLEAN is_default "NOT NULL, DEFAULT FALSE"
        DATETIME created_at "NOT NULL"
        DATETIME updated_at "NOT NULL"
    }

    Education {
        BIGINT education_id PK "AUTO_INCREMENT"
        BIGINT resume_id FK "NOT NULL, ON DELETE CASCADE"
        VARCHAR(50) education_type "NOT NULL"
        VARCHAR(100) school_name "NOT NULL"
        VARCHAR(100) major
        VARCHAR(50) attendance_period
        VARCHAR(20) status "졸업/재학중/중퇴/수료"
        VARCHAR(20) gpa
        INT order_index "NOT NULL, DEFAULT 0"
        DATETIME created_at "NOT NULL"
        DATETIME updated_at "NOT NULL"
    }

    Career {
        BIGINT career_id PK "AUTO_INCREMENT"
        BIGINT resume_id FK "NOT NULL, ON DELETE CASCADE"
        VARCHAR(100) company_name "NOT NULL"
        VARCHAR(100) position "NOT NULL"
        VARCHAR(50) employment_period
        BOOLEAN is_current "NOT NULL, DEFAULT FALSE"
        TEXT responsibilities
        TEXT achievements
        INT order_index "NOT NULL, DEFAULT 0"
        DATETIME created_at "NOT NULL"
        DATETIME updated_at "NOT NULL"
    }

    CoverLetter {
        BIGINT cover_letter_id PK "AUTO_INCREMENT"
        BIGINT user_id FK "NOT NULL"
        VARCHAR(100) title "NOT NULL"
        TEXT content "NOT NULL"
        VARCHAR(100) company_name
        VARCHAR(100) position
        BOOLEAN is_default "NOT NULL, DEFAULT FALSE"
        DATETIME created_at "NOT NULL"
        DATETIME updated_at "NOT NULL"
    }

    Chatbot {
        BIGINT chatbot_id PK "AUTO_INCREMENT"
        VARCHAR(100) chatbot_name "NOT NULL"
        TEXT description
        VARCHAR(50) model_style
        VARCHAR(50) tts_type
        VARCHAR(50) llm_type
        VARCHAR(50) stt_type
        VARCHAR(100) prompt_id "PersoAI plp-*"
        VARCHAR(100) document_id "PersoAI pld-*"
        BOOLEAN is_active "NOT NULL, DEFAULT TRUE"
        BOOLEAN is_public "NOT NULL, DEFAULT TRUE"
        DATETIME created_at "NOT NULL"
        DATETIME updated_at "NOT NULL"
    }

    ChatRoom {
        BIGINT chat_id PK "AUTO_INCREMENT"
        VARCHAR(255) perso_session_id UK "UNIQUE, NOT NULL"
        DATETIME created_at "NOT NULL"
    }

    Message {
        BIGINT message_id PK "AUTO_INCREMENT"
        BIGINT chat_id FK "NOT NULL, ON DELETE CASCADE"
        VARCHAR(20) role "NOT NULL, user/assistant/system"
        TEXT content "NOT NULL"
        DATETIME created_at "NOT NULL"
    }

    InterviewFeedback {
        BIGINT feedback_id PK "AUTO_INCREMENT"
        BIGINT user_id FK "NOT NULL"
        BIGINT chat_id FK "ON DELETE SET NULL"
        DECIMAL(5,2) score "NOT NULL, 0.00~100.00"
        TEXT feedback_summary "JSON 5개 섹션"
        VARCHAR(100) interview_type "DEFAULT 일반 면접"
        DATETIME interview_date "NOT NULL"
        DATETIME created_at "NOT NULL"
    }
```

---

## 관계 상세 설명

### 1. User (사용자) 관련 관계

#### 1:1 관계
- **User → RefreshToken**: 한 사용자는 하나의 리프레시 토큰을 가진다
  - 삭제 규칙: User 소프트 삭제, RefreshToken은 실제 삭제

#### 1:N 관계
- **User → Resume**: 한 사용자는 여러 이력서를 작성할 수 있다 (최대 5개)
  - 삭제 규칙: User 소프트 삭제 시 Resume 유지

- **User → CoverLetter**: 한 사용자는 여러 자소서를 작성할 수 있다 (최대 5개)
  - 삭제 규칙: User 소프트 삭제 시 CoverLetter 유지

- **User → InterviewFeedback**: 한 사용자는 여러 면접 피드백을 받는다
  - 삭제 규칙: User 소프트 삭제 시 InterviewFeedback 유지

---

### 2. Resume (이력서) 관련 관계

#### 1:N 관계
- **Resume → Education**: 한 이력서는 여러 학력 정보를 포함한다
  - 삭제 규칙: Resume 삭제 시 Education CASCADE 삭제

- **Resume → Career**: 한 이력서는 여러 경력 정보를 포함한다
  - 삭제 규칙: Resume 삭제 시 Career CASCADE 삭제

---

### 3. ChatRoom (채팅방) 관련 관계

#### 1:N 관계
- **ChatRoom → Message**: 한 채팅방은 여러 메시지를 포함한다
  - 삭제 규칙: ChatRoom 삭제 시 Message CASCADE 삭제

#### 1:1 관계 (선택적)
- **ChatRoom → InterviewFeedback**: 한 채팅방은 하나의 피드백을 생성할 수 있다
  - 삭제 규칙: ChatRoom 삭제 시 InterviewFeedback의 chat_id를 NULL로 SET

---

### 4. Chatbot (챗봇)
- **독립 개체**: 다른 테이블과 직접적인 FK 관계 없음
- PersoAI API와 연동하여 사용

---

## 인덱스 전략

### Primary Key (PK)
모든 테이블의 `*_id` 컬럼에 자동 인덱싱

### Unique Key (UK)
- `User.email`
- `User.social_id`
- `RefreshToken.user_id`
- `ChatRoom.perso_session_id`

### Foreign Key (FK) 인덱스
- `RefreshToken.user_id`
- `Resume.user_id`
- `Education.resume_id`
- `Career.resume_id`
- `CoverLetter.user_id`
- `Message.chat_id`
- `InterviewFeedback.user_id`
- `InterviewFeedback.chat_id`

### 검색 성능 인덱스
- `Message.created_at` (시간순 조회용)
- `InterviewFeedback.interview_date` (시간순 조회용)
- `InterviewFeedback.interview_type` (면접 종류별 조회용)
- `InterviewFeedback(user_id, interview_date)` (복합 인덱스)

---

## 비즈니스 규칙

### 데이터 제약
| 테이블 | 규칙 | 검증 방법 |
|--------|------|-----------|
| Resume | 사용자당 최대 5개 | 애플리케이션 로직 |
| Resume | 기본 이력서 1개 | is_default = TRUE는 사용자당 1개 |
| CoverLetter | 사용자당 최대 5개 | 애플리케이션 로직 |
| CoverLetter | 기본 자소서 1개 | is_default = TRUE는 사용자당 1개 |
| RefreshToken | 사용자당 1개 | user_id UNIQUE 제약조건 |
| InterviewFeedback | 점수 범위 | 0.00 ~ 100.00 (DECIMAL 5,2) |

### 소프트 삭제
- **User 테이블**: `deleted_at` 컬럼에 삭제 시간 기록
- 관련 데이터(Resume, CoverLetter, InterviewFeedback)는 유지
- RefreshToken은 실제 삭제

---

## 테이블 크기 예상

| 테이블 | 예상 레코드 수 | 비고 |
|--------|---------------|------|
| User | 10,000 ~ 100,000 | 사용자 수에 비례 |
| RefreshToken | = User 수 | 1:1 관계 |
| Resume | User 수 × 2~3 | 평균 2~3개 작성 예상 |
| Education | Resume 수 × 1~2 | 이력서당 평균 1~2개 |
| Career | Resume 수 × 0~3 | 이력서당 평균 0~3개 |
| CoverLetter | User 수 × 2~3 | 평균 2~3개 작성 예상 |
| ChatRoom | 활성 세션 수 | 동시 접속자에 비례 |
| Message | 대화량에 따라 증가 | 가장 빠르게 증가 |
| InterviewFeedback | User 수 × 10~50 | 사용자당 평균 10~50회 면접 |

---

## 참고 문서
- [요구사항_분석서.md](./요구사항_분석서.md)
- [객체_정의서.md](./객체_정의서.md)
- [테이블_명세서.md](./테이블_명세서.md)
