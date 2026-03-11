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
