import React from 'react';
import './InterviewFeedbackModal.css';

/**
 * 면접 피드백 모달 컴포넌트
 * Gemini API로부터 받은 면접 피드백을 표시
 */
const InterviewFeedbackModal = ({ isOpen, onClose, feedback, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="feedback-modal-overlay" onClick={onClose}>
      <div className="feedback-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="feedback-modal-close" onClick={onClose}>✕</button>

        {isLoading ? (
          <div className="feedback-loading">
            <div className="loading-spinner"></div>
            <p>AI가 면접을 분석하고 있습니다...</p>
            <p className="loading-subtext">잠시만 기다려주세요 (약 10-15초 소요)</p>
          </div>
        ) : feedback ? (
          <div className="feedback-container">
            {/* 헤더 */}
            <div className="feedback-header">
              <h2>🎯 면접 종합 피드백</h2>
              <div className="feedback-overall-score">
                <span className="score-label">종합 점수</span>
                <span className="score-value">{feedback.overallScore}점</span>
                <span className="score-total">/ 100점</span>
              </div>
            </div>

            {/* 섹션별 평가 */}
            <div className="feedback-sections">
              <h3>📊 항목별 평가</h3>
              {feedback.sections && feedback.sections.map((section, index) => (
                <div key={index} className="feedback-section">
                  <div className="section-header">
                    <div className="section-title-group">
                      <h4>{section.title}</h4>
                      <p className="section-criteria">{section.criteria}</p>
                    </div>
                    <div className="section-score">
                      <span className="section-score-value">{section.score}</span>
                      <span className="section-score-max">/100</span>
                    </div>
                  </div>
                  <div className="section-progress-bar">
                    <div
                      className="section-progress-fill"
                      style={{ width: `${section.score}%` }}
                    ></div>
                  </div>
                  <p className="section-feedback">{section.feedback}</p>
                </div>
              ))}
            </div>

            {/* 전체 평가 요약 */}
            <div className="feedback-summary-section">
              <h3>📝 전체 평가</h3>
              <p className="feedback-summary-text">{feedback.summary}</p>
            </div>

            {/* 강점과 개선점 */}
            <div className="feedback-strengths-weaknesses">
              <div className="feedback-strengths">
                <h3>✅ 강점</h3>
                <ul>
                  {feedback.strengths && feedback.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div className="feedback-weaknesses">
                <h3>💡 개선점</h3>
                <ul>
                  {feedback.weaknesses && feedback.weaknesses.map((weakness, index) => (
                    <li key={index}>{weakness}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 버튼 */}
            <div className="feedback-actions">
              <button className="feedback-btn-close" onClick={onClose}>
                확인
              </button>
            </div>
          </div>
        ) : (
          <div className="feedback-error">
            <p>⚠️ 피드백을 불러오는 중 오류가 발생했습니다.</p>
            <button className="feedback-btn-close" onClick={onClose}>닫기</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewFeedbackModal;
