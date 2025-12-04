# Raon 프로젝트 학습 가이드

> **Raon**은 AI 기반 면접 준비 플랫폼으로, 취업 준비생들이 실전과 같은 환경에서 면접 연습을 할 수 있도록 지원하는 풀스택 웹 애플리케이션입니다.

---

## 📚 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [백엔드 아키텍처](#4-백엔드-아키텍처)
5. [프론트엔드 아키텍처](#5-프론트엔드-아키텍처)
6. [주요 기능 흐름](#6-주요-기능-흐름)
7. [데이터베이스 설계](#7-데이터베이스-설계)
8. [인증 및 보안](#8-인증-및-보안)
9. [AI 통합](#9-ai-통합)
10. [배포 및 인프라](#10-배포-및-인프라)
11. [개발 가이드](#11-개발-가이드)

---

## 1. 프로젝트 개요

### 1.1 핵심 기능

- **AI 면접 시뮬레이션**: PersoAI Live SDK를 활용한 실시간 음성 기반 면접 연습
- **이력서/자소서 작성 및 첨삭**: AI(Gemini)를 활용한 서류 작성 지원 및 피드백
- **면접 피드백 분석**: 5가지 평가 항목(적합성, 구체성, 논리성, 진정성, 차별성)에 대한 AI 분석
- **학습 기록 대시보드**: 면접 연습 히스토리 및 성과 분석
- **소셜 로그인**: Google, Kakao OAuth2 기반 간편 로그인

### 1.2 프로젝트 특징

| 특징 | 설명 |
|------|------|
| **실전형 면접 연습** | 6가지 직종별 맞춤 면접 시뮬레이션 |
| **AI 기반 피드백** | Gemini 2.5 Flash 모델을 활용한 즉각적인 피드백 |
| **음성 인터페이스** | STT/TTS 기술을 활용한 자연스러운 대화형 면접 |
| **사용자 중심 설계** | 직관적인 UI/UX와 반응형 디자인 |

---

## 2. 기술 스택

### 2.1 백엔드 (Spring Boot)

```
Java 21
└─ Spring Boot 3.4.10
   ├─ Spring Web (RESTful API)
   ├─ Spring WebFlux (비동기 처리)
   ├─ Spring Security (인증/인가)
   ├─ Spring Data JPA (ORM)
   ├─ Spring OAuth2 Client (소셜 로그인)
   ├─ JWT (jjwt 0.12.3)
   ├─ MySQL Connector 8.4.0
   └─ Caffeine Cache
```

### 2.2 프론트엔드 (React)

```
React 19.2.0
├─ React Router DOM 6.30.1 (라우팅)
├─ Framer Motion 12.23.24 (애니메이션)
├─ Lucide React 0.554.0 (아이콘)
├─ Recharts 3.5.1 (차트)
└─ @google/genai 1.30.0 (Gemini SDK)
```

### 2.3 외부 API 및 SDK

| 서비스 | 용도 | 버전 |
|--------|------|------|
| **PersoAI Live SDK** | AI 음성 채팅 세션 관리 | v1.0.8 |
| **Google Gemini API** | 자소서 첨삭 및 면접 피드백 | Gemini 2.5 Flash |
| **Google OAuth2** | 구글 소셜 로그인 | - |
| **Kakao OAuth2** | 카카오 소셜 로그인 | - |

### 2.4 데이터베이스 및 인프라

```
MySQL 8.x
Docker + Docker Compose
Nginx (리버스 프록시)
systemd (서비스 관리)
```

---

## 3. 프로젝트 구조

### 3.1 전체 디렉토리 구조

```
Raon/
├── backend/                        # Spring Boot 백엔드
│   └── src/main/java/com/example/raon/
│       ├── config/                 # 설정 클래스
│       ├── controller/             # REST API 컨트롤러
│       ├── domain/                 # 엔티티 (JPA)
│       ├── dto/                    # Data Transfer Objects
│       ├── repository/             # JPA 레포지토리
│       ├── service/                # 비즈니스 로직
│       ├── security/               # 보안 관련
│       └── exception/              # 예외 처리
│
├── frontend/                       # React 프론트엔드
│   └── src/
│       ├── components/             # React 컴포넌트
│       ├── hooks/                  # Custom Hooks
│       └── utils/                  # 유틸리티
│
├── deploy/                         # 배포 관련 파일
│   ├── nginx-raon.conf             # Nginx 설정
│   └── raon-backend.service        # systemd 서비스
│
└── sql/                            # SQL 스크립트
```

### 3.2 계층형 아키텍처

```
┌─────────────────────────────────────┐
│       Controller Layer              │  ← REST API 엔드포인트
│       (UserController,              │     (@RestController)
│        ResumeController, ...)       │
├─────────────────────────────────────┤
│       Service Layer                 │  ← 비즈니스 로직
│       (UserService,                 │     (@Service)
│        ResumeService, ...)          │
├─────────────────────────────────────┤
│       Repository Layer              │  ← 데이터 액세스
│       (UserRepository,              │     (JPA Repository)
│        ResumeRepository, ...)       │
├─────────────────────────────────────┤
│       Domain Layer                  │  ← 엔티티 (JPA Entity)
│       (User, Resume, ...)           │     (@Entity)
└─────────────────────────────────────┘
```

---

## 4. 백엔드 아키텍처

### 4.1 주요 도메인 엔티티

#### 4.1.1 User (사용자)

```java
@Entity
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    private SocialType socialType;  // GOOGLE, KAKAO

    @Column(unique = true, nullable = false)
    private String socialId;        // OAuth Provider의 고유 ID

    private String nickname;
    private String profileImage;
    private LocalDateTime joinDate;
    private LocalDateTime lastLogin;
    private LocalDateTime deletedAt; // 소프트 삭제
}
```

**핵심 포인트:**
- `socialId`로 사용자를 식별 (OAuth Provider의 고유 ID)
- 소프트 삭제 지원 (`deletedAt` 필드)
- 이메일은 선택적 (소셜 로그인만 사용 가능)

#### 4.1.2 Resume (이력서)

```java
@Entity
@Table(name = "resume")
public class Resume {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;              // 사용자당 최대 5개

    private String title;           // 이력서 제목
    private String name;
    private String phone;
    private String email;
    private String desiredPosition; // 희망 직무
    private String skills;          // 기술/역량
    private Boolean isDefault;      // 기본 이력서 여부

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL)
    private List<Education> educations;  // 학력

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL)
    private List<Career> careers;        // 경력
}
```

**핵심 포인트:**
- 사용자당 최대 5개의 이력서
- 학력(Education)과 경력(Career)은 `@OneToMany` 관계
- `isDefault`로 기본 이력서 설정 가능

#### 4.1.3 InterviewFeedback (면접 피드백)

```java
@Entity
@Table(name = "interview_feedback")
public class InterviewFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feedbackId;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    private ChatRoom chatRoom;

    private BigDecimal score;       // 종합 점수 (0-100)
    private String feedbackSummary; // 피드백 전체 (JSON)
    private String interviewType;   // 면접 유형
    private LocalDateTime interviewDate;
}
```

**핵심 포인트:**
- `feedbackSummary`는 JSON 형식으로 저장
- 5가지 평가 항목 (적합성, 구체성, 논리성, 진정성, 차별성)
- ChatRoom과 연결하여 면접 대화 내역 추적 가능

### 4.2 주요 API 엔드포인트

#### 4.2.1 인증 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/refresh` | Access Token 갱신 |
| POST | `/api/auth/logout` | 로그아웃 |

#### 4.2.2 사용자 API

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/users/me` | 현재 사용자 정보 조회 | ✅ |
| PATCH | `/api/users/me` | 사용자 정보 수정 | ✅ |
| DELETE | `/api/users/me` | 회원 탈퇴 | ✅ |

#### 4.2.3 이력서/자소서 API

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/resumes` | 이력서 목록 조회 | ✅ |
| POST | `/api/resumes` | 이력서 생성 | ✅ |
| PUT | `/api/resumes/{id}` | 이력서 수정 | ✅ |
| DELETE | `/api/resumes/{id}` | 이력서 삭제 | ✅ |
| GET | `/api/cover-letters` | 자소서 목록 조회 | ✅ |
| POST | `/api/cover-letters` | 자소서 생성 | ✅ |

#### 4.2.4 AI 피드백 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/gemini/feedback` | 자소서 첨삭 요청 |
| POST | `/api/gemini/interview-feedback` | 면접 피드백 요청 |

#### 4.2.5 면접 세션 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/sessions` | PersoAI 세션 생성 |
| POST | `/api/sessions/{id}/messages` | 메시지 전송 |
| GET | `/api/sessions/{id}/messages` | 메시지 조회 |

### 4.3 서비스 레이어 핵심 로직

#### 4.3.1 ResumeService

```java
@Service
@Transactional
public class ResumeService {

    // 이력서 생성 (최대 5개 제한)
    public ResumeResponse createResume(Long userId, ResumeRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException());

        // 이력서 개수 확인
        long count = resumeRepository.countByUserId(userId);
        if (count >= 5) {
            throw new MaxResumeLimitException("이력서는 최대 5개까지 생성 가능합니다");
        }

        Resume resume = Resume.builder()
            .user(user)
            .title(request.getTitle())
            .name(request.getName())
            // ... 기타 필드
            .build();

        return ResumeResponse.from(resumeRepository.save(resume));
    }

    // 기본 이력서 설정
    public void setDefaultResume(Long userId, Long resumeId) {
        // 기존 기본 이력서 해제
        resumeRepository.findByUserIdAndIsDefaultTrue(userId)
            .ifPresent(r -> {
                r.setIsDefault(false);
                resumeRepository.save(r);
            });

        // 새로운 기본 이력서 설정
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, userId)
            .orElseThrow(() -> new ResumeNotFoundException());
        resume.setIsDefault(true);
        resumeRepository.save(resume);
    }
}
```

#### 4.3.2 InterviewFeedbackService

```java
@Service
@Transactional
public class InterviewFeedbackService {

    // Gemini로 면접 피드백 생성
    public InterviewFeedbackResponse createFeedback(
            Long userId, InterviewFeedbackRequest request) {

        // 1. Gemini API 호출
        String feedbackJson = callGeminiAPI(request.getMessages());

        // 2. 피드백 파싱
        FeedbackData feedback = parseJSON(feedbackJson);

        // 3. DB 저장
        InterviewFeedback entity = InterviewFeedback.builder()
            .user(userRepository.findById(userId).orElseThrow())
            .chatRoom(chatRoomRepository.findById(request.getChatId()).orElse(null))
            .score(BigDecimal.valueOf(feedback.getOverallScore()))
            .feedbackSummary(feedbackJson)
            .interviewType(request.getInterviewType())
            .interviewDate(LocalDateTime.now())
            .build();

        interviewFeedbackRepository.save(entity);

        // 4. 학습 기록 업데이트
        learningHistoryRepository.save(LearningHistory.builder()
            .userId(userId)
            .score(feedback.getOverallScore())
            .createdAt(LocalDateTime.now())
            .build());

        return InterviewFeedbackResponse.from(entity);
    }
}
```

---

## 5. 프론트엔드 아키텍처

### 5.1 주요 페이지 구성

```
App (루트)
├── TopBar (상단 네비게이션)
├── Routes
│   ├── / (홈)                   → RaonHome
│   ├── /login                   → RaonSocialLogin
│   ├── /account                 → AccountEdit (인증 필요)
│   ├── /avatar                  → RaonAvatar
│   ├── /chat/:id                → RaonChatPerso (면접 연습)
│   ├── /resume                  → RaonResume (인증 필요)
│   ├── /Dashboard               → InterviewScorePage (인증 필요)
│   └── /backoffice              → RaonBackoffice
└── Footer
```

### 5.2 핵심 컴포넌트

#### 5.2.1 RaonHome.jsx (홈 페이지)

**역할:**
- 서비스 소개
- 주요 기능 카드
- CTA (Call To Action)

**주요 코드:**
```jsx
function RaonHome() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>완벽한 면접을 위한 당신만의 AI 아바타 코치</h1>
        <button onClick={() => navigate('/avatar')}>
          지금 시작하기
        </button>
      </div>

      <div className="service-cards">
        <ServiceCard
          title="AI 면접 연습"
          description="실전과 같은 면접 환경"
          icon={<Bot />}
        />
        <ServiceCard
          title="이력서/자소서 작성"
          description="AI 첨삭 피드백"
          icon={<FileText />}
        />
        <ServiceCard
          title="학습 기록"
          description="성장 과정 추적"
          icon={<BarChart />}
        />
      </div>
    </div>
  );
}
```

#### 5.2.2 RaonAvatar.jsx (아바타 선택)

**역할:**
- 6가지 직종별 아바타 선택
- 면접 유형 선택
- 세션 시작

**주요 상태:**
```jsx
const [selectedChatbot, setSelectedChatbot] = useState(null);
const [chatbots, setChatbots] = useState([]);
const [personality, setPersonality] = useState('친절한');
const [interviewType, setInterviewType] = useState('기술면접');
```

**API 호출:**
```jsx
useEffect(() => {
  // 챗봇 목록 조회
  const loadChatbots = async () => {
    const response = await fetch('/raon/api/chatbots/public');
    const data = await response.json();
    setChatbots(data);
  };

  loadChatbots();
}, []);

const startInterview = () => {
  navigate(`/chat/${selectedChatbot.id}`, {
    state: {
      avatarName: selectedChatbot.chatbotName,
      personality: personality,
      interviewType: interviewType
    }
  });
};
```

#### 5.2.3 RaonChatPerso.jsx (면접 연습)

**역할:**
- PersoAI Live SDK를 활용한 실시간 음성 면접
- STT/TTS 기반 대화
- 채팅 메시지 저장
- 면접 피드백 요청

**주요 상태:**
```jsx
const [persoSession, setPersoSession] = useState(null);
const [isSessionActive, setIsSessionActive] = useState(false);
const [messages, setMessages] = useState([]);
const [isListening, setIsListening] = useState(false);
const [isTTSOn, setIsTTSOn] = useState(true);
```

**세션 생성 흐름:**
```jsx
const startSession = async () => {
  try {
    // 1. 자격증명 조회
    const credResponse = await fetch('/raon/api/persoai/credentials');
    const { apiServer, apiKey } = await credResponse.json();

    // 2. 세션 ID 생성
    const sessionId = await window.PersoLiveSDK.createSessionId(
      apiServer, apiKey, llmType, ttsType, modelStyle,
      promptId, documentId, backgroundImage, ...
    );

    // 3. 세션 생성
    const newSession = await window.PersoLiveSDK.createSession(
      apiServer, sessionId, 1280, 720, true
    );

    // 4. 비디오 연결
    newSession.on('connectionCompleted', () => {
      videoRef.current.srcObject = newSession.getMediaStream();
      videoRef.current.play();
    });

    // 5. 메시지 수신
    newSession.on('textResponse', (text) => {
      const aiMessage = {
        id: Date.now(),
        role: 'assistant',
        text: text,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    });

    setPersoSession(newSession);
    setIsSessionActive(true);
  } catch (error) {
    console.error('세션 생성 실패:', error);
  }
};
```

**음성 인식 (STT):**
```jsx
const startListening = () => {
  const recognition = new window.webkitSpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join('');

    if (event.results[0].isFinal) {
      sendMessage(transcript);
    }
  };

  recognition.start();
  setIsListening(true);
};
```

**면접 피드백 요청:**
```jsx
const handleRequestFeedback = async () => {
  setIsFeedbackLoading(true);

  try {
    const response = await fetch('/raon/api/gemini/interview-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages,
        chatId: chatRoomId,
        interviewType: interviewType
      })
    });

    const data = await response.json();
    const feedback = JSON.parse(data.text);

    setFeedbackData(feedback);
    setIsFeedbackModalOpen(true);
  } catch (error) {
    console.error('피드백 요청 실패:', error);
  } finally {
    setIsFeedbackLoading(false);
  }
};
```

#### 5.2.4 RaonResume.jsx (이력서/자소서)

**역할:**
- 이력서/자소서 작성 및 관리
- AI 첨삭 요청
- 학력/경력 추가

**주요 상태:**
```jsx
const [activeTab, setActiveTab] = useState('resume');
const [resumes, setResumes] = useState([]);
const [coverLetters, setCoverLetters] = useState([]);
const [selectedResume, setSelectedResume] = useState(null);
```

**API 호출:**
```jsx
// 이력서 생성
const createResume = async (resumeData) => {
  const response = await fetchWithAuth('/raon/api/resumes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resumeData)
  });

  if (response.ok) {
    alert('이력서가 생성되었습니다');
    loadResumes();
  }
};

// AI 첨삭 요청
const requestFeedback = async (coverLetter) => {
  const response = await fetch('/raon/api/gemini/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      coverLetter: coverLetter.content,
      name: resume.name,
      desiredPosition: resume.desiredPosition,
      skills: resume.skills
    })
  });

  const data = await response.json();
  const feedback = JSON.parse(data.text);
  displayFeedback(feedback);
};
```

### 5.3 API 통신 유틸리티

#### 5.3.1 fetchWithAuth (utils/api.js)

```jsx
export async function fetchWithAuth(url, options = {}) {
  // 1. 첫 번째 요청
  let response = await fetch(url, {
    ...options,
    credentials: 'include'  // 쿠키 포함
  });

  // 2. 401 Unauthorized 시 토큰 갱신
  if (response.status === 401) {
    const refreshResponse = await fetch('/raon/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });

    if (refreshResponse.ok) {
      // 3. 토큰 갱신 성공 시 원래 요청 재시도
      response = await fetch(url, {
        ...options,
        credentials: 'include'
      });
    } else {
      // 4. 토큰 갱신 실패 시 로그인 페이지로 이동
      window.location.href = '/login';
    }
  }

  return response;
}
```

**핵심 포인트:**
- 자동 토큰 갱신
- 쿠키 기반 인증 (HttpOnly)
- 갱신 실패 시 로그인 페이지로 리다이렉트

---

## 6. 주요 기능 흐름

### 6.1 OAuth2 소셜 로그인

```
┌─────────────┐
│  사용자      │
└──────┬──────┘
       │ 1. "구글로 로그인" 버튼 클릭
       ↓
┌──────────────────────────────────────┐
│  프론트엔드: RaonSocialLogin.jsx     │
│  window.location.href =              │
│    "/raon/oauth2/authorization/google"
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  백엔드: Spring Security OAuth2      │
│  2. Google OAuth2 인증 URL 생성      │
│  3. Google 로그인 페이지로 리다이렉트│
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  Google OAuth2 Provider              │
│  4. 사용자 계정 선택 및 동의         │
│  5. Authorization Code 발급          │
│  6. Redirect: /login/oauth2/code/google
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  백엔드: CustomOAuth2UserService     │
│  7. Authorization Code → Access Token│
│  8. Access Token → 사용자 정보 조회  │
│  9. socialId 추출 (Google: sub)      │
│  10. DB에서 사용자 조회/생성         │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  백엔드: OAuth2LoginSuccessHandler   │
│  11. JWT Access Token 생성 (1시간)   │
│  12. JWT Refresh Token 생성 (7일)    │
│  13. Refresh Token DB 저장           │
│  14. JWT를 HttpOnly 쿠키로 설정     │
│  15. 프론트엔드 URL로 리다이렉트     │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  프론트엔드: App.js                   │
│  16. GET /api/users/me (로그인 확인) │
│  17. 사용자 정보 수신                │
│  18. setUser(userData)               │
│  19. setIsLoggedIn(true)             │
└──────────────────────────────────────┘
```

**핵심 포인트:**
- OAuth2 Provider의 `sub` (또는 `id`)를 `socialId`로 저장
- JWT Access Token (1시간) + Refresh Token (7일)
- HttpOnly 쿠키로 XSS 공격 방지
- SameSite=Lax로 CSRF 공격 방지

### 6.2 토큰 갱신 흐름

```
┌─────────────┐
│ 프론트엔드   │
└──────┬──────┘
       │ 1. API 요청 (Access Token 만료)
       ↓
┌──────────────────────────────────────┐
│  백엔드: JwtAuthenticationFilter     │
│  2. Access Token 검증 실패           │
│  3. 401 Unauthorized 응답            │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  프론트엔드: fetchWithAuth           │
│  4. 401 감지                         │
│  5. POST /api/auth/refresh           │
│     (Refresh Token in Cookie)        │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  백엔드: AuthController.refreshToken │
│  6. Refresh Token 검증               │
│  7. DB에서 Refresh Token 확인        │
│  8. 새로운 Access Token 생성         │
│  9. 새 Access Token을 쿠키로 설정   │
│  10. 200 OK 응답                     │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  프론트엔드: fetchWithAuth           │
│  11. 토큰 갱신 성공                  │
│  12. 원래 API 요청 재시도            │
└──────────────────────────────────────┘
```

### 6.3 AI 면접 시뮬레이션 전체 흐름

```
1. 아바타 선택 (RaonAvatar)
   - 6가지 직종별 챗봇 선택
   - 면접 유형 선택 (기술/인성/PT)
   ↓
2. 챗봇 설정 로드 (/api/chatbots/{id})
   - LLM, TTS, STT 타입
   - 프롬프트 ID, 문서 ID
   ↓
3. PersoAI 자격증명 조회 (/api/persoai/credentials)
   - API Server, API Key
   ↓
4. PersoAI SDK로 세션 생성
   - createSessionId()
   - createSession()
   ↓
5. 비디오 스트림 연결
   - connectionCompleted 이벤트
   - videoRef.srcObject = session.getMediaStream()
   ↓
6. 음성 대화 시작
   - STT: 사용자 음성 → 텍스트
   - LLM: AI 면접관 응답 생성
   - TTS: 텍스트 → AI 음성
   ↓
7. 메시지 저장 (DB)
   - ChatRoom 생성
   - Message 저장 (role, content)
   ↓
8. 면접 종료 후 피드백 요청
   - POST /api/gemini/interview-feedback
   - Gemini API 호출
   - 5가지 평가 항목 분석
   ↓
9. 피드백 저장 (DB)
   - interview_feedback 테이블
   - feedbackSummary (JSON)
   ↓
10. 학습 기록 업데이트
    - learning_history 테이블
    - score, createdAt
```

### 6.4 자소서 첨삭 흐름

```
1. 이력서 작성 (RaonResume)
   - 기본 정보, 학력, 경력 입력
   ↓
2. 자소서 작성
   - 회사/직무 정보
   - 자소서 내용
   ↓
3. "AI 첨삭 요청" 버튼 클릭
   ↓
4. POST /api/gemini/feedback
   - coverLetter, name, desiredPosition, skills 전송
   ↓
5. Gemini API 호출
   - 프롬프트: 자소서 첨삭 전문가 역할
   - 모델: gemini-2.5-flash
   ↓
6. Gemini API 응답 (JSON)
   - 4가지 평가 항목
     1. 전반적인 인상
     2. 구조와 논리성
     3. 구체성과 사례
     4. 문법과 표현
   - 각 항목별: 점수, 강점, 개선점, 제안
   ↓
7. 피드백 모달로 표시
   - 항목별 점수 및 상세 피드백
   - 전체 요약 및 추천 점수
```

---

## 7. 데이터베이스 설계

### 7.1 ERD (주요 테이블)

```
┌──────────────┐       ┌──────────────────┐
│     user     │       │   refresh_token  │
├──────────────┤       ├──────────────────┤
│ user_id (PK) │───────│ user_id (FK)     │
│ email        │       │ token            │
│ social_type  │       │ expires_at       │
│ social_id    │       └──────────────────┘
│ nickname     │
│ profile_img  │
└──────┬───────┘
       │
       ├───────────────────────────────────┐
       │                                   │
       ↓                                   ↓
┌──────────────┐                   ┌──────────────┐
│    resume    │                   │ cover_letter │
├──────────────┤                   ├──────────────┤
│ resume_id(PK)│                   │ id (PK)      │
│ user_id (FK) │                   │ user_id (FK) │
│ title        │                   │ title        │
│ name         │                   │ content      │
│ is_default   │                   │ is_default   │
└──────┬───────┘                   └──────────────┘
       │
       ├──────────────┐
       │              │
       ↓              ↓
┌─────────────┐ ┌──────────┐
│  education  │ │  career  │
├─────────────┤ ├──────────┤
│ id (PK)     │ │ id (PK)  │
│ resume_id   │ │ resume_id│
└─────────────┘ └──────────┘

┌──────────────┐       ┌──────────────────┐
│  chat_room   │       │     message      │
├──────────────┤       ├──────────────────┤
│ chat_id (PK) │───────│ chat_id (FK)     │
│ perso_sess_id│       │ role             │
└──────────────┘       │ content          │
                       └──────────────────┘

┌─────────────────────┐
│ interview_feedback  │
├─────────────────────┤
│ feedback_id (PK)    │
│ user_id (FK)        │
│ chat_id (FK)        │
│ score               │
│ feedback_summary    │  ← JSON 형식
└─────────────────────┘

┌─────────────────────┐
│  learning_history   │
├─────────────────────┤
│ id (PK)             │
│ user_id             │
│ score               │
│ created_at          │
└─────────────────────┘
```

### 7.2 주요 테이블 스키마

#### 7.2.1 user 테이블

```sql
CREATE TABLE user (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE,
    social_type VARCHAR(20) NOT NULL,     -- GOOGLE, KAKAO
    social_id VARCHAR(255) NOT NULL UNIQUE,
    nickname VARCHAR(50),
    profile_image VARCHAR(500),
    join_date TIMESTAMP NOT NULL,
    last_login TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP,                 -- 소프트 삭제
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 7.2.2 resume 테이블

```sql
CREATE TABLE resume (
    resume_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    desired_position VARCHAR(100),
    skills TEXT,
    cover_letter TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);
```

#### 7.2.3 interview_feedback 테이블

```sql
CREATE TABLE interview_feedback (
    feedback_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    chat_id BIGINT,
    score DECIMAL(5,2) NOT NULL,
    feedback_summary TEXT,                -- JSON 형식
    interview_type VARCHAR(100),
    interview_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (chat_id) REFERENCES chat_room(chat_id) ON DELETE SET NULL
);
```

**feedback_summary JSON 구조:**
```json
{
  "overallScore": 82,
  "sections": [
    {
      "title": "적합성",
      "score": 85,
      "criteria": "질문의 의도에 맞는 답변인가?",
      "feedback": "..."
    },
    ...
  ],
  "summary": "전체적으로 준비된 답변이나...",
  "strengths": ["명확한 커뮤니케이션", ...],
  "weaknesses": ["답변이 다소 짧음", ...]
}
```

---

## 8. 인증 및 보안

### 8.1 JWT 토큰 구조

#### 8.1.1 Access Token

```json
{
  "sub": "123",                   // userId
  "email": "user@example.com",
  "name": "홍길동",
  "type": "access",
  "iat": 1234567890,
  "exp": 1234571490               // 발급 후 1시간
}
```

#### 8.1.2 Refresh Token

```json
{
  "sub": "123",                   // userId
  "type": "refresh",
  "iat": 1234567890,
  "exp": 1235172690               // 발급 후 7일
}
```

### 8.2 Spring Security 설정

#### 8.2.1 SecurityConfig.java

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login/**", "/oauth2/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter,
                             UsernamePasswordAuthenticationFilter.class)
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
                .successHandler(oAuth2LoginSuccessHandler)
            );

        return http.build();
    }
}
```

**핵심 포인트:**
- JWT 필터를 `UsernamePasswordAuthenticationFilter` 앞에 추가
- OAuth2 로그인 성공 시 `OAuth2LoginSuccessHandler` 호출
- CSRF 비활성화 (JWT 사용)

#### 8.2.2 JwtAuthenticationFilter.java

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) {
        try {
            // 1. 쿠키에서 accessToken 추출
            String token = extractTokenFromCookie(request, "accessToken");

            if (token != null && jwtTokenProvider.validateToken(token)) {
                // 2. 토큰 타입 확인
                String tokenType = jwtTokenProvider.getTokenType(token);
                if (!"access".equals(tokenType)) {
                    throw new InvalidTokenException("Invalid token type");
                }

                // 3. userId 추출
                Long userId = jwtTokenProvider.getUserIdFromToken(token);

                // 4. SecurityContext에 인증 정보 설정
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userId, null, Collections.emptyList()
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("JWT 인증 실패", e);
        }

        filterChain.doFilter(request, response);
    }
}
```

### 8.3 보안 고려사항

| 보안 요소 | 구현 방법 | 설명 |
|-----------|-----------|------|
| **XSS 방지** | HttpOnly 쿠키 | JavaScript에서 쿠키 접근 불가 |
| **CSRF 방지** | SameSite=Lax | 크로스 사이트 요청 제한 |
| **HTTPS** | Secure Flag | 운영 환경에서 HTTPS만 전송 |
| **SQL Injection** | JPA Parameterized Query | 파라미터 바인딩으로 방지 |
| **비밀번호 암호화** | N/A | 소셜 로그인만 사용 (비밀번호 없음) |
| **환경 변수** | .env 파일 | API Key, Secret 보호 |

---

## 9. AI 통합

### 9.1 Google Gemini API

#### 9.1.1 자소서 첨삭 프롬프트

```
당신은 전문 취업 컨설턴트입니다. 다음 자기소개서를 첨삭해주세요.

[자기소개서 내용]
{coverLetter}

[지원자 정보]
- 이름: {name}
- 희망 직무: {desiredPosition}
- 기술 스택: {skills}

다음 항목들을 평가하고 구체적인 피드백을 제공해주세요:

1. 전반적인 인상 (5점 만점)
2. 구조와 논리성 (5점 만점)
3. 구체성과 사례 (5점 만점)
4. 문법과 표현 (5점 만점)

각 항목에 대해:
- 점수와 함께 좋은 점 2-3개
- 개선이 필요한 점 2-3개
- 구체적인 수정 제안

반드시 다음 JSON 형식으로 응답해주세요:
{
  "overallScore": 85,
  "sections": [
    {
      "title": "전반적인 인상",
      "score": 4.5,
      "strengths": ["...", "..."],
      "improvements": ["...", "..."],
      "suggestions": "..."
    },
    ...
  ],
  "summary": "...",
  "recommendedScore": 85
}
```

#### 9.1.2 면접 피드백 프롬프트

```
당신은 전문 면접관이자 HR 전문가입니다.
다음 면접 대화 내역을 분석하여 면접자에 대한 종합적인 피드백을 제공해주세요.

[면접 대화 내역]
{messages}

다음 5가지 항목을 각각 100점 만점으로 평가해주세요:

1. 적합성 (100점): 질문의 의도에 맞는 답변인가?
2. 구체성 (100점): 추상적이지 않고 구체적인 사례가 포함되었는가?
3. 논리성 (100점): 답변의 흐름이 자연스럽고 논리적인가?
4. 진정성 (100점): 진실이 담긴 답변인가?
5. 차별성 (100점): 다른 지원자와 구별되는 강점이 드러나는가?

반드시 다음 JSON 형식으로 응답해주세요:
{
  "overallScore": 82,
  "sections": [
    {
      "title": "적합성",
      "score": 85,
      "criteria": "질문의 의도에 맞는 답변인가?",
      "feedback": "..."
    },
    ...
  ],
  "summary": "...",
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."]
}
```

### 9.2 PersoAI Live SDK

#### 9.2.1 SDK 로드 (public/index.html)

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <script src="https://est-perso-live.github.io/perso-live-sdk/js/v1.0.8/perso-live-sdk.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

#### 9.2.2 세션 생성 흐름

```jsx
// 1. 세션 ID 생성
const sessionId = await window.PersoLiveSDK.createSessionId(
  apiServer,                    // https://live-api.perso.ai
  apiKey,                       // plak-xxxxx
  "azure-gpt-4o",              // LLM 타입
  "chaehee",                   // TTS 타입
  "chaehee_livechat-front-...", // 모델 스타일
  "plp-xxxxx",                 // 프롬프트 ID
  "pld-xxxxx",                 // 문서 ID
  "background.png",            // 배경 이미지
  0.5,                         // 캐릭터 X 위치
  0.5,                         // 캐릭터 Y 위치
  0.8                          // 캐릭터 높이
);

// 2. 세션 생성
const session = await window.PersoLiveSDK.createSession(
  apiServer,
  sessionId,
  1280,                        // 화면 너비
  720,                         // 화면 높이
  true                         // 음성 채팅 활성화
);

// 3. 비디오 스트림 연결
session.on('connectionCompleted', () => {
  videoRef.current.srcObject = session.getMediaStream();
  videoRef.current.play();
});

// 4. 메시지 수신
session.on('textResponse', (text) => {
  const aiMessage = {
    role: 'assistant',
    text: text,
    timestamp: new Date()
  };
  setMessages(prev => [...prev, aiMessage]);
});

// 5. 메시지 전송
await session.sendUserInput("안녕하세요");

// 6. 세션 종료
session.close();
```

**핵심 포인트:**
- SDK는 글로벌 변수 `window.PersoLiveSDK`로 사용
- 세션 ID 생성 후 세션 생성
- WebRTC 기반 비디오 스트림
- 이벤트 기반 메시지 수신

---

## 10. 배포 및 인프라

### 10.1 Docker 설정

#### 10.1.1 Dockerfile (Multi-stage Build)

```dockerfile
# Stage 1: Build
FROM gradle:8.5-jdk21-alpine AS build
WORKDIR /app

COPY build.gradle settings.gradle gradlew ./
COPY gradle ./gradle
RUN gradle dependencies --no-daemon || true

COPY src ./src
RUN gradle clean bootJar --no-daemon -x test

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -g 1001 spring && \
    adduser -D -u 1001 -G spring spring

COPY --from=build /app/build/libs/*.jar app.jar
RUN chown -R spring:spring /app

USER spring
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
```

**핵심 포인트:**
- Multi-stage Build로 이미지 크기 최소화
- Non-root 사용자 사용 (보안)
- Health Check로 컨테이너 상태 모니터링

#### 10.1.2 docker-compose.yml

```yaml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3307:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s

  backend:
    build: .
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      DB_URL: jdbc:mysql://mysql:3306/${MYSQL_DATABASE}
      SPRING_PROFILES_ACTIVE: prod
    ports:
      - "8081:8086"

  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "3000:80"

volumes:
  mysql_data:
```

### 10.2 Nginx 설정

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /opt/Raon/frontend/build;
    index index.html;

    # React Router (모든 경로를 index.html로)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 백엔드 API 프록시
    location /raon/api/ {
        proxy_pass http://localhost:8086/raon/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # OAuth2 경로 프록시
    location /raon/oauth2/ {
        proxy_pass http://localhost:8086/raon/oauth2/;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 10.3 배포 스크립트

```bash
#!/bin/bash
# deploy/deploy.sh

# 1. 환경 변수 로드
source .env

# 2. Git Pull
git pull origin main

# 3. 백엔드 빌드
./gradlew clean bootJar

# 4. 프론트엔드 빌드
cd frontend
npm install
npm run build
cd ..

# 5. systemd 서비스 재시작
sudo systemctl restart raon-backend.service

# 6. Nginx 설정 업데이트 및 재시작
sudo cp deploy/nginx-raon.conf /etc/nginx/sites-available/raon
sudo systemctl reload nginx

echo "✅ 배포 완료!"
```

---

## 11. 개발 가이드

### 11.1 로컬 개발 환경 설정

#### 11.1.1 백엔드 실행

```bash
# 1. 환경 변수 설정
cp .env.example .env
# .env 파일 편집 (API Key 등 입력)

# 2. Gradle로 실행
./gradlew bootRun

# 3. 또는 IDE에서 RaonApplication.java 실행
```

#### 11.1.2 프론트엔드 실행

```bash
cd frontend
npm install
npm start

# 브라우저 자동 실행: http://localhost:3000
```

#### 11.1.3 데이터베이스 설정

```bash
# MySQL 설치 후
mysql -u root -p

CREATE DATABASE raon;
CREATE USER 'raon_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON raon.* TO 'raon_user'@'localhost';
FLUSH PRIVILEGES;
```

### 11.2 필수 환경 변수

**`.env` 파일:**

```bash
# OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret

# JWT
JWT_SECRET=your-jwt-secret-key-at-least-32-characters-long

# API Keys
PERSOAI_API_KEY=plak-xxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSy-xxxxxxxxxxxxxxxx

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Database
DB_URL=jdbc:mysql://localhost:3306/raon
DB_USERNAME=raon_user
DB_PASSWORD=your-db-password
```

### 11.3 코드 컨벤션

#### 11.3.1 백엔드 (Java)

```java
// 클래스명: PascalCase
public class UserService {

    // 메서드명: camelCase
    public UserResponse getUserById(Long userId) {
        // ...
    }

    // 상수: UPPER_SNAKE_CASE
    private static final int MAX_RESUME_COUNT = 5;
}
```

#### 11.3.2 프론트엔드 (JavaScript/React)

```jsx
// 컴포넌트명: PascalCase
function RaonHome() {
  // 함수명: camelCase
  const handleButtonClick = () => {
    // ...
  };

  // 상수: UPPER_SNAKE_CASE
  const MAX_FILE_SIZE = 1024 * 1024;

  return <div>...</div>;
}
```

### 11.4 디버깅 팁

#### 11.4.1 백엔드 디버깅

```java
// application-dev.properties
logging.level.com.example.raon=DEBUG
logging.level.org.springframework.security=DEBUG
```

#### 11.4.2 프론트엔드 디버깅

```jsx
// utils/logger.js
export const logger = {
  log: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Raon]', ...args);
    }
  },
  error: (...args) => {
    console.error('[Raon Error]', ...args);
  }
};
```

### 11.5 테스트 작성

#### 11.5.1 백엔드 테스트 (JUnit 5)

```java
@SpringBootTest
@Transactional
class UserServiceTest {

    @Autowired
    private UserService userService;

    @Test
    @DisplayName("사용자 생성 테스트")
    void createUser() {
        // Given
        UserRequest request = new UserRequest("test@example.com", "홍길동");

        // When
        UserResponse response = userService.createUser(request);

        // Then
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        assertThat(response.getName()).isEqualTo("홍길동");
    }
}
```

#### 11.5.2 프론트엔드 테스트 (Jest + React Testing Library)

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import RaonHome from './RaonHome';

test('시작하기 버튼 클릭 시 아바타 페이지로 이동', () => {
  render(<RaonHome />);

  const button = screen.getByText('지금 시작하기');
  fireEvent.click(button);

  expect(window.location.pathname).toBe('/avatar');
});
```

---

## 12. 학습 로드맵

### 12.1 초급 (1-2주)

- [ ] 프로젝트 구조 파악
- [ ] 백엔드 계층형 아키텍처 이해
- [ ] React 컴포넌트 구조 파악
- [ ] 데이터베이스 스키마 이해
- [ ] 로컬 환경에서 프로젝트 실행

### 12.2 중급 (3-4주)

- [ ] OAuth2 소셜 로그인 흐름 이해
- [ ] JWT 인증 메커니즘 학습
- [ ] PersoAI Live SDK 사용법 숙지
- [ ] Gemini API 통합 이해
- [ ] Spring Security 설정 분석

### 12.3 고급 (5주 이상)

- [ ] 새로운 기능 추가 (예: 새로운 챗봇 추가)
- [ ] 성능 최적화 (캐싱, 쿼리 최적화)
- [ ] 테스트 코드 작성
- [ ] Docker 배포 자동화
- [ ] 모니터링 및 로깅 시스템 구축

---

## 13. 추가 학습 자료

### 13.1 Spring Boot

- [Spring Boot 공식 문서](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Security OAuth2 가이드](https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html)
- [Spring Data JPA 가이드](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)

### 13.2 React

- [React 공식 문서](https://react.dev/)
- [React Router 가이드](https://reactrouter.com/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### 13.3 AI/ML

- [Google Gemini API 문서](https://ai.google.dev/docs)
- [PersoAI Live SDK 문서](https://est-perso-live.github.io/perso-live-sdk/)

---

## 14. FAQ

### Q1. 로컬 환경에서 OAuth2 로그인이 안 돼요

**A:** Google/Kakao Developer Console에서 Redirect URI에 `http://localhost:8086/raon/login/oauth2/code/google` (또는 kakao)를 추가해야 합니다.

### Q2. Access Token이 만료되면 어떻게 되나요?

**A:** 프론트엔드의 `fetchWithAuth` 유틸리티가 자동으로 Refresh Token을 사용하여 Access Token을 갱신합니다.

### Q3. 이력서를 6개 이상 만들 수 있나요?

**A:** 아니요. 사용자당 최대 5개로 제한되어 있습니다. `ResumeService`에서 체크합니다.

### Q4. PersoAI 세션이 끊기면 어떻게 되나요?

**A:** 세션이 끊기면 `session.on('error')` 이벤트가 발생합니다. 에러 핸들러에서 재연결 로직을 추가할 수 있습니다.

### Q5. Gemini API 호출 비용은 얼마나 되나요?

**A:** Gemini 2.5 Flash 모델의 가격은 [Google AI Studio 가격 페이지](https://ai.google.dev/pricing)를 참고하세요.

---

## 15. 기여 가이드

### 15.1 브랜치 전략

```
main (운영)
  ↓
develop (개발)
  ↓
feature/* (기능 개발)
fix/* (버그 수정)
```

### 15.2 커밋 메시지 규칙

```
<type>: <subject>

<body>

<footer>
```

**Type:**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `refactor`: 리팩토링
- `docs`: 문서 수정
- `test`: 테스트 코드

**예시:**
```
feat: 이력서 PDF 다운로드 기능 추가

- 이력서를 PDF 형식으로 다운로드 가능
- react-pdf 라이브러리 사용
- /api/resumes/{id}/download 엔드포인트 추가

Closes #123
```

### 15.3 Pull Request 템플릿

```markdown
## 변경 사항
- 변경 내용 1
- 변경 내용 2

## 테스트 방법
1. 단계 1
2. 단계 2

## 체크리스트
- [ ] 테스트 코드 작성
- [ ] 문서 업데이트
- [ ] 코드 리뷰 완료
```

---

## 결론

Raon 프로젝트는 최신 기술 스택을 활용한 AI 기반 면접 준비 플랫폼입니다. 이 학습 가이드를 통해 프로젝트의 전체 구조와 동작 원리를 이해하고, 효과적으로 기여할 수 있기를 바랍니다.

**핵심 학습 포인트:**

1. **Spring Boot 계층형 아키텍처**: Controller → Service → Repository → Domain
2. **OAuth2 소셜 로그인**: Google/Kakao OAuth2 + JWT 인증
3. **PersoAI Live SDK**: 실시간 음성 기반 AI 면접 시뮬레이션
4. **Gemini AI**: 자소서 첨삭 및 면접 피드백
5. **React SPA**: React Router + Custom Hooks + API 통신
6. **Docker 배포**: Multi-stage Build + Docker Compose + Nginx

더 궁금한 사항이 있다면 프로젝트 README나 코드 주석을 참고하세요!
