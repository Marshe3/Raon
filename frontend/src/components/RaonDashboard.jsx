// src/pages/RaonDashboard.jsx

import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function RaonDashboard({ user }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [averageRadarData, setAverageRadarData] = useState([]);
  const [latestSections, setLatestSections] = useState([]);
  const [stats, setStats] = useState({
    interviews: 0,
    score: 0,
    improvement: '0%'
  });
  const [loading, setLoading] = useState(true);
  const [selectedInterviewType, setSelectedInterviewType] = useState('전체');
  const [interviewTypes, setInterviewTypes] = useState(['전체']);

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

          // 면접 종류 추출 (DB의 interviewType 컬럼에서 직접 추출)
          const types = new Set(['전체']);
          data.forEach(feedback => {
            // null이나 빈 값이 아닌 경우만 추가
            if (feedback.interviewType && feedback.interviewType.trim() !== '') {
              types.add(feedback.interviewType);
            }
          });
          setInterviewTypes(Array.from(types));

          setFeedbacks(data);
          updateStats(data, '전체');
        }
      } catch (error) {
        console.error('면접 피드백 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  // 면접 종류 변경 시 통계 업데이트
  useEffect(() => {
    updateStats(feedbacks, selectedInterviewType);
  }, [selectedInterviewType, feedbacks]);

  // 통계 업데이트 함수
  const updateStats = (data, type) => {
    // 선택된 타입으로 필터링
    let filteredData = data;
    if (type !== '전체') {
      filteredData = data.filter(feedback => {
        return feedback.interviewType === type;
      });
    } else {
      // "전체"를 선택했을 때는 interviewType이 있는 것만 표시
      filteredData = data.filter(feedback => {
        return feedback.interviewType && feedback.interviewType.trim() !== '';
      });
    }

    setStats({
      interviews: filteredData.length,
      score: filteredData.length > 0 ? Math.round(filteredData.reduce((sum, f) => sum + Number(f.score), 0) / filteredData.length) : 0,
      improvement: '92%' // TODO: 실제 향상도 계산
    });

    // 차트 데이터 준비 (최근 10개)
    if (filteredData.length > 0) {
      const recentData = filteredData.slice(0, 10).reverse().map((feedback, index) => ({
        name: `${index + 1}회`,
        score: Number(feedback.score)
      }));
      setChartData(recentData);

      // 최근 피드백의 sections 데이터 파싱
      try {
        const latestFeedback = filteredData[0];
        const feedbackJson = JSON.parse(latestFeedback.feedbackSummary);

        if (feedbackJson.sections) {
          setLatestSections(feedbackJson.sections);

          // Radar 차트용 데이터 변환 (최근 1개)
          const radarChartData = feedbackJson.sections.map(section => ({
            subject: section.title,
            score: section.score,
            fullMark: 100
          }));
          setRadarData(radarChartData);
        }
      } catch (e) {
        console.warn('피드백 JSON 파싱 실패:', e);
        setLatestSections([]);
        setRadarData([]);
      }

      // 최근 5개 평균 계산
      try {
        const recentFive = filteredData.slice(0, 5);
        const sectionScores = {};
        let successCount = 0;

        recentFive.forEach(feedback => {
          try {
            const feedbackJson = JSON.parse(feedback.feedbackSummary);
            if (feedbackJson.sections) {
              successCount++;
              feedbackJson.sections.forEach(section => {
                if (!sectionScores[section.title]) {
                  sectionScores[section.title] = [];
                }
                sectionScores[section.title].push(section.score);
              });
            }
          } catch (e) {
            // 개별 파싱 실패는 무시
          }
        });

        if (successCount > 0) {
          const avgRadarData = Object.keys(sectionScores).map(title => ({
            subject: title,
            score: Math.round(sectionScores[title].reduce((a, b) => a + b, 0) / sectionScores[title].length),
            fullMark: 100
          }));
          setAverageRadarData(avgRadarData);
        } else {
          setAverageRadarData([]);
        }
      } catch (e) {
        console.warn('평균 계산 실패:', e);
        setAverageRadarData([]);
      }
    } else {
      setChartData([]);
      setLatestSections([]);
      setRadarData([]);
      setAverageRadarData([]);
    }
  };

  const startInterview = () => {
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

        {/* Interview Type Selector */}
        <div style={{ marginTop: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>면접 종류</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {interviewTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedInterviewType(type)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  border: selectedInterviewType === type ? 'none' : '2px solid #e5e7eb',
                  backgroundColor: selectedInterviewType === type ? '#3b82f6' : 'white',
                  color: selectedInterviewType === type ? 'white' : '#374151',
                  fontWeight: '500',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onMouseOver={(e) => {
                  if (selectedInterviewType !== type) {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedInterviewType !== type) {
                    e.target.style.backgroundColor = 'white';
                  }
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>{stats.interviews}</div>
          <div style={{ color: '#64748b' }}>총 면접 횟수</div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>{stats.score}점</div>
          <div style={{ color: '#64748b' }}>평균 점수</div>
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
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>🎯 역량 분석</h3>
          <div style={{ marginBottom: '24px' }}>
            {['적합성: 질문의 의도에 맞는 답변인가?', '구체성: 추상적이지 않고 구체적인 사례가 포함되었는가?', '논리성: 답변의 흐름이 자연스럽고 논리적인가?', '진정성: 진실이 담긴 답변인가? 외운 느낌은 없는가?', '차별성: 다른 지원자와 구별되는 본인만의 강점이 드러나는가?'].map((text, i) => (
              <div key={i} style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ fontWeight: '600', marginRight: '8px' }}>{text.split(':')[0]}:</span>
                <span style={{ color: '#64748b' }}>{text.split(':')[1]}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: averageRadarData.length > 0 ? 'repeat(2, 1fr)' : '1fr', gap: '24px' }}>
            {/* 최근 면접 */}
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', textAlign: 'center', color: '#374151' }}>최근 면접</h4>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#1e293b', fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar name="점수" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* 최근 5개 평균 */}
            {averageRadarData.length > 0 && (
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', textAlign: 'center', color: '#374151' }}>최근 5개 평균</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={averageRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#1e293b', fontSize: 12, fontWeight: 600 }} />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar name="평균" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
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
