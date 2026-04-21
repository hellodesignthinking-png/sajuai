import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <p style={{ fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.5rem', fontWeight: 700 }}>
            문제가 발생했습니다
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {this.state.error?.message ?? '예기치 않은 오류가 발생했습니다.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.6rem 1.5rem',
              background: '#84cc16',
              color: '#1a1a1a',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
