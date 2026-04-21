import type { Translations } from './ko';

const en: Translations = {
  appName: 'Nutuyu Union SAJU',
  tagline: 'CAREER INSIGHT PLATFORM',

  landing: {
    badge: '💼 CAREER × SAJU',
    heroTitle1: "What's your",
    heroTitle2: 'career',
    heroTitle3: 'season right now?',
    subtitle1: 'Saju is not fate — it is career data.',
    subtitle2: 'Nutuyu Union SAJU reads your chart and turns it into',
    subtitle3strong: 'actionable career strategy',
    subtitle3end: '.',
    quote: 'Not reading fate — designing timing.',
    ctaStart: 'Analyze My Career Season',
    ctaFree: 'Free · ~30 seconds',
    ctaBottom: 'Start Now →',
    resultsLabel: 'What you get',
    features: [
      { icon: '🔯', title: 'Four Pillars Analysis', desc: 'Decode your chart through heavenly stems & hidden stems' },
      { icon: '🗓', title: '4 Seasons Roadmap', desc: 'Read 대운 to know when to expand vs. retreat' },
      { icon: '💼', title: 'Major × Job Match', desc: 'Tailored career tracks from 오행 + 십성' },
    ],
    resultItems: [
      { icon: '🏆', text: 'Top 5 Peak Years' },
      { icon: '📊', text: 'Lifetime Fortune Graph' },
      { icon: '🍂', text: 'Current Career Season' },
      { icon: '📅', text: 'Quarterly Strategy' },
      { icon: '🧬', text: 'Relationship Code' },
      { icon: '⚔️', text: 'Survival & Growth Plan' },
    ],
  },

  input: {
    step1Title: 'Date of Birth',
    step2Title: 'Additional Info',
    calendarLabel: 'Calendar Type',
    solar: 'Solar',
    lunar: 'Lunar',
    yearLabel: 'Birth Year',
    monthLabel: 'Month',
    dayLabel: 'Day',
    hourLabel: 'Birth Hour (Optional)',
    hourUnknown: 'Unknown',
    birthPlaceLabel: 'Birthplace (Optional)',
    birthPlacePlaceholder: 'e.g. Seoul, New York, London',
    genderLabel: 'Gender',
    male: 'Male',
    female: 'Female',
    mbtiLabel: 'MBTI (Optional)',
    mbtiUnknown: 'Unknown',
    nextBtn: 'Next →',
    backBtn: '← Back',
    analyzeBtn: 'Get Career Insight',
    step: 'Step',
    of: '/',
  },

  loading: {
    title: 'Crunching your career insights...',
  },

  error: {
    title: 'An error occurred during analysis',
    retry: 'Try Again',
    home: 'Go Home',
  },

  notification: {
    enableTitle: '🔔 Enable D-day Alerts',
    enableDesc: 'Get browser notifications for your career golden year D-days.',
    enableBtn: 'Enable Notifications',
    disabledMsg: 'Notifications are blocked. Please change this in your browser settings.',
    successMsg: 'Notifications enabled! We will remind you on your D-day.',
  },

  validation: {
    loading: 'AI cross-validating...',
    done: (pct: number) => `AI Cross-Validation Complete ✓ ${pct}% Agreement`,
  },
};

export default en;
