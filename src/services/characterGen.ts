/**
 * ============================================================
 *  Fate-Sync: 타로카드 이미지 생성 엔진
 *
 *  1차: /api/generate-image (Vercel Serverless → Gemini AI)
 *  2차: Canvas2D 합성 fallback (사용자 얼굴 + 타로 프레임)
 *
 *  ✅ SECURE: API 키는 서버 환경변수에만 존재
 * ============================================================
 */

// ─── AI 타로 이미지 생성 (→ /api/generate-image) ──────────
export async function generateAiTarotImage(
  visualPrompt: string,
  numeral: string,
  userName: string,
  cardNameEN: string,
  faceImageBase64?: string
): Promise<string | null> {
  console.log('TAROT-AI: /api/generate-image 요청 시작...');

  // 얼굴 사진이 있을 때와 없을 때 프롬프트 분기
  let fullPrompt: string;

  if (faceImageBase64) {
    const costumeOnly = visualPrompt
      .replace(/tony stark/gi, 'a genius inventor')
      .replace(/iron man/gi, 'a high-tech armored hero')
      .replace(/아이언맨/g, '첨단 갑옷을 입은 영웅')
      .replace(/토니 스타크/g, '천재 발명가');

    fullPrompt = `You are painting a character portrait of the person in the attached photo, styled as a classic Rider-Waite tarot card crossed with high-quality Anime style (e.g., Studio Ghibli, Demon Slayer, or One Piece).

⚠️ ABSOLUTE RULE: The person in the attached photo is your ONLY reference for the face, but properly stylized into anime art.

STEP 1 — STUDY THE PHOTO CAREFULLY:
Look at the attached photo and memorize:
• Their EXACT hairstyle (length, color, texture, parting)
• Any headwear or glasses MUST appear in the card
• Facial hair must match the photo
• Their face shape, eye shape, nose, and lips

STEP 2 — PAINT THEIR PORTRAIT IN ANIME TAROT STYLE:
• Draw the user's face in a premium Anime style (vibrant colors, expressive eyes, stylized shading).
• Frame the character within a 19th-century classic 'Rider-Waite' Tarot Card border and symbolic layout.
• Keep the user's real hairstyle and facial hair carefully adapted to the anime aesthetic.

STEP 3 — ADD COSTUME & CARD ELEMENTS:
Card Name: "${numeral} - ${cardNameEN}"
• Dress the anime portrait character in a costume inspired by: ${costumeOnly}
• The face belongs to the PHOTO PERSON (anime-stylized), the outfit and props belong to the tarot character "${cardNameEN}".
• Add the 'FATE-SYNC' logo elegantly near the top border.
• Roman numeral "${numeral}" at the top, and "${cardNameEN}" written clearly at the bottom.
• Background should be mystical and fit the character's tarot theme.
• Professional tarot card proportions (2:3).

Generate ONLY the tarot card image.`;
  } else {
    fullPrompt = `Create a classic Rider-Waite tarot card "${numeral} - ${cardNameEN}" fused with high-quality Anime style (Studio Ghibli / Demon Slayer aesthetic).

Character: ${visualPrompt}

Art direction:
- Anime character set within a classic 19th-century Rider-Waite Tarot bordering and symbolic layout.
- Upper body portrait, ornate golden border, mystical symbols.
- Include 'FATE-SYNC' logo elegantly near the top border.
- Roman numeral "${numeral}" at the top, and "${cardNameEN}" clearly at the bottom.
- Professional tarot card proportions (2:3).

Generate ONLY the tarot card image.`;
  }

  try {
    // 얼굴 이미지 Base64 준비
    let faceData: string | undefined;
    let faceMime: string | undefined;
    if (faceImageBase64) {
      if (faceImageBase64.includes(',')) {
        const parts = faceImageBase64.split(',');
        faceData = parts[1];
        faceMime = faceImageBase64.includes('image/png') ? 'image/png' : 'image/jpeg';
      } else {
        faceData = faceImageBase64;
        faceMime = 'image/jpeg';
      }
    }

    const body: Record<string, any> = { prompt: fullPrompt };
    if (faceData && faceMime) {
      body.faceImageBase64 = faceData;
      body.faceMimeType = faceMime;
    }

    const res = await fetch('http://localhost:8000/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      console.warn('TAROT-AI: 서버 오류:', e.error);
      return null;
    }

    const { imageBase64, mimeType } = await res.json();
    console.log('TAROT-AI: ✅ 이미지 생성 성공');
    return `data:${mimeType};base64,${imageBase64}`;
  } catch (err) {
    console.error('TAROT-AI: 전체 실패:', err);
    return null;
  }
}

// ─── 타로카드 합성 (진짜 타로카드 스타일) ────────────
export async function generateTarotCard(
  faceImageBase64: string,
  cardNameKR: string,
  cardNameEN: string,
  numeral: string,
  colorPalette: string
): Promise<string> {
  console.log(`TAROT-CARD: "${numeral} ${cardNameKR}" 카드 합성 시작...`);

  const canvas = document.createElement('canvas');
  const W = 600;
  const H = 900;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const colors = getColorPalette(colorPalette);

  // ━━━ 1. 배경 — 고대 카드 질감 ━━━
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#1a0e2e');
  bgGrad.addColorStop(0.3, '#12081f');
  bgGrad.addColorStop(0.7, '#0d0618');
  bgGrad.addColorStop(1, '#1a0e2e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 종이 텍스처 노이즈
  drawPaperTexture(ctx, W, H);

  // ━━━ 2. 외곽 장식 프레임 ━━━
  drawOrnateFrame(ctx, W, H, colors);

  // ━━━ 3. 상단: 로마 숫자 + 카드 이름 ━━━
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 로마 숫자
  ctx.font = 'bold 28px "Noto Serif KR", Georgia, "Times New Roman", serif';
  ctx.fillStyle = colors.gold;
  ctx.shadowColor = colors.gold;
  ctx.shadowBlur = 12;
  ctx.fillText(numeral, W / 2, 50);
  ctx.shadowBlur = 0;
  ctx.restore();

  // ━━━ 4. 사용자 얼굴 — 회화 스타일 변환 ━━━
  const imgArea = { x: 55, y: 80, w: W - 110, h: H - 280 };

  try {
    const faceImg = await loadImage(faceImageBase64);

    // 임시 캔버스에서 아트 필터 처리
    const artCanvas = document.createElement('canvas');
    artCanvas.width = imgArea.w;
    artCanvas.height = imgArea.h;
    const artCtx = artCanvas.getContext('2d')!;

    // 이미지 중앙 크롭
    const srcRatio = faceImg.width / faceImg.height;
    const dstRatio = imgArea.w / imgArea.h;
    let sx = 0, sy = 0, sw = faceImg.width, sh = faceImg.height;
    if (srcRatio > dstRatio) {
      sw = faceImg.height * dstRatio;
      sx = (faceImg.width - sw) / 2;
    } else {
      sh = faceImg.width / dstRatio;
      sy = (faceImg.height - sh) / 2;
    }
    artCtx.drawImage(faceImg, sx, sy, sw, sh, 0, 0, imgArea.w, imgArea.h);

    // 아트 필터 1: 대비/채도 강화
    artCtx.filter = 'contrast(1.3) saturate(0.7) sepia(0.3)';
    artCtx.drawImage(artCanvas, 0, 0);
    artCtx.filter = 'none';

    // 아트 필터 2: 컬러 오버레이 (카드 테마색)
    artCtx.globalCompositeOperation = 'overlay';
    artCtx.fillStyle = `${colors.tint}30`;
    artCtx.fillRect(0, 0, imgArea.w, imgArea.h);
    artCtx.globalCompositeOperation = 'source-over';

    // 아트 필터 3: 비네팅 (가장자리 어둡게)
    const vignette = artCtx.createRadialGradient(imgArea.w / 2, imgArea.h / 2, imgArea.w * 0.25, imgArea.w / 2, imgArea.h / 2, imgArea.w * 0.65);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(0.7, 'rgba(0,0,0,0.15)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
    artCtx.fillStyle = vignette;
    artCtx.fillRect(0, 0, imgArea.w, imgArea.h);

    // 아트 필터 4: 상단/하단 페이드
    const fadeTop = artCtx.createLinearGradient(0, 0, 0, imgArea.h);
    fadeTop.addColorStop(0, 'rgba(26,14,46,0.7)');
    fadeTop.addColorStop(0.12, 'rgba(26,14,46,0)');
    fadeTop.addColorStop(0.88, 'rgba(26,14,46,0)');
    fadeTop.addColorStop(1, 'rgba(26,14,46,0.7)');
    artCtx.fillStyle = fadeTop;
    artCtx.fillRect(0, 0, imgArea.w, imgArea.h);

    // 메인 캔버스에 아치형 클리핑으로 그리기
    ctx.save();
    drawArchShape(ctx, imgArea.x, imgArea.y, imgArea.w, imgArea.h, 24);
    ctx.clip();
    ctx.drawImage(artCanvas, imgArea.x, imgArea.y);
    ctx.restore();

    // 이미지 영역 테두리 (아치형)
    ctx.save();
    drawArchShape(ctx, imgArea.x, imgArea.y, imgArea.w, imgArea.h, 24);
    ctx.strokeStyle = colors.gold;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = colors.gold;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
    // 안쪽 얇은 테두리
    drawArchShape(ctx, imgArea.x + 4, imgArea.y + 4, imgArea.w - 8, imgArea.h - 8, 20);
    ctx.strokeStyle = `${colors.gold}50`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

  } catch (e) {
    console.warn('TAROT-CARD: 얼굴 이미지 로드 실패');
    // 이미지 없으면 신비 배경
    ctx.save();
    drawArchShape(ctx, imgArea.x, imgArea.y, imgArea.w, imgArea.h, 24);
    const fallback = ctx.createRadialGradient(W / 2, imgArea.y + imgArea.h / 2, 30, W / 2, imgArea.y + imgArea.h / 2, imgArea.w / 2);
    fallback.addColorStop(0, colors.center);
    fallback.addColorStop(1, '#0d0618');
    ctx.fillStyle = fallback;
    ctx.fill();
    ctx.restore();
  }

  // ━━━ 5. 하단: 카드 이름 + 장식 ━━━
  const lowerY = H - 160;

  // 구분 장식선
  drawDecorativeLine(ctx, 80, lowerY - 10, W - 80, colors.gold);

  // 한글 카드 이름
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 34px "Noto Serif KR", Georgia, serif';
  ctx.fillStyle = colors.gold;
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 15;
  ctx.fillText(cardNameKR, W / 2, lowerY + 25);
  ctx.shadowBlur = 0;

  // 영어 이름
  ctx.font = 'italic 16px Georgia, "Times New Roman", serif';
  ctx.fillStyle = `${colors.gold}AA`;
  ctx.fillText(cardNameEN, W / 2, lowerY + 58);

  // 하단 장식선
  drawDecorativeLine(ctx, 80, lowerY + 80, W - 80, colors.gold);

  // FATE-SYNC 브랜딩
  ctx.font = '600 9px sans-serif';
  ctx.fillStyle = '#ffffff25';
  ctx.fillText('✦ F A T E - S Y N C ✦', W / 2, H - 40);
  ctx.restore();

  // ━━━ 6. 장식 요소 ━━━
  drawCornerStars(ctx, W, H, colors.gold);
  drawMysticalParticles(ctx, W, H, colors.particle);

  const result = canvas.toDataURL('image/png');
  console.log(`TAROT-CARD: ✅ "${numeral} ${cardNameKR}" 합성 완료!`);
  return result;
}

// ─── 타로카드 다운로드 ─────────────────────────────
export function downloadTarotCard(base64: string, cardName: string) {
  const link = document.createElement('a');
  link.download = `fate-sync-tarot-${cardName.replace(/\s/g, '_')}.png`;
  link.href = base64;
  link.click();
}

// ─── 유틸리티 ───────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// 아치형 (타로카드 상단 둥근 아치)
function drawArchShape(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// 종이 텍스처
function drawPaperTexture(ctx: CanvasRenderingContext2D, W: number, H: number) {
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const alpha = Math.random() * 0.04;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }
}

// 장식 프레임
function drawOrnateFrame(ctx: CanvasRenderingContext2D, W: number, H: number, colors: ColorPalette) {
  ctx.save();
  // 외부 프레임
  roundRect(ctx, 15, 15, W - 30, H - 30, 16);
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 3;
  ctx.shadowColor = colors.gold;
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 내부 프레임
  roundRect(ctx, 25, 25, W - 50, H - 50, 12);
  ctx.strokeStyle = `${colors.gold}40`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // 코너 장식 (4개)
  const corners = [
    { x: 25, y: 25, rot: 0 },
    { x: W - 25, y: 25, rot: Math.PI / 2 },
    { x: W - 25, y: H - 25, rot: Math.PI },
    { x: 25, y: H - 25, rot: -Math.PI / 2 }
  ];
  corners.forEach(({ x, y, rot }) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    // L자 장식
    ctx.beginPath();
    ctx.moveTo(0, 20); ctx.lineTo(0, 0); ctx.lineTo(20, 0);
    ctx.strokeStyle = colors.gold;
    ctx.lineWidth = 2;
    ctx.stroke();
    // 다이아몬드
    ctx.beginPath();
    ctx.moveTo(0, -4); ctx.lineTo(4, 0); ctx.lineTo(0, 4); ctx.lineTo(-4, 0); ctx.closePath();
    ctx.fillStyle = colors.gold;
    ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}

// 장식 구분선
function drawDecorativeLine(ctx: CanvasRenderingContext2D, x1: number, y: number, x2: number, color: string) {
  const midX = (x1 + x2) / 2;

  // 그래디언트 라인
  const grad = ctx.createLinearGradient(x1, 0, x2, 0);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(0.15, `${color}60`);
  grad.addColorStop(0.5, color);
  grad.addColorStop(0.85, `${color}60`);
  grad.addColorStop(1, 'transparent');

  ctx.strokeStyle = grad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();

  // 중앙 다이아몬드
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(midX, y - 4);
  ctx.lineTo(midX + 4, y);
  ctx.lineTo(midX, y + 4);
  ctx.lineTo(midX - 4, y);
  ctx.closePath();
  ctx.fill();
}

// 코너 별
function drawCornerStars(ctx: CanvasRenderingContext2D, W: number, H: number, color: string) {
  const positions = [
    { x: 40, y: 70 },
    { x: W - 40, y: 70 },
    { x: 40, y: H - 70 },
    { x: W - 40, y: H - 70 },
  ];
  positions.forEach(({ x, y }) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.5;
    drawStar(ctx, x, y, 4, 5, 2);
    ctx.fill();
    ctx.restore();
  });
}

// 신비 파티클
function drawMysticalParticles(ctx: CanvasRenderingContext2D, W: number, H: number, color: string) {
  for (let i = 0; i < 40; i++) {
    const px = Math.random() * W;
    const py = Math.random() * H;
    const size = Math.random() * 1.5 + 0.3;
    const alpha = Math.random() * 0.35 + 0.05;
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    if (Math.random() > 0.7) {
      ctx.beginPath();
      drawStar(ctx, px, py, 4, size * 2.5, size);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerR: number, innerR: number) {
  let rot = -Math.PI / 2;
  const step = Math.PI / spikes;
  ctx.moveTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.closePath();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

interface ColorPalette {
  gold: string; glow: string; tint: string; center: string; particle: string;
}

function getColorPalette(palette: string): ColorPalette {
  const palettes: Record<string, ColorPalette> = {
    'purple-gold': { gold: '#D4AF37', glow: '#D4AF37', tint: '#8B5CF6', center: '#3b1f7a', particle: '#D4AF37' },
    'blue-silver': { gold: '#94A3B8', glow: '#60A5FA', tint: '#3B82F6', center: '#1e3a5f', particle: '#94A3B8' },
    'red-gold': { gold: '#D4AF37', glow: '#EF4444', tint: '#EF4444', center: '#5f1a1a', particle: '#F59E0B' },
    'green-gold': { gold: '#D4AF37', glow: '#10B981', tint: '#10B981', center: '#1a3f2a', particle: '#D4AF37' },
    'gold-sky': { gold: '#D4AF37', glow: '#F59E0B', tint: '#38BDF8', center: '#2a3f5f', particle: '#F5E6B8' },
    'gold-cosmic': { gold: '#D4AF37', glow: '#A855F7', tint: '#D4AF37', center: '#2d1f5f', particle: '#E9D5FF' },
    'blue-gold': { gold: '#D4AF37', glow: '#3B82F6', tint: '#3B82F6', center: '#1e2d5f', particle: '#D4AF37' },
    'indigo-silver': { gold: '#94A3B8', glow: '#6366F1', tint: '#6366F1', center: '#1e1e5f', particle: '#A5B4FC' },
    'red-ivory': { gold: '#FEFCE8', glow: '#DC2626', tint: '#DC2626', center: '#5f1a2a', particle: '#FEFCE8' },
    'pink-gold': { gold: '#D4AF37', glow: '#EC4899', tint: '#EC4899', center: '#5f1a3f', particle: '#F9A8D4' },
    'orange-gold': { gold: '#D4AF37', glow: '#F97316', tint: '#F97316', center: '#5f2a1a', particle: '#FDE68A' },
    'teal-gold': { gold: '#D4AF37', glow: '#14B8A6', tint: '#14B8A6', center: '#1a3f3f', particle: '#D4AF37' },
    'black-white': { gold: '#94A3B8', glow: '#F8FAFC', tint: '#475569', center: '#1e1e2e', particle: '#CBD5E1' },
    'gold-aqua': { gold: '#D4AF37', glow: '#22D3EE', tint: '#22D3EE', center: '#1a2f3f', particle: '#D4AF37' },
    'red-black': { gold: '#991B1B', glow: '#DC2626', tint: '#DC2626', center: '#3f0a0a', particle: '#F87171' },
    'yellow-dark': { gold: '#F59E0B', glow: '#F59E0B', tint: '#F59E0B', center: '#3f2f0a', particle: '#FDE68A' },
    'silver-midnight': { gold: '#94A3B8', glow: '#64748B', tint: '#334155', center: '#0f172a', particle: '#94A3B8' },
    'gold-warm': { gold: '#D4AF37', glow: '#F59E0B', tint: '#F59E0B', center: '#3f2f1a', particle: '#FDE68A' },
    'gold-blue': { gold: '#D4AF37', glow: '#60A5FA', tint: '#3B82F6', center: '#1e2d5f', particle: '#BFDBFE' },
  };
  return palettes[palette] || palettes['purple-gold'];
}
