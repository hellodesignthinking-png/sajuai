import React, { useEffect, useRef, useState } from 'react';
import { loadTossPayments, type TossPaymentsWidgets } from '@tosspayments/tosspayments-sdk';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { usePayment } from '../../contexts/PaymentContext';

const CLIENT_KEY =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TOSS_CLIENT_KEY) ||
  'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';

const AMOUNT = 990;
const ORDER_NAME = '사주AI 프리미엄 분석 리포트';

type Step = 'pricing' | 'widget' | 'processing';

const FEATURES = [
  '전성기 Top 5 전체 + 상세 점수',
  '생애 주기 운 그래프',
  '커리어 12년 계절 주기',
  '분기별 D-day + 성장 미션',
  '계절별 심층 가이드',
  'MBTI 시너지 상세',
];

export default function PaymentModal() {
  const { isModalOpen, closePaymentModal } = usePayment();
  const [step, setStep] = useState<Step>('pricing');
  const [widgetError, setWidgetError] = useState<string | null>(null);
  const [widgetReady, setWidgetReady] = useState(false);
  const widgetRef = useRef<TossPaymentsWidgets | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isModalOpen) {
      setStep('pricing');
      setWidgetError(null);
      setWidgetReady(false);
      widgetRef.current = null;
    }
  }, [isModalOpen]);

  // Initialize Toss Widget when step === 'widget'
  useEffect(() => {
    if (step !== 'widget' || !isModalOpen) return;

    let isMounted = true;
    setWidgetReady(false);
    setWidgetError(null);

    const init = async () => {
      try {
        const tossPayments = await loadTossPayments(CLIENT_KEY);
        const widgets = tossPayments.widgets({ customerKey: 'sajuai-guest' });

        if (!isMounted) return;

        await widgets.setAmount({ currency: 'KRW', value: AMOUNT });
        await Promise.all([
          widgets.renderPaymentMethods({
            selector: '#toss-payment-method',
            variantKey: 'DEFAULT',
          }),
          widgets.renderAgreement({
            selector: '#toss-agreement',
            variantKey: 'AGREEMENT',
          }),
        ]);

        widgetRef.current = widgets;
        if (isMounted) setWidgetReady(true);
      } catch (err) {
        console.error('Toss widget init error:', err);
        if (isMounted) setWidgetError('결제 모듈 로딩에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [step, isModalOpen]);

  const handleRequestPayment = async () => {
    if (!widgetRef.current || !widgetReady) return;
    setStep('processing');

    const orderId = `sajuai-${Date.now()}`;

    try {
      await widgetRef.current.requestPayment({
        orderId,
        orderName: ORDER_NAME,
        successUrl: `${window.location.origin}/`,
        failUrl: `${window.location.origin}/?payment=fail`,
        customerEmail: 'user@sajuai.com',
        customerName: '사주AI 사용자',
      });
      // Page redirects here — execution does not continue
    } catch (err: any) {
      setStep('widget');
      if (err.code !== 'USER_CANCEL') {
        setWidgetError('결제 중 오류: ' + err.message);
      }
    }
  };

  if (!isModalOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '0',
        }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={step !== 'processing' ? closePaymentModal : undefined}
        />

        {/* Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '90vh',
            background: '#fff',
            borderRadius: '24px 24px 0 0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px 20px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div>
              <p style={{ fontSize: '11px', letterSpacing: '2px', color: '#65a30d' }}>
                PREMIUM UNLOCK
              </p>
              <h2 style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>
                {step === 'pricing' ? '전체 리포트 잠금 해제' : step === 'widget' ? '결제 방법 선택' : '결제 처리 중...'}
              </h2>
            </div>
            {step !== 'processing' && (
              <button
                onClick={closePaymentModal}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Body */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
            {/* ── Pricing step ── */}
            {step === 'pricing' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ fontSize: '36px', fontWeight: 900, color: '#65a30d' }}>
                    990<span style={{ fontSize: '20px' }}>원</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    1회 결제 · 평생 열람 · 토스페이먼츠 안전 결제
                  </p>
                </div>

                <div style={{ display: 'grid', gap: '10px', marginBottom: '28px' }}>
                  {FEATURES.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#d9f99d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Check size={11} color="#65a30d" strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: '13px', color: 'var(--text)' }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setStep('widget')}
                  className="btn-primary"
                  style={{ width: '100%', padding: '15px', fontSize: '16px', fontWeight: 700 }}
                >
                  결제하기 →
                </button>
              </motion.div>
            )}

            {/* ── Widget step ── */}
            {step === 'widget' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {widgetError && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 14px',
                      background: 'rgba(239,68,68,0.1)',
                      borderRadius: '10px',
                      marginBottom: '16px',
                      color: '#e11d48',
                      fontSize: '13px',
                    }}
                  >
                    <AlertCircle size={16} />
                    {widgetError}
                  </div>
                )}

                {!widgetReady && !widgetError && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      padding: '40px 0',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
                )}

                {/* Toss render targets — must always be in DOM when step=widget */}
                <div id="toss-payment-method" />
                <div id="toss-agreement" style={{ marginTop: '12px' }} />
              </motion.div>
            )}

            {/* ── Processing step ── */}
            {step === 'processing' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px 0',
                  gap: '16px',
                  color: 'var(--text-muted)',
                }}
              >
                <Loader2 size={36} color="#65a30d" style={{ animation: 'spin 1s linear infinite' }} />
                <p>결제 페이지로 이동 중...</p>
              </div>
            )}
          </div>

          {/* Footer (widget step only) */}
          {step === 'widget' && (
            <div
              style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--border)',
                flexShrink: 0,
                display: 'flex',
                gap: '10px',
              }}
            >
              <button
                onClick={() => setStep('pricing')}
                className="btn-secondary"
                style={{ flex: 1, padding: '12px' }}
              >
                ← 뒤로
              </button>
              <button
                onClick={handleRequestPayment}
                disabled={!widgetReady}
                className="btn-primary"
                style={{
                  flex: 2,
                  padding: '12px',
                  opacity: widgetReady ? 1 : 0.5,
                  cursor: widgetReady ? 'pointer' : 'not-allowed',
                }}
              >
                990원 결제하기
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
