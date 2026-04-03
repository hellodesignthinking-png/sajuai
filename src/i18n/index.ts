import { createContext, useContext } from 'react';
import ko from './ko';
import en from './en';
import type { Translations } from './ko';

export type Lang = 'ko' | 'en';

export const translations: Record<Lang, Translations> = { ko, en };

export const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}>({
  lang: 'ko',
  setLang: () => {},
  t: ko,
});

export function useLang() {
  return useContext(LangContext);
}
