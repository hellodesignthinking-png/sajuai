import { useState } from 'react';
import type { SeasonReasoning as SeasonReasoningType, CareerSeason } from '../../types';

interface Props {
  data: SeasonReasoningType;
  season: CareerSeason;
}

const SEASON_LABELS: Record<CareerSeason, { label: string; emoji: string; color: string }> = {
  spring: { label: '봄', emoji: '🌸', color: '#86efac' },
  summer: { label: '여름', emoji: '☀️', color: '#fbbf24' },
  autumn: { label: '가을', emoji: '🍂', color: '#fb923c' },
  winter: { label: '겨울', emoji: '❄️', color: '#93c5fd' },
};

type Tab = 'saju' | 'astrology' | 'numerology';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'saju', label: '사주', icon: '☯' },
  { id: 'astrology', label: '점성술', icon: '⭐' },
  { id: 'numerology', label: '수비학', icon: '🔢' },
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
    <div className="card" style={{ padding: '20px', display: 'grid', gap: '16px' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px' }}>{seasonInfo.emoji}</span>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
            지금이 왜
          </p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: seasonInfo.color }}>
            커리어 {seasonInfo.label}인가?
          </p>
        </div>
      </div>

      {/* 종합 근거 */}
      <div
        style={{
          padding: '14px 16px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <p style={{ fontSize: '11px', color: 'var(--gold)', marginBottom: '8px', letterSpacing: '1px' }}>
          종합 분석
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, fontWeight: 500 }}>
          {data.overall_reasoning}
        </p>
      </div>

      {/* 탭 전환 */}
      <div>
        <div
          style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '12px',
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: '8px',
                border: activeTab === tab.id
                  ? '1px solid rgba(212,175,55,0.4)'
                  : '1px solid rgba(255,255,255,0.07)',
                background: activeTab === tab.id
                  ? 'rgba(212,175,55,0.1)'
                  : 'rgba(255,255,255,0.02)',
                color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: activeTab === tab.id ? 700 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
              }}
            >
              <span style={{ fontSize: '14px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div
          key={activeTab}
          style={{
            padding: '14px 16px',
            borderRadius: '10px',
            background: 'rgba(212,175,55,0.03)',
            border: '1px solid rgba(212,175,55,0.12)',
            minHeight: '100px',
          }}
        >
          <p style={{ fontSize: '11px', color: 'rgba(212,175,55,0.6)', marginBottom: '8px' }}>
            {TABS.find((t) => t.id === activeTab)?.icon}{' '}
            {activeTab === 'saju' ? '사주·명리 관점' : activeTab === 'astrology' ? '서양 점성술 관점' : '수비학 관점'}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
            {tabContent[activeTab]}
          </p>
        </div>
      </div>
    </div>
  );
}
