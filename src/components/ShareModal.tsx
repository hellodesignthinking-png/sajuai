import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Download, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterName?: string;
  characterImageUrl?: string;
  userName?: string;
  shareText?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  characterName,
  characterImageUrl,
  userName,
  shareText,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgDownloaded, setImgDownloaded] = useState(false);
  const [instaToast, setInstaToast] = useState(false);

  const siteUrl = window.location.origin;
  const shareTitle = `${userName || '나'}의 AI 운명 타로카드 - Fate Sync`;
  const shareDescription = shareText ||
    `나의 운명 캐릭터는 "${characterName}"! AI가 사주·관상·손금을 분석한 나만의 운명 타로카드를 확인해보세요.`;
  const shareUrl = siteUrl;

  // ─── 소셜 공유 링크 ───────────────────────────────────────
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareDescription)}&url=${encodeURIComponent(shareUrl)}`;

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareDescription)}`;

  const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareDescription)}`;

  // 카카오 SDK는 주로 key 필요, 여기선 카카오 채널 공유 링크 fallback 사용
  const kakaoShareUrl = `https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('링크 복사에 실패했습니다.');
    }
  };

  const handleDownloadImage = async () => {
    if (!characterImageUrl) return;
    try {
      const response = await fetch(characterImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fate-sync-tarot-${characterName || 'card'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setImgDownloaded(true);
      setTimeout(() => setImgDownloaded(false), 2000);
    } catch {
      alert('이미지 저장에 실패했습니다.');
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      const shareData: ShareData = {
        title: shareTitle,
        text: shareDescription,
        url: shareUrl,
      };
      // 이미지가 있고 지원되면 파일 공유도 시도
      if (characterImageUrl) {
        try {
          const response = await fetch(characterImageUrl);
          const blob = await response.blob();
          const file = new File([blob], 'fate-sync-tarot.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ ...shareData, files: [file] });
            return;
          }
        } catch { /* fall through to text only share */ }
      }
      await navigator.share(shareData);
    } catch { /* user cancelled */ }
  };

  // 인스타그램: 웹에서 직접 이미지 업로드 API 없음 → 이미지 저장 후 앱 오픈 안내
  const handleInstagramShare = async () => {
    // 1) 이미지 먼저 저장
    if (characterImageUrl) {
      try {
        const response = await fetch(characterImageUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fate-sync-tarot-${characterName || 'card'}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch { /* ignore download error */ }
    }
    // 2) 인스타 앱 딥링크 시도 (모바일) → 실패하면 웹으로 이동
    const deepLink = 'instagram://story-camera';
    const webLink = 'https://www.instagram.com/';
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = deepLink;
      setTimeout(() => window.open(webLink, '_blank'), 1500);
    } else {
      window.open(webLink, '_blank');
    }
    // 3) 토스트 안내
    setInstaToast(true);
    setTimeout(() => setInstaToast(false), 4000);
  };

  const SNS_BUTTONS = [
    {
      label: '카카오스토리',
      color: '#FAE100',
      textColor: '#3C1E1E',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M12 3C6.48 3 2 6.73 2 11.36c0 2.95 1.85 5.55 4.64 7.05l-.82 3.05c-.07.27.21.49.45.35L9.92 19.6A11.4 11.4 0 0012 19.72c5.52 0 10-3.73 10-8.36S17.52 3 12 3z" />
        </svg>
      ),
      onClick: () => window.open(kakaoShareUrl, '_blank'),
    },
    {
      label: 'X (트위터)',
      color: '#000000',
      textColor: '#ffffff',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      onClick: () => window.open(twitterShareUrl, '_blank'),
    },
    {
      label: '페이스북',
      color: '#1877F2',
      textColor: '#ffffff',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      onClick: () => window.open(facebookShareUrl, '_blank'),
    },
    {
      label: 'LINE',
      color: '#06C755',
      textColor: '#ffffff',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
      ),
      onClick: () => window.open(lineShareUrl, '_blank'),
    },
    {
      label: '인스타그램',
      color: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
      textColor: '#ffffff',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
      onClick: handleInstagramShare,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#1a1a2e] rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Handle bar (mobile) */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="text-lg font-black text-white tracking-tight">공유하기</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Tarot Card Preview */}
            {characterImageUrl && (
              <div className="px-6 pb-4">
                <div className="relative flex items-center gap-4 p-4 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/20 rounded-2xl">
                  <img
                    src={characterImageUrl}
                    alt={characterName}
                    className="w-16 h-24 object-cover rounded-xl border border-white/20 shadow-lg flex-shrink-0"
                    style={{ filter: 'drop-shadow(0 0 12px rgba(139,92,246,0.5))' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-purple-300 uppercase tracking-widest font-black mb-0.5">나의 운명 타로카드</p>
                    <p className="text-white font-black text-base truncate">{characterName}</p>
                    <p className="text-white/50 text-xs mt-1 leading-relaxed line-clamp-2">{shareDescription}</p>
                  </div>
                </div>
              </div>
            )}

            {/* SNS Icons */}
            <div className="px-6 pb-4">
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-3">소셜 네트워크</p>
              <div className="grid grid-cols-5 gap-2">
                {SNS_BUTTONS.map((sns) => (
                  <button
                    key={sns.label}
                    onClick={sns.onClick}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 group-active:scale-95"
                      style={{ background: sns.color, color: sns.textColor }}
                    >
                      {sns.icon}
                    </div>
                    <span className="text-[9px] text-white/50 font-medium group-hover:text-white/80 transition-colors text-center leading-tight">{sns.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Instagram Toast 안내 */}
            {instaToast && (
              <div className="mx-6 mb-3 p-3 bg-gradient-to-r from-pink-900/60 to-purple-900/60 border border-pink-500/30 rounded-2xl flex items-start gap-2 text-xs text-pink-200">
                <span className="text-base flex-shrink-0">📸</span>
                <span>타로카드 이미지가 저장되었습니다! 인스타그램 앱에서 <strong>사진 업로드 → 저장된 이미지 선택</strong>으로 공유하세요.</span>
              </div>
            )}

            {/* Divider */}
            <div className="mx-6 border-t border-white/5 mb-4" />

            {/* Action Buttons */}
            <div className="px-6 pb-8 space-y-2">
              {/* Native Share (Mobile) */}
              {!!(typeof navigator !== 'undefined' && (navigator as any).share) && (
                <button
                  onClick={handleNativeShare}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                  </svg>
                  내 앱으로 공유하기
                </button>
              )}

              {/* Download Image */}
              {characterImageUrl && (
                <button
                  onClick={handleDownloadImage}
                  className="w-full py-3.5 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 rounded-2xl font-black text-sm text-purple-200 flex items-center justify-center gap-2 transition-all"
                >
                  {imgDownloaded ? (
                    <><Check className="w-5 h-5 text-green-400" /> 저장 완료!</>
                  ) : (
                    <><Download className="w-5 h-5" /> 타로카드 이미지 저장</>
                  )}
                </button>
              )}

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-sm text-white/70 flex items-center justify-center gap-2 transition-all"
              >
                {copied ? (
                  <><Check className="w-5 h-5 text-green-400" /> 링크 복사됨!</>
                ) : (
                  <><Link2 className="w-5 h-5" /> 링크 복사하기</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
