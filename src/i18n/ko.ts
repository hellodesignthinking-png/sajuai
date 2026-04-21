const ko = {
  // App name
  appName: '너튜유니온 SAJU',
  tagline: 'CAREER INSIGHT PLATFORM',

  // Landing
  landing: {
    badge: '💼 CAREER × SAJU',
    heroTitle1: '지금 가장 핫한',
    heroTitle2: '당신의',
    heroTitle3: '커리어 시즌은?',
    subtitle1: '사주는 운명이 아니라 커리어 데이터입니다.',
    subtitle2: '너튜유니온 SAJU가 당신의 원국을 읽고',
    subtitle3strong: '지금 당장 써먹을 전략',
    subtitle3end: '으로 정리해드려요.',
    quote: '운명을 보는 게 아니라, 타이밍을 설계하는 것',
    ctaStart: '내 커리어 시즌 분석하기',
    ctaFree: '무료 · 약 30초',
    ctaBottom: '바로 시작하기 →',
    resultsLabel: '이런 인사이트를 받아요',
    features: [
      { icon: '🔯', title: '사주 원국 분석', desc: '천간·지지·지장간으로 커리어 구조 해독' },
      { icon: '🗓', title: '4계절 로드맵', desc: '대운의 흐름으로 확장·수축 타이밍 판단' },
      { icon: '💼', title: '전공·천직 매칭', desc: '오행·십성으로 맞춤 직업군 추천' },
    ],
    resultItems: [
      { icon: '🏆', text: '커리어 전성기 Top 5' },
      { icon: '📊', text: '생애 주기 운 그래프' },
      { icon: '🍂', text: '현재 커리어 계절' },
      { icon: '📅', text: '올해 분기별 전략' },
      { icon: '🧬', text: '인간관계 코드' },
      { icon: '⚔️', text: '생존 & 성장 전략' },
    ],
  },

  // Input form
  input: {
    step1Title: '생년월일 입력',
    step2Title: '추가 정보',
    calendarLabel: '달력 유형',
    solar: '양력',
    lunar: '음력',
    yearLabel: '출생 년도',
    monthLabel: '월',
    dayLabel: '일',
    hourLabel: '출생 시간 (선택)',
    hourUnknown: '모름',
    birthPlaceLabel: '출생 지역 (선택)',
    birthPlacePlaceholder: '예: 서울, 부산, New York',
    genderLabel: '성별',
    male: '남성',
    female: '여성',
    mbtiLabel: 'MBTI (선택)',
    mbtiUnknown: '모름',
    nextBtn: '다음 →',
    backBtn: '← 뒤로',
    analyzeBtn: '커리어 인사이트 받기',
    step: '단계',
    of: '/',
  },

  // Loading
  loading: {
    title: '당신의 커리어 인사이트를 계산 중...',
  },

  // Error
  error: {
    title: '분석 중 오류가 발생했습니다',
    retry: '다시 시도하기',
    home: '처음으로',
  },

  // Notification
  notification: {
    enableTitle: '🔔 D-day 알림 설정',
    enableDesc: '커리어 전성기 D-day를 브라우저 알림으로 받아보세요.',
    enableBtn: '알림 허용',
    disabledMsg: '알림이 이미 차단되어 있습니다. 브라우저 설정에서 변경해주세요.',
    successMsg: '알림이 설정되었습니다! D-day에 알려드릴게요.',
  },

  // Validation
  validation: {
    loading: 'AI 교차 검증 중...',
    done: (pct: number) => `AI 교차 검증 완료 ✓ ${pct}% 일치`,
  },
};

export default ko;
export type Translations = typeof ko;
