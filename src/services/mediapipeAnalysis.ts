/**
 * ============================================================
 *  Fate-Sync: MediaPipe 브라우저 기반 얼굴/손 랜드마크 감지
 *  
 *  - 얼굴: 468개 랜드마크 → 이마/눈/코/입/턱 영역 좌표 추출
 *  - 손: 21개 랜드마크 → 주요 손금 라인 좌표 추출
 *  - 100% 프론트엔드, Python 백엔드 불필요
 * ============================================================
 */

import { FaceLandmarker, HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// ─── 타입 정의 ─────────────────────────────────────
export interface FaceLandmarkData {
  // 각 영역의 중심 좌표 (0~1 정규화)
  forehead: { x: number; y: number };
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  nose: { x: number; y: number };
  mouth: { x: number; y: number };
  chin: { x: number; y: number };
  // 얼굴 윤곽 좌표 (0~1 정규화)
  faceOval: { x: number; y: number }[];
  // 전체 468개 랜드마크 (3D 렌더링용)
  allLandmarks: { x: number; y: number; z: number }[];
}

export interface PalmLandmarkData {
  // 주요 손금 라인용 좌표들 (0~1 정규화)
  heartLine: { x: number; y: number }[];    // 감정선
  headLine: { x: number; y: number }[];     // 두뇌선
  lifeLine: { x: number; y: number }[];     // 생명선
  fateLine: { x: number; y: number }[];     // 운명선
  // 21개 전체 랜드마크
  allLandmarks: { x: number; y: number; z: number }[];
  // 손바닥 중심
  palmCenter: { x: number; y: number };
}

// ─── 싱글톤 인스턴스 ──────────────────────────────
let faceLandmarker: FaceLandmarker | null = null;
let handLandmarker: HandLandmarker | null = null;
let isInitializing = false;

// ─── 초기화 ─────────────────────────────────────────
async function initMediaPipe(): Promise<void> {
  if (faceLandmarker && handLandmarker) return;
  if (isInitializing) {
    // 초기화 중이면 대기
    while (isInitializing) {
      await new Promise(r => setTimeout(r, 100));
    }
    return;
  }
  
  isInitializing = true;
  console.log('MEDIAPIPE: 초기화 시작...');
  
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU'
      },
      runningMode: 'IMAGE',
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });

    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU'
      },
      runningMode: 'IMAGE',
      numHands: 1,
    });

    console.log('MEDIAPIPE: ✅ 초기화 완료 (Face + Hand Landmarker)');
  } catch (err) {
    console.error('MEDIAPIPE: ❌ 초기화 실패:', err);
    throw err;
  } finally {
    isInitializing = false;
  }
}

// ─── base64 이미지 → HTMLImageElement 변환 ──────────
function base64ToImage(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = base64;
  });
}

// ─── 얼굴 랜드마크 감지 ─────────────────────────────
export async function detectFaceLandmarks(faceImageBase64: string): Promise<FaceLandmarkData | null> {
  try {
    await initMediaPipe();
    if (!faceLandmarker) return null;

    const img = await base64ToImage(faceImageBase64);
    
    // 캔버스에 그려서 분석
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);

    const result = faceLandmarker.detect(canvas);

    if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
      console.warn('MEDIAPIPE: 얼굴을 감지하지 못했습니다');
      return null;
    }

    const landmarks = result.faceLandmarks[0];
    
    // 주요 랜드마크 인덱스 (MediaPipe Face Mesh 기준)
    // 이마 중앙: 10 (상단 중앙)
    // 왼쪽 눈: 33 (외안각), 159 (윗 눈꺼풀), 145 (아래 눈꺼풀), 133 (내안각)
    // 오른쪽 눈: 263 (외안각), 386 (윗 눈꺼풀), 374 (아래 눈꺼풀), 362 (내안각)
    // 코 끝: 1
    // 윗입술: 0, 아랫입술: 17
    // 턱 끝: 152
    // 얼굴 윤곽: 10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10

    const forehead = landmarks[10];
    const leftEye = {
      x: (landmarks[33].x + landmarks[133].x) / 2,
      y: (landmarks[159].y + landmarks[145].y) / 2
    };
    const rightEye = {
      x: (landmarks[263].x + landmarks[362].x) / 2,
      y: (landmarks[386].y + landmarks[374].y) / 2
    };
    const nose = landmarks[1];
    const mouth = {
      x: (landmarks[0].x + landmarks[17].x) / 2,
      y: (landmarks[0].y + landmarks[17].y) / 2
    };
    const chin = landmarks[152];

    // 얼굴 윤곽선 추출
    const ovalIndices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
    const faceOval = ovalIndices.map(i => ({ x: landmarks[i].x, y: landmarks[i].y }));

    const data: FaceLandmarkData = {
      forehead: { x: forehead.x, y: forehead.y },
      leftEye,
      rightEye,
      nose: { x: nose.x, y: nose.y },
      mouth,
      chin: { x: chin.x, y: chin.y },
      faceOval,
      allLandmarks: landmarks.map(lm => ({ x: lm.x, y: lm.y, z: lm.z }))
    };

    console.log(`MEDIAPIPE: ✅ 얼굴 감지 완료 (${landmarks.length}개 랜드마크)`);
    return data;

  } catch (err) {
    console.error('MEDIAPIPE: 얼굴 감지 오류:', err);
    return null;
  }
}

// ─── 손 랜드마크 감지 ────────────────────────────────
export async function detectPalmLandmarks(palmImageBase64: string): Promise<PalmLandmarkData | null> {
  try {
    await initMediaPipe();
    if (!handLandmarker) return null;

    const img = await base64ToImage(palmImageBase64);
    
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);

    const result = handLandmarker.detect(canvas);

    if (!result.landmarks || result.landmarks.length === 0) {
      console.warn('MEDIAPIPE: 손을 감지하지 못했습니다');
      return null;
    }

    const landmarks = result.landmarks[0];
    
    // MediaPipe Hand Landmarks (21개):
    // 0: 손목, 1-4: 엄지, 5-8: 검지, 9-12: 중지, 13-16: 약지, 17-20: 새끼
    // 
    // 주요 참조점
    const wrist = landmarks[0];
    const thumbCMC = landmarks[1];
    const thumbMCP = landmarks[2];
    const _thumbIP = landmarks[3]; // 필요 시 사용
    const indexMCP = landmarks[5];
    const middleMCP = landmarks[9];
    const ringMCP = landmarks[13];
    const pinkyMCP = landmarks[17];

    // 손바닥 크기 기반 비례 오프셋 계산
    const palmHeight = Math.abs(wrist.y - middleMCP.y);
    const palmWidth = Math.abs(pinkyMCP.x - indexMCP.x);
    const yOff = palmHeight * 0.06; // 세로 오프셋 비율
    const xOff = palmWidth * 0.05; // 가로 오프셋 비율

    // 감정선(Heart Line): 새끼 아래 → 검지-중지 사이 (자연스러운 곡선)
    // 새끼 MCP 안쪽에서 시작, 검지 MCP 부근에서 끝
    const heartStartY = pinkyMCP.y + yOff * 0.5;
    const heartEndY = indexMCP.y + yOff * 2;
    const heartLine = [
      { x: pinkyMCP.x + xOff, y: heartStartY },
      { x: (pinkyMCP.x + ringMCP.x) / 2, y: (heartStartY + ringMCP.y) / 2 + yOff * 0.3 },
      { x: ringMCP.x, y: ringMCP.y + yOff * 1.2 },
      { x: (ringMCP.x + middleMCP.x) / 2, y: (ringMCP.y + middleMCP.y) / 2 + yOff * 1.5 },
      { x: middleMCP.x, y: middleMCP.y + yOff * 1.8 },
      { x: (middleMCP.x + indexMCP.x) / 2, y: heartEndY },
    ];

    // 두뇌선(Head Line): 엄지-검지 사이 시작 → 손바닥 가로 횡단
    // 감정선 아래 약간 떨어진 위치
    const headStartX = (thumbMCP.x + indexMCP.x) / 2;
    const headStartY = indexMCP.y + palmHeight * 0.2;
    const headMidY = (indexMCP.y + wrist.y) / 2 - yOff;
    const headLine = [
      { x: headStartX, y: headStartY },
      { x: indexMCP.x + xOff, y: headStartY + yOff },
      { x: (indexMCP.x + middleMCP.x) / 2, y: headMidY },
      { x: middleMCP.x, y: headMidY + yOff * 0.5 },
      { x: (middleMCP.x + ringMCP.x) / 2, y: headMidY + yOff },
      { x: ringMCP.x - xOff, y: headMidY + yOff * 2 },
    ];

    // 생명선(Life Line): 엄지-검지 사이 → 엄지 바깥을 감싸는 호
    const lifeStartX = (thumbMCP.x + indexMCP.x) / 2;
    const lifeStartY = (thumbMCP.y + indexMCP.y) / 2;
    const lifeLine = [
      { x: lifeStartX, y: lifeStartY },
      { x: thumbMCP.x + palmWidth * 0.08, y: lifeStartY + palmHeight * 0.12 },
      { x: thumbMCP.x + palmWidth * 0.1, y: (lifeStartY + wrist.y) / 2 },
      { x: thumbCMC.x + palmWidth * 0.12, y: wrist.y - palmHeight * 0.25 },
      { x: (thumbCMC.x + wrist.x) / 2 + xOff, y: wrist.y - palmHeight * 0.08 },
    ];

    // 운명선(Fate Line): 손목 중앙 → 중지 아래 (약간 곡선)
    const fateX = (wrist.x + middleMCP.x) / 2;
    const fateLine = [
      { x: fateX + xOff * 0.5, y: wrist.y - yOff * 2 },
      { x: fateX, y: wrist.y - palmHeight * 0.3 },
      { x: middleMCP.x + xOff * 0.3, y: headMidY + yOff },
      { x: middleMCP.x, y: middleMCP.y + yOff * 3 },
    ];

    const palmCenter = {
      x: (indexMCP.x + pinkyMCP.x + wrist.x) / 3,
      y: (indexMCP.y + wrist.y) / 2
    };

    const data: PalmLandmarkData = {
      heartLine,
      headLine,
      lifeLine,
      fateLine,
      allLandmarks: landmarks.map(lm => ({ x: lm.x, y: lm.y, z: lm.z })),
      palmCenter
    };

    console.log(`MEDIAPIPE: ✅ 손 감지 완료 (${landmarks.length}개 랜드마크)`);
    return data;

  } catch (err) {
    console.error('MEDIAPIPE: 손 감지 오류:', err);
    return null;
  }
}
