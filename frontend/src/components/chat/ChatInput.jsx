import React from 'react';

/**
 * 채팅 입력 컴포넌트 (텍스트 입력 + 음성 입력 + 전송 + 검색)
 */
const ChatInput = ({
  inputText,
  setInputText,
  onSendMessage,
  onToggleVoiceInput,
  isSessionActive,
  isListening,
  sttType,
  // 검색 기능 추가
  isSearchMode,
  onToggleSearchMode,
  searchResults,
  currentSearchIndex,
  onNextResult,
  onPrevResult
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSendMessage();
    }
  };

  return (
    <div className="chat-input-section">
      <div className="input-box">
        <input
          type="text"
          className="input-field"
          placeholder={isSearchMode ? "대화 내용 검색..." : "메시지를 입력하세요..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!isSearchMode && !isSessionActive}
        />
        
        {/* 검색/수정 아이콘 - 클릭 시 검색 모드 토글 */}
        <span 
          className="edit-icon" 
          onClick={onToggleSearchMode}
          style={{ cursor: 'pointer' }}
          title={isSearchMode ? "메시지 전송 모드로 전환" : "대화 내용 검색"}
        >
          {isSearchMode ? '💬' : '🔍'}
        </span>

        {/* 검색 모드일 때 검색 결과 네비게이션 */}
        {isSearchMode && searchResults && searchResults.length > 0 && (
          <div className="search-results-info">
            <button onClick={onPrevResult} className="search-nav-btn" title="이전 결과">▲</button>
            <span className="search-count">{currentSearchIndex + 1}/{searchResults.length}</span>
            <button onClick={onNextResult} className="search-nav-btn" title="다음 결과">▼</button>
          </div>
        )}
      </div>

      {/* 음성 입력 버튼 (검색 모드가 아닐 때만 표시) */}
      {!isSearchMode && sttType && (
        <button
          className="mic-btn"
          onClick={onToggleVoiceInput}
          disabled={!isSessionActive}
          style={{
            padding: '12px 18px',
            fontSize: '20px',
            border: 'none',
            borderRadius: '50%',
            background: isListening ? '#e74c3c' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            cursor: !isSessionActive ? 'not-allowed' : 'pointer',
            opacity: !isSessionActive ? 0.6 : 1,
            marginRight: '8px',
            transition: 'all 0.3s ease',
            animation: isListening ? 'pulse 1.5s infinite' : 'none'
          }}
          title={isListening ? '클릭하여 음성 입력 종료 및 전송' : '클릭하여 음성 입력 시작'}
        >
          🎤
        </button>
      )}

      {/* 전송/검색 버튼 */}
      <button
        className={`send-btn ${isSearchMode ? 'search-mode' : ''}`}
        onClick={onSendMessage}
        disabled={!isSearchMode && (!isSessionActive || !inputText.trim())}
        title={isSearchMode ? "검색" : "전송"}
      >
        {isSearchMode ? '🔍' : '➤'}
      </button>
    </div>
  );
};

export default ChatInput;