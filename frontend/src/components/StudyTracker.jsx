import React, { useState, useEffect } from 'react';
import { Laptop, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BackendDeveloperTracker() {
  const [studyTime, setStudyTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [latestSections, setLatestSections] = useState([]);
  const [loading, setLoading] = useState(true);

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
          setAttempts(data.length);

          // 평균 점수 계산
          if (data.length > 0) {
            const avgScore = data.reduce((sum, feedback) => sum + Number(feedback.score), 0) / data.length;
            setTotalScore(avgScore);

            // 차트 데이터 준비 (최근 10개)
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

        if (seconds >= 60) {
          seconds = 0;
          minutes += 1;
        }

        if (minutes >= 60) {
          minutes = 0;
          hours += 1;
        }

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
    if (!isRunning) {
      setIsRunning(true);
    }
    // 면접 페이지로 이동
    window.location.href = '/avatar';
  };

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
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Attempts */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-5xl font-bold text-blue-600 mb-2">{attempts}</div>
            <div className="text-gray-600">총 먼점 횟수</div>
          </div>

          {/* Study Time */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-5xl font-bold text-blue-600 mb-2 font-mono">
              {formatTime()}
            </div>
            <div className="text-gray-600 flex items-center justify-between">
              <span>총 학습 시간</span>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full transition-colors"
              >
                {isRunning ? '일시정지' : '시작'}
              </button>
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-5xl font-bold text-blue-600 mb-2">{totalScore > 0 ? Math.round(totalScore) : 0}점</div>
            <div className="text-gray-600">평균 점수</div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-5xl font-bold text-blue-600 mb-2">92%</div>
            <div className="text-gray-600">향상도</div>
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