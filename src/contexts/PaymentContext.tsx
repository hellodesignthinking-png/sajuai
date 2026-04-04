import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface PaymentContextType {
  isPaid: boolean;
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

  return (
    <PaymentContext.Provider value={{ isPaid, isModalOpen, openPaymentModal, closePaymentModal, markAsPaid }}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error('usePayment must be used within PaymentProvider');
  return ctx;
}
