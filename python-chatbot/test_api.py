"""PersoAI API 테스트 스크립트"""
import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

PERSOAI_API_SERVER = os.getenv('PERSOAI_API_SERVER', 'https://live-api.perso.ai')
PERSOAI_API_KEY = os.getenv('PERSOAI_API_KEY')

print(f"API Server: {PERSOAI_API_SERVER}")
print(f"API Key: {PERSOAI_API_KEY[:20]}..." if PERSOAI_API_KEY else "No API Key")

# 1. 세션 생성
print("\n1. Creating session...")
session_data = {
    "llm_type": "azure-gpt-4o",
    "tts_type": "yuri",
    "stt_type": "default",
    "model_style": "chaehee_livechat-front-white_suit-natural_loop",
    "prompt": "plp-275c194ca6b8d746d6c25a0dec3c3fdb",
    "capability": ["LLM", "TTS", "STT"]
}

response = requests.post(
    f"{PERSOAI_API_SERVER}/api/v1/session/",
    headers={
        "PersoLive-APIKey": PERSOAI_API_KEY,
        "Content-Type": "application/json"
    },
    json=session_data
)

print(f"Status: {response.status_code}")
if response.status_code == 201:
    result = response.json()
    session_id = result['session_id']
    print(f"Session ID: {session_id}")

    # 1.5. 세션 시작 이벤트
    print("\n1.5. Starting session...")
    start_response = requests.post(
        f"{PERSOAI_API_SERVER}/api/v1/session/{session_id}/event/create/",
        headers={"Content-Type": "application/json"},
        json={"event": "SESSION_START", "detail": "Session started"}
    )
    print(f"Start Status: {start_response.status_code}")

    # 2. 메시지 전송
    print("\n2. Sending message...")
    chat_history = [{"role": "user", "content": "안녕하세요"}]

    response = requests.post(
        f"{PERSOAI_API_SERVER}/api/v1/session/{session_id}/llm/v2/",
        headers={"Content-Type": "application/json"},
        json={"messages": chat_history},
        stream=True
    )

    print(f"LLM API Status: {response.status_code}")
    print("\nStreaming response:")
    print("-" * 50)

    for line in response.iter_lines():
        if line:
            line_str = line.decode('utf-8')
            print(f"RAW: {line_str}")

            if line_str.startswith('data: '):
                try:
                    json_data = json.loads(line_str[6:])
                    print(f"JSON: {json_data}")
                except json.JSONDecodeError as e:
                    print(f"JSON Error: {e}")

    print("-" * 50)
else:
    print(f"Error: {response.text}")
