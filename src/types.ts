export type FateStep = 'LANDING' | 'LOGIN' | 'SIGNUP' | 'SAJU' | 'FACE' | 'MBTI' | 'PALM' | 'ANALYZING' | 'REPORT';

export interface SajuData {
  birthDate: string;
  birthTime: string;
  isLunar: boolean;
  gender: 'MALE' | 'FEMALE';
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
  };
  physiognomy: {
    score: number;
    traits: string[];
    description: string;
    scores: {
      forehead: number;
      eyes: number;
      nose: number;
      mouth: number;
      chin: number;
    };
  };
  palmistry: {
    lifeLine: string;
    wealthLine: string;
    description: string;
    lines: {
      life: number;
      wisdom: number;
      heart: number;
      fate: number;
    };
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
  };
}

export interface UserFateData {
  userName?: string;    // 사용자 이름
  saju?: SajuData;
  faceImage?: string; // base64
  mbti?: MBTIType;
  palmImage?: string; // base64
}
