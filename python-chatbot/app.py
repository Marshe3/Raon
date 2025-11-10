"""
Flask 기반 PersoAI 챗봇 서버
Spring Boot 백엔드와 연동하여 실제 AI 챗봇 기능 제공
"""

import os
import json
from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

# PersoAI API 설정
PERSOAI_API_SERVER = os.getenv('PERSOAI_API_SERVER', 'https://live-api.perso.ai')
PERSOAI_API_KEY = os.getenv('PERSOAI_API_KEY')

# 세션 저장소 (실제로는 Redis 등 사용 권장)
sessions = {}


@app.route('/health', methods=['GET'])
def health_check():
    """헬스 체크 엔드포인트"""
    return jsonify({"status": "ok", "message": "Python chatbot server is running"})


@app.route('/api/session', methods=['POST'])
def create_session():
    """세션 생성"""
    try:
        data = request.json
        user_id = request.args.get('userId')
        chatbot_id = request.args.get('chatbotId')

        # PersoAI 세션 생성 요청
        session_data = {
            "llm_type": data.get('llm_type', 'azure-gpt-4o'),
            "tts_type": data.get('tts_type', 'yuri'),
            "stt_type": data.get('stt_type', 'default'),
            "model_style": data.get('model_style', 'chaehee_livechat-front-white_suit-natural_loop'),
            "prompt": data.get('prompt', 'plp-275c194ca6b8d746d6c25a0dec3c3fdb'),
            "capability": data.get('capability', ['LLM', 'TTS', 'STT'])
        }

        if data.get('document'):
            session_data['document'] = data['document']

        response = requests.post(
            f"{PERSOAI_API_SERVER}/api/v1/session/",
            headers={
                "PersoLive-APIKey": PERSOAI_API_KEY,
                "Content-Type": "application/json"
            },
            json=session_data
        )

        if response.status_code == 201:
            result = response.json()
            session_id = result['session_id']

            # 세션 정보 저장
            sessions[session_id] = {
                'userId': user_id,
                'chatbotId': chatbot_id,
                'history': []
            }

            # 세션 시작 이벤트 전송
            requests.post(
                f"{PERSOAI_API_SERVER}/api/v1/session/{session_id}/event/create/",
                headers={"Content-Type": "application/json"},
                json={"event": "SESSION_START", "detail": "Session started"}
            )

            return jsonify({
                "sessionId": session_id,
                "status": result.get('status'),
                "llmType": result.get('llm_type'),
                "ttsType": result.get('tts_type'),
                "modelStyle": result.get('model_style')
            }), 201
        else:
            return jsonify({"error": "Session creation failed", "details": response.text}), response.status_code

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/message', methods=['POST'])
def send_message():
    """메시지 전송 (스트리밍)"""
    try:
        session_id = request.args.get('sessionId')
        data = request.json
        message = data.get('message')

        if not session_id or session_id not in sessions:
            return jsonify({"error": "Invalid session"}), 400

        # 세션 히스토리에 사용자 메시지 추가
        session_data = sessions[session_id]
        session_data['history'].append({"role": "user", "content": message})

        # PersoAI v2 API 호출 (스트리밍)
        def generate():
            try:
                response = requests.post(
                    f"{PERSOAI_API_SERVER}/api/v1/session/{session_id}/llm/v2/",
                    headers={"Content-Type": "application/json"},
                    json={"messages": session_data['history']},
                    stream=True
                )

                ai_response = ""

                for line in response.iter_lines():
                    if line:
                        line_str = line.decode('utf-8')
                        if line_str.startswith('data: '):
                            try:
                                json_data = json.loads(line_str[6:])
                                if json_data.get('status') == 'success':
                                    sentence = json_data.get('sentence', '')
                                    if sentence:
                                        ai_response += sentence
                                        yield f"data: {sentence}\n\n"
                            except json.JSONDecodeError:
                                continue

                # 히스토리에 AI 응답 추가
                if ai_response:
                    session_data['history'].append({"role": "assistant", "content": ai_response})

                yield "data: [DONE]\n\n"

            except Exception as e:
                yield f"data: {{\"error\": \"{str(e)}\"}}\n\n"

        return Response(generate(), mimetype='text/event-stream')

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/session/<session_id>', methods=['DELETE'])
def end_session(session_id):
    """세션 종료"""
    try:
        if session_id in sessions:
            # 세션 종료 이벤트 전송
            requests.post(
                f"{PERSOAI_API_SERVER}/api/v1/session/{session_id}/event/create/",
                headers={"Content-Type": "application/json"},
                json={"event": "SESSION_END", "detail": "Session ended"}
            )

            # 세션 삭제
            del sessions[session_id]

        return '', 204

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/chatbots/<int:chatbot_id>', methods=['GET'])
def get_chatbot(chatbot_id):
    """챗봇 정보 조회 (더미 데이터 - 실제로는 DB 연동 필요)"""
    # 실제로는 Spring Boot API를 호출하거나 DB에서 조회
    chatbot_data = {
        1: {
            "chatbotId": 1,
            "chatbotName": "기본 챗봇",
            "description": "PersoAI 기본 챗봇",
            "llmType": "azure-gpt-4o",
            "ttsType": "yuri",
            "sttType": "default",
            "modelStyle": "chaehee_livechat-front-white_suit-natural_loop",
            "promptId": "plp-275c194ca6b8d746d6c25a0dec3c3fdb",
            "documentId": "pld-c2104dc3d8165c42f60bcf8217c19bc8",
            "isActive": True,
            "isPublic": True
        }
    }

    chatbot = chatbot_data.get(chatbot_id)
    if chatbot:
        return jsonify(chatbot)
    else:
        return jsonify({"error": "Chatbot not found"}), 404


if __name__ == '__main__':
    if not PERSOAI_API_KEY:
        print("⚠️  PERSOAI_API_KEY environment variable is not set!")
        print("   Please set it in .env file")
        exit(1)

    print("🚀 Starting Python Chatbot Server...")
    print(f"   API Server: {PERSOAI_API_SERVER}")
    app.run(host='0.0.0.0', port=5000, debug=True)
