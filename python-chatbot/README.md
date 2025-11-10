# Python Chatbot Server

Flask 기반 PersoAI 챗봇 서버 - Spring Boot 백엔드와 연동

## 설치

```bash
# 가상환경 생성 (선택사항)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt
```

## 환경 변수 설정

`.env.example`을 `.env`로 복사하고 실제 값을 입력하세요:

```bash
cp .env.example .env
```

`.env` 파일:
```
PERSOAI_API_SERVER=https://live-api.perso.ai
PERSOAI_API_KEY=your-actual-api-key
```

## 실행

```bash
python app.py
```

서버는 `http://localhost:5000`에서 실행됩니다.

## API 엔드포인트

### 1. 헬스 체크
```
GET /health
```

### 2. 세션 생성
```
POST /api/session?userId=1&chatbotId=1
Content-Type: application/json

{
  "capability": ["LLM", "TTS", "STT"]
}
```

### 3. 메시지 전송 (스트리밍)
```
POST /api/message?sessionId=<session_id>
Content-Type: application/json

{
  "message": "안녕하세요"
}
```

### 4. 세션 종료
```
DELETE /api/session/<session_id>
```

### 5. 챗봇 정보 조회
```
GET /api/chatbots/<chatbot_id>
```

## Spring Boot 연동

프론트엔드에서 Python 서버로 직접 요청하도록 환경 변수를 설정하세요:

`frontend/.env`:
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

또는 Spring Boot에서 Python 서버로 프록시하도록 설정할 수 있습니다.
