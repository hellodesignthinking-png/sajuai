import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMyResults, deleteResult } from '../../services/storage';
import type { StoredResult } from '../../services/storage';
import type { UserInput, AnalysisResult } from '../../types';

interface MyResultsProps {
  onClose: () => void;
  onRestore: (input: UserInput, result: AnalysisResult) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatExpiry(iso: string) {
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return '만료됨';
  if (days === 0) return '오늘 만료';
  return `${days}일 남음`;
}

export default function MyResults({ onClose, onRestore }: MyResultsProps) {
  const [results, setResults] = useState<StoredResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    getMyResults().then(({ data, error }) => {
      if (error) setError(error);
      else setResults(data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const { error } = await deleteResult(id);
    if (!error) setResults((prev) => prev.filter((r) => r.id !== id));
    setDeleting(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '16px', overflowY: 'auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '600px', marginTop: '40px', marginBottom: '40px',
          background: '#111', border: '1px solid #222',
          borderRadius: '16px', padding: '28px 24px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--gold)', marginBottom: '4px' }}>AI 책사</p>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>📁 내 분석 기록</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            불러오는 중...
          </div>
        )}

        {error && (
          <div style={{
            padding: '14px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            fontSize: '13px', color: '#f87171',
          }}>
            {error}
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>📭</p>
            <p style={{ fontSize: '14px' }}>저장된 분석 기록이 없습니다.</p>
            <p style={{ fontSize: '13px', marginTop: '6px' }}>분석 완료 후 "결과 저장하기" 버튼을 눌러보세요.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {results.map((r) => {
              const input = r.input as UserInput;
              const age = new Date().getFullYear() - input.birthYear;
              const season = (r.result as AnalysisResult).current_season;
              const seasonEmoji: Record<string, string> = { spring: '🌸', summer: '☀️', autumn: '🍂', winter: '❄️' };

              return (
                <div
                  key={r.id}
                  style={{
                    background: '#0d0d0d', border: '1px solid var(--border)',
                    borderRadius: '12px', padding: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '18px' }}>{seasonEmoji[season] ?? '🔮'}</span>
                        <span style={{ fontSize: '15px', fontWeight: 700 }}>
                          {input.birthYear}년생 ({age}세)
                        </span>
                        <span style={{
                          fontSize: '11px', padding: '2px 8px',
                          background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)',
                          borderRadius: '20px', color: 'var(--gold)',
                        }}>
                          {input.mbti}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {formatDate(r.created_at)} · 만료: {formatExpiry(r.expires_at)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => { onRestore(input, r.result as AnalysisResult); onClose(); }}
                        style={{
                          padding: '6px 14px', fontSize: '13px', fontWeight: 600,
                          background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
                          border: 'none', borderRadius: '8px', color: '#000', cursor: 'pointer',
                        }}
                      >
                        보기
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deleting === r.id}
                        style={{
                          padding: '6px 10px', fontSize: '13px',
                          background: 'transparent', border: '1px solid var(--border)',
                          borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer',
                        }}
                      >
                        {deleting === r.id ? '...' : '🗑'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>
          분석 결과는 저장일로부터 1년간 보관됩니다.
        </p>
      </motion.div>
    </motion.div>
  );
}
