import React, { useEffect, useRef } from 'react';
import { loadTossPayments, TossPaymentsWidgets } from '@tosspayments/tosspayments-sdk';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface Props {
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<Props> = ({ amount, onSuccess, onClose }) => {
  const widgetRef = useRef<TossPaymentsWidgets | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Initialize Toss Payments Widget
    const initializeWidget = async () => {
      try {
        // [테스트용] 토스 클라이언트 키 (실 서비스 시 본인의 연동 키로 변경 필요)
        const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm'; 
        const customerKey = 'customer_12345'; // Added dummy customer key for testing
        // 결제위젯 초기화
        const tossPayments = await loadTossPayments(clientKey);
        const widgets = tossPayments.widgets({
          customerKey,
        });
        
        if (!isMounted) return;

        // 렌더링
        await widgets.setAmount({
          currency: 'KRW',
          value: amount,
        });

        await Promise.all([
          widgets.renderPaymentMethods({
            selector: '#payment-method',
            variantKey: 'DEFAULT',
          }),
          widgets.renderAgreement({
            selector: '#agreement',
            variantKey: 'AGREEMENT',
          }),
        ]);

        widgetRef.current = widgets;

      } catch (error) {
        console.error("Failed to initialize Toss Payments Widget:", error);
      }
    };

    initializeWidget();
    return () => { isMounted = false; };
  }, [amount]); // Removed customerKey since it's internally defined now.

  const handlePayment = async () => {
    if (!widgetRef.current) return;
    
    try {
      // 프론트엔드 모의 결제창 승인 호출
      // 서버 연동(Confirm) 전까지만의 플로우입니다. 백엔드가 없으므로 결제요청 화면만 띄우고
      // 성공 시 successUrl 로 리다이렉트되는 대신, 테스트 창을 닫으면 강제로 onSuccess 콜백을 주도록 할 수 있지만
      // 실제로는 결제창 결과를 처리해야 합니다. 
      // 토스 페이먼츠는 모달창을 띄워주고 결제가 끝나면 successURL로 이동합니다.
      // 현재 SPA에서 상태 유지를 위해 successUrl을 현재 주소로 두고 쿼리로 성공여부를 받거나 해야하지만
      // 편의상 여기서 onSuccess를 호출하여 결제 완료를 시뮬레이션 합니다. (원래는 서버 검증 필수)
      
      const customerKey = 'customer_12345'; // Fix for Toss SDK

      await widgetRef.current.requestPayment({
        orderId: `order_${new Date().getTime()}`,
        orderName: '운명 분석 결과 상세 리포트',
        successUrl: `${window.location.origin}${window.location.pathname}?payment=success`,
        failUrl: `${window.location.origin}${window.location.pathname}?payment=fail`,
        customerEmail: 'customer123@gmail.com',
        customerName: '김토스',
        customerMobilePhone: '01012341234',
      });
      // requestPayment 호출 시 새 탭/창으로 넘어감.
      
    } catch (err: any) {
      console.error(err);
      if (err.code === 'USER_CANCEL') {
        alert('결제를 취소하셨습니다.');
      } else {
        alert('결제 중 오류가 발생했습니다: ' + err.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl relative z-10 max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">안전 결제</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto bg-white flex-1">
          {/* 토스 페이먼츠 UI 렌더링 영역 */}
          <div id="payment-method" className="w-full" />
          <div id="agreement" className="w-full mt-4" />
          
          <div className="mt-8 bg-indigo-50 p-4 rounded-xl text-xs text-indigo-700 font-medium leading-relaxed">
            * 본 결제창은 토스페이먼츠(Toss Payments)의 안전한 결제 모듈을 사용합니다.<br/>
            * 결제 완료 후 1회성 정밀 운명 분석(AI 매퍼 렌더링) 작업이 즉시 시작됩니다.
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0">
          <button 
            onClick={handlePayment}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all flex justify-center items-center gap-2"
          >
            {amount.toLocaleString()}원 결제하기
          </button>
        </div>
      </motion.div>
    </div>
  );
};
