import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string ?? 'sajuai2025';

interface AnalysisLog {
  time: string;
  mbti: string;
  gender: string;
  birthDecade: string;
}

interface AdminStats {
  totalAnalyses: number;
  totalPayments: number;
  logs: AnalysisLog[];
}

function getStats(): AdminStats {
  const totalAnalyses = parseInt(localStorage.getItem('sajuai_total_analyses') ?? '0', 10);
  const totalPayments = parseInt(localStorage.getItem('sajuai_total_payments') ?? '0', 10);
  const rawLogs = localStorage.getItem('sajuai_analysis_logs');
  const logs: AnalysisLog[] = rawLogs ? JSON.parse(rawLogs) : [];
  return { totalAnalyses, totalPayments, logs };
}

const MBTI_COLORS: Record<string, string> = {
  INTJ: '#D4AF37', INTP: '#B8860B', ENTJ: '#FFD700', ENTP: '#FFC200',
  INFJ: '#4ECDC4', INFP: '#45B7D1', ENFJ: '#96CEB4', ENFP: '#FFEAA7',
  ISTJ: '#DDA0DD', ISFJ: '#F0E68C', ESTJ: '#98FB98', ESFJ: '#F4A460',
  ISTP: '#87CEEB', ISFP: '#FFB6C1', ESTP: '#FFA07A', ESFP: '#90EE90',
};

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<AdminStats>({ totalAnalyses: 0, totalPayments: 0, logs: [] });

  useEffect(() => {
    if (authed) setStats(getStats());
  }, [authed]);

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      setError('');
    } else {
      setError('비밀번호가 틀렸습니다.');
    }
  };

  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}>
        <div className="card" style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔐</div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>
            Admin Dashboard
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            관리자 전용 페이지입니다.
          </p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="비밀번호 입력"
            style={{
              width: '100%', padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              color: 'var(--text)', fontSize: '15px', marginBottom: '12px',
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <p style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '12px' }}>{error}</p>
          )}
          <button className="btn-primary" onClick={handleLogin} style={{ width: '100%' }}>
            접속
          </button>
          <p style={{ marginTop: '16px' }}>
            <a href="/" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>← 메인으로</a>
          </p>
        </div>
      </div>
    );
  }

  // Build MBTI distribution data
  const mbtiCount: Record<string, number> = {};
  stats.logs.forEach((log) => {
    if (log.mbti) mbtiCount[log.mbti] = (mbtiCount[log.mbti] ?? 0) + 1;
  });
  const mbtiData = Object.entries(mbtiCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Gender distribution
  const genderCount = { male: 0, female: 0 };
  stats.logs.forEach((log) => {
    if (log.gender === 'male') genderCount.male++;
    else genderCount.female++;
  });
  const genderData = [
    { name: '남성', value: genderCount.male },
    { name: '여성', value: genderCount.female },
  ];

  // Decade distribution
  const decadeCount: Record<string, number> = {};
  stats.logs.forEach((log) => {
    if (log.birthDecade) decadeCount[log.birthDecade] = (decadeCount[log.birthDecade] ?? 0) + 1;
  });
  const decadeData = Object.entries(decadeCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const conversionRate = stats.totalAnalyses > 0
    ? ((stats.totalPayments / stats.totalAnalyses) * 100).toFixed(1)
    : '0.0';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <span style={{ fontSize: '11px', letterSpacing: '3px', color: '#65a30d', textTransform: 'uppercase' }}>
              Admin Dashboard
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>
              AI 책사 통계
            </h1>
          </div>
          <a href="/" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            ← 메인으로
          </a>
        </div>

        {/* KPI Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px', marginBottom: '32px',
        }}>
          {[
            { label: '총 분석 횟수', value: stats.totalAnalyses.toLocaleString(), icon: '📊' },
            { label: '결제 건수', value: stats.totalPayments.toLocaleString(), icon: '💳' },
            { label: '전환율', value: `${conversionRate}%`, icon: '🎯' },
            { label: '최근 로그', value: `${stats.logs.length}건`, icon: '📝' },
          ].map((kpi, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{kpi.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#65a30d', marginBottom: '4px' }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {/* MBTI Distribution */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              MBTI 분포 (Top 8)
            </h3>
            {mbtiData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={mbtiData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--text)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {mbtiData.map((entry, i) => (
                      <Cell key={i} fill={MBTI_COLORS[entry.name] ?? '#D4AF37'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                데이터 없음
              </div>
            )}
          </div>

          {/* Gender Pie */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              성별 분포
            </h3>
            {(genderCount.male + genderCount.female) > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie data={genderData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      <Cell fill="#D4AF37" />
                      <Cell fill="#4ECDC4" />
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {genderData.map((g, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{g.name}</span>
                      <span style={{ color: 'var(--text)', fontWeight: 700 }}>{g.value}명</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                데이터 없음
              </div>
            )}
          </div>
        </div>

        {/* Birth Decade Chart */}
        {decadeData.length > 0 && (
          <div className="card" style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              출생 연대별 분포
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={decadeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Logs */}
        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
            최근 분석 로그 (개인정보 없음)
          </h3>
          {stats.logs.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
              아직 분석 기록이 없습니다.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr>
                    {['시간', 'MBTI', '성별', '출생 연대'].map((h) => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)',
                        borderBottom: '1px solid var(--border)', fontWeight: 600,
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...stats.logs].reverse().slice(0, 20).map((log, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{log.time}</td>
                      <td style={{ padding: '8px 12px', color: '#65a30d' }}>{log.mbti}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text)' }}>{log.gender === 'male' ? '남' : '여'}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text)' }}>{log.birthDecade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '11px', color: 'var(--text-muted)' }}>
          데이터는 이 브라우저의 localStorage에만 저장됩니다. 개인정보는 수집하지 않습니다.
        </p>
      </div>
    </div>
  );
}
