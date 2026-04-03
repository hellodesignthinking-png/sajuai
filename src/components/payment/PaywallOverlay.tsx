import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { usePayment } from '../../contexts/PaymentContext';

interface Props {
  children: React.ReactNode;
}

export default function PaywallOverlay({ children }: Props) {
  const { isPaid, openPaymentModal } = usePayment();

  if (isPaid) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Blurred content preview */}
      <div
        style={{
          filter: 'blur(5px)',
          userSelect: 'none',
          pointerEvents: 'none',
          opacity: 0.6,
          maxHeight: '260px',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>

      {/* Bottom gradient fade */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '70%',
          background: 'linear-gradient(to bottom, transparent, #080808)',
          pointerEvents: 'none',
        }}
      />

      {/* Lock overlay */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: '24px',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(212,175,55,0.12)',
            border: '1px solid rgba(212,175,55,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Lock size={20} color="var(--gold)" />
        </div>
        <button
          onClick={openPaymentModal}
          className="btn-primary"
          style={{ fontSize: '13px', padding: '9px 24px' }}
        >
          🔓 잠금 해제하기
        </button>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0 }}>
          9,900원 · 1회 결제 · 평생 열람
        </p>
      </motion.div>
    </div>
  );
}
