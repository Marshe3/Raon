# RAG Server - 면접 우수 답변 검색 시스템

면접 질문에 대한 유사한 우수 답변을 벡터 검색으로 찾아주는 서버입니다.

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
cd rag-server
pip install -r requirements.txt
```

### 2. 환경 변수 설정

루트 디렉토리의 `.env` 파일에 Gemini API 키가 있어야 합니다:

```
GEMINI_API_KEY=your_api_key_here
```

### 3. 서버 실행

```bash
python rag_server.py
```

서버가 http://localhost:8000 에서 실행됩니다.

### 4. 초기 데이터 추가

**새 터미널에서:**

```bash
python seed_data.py
```

50개의 우수 답변 예시가 자동으로 추가됩니다.

## 📡 API 엔드포인트

### GET /health
서버 상태 확인

**응답:**
```json
{
  "status": "ok",
  "collection_count": 50
}
```

### POST /search
유사 답변 검색

**요청:**
```json
{
  "question": "팀 프로젝트에서 갈등을 해결한 경험이 있나요?",
  "top_k": 3
}
```

**응답:**
```json
{
  "examples": [
    {
      "question": "팀 프로젝트에서 갈등을 해결한 경험이 있나요?",
      "answer": "백엔드 개발 중 API 설계 방식으로 팀원과 의견 충돌이...",
      "score": 95,
      "category": "팀워크",
      "similarity": 0.95
    },
    ...
  ]
}
```

### POST /add
우수 답변 추가

**요청:**
```json
{
  "question": "질문 내용",
  "answer": "답변 내용",
  "score": 90,
  "category": "팀워크"
}
```

### GET /stats
저장된 데이터 통계

**응답:**
```json
{
  "total_examples": 50,
  "collection_name": "interview_examples",
  "status": "ok"
}
```

## 🧪 테스트

### cURL로 검색 테스트

```bash
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"question": "팀 갈등 해결 경험?", "top_k": 3}'
```

### Python으로 테스트

```python
import requests

response = requests.post(
    "http://localhost:8000/search",
    json={"question": "팀 갈등 해결 경험?", "top_k": 3}
)
print(response.json())
```

## 🐳 Docker 실행

```bash
# 이미지 빌드
docker build -t rag-server .

# 컨테이너 실행
docker run -p 8000:8000 \
  -e GEMINI_API_KEY=your_key \
  -v $(pwd)/chroma_data:/app/chroma_data \
  rag-server
```

## 📁 디렉토리 구조

```
rag-server/
├── rag_server.py        # FastAPI 서버
├── seed_data.py         # 초기 데이터 추가 스크립트
├── requirements.txt     # Python 의존성
├── Dockerfile           # Docker 이미지 설정
├── README.md           # 이 파일
└── chroma_data/        # 벡터 데이터 저장소 (자동 생성)
```

## 🛠️ 기술 스택

- **FastAPI**: Python 웹 프레임워크
- **ChromaDB**: 벡터 데이터베이스
- **Google Generative AI**: 텍스트 임베딩 API (text-embedding-004)
- **Uvicorn**: ASGI 서버

## 🔧 Spring Boot 연동

Spring Boot에서 사용 방법:

```java
@Service
public class RagService {
    public List<ExampleAnswer> searchSimilarExamples(String question) {
        // http://localhost:8000/search 로 POST 요청
    }
}
```

자세한 내용은 `src/main/java/com/example/raon/service/RagService.java` 참고

## 📝 문제 해결

### 1. "GEMINI_API_KEY가 없습니다" 에러
→ 루트 디렉토리 `.env` 파일에 API 키 추가

### 2. "RAG 서버에 연결할 수 없습니다" 에러
→ `python rag_server.py`로 서버 먼저 실행

### 3. 포트 8000이 이미 사용 중
→ `rag_server.py` 마지막 줄의 `port=8000`을 다른 포트로 변경
