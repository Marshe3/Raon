# Raon - 챗봇 API 명세서

본 문서는 Raon 프로젝트의 챗봇 API에 대한 명세와 사용 방법을 안내합니다.

## 1. 개요

Raon 챗봇 API는 사용자와 상호작용하는 AI 챗봇 세션을 생성하고 관리하며, 음성-텍스트 변환(STT), 텍스트-음성 변환(TTS) 기능을 제공합니다.

## 2. 인증

현재 챗봇 관련 API (`/api/chat/**`)는 별도의 인증 없이 호출할 수 있도록 설정되어 있습니다.

## 3. API Endpoints

**Base URL**: `http://localhost:8080`

---

### 3.1. 챗봇 세션 관리

#### 3.1.1. 세션 생성

새로운 챗봇 세션을 시작합니다.

- **URL**: `/api/chat/sessions`
- **Method**: `POST`
- **Request Body**: `application/json`

```json
{
  "llmType": "gpt-4",
  "ttsType": "openai-tts",
  "sttType": "whisper",
  "modelStyle": "friendly",
  "prompt": "You are a helpful assistant.",
  "document": "base64-encoded-document-data",
  "capability": ["TTS", "STT"],
  "agent": "web-client"
}
```

- **Success Response (200 OK)**:

```json
{
  "sessionId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "createdAt": "2025-11-07T10:00:00Z",
  "status": "CREATED",
  "llmType": "gpt-4",
  "ttsType": "openai-tts",
  "modelStyle": "friendly"
}
```

#### 3.1.2. 세션 상태 조회

특정 세션의 현재 상태를 조회합니다.

- **URL**: `/api/chat/sessions/{sessionId}`
- **Method**: `GET`
- **Path Variable**:
  - `sessionId` (String): 조회할 세션의 ID

- **Success Response (200 OK)**:

```json
{
  "sessionId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "status": "ACTIVE",
  "llmType": "gpt-4",
  "ttsType": "openai-tts",
  "modelStyle": "friendly",
  "createdAt": "2025-11-07T10:00:00Z",
  "durationSec": 300
}
```

---

### 3.2. 메시지 전송

#### 3.2.1. 텍스트 메시지 전송

활성화된 세션에 사용자 메시지를 보내고 챗봇의 응답을 받습니다.

- **URL**: `/api/chat/sessions/{sessionId}/messages`
- **Method**: `POST`
- **Path Variable**:
  - `sessionId` (String): 메시지를 보낼 세션의 ID
- **Request Body**: `application/json`

```json
{
  "message": "오늘 날씨 어때?",
  "sessionId": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
}
```

- **Success Response (200 OK)**:

```json
{
  "message": "오늘 서울의 날씨는 맑고 기온은 15도입니다.",
  "role": "assistant",
  "timestamp": "2025-11-07T10:05:00Z",
  "success": true,
  "error": null
}
```

---

### 3.3. 음성 서비스 (STT/TTS)

#### 3.3.1. 음성을 텍스트로 변환 (STT)

Base64로 인코딩된 오디오 데이터를 텍스트로 변환합니다.

- **URL**: `/api/chat/stt`
- **Method**: `POST`
- **Request Body**: `application/json`

```json
{
  "sessionId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "audioData": "Base64-encoded-audio-string..."
}
```

- **Success Response (200 OK)**:

```json
{
  "recognizedText": "오늘 날씨 어때?",
  "success": true,
  "error": null
}
```

#### 3.3.2. 텍스트를 음성으로 변환 (TTS)

주어진 텍스트를 오디오 데이터로 변환하여 반환합니다. (반환 형식은 Base64 인코딩된 문자열 또는 오디오 파일 스트림일 수 있습니다.)

- **URL**: `/api/chat/tts`
- **Method**: `POST`
- **Request Body**: `application/json`

```json
{
  "text": "오늘 서울의 날씨는 맑습니다.",
  "sessionId": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
}
```

- **Success Response (200 OK)**:
  - `Content-Type`: `audio/mpeg` (또는 다른 오디오 형식)
  - **Body**: 오디오 바이너리 데이터

---

## 4. 에러 응답

API 호출 실패 시 공통된 에러 응답 형식을 반환합니다.

- **Error Response Body**:

```json
{
  "error": "Invalid Request",
  "message": "Session ID is required",
  "timestamp": "2025-11-07T10:10:00Z",
  "status": 400
}
```
