const ko = {
  // App name
  appName: 'AI 책사',
  tagline: 'CAREER STRATEGIST',

  // Landing
  landing: {
    badge: '⚔️ 제갈량 AI 책사',
    heroTitle1: '당신의 때',
    heroTitle2: '를',
    heroTitle3: '알아라',
    subtitle1: '지금이 봄인가, 겨울인가.',
    subtitle2: 'AI 책사가 사주·점성술·수비학으로',
    subtitle3strong: '당신의 커리어 전략',
    subtitle3end: '을 계산합니다.',
    quote: '때를 아는 자가 천하를 얻는다',
    ctaStart: '⚔️ 지금 내 때 분석하기',
    ctaFree: '무료 · 약 30초 소요',
    ctaBottom: '무료로 시작하기 →',
    resultsLabel: '분석 결과',
    features: [
      { icon: '🔯', title: '사주팔자 분석', desc: '천간지지로 타고난 운의 구조를 계산' },
      { icon: '♈', title: '서양 점성술', desc: '행성 위치와 하우스로 타이밍을 분석' },
      { icon: '🔢', title: '수비학', desc: '생년월일 수비학으로 인생 주기를 계산' },
    ],
    resultItems: [
      { icon: '🏆', text: '커리어 전성기 Top 5' },
      { icon: '📊', text: '생애 주기 운 그래프' },
      { icon: '🌸', text: '현재 커리어 계절' },
      { icon: '📅', text: '올해 분기별 전략' },
      { icon: '🧠', text: 'MBTI 시너지 분석' },
      { icon: '⚡', text: '책사의 날카로운 한마디' },
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
    analyzeBtn: '⚔️ 분석 시작',
    step: '단계',
    of: '/',
  },

  // Loading
  loading: {
    title: '책사가 계산 중입니다...',
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
