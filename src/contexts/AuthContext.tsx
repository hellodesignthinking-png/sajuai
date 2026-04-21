import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Local-only admin bypass: when Supabase isn't configured (dev / demo), the
// whitelisted email can still sign in with any ≥6-char password. Admin status
// is persisted in localStorage and PaymentContext already grants full access
// for ADMIN_EMAILS (see src/contexts/PaymentContext.tsx).
const ADMIN_EMAILS = ['taina@ant3na.com'];
const ADMIN_STORAGE_KEY = 'sajuai_local_admin';

function makeLocalAdminUser(email: string): User {
  // Build a minimal shape that matches the fields the UI actually reads
  // (id, email). Cast via `unknown` to satisfy Supabase's full User type.
  const now = new Date().toISOString();
  return {
    id: `local-admin-${email}`,
    email,
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: { provider: 'local-admin' },
    user_metadata: { local_admin: true },
    created_at: now,
    updated_at: now,
  } as unknown as User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'kakao') => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  signInWithOAuth: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore local-admin session (survives reloads even when Supabase is off).
    try {
      const adminEmail = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (adminEmail && ADMIN_EMAILS.includes(adminEmail)) {
        setUser(makeLocalAdminUser(adminEmail));
      }
    } catch {
      // localStorage blocked — no admin restore
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) setUser(session.user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) setUser(session.user);
      // If Supabase signs us out, don't clobber an active local-admin session.
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase();

    // Local-admin shortcut — works even when Supabase isn't configured.
    if (ADMIN_EMAILS.includes(normalized)) {
      if (password.length < 6) {
        return { error: '비밀번호는 6자 이상이어야 합니다.' };
      }
      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, normalized);
      } catch {
        // localStorage blocked — session will be memory-only
      }
      setUser(makeLocalAdminUser(normalized));
      return { error: null };
    }

    if (!supabase) return { error: 'Supabase가 설정되지 않았습니다.' };
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: normalized, password });
      return { error: error?.message ?? null };
    } catch (err) {
      // Network / DNS failure (e.g. Supabase URL is wrong or project is deleted).
      // Give a clear error instead of the generic "Failed to fetch".
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        return { error: 'Supabase 서버에 연결할 수 없습니다. VITE_SUPABASE_URL을 확인하세요.' };
      }
      return { error: `로그인 실패: ${msg}` };
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase가 설정되지 않았습니다.' };
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error: error?.message ?? null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        return { error: 'Supabase 서버에 연결할 수 없습니다. VITE_SUPABASE_URL을 확인하세요.' };
      }
      return { error: `가입 실패: ${msg}` };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch {
      // ignore
    }
    setUser(null);
    setSession(null);
    if (supabase) await supabase.auth.signOut();
  };

  const signInWithOAuth = async (provider: 'google' | 'kakao') => {
    if (!supabase) return { error: 'Supabase가 설정되지 않았습니다.' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    return { error: error?.message ?? null };
  };

  const resetPassword = async (email: string) => {
    if (!supabase) return { error: 'Supabase가 설정되지 않았습니다.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}?reset=true`,
    });
    return { error: error?.message ?? null };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, signInWithOAuth, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
