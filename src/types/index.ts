export interface UserInput {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number; // -1 = 모름
  calendarType: 'solar' | 'lunar';
  birthPlace: string;
  mbti: string; // '모름' or one of 16 MBTI types
  gender: 'male' | 'female';
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

// Phase 2 types
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

export interface SajuDetail {
  four_pillars: {
    year: FourPillar;
    month: FourPillar;
    day: FourPillar;
    hour: FourPillar;
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

export interface AnalysisResult {
  top5_golden_years: GoldenYear[];
  life_cycle_scores: LifeCycleScore[];
  current_season: CareerSeason;
  season_details: SeasonDetails;
  yearly_strategy: YearlyStrategy;
  mbti_integration: MBTIIntegration;
  sharp_feedback: string;
  // Phase 2
  season_cycle: SeasonCycleItem[];
  season_guidance: SeasonGuidance;
  networking_guide: NetworkingGuide;
  growth_missions: GrowthMission[];
  // Phase 3
  saju_detail?: SajuDetail;
  season_reasoning?: SeasonReasoning;
  // Phase 4
  saju_summary?: string;
  yearly_fortune?: string;
}
