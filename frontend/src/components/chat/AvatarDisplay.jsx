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
      </div>
    </div>
  );
};

export default AvatarDisplay;