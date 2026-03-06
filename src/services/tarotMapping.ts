/**
 * ============================================================
 *  Fate-Sync: 타로카드 매핑 시스템
 *  
 *  - 메이저 아르카나 22장 기반
 *  - 사주 오행 + MBTI → 최적 타로카드 매칭
 *  - 각 카드별 시각적 프롬프트 + 한글 해석
 * ============================================================
 */

export interface TarotCard {
  id: number;
  nameEN: string;
  nameKR: string;
  numeral: string;          // 로마 숫자
  keywords: string[];       // 핵심 키워드
  element: string;          // 연결 원소
  mbtiAffinity: string[];   // 친화 MBTI
  visualPrompt: string;     // 이미지 생성용 영어 프롬프트
  symbolism: string;        // 카드 상징 해석 (한글)
  colorPalette: string;     // 카드 색상 테마
}

// ─── 메이저 아르카나 22장 ───────────────────────────
export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 0, nameEN: 'The Fool', nameKR: '광대', numeral: '0',
    keywords: ['자유', '모험', '순수', '새로운 시작'],
    element: '風(바람)', mbtiAffinity: ['ENFP', 'ENTP', 'ESFP'],
    visualPrompt: 'A carefree traveler standing at the edge of a cliff, eyes full of wonder, a small dog at their feet, a white rose in hand, golden sunrise behind, swirling cosmic wind, Rider-Waite inspired tarot art style',
    symbolism: '무한한 가능성의 시작점에 서 있는 존재. 두려움 없이 미지의 세계로 한 발을 내딛는 용기.',
    colorPalette: 'gold-sky'
  },
  {
    id: 1, nameEN: 'The Magician', nameKR: '마법사', numeral: 'I',
    keywords: ['창조', '의지', '기술', '집중'],
    element: '水銀', mbtiAffinity: ['ENTP', 'ENTJ', 'INTP'],
    visualPrompt: 'A powerful magician with one hand raised to the sky and one pointing to the earth, mystical tools on a table before them - a wand, cup, sword, and pentacle, infinity symbol above head, dramatic purple lightning',
    symbolism: '하늘과 땅을 잇는 채널. 의지의 힘으로 무에서 유를 창조하는 연금술사.',
    colorPalette: 'purple-gold'
  },
  {
    id: 2, nameEN: 'The High Priestess', nameKR: '여사제', numeral: 'II',
    keywords: ['직관', '신비', '지혜', '내면'],
    element: '水', mbtiAffinity: ['INFJ', 'INTJ', 'INFP'],
    visualPrompt: 'A serene priestess seated between two pillars of light and shadow, a crescent moon at her feet, a scroll of ancient wisdom in her lap, veil of stars behind, deep blue and silver tones',
    symbolism: '숨겨진 진실을 꿰뚫어 보는 내면의 눈. 달빛 아래에서만 읽을 수 있는 운명의 두루마리.',
    colorPalette: 'blue-silver'
  },
  {
    id: 3, nameEN: 'The Empress', nameKR: '여황제', numeral: 'III',
    keywords: ['풍요', '양육', '자연', '감성'],
    element: '土', mbtiAffinity: ['ESFJ', 'ENFJ', 'ISFJ'],
    visualPrompt: 'A majestic empress seated on a throne surrounded by lush gardens and flowing water, crown of twelve stars, holding a golden scepter, wheat fields and roses blooming, warm golden light',
    symbolism: '대지의 어머니. 생명을 품고 키우는 무한한 사랑과 풍요의 상징.',
    colorPalette: 'green-gold'
  },
  {
    id: 4, nameEN: 'The Emperor', nameKR: '황제', numeral: 'IV',
    keywords: ['권위', '구조', '리더십', '안정'],
    element: '火', mbtiAffinity: ['ENTJ', 'ESTJ', 'ISTJ'],
    visualPrompt: 'A powerful emperor seated on a stone throne carved with ram heads, holding an ankh scepter and golden orb, mountains behind, red robes and armor, stern commanding gaze, dramatic lighting',
    symbolism: '질서와 법칙의 수호자. 혼돈 속에서 왕국을 세우는 불굴의 의지.',
    colorPalette: 'red-gold'
  },
  {
    id: 5, nameEN: 'The Hierophant', nameKR: '교황', numeral: 'V',
    keywords: ['전통', '가르침', '신앙', '지도'],
    element: '土', mbtiAffinity: ['ISFJ', 'ESFJ', 'ISTJ'],
    visualPrompt: 'A wise spiritual leader seated between two pillars, wearing elaborate triple crown, two acolytes kneeling before them, crossed keys at feet, sacred geometric patterns, deep red and gold tones',
    symbolism: '영적 세계와 물질 세계를 잇는 다리. 고대 지혜의 전달자.',
    colorPalette: 'red-ivory'
  },
  {
    id: 6, nameEN: 'The Lovers', nameKR: '연인', numeral: 'VI',
    keywords: ['사랑', '선택', '조화', '결합'],
    element: '風', mbtiAffinity: ['ENFP', 'ENFJ', 'ESFP'],
    visualPrompt: 'Two figures standing beneath an angelic figure with outstretched wings, tree of knowledge and tree of life behind each, rays of divine light, romantic soft glow, pink and gold atmosphere',
    symbolism: '운명적 선택의 순간. 두 길 사이에서 심장이 가리키는 방향을 따르는 용기.',
    colorPalette: 'pink-gold'
  },
  {
    id: 7, nameEN: 'The Chariot', nameKR: '전차', numeral: 'VII',
    keywords: ['승리', '의지', '정복', '전진'],
    element: '水', mbtiAffinity: ['ENTJ', 'ESTP', 'ENTP'],
    visualPrompt: 'A triumphant warrior standing in a golden chariot pulled by one black and one white sphinx, city walls behind, stars above forming a canopy, armor with crescent moons, powerful forward motion',
    symbolism: '상반되는 힘을 하나로 모아 전진하는 승리의 전차. 의지로 운명을 개척하는 정복자.',
    colorPalette: 'blue-gold'
  },
  {
    id: 8, nameEN: 'Strength', nameKR: '힘', numeral: 'VIII',
    keywords: ['용기', '인내', '내면의 힘', '자비'],
    element: '火', mbtiAffinity: ['ISFP', 'ENFJ', 'INFJ'],
    visualPrompt: 'A serene figure gently closing the jaws of a lion with bare hands, infinity symbol above head, flower garland crown, golden savanna landscape, warm sunset, inner calm radiating outward',
    symbolism: '진정한 힘은 폭력이 아닌 자비에서 나온다. 야수의 본능마저 녹이는 내면의 불꽃.',
    colorPalette: 'orange-gold'
  },
  {
    id: 9, nameEN: 'The Hermit', nameKR: '은둔자', numeral: 'IX',
    keywords: ['고독', '탐구', '지혜', '내성'],
    element: '土', mbtiAffinity: ['INTP', 'INTJ', 'INFP', 'ISTP'],
    visualPrompt: 'A solitary sage standing atop a snow-covered mountain peak, holding a glowing lantern with a six-pointed star inside, long flowing robes, looking down at the world below, deep indigo night sky with stars',
    symbolism: '세상의 소음에서 벗어나 진리의 빛을 찾는 구도자. 고독 속에서 발견하는 가장 깊은 지혜.',
    colorPalette: 'indigo-silver'
  },
  {
    id: 10, nameEN: 'Wheel of Fortune', nameKR: '운명의 수레바퀴', numeral: 'X',
    keywords: ['운명', '변화', '순환', '기회'],
    element: '木', mbtiAffinity: ['ENFP', 'ENTP', 'ESTP'],
    visualPrompt: 'A massive golden wheel floating in cosmic space with mystical symbols, sphinx atop, serpent descending, four winged creatures in corners reading books, zodiac symbols around the rim, swirling universe',
    symbolism: '우주의 섭리가 돌리는 거대한 바퀴. 올라가는 자는 내려오고, 내려간 자는 올라간다.',
    colorPalette: 'gold-cosmic'
  },
  {
    id: 11, nameEN: 'Justice', nameKR: '정의', numeral: 'XI',
    keywords: ['공정', '진실', '균형', '판단'],
    element: '風', mbtiAffinity: ['ISTJ', 'INTJ', 'ESTJ'],
    visualPrompt: 'A figure seated on a throne holding a double-edged sword upright in right hand and balanced scales in left, between two grey pillars, purple veil behind, crown with a square jewel, stern impartial gaze',
    symbolism: '진실의 칼과 균형의 저울. 우주의 법칙 앞에서 모든 것은 공정하게 재단된다.',
    colorPalette: 'purple-grey'
  },
  {
    id: 12, nameEN: 'The Hanged Man', nameKR: '매달린 사람', numeral: 'XII',
    keywords: ['희생', '관점전환', '깨달음', '인내'],
    element: '水', mbtiAffinity: ['INFP', 'INTP', 'ISFP'],
    visualPrompt: 'A figure hanging upside down from a living tree by one foot, serene expression with a halo of light around head, crossed leg forming number 4, autumn leaves falling, mystical twilight atmosphere',
    symbolism: '역설적 깨달음. 세상을 거꾸로 봄으로써 비로소 진실을 발견하는 역전의 지혜.',
    colorPalette: 'teal-gold'
  },
  {
    id: 13, nameEN: 'Death', nameKR: '죽음', numeral: 'XIII',
    keywords: ['변혁', '종말', '재생', '전환'],
    element: '水', mbtiAffinity: ['INTJ', 'INFJ', 'ISTP'],
    visualPrompt: 'A skeletal knight in black armor riding a white horse, carrying a black flag with white rose, figures of all ages before them, setting sun between two towers, dawn breaking on the horizon, transformative energy',
    symbolism: '끝이 곧 시작. 죽음의 기사는 파괴가 아니라 필연적 변혁의 사자.',
    colorPalette: 'black-white'
  },
  {
    id: 14, nameEN: 'Temperance', nameKR: '절제', numeral: 'XIV',
    keywords: ['균형', '조화', '치유', '중용'],
    element: '火', mbtiAffinity: ['ISFJ', 'INFJ', 'ENFJ'],
    visualPrompt: 'An angelic figure with large iridescent wings, one foot on land and one in water, pouring liquid between two golden cups in a flowing arc, iris flowers blooming, rainbow in background, serene golden light',
    symbolism: '물과 불, 하늘과 땅을 하나로 섞는 연금술. 극단을 넘어 완벽한 균형을 찾는 길.',
    colorPalette: 'gold-aqua'
  },
  {
    id: 15, nameEN: 'The Devil', nameKR: '악마', numeral: 'XV',
    keywords: ['유혹', '속박', '욕망', '그림자'],
    element: '土', mbtiAffinity: ['ESTP', 'ESFP', 'ENTP'],
    visualPrompt: 'A horned dark figure seated on a black cube, inverted pentagram above, two chained figures below with loose chains they could remove, flames and shadows, dramatic dark red and black tones, powerful presence',
    symbolism: '스스로 만든 사슬. 욕망의 그림자를 직시할 때, 해방의 열쇠가 보인다.',
    colorPalette: 'red-black'
  },
  {
    id: 16, nameEN: 'The Tower', nameKR: '탑', numeral: 'XVI',
    keywords: ['붕괴', '해방', '각성', '충격'],
    element: '火', mbtiAffinity: ['ENTP', 'ESTP', 'INTJ'],
    visualPrompt: 'A tall stone tower being struck by a bolt of lightning, crown flying off the top, figures falling, flames erupting from windows, rain of golden sparks, dark stormy sky, dramatic explosive energy',
    symbolism: '번개가 거짓의 탑을 무너뜨린다. 고통스러운 파괴 뒤에 진정한 해방이 온다.',
    colorPalette: 'yellow-dark'
  },
  {
    id: 17, nameEN: 'The Star', nameKR: '별', numeral: 'XVII',
    keywords: ['희망', '영감', '치유', '평화'],
    element: '風', mbtiAffinity: ['INFP', 'ENFP', 'INFJ'],
    visualPrompt: 'A serene figure kneeling by a pool of water under a sky full of eight-pointed stars, one large golden star shining brightest, pouring water from two vessels onto land and into the pool, ibis bird nearby, peaceful night',
    symbolism: '폭풍이 지나간 뒤 하늘에 뜨는 첫 번째 별. 우주가 보내는 희망의 메시지.',
    colorPalette: 'blue-gold'
  },
  {
    id: 18, nameEN: 'The Moon', nameKR: '달', numeral: 'XVIII',
    keywords: ['환상', '불안', '잠재의식', '직관'],
    element: '水', mbtiAffinity: ['INFP', 'INFJ', 'ISFP'],
    visualPrompt: 'A large luminous moon with a face between two towers, a winding path from water to mountains, a wolf and dog howling, a crayfish emerging from water, mysterious misty atmosphere, silver and deep blue tones',
    symbolism: '달빛은 진실을 왜곡한다. 환상과 두려움 너머에 숨겨진 잠재의식의 보물.',
    colorPalette: 'silver-midnight'
  },
  {
    id: 19, nameEN: 'The Sun', nameKR: '태양', numeral: 'XIX',
    keywords: ['기쁨', '성공', '활력', '명쾌'],
    element: '火', mbtiAffinity: ['ENFJ', 'ESFP', 'ENFP', 'ESTP'],
    visualPrompt: 'A radiant sun with a human face shining over a garden wall, a joyful child on a white horse, sunflowers blooming abundantly, bright golden rays, vibrant warm colors, pure happiness radiating',
    symbolism: '모든 그림자를 태우는 순수한 빛. 진실과 기쁨이 충만한 가장 빛나는 순간.',
    colorPalette: 'gold-warm'
  },
  {
    id: 20, nameEN: 'Judgement', nameKR: '심판', numeral: 'XX',
    keywords: ['부활', '소명', '각성', '재탄생'],
    element: '火', mbtiAffinity: ['ENFJ', 'ENTJ', 'INFJ'],
    visualPrompt: 'An archangel blowing a golden trumpet from the clouds, people rising from coffins with arms outstretched, mountains and sea, divine light breaking through clouds, transformative resurrection energy',
    symbolism: '천사의 나팔 소리에 영혼이 깨어난다. 과거를 넘어 새로운 존재로 부활하는 순간.',
    colorPalette: 'gold-blue'
  },
  {
    id: 21, nameEN: 'The World', nameKR: '세계', numeral: 'XXI',
    keywords: ['완성', '통합', '성취', '우주와 하나'],
    element: '土', mbtiAffinity: ['INFJ', 'ENTJ', 'ENFJ'],
    visualPrompt: 'A figure dancing within a great laurel wreath, four creatures in corners (angel, eagle, bull, lion), holding two wands, cosmic starfield background, sense of completion and infinite possibility, gold and purple',
    symbolism: '모든 여정의 대미. 자아와 우주가 하나로 합일하는 완전한 깨달음의 순간.',
    colorPalette: 'purple-gold'
  }
];

// ─── 사주 오행 + MBTI → 타로카드 매칭 ──────────────
export function matchTarotCard(
  dayMasterElement: string,
  mbti: string,
  dmStrength: string
): TarotCard {
  // 1단계: MBTI 친화도가 높은 카드 필터링
  const mbtiMatches = MAJOR_ARCANA.filter(card => 
    card.mbtiAffinity.includes(mbti)
  );
  
  // 2단계: 오행과 연결된 카드 가중치
  const elementMap: Record<string, string[]> = {
    '木': ['風', '木'],
    '火': ['火'],
    '土': ['土'],
    '金': ['風', '水銀'],
    '水': ['水'],
  };
  
  const targetElements = elementMap[dayMasterElement] || ['土'];
  
  // 3단계: 신강/신약에 따른 카드 분위기
  // 신강: 활동적 카드 선호 (홀수 번호 경향)
  // 신약: 내성적 카드 선호 (짝수 번호 경향)
  
  // 종합 스코어링
  let bestCard = MAJOR_ARCANA[0];
  let bestScore = -1;
  
  for (const card of MAJOR_ARCANA) {
    let score = 0;
    
    // MBTI 매치 (+3)
    if (card.mbtiAffinity.includes(mbti)) score += 3;
    
    // 오행 연결 (+2)
    if (targetElements.some(el => card.element.includes(el))) score += 2;
    
    // 신강/신약 ↔ 카드 성향 (+1)
    if (dmStrength === 'strong' && card.id % 2 === 1) score += 1;
    if (dmStrength === 'weak' && card.id % 2 === 0) score += 1;
    
    // 약간의 랜덤성 (+0~0.9) — 같은 조건이라도 다른 카드가 나올 수 있게
    score += Math.random() * 0.9;
    
    if (score > bestScore) {
      bestScore = score;
      bestCard = card;
    }
  }
  
  return bestCard;
}

// ─── 타로카드 이미지 생성용 프롬프트 조합 ────────────
export function buildTarotImagePrompt(
  card: TarotCard,
  faceDescription?: string
): string {
  const userFace = faceDescription || 'with determined intelligent eyes and a thoughtful expression';
  
  return [
    `A mystical tarot card illustration in the Rider-Waite art style,`,
    `depicting "${card.nameEN}" (${card.nameKR}).`,
    `The central figure has the face of the user — ${userFace}.`,
    card.visualPrompt,
    `The card has ornate golden borders with mystical symbols and the numeral "${card.numeral}" at the top.`,
    `"${card.nameEN}" is written at the bottom in elegant serif font.`,
    `Dramatic lighting, rich saturated colors, professional tarot card art,`,
    `vertical portrait composition, highly detailed, 8k quality masterpiece.`,
    `Style: blend of classical Rider-Waite tarot with modern digital painting.`
  ].join(' ');
}
