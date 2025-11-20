import React, { useRef, useEffect } from 'react';

/**
 * 채팅 메시지 목록 표시 컴포넌트
 */
const ChatMessages = ({ messages }) => {
  const messagesEndRef = useRef(null);

  // 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 메시지 변경 시 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
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
  );
};

export default ChatMessages;
