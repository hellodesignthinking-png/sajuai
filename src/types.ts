// ── Career Strategist types (from src/types/index.ts) ──────────────────

export interface UserInput {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number; // -1 = 모름
  calendarType: 'solar' | 'lunar';
  birthPlace: string;
  mbti: string; // '모름' or one of 16 MBTI types
  gender: 'male' | 'female';
  // Career management inputs — used by Gemini prompts to personalize
  // growth_missions, networking_guide, yearly_strategy to the user's reality.
  specialty?: string;         // 전문 분야 (e.g., "UX 디자이너 5년차", "백엔드 개발")
  currentSituation?: string;  // 현재 상황 (e.g., "이직 준비", "창업 2년차")
}

export interface GoldenYear {
  year: number;
  score: number;
  reason: string;
}

export interface LifeCycleScore {
  age_range: string;
  score: number;
  description: string;
}

export type CareerSeason = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonDetails {
  season: CareerSeason;
  year_range: string;
  advice: string;
  warning: string;
}

export interface QuarterScore {
  q: string;
  score: number;
  strategy: string;
}

export interface Mission {
  type: string;
  content: string;
}

export interface YearlyStrategy {
  quarter_scores: QuarterScore[];
  d_day: { date: string; description: string };
  missions: Mission[];
}

export interface MBTIIntegration {
  type: string;
  career_synergy: string;
  blind_spot: string;
}

export interface SeasonCycleItem {
  season: CareerSeason;
  start_year: number;
  end_year: number;
  label: string;
  is_current: boolean;
}

export interface SeasonGuidance {
  season_title: string;
  core_message: string;
  actions: string[];
  warnings: string[];
  transition_warning: string | null;
  content_direction: string;
  avoid_content: string;
}

export interface NetworkingPerson {
  type: string;
  reason: string;
  how: string;
}

export interface NetworkingGuide {
  current_season_tip: string;
  people_to_meet: NetworkingPerson[];
  avoid: string;
}

export interface GrowthMission {
  type: 'crisis' | 'person' | 'skill';
  label: string;
  content: string;
  action: string;
}

export interface FourPillar {
  heavenly: string;
  earthly: string;
  meaning: string;
}

export interface HiddenStem {
  char: string;      // e.g. "갑(甲)"
  element: string;   // "목"
  tenGod: string;    // "편재(偏財)"
  role: '본기' | '중기' | '여기';
}

export interface PillarAnalysis {
  label: string;         // "년주" · "월주" · "일주" · "시주"
  heavenly: string;
  earthly: string;
  stemElement: string;   // 천간 오행
  branchElement: string; // 지지 오행
  stemTenGod: string;    // 일주는 "일원(日元)"
  branchTenGod: string;  // 지지 본기 기준
  hiddenStems: HiddenStem[];
}

export interface SajuDetail {
  four_pillars: {
    year: FourPillar;
    month: FourPillar;
    day: FourPillar;
    hour: FourPillar;
  };
  pillar_analysis?: {
    year: PillarAnalysis;
    month: PillarAnalysis;
    day: PillarAnalysis;
    hour: PillarAnalysis | null;
  };
  day_master: {
    element: string;
    character: string;
    description: string;
  };
  five_elements: {
    wood: number;
    fire: number;
    earth: number;
    water: number;
    metal: number;
  };
  favorable_element: string;
  unfavorable_element: string;
  personality_summary: string;
  current_luck_period: {
    period: string;
    element: string;
    influence: string;
  };
}

export interface SeasonReasoning {
  saju_basis: string;
  astrology_basis: string;
  numerology_basis: string;
  overall_reasoning: string;
}

// ── V63: Oracle Genesis — 4 Seasons Career Synthesis ─────────────
// Structured outputs that turn raw saju numbers into a career narrative.

export interface Gyeokguk {
  name: string;              // e.g., "정관격(正官格)", "식신생재격(食神生財格)"
  reasoning: string;         // 월지 본기/지장간 근거 3-5문장
  implication: string;       // 이 격국이 커리어·성격에 미치는 함의 3-5문장
}

export interface CareerSync {
  season_label: string;      // e.g., "가을: 수확의 시기"
  season_focus: string;      // 현재 계절에서 해야 할 일 3문장
  recommended_majors: string[];  // 2-4개 전공
  recommended_jobs: string[];    // 2-4개 직업군
  reasoning: string;         // 왜 이 전공·직업인지 (오행 + 십성 근거) 3-5문장
}

export interface RelationshipCode {
  leadership_style: string;      // 리더십 특성 2-3문장
  partnership_style: string;     // 파트너십/협업 스타일 2-3문장
  political_navigation: string;  // 조직 내 정치력·처세 2-3문장
  ten_gods_balance: string;      // 비겁·식상·재성·관성·인성 균형 진단 3-5문장
  synergy_people: string;        // 시너지 내는 사람 유형 2-3문장
  friction_people: string;       // 충돌하는 사람 유형 2-3문장
}

export interface SurvivalStrategy {
  habits_to_abandon: string[];   // 버려야 할 습관 3-5개
  energy_to_embrace: string[];   // 취해야 할 에너지 3-5개
  immediate_action: string;      // 지금 당장 실행 2-3문장
  ninety_day_plan: string;       // 90일 생존·성장 계획 3문장
  one_year_vision: string;       // 1년 후 되어야 할 모습 3문장
}

export interface CareerPentagon {
  leadership: number;  // 0-100
  execution: number;
  analysis: number;
  creativity: number;
  empathy: number;
  notes: string;       // 오각형 해석 2-3문장
}

export interface AnalysisResult {
  top5_golden_years: GoldenYear[];
  life_cycle_scores: LifeCycleScore[];
  current_season: CareerSeason;
  season_details: SeasonDetails;
  yearly_strategy: YearlyStrategy;
  mbti_integration: MBTIIntegration;
  sharp_feedback: string;
  season_cycle: SeasonCycleItem[];
  season_guidance: SeasonGuidance;
  networking_guide: NetworkingGuide;
  growth_missions: GrowthMission[];
  saju_detail?: SajuDetail;
  season_reasoning?: SeasonReasoning;
  saju_summary?: string;
  yearly_fortune?: string;
  // V63 additions
  gyeokguk?: Gyeokguk;
  career_sync?: CareerSync;
  relationship_code?: RelationshipCode;
  survival_strategy?: SurvivalStrategy;
  career_pentagon?: CareerPentagon;
}

// ── Fate / Saju app types ───────────────────────────────────────────────

export type FateStep = 'LANDING' | 'MODE_SELECT' | 'LOGIN' | 'SIGNUP' | 'SAJU' | 'FACE' | 'MBTI' | 'PALM' | 'WORRY' | 'TAROT' | 'ANALYZING' | 'REPORT';

export type AnalysisMode = 'INDIVIDUAL' | 'COMPAT_LOVE' | 'COMPAT_BUSINESS';

export interface SajuData {
  birthDate: string;
  birthTime: string;
  isLunar: boolean;
  gender: 'MALE' | 'FEMALE';
  birthRegion?: string;
}

export type MBTIType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export interface Expert {
  id: string;
  name: string;
  title: string;
  specialty: string;
  experience: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  price: number;
}

export interface Booking {
  expertId: string;
  date: string;
  time: string;
  userId: string;
}

export interface FateAnalysisResult {
  overallSummary: string; // 종합 요약
  saju: {
    element: string; // e.g., "Strong Fire"
    summary: string;
    yongSin?: string;
    yongSinPrinciple?: string; // 용신 선정의 학술적 원리 (억부, 조후, 통관 등)
    yongSinEvidence?: string; // 사용자의 사주 원국에서 나타나는 구체적 용신 근거 예시
    yongSinInterpretation?: string; // 용신에 대한 상세 해석과 활용법
    gyeokGuk?: string;
    gyeokGukPrinciple?: string; // 격국 판정의 학술적 원리 (월령, 지장간 등)
    gyeokGukEvidence?: string; // 사용자의 사주 원국에서 나타나는 구체적 격국 근거 예시
    gyeokGukInterpretation?: string; // 격국에 대한 상세 해석과 삶의 방향성
    elementalInteraction?: string;
    elementalStrength?: string; // 오행의 강약 분석
    elementalFlow?: string; // 기운의 흐름 (생화극제) 분석
    detailedElementAnalysis?: {
      wood: string;
      fire: string;
      earth: string;
      metal: string;
      water: string;
    }; // 각 오행별 개별 심층 분석
    masterInsight?: string; // 마스터의 비기 (심층 통찰)
    strengths?: string[]; // 사주의 주요 장점
    weaknesses?: string[]; // 사주의 주요 단점 및 보완법
    pros?: string; // 타고난 강점 (상세 서술)
    cons?: string; // 주의할 약점 (상세 서술)
    remedy?: string; // 운의 보완책 (상세 서술)
    complementaryPerson?: string; // 나를 보완해주는 사람(귀인)의 특징
    lifeAdvice?: string; // 단점 및 약점을 바탕으로 한 앞으로의 삶의 자세 조언
    keywords: string[];
    fiveElements: {
      wood: number;
      fire: number;
      earth: number;
      metal: number;
      water: number;
    };
    pillars: {
      year: string;
      month: string;
      day: string;
      hour: string;
    };
    dayMasterElement: string;
    /**
     * [V3 Advanced Feature] 대운 (10년 주기의 운의 흐름)
     */
    daewun?: {
      ageRange: string; // ex: "10-19", "20-29"
      pillar: string; // ex: "갑자(甲子)"
      luckScore: number; // 0-100
      keyword: string; // 10년의 핵심 키워드
      description: string; // 상세 설명
    }[];
    /**
     * [V3 Advanced Feature] 십이운성 (12 Life Stages) - 현재 생애 주기의 에너지 흐름
     */
    twelveLifeStages?: {
      stageName: string; // ex: "장생", "목욕", "관대" 등
      powerScore: number; // 에너지 점수 0-100
      description: string; // 해당 운성에서의 특성 및 조언
    }[];
  };
  physiognomy: {
    score: number;
    traits: string[];
    facialFeatures: {
      forehead?: string;
      eyes?: string;
      nose?: string;
      mouth?: string;
      jaw?: string;
    };
    /**
     * [V3 Advanced Feature] 황금비율 및 카르마 분석 (Golden Ratio & Karma)
     */
    goldenRatio?: {
      ratioScore: number; // 황금비율 일치도 점수 0-100
      asymmetryDetails: string; // 좌우 비대칭성에 담긴 삶의 흔적
    };
    karmaAnalysis?: string; // 미세표정/비대칭성에 담긴 내면의 성향 및 살아온 삶의 카르마 도해
  };
  palmistry: {
    lifeLine: string;
    headLine: string;
    heartLine: string;
    fateLine: string;
    scores: {
      life: number;
      head: number;
      heart: number;
      fate: number;
    };
    /**
     * [V3 Advanced Feature] 하이브리드 바이오리듬 (손금+사주)
     */
    hybridBiorhythm?: {
      month: string; // ex: "1월", "2월"
      vitality: number; // 생명선 기반 에너지 0-100
      intellect: number; // 두뇌선 기반 결정력 0-100
      emotion: number; // 감정선 기반 정서상태 0-100
    }[];
  };
  hybrid: {
    synergyScore: number;
    mbtiMatch: string;
    mbtiDestinySynergy?: string; // MBTI와 운명 데이터의 심층 연관성 분석
    mbtiFortuneNuance?: string; // MBTI 유형에 따른 운세 해석의 미묘한 차이
    mbtiSajuPsychologicalBridge?: string; // 사주 분석과 MBTI 성향의 심리적 가교 분석
    mbtiPsychologicalReaction?: string; // MBTI별 운세에 대한 심리적 반응 분석
    mbtiAcceptanceJourney?: string; // MBTI별 운세 수용 과정 및 심리적 변화 여정 분석
    mbtiCognitiveProcess?: string; // MBTI별 인지적 처리 과정 분석 (인지 기능 중심)
    mbtiEmotionalResponse?: string; // MBTI별 정서적 반응 및 스트레스 관리 분석
    mbtiBehavioralPattern?: string; // MBTI별 운세에 따른 실제 행동 방식 분석
    finalAdvice: string;
    fortuneTimeline: {
      month: string;
      score: number;
      keyword?: string; // 해당 월의 운세 핵심 키워드 (예: "재물운 상승", "건강 유의")
    }[];
    detailedLuck?: {
      daily: string;
      weekly: string;
      yearly: string;
      love: string;
      business: string;
    };
    cartoonInfo?: {
      characterName: string;
      originWork?: string;
      characterQuote?: string;
      appearanceContext?: string;
      characterDetail?: string;
      description: string;
      cartoonImageUrl?: string;
      visualPrompt?: string;
      archetypeTraits?: string[];
      tarotNumeral?: string;       // 로마 숫자 (예: "IX")
      tarotColorPalette?: string;  // 색상 팔레트 (예: "purple-gold")
    };
    syncTimestamp?: string;
    worryResolution?: string; // 사용자의 현재 고민에 대한 500자 맞춤 솔루션
  };
}

export interface UserFateData {
  userName?: string;    // 사용자 이름
  saju?: SajuData;
  faceImage?: string; // base64
  mbti?: MBTIType;
  palmImage?: string; // base64
  worry?: string; // 사용자의 현재 고민거리
}

export interface CompatibilityResult {
  mode: AnalysisMode;
  synergyScore: number;
  overallSummary: string; // 전체적인 궁합 요약
  loveAdvice?: string; // 애정 궁합 전용 조언
  businessAdvice?: string; // 사업 궁합 전용 팀워크 조언
  worryResolution?: string; // 사용자의 현재 고민에 대한 500자 맞춤 솔루션
  people: {
    name: string;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    cautionsForOther?: string[]; // 서로에게 조심해야 할 점 (애정/사업 궁합에서 상대방을 위해 주의할 점)
    roleInRelation: string; // 이 관계/팀에서 이 사람의 역할과 포지션
    cartoonInfo: {
      characterName: string;
      originWork?: string;
      description: string;
      visualPrompt?: string;
      tarotNumeral?: string;
      tarotColorPalette?: string;
      archetypeTraits?: string[];
      characterQuote?: string;
      cartoonImageUrl?: string;
    }
  }[];
  detailedScores?: {
    communication: number;
    affection?: number; // 애정 궁합 전용
    trust: number;
    sharedVision?: number; // 사업 궁합 전용
    problemSolving: number;
    overallStability: number;
  };
}
