import React, { useRef, useEffect } from 'react';

/**
 * 채팅 메시지 목록 표시 컴포넌트 (검색 기능 추가)
 * 스크롤이 항상 맨 위에 고정됨
 */
const ChatMessages = ({ messages, searchResults, currentSearchIndex, searchText }) => {
  const containerRef = useRef(null);
  const highlightedMessageRef = useRef(null);

  // ✅ 스크롤을 항상 맨 위로 고정
  useEffect(() => {
    if (containerRef.current && (!searchResults || searchResults.length === 0)) {
      containerRef.current.scrollTop = 0;
    }
  }, [messages, searchResults]);

  // 검색 결과로 스크롤 (검색 중일 때만)
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
    <div className="chat-messages" ref={containerRef}>
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
    </div>
  );
};

export default ChatMessages;