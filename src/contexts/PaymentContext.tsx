import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

// ──────────────────────────────────────────────────────────────
// Test-mode flag — flip to `false` when re-enabling the paywall
// + reconnecting Toss Payments for real billing.
//
// When `true`: every premium section renders fully unlocked but shows a
// "💎 PREMIUM" ribbon so you can still see *where the free/paid boundary
// will be*. PricingCard still renders as a visual preview.
// When `false`: normal gating — only paid or admin users see premium.
// ──────────────────────────────────────────────────────────────
const TEST_MODE_SHOW_ALL = true;

interface PaymentContextType {
  isPaid: boolean;
  isTestMode: boolean;
  /** True when the user should see all premium content —
   *  paid real users, admin emails, or TEST_MODE_SHOW_ALL. */
  canAccessPremium: boolean;
  isModalOpen: boolean;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
  markAsPaid: () => void;
}

const PaymentContext = createContext<PaymentContextType | null>(null);

const STORAGE_KEY = 'sajuai_paid';
const ADMIN_EMAILS = ['taina@ant3na.com'];

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [isPaid, setIsPaid] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const isAdmin = !!(user?.email && ADMIN_EMAILS.includes(user.email));

  useEffect(() => {
    if (isAdmin || localStorage.getItem(STORAGE_KEY) === 'true') {
      setIsPaid(true);
    }
  }, [isAdmin]);

  const openPaymentModal = useCallback(() => setIsModalOpen(true), []);
  const closePaymentModal = useCallback(() => setIsModalOpen(false), []);

  const markAsPaid = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsPaid(true);
    setIsModalOpen(false);
  }, []);

  const canAccessPremium = isPaid || TEST_MODE_SHOW_ALL;

  return (
    <PaymentContext.Provider value={{
      isPaid,
      isTestMode: TEST_MODE_SHOW_ALL,
      canAccessPremium,
      isModalOpen,
      openPaymentModal,
      closePaymentModal,
      markAsPaid,
    }}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error('usePayment must be used within PaymentProvider');
  return ctx;
}
