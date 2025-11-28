// src/pages/RaonDashboard.jsx

import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DEFAULT_ROLES = [
  { key: "backend", name: "백엔드 면접관", icon: "💻" },
  { key: "public", name: "공기업 면접관", icon: "🏢" },
];

const DEMO_DATA = {
  backend: {
    name: "백엔드 개발자",
    icon: "💻",
    subtitle: "API 설계 · 데이터베이스 · 서버 개발",
    stats: { interviews: 24, hours: 0, minutes: 0, seconds: 0, score: 85, improvement: "92%" },
    dimensions: { fit: 85, spec: 82, logic: 87, sincerity: 84, material: 81 },
    skills: [
      { icon: "⚙️", name: "Spring Boot", score: 88, desc: "Spring Framework를 활용한 백엔드 개발 능력이 우수하며 RESTful API 설계에 능숙합니다." },
      { icon: "🔌", name: "RESTful API", score: 85, desc: "HTTP 메서드를 적절히 활용하고 명확한 엔드포인트 설계 능력을 보여줍니다." },
      { icon: "🗄️", name: "데이터베이스 MySQL", score: 82, desc: "데이터베이스 설계와 쿼리 최적화에 대한 이해도가 높고 정규화를 잘 적용합니다." },
      { icon: "🔐", name: "보안 & 인증 JWT/OAuth2", score: 79, desc: "인증 및 인가 시스템 구현 능력이 있으며 보안에 대한 관심이 높습니다." },
      { icon: "⚡", name: "성능 최적화", score: 76, desc: "병목 구간 분석과 캐싱 전략을 통한 성능 개선에 노력하고 있습니다." },
      { icon: "🐛", name: "테스트 & 디버깅", score: 80, desc: "체계적인 테스트 작성과 효율적인 디버깅으로 코드 품질을 관리합니다." },
    ],
    analysis: [
      { label: "적합성", score: 85, desc: "백엔드 개발자로서 필요한 기술적 역량과 문제 해결 능력을 질문에 맞춰 효과적으로 전달합니다." },
      { label: "구체성", score: 82, desc: "실제 프로젝트 경험을 구체적인 기술 스택과 함께 설명하는 능력이 좋습니다." },
      { label: "논리성", score: 87, desc: "기술적 의사결정 과정을 논리적으로 설명하며, 왜 특정 기술을 선택했는지 명확한 근거를 제시합니다." },
      { label: "진정성", score: 84, desc: "기술에 대한 진정한 관심과 학습 의욕이 느껴집니다." },
      { label: "자료성", score: 81, desc: "다른 지원자와 차별화되는 프로젝트 경험과 기술적 고민이 있습니다." },
    ],
  },
  public: {
    name: "공기업",
    icon: "🏢",
    subtitle: "조직 적합성 · 직무 이해 · 공공성",
    stats: { interviews: 26, hours: 0, minutes: 0, seconds: 0, score: 86, improvement: "94%" },
    dimensions: { fit: 88, spec: 84, logic: 86, sincerity: 89, material: 84 },
    skills: [
      { icon: "🎯", name: "조직 이해 & 적합성", score: 90, desc: "공기업의 사회적 역할과 가치를 이해하고 조직 문화에 잘 적응할 수 있습니다." },
      { icon: "📊", name: "직무 전문성", score: 85, desc: "지원 직무에 대한 이해도가 높고 관련 지식과 경험을 갖추고 있습니다." },
      { icon: "🤝", name: "협업 & 소통 능력", score: 87, desc: "다양한 이해관계자와 원활히 소통하고 협력하는 능력이 뛰어납니다." },
      { icon: "💼", name: "문제 해결 능력", score: 83, desc: "복잡한 업무 상황에서 체계적으로 문제를 분석하고 해결책을 제시합니다." },
      { icon: "📈", name: "경영 & 분석 능력", score: 82, desc: "데이터 분석과 전략적 사고로 조직의 성과 향상에 기여할 수 있습니다." },
      { icon: "⚖️", name: "공공성 & 윤리의식", score: 91, desc: "공공의 이익을 최우선으로 하는 공공성과 윤리 의식이 투철합니다." },
    ],
    analysis: [
      { label: "적합성", score: 88, desc: "공기업 인재상에 부합하는 가치관과 태도를 명확히 보여주고 있습니다." },
      { label: "구체성", score: 84, desc: "인턴십이나 프로젝트 경험을 구체적인 성과와 함께 설명합니다." },
      { label: "논리성", score: 86, desc: "지원 동기와 경력 계획이 논리적으로 연결되어 설득력이 있습니다." },
      { label: "진정성", score: 89, desc: "공기업에서 일하고자 하는 진심 어린 동기와 열정이 잘 전달됩니다." },
      { label: "자료성", score: 84, desc: "공공성을 실천한 경험과 차별화된 강점을 효과적으로 어필합니다." },
    ],
  },
};

const Radar = ({ values }) => {
  const cx = 110, cy = 110, R = 90;
  const pt = (i, scale) => {
    const ang = (-90 + i * 72) * Math.PI / 180;
    const r = R * scale;
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  };
  const levels = [0.2, 0.4, 0.6, 0.8, 1];
  const labels = ["적합성", "구체성", "논리성", "진정성", "자료성"];
  const vals = [(values?.fit ?? 0) / 100, (values?.spec ?? 0) / 100, (values?.logic ?? 0) / 100, (values?.sincerity ?? 0) / 100, (values?.material ?? 0) / 100];
  const pts = vals.map((sc, i) => pt(i, sc)).map((p) => p.join(",")).join(" ");

  return (
    <svg width="450" height="450" viewBox="0 0 220 220">
      {levels.map((g, gi) => <polygon key={gi} points={[0, 1, 2, 3, 4].map((i) => pt(i, g).join(",")).join(" ")} fill="none" stroke="#e2e8f0" strokeWidth="1.5" />)}
      {[0, 1, 2, 3, 4].map((i) => { const [x, y] = pt(i, 1); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1.5" />; })}
      <polygon points={pts} fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="2.5" />
      {vals.map((sc, i) => { const [x, y] = pt(i, sc); return <circle key={i} cx={x} cy={y} r="5" fill="#3b82f6" />; })}
      {labels.map((t, i) => { const [x, y] = pt(i, 1.18); return <text key={t} x={x} y={y} fontSize="13" fontWeight="600" textAnchor="middle" fill="#1e293b">{t}</text>; })}
    </svg>
  );
};

export default function RaonDashboard({ user }) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("backend");
  const [studyTime, setStudyTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [interviews, setInterviews] = useState(DEMO_DATA.backend.stats.interviews);
  const [totalScore, setTotalScore] = useState(DEMO_DATA.backend.stats.score);
  const displayName = user?.nickname || user?.name || "사용자";

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
    setInterviews(prev => prev + 1);
    const newScore = Math.floor(Math.random() * 26) + 70;
    setTotalScore(prev => Math.round((prev * interviews + newScore) / (interviews + 1)));
    
    // 선택된 면접관에 따라 다른 채팅방으로 이동
    // backend: 1번, public: 5번
    const chatId = selectedRole === 'backend' ? 1 : 5;
    navigate(`/chat/${chatId}`);
  };

  const attendedRoles = useMemo(() => DEFAULT_ROLES, []);
  const currentData = DEMO_DATA[selectedRole];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', backgroundColor: '#f8fafc' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>📚 학습 기록</h1>
        <p style={{ color: '#64748b' }}>{displayName}님이 학습한 면접 기록을 확인하세요</p>
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>{displayName}님이 본 면접관</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {attendedRoles.map((role) => (
          <div key={role.key} style={{ backgroundColor: selectedRole === role.key ? '#3b82f6' : 'white', color: selectedRole === role.key ? 'white' : '#1e293b', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'all 0.3s', border: selectedRole === role.key ? '2px solid #3b82f6' : '2px solid transparent' }} onClick={() => setSelectedRole(role.key)}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{role.icon}</div>
            <div style={{ fontWeight: '600' }}>{role.name}</div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '2px solid #e2e8f0', margin: '32px 0' }} />

      {currentData && (
        <div>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '8px' }}>
              <span style={{ marginRight: '8px' }}>{currentData.icon}</span>
              {currentData.name} 학습 기록
            </h2>
            <p style={{ color: '#64748b' }}>{currentData.subtitle}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>{interviews}</div>
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
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>{totalScore}점</div>
              <div style={{ color: '#64748b' }}>평균 점수</div>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>{currentData.stats.improvement}</div>
              <div style={{ color: '#64748b' }}>향상도</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>📈 세부 스킬 분석</h3>
            <button onClick={startInterview} style={{ width: '100%', padding: '16px', marginBottom: '24px', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', color: 'white', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>채팅 시작 (면접 보기)</button>
            <div style={{ display: 'grid', gap: '16px' }}>
              {currentData.skills.map((skill, idx) => (
                <div key={idx} style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '2rem', marginRight: '12px' }}>{skill.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{skill.name}</span>
                        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{skill.score}점</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${skill.score}%`, height: '100%', backgroundColor: '#3b82f6', transition: 'width 1s ease-out' }} />
                      </div>
                    </div>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{skill.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>🎯 역량 분석</h3>
            <div style={{ marginBottom: '24px' }}>
              {['적합성: 질문의 의도에 맞는 답변인가?', '구체성: 추상적이지 않고 구체적인 사례가 포함되었는가?', '논리성: 답변의 흐름이 자연스럽고 논리적인가?', '진정성: 진실이 담긴 답변인가? 외운 느낌은 없는가?', '자료성: 다른 지원자와 구별되는 본인만의 강점이 드러나는가?'].map((text, i) => (
                <div key={i} style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontWeight: '600', marginRight: '8px' }}>{text.split(':')[0]}:</span>
                  <span style={{ color: '#64748b' }}>{text.split(':')[1]}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}><Radar values={currentData.dimensions} /></div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>📊 역량별 상세 분석</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              {currentData.analysis.map((item, idx) => (
                <div key={idx} style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{item.label}</span>
                    <span style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '1.1rem' }}>{item.score}점</span>
                  </div>
                  <p style={{ color: '#64748b', margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}