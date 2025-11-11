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

  const messagesEndRef = useRef(null);

  // 메시지 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
          ttsType: 'yuri',
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
      console.log('Configuration:', { llmType, ttsType, modelStyle, promptId, documentId });

      // SDK를 통해 세션 ID 생성
      console.log('Step 1: Creating session ID...');
      const createdSessionId = await window.PersoLiveSDK.createSessionId(
        PERSOAI_API_SERVER,
        PERSOAI_API_KEY,
        llmType,
        ttsType,
        modelStyle,
        promptId,
        documentId,
        null, // backgroundImageKey
        0,    // chatbotLeft
        0,    // chatbotTop
        1     // chatbotHeight
      );
      console.log('✓ Session ID created:', createdSessionId);

      // WebRTC 세션 생성
      console.log('Step 2: Creating WebRTC session...');
      const session = await window.PersoLiveSDK.createSession(
        PERSOAI_API_SERVER,
        createdSessionId,
        1920, // width
        1080, // height
        false // enableVoiceChat
      );
      console.log('✓ WebRTC session created');

      // 비디오 엘리먼트에 연결
      console.log('Step 3: Connecting to video element...');
      session.setSrc(videoRef.current);
      console.log('✓ Video source set');

      // 비디오 요소 음성 활성화
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1.0;

        const audioTracks = videoRef.current.srcObject?.getAudioTracks() || [];
        audioTracks.forEach(track => {
          track.enabled = true;
        });

        videoRef.current.play().then(() => {
          console.log('✓ Video playback started');
        }).catch(err => {
          console.warn('Video play warning:', err.message);
        });
      }

      // 채팅 상태 구독
      session.subscribeChatStatus((status) => {
        const statusText = ['Available', 'Recording', 'Analyzing', 'AI Speaking'][status] || 'Unknown';
        console.log('Chat status changed:', status, `(${statusText})`);
      });

      // 채팅 로그 구독
      session.subscribeChatLog((chatLog) => {
        console.log('Chat log updated. Messages:', chatLog.length);
        const newMessages = chatLog.map(chat => ({
          id: Date.now() + Math.random(),
          type: chat.isUser ? 'user' : 'ai',
          text: chat.text,
          time: new Date(chat.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages(newMessages);
      });

      // 세션 종료 이벤트 구독
      session.onClose((manualClosed) => {
        console.log('Session closed. Manual close:', manualClosed);
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
        text: `안녕하세요! ${chatbotInfo?.chatbotName || 'AI 챗봇'}입니다. 무엇을 도와드릴까요?`,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      }]);

    } catch (err) {
      setError('세션 생성 중 오류가 발생했습니다: ' + err.message);
      console.error('❌ Session creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 메시지 전송 (PersoAI SDK 사용)
  const sendMessage = async () => {
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="raon-chat-container">
      {/* 헤더 */}
      <div className="raon-chat-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <span>←</span>
        </button>
        <h2 className="chat-title">{chatbotInfo?.chatbotName || '챗봇'}</h2>
        <button className="menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          ⋮
        </button>
      </div>

      {/* 메뉴 (사이드바) */}
      {isMenuOpen && (
        <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="menu-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="menu-header">
              <h3>설정</h3>
              <button className="close-menu" onClick={() => setIsMenuOpen(false)}>×</button>
            </div>
            <div className="menu-content">
              <div className="menu-section">
                <h4>TTS 음성</h4>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={isTTSOn}
                    onChange={() => setIsTTSOn(!isTTSOn)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {isSessionActive && (
                <div className="menu-section">
                  <button className="menu-button-item danger" onClick={endSession}>
                    세션 종료
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* 아바타 비디오 영역 */}
      <div className="avatar-video-section">
        <video
          ref={videoRef}
          className="avatar-video"
          autoPlay
          playsInline
          muted={false}
        />
        {!isSessionActive && (
          <div className="start-overlay">
            <div className="start-content">
              <h3>채팅을 시작하세요</h3>
              <p>{chatbotInfo?.description || 'AI와 대화하기'}</p>
              <button
                onClick={createSession}
                disabled={isLoading || !chatbotId || !sdkLoaded}
                className="start-button"
              >
                {isLoading ? '연결 중...' : '채팅 시작'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 메시지 영역 */}
      <div className="messages-section">
        <div className="messages-list">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-bubble ${msg.type}`}>
              <div className="message-text">{msg.text}</div>
              <div className="message-time">{msg.time}</div>
            </div>
          ))}
          {isLoading && (
            <div className="message-bubble ai">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="input-section">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          disabled={!isSessionActive || isLoading}
          rows="1"
        />
        <button
          onClick={sendMessage}
          disabled={!isSessionActive || isLoading || !inputText.trim()}
          className="send-button"
        >
          전송
        </button>
      </div>
    </div>
  );
}

export default RaonChatPerso;
