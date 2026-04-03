import { useState, useEffect, useCallback } from 'react';

export interface VirtueState {
  gratitudeCount: number;
  completedMissions: string[];
  shareCount: number;
}

export interface Badge {
  id: string;
  icon: string;
  name: string;
  desc: string;
  earned: boolean;
}

const STORAGE_KEY = 'sajuai_virtue';

const DEFAULT_STATE: VirtueState = {
  gratitudeCount: 0,
  completedMissions: [],
  shareCount: 0,
};

function load(): VirtueState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function save(state: VirtueState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function computeBadges(state: VirtueState): Badge[] {
  return [
    {
      id: 'gratitude_seed',
      icon: '🌱',
      name: '감사의 씨앗',
      desc: '감사 3회 기록',
      earned: state.gratitudeCount >= 3,
    },
    {
      id: 'virtue_cycle',
      icon: '🔄',
      name: '복의 순환자',
      desc: '선행미션 5회 완료',
      earned: state.completedMissions.length >= 5,
    },
    {
      id: 'virtue_spreader',
      icon: '✨',
      name: '덕 전파자',
      desc: '결과 3회 공유',
      earned: state.shareCount >= 3,
    },
  ];
}

export function useVirtue() {
  const [state, setState] = useState<VirtueState>(load);

  useEffect(() => {
    save(state);
  }, [state]);

  const addGratitude = useCallback(() => {
    setState((s) => ({ ...s, gratitudeCount: s.gratitudeCount + 1 }));
  }, []);

  const completeMission = useCallback((missionId: string) => {
    setState((s) => {
      if (s.completedMissions.includes(missionId)) return s;
      return { ...s, completedMissions: [...s.completedMissions, missionId] };
    });
  }, []);

  const incrementShare = useCallback(() => {
    setState((s) => ({ ...s, shareCount: s.shareCount + 1 }));
  }, []);

  const badges = computeBadges(state);

  return {
    state,
    badges,
    addGratitude,
    completeMission,
    incrementShare,
  };
}
