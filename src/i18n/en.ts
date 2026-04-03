import type { Translations } from './ko';

const en: Translations = {
  appName: 'AI Strategist',
  tagline: 'CAREER STRATEGIST',

  landing: {
    badge: '⚔️ Zhuge Liang AI Advisor',
    heroTitle1: 'Know Your',
    heroTitle2: ' ',
    heroTitle3: 'Moment',
    subtitle1: 'Is it spring or winter for your career?',
    subtitle2: 'Your AI strategist uses Saju, Astrology & Numerology to',
    subtitle3strong: 'calculate your career strategy',
    subtitle3end: '.',
    quote: 'Those who know their timing conquer all',
    ctaStart: '⚔️ Analyze My Timing Now',
    ctaFree: 'Free · About 30 seconds',
    ctaBottom: 'Start for Free →',
    resultsLabel: 'Analysis Results',
    features: [
      { icon: '🔯', title: 'Saju Analysis', desc: 'Calculate your innate fortune structure via Four Pillars' },
      { icon: '♈', title: 'Western Astrology', desc: 'Analyze timing through planetary positions and houses' },
      { icon: '🔢', title: 'Numerology', desc: 'Calculate life cycles through birth date numerology' },
    ],
    resultItems: [
      { icon: '🏆', text: 'Career Golden Years Top 5' },
      { icon: '📊', text: 'Life Cycle Fortune Graph' },
      { icon: '🌸', text: 'Current Career Season' },
      { icon: '📅', text: 'Quarterly Strategy This Year' },
      { icon: '🧠', text: 'MBTI Synergy Analysis' },
      { icon: '⚡', text: "The Strategist's Sharp Advice" },
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
    analyzeBtn: '⚔️ Start Analysis',
    step: 'Step',
    of: '/',
  },

  loading: {
    title: 'The strategist is calculating...',
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
