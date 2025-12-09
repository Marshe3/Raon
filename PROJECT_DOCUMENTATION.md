# Raon 프로젝트 상세 기술 문서

> AI 기반 취업 지원 플랫폼 - 개발자를 위한 기술 문서

**작성일:** 2025-12-08
**버전:** 2.1.0
**작성자:** Claude Code
**프로젝트:** Raon (라온)

---

## 📑 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [시스템 아키텍처](#2-시스템-아키텍처)
3. [기술 스택 상세](#3-기술-스택-상세)
4. [데이터베이스 설계](#4-데이터베이스-설계)
5. [주요 기능 구현](#5-주요-기능-구현)
6. [보안 및 인증](#6-보안-및-인증)
7. [배포 및 인프라](#7-배포-및-인프라)
8. [API 명세](#8-api-명세)
9. [코드 구조](#9-코드-구조)
10. [개발 가이드](#10-개발-가이드)
11. [트러블슈팅](#11-트러블슈팅)

---

## 1. 프로젝트 개요

### 1.1 프로젝트 소개

**Raon(라온)**은 AI 기술을 활용하여 취업 준비생들의 면접 준비와 역량 강화를 지원하는 종합 플랫폼입니다.

**핵심 가치:**
- 🎯 **AI 기반 면접 연습**: PersoAI SDK를 활용한 실시간 음성 면접 시뮬레이션
- 📝 **문서 관리**: 이력서, 자기소개서 작성 및 AI 피드백
- 📊 **학습 분석**: 면접 연습 기록 및 성과 분석
- 🔒 **보안 강화**: OAuth2 + JWT 기반 인증, Cloudflare Tunnel 보안

### 1.2 기술적 특징

1. **마이크로서비스 지향 아키텍처**
   - Frontend/Backend 완전 분리
   - Docker Compose를 통한 컨테이너 오케스트레이션

2. **클라우드 네이티브**
   - Naver Cloud Platform 기반
   - Cloudflare Tunnel을 통한 보안 강화
   - Docker 기반 배포

3. **현대적 기술 스택**
   - Spring Boot 3.4.10 (Java 21)
   - React 19.2.0
   - MySQL 8.x

---

## 2. 시스템 아키텍처

### 2.1 전체 시스템 구조

```
┌─────────────────────────────────────────────────────────────┐
│                      사용자 (클라이언트)                     │
│                                                               │
│  React SPA + PersoAI SDK + OAuth2 Client                    │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Tunnel (보안 계층)                   │
│  • SSL/TLS 암호화                                            │
│  • DDoS 방어                                                 │
│  • CDN 가속                                                  │
└─────────────────┬───────────────────────────────────────────┘
                  │ 암호화된 터널
                  ▼
┌─────────────────────────────────────────────────────────────┐
│       Naver Cloud Platform (211.188.52.153)                 │
│       Ubuntu 24.04.3 LTS                                     │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Docker Compose Network                        │  │
│  │                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│  │
│  │  │  Frontend    │◄►│  Backend     │◄►│  RAG Server  ││  │
│  │  │  (Nginx)     │  │  (Spring)    │  │  (FastAPI)   ││  │
│  │  │  Port: 80    │  │  Port: 8086  │  │  Port: 8000  ││  │
│  │  └──────────────┘  └──────┬───────┘  └──────────────┘│  │
│  │                            │ JDBC                      │  │
│  │                     ┌──────▼───────┐                  │  │
│  │                     │   MySQL      │                  │  │
│  │                     │   Port: 3306 │                  │  │
│  │                     └──────────────┘                  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 레이어별 역할

#### 2.2.1 Presentation Layer (프론트엔드)
- **기술**: React 19.2.0, Nginx
- **역할**:
  - UI/UX 제공
  - PersoAI SDK 통합 (음성 채팅)
  - OAuth2 소셜 로그인 UI
  - 상태 관리 및 라우팅

#### 2.2.2 Application Layer (백엔드)
- **기술**: Spring Boot 3.4.10
- **역할**:
  - RESTful API 제공
  - 비즈니스 로직 처리
  - 인증/인가 (JWT)
  - 외부 API 연동

#### 2.2.3 RAG Layer (RAG 시스템)
- **기술**: Python 3.11, FastAPI, ChromaDB
- **역할**:
  - 벡터 기반 유사도 검색
  - 자기소개서 예시 추천
  - AI 피드백 품질 향상
  - Gemini API 연동

#### 2.2.4 Data Layer (데이터베이스)
- **기술**: MySQL 8.x
- **역할**:
  - 영속성 데이터 저장
  - 트랜잭션 관리
  - 인덱싱 및 쿼리 최적화

#### 2.2.5 Security Layer (보안)
- **기술**: Cloudflare Tunnel, Spring Security
- **역할**:
  - 네트워크 보안
  - 애플리케이션 보안
  - 인증/인가 처리

---

## 3. 기술 스택 상세

### 3.1 백엔드 기술

#### 3.1.1 Spring Boot 3.4.10

**주요 의존성:**

```gradle
dependencies {
    // Core
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'

    // Security
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-oauth2-client'
    implementation 'io.jsonwebtoken:jjwt-api:0.12.3'

    // WebFlux (비동기 HTTP)
    implementation 'org.springframework.boot:spring-boot-starter-webflux'

    // Cache
    implementation 'org.springframework.boot:spring-boot-starter-cache'
    implementation 'com.github.ben-manes.caffeine:caffeine'

    // Database
    runtimeOnly 'com.mysql:mysql-connector-j'
}
```

**주요 기능:**
- RESTful API 구현
- JPA를 통한 ORM
- OAuth2 클라이언트 (Google, Kakao)
- JWT 토큰 기반 인증
- Caffeine 캐싱

#### 3.1.2 데이터베이스

**MySQL 8.x 설정:**

```properties
spring.datasource.url=jdbc:mysql://project-db-campus.smhrd.com:3312/Insa6_aiservice_p3_3
spring.datasource.username=Insa6_aiservice_p3_3
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

### 3.2 프론트엔드 기술

#### 3.2.1 React 19.2.0

**주요 라이브러리:**

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^6.30.1",
    "framer-motion": "^12.23.24",
    "recharts": "^3.5.1",
    "lucide-react": "^0.554.0",
    "@google/genai": "^1.30.0"
  }
}
```

**주요 기능:**
- SPA (Single Page Application)
- React Router를 통한 클라이언트 라우팅
- Framer Motion 애니메이션
- Recharts 데이터 시각화

### 3.3 배포 환경

#### 3.3.1 Infrastructure

- **클라우드**: Naver Cloud Platform
- **OS**: Ubuntu 24.04.3 LTS
- **컨테이너**: Docker 20.10+, Docker Compose v2
- **네트워크**: Cloudflare Tunnel

#### 3.3.2 Docker Compose 구성

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  backend:
    build: .
    ports:
      - "8081:8086"
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      SPRING_PROFILES_ACTIVE: prod

  mysql:
    image: mysql:8.0
    ports:
      - "3307:3306"
    volumes:
      - mysql_data:/var/lib/mysql
```

---

## 4. 데이터베이스 설계

### 4.1 ERD (Entity Relationship Diagram)

#### 4.1.1 핵심 엔티티

**1. 사용자 관리**

```sql
-- users 테이블
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    social_id VARCHAR(255) NOT NULL UNIQUE,
    social_type ENUM('GOOGLE', 'KAKAO') NOT NULL,
    email VARCHAR(255),
    nickname VARCHAR(100),
    profile_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_social (social_id, social_type)
);

-- user_oauth_tokens 테이블
CREATE TABLE user_oauth_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- refresh_tokens 테이블
CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
);
```

**2. 챗봇 및 채팅**

```sql
-- chatbots 테이블
CREATE TABLE chatbots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- chat_rooms 테이블
CREATE TABLE chat_rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200),
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
);

-- messages 테이블
CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chatroom_id BIGINT NOT NULL,
    role ENUM('USER', 'ASSISTANT') NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chatroom_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    INDEX idx_chatroom (chatroom_id),
    INDEX idx_created (created_at)
);
```

**3. 이력서 및 자기소개서**

```sql
-- resumes 테이블
CREATE TABLE resumes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    address VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- careers 테이블
CREATE TABLE careers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_id BIGINT NOT NULL,
    company VARCHAR(200),
    position VARCHAR(100),
    start_date DATE,
    end_date DATE,
    description TEXT,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

-- educations 테이블
CREATE TABLE educations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_id BIGINT NOT NULL,
    school VARCHAR(200),
    major VARCHAR(100),
    degree VARCHAR(50),
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

-- cover_letters 테이블
CREATE TABLE cover_letters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    company VARCHAR(200),
    question TEXT,
    answer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**4. 면접 및 학습**

```sql
-- interview_feedbacks 테이블
CREATE TABLE interview_feedbacks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    question TEXT,
    answer TEXT,
    feedback TEXT,
    score INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
);

-- learning_histories 테이블
CREATE TABLE learning_histories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_date DATE,
    duration INT,
    score INT,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, session_date)
);
```

### 4.2 인덱스 전략

**1. 기본 인덱스**
- Primary Key: 자동 생성
- Foreign Key: 조인 성능 향상

**2. 복합 인덱스**
```sql
-- 사용자별 날짜 조회 최적화
CREATE INDEX idx_user_date ON learning_histories(user_id, session_date);

-- 소셜 로그인 조회 최적화
CREATE INDEX idx_social ON users(social_id, social_type);

-- 토큰 만료 조회 최적화
CREATE INDEX idx_expires ON refresh_tokens(expires_at);
```

---

## 5. 주요 기능 구현

### 5.1 OAuth2 소셜 로그인

#### 5.1.1 인증 흐름

```
1. 사용자가 Google/Kakao 로그인 버튼 클릭
   ↓
2. OAuth2 Provider로 리다이렉트
   ↓
3. 사용자 동의 후 Authorization Code 발급
   ↓
4. Backend가 Authorization Code로 Access Token 교환
   ↓
5. Access Token으로 사용자 정보 조회
   ↓
6. CustomOAuth2UserService가 사용자 정보 처리
   - 신규 사용자: DB에 저장
   - 기존 사용자: 정보 업데이트
   ↓
7. JWT Token 생성 및 반환
   - Access Token (1시간)
   - Refresh Token (7일, DB 저장)
   ↓
8. Frontend에 토큰 전달 및 로컬 저장
```

#### 5.1.2 구현 코드

**SecurityConfig.java**

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/oauth2/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
                .successHandler(oAuth2SuccessHandler)
            )
            .addFilterBefore(jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

**CustomOAuth2UserService.java**

```java
@Service
public class CustomOAuth2UserService
    extends DefaultOAuth2UserService {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oauth2User = super.loadUser(userRequest);

        String registrationId = userRequest
            .getClientRegistration()
            .getRegistrationId();

        // Provider별 사용자 정보 추출
        Map<String, Object> attributes = oauth2User.getAttributes();
        String socialId = extractSocialId(registrationId, attributes);
        String email = extractEmail(registrationId, attributes);

        // 사용자 저장 또는 업데이트
        User user = userRepository
            .findBySocialIdAndSocialType(socialId,
                SocialType.valueOf(registrationId.toUpperCase()))
            .orElseGet(() -> createNewUser(socialId, email, registrationId));

        return new CustomOAuth2User(user, attributes);
    }
}
```

### 5.2 JWT 토큰 기반 인증

#### 5.2.1 토큰 구조

**Access Token Payload:**
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "iat": 1701234567,
  "exp": 1701238167,
  "type": "access"
}
```

**Refresh Token Payload:**
```json
{
  "sub": "user_id",
  "iat": 1701234567,
  "exp": 1701839367,
  "type": "refresh"
}
```

#### 5.2.2 JwtTokenProvider.java

```java
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-validity}")
    private long accessTokenValidity;

    @Value("${jwt.refresh-token-validity}")
    private long refreshTokenValidity;

    public String createAccessToken(String userId, String email) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + accessTokenValidity);

        return Jwts.builder()
            .setSubject(userId)
            .claim("email", email)
            .claim("type", "access")
            .setIssuedAt(now)
            .setExpiration(validity)
            .signWith(getSigningKey(), SignatureAlgorithm.HS512)
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

### 5.3 AI 챗봇 통합 (PersoAI SDK)

#### 5.3.1 API 자격증명 관리

**문제**: 프론트엔드에서 직접 API Key 노출
**해결**: 백엔드에서 자격증명 관리

**PersoAIController.java**

```java
@RestController
@RequestMapping("/api/persoai")
public class PersoAIController {

    @Value("${persoai.api.server}")
    private String apiServer;

    @Value("${persoai.api.key}")
    private String apiKey;

    @GetMapping("/credentials")
    public ResponseEntity<Map<String, String>> getCredentials() {
        Map<String, String> credentials = Map.of(
            "apiServer", apiServer,
            "apiKey", apiKey
        );
        return ResponseEntity.ok(credentials);
    }
}
```

**Frontend 사용:**

```javascript
// 자격증명 로드
const response = await fetch('/raon/api/persoai/credentials');
const { apiServer, apiKey } = await response.json();

// SDK 초기화
const config = await window.PersoLiveSDK.getAllSettings(
    apiServer,
    apiKey
);

// 세션 생성
const sessionId = await window.PersoLiveSDK.createSessionId(
    apiServer,
    apiKey,
    llmType,
    ttsType,
    modelStyle,
    promptId
);
```

### 5.4 Gemini API 통합

#### 5.4.1 자기소개서 피드백

```java
@Service
public class CoverLetterService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public String generateFeedback(String question, String answer) {
        String prompt = String.format(
            "다음 자기소개서 답변에 대해 피드백해주세요.\n\n" +
            "질문: %s\n" +
            "답변: %s\n\n" +
            "구체적이고 건설적인 피드백을 제공해주세요.",
            question, answer
        );

        // Gemini API 호출
        GenerativeModel model = new GenerativeModel(
            "gemini-2.0-flash-exp",
            geminiApiKey
        );

        GenerateContentResponse response = model
            .generateContent(prompt);

        return response.getText();
    }
}
```

---

## 6. 보안 및 인증

### 6.1 보안 계층

#### 6.1.1 Cloudflare Tunnel

**기능:**
- SSL/TLS 암호화
- DDoS 방어
- CDN 가속화
- 서버 IP 숨김

**설정:**
```bash
# Cloudflare Tunnel 설치
curl -L --output cloudflared.deb \
    https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

sudo dpkg -i cloudflared.deb

# 터널 생성
cloudflared tunnel create raon-tunnel

# 설정 파일
# ~/.cloudflared/config.yml
tunnel: <TUNNEL_ID>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: raon.example.com
    service: http://localhost:80
  - service: http_status:404
```

#### 6.1.2 Spring Security

**CORS 설정:**

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${allowed.origins}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(allowedOrigins.split(","))
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

### 6.2 데이터 암호화

#### 6.2.1 OAuth Token 암호화

```java
@Component
public class TokenEncryption {

    @Value("${encryption.password}")
    private String password;

    @Value("${encryption.salt}")
    private String salt;

    public String encrypt(String plainText) {
        // AES 암호화 구현
    }

    public String decrypt(String encrypted) {
        // AES 복호화 구현
    }
}
```

---

## 7. 배포 및 인프라

### 7.1 Docker 멀티 스테이지 빌드

**Backend Dockerfile:**

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
EXPOSE 8086

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
  CMD wget --no-verbose --tries=1 --spider \
      http://localhost:8086/raon/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Frontend Dockerfile:**

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 7.2 배포 자동화

**deploy.sh:**

```bash
#!/bin/bash
set -e

echo "🚀 Raon 배포 시작..."

# 환경 변수 확인
if [ ! -f .env ]; then
    echo "❌ .env 파일이 없습니다"
    exit 1
fi

# 기존 컨테이너 중지
docker compose down

# 이미지 빌드
docker compose build --no-cache

# 컨테이너 시작
docker compose up -d

# 헬스 체크
sleep 10
docker compose ps

echo "✅ 배포 완료!"
```

---

## 8. API 명세

### 8.1 인증 API

#### POST /api/auth/refresh
토큰 갱신

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzUxMi..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMi...",
  "refreshToken": "eyJhbGciOiJIUzUxMi..."
}
```

### 8.2 사용자 API

#### GET /api/users/me
현재 사용자 정보

**Response:**
```json
{
  "id": 1,
  "socialId": "123456789",
  "socialType": "GOOGLE",
  "email": "user@example.com",
  "nickname": "홍길동",
  "profileImage": "https://..."
}
```

### 8.3 챗봇 API

#### GET /api/persoai/credentials
PersoAI API 자격증명

**Response:**
```json
{
  "apiServer": "https://live-api.perso.ai",
  "apiKey": "plak-..."
}
```

---

## 9. 코드 구조

### 9.1 패키지 구조

```
com.example.raon
├── config          # 설정 클래스
├── controller      # REST API 컨트롤러
├── service         # 비즈니스 로직
├── repository      # 데이터 액세스
├── domain          # 엔티티
├── dto             # DTO
├── security        # 보안 관련
├── util            # 유틸리티
└── exception       # 예외 처리
```

### 9.2 레이어 패턴

```
Controller → Service → Repository → Database
    ↓           ↓
   DTO       Domain
```

---

## 10. 개발 가이드

### 10.1 로컬 개발 환경 설정

```bash
# 1. 저장소 클론
git clone https://github.com/Marshe3/Raon.git
cd Raon

# 2. 환경 변수 설정
cp .env.example .env

# 3. 백엔드 실행
./gradlew bootRun

# 4. 프론트엔드 실행
cd frontend
npm install
npm start
```

### 10.2 코딩 컨벤션

**Java:**
- Google Java Style Guide 준수
- Lombok 사용
- Builder 패턴 권장

**JavaScript:**
- ESLint + Prettier
- 함수형 컴포넌트 사용
- Hooks 활용

---

## 11. 트러블슈팅

### 11.1 일반적인 문제

**1. CORS 오류**
```
Access-Control-Allow-Origin 오류
→ SecurityConfig에서 allowedOrigins 확인
```

**2. JWT 토큰 만료**
```
401 Unauthorized
→ /api/auth/refresh로 토큰 갱신
```

**3. Docker 빌드 실패**
```
→ docker system prune -a
→ 캐시 삭제 후 재빌드
```

---

**문서 버전**: 2.0.0
**최종 수정일**: 2025-12-02
**작성자**: Claude Code
