import React, { useState, useEffect } from 'react';
import { Laptop, TrendingUp } from 'lucide-react';

export default function BackendDeveloperTracker() {
  const [studyTime, setStudyTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

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
    // 면접 시작 시 자동으로 시간과 횟수 증가
    setAttempts(prev => prev + 1);
    
    // 랜덤 점수 생성 (70-95점 사이)
    const newScore = Math.floor(Math.random() * 26) + 70;
    setTotalScore(prev => {
      const total = prev * (attempts) + newScore;
      return total / (attempts + 1);
    });

    alert(`면접이 시작되었습니다!\n획득 점수: ${newScore}점`);
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

        {/* Skills Analysis */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">세부 스킬 분석</h2>
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
          
          <div className="space-y-6">
            {[
              { name: 'Spring Boot', score: 88, color: 'bg-green-500' },
              { name: 'Database Design', score: 92, color: 'bg-blue-500' },
              { name: 'REST API', score: 85, color: 'bg-purple-500' },
              { name: 'System Design', score: 78, color: 'bg-orange-500' }
            ].map((skill) => (
              <div key={skill.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">{skill.name}</span>
                  <span className="text-sm font-bold text-gray-600">{skill.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`${skill.color} h-full rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}