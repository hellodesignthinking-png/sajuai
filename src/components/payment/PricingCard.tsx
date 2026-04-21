import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { usePayment } from '../../contexts/PaymentContext';

const FEATURES = [
  '전성기 Top 5 전체 + 상세 점수',
  '생애 주기 운 그래프 완전 공개',
  '커리어 12년 계절 주기 분석',
  '분기별 D-day + 성장 미션 3종',
  '계절별 심층 네트워킹 가이드',
  'MBTI 시너지 상세 분석',
];

export default function PricingCard() {
  const { isPaid, openPaymentModal } = usePayment();

  if (isPaid) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{
        borderRadius: '16px',
        border: '1px solid #84cc16',
        background: 'linear-gradient(135deg, #f7fee7 0%, #fafaf9 100%)',
        padding: '28px 24px',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontSize: '10px',
          letterSpacing: '3px',
          color: '#65a30d',
          marginBottom: '10px',
          textTransform: 'uppercase',
        }}
      >
        Premium Unlock
      </p>
      <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '4px' }}>
        전체 리포트 잠금 해제
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
        아래 분석이 모두 잠겨 있습니다
      </p>

      <div
        style={{
          display: 'grid',
          gap: '8px',
          marginBottom: '22px',
          textAlign: 'left',
        }}
      >
        {FEATURES.map((f) => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Check size={14} color="#65a30d" strokeWidth={2.5} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{f}</span>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '30px', fontWeight: 900, color: '#65a30d' }}>990</span>
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#65a30d' }}>원</span>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px' }}>
          1회 결제 · 평생 열람
        </span>
      </div>

      <button
        onClick={openPaymentModal}
        className="btn-primary"
        style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700 }}
      >
        🔓 지금 잠금 해제하기
      </button>
      <p style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
        토스페이먼츠 안전 결제 · 환불 불가
      </p>
    </motion.div>
  );
}
