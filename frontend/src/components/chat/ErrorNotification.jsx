import React from 'react';

/**
 * 에러 알림 컴포넌트
 */
const ErrorNotification = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: '#fee',
      color: '#c33',
      padding: '15px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      maxWidth: '400px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>⚠️ {error}</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#c33',
            fontSize: '20px',
            cursor: 'pointer',
            marginLeft: '15px'
          }}
        >×</button>
      </div>
    </div>
  );
};

export default ErrorNotification;
