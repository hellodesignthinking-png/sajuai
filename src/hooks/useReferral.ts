/**
 * useReferral.ts — V46 Referral & Viral Loop
 * 사용자 고유의 인연 링크 생성 및 공유 성과 추적을 위한 훅
 */

import { useState, useCallback, useMemo } from 'react';

export function useReferralSystem(userId?: string) {
    const [referralCount, setReferralCount] = useState(0);
    const [credits, setCredits] = useState(100); // 기본 크레딧

    const referralLink = useMemo(() => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://fate-sync.com';
        const id = userId || 'anonymous';
        return `${baseUrl}/?ref=${id}`;
    }, [userId]);

    const trackReferral = useCallback(() => {
        // 실제 운영 시에는 백엔드 API 호출 (POST /api/referral/track)
        console.log('🌌 인연의 고리가 연결되었습니다: ', referralLink);
        setReferralCount(prev => prev + 1);
        setCredits(prev => prev + 50); // 친구 초대 시 크레딧 보상
    }, [referralLink]);

    const recordFlex = useCallback(() => {
        // 캔버스 액자 플렉스(공유/다운로드) 시 보상
        setCredits(prev => prev + 10);
    }, []);

    return {
        referralLink,
        referralCount,
        credits,
        trackReferral,
        recordFlex
    };
}
