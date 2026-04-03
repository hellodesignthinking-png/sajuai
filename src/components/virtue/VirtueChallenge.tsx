import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtue } from '../../hooks/useVirtue';

const WEEKLY_MISSIONS = [
  { id: 'mission_1', text: '오늘 모르는 사람에게 먼저 인사하기' },
  { id: 'mission_2', text: '주변 사람에게 진심 어린 칭찬 한마디 전하기' },
  { id: 'mission_3', text: '지하철·버스에서 자리 양보하기' },
  { id: 'mission_4', text: 'SNS에서 타인의 글에 격려 댓글 달기' },
  { id: 'mission_5', text: '오늘 하루 쓰레기 줍기 챌린지' },
  { id: 'mission_6', text: '오랫동안 연락 못 한 지인에게 안부 메시지 보내기' },
  { id: 'mission_7', text: '후배나 동료의 고민 들어주기' },
];

type Tab = 'gratitude' | 'missions' | 'badges';

export default function VirtueChallenge() {
  const [tab, setTab] = useState<Tab>('gratitude');
  const [gratitudeText, setGratitudeText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { state, badges, addGratitude, completeMission } = useVirtue();

  const handleGratitudeSubmit = () => {
    if (!gratitudeText.trim()) return;
    addGratitude();
    setGratitudeText('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  const earnedBadges = badges.filter((b) => b.earned);

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Tab header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {([
          { key: 'gratitude', label: '감사기록', icon: '🙏' },
          { key: 'missions', label: '선행미션', icon: '⚡' },
          { key: 'badges', label: '뱃지컬렉션', icon: '🏅' },
        ] as { key: Tab; label: string; icon: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '14px 8px',
              border: 'none',
              background: tab === t.key ? 'rgba(212,175,55,0.08)' : 'transparent',
              borderBottom: tab === t.key ? '2px solid var(--gold)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '18px' }}>{t.icon}</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: tab === t.key ? 700 : 400,
                color: tab === t.key ? 'var(--gold)' : 'var(--text-muted)',
                letterSpacing: '0.5px',
              }}
            >
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={{ padding: '20px' }}
        >
          {tab === 'gratitude' && (
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.6 }}>
                  오늘 감사한 일을 기록하세요. 덕을 쌓으면 운도 쌓입니다.
                </p>
                <div
                  style={{
                    background: 'rgba(212,175,55,0.06)',
                    border: '1px solid rgba(212,175,55,0.2)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>누적 감사 기록</span>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--gold)' }}>
                    {state.gratitudeCount}회
                  </span>
                </div>
              </div>
              <textarea
                value={gratitudeText}
                onChange={(e) => setGratitudeText(e.target.value)}
                placeholder="오늘 감사한 일을 적어보세요..."
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: 'var(--text)',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
              <button
                className="btn-primary"
                onClick={handleGratitudeSubmit}
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={!gratitudeText.trim()}
              >
                {submitted ? '✓ 감사 기록 완료!' : '🙏 감사 기록하기'}
              </button>
            </div>
          )}

          {tab === 'missions' && (
            <div style={{ display: 'grid', gap: '10px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px', lineHeight: 1.6 }}>
                이번 주 선행 미션 ({state.completedMissions.length}/{WEEKLY_MISSIONS.length} 완료)
              </p>
              {WEEKLY_MISSIONS.map((mission) => {
                const done = state.completedMissions.includes(mission.id);
                return (
                  <div
                    key={mission.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 14px',
                      background: done ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${done ? 'rgba(74,222,128,0.2)' : 'var(--border)'}`,
                      borderRadius: '10px',
                      cursor: done ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => !done && completeMission(mission.id)}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: done ? '#4ade80' : 'transparent',
                        border: `2px solid ${done ? '#4ade80' : 'var(--border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '1px',
                        transition: 'all 0.2s',
                      }}
                    >
                      {done && <span style={{ fontSize: '11px', color: '#000', fontWeight: 700 }}>✓</span>}
                    </div>
                    <p
                      style={{
                        fontSize: '13px',
                        color: done ? 'var(--text-muted)' : 'var(--text)',
                        lineHeight: 1.6,
                        textDecoration: done ? 'line-through' : 'none',
                      }}
                    >
                      {mission.text}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'badges' && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px', lineHeight: 1.6 }}>
                {earnedBadges.length > 0
                  ? `${earnedBadges.length}개의 뱃지를 획득했습니다!`
                  : '덕을 쌓아 뱃지를 획득하세요.'}
              </p>
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 16px',
                    background: badge.earned ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${badge.earned ? 'rgba(212,175,55,0.3)' : 'var(--border)'}`,
                    borderRadius: '12px',
                    opacity: badge.earned ? 1 : 0.5,
                    transition: 'all 0.2s',
                  }}
                >
                  <span
                    style={{
                      fontSize: '32px',
                      filter: badge.earned ? 'none' : 'grayscale(1)',
                    }}
                  >
                    {badge.icon}
                  </span>
                  <div>
                    <p
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: badge.earned ? 'var(--gold)' : 'var(--text-muted)',
                        marginBottom: '2px',
                      }}
                    >
                      {badge.name}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{badge.desc}</p>
                  </div>
                  {badge.earned && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: '10px',
                        color: 'var(--gold)',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        background: 'rgba(212,175,55,0.12)',
                        padding: '3px 8px',
                        borderRadius: '20px',
                      }}
                    >
                      획득
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
