/**
 * chronosSync.ts - V52
 * 현재 시간에 따른 지지(地支) 및 12궁 에너지 포인트 계산
 */

export const JI_TIME_MAP = [
    { ji: '자(子)', hour: 23, name: 'Ja', palaceId: 'fumu' }, // 자시는 야자시/조자시 구분 있으나 단순화
    { ji: '축(丑)', hour: 1, name: 'Chuk', palaceId: 'fude' },
    { ji: '인(寅)', hour: 3, name: 'In', palaceId: 'tiantu' },
    { ji: '묘(卯)', hour: 5, name: 'Myo', palaceId: 'guanlu' },
    { ji: '진(辰)', hour: 7, name: 'Jin', palaceId: 'nucai' },
    { ji: '사(巳)', hour: 9, name: 'Sa', palaceId: 'qianyi' },
    { ji: '오(午)', hour: 11, name: 'Oh', palaceId: 'jibing' },
    { ji: '미(未)', hour: 13, name: 'Mi', palaceId: 'caibo' },
    { ji: '신(申)', hour: 15, name: 'Shin', palaceId: 'zisun' },
    { ji: '유(酉)', hour: 17, name: 'Yu', palaceId: 'fuqi' },
    { ji: '술(戌)', hour: 19, name: 'Sul', palaceId: 'xiongdi' },
    { ji: '해(亥)', hour: 21, name: 'Hae', palaceId: 'ming' },
];

export function getChronosSyncInfo() {
    const now = new Date();
    const hour = now.getHours();

    // 23:00~01:00 (Ja), 01:00~03:00 (Chuk), ...
    // (hour + 1) / 2 가 시간대 인덱스와 유사함
    let index = Math.floor(((hour + 1) % 24) / 2);
    const sync = JI_TIME_MAP[index];

    return {
        ...sync,
        timeDisplay: `${sync.ji}시 (${hour}:${now.getMinutes().toString().padStart(2, '0')})`,
        message: `지금 이 순간(${sync.ji}시), 당신의 ${sync.palaceId === 'ming' ? '명운' : sync.palaceId} 기운이 정점에 도달했습니다.`
    };
}
