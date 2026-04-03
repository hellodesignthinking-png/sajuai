import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { AnalysisResult, UserInput, CareerSeason } from '../../types';

// ─── Config ───────────────────────────────────────────────────────────────────

const SEASON_EMOJI: Record<CareerSeason, string> = {
  spring: '🌸',
  summer: '☀️',
  autumn: '🍂',
  winter: '❄️',
};

const SEASON_LABEL: Record<CareerSeason, string> = {
  spring: '성장의 봄',
  summer: '전성의 여름',
  autumn: '수확의 가을',
  winter: '내공의 겨울',
};

const SEASON_COLOR: Record<CareerSeason, string> = {
  spring: '#4ade80',
  summer: '#f97316',
  autumn: '#D4AF37',
  winter: '#60a5fa',
};

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadShareCount(): number {
  try {
    return parseInt(localStorage.getItem('virtue_share_count') || '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveShareCount(count: number) {
  try {
    localStorage.setItem('virtue_share_count', String(count));
  } catch {}
}

function awardShareBadge(count: number) {
  if (count < 3) return;
  try {
    const earned: string[] = JSON.parse(
      localStorage.getItem('virtue_earned_badges') || '[]',
    );
    if (!earned.includes('virtue_spreader')) {
      earned.push('virtue_spreader');
      localStorage.setItem('virtue_earned_badges', JSON.stringify(earned));
    }
  } catch {}
}

// ─── Canvas share card generator ──────────────────────────────────────────────

async function generateShareCard(
  season: CareerSeason,
  peakYear: number,
  feedback: string,
  birthYear: number,
): Promise<string> {
  // Wait for fonts to be available
  await document.fonts.ready;

  const W = 1200;
  const H = 630;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const FONT = '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  const GOLD = '#D4AF37';
  const SEASON_C = SEASON_COLOR[season];

  // ── Background
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, W, H);

  // ── Gradient overlay
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(212,175,55,0.10)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ── Left season stripe
  ctx.fillStyle = SEASON_C;
  ctx.fillRect(0, 0, 8, H);

  // ── Large background emoji (decorative)
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.font = `260px serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(SEASON_EMOJI[season], 780, 530);
  ctx.restore();

  // ── Header label
  ctx.font = `bold 22px ${FONT}`;
  ctx.fillStyle = GOLD;
  ctx.fillText('AI 책사  |  커리어 전략', 80, 80);

  // ── Season badge pill
  const badgeText = `${SEASON_EMOJI[season]}  ${SEASON_LABEL[season]}`;
  ctx.font = `bold 17px ${FONT}`;
  const badgeW = ctx.measureText(badgeText).width + 40;
  // pill background
  ctx.fillStyle = SEASON_C + '28';
  const bx = 80, by = 104, bh = 40, br = 20;
  ctx.beginPath();
  ctx.moveTo(bx + br, by);
  ctx.lineTo(bx + badgeW - br, by);
  ctx.arcTo(bx + badgeW, by, bx + badgeW, by + bh, br);
  ctx.lineTo(bx + badgeW, by + bh - br);
  ctx.arcTo(bx + badgeW, by + bh, bx, by + bh, br);
  ctx.lineTo(bx + br, by + bh);
  ctx.arcTo(bx, by + bh, bx, by, br);
  ctx.lineTo(bx, by + br);
  ctx.arcTo(bx, by, bx + badgeW, by, br);
  ctx.closePath();
  ctx.fill();
  // pill text
  ctx.fillStyle = SEASON_C;
  ctx.fillText(badgeText, 100, 130);

  // ── Birth year sub-label
  ctx.font = `17px ${FONT}`;
  ctx.fillStyle = '#666666';
  ctx.fillText(`${birthYear}년생의 커리어 전성기`, 80, 205);

  // ── Peak year – big headline
  ctx.font = `900 98px ${FONT}`;
  ctx.fillStyle = GOLD;
  ctx.fillText(`${peakYear}년`, 80, 322);

  // ── Sub headline
  ctx.font = `bold 26px ${FONT}`;
  ctx.fillStyle = '#F0EEE8';
  ctx.fillText('이 당신의 커리어 전성기입니다', 80, 370);

  // ── Feedback excerpt
  const shortFeedback = feedback.split(/[.!?。]/)[0].trim().slice(0, 52);
  ctx.font = `17px ${FONT}`;
  ctx.fillStyle = '#555555';
  ctx.fillText(`"${shortFeedback}..."`, 80, 428);

  // ── Divider line
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(80, 468, 760, 1);

  // ── Footer
  ctx.font = `16px ${FONT}`;
  ctx.fillStyle = '#444444';
  ctx.fillText('AI 책사  •  당신의 때를 알아라', 80, 498);

  ctx.font = `bold 20px ${FONT}`;
  ctx.fillStyle = GOLD;
  ctx.fillText('🔮  나도 확인하기  →', 80, 540);

  return canvas.toDataURL('image/png');
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  result: AnalysisResult;
  userInput: UserInput;
  peakYear: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShareSection({ result, userInput, peakYear }: Props) {
  const [shareCount, setShareCount] = useState(loadShareCount);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const season = result.current_season;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareMessage = `AI 책사가 분석한 나의 커리어 전성기는 ${peakYear}년! 너도 확인해봐 🔮`;

  // Initialize Kakao SDK if key is configured
  useEffect(() => {
    const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY as string | undefined;
    if (!kakaoKey) return;
    const Kakao = (window as Record<string, unknown>).Kakao as
      | { isInitialized?: () => boolean; init?: (key: string) => void }
      | undefined;
    if (Kakao && typeof Kakao.isInitialized === 'function' && !Kakao.isInitialized()) {
      Kakao.init?.(kakaoKey);
    }
  }, []);

  const incrementShare = useCallback(() => {
    const next = shareCount + 1;
    setShareCount(next);
    saveShareCount(next);
    awardShareBadge(next);
  }, [shareCount]);

  // ── Kakao share
  const handleKakaoShare = () => {
    const Kakao = (window as Record<string, unknown>).Kakao as
      | {
          isInitialized?: () => boolean;
          Share?: {
            sendDefault: (opts: Record<string, unknown>) => void;
          };
        }
      | undefined;

    if (Kakao?.isInitialized?.() && Kakao.Share) {
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: 'AI 책사 | 커리어 전략',
          description: shareMessage,
          link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
        },
        buttons: [
          {
            title: '나도 확인하기',
            link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
          },
        ],
      });
      incrementShare();
    } else {
      // Fallback: Kakao Story URL share
      window.open(
        `https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}`,
        '_blank',
        'noopener,noreferrer',
      );
      incrementShare();
    }
  };

  // ── Twitter/X share
  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    incrementShare();
  };

  // ── Native share (mobile)
  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: 'AI 책사 | 커리어 전략',
        text: shareMessage,
        url: shareUrl,
      });
      incrementShare();
    } catch {
      // user cancelled
    }
  };

  // ── Copy URL
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      incrementShare();
    } catch {}
  };

  // ── Generate & download share card image
  const handleGenerateCard = async () => {
    setGenerating(true);
    try {
      const dataUrl = await generateShareCard(
        season,
        peakYear,
        result.sharp_feedback,
        userInput.birthYear,
      );
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `AI책사_커리어카드_${peakYear}.png`;
      a.click();
    } finally {
      setGenerating(false);
    }
  };

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;
  const shareProgress = Math.min(shareCount / 3, 1);
  const shortFeedback = result.sharp_feedback.split(/[.!?。]/)[0].trim().slice(0, 60);

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* ── 공유 카드 미리보기 + 다운로드 ─────────────────── */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(0,0,0,0) 100%)',
          border: '1px solid rgba(212,175,55,0.22)',
          padding: '24px',
        }}
      >
        {/* Card preview */}
        <div
          style={{
            background: '#0a0a0a',
            border: '1px solid #1e1e1e',
            borderRadius: '14px',
            padding: '20px 20px 20px 28px',
            marginBottom: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Season stripe */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '5px',
              background: SEASON_COLOR[season],
              borderRadius: '4px 0 0 4px',
            }}
          />

          {/* Background emoji watermark */}
          <div
            style={{
              position: 'absolute',
              right: '12px',
              bottom: '8px',
              fontSize: '72px',
              opacity: 0.06,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {SEASON_EMOJI[season]}
          </div>

          <p
            style={{
              fontSize: '10px',
              color: 'var(--gold)',
              letterSpacing: '3px',
              marginBottom: '8px',
              fontWeight: 700,
            }}
          >
            AI 책사 | 커리어 전략
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: SEASON_COLOR[season] + '22',
              borderRadius: '100px',
              padding: '4px 12px',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontSize: '14px' }}>{SEASON_EMOJI[season]}</span>
            <span
              style={{
                fontSize: '12px',
                color: SEASON_COLOR[season],
                fontWeight: 700,
              }}
            >
              {SEASON_LABEL[season]}
            </span>
          </div>

          <p
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginBottom: '4px',
            }}
          >
            {userInput.birthYear}년생의 커리어 전성기
          </p>
          <p
            style={{
              fontSize: '40px',
              fontWeight: 900,
              color: 'var(--gold)',
              lineHeight: 1.1,
              marginBottom: '4px',
            }}
          >
            {peakYear}년
          </p>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text)',
              marginBottom: '14px',
              fontWeight: 700,
            }}
          >
            이 당신의 커리어 전성기입니다
          </p>
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}
          >
            &ldquo;{shortFeedback}...&rdquo;
          </p>
        </div>

        <button
          onClick={handleGenerateCard}
          disabled={generating}
          style={{
            width: '100%',
            padding: '13px',
            background: generating ? 'var(--border)' : 'rgba(212,175,55,0.1)',
            border: `1px solid ${generating ? 'var(--border)' : 'rgba(212,175,55,0.3)'}`,
            borderRadius: '10px',
            color: generating ? 'var(--text-muted)' : 'var(--gold)',
            fontSize: '14px',
            fontWeight: 700,
            cursor: generating ? 'default' : 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
          }}
        >
          {generating ? '🎨 이미지 생성 중...' : '💾 공유 카드 이미지 저장하기'}
        </button>
      </div>

      {/* ── 지인 3명 공유 챌린지 ─────────────────────────── */}
      <div
        className="card"
        style={{
          background: 'rgba(96,165,250,0.03)',
          border: '1px solid rgba(96,165,250,0.14)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '24px' }}>🔮</span>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: '13px',
                color: '#60a5fa',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              지인 3명에게 좋은 기운 나누기
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              3명에게 공유하면 &quot;덕 전파자&quot; 뱃지 획득!
            </p>
          </div>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 900,
              color: shareCount >= 3 ? 'var(--gold)' : 'var(--text-muted)',
            }}
          >
            {Math.min(shareCount, 3)}/3
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            background: 'var(--border)',
            borderRadius: '100px',
            height: '7px',
            overflow: 'hidden',
            marginBottom: '20px',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${shareProgress * 100}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{
              height: '100%',
              background:
                shareCount >= 3
                  ? 'linear-gradient(90deg, #D4AF37, #F0D060)'
                  : '#60a5fa',
              borderRadius: '100px',
            }}
          />
        </div>

        {/* Share buttons */}
        <div style={{ display: 'grid', gap: '10px' }}>
          {/* Kakao */}
          <button
            onClick={handleKakaoShare}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '14px 20px',
              background: '#FEE500',
              border: 'none',
              borderRadius: '12px',
              color: '#191600',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'opacity 0.18s',
              fontFamily: 'inherit',
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.87')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <span style={{ fontSize: '22px', lineHeight: 1 }}>💬</span>
            카카오톡으로 공유하기
          </button>

          {/* Twitter / X */}
          <button
            onClick={handleTwitterShare}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '14px 20px',
              background: '#000000',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'opacity 0.18s',
              fontFamily: 'inherit',
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.80')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <span
              style={{
                fontSize: '18px',
                fontWeight: 900,
                fontFamily: 'serif',
                lineHeight: 1,
              }}
            >
              𝕏
            </span>
            X (트위터)로 공유하기
          </button>

          {/* Native share — mobile only */}
          {canNativeShare && (
            <button
              onClick={handleNativeShare}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '14px 20px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'var(--text)',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: '20px', lineHeight: 1 }}>📤</span>
              다른 앱으로 공유하기
            </button>
          )}

          {/* Copy URL */}
          <button
            onClick={handleCopyUrl}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '14px 20px',
              background: copied ? 'rgba(74,222,128,0.07)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
              borderRadius: '12px',
              color: copied ? '#4ade80' : 'var(--text-muted)',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.22s',
              fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: '20px', lineHeight: 1 }}>{copied ? '✅' : '🔗'}</span>
            {copied ? '링크가 복사되었습니다!' : 'URL 복사하기'}
          </button>
        </div>

        {/* Completion message */}
        {shareCount >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '16px',
              padding: '14px 18px',
              background: 'rgba(212,175,55,0.08)',
              border: '1px solid rgba(212,175,55,0.28)',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '15px', color: 'var(--gold)', fontWeight: 700 }}>
              ✨ 덕 전파자 챌린지 완료!
            </p>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginTop: '4px',
                lineHeight: 1.5,
              }}
            >
              좋은 기운을 나눈 당신에게 복이 돌아옵니다.
            </p>
          </motion.div>
        )}
      </div>

      {/* ── 공유 메시지 미리보기 ─────────────────────────── */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '16px 18px',
        }}
      >
        <p
          style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            letterSpacing: '2px',
            marginBottom: '8px',
            fontWeight: 700,
          }}
        >
          공유 메시지
        </p>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text)',
            lineHeight: 1.7,
            fontStyle: 'italic',
          }}
        >
          &ldquo;{shareMessage}&rdquo;
        </p>
      </div>
    </div>
  );
}
