import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import type { CareerSeason } from '../../types';
import ShareCard from './ShareCard';
import { useVirtue } from '../../hooks/useVirtue';

interface Props {
  season: CareerSeason;
  peakYear: number;
  feedback: string;
  birthYear: number;
}

const SHARE_TEXT = (peakYear: number) =>
  `AI 책사가 분석한 나의 커리어 전성기는 ${peakYear}년! 너도 확인해봐 🔮`;
const SHARE_URL = 'https://sajuai-two.vercel.app';

export default function SharePanel({ season, peakYear, feedback, birthYear }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copying, setCopying] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const { incrementShare } = useVirtue();

  const generateImage = async (): Promise<HTMLCanvasElement | null> => {
    if (!cardRef.current) return null;
    try {
      return await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
    } catch {
      return null;
    }
  };

  const handleNativeShare = async () => {
    const text = SHARE_TEXT(peakYear);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'AI 책사 분석 결과', text, url: SHARE_URL });
        incrementShare();
      }
    } catch {
      // user cancelled or not supported
    }
  };

  const handleDownloadImage = async () => {
    setDownloaded(false);
    const canvas = await generateImage();
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'ai-chaeksa-result.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    setDownloaded(true);
    incrementShare();
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(SHARE_TEXT(peakYear));
    const url = encodeURIComponent(SHARE_URL);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    incrementShare();
  };

  const handleCopyUrl = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setUrlCopied(true);
      incrementShare();
      setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      // ignore
    } finally {
      setCopying(false);
    }
  };

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* Share Card Preview */}
      <div style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}>
          <ShareCard
            cardRef={cardRef}
            season={season}
            peakYear={peakYear}
            feedback={feedback}
            birthYear={birthYear}
          />
        </div>
      </div>

      {/* Share Buttons */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {/* Download image */}
        <button
          className="btn-primary"
          onClick={handleDownloadImage}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {downloaded ? '✓ 이미지 저장됨!' : '📸 카드 이미지 저장'}
        </button>

        {/* Native share (mobile) */}
        {canNativeShare && (
          <button
            className="btn-secondary"
            onClick={handleNativeShare}
            style={{ width: '100%' }}
          >
            📤 공유하기
          </button>
        )}

        {/* Twitter / X */}
        <button
          onClick={handleTwitterShare}
          style={{
            width: '100%',
            padding: '14px',
            border: '1px solid rgba(29,161,242,0.3)',
            background: 'rgba(29,161,242,0.06)',
            borderRadius: '10px',
            color: '#1da1f2',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
          }}
        >
          𝕏 Twitter에 공유하기
        </button>

        {/* Copy URL */}
        <button
          className="btn-secondary"
          onClick={handleCopyUrl}
          disabled={copying}
          style={{ width: '100%' }}
        >
          {urlCopied ? '✓ 링크 복사됨!' : '🔗 링크 복사하기'}
        </button>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
        공유할수록 주변에 좋은 기운을 나눌 수 있어요 ✨
      </p>
    </div>
  );
}
