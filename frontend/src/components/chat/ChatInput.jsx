import React from 'react';

/**
 * 채팅 입력 컴포넌트 (텍스트 입력 + 음성 입력 + 전송)
 */
const ChatInput = ({
  inputText,
  setInputText,
  onSendMessage,
  onToggleVoiceInput,
  isSessionActive,
  isListening,
  sttType
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
          placeholder="메시지를 입력하세요..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!isSessionActive}
        />
        <span className="edit-icon">✏️</span>
      </div>
      {sttType && (
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
      <button
        className="send-btn"
        onClick={onSendMessage}
        disabled={!isSessionActive || !inputText.trim()}
      >
        ➤
      </button>
    </div>
  );
};

export default ChatInput;
