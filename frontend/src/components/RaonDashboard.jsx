// src/pages/RaonDashboard.jsx

import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function RaonDashboard({ user }) {
  const [studyTime, setStudyTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [latestSections, setLatestSections] = useState([]);
  const [stats, setStats] = useState({
    interviews: 0,
    score: 0,
    improvement: '0%'
  });
  const [loading, setLoading] = useState(true);

  const displayName = user?.nickname || user?.name || "사용자";

  // 면접 피드백 데이터 로드
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch('/raon/api/interview-feedbacks', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setFeedbacks(data);
          setStats({
            interviews: data.length,
            score: data.length > 0 ? Math.round(data.reduce((sum, f) => sum + Number(f.score), 0) / data.length) : 0,
            improvement: '92%' // TODO: 실제 향상도 계산
          });

          // 차트 데이터 준비 (최근 10개)
          if (data.length > 0) {
            const recentData = data.slice(0, 10).reverse().map((feedback, index) => ({
              name: `${index + 1}회`,
              score: Number(feedback.score)
            }));
            setChartData(recentData);

            // 최근 피드백의 sections 데이터 파싱
            try {
              const latestFeedback = data[0];
              const feedbackJson = JSON.parse(latestFeedback.feedbackSummary);

              if (feedbackJson.sections) {
                setLatestSections(feedbackJson.sections);

                // Radar 차트용 데이터 변환
                const radarChartData = feedbackJson.sections.map(section => ({
                  subject: section.title,
                  score: section.score,
                  fullMark: 100
                }));
                setRadarData(radarChartData);
              }
            } catch (e) {
              console.warn('피드백 JSON 파싱 실패:', e);
            }
          }
        }
      } catch (error) {
        console.error('면접 피드백 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setStudyTime(prev => {
        let { hours, minutes, seconds } = prev;
        seconds += 1;
        if (seconds >= 60) { seconds = 0; minutes += 1; }
        if (minutes >= 60) { minutes = 0; hours += 1; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  const formatTime = () => {
    const h = studyTime.hours;
    const m = String(studyTime.minutes).padStart(2, '0');
    const s = String(studyTime.seconds).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const startInterview = () => {
    if (!isRunning) setIsRunning(true);
    window.location.href = '/avatar';
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', backgroundColor: '#f8fafc' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', backgroundColor: '#f8fafc' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>📚 학습 기록</h1>
        <p style={{ color: '#64748b' }}>{displayName}님의 면접 학습 기록입니다</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>{stats.interviews}</div>
          <div style={{ color: '#64748b' }}>총 면접 횟수</div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px', fontFamily: 'monospace' }}>{formatTime()}</div>
          <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            총 학습 시간
            <button onClick={() => setIsRunning(!isRunning)} style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '12px', border: 'none', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer' }}>{isRunning ? '일시정지' : '시작'}</button>
          </div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>{stats.score}점</div>
          <div style={{ color: '#64748b' }}>평균 점수</div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>{stats.improvement}</div>
          <div style={{ color: '#64748b' }}>향상도</div>
        </div>
      </div>

      {/* Score Trend Chart */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>📈 점수 변화 추이</h3>
        <button onClick={startInterview} style={{ width: '100%', padding: '16px', marginBottom: '24px', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', color: 'white', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>채팅 시작 (면접 보기)</button>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
            아직 면접 기록이 없습니다. 첫 면접을 시작해보세요!
          </div>
        )}
      </div>

      {/* Competency Radar Chart */}
      {radarData.length > 0 && (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>🎯 역량 분석 (최근 면접 기준)</h3>
          <div style={{ marginBottom: '24px' }}>
            {['적합성: 질문의 의도에 맞는 답변인가?', '구체성: 추상적이지 않고 구체적인 사례가 포함되었는가?', '논리성: 답변의 흐름이 자연스럽고 논리적인가?', '진정성: 진실이 담긴 답변인가? 외운 느낌은 없는가?', '차별성: 다른 지원자와 구별되는 본인만의 강점이 드러나는가?'].map((text, i) => (
              <div key={i} style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ fontWeight: '600', marginRight: '8px' }}>{text.split(':')[0]}:</span>
                <span style={{ color: '#64748b' }}>{text.split(':')[1]}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#1e293b', fontSize: 13, fontWeight: 600 }} />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar name="점수" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Analysis */}
      {latestSections.length > 0 && (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>📊 역량별 상세 분석</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            {latestSections.map((item, idx) => (
              <div key={idx} style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{item.title}</span>
                  <span style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '1.1rem' }}>{item.score}점</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '8px' }}><strong>평가 기준:</strong> {item.criteria}</p>
                <p style={{ color: '#64748b', margin: 0 }}>{item.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
