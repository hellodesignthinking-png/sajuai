import { useLang } from '../../i18n';

export default function LanguageToggle() {
  const { lang, setLang } = useLang();

  return (
    <button
      onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
      style={{
        background: '#ecfccb',
        border: '1px solid #84cc16',
        borderRadius: '20px',
        padding: '5px 12px',
        fontSize: '12px',
        fontWeight: 700,
        color: '#65a30d',
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
