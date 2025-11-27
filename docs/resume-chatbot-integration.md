# 이력서 기반 면접 챗봇 시스템 문서

## 📋 목차
1. [개요](개요)
2. [데이터베이스 구조](데이터베이스-구조)
3. [챗봇 세션 생성 구조](챗봇-세션-생성-구조)
4. [챗봇이 이력서를 읽는 방법](챗봇이-이력서를-읽는-방법)
5. [API 엔드포인트](api-엔드포인트)
6. [프론트엔드 구조](프론트엔드-구조)

---

## 개요

사용자가 작성한 이력서와 자소서를 AI 챗봇이 읽고, 해당 내용을 기반으로 맞춤형 면접 질문을 제공하는 시스템입니다.

### 주요 기능
- ✅ 사용자당 최대 5개의 이력서 및 자소서 저장
- ✅ 기본 이력서 선택 기능
- ✅ 학력, 경력, 기술 정보 관리
- ✅ 챗봇이 이력서 정보를 자동으로 읽고 면접에 활용

---

## 데이터베이스 구조

### ER 다이어그램

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────┴──────────┐
│     Resume      │◄────────┐
│  - title        │         │
│  - name         │         │
│  - email        │         │
│  - phone        │         │
│  - desired_pos  │         │
│  - skills       │         │
│  - is_default   │         │
└──────┬──────────┘         │
       │                    │
       ├─────────┬──────────┤
       │ 1       │ 1        │
       │         │          │
       │ N       │ N        │
┌──────┴──┐  ┌──┴────────┐ │
│Education│  │  Career   │ │
│- type   │  │- company  │ │
│- school │  │- position │ │
│- major  │  │- duties   │ │
│- gpa    │  │- achieve  │ │
└─────────┘  └───────────┘ │
                            │
       ┌────────────────────┘
       │ 1
       │
       │ N
┌──────┴────────────┐
│   CoverLetter     │
│  - title          │
│  - content        │
│  - company        │
│  - position       │
│  - is_default     │
└───────────────────┘
```

### 주요 테이블 설명

#### 1. `resume` (이력서)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| resume_id | BIGINT | PK |
| user_id | BIGINT | FK (User) |
| title | VARCHAR(200) | 이력서 제목 |
| name | VARCHAR(100) | 이름 |
| email | VARCHAR(200) | 이메일 |
| phone | VARCHAR(20) | 연락처 |
| desired_position | VARCHAR(200) | 희망직무 |
| skills | TEXT | 보유 기술 |
| **is_default** | BOOLEAN | **기본 이력서 여부** |

#### 2. `education` (학력)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| education_id | BIGINT | PK |
| resume_id | BIGINT | FK (Resume) |
| education_type | VARCHAR(50) | 고졸/학사/석사/박사 |
| school_name | VARCHAR(200) | 학교명 |
| major | VARCHAR(200) | 전공 (nullable) |
| attendance_period | VARCHAR(100) | 재학기간 |
| status | VARCHAR(50) | 졸업/재학/수료 |
| gpa | VARCHAR(50) | 학점 |
| order_index | INT | 정렬 순서 |

#### 3. `career` (경력)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| career_id | BIGINT | PK |
| resume_id | BIGINT | FK (Resume) |
| company_name | VARCHAR(200) | 회사명 |
| position | VARCHAR(200) | 직책 |
| employment_period | VARCHAR(100) | 재직기간 |
| is_current | BOOLEAN | 현재 재직 여부 |
| responsibilities | TEXT | 담당업무 |
| achievements | TEXT | 주요성과 |
| order_index | INT | 정렬 순서 |

#### 4. `cover_letter` (자소서)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| cover_letter_id | BIGINT | PK |
| user_id | BIGINT | FK (User) |
| title | VARCHAR(200) | 자소서 제목 |
| content | TEXT | 자소서 내용 |
| company_name | VARCHAR(200) | 회사명 (nullable) |
| position | VARCHAR(200) | 지원직무 (nullable) |
| **is_default** | BOOLEAN | **기본 자소서 여부** |

### 주요 제약사항
- 사용자당 최대 5개의 이력서 저장 가능
- 사용자당 최대 5개의 자소서 저장 가능
- 한 사용자는 하나의 기본 이력서만 지정 가능
- 교육/경력은 이력서와 1:N 관계 (Cascade DELETE)

---

## 챗봇 세션 생성 구조

### 1. 전체 흐름도

```
┌──────────────┐
│ 프론트엔드   │
│ (React)      │
└──────┬───────┘
       │ 1. POST /api/sessions/create
       │    { promptId: 1, previousChatRoomId: null }
       ▼
┌──────────────────────────────────┐
│  SessionController               │
│  createSession()                 │
└──────┬───────────────────────────┘
       │
       ├─ 2. 인증된 사용자 확인
       │    @AuthenticationPrincipal UserPrincipal
       │
       ├─ 3. 기본 이력서 조회
       │    resumeService.getAllResumes(userId)
       │    └─> 기본 이력서 필터링 (isDefault = true)
       │
       ├─ 4. 이력서 컨텍스트 생성
       │    buildResumeContext(defaultResume)
       │    └─> 텍스트 포맷 변환
       │
       ├─ 5. extraData에 컨텍스트 추가
       │    request.setExtraData({
       │      "resume_context": "=== 지원자 이력서 정보 ===\n..."
       │    })
       │
       ▼
┌──────────────────────────────────┐
│  PersoAISessionService           │
│  createSession(request)          │
└──────┬───────────────────────────┘
       │
       ├─ 6. Prompt 조회 (promptId)
       │    └─> systemPrompt 가져오기
       │
       ├─ 7. PersoAI API 호출
       │    POST https://api.perso.ai/v1/sessions
       │    {
       │      "systemPrompt": "당신은 면접관입니다...",
       │      "extraData": {
       │        "resume_context": "..."
       │      }
       │    }
       │
       ▼
┌──────────────────────────────────┐
│  PersoAI (외부 API)              │
│  - AI 모델이 systemPrompt와      │
│    resume_context를 읽음         │
│  - 세션 ID 생성                  │
└──────┬───────────────────────────┘
       │
       │ 8. sessionId 반환
       ▼
┌──────────────────────────────────┐
│  ChatRoomService                 │
│  - ChatRoom 생성/재사용          │
│  - sessionId 저장                │
└──────┬───────────────────────────┘
       │
       │ 9. 응답 반환
       ▼
┌──────────────┐
│ 프론트엔드   │
│ - WebRTC 연결│
│ - 음성 대화  │
└──────────────┘
```

### 2. SessionController 코드 분석

```java
@PostMapping("/create")
public ResponseEntity<?> createSession(
        @RequestBody SessionCreateRequest request,
        @AuthenticationPrincipal UserPrincipal principal) {  // ← 인증된 사용자 정보

    // ===== STEP 1: 이력서 컨텍스트 추가 =====
    if (principal != null) {
        Long userId = principal.getUserId();

        // 사용자의 모든 이력서 조회
        List<ResumeResponse> resumes = resumeService.getAllResumes(userId);

        // 기본 이력서 필터링 (isDefault = true)
        Optional<ResumeResponse> defaultResume = resumes.stream()
                .filter(ResumeResponse::getIsDefault)
                .findFirst();

        // 기본 이력서가 있으면 컨텍스트 생성
        if (defaultResume.isPresent()) {
            String resumeContext = buildResumeContext(defaultResume.get());

            // extraData에 추가
            Map<String, Object> extraData = request.getExtraData();
            if (extraData == null) {
                extraData = new HashMap<>();
                request.setExtraData(extraData);
            }
            extraData.put("resume_context", resumeContext);
        }
    }

    // ===== STEP 2: 이전 대화 컨텍스트 추가 (기존 기능) =====
    if (request.getPreviousChatRoomId() != null) {
        String previousContext = chatRoomService.buildContextFromPreviousChatRoom(
                request.getPreviousChatRoomId(), 10);
        // ... extraData에 추가
    }

    // ===== STEP 3: PersoAI 세션 생성 =====
    SessionResponse response = sessionService.createSession(request);

    // ===== STEP 4: ChatRoom 생성/재사용 =====
    ChatRoom chatRoom = chatRoomService.getOrCreateChatRoom(response.getSessionId());

    return ResponseEntity.ok(responseData);
}
```

---

## 챗봇이 이력서를 읽는 방법

### 1. 이력서 컨텍스트 변환 프로세스

```
┌─────────────────────┐
│  ResumeResponse     │
│  (Java DTO 객체)    │
└──────────┬──────────┘
           │
           │ buildResumeContext()
           ▼
┌─────────────────────────────────────┐
│  구조화된 텍스트 컨텍스트           │
│                                     │
│  === 지원자 이력서 정보 ===        │
│                                     │
│  📋 기본 정보                       │
│  - 이름: 홍길동                     │
│  - 이메일: hong@example.com        │
│  - 희망직무: 백엔드 개발자         │
│                                     │
│  🎓 학력                            │
│  - 한국대학교 (컴퓨터공학)         │
│    [2018.03 - 2022.02] - 졸업      │
│    (학점: 4.2/4.5)                  │
│                                     │
│  💼 경력                            │
│  - ABC회사 / 주니어 개발자         │
│    [2022.03 - 2024.12] (현재 재직중)│
│    담당업무: REST API 개발          │
│    주요성과: 성능 30% 개선          │
│                                     │
│  🛠️ 기술 및 역량                   │
│  Java, Spring Boot, MySQL, React   │
│                                     │
│  === 이력서 정보 끝 ===            │
└──────────┬──────────────────────────┘
           │
           │ extraData에 저장
           ▼
┌─────────────────────────────────────┐
│  PersoAI API Request                │
│  {                                  │
│    "systemPrompt": "...",           │
│    "extraData": {                   │
│      "resume_context": "위 텍스트" │
│    }                                │
│  }                                  │
└──────────┬──────────────────────────┘
           │
           │ AI 모델이 읽음
           ▼
┌─────────────────────────────────────┐
│  AI가 이력서 정보를 기반으로        │
│  맞춤형 면접 질문 생성              │
│                                     │
│  예: "ABC회사에서 REST API 개발을   │
│      담당하셨다고 하셨는데, 성능을  │
│      30% 개선한 방법에 대해         │
│      자세히 설명해주시겠습니까?"    │
└─────────────────────────────────────┘
```

### 2. buildResumeContext() 메서드 상세

```java
/**
 * 이력서 정보를 AI가 이해할 수 있는 컨텍스트 문자열로 변환
 */
private String buildResumeContext(ResumeResponse resume) {
    StringBuilder context = new StringBuilder();

    context.append("=== 지원자 이력서 정보 ===\n\n");

    // ===== 기본 정보 =====
    context.append("📋 기본 정보\n");
    context.append("- 이름: ").append(resume.getName()).append("\n");
    if (resume.getEmail() != null) {
        context.append("- 이메일: ").append(resume.getEmail()).append("\n");
    }
    if (resume.getDesiredPosition() != null) {
        context.append("- 희망직무: ").append(resume.getDesiredPosition()).append("\n");
    }
    context.append("\n");

    // ===== 학력 =====
    if (resume.getEducations() != null && !resume.getEducations().isEmpty()) {
        context.append("🎓 학력\n");
        for (var edu : resume.getEducations()) {
            context.append("- ").append(edu.getSchoolName());
            if (edu.getMajor() != null) {
                context.append(" (").append(edu.getMajor()).append(")");
            }
            if (edu.getAttendancePeriod() != null) {
                context.append(" [").append(edu.getAttendancePeriod()).append("]");
            }
            if (edu.getGpa() != null) {
                context.append(" (학점: ").append(edu.getGpa()).append(")");
            }
            context.append("\n");
        }
        context.append("\n");
    }

    // ===== 경력 =====
    if (resume.getCareers() != null && !resume.getCareers().isEmpty()) {
        context.append("💼 경력\n");
        for (var career : resume.getCareers()) {
            context.append("- ").append(career.getCompanyName());
            if (career.getPosition() != null) {
                context.append(" / ").append(career.getPosition());
            }
            if (Boolean.TRUE.equals(career.getIsCurrent())) {
                context.append(" (현재 재직중)");
            }
            context.append("\n");

            if (career.getResponsibilities() != null) {
                context.append("  담당업무: ")
                       .append(career.getResponsibilities()).append("\n");
            }
            if (career.getAchievements() != null) {
                context.append("  주요성과: ")
                       .append(career.getAchievements()).append("\n");
            }
        }
        context.append("\n");
    }

    // ===== 기술 및 역량 =====
    if (resume.getSkills() != null && !resume.getSkills().isEmpty()) {
        context.append("🛠️ 기술 및 역량\n");
        context.append(resume.getSkills()).append("\n\n");
    }

    context.append("=== 이력서 정보 끝 ===\n");

    return context.toString();
}
```

### 3. 왜 이런 방식을 사용하는가?

#### ✅ 장점
1. **구조화된 텍스트**: AI가 쉽게 이해할 수 있는 형식
2. **이모지 활용**: 섹션 구분이 명확함
3. **선택적 정보**: null 체크로 불필요한 정보 제외
4. **확장 가능**: 새로운 필드 추가 용이

#### 💡 대안 방법과 비교
| 방법 | 장점 | 단점 |
|------|------|------|
| **구조화된 텍스트** (현재) | AI 이해 용이, 가독성 높음 | 파싱 필요 없음 |
| JSON 전달 | 프로그래밍적 처리 용이 | AI가 읽기 어려움 |
| HTML 전달 | 포맷팅 가능 | 불필요한 태그 많음 |

---

## API 엔드포인트

### 1. 이력서 관리 API

#### GET `/api/resumes`
사용자의 모든 이력서 조회

**Response:**
```json
[
  {
    "resumeId": 1,
    "title": "백엔드 개발자 이력서",
    "name": "홍길동",
    "email": "hong@example.com",
    "phone": "010-1234-5678",
    "desiredPosition": "백엔드 개발자",
    "skills": "Java, Spring Boot, MySQL",
    "isDefault": true,
    "educations": [
      {
        "educationId": 1,
        "educationType": "BACHELOR",
        "schoolName": "한국대학교",
        "major": "컴퓨터공학",
        "attendancePeriod": "2018.03 - 2022.02",
        "status": "졸업",
        "gpa": "4.2/4.5"
      }
    ],
    "careers": [
      {
        "careerId": 1,
        "companyName": "ABC회사",
        "position": "주니어 개발자",
        "employmentPeriod": "2022.03 - 현재",
        "isCurrent": true,
        "responsibilities": "REST API 개발",
        "achievements": "성능 30% 개선"
      }
    ]
  }
]
```

#### POST `/api/resumes`
새 이력서 작성

**Request:**
```json
{
  "title": "프론트엔드 개발자 이력서",
  "name": "김철수",
  "email": "kim@example.com",
  "phone": "010-9876-5432",
  "desiredPosition": "프론트엔드 개발자",
  "skills": "React, TypeScript, CSS",
  "educations": [
    {
      "educationType": "BACHELOR",
      "schoolName": "서울대학교",
      "major": "소프트웨어학과",
      "attendancePeriod": "2019.03 - 2023.02",
      "status": "졸업",
      "gpa": "4.0/4.5",
      "orderIndex": 0
    }
  ],
  "careers": []
}
```

#### PUT `/api/resumes/{id}/default`
기본 이력서 설정

**Response:**
```json
{
  "resumeId": 1,
  "isDefault": true,
  "message": "기본 이력서로 설정되었습니다"
}
```

### 2. 세션 생성 API

#### POST `/api/sessions/create`
챗봇 세션 생성 (이력서 컨텍스트 포함)

**Request:**
```json
{
  "promptId": 1,
  "previousChatRoomId": null
}
```

**Response:**
```json
{
  "sessionId": "sess_abc123xyz",
  "chatRoomId": 42,
  "sdp": "...",
  "iceServers": [...]
}
```

**내부 처리:**
1. 사용자 인증 확인 (`@AuthenticationPrincipal`)
2. 기본 이력서 조회 (`isDefault = true`)
3. 이력서 → 텍스트 컨텍스트 변환
4. `extraData`에 `resume_context` 추가
5. PersoAI API 호출
6. ChatRoom 생성/연결

---

## 프론트엔드 구조

### 1. 파일 구조

```
frontend/src/
├── components/
│   ├── RaonResume.jsx          ← 이력서 작성/관리 페이지
│   ├── RaonResume.css          ← 스타일
│   └── chat/
│       └── SideMenu.jsx        ← "📄 이력서 관리" 버튼
├── App.js                      ← 라우팅 설정
└── utils/
    └── logger.js
```

### 2. RaonResume.jsx 주요 기능

```jsx
function RaonResume() {
  const [resumes, setResumes] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    email: '',
    phone: '',
    desiredPosition: '',
    skills: '',
    educations: [],    // ← 동적 배열
    careers: []        // ← 동적 배열
  });

  // ===== 학력 추가/제거 =====
  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      educations: [...prev.educations, {
        educationType: '',
        schoolName: '',
        major: '',
        attendancePeriod: '',
        status: '',
        gpa: '',
        orderIndex: prev.educations.length
      }]
    }));
  };

  const handleRemoveEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index)
    }));
  };

  // ===== 경력 추가/제거 =====
  const handleAddCareer = () => { /* 동일 패턴 */ };
  const handleRemoveCareer = (index) => { /* 동일 패턴 */ };

  // ===== 이력서 저장 =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/raon/api/resumes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData)
    });
    // ...
  };

  // ===== 기본 이력서 설정 =====
  const handleSetDefault = async (resumeId) => {
    await fetch(`/raon/api/resumes/${resumeId}/default`, {
      method: 'PUT',
      credentials: 'include'
    });
    // ...
  };
}
```

### 3. 사용자 플로우

```
1. 로그인
   ↓
2. 사이드 메뉴에서 "📄 이력서 관리" 클릭
   ↓
3. 이력서 작성 폼 작성
   - 기본 정보 입력
   - [+ 학력 추가] 버튼으로 학력 여러 개 입력
   - [+ 경력 추가] 버튼으로 경력 여러 개 입력
   ↓
4. "저장" 버튼 클릭
   ↓
5. 이력서 목록에서 "기본으로 설정" 클릭
   ↓
6. 챗봇과 대화 시작
   ↓
7. AI가 자동으로 이력서 읽고 맞춤형 면접 진행
```

---

## 시스템 흐름 전체 요약

```
┌─────────────────────────────────────────────────────────────────┐
│                        사용자 액션                              │
└────────────┬────────────────────────────────────────────────────┘
             │
    ┌────────▼──────────┐
    │ 1. 이력서 작성    │
    │   (RaonResume)    │
    └────────┬──────────┘
             │ POST /api/resumes
             ▼
    ┌─────────────────────┐
    │ 2. DB 저장          │
    │   - resume          │
    │   - education       │
    │   - career          │
    └────────┬────────────┘
             │
    ┌────────▼──────────┐
    │ 3. 기본 이력서    │
    │    설정           │
    └────────┬──────────┘
             │ PUT /api/resumes/{id}/default
             ▼
    ┌─────────────────────┐
    │ 4. isDefault=true   │
    │    업데이트         │
    └────────┬────────────┘
             │
    ┌────────▼──────────┐
    │ 5. 챗봇 시작      │
    │   (면접 연습)     │
    └────────┬──────────┘
             │ POST /api/sessions/create
             ▼
    ┌──────────────────────────────────────┐
    │ 6. SessionController                 │
    │   ① 사용자 인증 확인                 │
    │   ② 기본 이력서 조회                 │
    │   ③ buildResumeContext() 실행        │
    │   ④ extraData에 컨텍스트 추가        │
    └────────┬───────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────┐
    │ 7. PersoAI API 호출                  │
    │   - systemPrompt: "면접관 역할"      │
    │   - extraData: {                     │
    │       "resume_context": "=== ..."    │
    │     }                                │
    └────────┬───────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────┐
    │ 8. AI 모델 처리                      │
    │   - 이력서 정보 읽기                 │
    │   - 맞춤형 질문 생성                 │
    └────────┬───────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────┐
    │ 9. 사용자와 음성 면접 진행           │
    │   "ABC회사에서의 경험을              │
    │    자세히 말씀해주세요"              │
    └──────────────────────────────────────┘
```

---

## 핵심 코드 위치

### 백엔드
| 파일 | 설명 |
|------|------|
| `SessionController.java:48-73` | 이력서 컨텍스트 조회 로직 |
| `SessionController.java:222-297` | buildResumeContext() 메서드 |
| `ResumeService.java` | 이력서 CRUD 및 유효성 검사 |
| `ResumeRepository.java` | JPA Repository (기본 이력서 조회) |
| `Resume.java` | 이력서 엔티티 (1:N 관계 설정) |

### 프론트엔드
| 파일 | 설명 |
|------|------|
| `RaonResume.jsx` | 이력서 작성 UI 및 로직 |
| `RaonResume.css` | 스타일링 |
| `SideMenu.jsx:28-42` | 이력서 관리 메뉴 버튼 |
| `App.js:216` | `/resume` 라우트 설정 |

---

## 추가 개선 아이디어

### 1. 자소서 통합
현재는 이력서만 읽고 있지만, 자소서도 함께 읽도록 확장 가능:

```java
// SessionController.java
if (defaultResume.isPresent()) {
    String resumeContext = buildResumeContext(defaultResume.get());

    // 자소서도 추가
    Optional<CoverLetterResponse> defaultCoverLetter =
        coverLetterService.getDefaultCoverLetter(userId);
    if (defaultCoverLetter.isPresent()) {
        resumeContext += buildCoverLetterContext(defaultCoverLetter.get());
    }

    extraData.put("resume_context", resumeContext);
}
```

### 2. 면접 유형별 프롬프트
- 기술 면접
- 인성 면접
- 압박 면접

### 3. 면접 피드백 저장
- AI의 평가 내용 DB에 저장
- 개선 사항 추천

---

**작성일**: 2025-11-20
**작성자**: Claude Code
**버전**: 1.0
