import React, { useRef, useEffect } from 'react';

/**
 * 채팅 메시지 목록 표시 컴포넌트 (검색 기능 추가)
 */
const ChatMessages = ({ messages, searchResults, currentSearchIndex, searchText }) => {
  const messagesEndRef = useRef(null);
  const highlightedMessageRef = useRef(null);

  // 스크롤을 맨 아래로 이동 (검색 중이 아닐 때만)
  const scrollToBottom = () => {
    if (!searchResults || searchResults.length === 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 메시지 변경 시 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 검색 결과로 스크롤
  useEffect(() => {
    if (searchResults && searchResults.length > 0 && highlightedMessageRef.current) {
      highlightedMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentSearchIndex, searchResults]);

  // 검색어 하이라이트 함수
  const highlightText = (text, search) => {
    if (!search || !text) return text;

    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={index} style={{ 
              backgroundColor: '#ffeb3b', 
              fontWeight: 'bold',
              padding: '2px 4px',
              borderRadius: '3px'
            }}>
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // 현재 검색 결과인지 확인
  const isCurrentSearchResult = (messageId) => {
    if (!searchResults || searchResults.length === 0) return false;
    const currentResult = searchResults[currentSearchIndex];
    return currentResult && currentResult.messageId === messageId;
  };

  return (
    <div className="chat-messages">
      {messages.map((message) => {
        const isHighlighted = isCurrentSearchResult(message.id);
        
        return (
          <div
            key={message.id}
            className={`message-${message.type}`}
            ref={isHighlighted ? highlightedMessageRef : null}
            style={isHighlighted ? {
              backgroundColor: '#e3f2fd',
              padding: '10px',
              borderRadius: '10px',
              transition: 'all 0.3s ease',
              border: '2px solid #2196f3'
            } : {}}
          >
            <div className={`message-bubble-${message.type}`}>
              {searchText && searchResults && searchResults.length > 0 ? 
                highlightText(message.text, searchText) : 
                message.text
              }
            </div>
            <div className={`message-time-${message.type}`}>
              {message.time}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;