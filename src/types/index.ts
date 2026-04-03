export interface UserInput {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number; // -1 = 모름
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

export interface AnalysisResult {
  top5_golden_years: GoldenYear[];
  life_cycle_scores: LifeCycleScore[];
  current_season: CareerSeason;
  season_details: SeasonDetails;
  yearly_strategy: YearlyStrategy;
  mbti_integration: MBTIIntegration;
  sharp_feedback: string;
}
