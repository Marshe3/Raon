import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ChatComponent.css';

// PersoAI SDK 로드
const PERSO_SDK_URL = 'https://est-perso-live.github.io/perso-live-sdk/js/v1.0.8/perso-live-sdk.js';

const ChatComponent = ({ user, isLoggedIn }) => {
  const { id: chatbotId } = useParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [error, setError] = useState(null);
  const [chatbotInfo, setChatbotInfo] = useState(null);
  const [persoSession, setPersoSession] = useState(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/raon/api/chat';
  const PERSOAI_API_SERVER = 'https://live-api.perso.ai';
  const PERSOAI_API_KEY = process.env.REACT_APP_PERSOAI_API_KEY || 'plak-ed3f1817238abf96b6c37b3edc605f1e';

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
      console.error('Failed to load PersoAI SDK');
      setError('아바타 SDK 로드 실패');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 로그인 체크 비활성화 (Python 서버는 로그인 불필요)
  // useEffect(() => {
  //   if (!isLoggedIn) {
  //     navigate('/login', { state: { from: `/chat/${chatbotId}` } });
  //   }
  // }, [isLoggedIn, navigate, chatbotId]);

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 챗봇 정보 로드
  useEffect(() => {
    const loadChatbotInfo = async () => {
      if (!chatbotId) return;

      try {
        const response = await fetch(`${API_BASE_URL}/chatbots/${chatbotId}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setChatbotInfo(data);
        }
      } catch (err) {
        console.error('챗봇 정보 로드 실패:', err);
      }
    };

    loadChatbotInfo();
  }, [chatbotId, API_BASE_URL]);

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
      // PersoAI 세션 생성
      const llmType = chatbotInfo?.llmType || 'azure-gpt-4o';
      const ttsType = chatbotInfo?.ttsType || 'yuri';
      const modelStyle = chatbotInfo?.modelStyle || 'chaehee_livechat-front-white_suit-natural_loop';
      const promptId = chatbotInfo?.promptId || 'plp-275c194ca6b8d746d6c25a0dec3c3fdb';
      const documentId = chatbotInfo?.documentId || null;

      console.log('=== Creating PersoAI Session ===');
      console.log('Configuration:', {
        llmType,
        ttsType,
        modelStyle,
        promptId,
        documentId
      });

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
      console.log('Video element ready state:', videoRef.current.readyState);
      console.log('Video element dimensions:', {
        width: videoRef.current.clientWidth,
        height: videoRef.current.clientHeight
      });

      session.setSrc(videoRef.current);
      console.log('✓ Video source set');

      // 비디오 요소 음성 활성화
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1.0;

        // 오디오 트랙 확인
        const audioTracks = videoRef.current.srcObject?.getAudioTracks() || [];
        console.log('Video audio enabled:', {
          muted: videoRef.current.muted,
          volume: videoRef.current.volume,
          hasAudioTracks: audioTracks.length > 0,
          audioTracks: audioTracks.map(track => ({
            id: track.id,
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState
          }))
        });

        // 오디오 트랙 명시적으로 활성화
        audioTracks.forEach(track => {
          track.enabled = true;
          console.log(`Audio track ${track.id} enabled`);
        });

        // 사용자 인터랙션 후 재생 시도
        videoRef.current.play().then(() => {
          console.log('✓ Video playback started');
        }).catch(err => {
          console.warn('Video play failed (this is normal before user interaction):', err.message);
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
          role: chat.isUser ? 'user' : 'assistant',
          content: chat.text,
          timestamp: new Date(chat.timestamp)
        }));
        setMessages(newMessages);
      });

      // 세션 종료 이벤트 구독
      session.onClose((manualClosed) => {
        console.log('Session closed. Manual close:', manualClosed);
        if (!manualClosed) {
          setError('세션이 예기치 않게 종료되었습니다.');
          // 세션 정보 조회
          window.PersoLiveSDK.getSessionInfo(PERSOAI_API_SERVER, createdSessionId)
            .then((info) => {
              console.error('Session termination reason:', info.termination_reason);
            })
            .catch(err => console.error('Failed to get session info:', err));
        }
        setIsSessionActive(false);
        setPersoSession(null);
      });

      setSessionId(createdSessionId);
      setPersoSession(session);
      setIsSessionActive(true);

      console.log('=== Session Setup Complete ===');

      setMessages([{
        role: 'system',
        content: `${chatbotInfo?.chatbotName || 'AI 챗봇'}과의 대화를 시작합니다!`,
        timestamp: new Date()
      }]);

    } catch (err) {
      setError('세션 생성 중 오류가 발생했습니다: ' + err.message);
      console.error('❌ Session creation error:', err);
      console.error('Error stack:', err.stack);
    } finally {
      setIsLoading(false);
    }
  };

  // 메시지 전송 (PersoAI SDK 사용)
  const sendMessage = async () => {
    if (!inputMessage.trim() || !persoSession) return;

    const userMessage = inputMessage;
    setInputMessage('');

    setIsLoading(true);

    try {
      // PersoAI SDK를 통해 메시지 전송
      persoSession.processChat(userMessage);
    } catch (err) {
      setError('메시지 전송 중 오류가 발생했습니다: ' + err.message);
      console.error('Message send error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 이전 메시지 전송 함수 (백업용)
  const sendMessageOld = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    const userMessage = inputMessage;
    setInputMessage('');

    // 사용자 메시지 추가
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/message?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage
        }),
      });

      if (!response.ok) {
        throw new Error('메시지 전송 실패');
      }

      // Server-Sent Events 스트리밍 처리
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessage = '';
      let assistantMessageAdded = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.substring(5).trim();
            if (data) {
              aiMessage += data;
              
              // 첫 청크에서 메시지 추가
              if (!assistantMessageAdded) {
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: data,
                  timestamp: new Date()
                }]);
                assistantMessageAdded = true;
              } else {
                // 이후 청크로 메시지 업데이트
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    ...newMessages[newMessages.length - 1],
                    content: aiMessage
                  };
                  return newMessages;
                });
              }
            }
          }
        }
      }
    } catch (err) {
      setError('메시지 전송 중 오류가 발생했습니다: ' + err.message);
      console.error('Message send error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 메시지 전송 (간단한 버전 - 스트리밍 없음)
  const sendMessageSimple = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    const userMessage = inputMessage;
    setInputMessage('');
    
    // 사용자 메시지 추가
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/message?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage
        }),
      });

      if (!response.ok) {
        throw new Error('메시지 전송 실패');
      }

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(data.timestamp)
        }]);
      } else {
        throw new Error(data.error || '알 수 없는 오류');
      }
    } catch (err) {
      setError('메시지 전송 중 오류가 발생했습니다: ' + err.message);
      console.error('Message send error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 세션 종료
  const endSession = async () => {
    try {
      if (persoSession) {
        persoSession.stopSession();
        setPersoSession(null);
      }

      setSessionId(null);
      setIsSessionActive(false);
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error('Session end error:', err);
    }
  };

  // Enter 키로 전송
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(); // 스트리밍 방식 사용
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={() => navigate(-1)} className="back-btn">← 뒤로</button>
        <h2>🤖 {chatbotInfo?.chatbotName || 'AI 챗봇'}</h2>
        {isSessionActive && (
          <button onClick={endSession} className="end-session-btn">
            세션 종료
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <>
        {/* 아바타 비디오 - 항상 렌더링 */}
        <div className="avatar-container">
          <video
            ref={videoRef}
            className="avatar-viewer"
            autoPlay
            playsInline
            muted={false}
            controls
          />
          {!isSessionActive && (
            <div className="start-session-overlay">
              <div className="start-session-content">
                <h3>채팅을 시작하려면 세션을 생성하세요</h3>
                {chatbotInfo && (
                  <div className="chatbot-info">
                    <p><strong>설명:</strong> {chatbotInfo.description}</p>
                    <p><strong>모델:</strong> {chatbotInfo.llmType}</p>
                  </div>
                )}
                <button
                  onClick={createSession}
                  disabled={isLoading || !chatbotId}
                  className="create-session-btn"
                >
                  {isLoading ? '생성 중...' : '채팅 시작'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="messages-container">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.role}`}
            >
              <div className="message-header">
                <span className="message-role">
                  {msg.role === 'user' ? '👤 You' :
                   msg.role === 'assistant' ? '🤖 AI' : 'ℹ️ System'}
                </span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString('ko-KR')}
                </span>
              </div>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
            disabled={isLoading || !isSessionActive}
            rows="3"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim() || !isSessionActive}
            className="send-btn"
          >
            전송
          </button>
        </div>
      </>
    </div>
  );
};

export default ChatComponent;
