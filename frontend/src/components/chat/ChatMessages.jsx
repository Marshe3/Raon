import React, { useRef, useEffect, useState } from 'react';

/**
 * 채팅 메시지 목록 표시 컴포넌트 (검색 기능 추가)
 */
const ChatMessages = ({ messages, searchResults, currentSearchIndex, searchText }) => {
  const messagesEndRef = useRef(null);
  const highlightedMessageRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const wasAtBottomRef = useRef(true); // 이전 스크롤 위치 저장

  // 사용자가 최하단에 있는지 확인
  const isAtBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    // 최하단에서 100px 이내면 true
    return scrollHeight - scrollTop - clientHeight < 100;
  };

  // 스크롤 이벤트 핸들러
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const atBottom = isAtBottom();
      setIsUserScrolling(!atBottom);
      wasAtBottomRef.current = atBottom; // 현재 스크롤 위치 저장
    }
  };

  // 메시지 변경 시 스크롤 (이전에 최하단에 있었을 때만)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (searchResults && searchResults.length > 0) return; // 검색 중이면 스크롤 안함

    // 이전에 최하단에 있었으면 자동 스크롤
    if (wasAtBottomRef.current) {
      setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }, 100); // DOM 업데이트 후 스크롤
    }
  }, [messages, searchResults]);

  // 검색 결과로 스크롤
  useEffect(() => {
    if (searchResults && searchResults.length > 0 && highlightedMessageRef.current) {
      highlightedMessageRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'  // 페이지 전체 스크롤 방지
      });
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
    <div className="chat-messages" ref={messagesContainerRef} onScroll={handleScroll}>
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