import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RaonChat.css';

const PERSOAI_API_SERVER = 'https://live-api.perso.ai';
const PERSOAI_API_KEY = process.env.REACT_APP_PERSOAI_API_KEY || 'plak-ed3f1817238abf96b6c37b3edc605f1e';
const PERSO_SDK_URL = 'https://est-perso-live.github.io/perso-live-sdk/js/v1.0.8/perso-live-sdk.js';

function RaonChatPerso({ user, isLoggedIn }) {
  const { id: chatbotId } = useParams();
  const navigate = useNavigate();

  // PersoAI SDK 관련 상태
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [persoSession, setPersoSession] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const videoRef = useRef(null);

  // 챗봇 정보
  const [chatbotInfo, setChatbotInfo] = useState(null);

  // 메시지 목록
  const [messages, setMessages] = useState([]);

  // 입력창 텍스트
  const [inputText, setInputText] = useState('');

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 메뉴 열림/닫힘
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // TTS 켜짐/꺼짐
  const [isTTSOn, setIsTTSOn] = useState(true);

  // 메시지 스크롤 ref
  const messagesEndRef = useRef(null);

  // 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 메시지 변경 시 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // PersoAI SDK 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = PERSO_SDK_URL;
    script.async = true;
    script.onload = () => {
      console.log('PersoAI SDK loaded');
      setSdkLoaded(true);
    };
    script.onerror = () => {
      setError('PersoAI SDK 로드 실패');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // 챗봇 정보 로드
  useEffect(() => {
    const loadChatbotInfo = async () => {
      try {
        setChatbotInfo({
          chatbotId: chatbotId,
          chatbotName: '기본 챗봇',
          description: 'PersoAI 기반 AI 챗봇',
          llmType: 'azure-gpt-4o',
          ttsType: 'chaehee',
          modelStyle: 'chaehee_livechat-front-white_suit-natural_loop',
          promptId: 'plp-275c194ca6b8d746d6c25a0dec3c3fdb',
          documentId: 'pld-c2104dc3d8165c42f60bcf8217c19bc8'
        });
      } catch (err) {
        console.error('Failed to load chatbot info:', err);
        setError('챗봇 정보를 불러올 수 없습니다');
      }
    };

    if (chatbotId) {
      loadChatbotInfo();
    }
  }, [chatbotId]);

  // 세션 생성 (PersoAI SDK 사용)
  const createSession = async () => {
    if (!sdkLoaded || !window.PersoLiveSDK) {
      setError('아바타 SDK가 로드되지 않았습니다');
      return;
    }

    if (!videoRef.current) {
      setError('비디오 요소가 준비되지 않았습니다');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const llmType = chatbotInfo?.llmType || 'azure-gpt-4o';
      const ttsType = chatbotInfo?.ttsType || 'yuri';
      const modelStyle = chatbotInfo?.modelStyle || 'chaehee_livechat-front-white_suit-natural_loop';
      const promptId = chatbotInfo?.promptId || 'plp-275c194ca6b8d746d6c25a0dec3c3fdb';
      const documentId = chatbotInfo?.documentId || null;

      console.log('=== Creating PersoAI Session ===');

      // SDK를 통해 세션 ID 생성
      const createdSessionId = await window.PersoLiveSDK.createSessionId(
        PERSOAI_API_SERVER,
        PERSOAI_API_KEY,
        llmType,
        ttsType,
        modelStyle,
        promptId,
        documentId,
        null, 0, 0, 1
      );
      console.log('✓ Session ID created:', createdSessionId);

      // WebRTC 세션 생성
      const session = await window.PersoLiveSDK.createSession(
        PERSOAI_API_SERVER,
        createdSessionId,
        1920, 1080, false
      );
      console.log('✓ WebRTC session created');

      // 비디오 엘리먼트에 연결
      session.setSrc(videoRef.current);

      // 비디오 요소 음성 활성화
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1.0;

        const audioTracks = videoRef.current.srcObject?.getAudioTracks() || [];
        audioTracks.forEach(track => {
          track.enabled = true;
        });

        videoRef.current.play().catch(err => {
          console.warn('Video play warning:', err.message);
        });
      }

      // 채팅 로그 구독
      session.subscribeChatLog((chatLog) => {
        // timestamp 기준 오름차순 정렬 (오래된 메시지가 위, 최신 메시지가 아래)
        const sortedChatLog = [...chatLog].sort((a, b) => a.timestamp - b.timestamp);

        const newMessages = sortedChatLog.map((chat, index) => ({
          id: chat.timestamp + index, // timestamp 기반 고유 ID
          type: chat.isUser ? 'user' : 'ai',
          text: chat.text,
          time: new Date(chat.timestamp).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        }));
        setMessages(newMessages);
      });

      // 세션 종료 이벤트 구독
      session.onClose((manualClosed) => {
        if (!manualClosed) {
          setError('세션이 예기치 않게 종료되었습니다.');
        }
        setIsSessionActive(false);
        setPersoSession(null);
      });

      setSessionId(createdSessionId);
      setPersoSession(session);
      setIsSessionActive(true);

      console.log('=== Session Setup Complete ===');

      setMessages([{
        id: 1,
        type: 'ai',
        text: '안녕! 오늘 기분은 어때? 😊',
        time: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }]);

    } catch (err) {
      setError('세션 생성 중 오류가 발생했습니다: ' + err.message);
      console.error('❌ Session creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 메시지 전송 (PersoAI SDK 사용)
  const handleSendMessage = () => {
    if (!inputText.trim() || !persoSession) return;

    const userMessage = inputText;
    setInputText('');

    // SDK를 통해 메시지 전송
    persoSession.processChat(userMessage);
  };

  // 세션 종료
  const endSession = async () => {
    if (persoSession) {
      try {
        persoSession.close();
        setPersoSession(null);
        setIsSessionActive(false);
        setMessages([]);
      } catch (err) {
        console.error('Session close error:', err);
      }
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="raon-wrapper">
      {/* 헤더 */}
      <div className="raon-header">
        <div className="raon-logo" onClick={() => navigate('/')}>RAON</div>
        <div className="raon-nav">
          <span onClick={() => navigate('/avatar')}>아바타</span>
          <span onClick={() => navigate('/chatrooms')}>채팅방</span>
          <span>요약</span>
          <span>노트</span>
          <span onClick={() => setIsMenuOpen(!isMenuOpen)}>메뉴</span>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="main-content">
        {/* 왼쪽: AI 아바타 */}
        <div className="ai-model-container">
          <div className="ai-display-box" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: isSessionActive ? 'block' : 'none'
              }}
            />
            {!isSessionActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '80px', marginBottom: '20px' }}>AI</div>
                <button
                  onClick={createSession}
                  disabled={isLoading || !chatbotId || !sdkLoaded}
                  style={{
                    padding: '12px 30px',
                    fontSize: '16px',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '25px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    cursor: isLoading || !chatbotId || !sdkLoaded ? 'not-allowed' : 'pointer',
                    opacity: isLoading || !chatbotId || !sdkLoaded ? 0.6 : 1
                  }}
                >
                  {isLoading ? '연결 중...' : '채팅 시작'}
                </button>
              </div>
            )}
          </div>
          <div className="ai-status-bar">
            <span className="status-label">상태:</span>
            <span className="status-indicator"></span>
            <span className="status-text">
              {isSessionActive ? '연결됨 🟢' : '대기 중'} | 마이크 권한 허용됨
            </span>
          </div>
        </div>

        {/* 오른쪽: 채팅 */}
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-${message.type}`}
              >
                <div className={`message-bubble-${message.type}`}>
                  {message.text}
                </div>
                <div className={`message-time-${message.type}`}>
                  {message.time}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-section">
            <div className="input-box">
              <input
                type="text"
                className="input-field"
                placeholder="메시지를 입력하세요..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!isSessionActive}
              />
              <span className="edit-icon">✏️</span>
            </div>
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!isSessionActive || !inputText.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      {/* 메뉴 오버레이 */}
      {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}

      {/* 사이드 메뉴 */}
      {isMenuOpen && (
        <div className="side-menu">
          <div className="menu-header-side">
            <h3>설정</h3>
            <button className="close-btn" onClick={() => setIsMenuOpen(false)}>×</button>
          </div>

          <div className="menu-section-side">
            <h4>TTS 음성</h4>
            <label className="switch">
              <input
                type="checkbox"
                checked={isTTSOn}
                onChange={() => setIsTTSOn(!isTTSOn)}
              />
              <span className="slider"></span>
            </label>
          </div>

          {isSessionActive && (
            <div className="menu-section-side">
              <button
                onClick={endSession}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                세션 종료
              </button>
            </div>
          )}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#fee',
          color: '#c33',
          padding: '15px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          maxWidth: '400px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#c33',
                fontSize: '20px',
                cursor: 'pointer',
                marginLeft: '15px'
              }}
            >×</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RaonChatPerso;
