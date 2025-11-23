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
        width: '100%',
        height: '100%',
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
            objectPosition: 'center 10%',
            display: isSessionActive ? 'block' : 'none'
          }}
        />
        {!isSessionActive && !backgroundImage && (
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
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🤖</div>
            {avatarName && (
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                marginBottom: '10px',
                color: 'white'
              }}>
                {avatarName}
              </div>
            )}
            {personality && (
              <div style={{
                fontSize: '14px',
                marginBottom: '20px',
                color: 'rgba(255,255,255,0.8)'
              }}>
                {personality}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarDisplay;