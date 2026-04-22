import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GratitudeEntry {
  id: string;
  text: string;
  date: string;
}

interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  threshold: number;
  type: 'gratitude' | 'mission' | 'share';
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const BADGES: BadgeDef[] = [
  {
    id: 'gratitude_seed',
    name: '감사의 씨앗',
    emoji: '🌱',
    description: '감사 코멘트 3회 작성',
    threshold: 3,
    type: 'gratitude',
  },
  {
    id: 'virtue_cycle',
    name: '복의 순환자',
    emoji: '🔄',
    description: '선행 미션 5회 완료',
    threshold: 5,
    type: 'mission',
  },
  {
    id: 'virtue_spreader',
    name: '덕 전파자',
    emoji: '✨',
    description: '결과 공유 3회 달성',
    threshold: 3,
    type: 'share',
  },
];

const ALL_MISSIONS = [
  '머문 자리 정돈하기',
  '남몰래 칭찬하기',
  '대중교통 자리 양보하기',
  '모르는 사람에게 먼저 인사하기',
  '쓰레기 하나 주워 버리기',
  '후배·동료에게 진심 어린 격려하기',
  '고마운 사람에게 연락하기',
  '공공장소 문 잡아주기',
  'SNS에 긍정적인 댓글 달기',
  '커피 한 잔 익명으로 선물하기',
  '음식 쓰레기 줄이기',
  '중고 물품 기부하기',
  '어르신께 먼저 길 비켜드리기',
  '작은 나눔 실천하기',
  '누군가의 이야기 끝까지 들어주기',
  '오늘 웃으며 먼저 대화 걸기',
  '식물 또는 반려동물 돌보기',
  '봉사활동 한 가지 알아보기',
  '긍정적인 후기 남기기',
  '오늘 아무도 모르게 선한 일 하나 하기',
];

function getWeeklyMissions(): { id: string; text: string }[] {
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const startIdx = (weekNum * 4) % ALL_MISSIONS.length;
  return Array.from({ length: 4 }, (_, i) => {
    const idx = (startIdx + i) % ALL_MISSIONS.length;
    return { id: `w${weekNum}_m${i}`, text: ALL_MISSIONS[idx] };
  });
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ─── checkAndAwardBadges ──────────────────────────────────────────────────────

function checkAndAwardBadges(
  gratitudeCount: number,
  missionCount: number,
  shareCount: number,
): string | null {
  const earned: string[] = loadJson('virtue_earned_badges', []);
  let newBadgeName: string | null = null;

  for (const badge of BADGES) {
    if (earned.includes(badge.id)) continue;
    const count =
      badge.type === 'gratitude'
        ? gratitudeCount
        : badge.type === 'mission'
          ? missionCount
          : shareCount;
    if (count >= badge.threshold) {
      earned.push(badge.id);
      newBadgeName = badge.name;
    }
  }

  if (newBadgeName) {
    saveJson('virtue_earned_badges', earned);
  }
  return newBadgeName;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VirtueChallenge() {
  const [gratitudeText, setGratitudeText] = useState('');
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>(() =>
    loadJson('virtue_gratitude_entries', []),
  );
  const [completedMissions, setCompletedMissions] = useState<string[]>(() =>
    loadJson('virtue_completed_missions', []),
  );
  const [shareCount] = useState<number>(() => loadJson('virtue_share_count', 0));
  const [badgeToast, setBadgeToast] = useState<string | null>(null);

  const weeklyMissions = getWeeklyMissions();
  const earnedBadges: string[] = loadJson('virtue_earned_badges', []);

  const showToast = useCallback((name: string) => {
    setBadgeToast(name);
    setTimeout(() => setBadgeToast(null), 3500);
  }, []);

  const handleAddGratitude = () => {
    if (!gratitudeText.trim()) return;
    const entry: GratitudeEntry = {
      id: Date.now().toString(),
      text: gratitudeText.trim(),
      date: new Date().toLocaleDateString('ko-KR'),
    };
    const updated = [entry, ...gratitudeEntries].slice(0, 20);
    setGratitudeEntries(updated);
    saveJson('virtue_gratitude_entries', updated);
    setGratitudeText('');
    const newBadge = checkAndAwardBadges(updated.length, completedMissions.length, shareCount);
    if (newBadge) showToast(newBadge);
  };

  const toggleMission = (id: string) => {
    const updated = completedMissions.includes(id)
      ? completedMissions.filter((m) => m !== id)
      : [...completedMissions, id];
    setCompletedMissions(updated);
    saveJson('virtue_completed_missions', updated);
    const newBadge = checkAndAwardBadges(gratitudeEntries.length, updated.length, shareCount);
    if (newBadge) showToast(newBadge);
  };

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* Badge Toast */}
      <AnimatePresence>
        {badgeToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            style={{
              position: 'fixed',
              top: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#84cc16',
              color: '#000',
              padding: '12px 28px',
              borderRadius: '100px',
              fontSize: '14px',
              fontWeight: 700,
              zIndex: 9999,
              whiteSpace: 'nowrap',
              boxShadow: '0 8px 32px #84cc16',
              pointerEvents: 'none',
            }}
          >
            🏅 뱃지 획득! &quot;{badgeToast}&quot;
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1. 덕분에 감사 카드 ──────────────────────────────── */}
      <div
        className="card"
        style={{
          background: '#f7fee7',
          border: '1px solid #d9f99d',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px' }}>🙏</span>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: '13px',
                color: '#65a30d',
                fontWeight: 700,
                letterSpacing: '1px',
              }}
            >
              덕분에
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              오늘 감사한 사람/환경을 기록하세요
            </p>
          </div>
          <span
            style={{
              fontSize: '12px',
              color:
                gratitudeEntries.length >= 3 ? '#65a30d' : 'var(--text-muted)',
              background: 'var(--border)',
              padding: '3px 10px',
              borderRadius: '100px',
              fontWeight: 700,
            }}
          >
            {gratitudeEntries.length} / 3+
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <input
            value={gratitudeText}
            onChange={(e) => setGratitudeText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGratitude()}
            placeholder="예: 동료가 도움을 줬다, 날씨가 맑아서..."
            style={{
              flex: 1,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '10px 14px',
              color: 'var(--text)',
              fontSize: '14px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handleAddGratitude}
            disabled={!gratitudeText.trim()}
            style={{
              background: gratitudeText.trim() ? '#65a30d' : 'var(--border)',
              color: gratitudeText.trim() ? '#000' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: gratitudeText.trim() ? 'pointer' : 'default',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
          >
            기록
          </button>
        </div>

        {gratitudeEntries.length > 0 && (
          <div style={{ display: 'grid', gap: '8px' }}>
            {gratitudeEntries.slice(0, 5).map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  background: '#f7fee7',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '12px', marginTop: '3px', flexShrink: 0 }}>✨</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5 }}>
                    {entry.text}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {entry.date}
                  </p>
                </div>
              </motion.div>
            ))}
            {gratitudeEntries.length > 5 && (
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  padding: '4px',
                }}
              >
                +{gratitudeEntries.length - 5}개 더 기록됨
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── 2. 이번 주 선행 미션 ─────────────────────────────── */}
      <div
        className="card"
        style={{
          background: 'rgba(74,222,128,0.03)',
          border: '1px solid rgba(74,222,128,0.14)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px' }}>🎯</span>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: '13px',
                color: '#16a34a',
                fontWeight: 700,
                letterSpacing: '1px',
              }}
            >
              이번 주 선행 미션
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              보이지 않는 선행을 실천하세요 · 매주 새로 바뀝니다
            </p>
          </div>
          <span
            style={{
              fontSize: '12px',
              color: completedMissions.length >= 5 ? '#4ade80' : 'var(--text-muted)',
              background: 'var(--border)',
              padding: '3px 10px',
              borderRadius: '100px',
              fontWeight: 700,
            }}
          >
            {completedMissions.length} / 5+
          </span>
        </div>

        <div style={{ display: 'grid', gap: '10px' }}>
          {weeklyMissions.map((mission, i) => {
            const done = completedMissions.includes(mission.id);
            return (
              <motion.button
                key={mission.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => toggleMission(mission.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: done ? 'rgba(74,222,128,0.08)' : 'transparent',
                  border: `1px solid ${done ? 'rgba(74,222,128,0.28)' : 'var(--border)'}`,
                  borderRadius: '10px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: `2px solid ${done ? '#4ade80' : '#444'}`,
                    background: done ? '#4ade80' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  {done && (
                    <span style={{ fontSize: '12px', color: '#000', fontWeight: 900 }}>✓</span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '14px',
                    color: done ? '#4ade80' : 'var(--text)',
                    textDecoration: done ? 'line-through' : 'none',
                    opacity: done ? 0.7 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {mission.text}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── 3. 뱃지 컬렉션 ──────────────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px' }}>🏅</span>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700 }}>뱃지 컬렉션</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {earnedBadges.length} / {BADGES.length} 달성
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}
        >
          {BADGES.map((badge, i) => {
            const earned = earnedBadges.includes(badge.id);
            const count =
              badge.type === 'gratitude'
                ? gratitudeEntries.length
                : badge.type === 'mission'
                  ? completedMissions.length
                  : shareCount;
            const progress = Math.min(count / badge.threshold, 1);

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  textAlign: 'center',
                  padding: '18px 10px',
                  background: earned
                    ? '#f7fee7'
                    : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${earned ? '#84cc16' : 'var(--border)'}`,
                  borderRadius: '14px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                }}
              >
                {earned && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'radial-gradient(circle at 50% 30%, #ecfccb 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
                <div
                  style={{
                    fontSize: '34px',
                    marginBottom: '8px',
                    filter: earned ? 'none' : 'grayscale(100%) opacity(0.28)',
                    transition: 'filter 0.4s',
                  }}
                >
                  {badge.emoji}
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: earned ? '#65a30d' : 'var(--text-muted)',
                    marginBottom: '4px',
                    lineHeight: 1.3,
                  }}
                >
                  {badge.name}
                </p>
                <p
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.4,
                    marginBottom: '10px',
                  }}
                >
                  {badge.description}
                </p>
                {earned ? (
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#65a30d',
                      fontWeight: 700,
                      letterSpacing: '1px',
                    }}
                  >
                    EARNED ✓
                  </span>
                ) : (
                  <div>
                    <div
                      style={{
                        background: 'var(--border)',
                        borderRadius: '100px',
                        height: '4px',
                        overflow: 'hidden',
                        marginBottom: '4px',
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          background: '#65a30d',
                          borderRadius: '100px',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '10px', color: '#555' }}>
                      {count}/{badge.threshold}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
