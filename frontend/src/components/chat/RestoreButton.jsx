import React from 'react';
import './RestoreButton.css';

function RestoreButton({ onRestore, hasRestorableHistory }) {
  if (!hasRestorableHistory) return null;

  return (
    <div className="restore-button-container">
      <button className="restore-button" onClick={onRestore}>
        <span className="restore-icon">🔄</span>
        <span className="restore-text">이전 대화 내역 복원하기</span>
      </button>
    </div>
  );
}

export default RestoreButton;
