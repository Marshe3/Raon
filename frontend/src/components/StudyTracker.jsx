import React, { useState, useEffect } from 'react';
import { Laptop, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BackendDeveloperTracker() {
  const [attempts, setAttempts] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [latestSections, setLatestSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterviewType, setSelectedInterviewType] = useState('전체');
  const [interviewTypes, setInterviewTypes] = useState(['전체']);

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

    setAttempts(filteredData.length);

    // 평균 점수 계산
    if (filteredData.length > 0) {
      const avgScore = filteredData.reduce((sum, feedback) => sum + Number(feedback.score), 0) / filteredData.length;
      setTotalScore(avgScore);

      // 차트 데이터 준비 (최근 10개)
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
        }
      } catch (e) {
        console.warn('피드백 JSON 파싱 실패:', e);
        setLatestSections([]);
      }
    } else {
      setTotalScore(0);
      setChartData([]);
      setLatestSections([]);
    }
  };

  const startInterview = () => {
    // 면접 페이지로 이동
    window.location.href = '/avatar';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Laptop className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">백엔드 개발자 학습 기록</h1>
              <p className="text-gray-600 mt-1">API 설계 · 데이터베이스 · 서버 개발</p>
            </div>
          </div>

          {/* Interview Type Selector */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">면접 종류</label>
            <div className="flex flex-wrap gap-2">
              {interviewTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedInterviewType(type)}
                  className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 outline-none ${
                    selectedInterviewType === type
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Attempts */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-5xl font-bold text-blue-600 mb-2">{attempts}</div>
            <div className="text-gray-600">총 면접 횟수</div>
          </div>

          {/* Average Score */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-5xl font-bold text-blue-600 mb-2">{totalScore > 0 ? Math.round(totalScore) : 0}점</div>
            <div className="text-gray-600">평균 점수</div>
          </div>
        </div>

        {/* Score Trend Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">점수 변화 추이</h2>
          </div>

          {/* Start Interview Button */}
          <div className="mb-6">
            <button
              onClick={startInterview}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              채팅 시작 (면접 보기)
            </button>
          </div>

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
            <div className="text-center py-12 text-gray-500">
              아직 면접 기록이 없습니다. 첫 면접을 시작해보세요!
            </div>
          )}
        </div>

        {/* Competency Analysis */}
        {latestSections.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">역량 분석 (최근 면접 기준)</h2>
            </div>

            <div className="space-y-6">
              {latestSections.map((section, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">{section.title}</span>
                    <span className="text-sm font-bold text-blue-600">{section.score}점</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${section.score}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{section.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}