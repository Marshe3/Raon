import React from 'react';

/**
 * AI 아바타 비디오 표시 컴포넌트
 */
const AvatarDisplay = ({
  videoRef,
  isSessionActive,
  isLoading,
  backgroundImage,
  avatarName,
  personality,
  isTTSOn,
  setIsTTSOn,
  onStartSession,
  chatbotId,
  sdkConfig,
  sdkLoaded
}) => {
  return (
    <div className="ai-model-container">
      <div className="ai-display-box" style={{
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
        ...(backgroundImage && !isSessionActive ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {})
      }}>
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
            textAlign: 'center',
            backgroundColor: backgroundImage ? 'rgba(0, 0, 0, 0.3)' : 'transparent'
          }}>
            {!backgroundImage && (
              <div style={{ fontSize: '80px', marginBottom: '20px' }}>AI</div>
            )}
            {avatarName && (
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                marginBottom: '10px',
                color: backgroundImage ? 'white' : 'inherit',
                textShadow: backgroundImage ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
              }}>
                {avatarName}
              </div>
            )}
            {personality && (
              <div style={{
                fontSize: '14px',
                marginBottom: '20px',
                color: backgroundImage ? 'white' : '#666',
                textShadow: backgroundImage ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
              }}>
                {personality}
              </div>
            )}
            <button
              onClick={onStartSession}
              disabled={isLoading || (!chatbotId && !sdkConfig) || !sdkLoaded}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '25px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: isLoading || (!chatbotId && !sdkConfig) || !sdkLoaded ? 'not-allowed' : 'pointer',
                opacity: isLoading || (!chatbotId && !sdkConfig) || !sdkLoaded ? 0.6 : 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
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

      {/* TTS 토글 */}
      <div className="tts-toggle-container">
        <span className="tts-label">TTS 음성</span>
        <label className="tts-switch">
          <input
            type="checkbox"
            checked={isTTSOn}
            onChange={() => setIsTTSOn(!isTTSOn)}
          />
          <span className="tts-slider"></span>
        </label>
      </div>
    </div>
  );
};

export default AvatarDisplay;
