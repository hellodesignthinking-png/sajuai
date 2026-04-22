import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SeasonReasoning as SeasonReasoningType, CareerSeason } from '../../types';

interface Props {
  data: SeasonReasoningType;
  season: CareerSeason;
}

const SEASON_LABELS: Record<CareerSeason, { label: string; emoji: string; color: string }> = {
  spring: { label: '봄', emoji: '🌱', color: '#404040' },
  summer: { label: '여름', emoji: '🔥', color: '#404040' },
  autumn: { label: '가을', emoji: '🍂', color: '#84cc16' },
  winter: { label: '겨울', emoji: '❄️', color: '#737373' },
};

type Tab = 'saju' | 'astrology' | 'numerology';

const TABS: { id: Tab; label: string; icon: string; desc: string }[] = [
  { id: 'saju',       label: '사주',   icon: '☯',  desc: '명리학 관점' },
  { id: 'astrology',  label: '점성술', icon: '⭐', desc: '서양 점성술' },
  { id: 'numerology', label: '수비학', icon: '🔢', desc: '수비학 관점' },
];

export default function SeasonReasoning({ data, season }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('saju');
  const seasonInfo = SEASON_LABELS[season];

  const tabContent: Record<Tab, string> = {
    saju: data.saju_basis,
    astrology: data.astrology_basis,
    numerology: data.numerology_basis,
  };

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid #d9f99d',
        borderRadius: '16px',
        padding: '22px',
        display: 'grid',
        gap: '18px',
      }}
    >
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '48px', height: '48px',
            borderRadius: '12px',
            background: `${seasonInfo.color}15`,
            border: `1px solid ${seasonInfo.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px',
            flexShrink: 0,
          }}
        >
          {seasonInfo.emoji}
        </div>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px', letterSpacing: '1px' }}>
            지금이 왜
          </p>
          <p style={{ fontSize: '18px', fontWeight: 800, color: seasonInfo.color, letterSpacing: '-0.3px' }}>
            커리어 {seasonInfo.label}인가?
          </p>
        </div>
      </div>

      {/* 종합 근거 */}
      <div
        style={{
          padding: '16px 18px',
          borderRadius: '12px',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
        }}
      >
        <p style={{ fontSize: '11px', color: '#65a30d', marginBottom: '10px', fontWeight: 700, letterSpacing: '2px' }}>
          ◆ 종합 분석
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.9, fontWeight: 500 }}>
          {data.overall_reasoning}
        </p>
      </div>

      {/* 탭 전환 */}
      <div>
        {/* Tab buttons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
            marginBottom: '14px',
            background: 'var(--bg)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 6px',
                borderRadius: '9px',
                border: 'none',
                background: activeTab === tab.id
                  ? '#d9f99d'
                  : 'transparent',
                color: activeTab === tab.id ? '#65a30d' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 700 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                fontFamily: 'Noto Sans KR, sans-serif',
                outline: activeTab === tab.id ? '1px solid #a3e635' : 'none',
              }}
            >
              <span style={{ fontSize: '18px' }}>{tab.icon}</span>
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <span style={{ fontSize: '10px', color: '#65a30d', fontWeight: 400 }}>
                  {tab.desc}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: '16px 18px',
              borderRadius: '12px',
              background: '#fafaf9',
              border: '1px solid #ecfccb',
              minHeight: '100px',
            }}
          >
            <p style={{ fontSize: '11px', color: '#65a30d', marginBottom: '10px', fontWeight: 700, letterSpacing: '1px' }}>
              {TABS.find((t) => t.id === activeTab)?.icon}{' '}
              {TABS.find((t) => t.id === activeTab)?.desc}
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.9 }}>
              {tabContent[activeTab]}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
