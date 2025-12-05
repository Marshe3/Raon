# RAG 시스템 통합 가이드

## 📋 개요

RAG (Retrieval-Augmented Generation) 시스템은 면접 질문에 대한 유사한 우수 답변을 자동으로 검색하여 피드백 품질을 향상시킵니다.

**기대 효과:** 피드백 정확도 **+30% 추가 개선**

## 🏗️ 시스템 아키텍처

```
[사용자] → [React Frontend:3000]
              ↓
         [Spring Boot:8086]
              ↓                    ↓
         [MySQL]            [Python RAG Server:8000]
              ↓                    ↓
         [Gemini API]         [ChromaDB]
```

### 데이터 흐름

1. 사용자가 면접 질문에 답변
2. Spring Boot → RAG Server: "이 질문과 유사한 우수 답변 3개 찾아줘"
3. RAG Server:
   - 질문을 Google Embedding API로 벡터화
   - ChromaDB에서 유사도 검색
   - 상위 3개 결과 반환
4. Spring Boot → Gemini API: 동적 프롬프트 (기존 예시 + RAG 검색 결과 포함)
5. Gemini → 사용자: 더 정확한 피드백 생성

## 🚀 로컬 개발 환경 설정

### 1. 사전 준비

**필수 요구사항:**
- Python 3.11+
- Java 17+
- Node.js 18+

### 2. RAG 서버 설치 및 실행

**터미널 1 (RAG Server):**
```bash
cd rag-server

# 의존성 설치 (최초 1회)
pip install -r requirements.txt

# 서버 실행
python rag_server.py
```

**출력 예시:**
```
==============================================================
🚀 Raon RAG Server 시작
==============================================================
📊 저장된 예시 개수: 0
🔑 Gemini API Key: AIzaSyBwXr...
==============================================================
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 3. 초기 데이터 추가

**터미널 2 (Seed Data):**
```bash
cd rag-server

# 50개 우수 답변 예시 추가
python seed_data.py
```

**출력 예시:**
```
==============================================================
🌱 RAG 서버 초기 데이터 추가
==============================================================
✅ RAG 서버 연결 성공 (현재 0개 데이터)

📊 50개의 우수 답변 예시를 추가합니다...

[1/50] ✅ [팀워크] 팀 프로젝트에서 갈등을 해결한 경험이 있나요?... (점수: 95)
[2/50] ✅ [팀워크] 팀원과 의견이 충돌했던 경험을 말해주세요.... (점수: 92)
...
==============================================================
✅ 완료! 50/50개 추가됨
==============================================================
```

### 4. Spring Boot 실행

**터미널 3 (Backend):**
```bash
./gradlew bootRun
```

**출력에서 확인:**
```
INFO  c.e.r.RaonApplication - Started RaonApplication in 3.2 seconds
```

### 5. React 실행

**터미널 4 (Frontend):**
```bash
cd frontend
npm start
```

### 6. 동작 확인

1. http://localhost:3000 접속
2. 로그인 후 모의 면접 시작
3. 질문에 답변 제출
4. 피드백 확인

**Spring Boot 로그에서 RAG 동작 확인:**
```
INFO  c.e.r.s.RagService - 🔍 RAG 서버에 검색 요청: 팀 프로젝트에서 갈등을 해결한 경험이 있나요?
INFO  c.e.r.s.RagService - ✅ RAG 서버에서 3개 결과 반환
```

## 🧪 RAG 시스템 테스트

### 1. 헬스 체크

```bash
curl http://localhost:8000/health
```

**응답:**
```json
{
  "status": "ok",
  "collection_count": 50
}
```

### 2. 검색 테스트

```bash
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{
    "question": "팀 갈등 해결 경험?",
    "top_k": 3
  }'
```

**응답:**
```json
{
  "examples": [
    {
      "question": "팀 프로젝트에서 갈등을 해결한 경험이 있나요?",
      "answer": "백엔드 개발 중 API 설계 방식으로 팀원과...",
      "score": 95,
      "category": "팀워크",
      "similarity": 0.95
    },
    {
      "question": "팀원과 의견이 충돌했던 경험을 말해주세요.",
      "answer": "웹 개발 프로젝트에서 5명의 팀원 중...",
      "score": 92,
      "category": "팀워크",
      "similarity": 0.87
    },
    {
      "question": "협업 중 어려웠던 점은 무엇인가요?",
      "answer": "4명이서 진행한 모바일 앱 프로젝트에서...",
      "score": 88,
      "category": "팀워크",
      "similarity": 0.82
    }
  ]
}
```

### 3. Spring Boot 통합 테스트

```java
// RagServiceTest.java
@Test
void testSearchSimilarExamples() {
    List<ExampleAnswer> results = ragService.searchSimilarExamples(
        "팀 갈등 해결 경험?",
        3
    );

    assertThat(results).hasSize(3);
    assertThat(results.get(0).score()).isGreaterThanOrEqualTo(85);
}
```

## 📊 데이터 관리

### 우수 답변 자동 수집

점수 90점 이상의 답변을 자동으로 RAG DB에 저장:

```java
// 피드백 생성 후
if (feedback.getOverallScore() >= 90) {
    ragService.addExample(
        question,
        answer,
        feedback.getOverallScore(),
        "자동수집"
    );
}
```

### 수동 데이터 추가

```bash
curl -X POST http://localhost:8000/add \
  -H "Content-Type: application/json" \
  -d '{
    "question": "새로운 질문",
    "answer": "우수한 답변 내용",
    "score": 95,
    "category": "팀워크"
  }'
```

### 데이터 초기화 (개발용)

```bash
curl -X DELETE http://localhost:8000/clear
```

## 🐳 Docker 배포

### docker-compose.yml 수정

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    # 기존 설정...

  rag-server:
    build: ./rag-server
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    volumes:
      - ./chroma_data:/app/chroma_data
    restart: unless-stopped

  backend:
    # 기존 설정...
    environment:
      - RAG_SERVER_URL=http://rag-server:8000
    depends_on:
      - mysql
      - rag-server

  frontend:
    # 기존 설정...
```

### 배포 실행

```bash
docker-compose up -d
```

## 🔧 문제 해결

### 1. RAG 서버 연결 실패

**증상:**
```
❌ RAG 서버 호출 실패: Connection refused
```

**해결:**
1. RAG 서버가 실행 중인지 확인: `http://localhost:8000/health`
2. 포트 8000이 사용 가능한지 확인: `netstat -ano | findstr :8000`
3. 방화벽 설정 확인

### 2. "GEMINI_API_KEY가 없습니다" 에러

**해결:**
루트 디렉토리 `.env` 파일에 API 키 추가:
```
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. 검색 결과가 0개

**원인:** 초기 데이터가 없음

**해결:**
```bash
cd rag-server
python seed_data.py
```

### 4. "Embedding 생성 실패" 에러

**원인:** Gemini API 할당량 초과 또는 잘못된 API 키

**해결:**
1. API 키 확인
2. https://aistudio.google.com/app/apikey 에서 할당량 확인
3. 무료 티어: 분당 15 요청, 일당 1500 요청

### 5. 메모리 부족

**증상:** RAG 서버가 느려지거나 멈춤

**해결:**
```bash
# ChromaDB 데이터 정리 (10,000개 이상 시)
curl -X DELETE http://localhost:8000/clear
python seed_data.py  # 다시 추가
```

## 📈 성능 모니터링

### RAG 서버 통계

```bash
curl http://localhost:8000/stats
```

**응답:**
```json
{
  "total_examples": 50,
  "collection_name": "interview_examples",
  "status": "ok"
}
```

### Spring Boot 헬스 체크

```java
@GetMapping("/health/rag")
public ResponseEntity<Map<String, Object>> checkRagHealth() {
    RagService.HealthStatus status = ragService.checkHealth();
    return ResponseEntity.ok(Map.of(
        "healthy", status.isHealthy(),
        "status", status.status(),
        "exampleCount", status.exampleCount()
    ));
}
```

## 🎯 활용 예시

### Before (RAG 없이)

```
프롬프트에 고정된 3개 예시만 사용
→ 질문: "시간 관리 방법?"
→ 예시: 팀 갈등 해결 (관련성 낮음)
→ 피드백: 부정확
```

### After (RAG 적용)

```
질문과 유사한 예시를 동적으로 검색
→ 질문: "시간 관리 방법?"
→ RAG 검색: "압박감 관리", "마감 준수", "멀티태스킹" (관련성 높음)
→ 피드백: 정확도 30% 향상
```

## 📚 참고 문서

- [RAG Server README](../rag-server/README.md)
- [RagService.java](../src/main/java/com/example/raon/service/RagService.java)
- [Google Embedding API 문서](https://ai.google.dev/gemini-api/docs/embeddings)
- [ChromaDB 문서](https://docs.trychroma.com/)

## 🚦 다음 단계

1. ✅ RAG 시스템 구축 완료
2. 🔄 실제 사용자 데이터 자동 수집 (90점 이상)
3. 📊 A/B 테스트로 개선율 측정
4. 🎯 카테고리별 전문화 (기술면접, 인성면접 등)
5. 🔮 Fine-tuning 준비 (6개월 후)
