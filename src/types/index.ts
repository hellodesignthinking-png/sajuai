export interface UserInput {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number; // -1 = 모름
  calendarType: 'solar' | 'lunar'; // 양력 / 음력
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

export interface YearlyMission {
  type: string; // '즉시' | '단기' | '장기'
  content: string;
}

export interface YearlyStrategy {
  quarter_scores: QuarterScore[];
  d_day: { date: string; description: string };
  missions: YearlyMission[];
}

export interface MBTIIntegration {
  type: string;
  career_synergy: string;
  blind_spot: string;
}

// ─── Phase 2 Types ───────────────────────────────────────────────────────────

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

// ─── Full Result ─────────────────────────────────────────────────────────────

export interface AnalysisResult {
  // Phase 1
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
}
