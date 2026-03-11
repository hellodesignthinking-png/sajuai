import React, { useCallback, useState } from 'react';
import { Share2, Download, Loader2 } from 'lucide-react';

interface ShareCardGeneratorProps {
    tarotImageUrl?: string;
    characterName?: string;
    synergyScore: number;
    keywords: string[];
    userName?: string;
    dayMasterElement?: string;
    onClose?: () => void;
    id?: string;
}

const ELEMENT_COLORS: Record<string, string> = {
    '목': '#10b981', '화': '#ef4444', '토': '#f59e0b', '금': '#e2e8f0', '수': '#3b82f6',
    'wood': '#10b981', 'fire': '#ef4444', 'earth': '#f59e0b', 'metal': '#e2e8f0', 'water': '#3b82f6',
};

const ShareCardGenerator: React.FC<ShareCardGeneratorProps> = ({
    tarotImageUrl,
    characterName,
    synergyScore,
    keywords,
    userName = '사용자',
    dayMasterElement,
    onClose,
    id,
}) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generateShareImage = useCallback(async () => {
        if (isGenerating) return;
        setIsGenerating(true);

        try {
            const W = 1080;
            const H = 1920;
            const canvas = document.createElement('canvas');
            canvas.width = W;
            canvas.height = H;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // ── Background gradient ───────────────────────────
            const elementAccent = ELEMENT_COLORS[dayMasterElement?.toLowerCase() || ''] || '#D4AF37';
            const bg = ctx.createLinearGradient(0, 0, 0, H);
            bg.addColorStop(0, '#060612');
            bg.addColorStop(0.45, '#0d0d22');
            bg.addColorStop(1, '#060612');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, W, H);

            // Subtle radial glow top-center
            const radial = ctx.createRadialGradient(W / 2, 200, 0, W / 2, 200, 600);
            radial.addColorStop(0, elementAccent + '22');
            radial.addColorStop(1, 'transparent');
            ctx.fillStyle = radial;
            ctx.fillRect(0, 0, W, H);

            // ── Gold border (outer + inner) ───────────────────
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 5;
            ctx.strokeRect(36, 36, W - 72, H - 72);
            ctx.strokeStyle = 'rgba(212,175,55,0.25)';
            ctx.lineWidth = 1;
            ctx.strokeRect(52, 52, W - 104, H - 104);

            // ── Branding header ───────────────────────────────
            ctx.textAlign = 'center';
            ctx.fillStyle = '#D4AF37';
            ctx.font = 'bold 28px sans-serif';
            ctx.fillText('✦  F A T E · S Y N C  ✦', W / 2, 130);
            ctx.fillStyle = 'rgba(212,175,55,0.4)';
            ctx.font = '16px sans-serif';
            ctx.fillText('THE ORACLE THESIS', W / 2, 165);

            // Thin divider
            ctx.strokeStyle = 'rgba(212,175,55,0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(200, 185);
            ctx.lineTo(W - 200, 185);
            ctx.stroke();

            // ── Hero Tarot Image ──────────────────────────────
            const imgX = (W - 680) / 2;
            const imgY = 200;
            const imgW = 680;
            const imgH = 960;
            const imgR = 40;

            // Frame glow
            const glowGrad = ctx.createRadialGradient(W / 2, imgY + imgH / 2, imgH * 0.2, W / 2, imgY + imgH / 2, imgH * 0.7);
            glowGrad.addColorStop(0, 'transparent');
            glowGrad.addColorStop(1, elementAccent + '33');
            ctx.fillStyle = glowGrad;
            ctx.fillRect(0, imgY - 60, W, imgH + 120);

            if (tarotImageUrl) {
                try {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    await new Promise<void>((res, rej) => {
                        img.onload = () => res();
                        img.onerror = () => rej();
                        img.src = tarotImageUrl;
                    });
                    ctx.save();
                    ctx.beginPath();
                    (ctx as any).roundRect?.(imgX, imgY, imgW, imgH, imgR) ??
                        ctx.rect(imgX, imgY, imgW, imgH);
                    ctx.clip();
                    ctx.drawImage(img, imgX, imgY, imgW, imgH);

                    // Bottom gradient overlay on image
                    const imgOverlay = ctx.createLinearGradient(0, imgY + imgH * 0.5, 0, imgY + imgH);
                    imgOverlay.addColorStop(0, 'transparent');
                    imgOverlay.addColorStop(1, 'rgba(6,6,18,0.95)');
                    ctx.fillStyle = imgOverlay;
                    ctx.fillRect(imgX, imgY, imgW, imgH);

                    ctx.restore();
                } catch {
                    // Fallback placeholder
                    ctx.fillStyle = 'rgba(212,175,55,0.07)';
                    (ctx as any).roundRect?.(imgX, imgY, imgW, imgH, imgR) ?? ctx.rect(imgX, imgY, imgW, imgH);
                    ctx.fill();
                }
            }

            // Gold frame around image
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 3;
            ctx.beginPath();
            (ctx as any).roundRect?.(imgX, imgY, imgW, imgH, imgR) ?? ctx.rect(imgX, imgY, imgW, imgH);
            ctx.stroke();

            // Soul Card label inside image bottom
            ctx.fillStyle = elementAccent;
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('SOUL CARD', W / 2, imgY + imgH - 100);

            const shortName = (characterName || 'THE DESTINY').split('(')[0].trim().toUpperCase();
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${shortName.length > 14 ? 44 : 56}px serif`;
            ctx.fillText(shortName, W / 2, imgY + imgH - 45);

            // ── Sync Rate ─────────────────────────────────────
            const rateY = imgY + imgH + 70;
            ctx.fillStyle = 'rgba(212,175,55,0.5)';
            ctx.font = '18px sans-serif';
            ctx.fillText('DESTINY SYNC RATE', W / 2, rateY);

            // Big numeric score with gradient
            const scoreGrad = ctx.createLinearGradient(W / 2 - 150, 0, W / 2 + 150, 0);
            scoreGrad.addColorStop(0, elementAccent);
            scoreGrad.addColorStop(0.5, '#D4AF37');
            scoreGrad.addColorStop(1, elementAccent);
            ctx.fillStyle = scoreGrad;
            ctx.font = 'bold 160px sans-serif';
            ctx.fillText(`${synergyScore}`, W / 2, rateY + 145);

            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.font = '24px sans-serif';
            ctx.fillText('%', W / 2 + 130, rateY + 105);

            // Rank text
            const topPercent = Math.max(1, Math.round(100 - synergyScore));
            ctx.fillStyle = 'rgba(212,175,55,0.5)';
            ctx.font = 'italic 22px serif';
            ctx.fillText(`상위 ${topPercent}%의 운명적 궤적`, W / 2, rateY + 200);

            // ── Keywords as hashtags ──────────────────────────
            const kwY = rateY + 260;
            const kwTags = keywords.slice(0, 4).map(k => `#${k.replace(/\s/g, '_')}`);
            ctx.font = 'bold 30px sans-serif';
            ctx.fillStyle = elementAccent;

            // Measure and center hashtags
            const kwStr = kwTags.join('  ');
            ctx.fillText(kwStr, W / 2, kwY);

            // ── Divider ───────────────────────────────────────
            ctx.strokeStyle = 'rgba(212,175,55,0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(100, kwY + 50);
            ctx.lineTo(W - 100, kwY + 50);
            ctx.stroke();

            // ── Footer: user name + CTA ───────────────────────
            const footY = kwY + 110;
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold 36px sans-serif`;
            ctx.textAlign = 'left';
            ctx.fillText(`${userName} 님의 운명 궤적`, 100, footY);
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '22px sans-serif';
            ctx.fillText('당신의 운명도 지금 동기화하세요.', 100, footY + 48);

            // URL badge
            ctx.fillStyle = 'rgba(212,175,55,0.1)';
            ctx.strokeStyle = 'rgba(212,175,55,0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            (ctx as any).roundRect?.(100, footY + 80, 340, 52, 26) ?? ctx.rect(100, footY + 80, 340, 52);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#D4AF37';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('fate-sync.ai', 270, footY + 113);

            // Corner star ornaments
            ctx.fillStyle = 'rgba(212,175,55,0.4)';
            ctx.font = '32px serif';
            ctx.textAlign = 'center';
            ctx.fillText('✦', 90, 100);
            ctx.fillText('✦', W - 90, 100);
            ctx.fillText('✦', 90, H - 80);
            ctx.fillText('✦', W - 90, H - 80);

            // ── Export ────────────────────────────────────────
            const userName_safe = userName.replace(/[^a-zA-Z0-9가-힣]/g, '_');
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                const file = new File([blob], `Fate-Sync-Story-${userName_safe}.png`, { type: 'image/png' });

                if (navigator.share && navigator.canShare?.({ files: [file] })) {
                    try {
                        await navigator.share({
                            title: '나의 운명 아키타입 확인하기 | Fate-Sync',
                            text: `나의 운명 캐릭터는 ${characterName}! 싱크로율 ${synergyScore}% ✦ 당신의 운명도 동기화하세요.`,
                            files: [file],
                        });
                    } catch { /* user cancelled */ }
                } else {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = file.name;
                    a.click();
                    URL.revokeObjectURL(url);
                }
                setIsGenerating(false);
                onClose?.();
            }, 'image/png');

        } catch (err) {
            console.error('Share card generation failed:', err);
            setIsGenerating(false);
        }
    }, [isGenerating, tarotImageUrl, characterName, synergyScore, keywords, userName, dayMasterElement, onClose]);

    return (
        <button
            id={id}
            onClick={generateShareImage}
            disabled={isGenerating}
            className="flex-1 max-w-xs py-5 bg-gradient-to-r from-[#D4AF37]/20 to-amber-600/20 hover:from-[#D4AF37]/30 hover:to-amber-600/30 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all border border-[#D4AF37]/30 backdrop-blur-xl disabled:opacity-50 active:scale-95"
        >
            {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" />
            ) : (
                <Share2 className="w-5 h-5 text-[#D4AF37]" />
            )}
            <span className="text-[#D4AF37]">
                {isGenerating ? '카드 생성 중...' : '스토리 공유'}
            </span>
        </button>
    );
};

export default ShareCardGenerator;
