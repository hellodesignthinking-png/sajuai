import { useRef } from 'react';
import type { CareerSeason } from '../../types';

interface Props {
  season: CareerSeason;
  peakYear: number;
  feedback: string;
  birthYear: number;
}

const SEASON_META: Record<CareerSeason, { icon: string; label: string; color: string }> = {
  spring: { icon: '🌱', label: '봄', color: '#4ade80' },
  summer: { icon: '🔥', label: '여름', color: '#f97316' },
  autumn: { icon: '🍂', label: '가을', color: '#D4AF37' },
  winter: { icon: '❄️', label: '겨울', color: '#60a5fa' },
};

export interface ShareCardRef {
  getElement: () => HTMLDivElement | null;
}

interface ShareCardProps extends Props {
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ShareCard({ season, peakYear, feedback, birthYear, cardRef }: ShareCardProps) {
  const meta = SEASON_META[season];
  // truncate feedback to ~80 chars for card
  const shortFeedback = feedback.length > 80 ? feedback.slice(0, 78) + '…' : feedback;

  return (
    <div
      ref={cardRef}
      style={{
        width: '360px',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 100%)',
        border: `1px solid ${meta.color}30`,
        borderRadius: '20px',
        padding: '28px 24px',
        fontFamily: "'Noto Sans KR', sans-serif",
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: `${meta.color}08`,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div style={{ marginBottom: '18px' }}>
        <p
          style={{
            fontSize: '10px',
            letterSpacing: '3px',
            color: '#D4AF37',
            marginBottom: '6px',
          }}
        >
          AI 책사 분석
        </p>
        <p
          style={{
            fontSize: '18px',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.3,
          }}
        >
          {birthYear}년생의 커리어 전략
        </p>
      </div>

      {/* Season badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: `${meta.color}15`,
          border: `1px solid ${meta.color}30`,
          borderRadius: '30px',
          padding: '6px 14px',
          marginBottom: '18px',
        }}
      >
        <span style={{ fontSize: '16px' }}>{meta.icon}</span>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: meta.color,
          }}
        >
          현재 커리어 {meta.label}
        </span>
      </div>

      {/* Peak year */}
      <div
        style={{
          background: 'rgba(212,175,55,0.08)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: '12px',
          padding: '14px 16px',
          marginBottom: '16px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px', letterSpacing: '1px' }}>
          커리어 전성기
        </p>
        <p
          style={{
            fontSize: '26px',
            fontWeight: 900,
            color: '#D4AF37',
          }}
        >
          {peakYear}년
        </p>
      </div>

      {/* Feedback excerpt */}
      <p
        style={{
          fontSize: '12px',
          color: '#aaaaaa',
          lineHeight: 1.7,
          marginBottom: '20px',
          fontStyle: 'italic',
        }}
      >
        "{shortFeedback}"
      </p>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '14px',
        }}
      >
        <p style={{ fontSize: '11px', color: '#666' }}>⚔️ AI 책사</p>
        <p style={{ fontSize: '11px', color: '#666' }}>sajuai-two.vercel.app</p>
      </div>
    </div>
  );
}
