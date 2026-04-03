import { useLang } from '../../i18n';

export default function LanguageToggle() {
  const { lang, setLang } = useLang();

  return (
    <button
      onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
      style={{
        background: 'rgba(212,175,55,0.1)',
        border: '1px solid rgba(212,175,55,0.3)',
        borderRadius: '20px',
        padding: '5px 12px',
        fontSize: '12px',
        fontWeight: 700,
        color: 'var(--gold)',
        cursor: 'pointer',
        letterSpacing: '1px',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
      title={lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
    >
      <span>{lang === 'ko' ? '🇰🇷' : '🇺🇸'}</span>
      <span>{lang === 'ko' ? 'KO' : 'EN'}</span>
    </button>
  );
}
