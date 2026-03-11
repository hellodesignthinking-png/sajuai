/**
 * CanvasExporter.ts — V45 Destiny Flex
 * html2canvas 기반 고화질 캔버스 내보내기 유틸리티
 *
 * ✦ scale 4x (4배 고해상도)
 * ✦ 캡처 전용 스타일 주입 (금박 글로우, 프레임 퀄리티)
 * ✦ PNG 다운로드 + 클립보드 복사 지원
 * ✦ 고유 시리얼 번호 생성 (FS-YYYYMMDD-XXXXXX)
 */

import html2canvas from 'html2canvas';

// ── 고유 시리얼 번호 생성 ─────────────────────────────────────────────────

export function generateSerial(): string {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(Math.random() * 900000 + 100000).toString();
    return `FS-${date}-${rand}`;
}

// ── 고화질 캡처 옵션 ─────────────────────────────────────────────────────

interface ExportOptions {
    scale?: number;          // 기본 4 (300DPI급)
    format?: 'png' | 'jpeg';
    quality?: number;        // jpeg 품질 0-1
    filename?: string;
    onProgress?: (step: string) => void;
}

// ── 메인 내보내기 함수 ───────────────────────────────────────────────────

export async function exportDestinyCanvas(
    elementId: string,
    options: ExportOptions = {}
): Promise<string | null> {
    const {
        scale = 4,
        format = 'png',
        quality = 1.0,
        filename = `Fate-Sync_Masterpiece_${generateSerial()}.png`,
        onProgress,
    } = options;

    const element = document.getElementById(elementId);
    if (!element) {
        console.error('[CanvasExporter] Element not found:', elementId);
        return null;
    }

    onProgress?.('🌌 캔버스 초기화 중...');

    try {
        const canvas = await html2canvas(element, {
            scale,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#050510',
            logging: false,
            // 캡처 전용 스타일 주입
            onclone: (clonedDoc) => {
                const target = clonedDoc.getElementById(elementId);
                if (!target) return;
                target.style.boxShadow = '0 0 120px rgba(212,175,55,0.6), 0 0 60px rgba(212,175,55,0.3)';
                target.style.borderRadius = '0'; // 캡처시 모서리 제거 (액자 효과)
                // 폰트 로딩 강제
                target.style.fontFamily = "'Noto Serif KR', 'Georgia', serif";
            },
        });

        onProgress?.('✨ 이미지 최적화 중...');

        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const dataUrl = canvas.toDataURL(mimeType, quality);

        onProgress?.('📥 다운로드 준비 중...');

        // 다운로드 트리거
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        onProgress?.('🏛️ 마스터피스 완성!');
        return dataUrl;
    } catch (err) {
        console.error('[CanvasExporter] Export failed:', err);
        return null;
    }
}

// ── 클립보드 복사 (모바일 공유용) ─────────────────────────────────────────

export async function copyToClipboard(dataUrl: string): Promise<boolean> {
    try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob }),
        ]);
        return true;
    } catch {
        return false;
    }
}

// ── Web Share API (모바일 네이티브 공유) ──────────────────────────────────

export async function shareDestiny(dataUrl: string, serial: string): Promise<boolean> {
    try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `FateSync-${serial}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare?.({ files: [file] })) {
            await navigator.share({
                title: 'Fate-Sync 나의 운명 명반',
                text: `✦ 황금빛 자미두수 명반 · #${serial} ✦\n나의 운명 과학 리포트 → fate-sync.com`,
                files: [file],
            });
            return true;
        }
        return false;
    } catch {
        return false;
    }
}
