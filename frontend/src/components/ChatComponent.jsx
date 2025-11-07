import React, { useState, useEffect, useRef } from 'react';
import './ChatComponent.css';

const ChatComponent = () => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api/chat';

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 세션 생성
  const createSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          llmType: 'gpt-35',
          ttsType: 'yuri',
          modelStyle: 'yoori-front-khaki_overalls-nodded_loop',
          capability: ['LLM', 'TTS', 'STT']
        }),
      });

      if (!response.ok) {
        throw new Error('세션 생성 실패');
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      setIsSessionActive(true);
      setMessages([{
        role: 'system',
        content: '채팅 세션이 시작되었습니다. 안녕하세요!',
        timestamp: new Date()
      }]);
    } catch (err) {
      setError('세션 생성 중 오류가 발생했습니다: ' + err.message);
      console.error('Session creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 메시지 전송 (스트리밍)
  const sendMessage = async () => {
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
      const response = await fetch(`${API_BASE_URL}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
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
      const response = await fetch(`${API_BASE_URL}/message/simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
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
    if (!sessionId) return;

    try {
      await fetch(`${API_BASE_URL}/session/${sessionId}`, {
        method: 'DELETE',
      });

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
      sendMessageSimple(); // 또는 sendMessage() 사용
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>🤖 AI Avatar Chat</h2>
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

      {!isSessionActive ? (
        <div className="start-session">
          <h3>채팅을 시작하려면 세션을 생성하세요</h3>
          <button 
            onClick={createSession} 
            disabled={isLoading}
            className="create-session-btn"
          >
            {isLoading ? '생성 중...' : '세션 생성'}
          </button>
        </div>
      ) : (
        <>
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
              disabled={isLoading}
              rows="3"
            />
            <button 
              onClick={sendMessageSimple}
              disabled={isLoading || !inputMessage.trim()}
              className="send-btn"
            >
              전송
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatComponent;
