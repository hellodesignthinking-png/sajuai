import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { isConfigured } from '../../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
}

type Tab = 'login' | 'signup' | 'reset';

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signIn, signUp, signInWithOAuth, resetPassword } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const configured = isConfigured();
  // Local admin emails can sign in without Supabase (bypass in AuthContext).
  const ADMIN_EMAILS = ['taina@ant3na.com'];
  const isAdminEmail = ADMIN_EMAILS.includes(email.trim().toLowerCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Gate Supabase-dependent flows (signup, password reset, non-admin login)
    // but let the admin local-bypass through even without Supabase.
    if (!configured && !(tab === 'login' && isAdminEmail)) {
      setMessage({
        type: 'error',
        text: tab === 'login'
          ? 'Supabase가 설정되지 않았습니다. 관리자 계정(taina@ant3na.com)으로만 로그인 가능합니다.'
          : 'Supabase 환경변수를 설정해주세요.',
      });
      return;
    }
    setLoading(true);
    setMessage(null);

    if (tab === 'reset') {
      const { error } = await resetPassword(email);
      if (error) {
        setMessage({ type: 'error', text: error });
      } else {
        setMessage({ type: 'success', text: '비밀번호 재설정 이메일을 발송했습니다.' });
      }
      setLoading(false);
      return;
    }

    const { error } = tab === 'login'
      ? await signIn(email, password)
      : await signUp(email, password);

    if (error) {
      setMessage({ type: 'error', text: error });
    } else if (tab === 'signup') {
      setMessage({ type: 'success', text: '가입 확인 이메일을 발송했습니다. 이메일을 확인해주세요.' });
    } else {
      onClose();
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: 'google' | 'kakao') => {
    if (!configured) {
      setMessage({ type: 'error', text: 'Supabase 환경변수를 설정해주세요.' });
      return;
    }
    const { error } = await signInWithOAuth(provider);
    if (error) setMessage({ type: 'error', text: error });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: '400px',
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '28px 24px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#65a30d', marginBottom: '4px' }}>너튜유니온 SAJU</p>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
                {tab === 'login' ? '로그인' : tab === 'signup' ? '회원가입' : '비밀번호 찾기'}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', padding: '4px' }}
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          {tab !== 'reset' && (
            <div style={{
              display: 'flex', gap: '2px',
              background: 'var(--bg)', borderRadius: '10px',
              padding: '3px', marginBottom: '20px',
            }}>
              {(['login', 'signup'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setMessage(null); }}
                  style={{
                    flex: 1, padding: '8px 0', fontSize: '13px', fontWeight: 600,
                    borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: tab === t ? 'var(--card-hover)' : 'transparent',
                    color: tab === t ? 'var(--text)' : 'var(--text-muted)',
                    transition: 'all 0.15s',
                  }}
                >
                  {t === 'login' ? '로그인' : '회원가입'}
                </button>
              ))}
            </div>
          )}

          {/* Not configured warning — friendlier tone when admin can still log in. */}
          {!configured && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px', marginBottom: '16px',
              background: isAdminEmail ? '#ecfccb' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${isAdminEmail ? '#a3e635' : 'rgba(239,68,68,0.2)'}`,
              fontSize: '12px',
              color: isAdminEmail ? '#65a30d' : '#f87171',
            }}>
              {isAdminEmail
                ? '🔑 관리자 계정 로컬 로그인 모드 (Supabase 미설정)'
                : '⚠️ Supabase 미설정 — 관리자 계정(taina@ant3na.com)으로만 로그인 가능합니다.'}
            </div>
          )}

          {/* Message */}
          {message && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px', marginBottom: '16px',
              background: message.type === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
              border: `1px solid ${message.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
              fontSize: '13px', color: message.type === 'error' ? '#f87171' : '#4ade80',
            }}>
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: '100%', padding: '10px 12px',
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: '10px', color: 'var(--text)', fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {tab !== 'reset' && (
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  style={{
                    width: '100%', padding: '10px 12px',
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: '10px', color: 'var(--text)', fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '11px 0',
                background: 'linear-gradient(135deg, #65a30d, #65a30d)',
                border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: 700, color: '#000',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginTop: '4px',
              }}
            >
              {loading ? '처리 중...' : tab === 'login' ? '로그인' : tab === 'signup' ? '회원가입' : '이메일 발송'}
            </button>
          </form>

          {/* Forgot password / back */}
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            {tab === 'reset' ? (
              <button
                onClick={() => { setTab('login'); setMessage(null); }}
                style={{ background: 'none', border: 'none', color: '#65a30d', fontSize: '13px', cursor: 'pointer' }}
              >
                ← 로그인으로 돌아가기
              </button>
            ) : (
              <button
                onClick={() => { setTab('reset'); setMessage(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}
              >
                비밀번호를 잊으셨나요?
              </button>
            )}
          </div>

          {/* Divider */}
          {tab !== 'reset' && (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                margin: '20px 0 16px',
              }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>또는</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>

              {/* OAuth buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => handleOAuth('google')}
                  style={{
                    width: '100%', padding: '11px 0',
                    background: '#fff', border: '1px solid #ddd',
                    borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                    color: '#333', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Google로 계속하기
                </button>

                <button
                  onClick={() => handleOAuth('kakao')}
                  style={{
                    width: '100%', padding: '11px 0',
                    background: '#FEE500', border: 'none',
                    borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                    color: '#000', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M9 1C4.582 1 1 3.821 1 7.286c0 2.24 1.494 4.203 3.748 5.325l-.958 3.482c-.084.307.285.55.545.363L8.32 13.96c.224.017.45.026.68.026 4.418 0 8-2.821 8-6.7C17 3.821 13.418 1 9 1z" fill="#000"/>
                  </svg>
                  카카오로 계속하기
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
