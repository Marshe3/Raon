import React, { useMemo, useState } from "react";
import "./RaonDashboard.css";

const DEFAULT_ROLES = [
  "백엔드 면접관",
  "경찰 공무원 면접관",
  "치위생사 면접관",
  "게임 개발자 면접관",
  "공기업 면접관",
  "은행 면접관",
];

// 데모 세션 (없으면 props.sessions 사용 권장)
const DEMO_SESSIONS = [
  {id:1,date:"2025-02-21T19:40:00+09:00",role:"백엔드 면접관",question:"트래픽 급증 상황에서 API 안정성을 어떻게 확보하나요?",tags:["확장성","장애대응","캐싱"],score:87,minutes:14,reviewed:true},
  {id:2,date:"2025-02-18T09:10:00+09:00",role:"경찰 공무원 면접관",question:"상황 대처 능력을 평가할 수 있는 경험을 말해보세요.",tags:["상황대처","윤리의식"],score:79,minutes:9,reviewed:false},
  {id:3,date:"2025-02-15T20:00:00+09:00",role:"치위생사 면접관",question:"구강 보건 캠페인을 기획한다면 어떤 지표를 보시겠습니까?",tags:["환자관리","커뮤니케이션"],score:88,minutes:11,reviewed:true},
  {id:4,date:"2025-01-30T14:20:00+09:00",role:"백엔드 면접관",question:"데이터베이스 인덱스 설계 시 고려사항은?",tags:["DB","성능"],score:72,minutes:8,reviewed:false},
  {id:5,date:"2025-01-20T11:00:00+09:00",role:"백엔드 면접관",question:"CQRS와 이벤트 소싱의 장단점을 비교해 주세요.",tags:["아키텍처"],score:91,minutes:13,reviewed:true},
  {id:6,date:"2024-12-22T10:10:00+09:00",role:"경찰 공무원 면접관",question:"공직 가치 중 가장 중요하다고 생각하는 것은?",tags:["공직가치","소통"],score:68,minutes:7,reviewed:false},
  {id:7,date:"2024-12-10T16:45:00+09:00",role:"치위생사 면접관",question:"환자 불안 감소를 위해 어떤 커뮤니케이션을 하나요?",tags:["환자관리","설명"],score:83,minutes:10,reviewed:true},
  {id:8,date:"2024-11-28T18:30:00+09:00",role:"백엔드 면접관",question:"서비스 장애를 복구했던 경험을 말해보세요.",tags:["장애대응","모니터링"],score:76,minutes:12,reviewed:false},
];

const ICON = {
  "백엔드 면접관": "💻",
  "경찰 공무원 면접관": "👮",
  "치위생사 면접관": "🦷",
  "게임 개발자 면접관": "🎮",
  "공기업 면접관": "🏢",
  "은행 면접관": "🏦",
};

// --- Utils ---
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const seed = (str) => { let h = 0; for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; } return (Math.sin(h) + 1) / 2; };
const fmtDate = (iso) => { const d=new Date(iso); const y=d.getFullYear(); const m=(""+(d.getMonth()+1)).padStart(2,"0"); const dd=(""+d.getDate()).padStart(2,"0"); return `${y}.${m}.${dd}`; };

// 데모용 지표 산출(실서비스에선 API의 raw 지표 사용)
const dimsFor = (session) => {
  const base = session.score;
  return {
    fit:    clamp(base - 6 + (seed("f" + session.id) - 0.5) * 20, 40, 98),
    spec:   clamp(base - 2 + (seed("s" + session.id) - 0.5) * 20, 40, 98),
    logic:  clamp(base + 1 + (seed("l" + session.id) - 0.5) * 20, 40, 98),
    comm:   clamp(base - 4 + (seed("c" + session.id) - 0.5) * 20, 40, 98),
    expert: clamp(base + 3 + (seed("e" + session.id) - 0.5) * 20, 40, 98),
  };
};

const avgDims = (list) => {
  if (!list.length) return { fit:50, spec:50, logic:50, comm:50, expert:50 };
  const s = list.map(dimsFor);
  const n = s.length;
  const sum = (k) => Math.round(s.reduce((a, b) => a + b[k], 0) / n);
  return { fit: sum("fit"), spec: sum("spec"), logic: sum("logic"), comm: sum("comm"), expert: sum("expert") };
};

const sparkline = (scores = []) => {
  if (!scores.length) return null;
  const w = 220, h = 40, p = 4;
  const xs = scores.map((_, i) => p + i * ((w - 2 * p) / (scores.length - 1 || 1)));
  const min = Math.min(...scores), max = Math.max(...scores);
  const ys = scores.map(v => h - p - (((v - min) / ((max - min) || 1)) * (h - 2 * p)));
  const d = xs.map((x, i) => `${i ? "L" : "M"}${x},${ys[i]}`).join(" ");
  // ⬇️ .at(-1) 사용 제거 (구형 환경 호환)
  const lastX = xs[xs.length - 1];
  const lastY = ys[ys.length - 1];
  return (
    <svg className="trend" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={d} fill="none" stroke="rgba(37,99,235,.8)" strokeWidth="2" />
      <circle cx={lastX} cy={lastY} r="2.8" fill="#2563eb" />
    </svg>
  );
};

const Radar = ({ values }) => {
  const cx = 110, cy = 110, R = 90;
  const pt = (i, scale) => { const ang = (-90 + i * 72) * Math.PI / 180; const r = R * scale; return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)]; };
  const levels = [0.2, 0.4, 0.6, 0.8, 1];
  const labels = ["적합성", "구체성", "논리성", "전달력", "전문성"];
  const vals = [values.fit, values.spec, values.logic, values.comm, values.expert].map(v => clamp(v / 100, 0, 1));
  const pts = vals.map((sc, i) => pt(i, sc)).map(p => p.join(",")).join(" ");
  return (
    <svg width="220" height="220" viewBox="0 0 220 220" aria-hidden>
      {levels.map((g, gi) => (
        <polygon key={gi}
          points={[0,1,2,3,4].map(i => pt(i, g).join(',')).join(' ')}
          fill={`rgba(59,130,246,${g < 1 ? .05 : .08})`}
          stroke="rgba(59,130,246,.12)"/>
      ))}
      {[0,1,2,3,4].map(i => {
        const [x,y] = pt(i,1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(15,23,42,.2)"/>;
      })}
      <polygon points={pts} fill="rgba(37,99,235,.2)" stroke="rgba(37,99,235,.8)" strokeWidth="2"/>
      {labels.map((t,i)=>{const [x,y]=pt(i,1.18); return <text key={t} x={x} y={y} fontSize="11" textAnchor="middle" fill="#0b1b3a">{t}</text>;})}
    </svg>
  );
};

const groupByRoleAll = (list, roles) => {
  const map = new Map(); roles.forEach(r => map.set(r, []));
  list.forEach(s => { if (map.has(s.role)) map.get(s.role).push(s); });
  return [...map.entries()].map(([role, items]) => ({ role, items }));
};

// ⬇️ 파일명과 동일한 컴포넌트명으로 변경(가독성/디버깅 편의)
export default function RaonDashboard({ roles = DEFAULT_ROLES, sessions = DEMO_SESSIONS, initialSort = 'asc' }){
  // controls
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortName, setSortName] = useState(initialSort); // 'asc' | 'desc'
  const [modalRole, setModalRole] = useState("");

  // filtering
  const filtered = useMemo(() => {
    let list = [...sessions];
    if (fromDate) list = list.filter(s => new Date(s.date) >= new Date(fromDate));
    if (toDate)   list = list.filter(s => new Date(s.date) <= new Date(toDate + 'T23:59:59'));
    return list;
  }, [sessions, fromDate, toDate]);

  // KPI
  const kpis = useMemo(() => {
    const total = filtered.length;
    const mins = filtered.reduce((a,b)=>a+b.minutes,0);
    const avg = Math.round(filtered.reduce((a,b)=>a+b.score,0) / Math.max(1,total));
    return { rolesCount: roles.length, total, mins, avg: isNaN(avg) ? 0 : avg };
    // ⬇️ roles.length 대신 roles 전체를 의존성으로
  }, [filtered, roles]);

  // groups
  const groups = useMemo(() => {
    let gs = groupByRoleAll(filtered, roles).map(g => {
      const scores = g.items.map(x => x.score);
      const avg = Math.round(scores.reduce((a,b)=>a+b,0)/Math.max(1,scores.length));
      const dims = g.items.length ? avgDims(g.items) : { fit:50, spec:50, logic:50, comm:50, expert:50 };
      const m = new Map(); g.items.forEach(s => s.tags.forEach(t => m.set(t, (m.get(t)||0)+1)));
      const tags = [...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,6).map(([t,c])=>({ t, c }));
      return { ...g, avg: isNaN(avg) ? 0 : avg, dims, scores, tags };
    });
    if (roleFilter) gs = gs.filter(g => g.role === roleFilter);
    gs.sort((a,b) => sortName === 'asc' ? a.role.localeCompare(b.role) : b.role.localeCompare(a.role));
    return gs;
  }, [filtered, roles, roleFilter, sortName]);

  // CSV export
  const exportCSV = () => {
    const rows = [["면접관","세션 수","평균 점수","누적 시간(m)","상위 태그"]];
    roles.forEach(role => {
      const arr = filtered.filter(s => s.role === role);
      if (!arr.length) { rows.push([role, 0, '-', 0, '-']); return; }
      const avg = Math.round(arr.reduce((a,b)=>a+b.score,0)/arr.length);
      const mins = arr.reduce((a,b)=>a+b.minutes,0);
      const m = new Map(); arr.forEach(s => s.tags.forEach(t => m.set(t,(m.get(t)||0)+1)));
      const top = [...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([t,c])=>`${t}×${c}`).join(' ');
      rows.push([role, arr.length, avg, mins, top]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'interviewer-analytics.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="raon-wrap">
      {/* Controls */}
      <div className="controls">
        <div className="control">
          <span className="label">기간</span>
          <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} />
          ~
          <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} />
        </div>
        <button className="btn" onClick={()=>setSortName(sortName==='asc'?'desc':'asc')}>
          이름순 <span className="arrow">{sortName==='asc'?'▲':'▼'}</span>
        </button>
        <button className="btn primary" onClick={exportCSV}>CSV</button>
      </div>

      {/* Catalog */}
      <div className="catalog">
        {roles.map(r => (
          <div key={r} className={`cat-card ${roleFilter===r? 'active':''}`} onClick={()=> setRoleFilter(roleFilter===r ? '' : r)}>
            <div className="icon">{ICON[r] || '⭐'}</div>
            <div>
              <div className="name">{r}</div>
              <div className="desc">{/* 필요시 역할 설명 주입 */}</div>
            </div>
          </div>
        ))}
      </div>

      {/* KPIs */}
      <div className="kpis">
        <div className="kpi"><div className="n">{kpis.rolesCount}</div><div className="l">면접관</div></div>
        <div className="kpi"><div className="n">{kpis.total}</div><div className="l">총 세션</div></div>
        <div className="kpi"><div className="n">{kpis.avg}</div><div className="l">전체 평균</div></div>
        <div className="kpi"><div className="n">{kpis.mins}m</div><div className="l">총 학습 시간</div></div>
      </div>

      {/* Role cards */}
      <div className="grid">
        {groups.map(g => (
          <div key={g.role} className="rolecard">
            <div className="left"><Radar values={g.dims}/></div>
            <div className="right">
              <div className="role-title">
                <div className="name">{g.role}</div>
                <div className="pill">세션 {g.items.length}</div>
              </div>
              <div className="statline">
                <span className="pill">평균 {g.avg}</span>
                <span className="pill">학습시간 {g.items.reduce((a,b)=>a+b.minutes,0)}m</span>
                <span className="pill">다시보기 {g.items.filter(x=>x.reviewed).length}</span>
              </div>
              <div>{sparkline(g.scores) || <div className="notes">데이터가 없습니다</div>}</div>
              <div className="tags">
                {g.tags.length ? g.tags.map(o => <span key={o.t} className="tag">#{o.t} ×{o.c}</span>) : <span className="notes">태그 데이터 없음</span>}
              </div>
              <div className="notes">
                강점 지표: <b>{Object.entries(g.dims).sort((a,b)=>b[1]-a[1])[0][0]}</b> ·
                보완 지표: <b>{Object.entries(g.dims).sort((a,b)=>a[1]-b[1])[0][0]}</b>
              </div>
              <div className="more" onClick={()=>setModalRole(g.role)}>자세히 보기</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalRole && (
        <div className="overlay" onClick={(e)=>{ if(e.target.classList.contains('overlay')) setModalRole(""); }}>
          <div className="modal">
            <div className="header">
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span className="pill">{modalRole}</span>
                <b>면접관 상세</b>
              </div>
              <button className="close" onClick={()=>setModalRole("")}>닫기</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:12}}>
              <div>
                <Radar values={avgDims(filtered.filter(s=>s.role===modalRole))}/>
              </div>
              <div>
                <div className="notes">
                  세션 {filtered.filter(s=>s.role===modalRole).length} · 평균 {
                    Math.round(filtered.filter(s=>s.role===modalRole).reduce((a,b)=>a+b.score,0)/Math.max(1,filtered.filter(s=>s.role===modalRole).length))
                  } · 누적 {filtered.filter(s=>s.role===modalRole).reduce((a,b)=>a+b.minutes,0)}m
                </div>
                <div style={{marginTop:6,fontWeight:900}}>최근 질문</div>
                <div className="sesslist">
                  {filtered.filter(s=>s.role===modalRole).sort((a,b)=> new Date(b.date)-new Date(a.date)).slice(0,6).map(s=> (
                    <div className="sess" key={s.id}>
                      <div style={{fontWeight:800}}>{fmtDate(s.date)}</div>
                      <div>{s.question}</div>
                      <div className="tags" style={{marginTop:6}}>{s.tags.map(t=> <span key={t} className="tag">{t}</span>)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
