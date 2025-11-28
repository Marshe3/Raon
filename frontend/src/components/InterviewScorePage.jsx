// src/pages/InterviewScorePage.jsx

import React, { useState } from "react";
import RaonDashboard from "./RaonDashboard"; // 경로는 프로젝트 구조에 맞게 수정
import "./InterviewScorePage.css";

export default function InterviewScorePage({ user }) {
  // false = 요약 화면, true = 상세 분석(RaonDashboard)
  const [showDetail, setShowDetail] = useState(false);
  const [latestScore, setLatestScore] = useState(0);
  const [totalInterviews, setTotalInterviews] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // 면접 피드백 데이터 로드
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/raon/api/interview-feedbacks', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setTotalInterviews(data.length);

          if (data.length > 0) {
            // 최근 점수 (가장 최신 피드백)
            setLatestScore(Math.round(Number(data[0].score)));

            // 평균 점수
            const avgScore = data.reduce((sum, feedback) => sum + Number(feedback.score), 0) / data.length;
            setAverageScore(Math.round(avgScore));
          }
        }
      } catch (error) {
        console.error('면접 피드백 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (showDetail) {
    // 👉 점수 확인하기 클릭 시 상세 학습 기록 화면으로 전환
    return <RaonDashboard user={user} />;
  }

  const displayName = user?.nickname || user?.name || "사용자";

  if (loading) {
    return (
      <div className="score-page">
        <div className="score-card">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="score-page">
      <div className="score-card">
        {/* 상단 타이틀 영역 */}
        <div className="score-header">
          <div className="score-icon-box">
            <span className="score-icon">📊</span>
          </div>
          <div>
            <h1 className="score-title">면접 점수 확인</h1>
            <p className="score-subtitle">최근 면접 결과 및 상세 분석</p>
          </div>
        </div>

        {/* 메인 점수 카드 */}
        <div className="score-main-card">
          <div className="score-main-inner">
            <div className="score-main-value">{latestScore}점</div>
            <div className="score-main-label">최근 면접 점수</div>
          </div>
        </div>

        {/* 총 면접 횟수 & 평균 점수 */}
        <div className="score-sub-grid">
          <div className="score-sub-card">
            <div className="score-sub-value">{totalInterviews}</div>
            <div className="score-sub-label">총 면접 횟수</div>
          </div>
          <div className="score-sub-card">
            <div className="score-sub-value">{averageScore}점</div>
            <div className="score-sub-label">평균 점수</div>
          </div>
        </div>

        {/* 버튼 */}
        <button
          className="score-check-button"
          onClick={() => setShowDetail(true)}
        >
          점수 확인하기
        </button>
      </div>
    </div>
  );
}
