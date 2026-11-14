// ================= characters =================
const look = (body, dark, belly, snout, hoof, brow, band, acc, bw = 1) => ({ body, dark, belly, snout, hoof, brow, band, acc, bw });
const CHARS = [
  { name: '분홍이', title: '근본 삼겹살', type: '밸런스', hp: 88, power: 0.98, speed: 1.0, ultRate: 1.0, scale: 1.15,
    look: look('#ffb5c5', '#d9718c', '#ffd6df', '#ff93ac', '#7a3b4a', '#5a2030', '#e53935', ['band']),
    skill: { name: '돼지 박치기', type: 'dash', cd: 150, desc: '머리부터 돌진해 상대를 띄움' },
    skills: [{ name: '돼지 박치기', type: 'dash', cd: 150, desc: '머리부터 돌진해 상대를 띄움' }, { name: '삼겹 굴리기', type: 'porkRoll', cd: 170, desc: '↓+U: 몸을 말아 굴러가며 넘어뜨림 · 무적' }, { name: '꿀꿀 함성', type: 'oinkWave', cd: 260, desc: '←→+U: 큰 소리로 앞을 날려 버림 · 오래 기절' }],
    tf: { name: '불꽃 분홍', type: 'fire', color: '#ff5722', desc: '공격력↑ · 화상' },
    ult: { name: '삼겹 폭풍 연타', type: 'rush', desc: '돌진 후 폭풍 연타' } },
  { name: '깜돌이', title: '제주 흑돼지', type: '파워', hp: 75, power: 1, speed: 0.9, ultRate: 0.95, scale: 1.2,
    look: look('#4b3d44', '#1f181b', '#62525a', '#7d6670', '#0d090b', '#0a0a0a', '#1e88e5', ['band', 'scar']),
    skill: { name: '흑돼지 어깨치기', type: 'armorShoulder', cd: 170, desc: '슈퍼아머 · 막아도 가드를 부수는 돌진' },
    skills: [{ name: '흑돼지 어깨치기', type: 'armorShoulder', cd: 170, desc: '슈퍼아머 · 막아도 가드를 부수는 돌진' }, { name: '현무암 내려찍기', type: 'basaltSlam', cd: 220, desc: '↓+U: 땅을 내려찍어 넘어뜨림 (앉아도 맞음)' }, { name: '흑돼지 박치기', type: 'blackRam', cd: 200, desc: '←→+U: 슈퍼아머 박치기' }],
    tf: { name: '한라산 돌돼지', type: 'stone', color: '#9e9e9e', desc: '받는 피해↓ · 슈퍼아머' },
    ult: { name: '한라산 대분화', type: 'eruption', desc: '앞으로 용암 기둥' } },
  { name: '멧돌이', title: '산속 멧돼지', type: '돌격', hp: 103, power: 1.06, speed: 1.05, ultRate: 0.8, scale: 1.2,
    look: look('#a1887f', '#4e342e', '#bcaaa4', '#8d6e63', '#3e2723', '#2b1a14', '#ff9800', ['tusks', 'bristle']),
    skill: { name: '엄니 걸어당기기', type: 'launcher', cd: 140, desc: '엄니로 걸어 내 앞으로 끌어당김 · 긴 경직' },
    skills: [{ name: '엄니 걸어당기기', type: 'launcher', cd: 140, desc: '엄니로 걸어 내 앞으로 끌어당김 · 긴 경직' }, { name: '흙먼지 돌진', type: 'dustCharge', cd: 200, desc: '↓+U: 낮게 돌진해 넘어뜨림' }, { name: '엄니 퍼올리기', type: 'tuskToss', cd: 240, desc: '←→+U: 엄니로 퍼 올려 하늘 높이 띄움 · 슈퍼아머' }],
    tf: { name: '야생 폭주', type: 'wild', color: '#ff9800', desc: '이동·공격 속도↑' },
    ult: { name: '멧돼지 대돌진', type: 'charge', desc: '화면 끝까지 무적 돌진' } },
  { name: '꼬미', title: '미니피그', type: '스피드', hp: 81, power: 0.99, speed: 1.3, ultRate: 1.25, scale: 0.92,
    look: look('#ffe3d6', '#e0a58f', '#fff1ea', '#ffc2ad', '#8d5a4a', '#6d3a2a', '#ff4081', ['ribbon', 'spots']),
    skill: { name: '데굴데굴 구르기', type: 'roll', cd: 120, desc: '무적 하단 구르기' },
    skills: [{ name: '데굴데굴 구르기', type: 'roll', cd: 120, desc: '무적 하단 구르기' }, { name: '꼬마 날아차기', type: 'miniKick', cd: 150, desc: '↓+U: 뛰어올라 차기' }, { name: '꼬마 질주', type: 'miniDash', cd: 170, desc: '←→+U: 아주 빠르게 달려가며 2번 들이받기' }],
    tf: { name: '분신술', type: 'clone', color: '#f8bbd0', desc: '분신이 추가타' },
    ult: { name: '미니피그 군단', type: 'stampede', desc: '꼬마 돼지 8마리 돌격' } },
  { name: '얼음이', title: '냉동 대패', type: '원거리', hp: 103, power: 1.08, speed: 1.0, ultRate: 1.0, scale: 1.1,
    look: look('#e3eef9', '#7f9bbf', '#f5f9ff', '#c5d8ef', '#4a6488', '#2c3e5a', '#4fc3f7', ['frost', 'scarf']),
    skill: { name: '대패 표창', type: 'iceProj', cd: 110, desc: '얼음 대패 투척 · 둔화' },
    skills: [{ name: '대패 표창', type: 'iceProj', cd: 110, desc: '얼음 대패 투척 · 둔화' }, { name: '얼음 바닥', type: 'iceFloor', cd: 360, desc: '↓+U: 바닥을 얼려 밟으면 느려짐' }, { name: '빙결 펀치', type: 'frostPunch', cd: 170, desc: '←→+U: 맞으면 느려지는 얼음 주먹' }],
    tf: { name: '급속 냉동', type: 'freeze', color: '#4fc3f7', desc: '적중 시 둔화' },
    ult: { name: '절대영도 대패썰기', type: 'absoluteZero', desc: '얼리고 대패로 썬다' } },
  { name: '족발왕', title: '태권 족발', type: '발차기', hp: 78, power: 0.94, speed: 1.1, ultRate: 1.05, scale: 1.15,
    look: look('#f0c595', '#a8703f', '#f8dcb8', '#e0a878', '#ffc107', '#5d3a1a', '#ffffff', ['band', 'belt']),
    skill: { name: '족발 회오리킥', type: 'spinKick', cd: 150, desc: '3연속 회전 킥' },
    skills: [{ name: '족발 회오리킥', type: 'spinKick', cd: 150, desc: '3연속 회전 킥' }, { name: '족발 쓸어차기', type: 'lowSweep', cd: 160, desc: '↓+U: 낮게 쓸어 넘어뜨림' }, { name: '날아 옆차기', type: 'flyKick', cd: 190, desc: '←→+U: 날아가며 강한 옆차기' }],
    tf: { name: '무쇠 족발', type: 'ironHoof', color: '#ffd54f', desc: '발차기 피해 1.5배' },
    ult: { name: '천족난무', type: 'thousandKicks', desc: '돌진 후 발차기 난무' } },
  { name: '오겹장군', title: '스모 챔피언', type: '탱커', hp: 119, power: 1.01, speed: 0.8, ultRate: 0.85, scale: 1.3,
    look: look('#ffcab8', '#d08a74', '#ffe0d4', '#ffaa94', '#6d3a2a', '#5a2a1a', '#7b1fa2', ['mawashi', 'topknot'], 1.15),
    skill: { name: '뱃살 튕기기', type: 'counter', cd: 160, desc: '반격 자세' },
    skills: [{ name: '뱃살 튕기기', type: 'counter', cd: 160, desc: '반격 자세' }, { name: '스모 밀치기', type: 'sumoPush', cd: 200, desc: '↓+U: 슈퍼아머로 멀리 밀어냄' }, { name: '뱃살 띄우기', type: 'bellyBump', cd: 220, desc: '←→+U: 배로 튕겨 하늘로' }],
    tf: { name: '오겹 거대화', type: 'giant', color: '#ce93d8', desc: '몸집·사거리↑ · 아머' },
    ult: { name: '스모 대압살', type: 'bodySlam', desc: '하늘에서 깔아뭉개기' } },
  { name: '양념이', title: '고추장 불돼지', type: '원거리', hp: 123, power: 1.07, speed: 1.0, ultRate: 0.95, scale: 1.12,
    look: look('#ff8a65', '#bf360c', '#ffab91', '#ff7043', '#5d1a0a', '#4a1000', '#ffeb3b', ['chili']),
    skill: { name: '고추장 화염구', type: 'fireProj', cd: 120, desc: '포물선으로 던져 땅에서 펑! · 넓은 범위 화상' },
    skills: [{ name: '고추장 화염구', type: 'fireProj', cd: 120, desc: '포물선으로 던져 땅에서 펑! · 넓은 범위 화상' }, { name: '양념 뿌리기', type: 'chiliSpray', cd: 200, desc: '↓+U: 매운 양념 분사 · 화상' }, { name: '고추 미사일', type: 'chiliBomb', cd: 180, desc: '←→+U: 곧게 날아가는 불 고추' }],
    tf: { name: '청양 각성', type: 'spicy', color: '#ff1744', desc: '화염구 2연발 · 쿨↓' },
    ult: { name: '지옥불 양념 빔', type: 'beam', desc: '화면을 가르는 불 빔' } },
  { name: '항정', title: '그림자 닌자', type: '기술', hp: 85, power: 1.02, speed: 1.25, ultRate: 1.2, scale: 1.08,
    look: look('#b9a9cf', '#5e4b78', '#d5cae4', '#a593c2', '#2e2440', '#1a1028', '#4a148c', ['mask']),
    skill: { name: '항정 순보', type: 'teleport', cd: 130, desc: '상대 뒤로 순간이동' },
    skills: [{ name: '항정 순보', type: 'teleport', cd: 130, desc: '상대 뒤로 순간이동' }, { name: '그림자 베기', type: 'shadowCut', cd: 180, desc: '↓+U: 빠른 3연속 베기' }, { name: '연막탄', type: 'smokeBomb', cd: 420, desc: '←→+U: 연기 속에서 1초 동안 무적' }],
    tf: { name: '그림자 모드', type: 'shadow', color: '#7e57c2', desc: '30% 회피 · 속도↑' },
    ult: { name: '비전 · 천살', type: 'thousandCuts', desc: '보이지 않는 천 번 베기' } },
  { name: '목살', title: '복싱 챔프', type: '펀치', hp: 91, power: 1.07, speed: 1.05, ultRate: 0.9, scale: 1.15,
    look: look('#ffb59e', '#c75b39', '#ffd2c4', '#ff9a80', '#6d2a1a', '#4a1a0a', '#ffd600', ['band', 'gloves']),
    skill: { name: '목살 어퍼컷', type: 'uppercut', cd: 140, desc: '무적 대공 어퍼 · 점프한 상대 격추' },
    skills: [{ name: '목살 어퍼컷', type: 'uppercut', cd: 140, desc: '무적 대공 어퍼 · 점프한 상대 격추' }, { name: '보디 블로', type: 'bodyBlow', cd: 170, desc: '↓+U: 배를 노려 오래 기절' }, { name: '원투 스트레이트', type: 'jabCombo', cd: 170, desc: '←→+U: 빠른 3연타' }],
    tf: { name: '챔피언 모드', type: 'champion', color: '#ffd600', desc: '펀치 피해·속도↑' },
    ult: { name: '메가톤 펀치', type: 'megaton', desc: '가드 파괴 한 방' } },
  { name: '갈비', title: '숯불 양념갈비', type: '리치', hp: 104, power: 1.07, speed: 0.95, ultRate: 0.9, scale: 1.15,
    look: look('#c8743f', '#7a3a18', '#e3a173', '#d98a58', '#4e2410', '#3a1a0a', '#ffb300', ['scar', 'belt']),
    skill: { name: '갈빗대 다리걸기', type: 'boneSwing', cd: 140, desc: '긴 갈빗대로 다리를 후려 넘어뜨림 (하단)' },
    skills: [{ name: '갈빗대 다리걸기', type: 'boneSwing', cd: 140, desc: '긴 갈빗대로 다리를 후려 넘어뜨림 (하단)' }, { name: '숯 던지기', type: 'coalToss', cd: 200, desc: '↓+U: 뜨거운 숯을 포물선으로 · 화상' }, { name: '갈비뼈 창', type: 'ribSpear', cd: 160, desc: '←→+U: 아주 멀리 닿는 찌르기' }],
    tf: { name: '숯불 직화', type: 'fire', color: '#ff7043', desc: '공격력↑ · 화상' },
    ult: { name: '숯불 소나기', type: 'coalRain', desc: '하늘에서 뜨거운 숯이 쏟아짐 · 화상' } },
  { name: '감자탕', title: '뼈해장국 장인', type: '지구력', hp: 105, power: 1, speed: 0.9, ultRate: 0.8, scale: 1.22,
    look: look('#e8b48a', '#9a5a32', '#f5d2b2', '#e09a6e', '#5d3a1a', '#4a2a10', '#d84315', ['band', 'scarf'], 1.08),
    skill: { name: '뚝배기 국물 붓기', type: 'stewSplash', cd: 130, desc: '바닥을 천천히 흐르는 국물 · 밟으면 여러 번 화상' },
    skills: [{ name: '뚝배기 국물 붓기', type: 'stewSplash', cd: 130, desc: '바닥을 천천히 흐르는 국물 · 밟으면 여러 번 화상' }, { name: '뼈다귀 던지기', type: 'boneThrow', cd: 170, desc: '↓+U: 빙글빙글 날아가는 뼈' }, { name: '뜨끈한 국물', type: 'stewHeal', cd: 600, desc: '←→+U: 국물 한 그릇 · 체력 10 회복' }],
    tf: { name: '뚝배기 갑옷', type: 'stone', color: '#8d6e63', desc: '받는 피해↓ · 슈퍼아머' },
    ult: { name: '뚝배기 홍수', type: 'stewFlood', desc: '펄펄 끓는 국물 파도가 화면을 휩쓸어 감' } },
  { name: '냉삼', title: '냉동 삼겹살', type: '부메랑', hp: 78, power: 0.95, speed: 1.12, ultRate: 1.1, scale: 1.04,   // 얇게 얼린 레트로 냉동 삼겹살
    look: look('#fbe0dc', '#c98f8c', '#fff4f2', '#f4b8b4', '#7a4a4a', '#4a2a2a', '#4fc3f7', ['band', 'spots'], 0.96),
    skill: { name: '냉삼 부메랑', type: 'boomerang', cd: 120, desc: '던지면 돌아오는 냉삼 · 두 번 맞힘' },
    skills: [{ name: '냉삼 부메랑', type: 'boomerang', cd: 120, desc: '던지면 돌아오는 냉삼 · 두 번 맞힘' }, { name: '냉동 슬라이스', type: 'frostSlice', cd: 170, desc: '↓+U: 낮게 4번 베기 · 느려짐' }, { name: '서리 미끄럼', type: 'frostDash', cd: 190, desc: '←→+U: 미끄러지며 돌진 · 느려짐' }],
    tf: { name: '급속 해동', type: 'thaw', color: '#80deea', desc: '체력 서서히 회복 · 이동 속도↑' },
    ult: { name: '냉삼 폭탄 투하', type: 'sliceRain', desc: '하늘에서 얼린 냉삼이 우수수' } },
  { name: '금한돈', title: '황금 돼지 부자', type: '부자', hp: 88, power: 0.93, speed: 0.96, ultRate: 0.9, scale: 1.12, unlock: 3, perk: '이기면 승리 코인 3배',   // unlock: 이 티어(3 = 골드)에 처음 오르면 영구 해금
    look: look('#ffd54f', '#b8860b', '#fff3c4', '#ffca28', '#6d4c00', '#4a3300', '#2e7d32', ['band', 'belt'], 1.04),
    skill: { name: '돈뿌리기', type: 'coinToss', cd: 120, desc: '동전 5개를 부채꼴로 흩뿌림' },
    skills: [{ name: '돈뿌리기', type: 'coinToss', cd: 120, desc: '동전 5개를 부채꼴로 흩뿌림' }, { name: '돈다발 휘두르기', type: 'cashSwing', cd: 170, desc: '↓+U: 묵직한 돈다발로 후려침' }, { name: '골드 러시', type: 'goldDash', cd: 200, desc: '←→+U: 금빛 무적 돌진' }],
    tf: { name: '황금 각성', type: 'gilded', color: '#ffd700', desc: '공격력↑ · 필살 게이지 빨리 참' },
    ult: { name: '황금 금고 떨구기', type: 'goldSafe', desc: '머리 위로 금고 쿵! 그림자 보고 피하기' } },
  // 관리자가 선물로 주는 돼지 (unlock: 'admin' → 관리자 페이지에서 sgf_unlock_돼타로를 켜 줘야 쓸 수 있음. legacy: 예전 이름 '무뚝돈'으로 받은 사람도 그대로 해금)
  // 학생모·긴 코트의 과묵한 불량 돼지. 스킬·필살기 때 보라색 수호령 '뚱타플레티나'가 나와서 주먹을 날림. 필살기는 시작할 때 컷신
  { name: '돼타로', title: '말없는 불량 돼지', type: '수호령', hp: 104, power: 1.06, speed: 1.0, ultRate: 0.95, scale: 1.16, unlock: 'admin', legacy: '무뚝돈', perk: '관리자 선물 돼지', spirit: true, standName: '뚱타플레티나', winSnd: 'ttWin',
    stats: [['파괴력', 'A'], ['스피드', 'A'], ['사정거리', 'C'], ['지속력', 'A'], ['정밀동작성', 'A'], ['성장성', 'A']],
    look: look('#f2c4b4', '#9c6656', '#fbe1d8', '#e8a898', '#4a2a22', '#2a1712', '#ffd54f', ['cap', 'coat', 'stern', 'bold'], 1.04),
    skill: { name: '뚱타플레티나 러시', type: 'spiritRush', cd: 600, desc: '뚱타플레티나가 날아가 5초 넘게 주먹 연타 · 방어 무시' },
    tf: { name: '수호령 각성', type: 'champion', color: '#b388ff', desc: '펀치 피해·속도↑' },
    ult: { name: '뚱타플레티나 · 시간 정지', type: 'timeStop', desc: '시간을 멈추고 뚱타플레티나가 날아가 난타 · 방어 무시' } },
  // 🆕 2026-11-12 업데이트 (공개 전엔 안 보임). unlock: 'admin'처럼 얻기 전엔 숨김 · how: 얻는 법
  // 볼트돈: 버려진 고기 공장에서 깨어난 사이보그 돼지. 금속 몸 · 빨간 외눈 바이저 · 안테나 · 볼트. 도트(픽셀) 그림
  // 스킬 3개(U 오버클럭 · ↓+U 레이저 채찍 · →+U 로켓 대시), 필살기는 20초 동안 거대한 메가 강화 슈트
  { name: '볼트돈', title: '공장에서 탈출한 사이보그 돼지', type: '로봇', hp: 101, power: 1.04, speed: 1.12, ultRate: 0.85, scale: 1.12, unlock: 'admin', legacy: '돼이비드', how: '🎁 보상 센터 행운 룰렛에서 얻어요', perk: '룰렛 한정 돼지',
    look: look('#b0bec5', '#455a64', '#cfd8dc', '#90a4ae', '#263238', '#37474f', '#ff1744', ['robot', 'antenna', 'bold'], 1.04),
    skill: { name: '오버클럭', type: 'sande', cd: 900, desc: 'U: 2.5초 동안 상대가 아주 느려짐' },
    skills: [{ name: '오버클럭', type: 'sande', cd: 900, desc: 'U: 회로를 과열시켜 2.5초 동안 상대가 아주 느려짐' }, { name: '레이저 채찍', type: 'monowire', cd: 200, desc: '↓+U: 멀리까지 닿는 레이저 채찍 3연타 · 내 앞으로 끌어옴' }, { name: '로켓 대시', type: 'cyberDash', cd: 180, desc: '←→+U: 발 로켓으로 무적 돌진 펀치' }],
    tf: { name: '과부하 모드', type: 'wild', color: '#ff1744', desc: '속도·공격 속도↑' },
    ult: { name: '메가 강화 슈트', type: 'cyberSkel', desc: '12초 동안 거대한 슈트: 공격력↑ · 받는 피해↓ · 몸집↑' } },
  // 돼루토: 주황 옷 · 이마 보호대를 한 닌자 돼지. 분신술로 분신 2마리가 대신 싸움. 필살기는 구미호 모드
  { name: '돼루토', title: '포기를 모르는 닌자 돼지', type: '닌자', hp: 100, power: 1.02, speed: 1.1, ultRate: 0.9, scale: 1.1, unlock: 'admin', how: '🎁 보상 센터의 돼루토 퀘스트를 깨면 얻어요', perk: '퀘스트 한정 돼지',
    look: look('#ffc9b5', '#c27a63', '#ffe3d6', '#f7a58f', '#3e2723', '#c79100', '#1a237e', ['ninja', 'spiky', 'whisker', 'hitai', 'bold'], 1),
    skill: { name: '분신술', type: 'kageClone', cd: 540, desc: 'U: 분신 2마리가 대신 싸움 (한 대 맞으면 둘 다 펑)' },
    skills: [{ name: '분신술', type: 'kageClone', cd: 540, desc: 'U: 분신 2마리가 대신 싸움 · 한 대 맞으면 펑' }, { name: '회오리 구슬', type: 'rasen', cd: 240, desc: '↓+U: 회오리 구슬을 들고 상대에게 달려가 날려 버림' }, { name: '쿠나이 던지기', type: 'kunai', cd: 120, desc: '←→+U: 빠른 쿠나이 3개' }],
    tf: { name: '선인 모드', type: 'champion', color: '#ff6d00', desc: '펀치 피해·속도↑' },
    ult: { name: '구미호 모드', type: 'gumiho', desc: '아홉 꼬리 폭발 + 12초 동안 강해짐' } },
  // 이타돼리: 저주를 몸에 품은 돼지 고등학생 (관리자가 '업데이트 공개'를 누르면 모두 해금 · 한 번 켜면 못 끔)
  { name: '이타돼리', title: '저주를 품은 돼지 고등학생', type: '격투', hp: 106, power: 0.95, speed: 1.08, ultRate: 0.9, scale: 1.12, unlock: 'admin', relId: 'itadori', quest: true, how: '공개 후 10일 안에 이타돼리 퀘스트를 깨면 얻어요 (🎁 보상 센터) · 모듈로 각성 퀘스트 → 모듈로 · 각성 → 스쿠나', perk: '퀘스트 한정 돼지',
    look: look('#ffc9b8', '#b5715d', '#ffe3d8', '#f4a18e', '#3e2723', '#4e342e', '#c62828', ['uniform', 'pinkhair', 'bold'], 1.03),
    skill: { name: '늦게 터지는 주먹', type: 'lateFist', cd: 150, desc: 'U: 맞히면 한 박자 뒤에 한 번 더 쾅' },
    skills: [{ name: '늦게 터지는 주먹', type: 'lateFist', cd: 150, desc: 'U: 맞히면 한 박자 뒤에 한 번 더 쾅' }, { name: '검은 번개', type: 'blackBolt', cd: 260, desc: '↓+U: 연타로 이어 쓰면 반드시 검은 번개(2.5배) · 아니면 50%' }, { name: '날아 무릎차기', type: 'kneeDash', cd: 180, desc: '←→+U: 날아가며 무릎으로 들이받기' }],
    blackFlash: true,   // 평타에도 검은 번개 (12% · 저주왕 25%)
    tf: { name: '집중 모드', type: 'champion', color: '#c62828', desc: '펀치 피해·속도↑' },
    ult: { name: '검은 번개 연타', type: 'boltRush', desc: '달려가서 검은 번개 3연타 → 날려 버림' } },
  // 🎉 대규모 업데이트 (relId 'big1': 관리자가 공개하면 모두 무료)
  // 훈제돈: 흰 셰프 모자 · 앞치마 · 콧수염의 바비큐 셰프. 불·소스·꼬치로 싸움
  { name: '훈제돈', title: '불맛 바비큐 셰프', type: '요리사', hp: 96, power: 1.05, speed: 0.98, ultRate: 0.95, scale: 1.16, unlock: 'admin', relId: 'big1', how: '관리자가 대규모 업데이트를 공개하면 모두에게 해금돼요', perk: '업데이트 돼지',
    look: look('#e8a88f', '#9c5a45', '#f6cbb9', '#de8a73', '#3e2723', '#4e342e', '#ff6f00', ['toque', 'apron', 'mustache', 'bold'], 1.08),
    skill: { name: '플람베 화염', type: 'flambe', cd: 200, desc: 'U: 앞으로 불을 뿜어 4번 · 화상' },
    skills: [{ name: '플람베 화염', type: 'flambe', cd: 200, desc: 'U: 앞으로 불을 뿜어 4번 · 화상' }, { name: '비법 소스 덫', type: 'sauceTrap', cd: 360, desc: '↓+U: 바닥에 소스 → 밟으면 느려짐 (7초)' }, { name: '꼬치 찌르기', type: 'skewer', cd: 150, desc: '←→+U: 아주 멀리 닿는 꼬치' }],
    tf: { name: '센 불 모드', type: 'fire', color: '#ff6f00', desc: '공격력↑ · 화상' },
    ult: { name: '바비큐 파티', type: 'bbqParty', desc: '상대 발밑에 숯불 그릴 → 불기둥 세 번 + 화상' } },
  // 우주꿀돈: 유리 헬멧 · 흰 우주복의 우주비행사 돼지. 중력을 다룸
  { name: '우주꿀돈', title: '달에서 온 우주비행사', type: '중력', hp: 108, power: 1.07, speed: 1.02, ultRate: 0.9, scale: 1.1, unlock: 'admin', relId: 'big1', quest: true, how: '🎁 보상 센터의 우주꿀돈 퀘스트를 깨면 얻어요', perk: '퀘스트 한정 돼지',
    look: look('#ffc4cf', '#c47a8a', '#ffe0e6', '#f5a3b3', '#37474f', '#5d4037', '#7c4dff', ['spacesuit', 'helmet', 'bold'], 1.02),
    skill: { name: '저중력 띄우기', type: 'lowGrav', cd: 220, desc: 'U: 상대를 둥실 높이 띄움' },
    skills: [{ name: '저중력 띄우기', type: 'lowGrav', cd: 220, desc: 'U: 상대를 둥실 높이 띄움' }, { name: '블랙홀 구슬', type: 'blackHole', cd: 420, desc: '↓+U: 천천히 날아가며 상대를 빨아들이는 구슬' }, { name: '로켓 박치기', type: 'rocketHead', cd: 180, desc: '←→+U: 등 로켓으로 무적 돌진' }],
    tf: { name: '무중력 모드', type: 'wild', color: '#7c4dff', desc: '속도·공격 속도↑' },
    ult: { name: '유성우', type: 'meteor', desc: '하늘에서 유성이 우수수 떨어짐' } },
  // 핑크하트: 분홍 양갈래 머리 · 리본 · 프릴 무대 옷의 돼지 아이돌. 노래로 싸움
  { name: '핑크하트', title: '무대 위의 돼지 아이돌', type: '음악', hp: 85, power: 0.94, speed: 1.1, ultRate: 1.0, scale: 1.06, unlock: 'admin', relId: 'big1', how: '관리자가 대규모 업데이트를 공개하면 모두에게 해금돼요', perk: '업데이트 돼지',
    look: look('#ffd1dc', '#d48aa0', '#ffe8ee', '#ffb3c6', '#4a2a35', '#ad1457', '#ff4081', ['twintail', 'idoldress', 'bold'], 0.98),
    skill: { name: '음표 파동', type: 'noteWave', cd: 160, desc: 'U: 음표 3개를 날림' },
    skills: [{ name: '음표 파동', type: 'noteWave', cd: 160, desc: 'U: 음표 3개를 날림' }, { name: '응원 회복', type: 'cheer', cd: 600, desc: '↓+U: 팬들의 응원으로 체력 14 회복' }, { name: '하트 윙크', type: 'wink', cd: 330, desc: '←→+U: 맞으면 두근두근 오래 못 움직임' }],
    tf: { name: '센터 모드', type: 'champion', color: '#ff4081', desc: '펀치 피해·속도↑' },
    ult: { name: '앙코르 콘서트', type: 'encore', desc: '무대 조명 아래 상대를 묶고 노래로 연타 → 피날레' } },
  // 🏴‍☠️ 대규모 업데이트 · 해적과 마법사 (relId 'big2'): 캡틴베이컨은 무료, 꿀린은 퀘스트
  { name: '캡틴베이컨', title: '일곱 바다의 해적 돼지', type: '해적', hp: 87, power: 0.94, speed: 0.98, ultRate: 0.92, scale: 1.16, unlock: 'admin', relId: 'big2', how: '관리자가 대규모 업데이트 · 해적과 마법사를 공개하면 모두에게 해금돼요', perk: '업데이트 돼지',
    look: look('#f0b8a0', '#a36a55', '#fad6c6', '#e89a84', '#3e2723', '#3e2723', '#c62828', ['pircoat', 'tricorn', 'eyepatch', 'bold'], 1.06),
    skill: { name: '대포알', type: 'cannonShot', cd: 200, desc: 'U: 묵직한 대포알 한 발' },
    skills: [{ name: '대포알', type: 'cannonShot', cd: 200, desc: 'U: 묵직한 대포알 한 발' }, { name: '갈고리 당기기', type: 'hookPull', cd: 220, desc: '↓+U: 멀리서 갈고리로 끌어당김' }, { name: '앵무새 습격', type: 'parrotRaid', cd: 240, desc: '←→+U: 앵무새가 날아가 쪼아 댐 (3번)' }],
    tf: { name: '선장 모드', type: 'champion', color: '#c62828', desc: '펀치 피해·속도↑' },
    ult: { name: '일제 사격', type: 'broadside', desc: '해적선 대포알이 높이를 바꿔 가며 쏟아짐' } },
  { name: '꿀린', title: '탑에 사는 돼지 마법사', type: '마법', hp: 95, power: 1.07, speed: 1.0, ultRate: 0.88, scale: 1.08, unlock: 'admin', relId: 'big2', quest: true, how: '🎁 보상 센터의 꿀린 퀘스트를 깨면 얻어요', perk: '퀘스트 한정 돼지',
    look: look('#ffd3c4', '#c48a78', '#ffe8de', '#f7b3a0', '#311b92', '#eeeeee', '#7c4dff', ['robe', 'wizhat', 'beard', 'bold'], 1),
    skill: { name: '마법 구슬', type: 'magicOrb', cd: 180, desc: 'U: 상대를 따라가는 마법 구슬' },
    skills: [{ name: '마법 구슬', type: 'magicOrb', cd: 180, desc: 'U: 상대를 따라가는 마법 구슬' }, { name: '개구리 저주', type: 'frogCurse', cd: 480, desc: '↓+U: 맞으면 4초 동안 작고 약하고 느려짐' }, { name: '점멸', type: 'blink', cd: 260, desc: '←→+U: 상대 뒤로 순간 이동 · 원래 자리에서 마법 폭발' }],
    tf: { name: '대마법사 모드', type: 'gilded', color: '#7c4dff', desc: '공격력↑ · 필살 게이지 빨리 참' },
    ult: { name: '거대화 물약', type: 'giantPotion', desc: '물약을 마시고 12초 동안 거대해짐 · 공격력↑ · 슈퍼아머' } },
  // 🎉 대규모 업데이트 3~20 (관리자가 하나씩 공개 · relId bigN): 업데이트마다 새 돼지 1마리 (돼지 도감에서 코인으로 사기) + 기존 돼지 업데이트 스킨 2개
  { name: '기사돈', title: '왕국을 지키는 돼지 기사', type: '기사', hp: 113, power: 1.03, speed: 0.95, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big3', buy: 1000000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (⚔️ 기사단)', perk: '업데이트 돼지', costume: 'knight', costumeCol: '#90a4ae',
    look: look('#f5c6b8', '#987b72', '#fae0d8', '#f8b7aa', '#564540', '#3e2723', '#90a4ae', ['bold'], 1.04),
    skill: { name: '검 휘두르기', type: 'xKnSlash', cd: 150, desc: 'U: 긴 검으로 크게 벰' },
    skills: [{ name: '검 휘두르기', type: 'xKnSlash', cd: 150, desc: 'U: 긴 검으로 크게 벰' }, { name: '방패 밀치기', type: 'xKnBash', cd: 220, desc: '↓+U: 방패로 밀쳐 날림 (맞아도 안 밀림)' }, { name: '검기 날리기', type: 'xKnWave', cd: 200, desc: '←→+U: 초승달 검기를 날림' }], wpn: 'sword',
    tf: { name: '기사 모드', type: 'champion', color: '#90a4ae', desc: '펀치 피해·속도↑' },
    ult: { name: '천공의 성검', type: 'nxExcalibur', desc: '하늘에서 거대한 성검이 떨어짐' } },
  { name: '산타돈', title: '선물 주머니를 멘 돼지 산타', type: '축제', hp: 129, power: 1.09, speed: 1, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'xmas', quest: true, how: '🎄 크리스마스 퀘스트로 얻어요 (12월 1~25일 · 산타돈과 눈꽃돈을 같이 줘요)', perk: '🎄 크리스마스 돼지', costume: 'santa', costumeCol: '#d32f2f',
    look: look('#ffcdd2', '#9e7f82', '#ffe4e6', '#ffbcbe', '#59484a', '#fafafa', '#d32f2f', ['beard', 'bold'], 1.04),
    skill: { name: '선물 폭탄', type: 'xSaGift', cd: 180, desc: 'U: 떨어지면 터지는 선물 상자' },
    skills: [{ name: '선물 폭탄', type: 'xSaGift', cd: 180, desc: 'U: 떨어지면 터지는 선물 상자' }, { name: '눈덩이 3연발', type: 'xSaSnow', cd: 200, desc: '↓+U: 눈덩이 3개 · 맞으면 느려짐' }, { name: '쿠키 냠냠', type: 'xSaCookie', cd: 600, desc: '←→+U: 쿠키를 먹고 체력 12 회복' }], wpn: 'candycane',
    tf: { name: '산타 모드', type: 'champion', color: '#d32f2f', desc: '펀치 피해·속도↑' },
    ult: { name: '루돌프 썰매 공습', type: 'nxSleigh', desc: '썰매가 지나가며 선물 폭탄을 떨어뜨림' } },
  { name: '카우돈', title: '황야의 돼지 총잡이', type: '총잡이', hp: 132, power: 1.09, speed: 1.05, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big5', buy: 3240000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (🤠 황야의 총잡이)', perk: '업데이트 돼지', costume: 'cowboy', costumeCol: '#8d6e63',
    look: look('#e6b89c', '#8f7261', '#f1d8c9', '#ecad95', '#514037', '#3e2723', '#c62828', ['mustache', 'bold'], 1.04),
    skill: { name: '리볼버 2연발', type: 'xCwShot', cd: 150, desc: 'U: 빠른 총알 두 발' },
    skills: [{ name: '리볼버 2연발', type: 'xCwShot', cd: 150, desc: 'U: 빠른 총알 두 발' }, { name: '올가미', type: 'xCwLasso', cd: 300, desc: '↓+U: 맞으면 꽁꽁 묶임' }, { name: '구르며 쏘기', type: 'xCwRoll', cd: 240, desc: '←→+U: 굴러서 피한 뒤 한 발' }], wpn: 'revolver',
    tf: { name: '총잡이 모드', type: 'champion', color: '#8d6e63', desc: '펀치 피해·속도↑' },
    ult: { name: '정오의 결투', type: 'nxHighNoon', desc: '석양 아래 여섯 발을 연달아 쏨' } },
  { name: '펑크돈', title: '무대를 부수는 돼지 로커', type: '로커', hp: 75, power: 0.93, speed: 1.08, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big6', buy: 5830000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (🎸 록 페스티벌)', perk: '업데이트 돼지', costume: 'punk', costumeCol: '#e040fb',
    look: look('#d7ccc8', '#857e7c', '#e9e3e1', '#e1bcb6', '#4b4746', '#212121', '#e040fb', ['bold'], 1.04),
    skill: { name: '기타 굉음', type: 'xPkRiff', cd: 180, desc: 'U: 음파 두 줄기를 날림' },
    skills: [{ name: '기타 굉음', type: 'xPkRiff', cd: 180, desc: 'U: 음파 두 줄기를 날림' }, { name: '기타 내려찍기', type: 'xPkSmash', cd: 240, desc: '↓+U: 가드를 부수고 넘어뜨림' }, { name: '모싱 점프', type: 'xPkMosh', cd: 200, desc: '←→+U: 관객 위로 날아 들이받아 띄움' }], wpn: 'guitar',
    tf: { name: '로커 모드', type: 'champion', color: '#e040fb', desc: '펀치 피해·속도↑' },
    ult: { name: '앰프 대폭발', type: 'nxAmp', desc: '거대한 앰프에서 음파 고리가 세 번 터짐' } },
  { name: '바캉스돈', title: '여름 바다의 돼지', type: '물놀이', hp: 119, power: 1.06, speed: 1, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big7', buy: 10500000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (🏖️ 여름 바캉스)', perk: '업데이트 돼지', costume: 'beach', costumeCol: '#26c6da',
    look: look('#ffccbc', '#9e7e75', '#ffe3da', '#ffbcad', '#594742', '#5d4037', '#26c6da', ['bold'], 1.04),
    skill: { name: '물총 연사', type: 'xBcWater', cd: 160, desc: 'U: 물줄기 다섯 발 · 맞으면 느려짐' },
    skills: [{ name: '물총 연사', type: 'xBcWater', cd: 160, desc: 'U: 물줄기 다섯 발 · 맞으면 느려짐' }, { name: '튜브 던지기', type: 'xBcTube', cd: 300, desc: '↓+U: 튜브에 끼면 못 움직임' }, { name: '서핑 돌진', type: 'xBcSurf', cd: 220, desc: '←→+U: 파도를 타고 돌진 (잠깐 무적)' }], wpn: 'watergun',
    tf: { name: '돼지 모드', type: 'champion', color: '#26c6da', desc: '펀치 피해·속도↑' },
    ult: { name: '서핑 대해일', type: 'nxTsunami', desc: '거대한 파도가 화면을 휩쓺' } },
  { name: '야구돈', title: '홈런왕 돼지 타자', type: '야구', hp: 114, power: 1.07, speed: 1, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big8', buy: 18900000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (⚾ 야구장)', perk: '업데이트 돼지', costume: null, plain: true,
    look: look('#ffd0c0', '#9e8177', '#ffe5dc', '#ffbfb0', '#594943', '#263238', '#1e88e5', ['bold'], 1.04),
    skill: { name: '강속구', type: 'xBbPitch', cd: 150, desc: 'U: 빠르고 곧은 공' },
    skills: [{ name: '강속구', type: 'xBbPitch', cd: 150, desc: 'U: 빠르고 곧은 공' }, { name: '풀스윙', type: 'xBbSwing', cd: 220, desc: '↓+U: 배트로 높이 날려 버림' }, { name: '슬라이딩', type: 'xBbSlide', cd: 200, desc: '←→+U: 낮게 미끄러져 넘어뜨림' }], wpn: 'bat',
    tf: { name: '타자 모드', type: 'champion', color: '#1e88e5', desc: '펀치 피해·속도↑' },
    ult: { name: '끝내기 홈런', type: 'nxHomeRun', desc: '붙잡고 연타한 뒤 장외 홈런' } },
  { name: '네온돈', title: '네온 도시의 돼지 해커', type: '해커', hp: 128, power: 1.1, speed: 1.08, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big9', buy: 34010000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (🌃 네온 시티)', perk: '업데이트 돼지', costume: 'bolt', costumeCol: '#00e5ff',
    look: look('#37474f', '#222c31', '#919a9e', '#69585b', '#13191c', '#00e5ff', '#00e5ff', ['bold'], 1.04),
    skill: { name: '추적 드론', type: 'xNeDrone', cd: 220, desc: 'U: 상대를 쫓아가는 드론' },
    skills: [{ name: '추적 드론', type: 'xNeDrone', cd: 220, desc: 'U: 상대를 쫓아가는 드론' }, { name: '글리치 순간이동', type: 'xNeGlitch', cd: 220, desc: '↓+U: 상대 뒤로 순간이동해 때림' }, { name: 'EMP 폭발', type: 'xNeEmp', cd: 280, desc: '←→+U: 주변 전기 폭발 · 맞으면 느려짐' }], wpn: 'laser',
    tf: { name: '해커 모드', type: 'champion', color: '#00e5ff', desc: '펀치 피해·속도↑' },
    ult: { name: '시스템 해킹', type: 'nxHack', desc: '드론 4대가 사방에서 레이저를 쏨' } },
  { name: '용암돈', title: '화산에서 태어난 돼지 골렘', type: '골렘', hp: 117, power: 1.06, speed: 0.88, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big10', buy: 61220000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (🌋 화산섬)', perk: '업데이트 돼지', costume: 'lava', costumeCol: '#ff6d00',
    look: look('#5d4037', '#3a2822', '#a69691', '#865349', '#211613', '#ff6d00', '#ff6d00', ['bold'], 1.04),
    skill: { name: '바위 던지기', type: 'xLvRock', cd: 200, desc: 'U: 떨어지면 터지는 바위' },
    skills: [{ name: '바위 던지기', type: 'xLvRock', cd: 200, desc: 'U: 떨어지면 터지는 바위' }, { name: '용암 웅덩이', type: 'xLvPool', cd: 300, desc: '↓+U: 상대 발밑에 용암이 끓어오름' }, { name: '지진파', type: 'xLvQuake', cd: 220, desc: '←→+U: 바닥을 타고 가는 지진 · 넘어뜨림' }], wpn: 'rockfist',
    tf: { name: '골렘 모드', type: 'champion', color: '#ff6d00', desc: '펀치 피해·속도↑' },
    ult: { name: '화산 대폭발', type: 'nxVolcano', desc: '용암 바위가 하늘에서 쏟아짐' } },
  { name: '눈꽃돈', title: '눈의 나라 돼지 기사', type: '얼음', hp: 130, power: 1.06, speed: 1, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'xmas', quest: true, how: '🎄 크리스마스 퀘스트로 얻어요 (12월 1~25일 · 산타돈과 눈꽃돈을 같이 줘요)', perk: '🎄 크리스마스 돼지', costume: 'ice', costumeCol: '#40c4ff',
    look: look('#e1f5fe', '#8c989d', '#effafe', '#e9dadf', '#4f5659', '#0277bd', '#40c4ff', ['bold'], 1.04),
    skill: { name: '얼음 창 찌르기', type: 'xIcSpear', cd: 160, desc: 'U: 긴 창으로 찌름 · 느려짐' },
    skills: [{ name: '얼음 창 찌르기', type: 'xIcSpear', cd: 160, desc: 'U: 긴 창으로 찌름 · 느려짐' }, { name: '눈꽃 표창', type: 'xIcFlake', cd: 180, desc: '↓+U: 눈꽃 표창 두 개' }, { name: '얼음벽', type: 'xIcWall', cd: 320, desc: '←→+U: 앞에 얼음벽을 세워 막음' }], wpn: 'spear',
    tf: { name: '기사 모드', type: 'champion', color: '#40c4ff', desc: '펀치 피해·속도↑' },
    ult: { name: '빙결 가시길', type: 'nxIcePath', desc: '얼음 가시가 줄지어 솟아오름' } },
  { name: '황제돈', title: '황금 왕좌의 돼지 황제', type: '황제', hp: 113, power: 1.03, speed: 0.92, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big12', buy: 198360000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (👑 황금 제국)', perk: '업데이트 돼지', costume: 'coin', costumeCol: '#ffd740',
    look: look('#ffe0b2', '#9e8b6e', '#ffeed5', '#ffcba6', '#594e3e', '#e65100', '#ffd740', ['bold'], 1.04),
    skill: { name: '황금 광선', type: 'xEmBeam', cd: 170, desc: 'U: 홀에서 황금 광선' },
    skills: [{ name: '황금 광선', type: 'xEmBeam', cd: 170, desc: 'U: 홀에서 황금 광선' }, { name: '금화 소나기', type: 'xEmCoins', cd: 260, desc: '↓+U: 상대 머리 위로 금화가 쏟아짐' }, { name: '황실 근위대', type: 'xEmGuard', cd: 300, desc: '←→+U: 근위병이 행진해 공격' }], wpn: 'scepter',
    tf: { name: '황제 모드', type: 'champion', color: '#ffd740', desc: '펀치 피해·속도↑' },
    ult: { name: '황금 대금화', type: 'nxGoldWheel', desc: '거대한 금화가 굴러가며 짓밟음' } },
  { name: '은하돈', title: '별을 삼킨 우주 돼지', type: '은하', hp: 97, power: 1.08, speed: 1, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big13', buy: 357050000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (🌌 은하 여행)', perk: '업데이트 돼지', costume: 'star', costumeCol: '#b388ff',
    look: look('#4527a0', '#2b1863', '#9988cb', '#744098', '#180e38', '#ffd740', '#b388ff', ['bold'], 1.04),
    skill: { name: '중력 우물', type: 'xGaWell', cd: 300, desc: 'U: 상대를 끌어당기는 소용돌이' },
    skills: [{ name: '중력 우물', type: 'xGaWell', cd: 300, desc: 'U: 상대를 끌어당기는 소용돌이' }, { name: '혜성 낙하', type: 'xGaComet', cd: 220, desc: '↓+U: 하늘에서 혜성이 떨어짐' }, { name: '워프', type: 'xGaWarp', cd: 220, desc: '←→+U: 상대 뒤로 워프해 띄움' }], wpn: 'wand',
    tf: { name: '돼지 모드', type: 'champion', color: '#b388ff', desc: '펀치 피해·속도↑' },
    ult: { name: '초신성', type: 'nxSupernova', desc: '상대 앞에서 별이 커지다 대폭발' } },
  { name: '유니돈', title: '무지개 뿔 돼지', type: '유니콘', hp: 119, power: 1.06, speed: 1.1, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big14', buy: 642680000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (🦄 무지개 동산)', perk: '업데이트 돼지', costume: 'rainbow', costumeCol: '#f48fb1',
    look: look('#fff0f6', '#9e9599', '#fff7fa', '#ffd7d9', '#595456', '#ad1457', '#f48fb1', ['bold'], 1.04),
    skill: { name: '무지개 돌진', type: 'xUnDash', cd: 170, desc: 'U: 무지개를 남기며 돌진' },
    skills: [{ name: '무지개 돌진', type: 'xUnDash', cd: 170, desc: 'U: 무지개를 남기며 돌진' }, { name: '반짝 별가루', type: 'xUnSparkle', cd: 320, desc: '↓+U: 맞으면 오래 못 움직임' }, { name: '무지개 치유', type: 'xUnHeal', cd: 600, desc: '←→+U: 체력 10 회복 · 잠깐 무적' }],
    tf: { name: '돼지 모드', type: 'champion', color: '#f48fb1', desc: '펀치 피해·속도↑' },
    ult: { name: '무지개 대폭주', type: 'nxRainbow', desc: '뿔에서 거대한 무지개 광선' } },
  { name: '벚꽃돈', title: '꽃잎 바람의 돼지 요정', type: '요정', hp: 114, power: 1.04, speed: 1.08, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big15', buy: 1156830000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (🌸 벚꽃 축제)', perk: '업데이트 돼지', costume: 'petal', costumeCol: '#f8bbd0',
    look: look('#fce4ec', '#9c8d92', '#fdf0f5', '#fdced1', '#585053', '#c2185b', '#66bb6a', ['bold'], 1.04),
    skill: { name: '꽃잎 칼날', type: 'xSkPetal', cd: 150, desc: 'U: 꽃잎 세 장을 날림' },
    skills: [{ name: '꽃잎 칼날', type: 'xSkPetal', cd: 150, desc: 'U: 꽃잎 세 장을 날림' }, { name: '꽃 함정', type: 'xSkTrap', cd: 300, desc: '↓+U: 상대 발밑에서 뿌리가 솟아 묶음' }, { name: '꽃바람 도약', type: 'xSkBreeze', cd: 220, desc: '←→+U: 뒤로 뛰며 꽃잎을 날림 (잠깐 무적)' }], wpn: 'fan',
    tf: { name: '요정 모드', type: 'champion', color: '#f8bbd0', desc: '펀치 피해·속도↑' },
    ult: { name: '벚꽃 회오리', type: 'nxSakura', desc: '꽃잎 회오리가 상대를 감쌈' } },
  { name: '유령돈', title: '난파선의 돼지 유령', type: '유령', hp: 134, power: 1.1, speed: 1.05, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big16', buy: 2082300000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (👻 유령선)', perk: '업데이트 돼지', costume: 'poison', costumeCol: '#69f0ae',
    look: look('#b2dfdb', '#6e8a88', '#d5edeb', '#c5cac4', '#3e4e4d', '#004d40', '#69f0ae', ['bold'], 1.04),
    skill: { name: '유령화', type: 'xGhPhase', cd: 360, desc: 'U: 1초 동안 투명해짐 (무적)' },
    skills: [{ name: '유령화', type: 'xGhPhase', cd: 360, desc: 'U: 1초 동안 투명해짐 (무적)' }, { name: '해골 불꽃', type: 'xGhSkull', cd: 200, desc: '↓+U: 천천히 쫓아가는 해골' }, { name: '저승의 손', type: 'xGhHand', cd: 260, desc: '←→+U: 상대 발밑에서 손이 솟아 띄움' }], wpn: 'lantern',
    tf: { name: '유령 모드', type: 'champion', color: '#69f0ae', desc: '펀치 피해·속도↑' },
    ult: { name: '유령선 습격', type: 'nxGhostShip', desc: '유령선이 화면을 가로지름' } },
  { name: '그림자돈', title: '달밤의 돼지 닌자', type: '닌자', hp: 102, power: 1.06, speed: 1.2, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big17', buy: 3748130000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (🌙 달밤의 닌자)', perk: '업데이트 돼지', costume: 'shadow', costumeCol: '#3949ab',
    look: look('#455a64', '#2b383e', '#99a4aa', '#74666b', '#182023', '#c5cae9', '#3949ab', ['bold'], 1.04),
    skill: { name: '발도술', type: 'xShIai', cd: 200, desc: 'U: 순식간에 지나가며 벰 (잠깐 무적)' },
    skills: [{ name: '발도술', type: 'xShIai', cd: 200, desc: 'U: 순식간에 지나가며 벰 (잠깐 무적)' }, { name: '수리검 3연발', type: 'xShStar', cd: 150, desc: '↓+U: 수리검 세 개' }, { name: '잠복', type: 'xShAmbush', cd: 240, desc: '←→+U: 연기 속에서 뒤로 나타나 띄움' }], wpn: 'katana',
    tf: { name: '닌자 모드', type: 'champion', color: '#3949ab', desc: '펀치 피해·속도↑' },
    ult: { name: '월광 난격', type: 'nxMoonSlash', desc: '달밤에 수없이 베고 마무리' } },
  { name: '악마돈', title: '지옥에서 온 돼지 악마', type: '악마', hp: 111, power: 1.08, speed: 1, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big18', buy: 6746640000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (😈 지옥문)', perk: '업데이트 돼지', costume: 'dark', costumeCol: '#7c4dff',
    look: look('#4a2a3a', '#2e1a24', '#9b8a93', '#77424c', '#1a0f14', '#d500f9', '#7c4dff', ['bold'], 1.04),
    skill: { name: '삼지창 찌르기', type: 'xDvTrident', cd: 160, desc: 'U: 두 번 찌름 · 사거리가 김' },
    skills: [{ name: '삼지창 찌르기', type: 'xDvTrident', cd: 160, desc: 'U: 두 번 찌름 · 사거리가 김' }, { name: '지옥불 구슬', type: 'xDvOrb', cd: 240, desc: '↓+U: 느리게 날아가며 여러 번 태움' }, { name: '사슬 당기기', type: 'xDvChain', cd: 240, desc: '←→+U: 사슬로 내 앞까지 끌어옴' }], wpn: 'trident',
    tf: { name: '악마 모드', type: 'champion', color: '#7c4dff', desc: '펀치 피해·속도↑' },
    ult: { name: '지옥문 개방', type: 'nxHellGate', desc: '발밑에 지옥문이 열려 불기둥' } },
  { name: '불꽃돈', title: '불꽃 갈기의 돼지 전사', type: '전사', hp: 94, power: 0.98, speed: 1, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big19', buy: 12143950000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (🔥 불꽃 전사)', perk: '업데이트 돼지', costume: 'fire', costumeCol: '#ff3d00',
    look: look('#ffab91', '#9e6a5a', '#ffd1c3', '#ffa38d', '#593c33', '#bf360c', '#ff3d00', ['bold'], 1.04),
    skill: { name: '화염구 2연발', type: 'xFrBall', cd: 170, desc: 'U: 불덩이 두 개 · 태움' },
    skills: [{ name: '화염구 2연발', type: 'xFrBall', cd: 170, desc: 'U: 불덩이 두 개 · 태움' }, { name: '불기둥 셋', type: 'xFrPillar', cd: 260, desc: '↓+U: 앞으로 불기둥 셋이 차례로' }, { name: '불꽃 회전차기', type: 'xFrKick', cd: 200, desc: '←→+U: 돌며 세 번 차고 태움' }], wpn: 'flamesword',
    tf: { name: '전사 모드', type: 'champion', color: '#ff3d00', desc: '펀치 피해·속도↑' },
    ult: { name: '불사조 강림', type: 'nxPhoenix', desc: '불사조가 날아와 휩쓺' } },
  { name: '펀치돈', title: '세계 챔피언 돼지 복서', type: '복싱', hp: 125, power: 1.07, speed: 1.04, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big20', buy: 21859120000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (🥊 세계 챔피언전)', perk: '업데이트 돼지', costume: 'sport', costumeCol: '#d50000',
    look: look('#f8c4b0', '#9a7a6d', '#fbdfd4', '#fab6a4', '#57453e', '#212121', '#d50000', ['gloves', 'belt', 'bold'], 1.04),
    skill: { name: '원투', type: 'xBxOneTwo', cd: 130, desc: 'U: 빠른 두 방' },
    skills: [{ name: '원투', type: 'xBxOneTwo', cd: 130, desc: 'U: 빠른 두 방' }, { name: '더킹 카운터', type: 'xBxWeave', cd: 220, desc: '↓+U: 피하며 올려 침 (잠깐 무적)' }, { name: '스크류 훅', type: 'xBxScrew', cd: 240, desc: '←→+U: 가드를 부수는 큰 한 방' }],
    tf: { name: '복서 모드', type: 'champion', color: '#d50000', desc: '펀치 피해·속도↑' },
    ult: { name: '챔피언 KO 펀치', type: 'nxKO', desc: '붙잡고 연타한 뒤 KO 펀치' } },
  // 🎉 대규모 업데이트 21~30 (relId big21~big30)
  { name: '드래곤돈', title: '용의 피를 이은 돼지', type: '드래곤', hp: 111, power: 1.01, speed: 1, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big21', buy: 39346410000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (🐉 용의 둥지)', perk: '업데이트 돼지', costume: 'dragon', costumeCol: '#b388ff',
    look: look('#9575cd', '#5c497f', '#c5b3e4', '#b07aba', '#342948', '#311b92', '#7e57c2', ['bold'], 1.04),
    skill: { name: '용의 숨결', type: 'yDrBreath', cd: 200, desc: 'U: 앞으로 불을 뿜어 여러 번 태움' },
    skills: [{ name: '용의 숨결', type: 'yDrBreath', cd: 200, desc: 'U: 앞으로 불을 뿜어 여러 번 태움' }, { name: '꼬리 휘두르기', type: 'yDrTail', cd: 170, desc: '↓+U: 낮게 휘둘러 넘어뜨림' }, { name: '비늘 방패', type: 'yDrScale', cd: 420, desc: '←→+U: 체력 6 회복 + 비늘 방패 (맞기 전까지 유지 · 필살기 빼고 한 번 다 막음)' }],
    tf: { name: '드래곤 모드', type: 'champion', color: '#b388ff', desc: '펀치 피해·속도↑' },
    ult: { name: '드래곤 브레스', type: 'nyDragon', desc: '용이 나타나 바닥을 불바다로' } },
  { name: '메카돈', title: '강철 몸의 돼지 로봇', type: '메카', hp: 116, power: 1.05, speed: 0.95, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big22', buy: 70823530000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (🤖 메카 공장)', perk: '업데이트 돼지', costume: 'mecha', costumeCol: '#00e5ff',
    look: look('#b0bec5', '#6d767a', '#d4dbdf', '#c4b1b4', '#3e4345', '#263238', '#00e5ff', ['bold'], 1.04),
    skill: { name: '로켓 펀치', type: 'yMcRocket', cd: 180, desc: 'U: 주먹이 날아갔다 돌아옴' },
    skills: [{ name: '로켓 펀치', type: 'yMcRocket', cd: 180, desc: 'U: 주먹이 날아갔다 돌아옴' }, { name: '미사일 3발', type: 'yMcMissile', cd: 260, desc: '↓+U: 따라가는 미사일 세 발' }, { name: '부스터 대시', type: 'yMcBoost', cd: 220, desc: '←→+U: 불을 뿜으며 돌진 (맞아도 안 밀림)' }], wpn: 'mechafist',
    tf: { name: '메카 모드', type: 'champion', color: '#00e5ff', desc: '펀치 피해·속도↑' },
    ult: { name: '궤도 레이저', type: 'nyMegaLaser', desc: '하늘에서 레이저가 상대를 쫓아 내리꽂힘' } },
  { name: '마녀돈', title: '숲속 오두막의 돼지 마녀', type: '마녀', hp: 130, power: 1.1, speed: 1, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big23', buy: 127482360000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (🧙‍♀️ 마녀의 숲)', perk: '업데이트 돼지', costume: 'witch', costumeCol: '#76ff03',
    look: look('#c5e1a5', '#7a8c66', '#dfefce', '#d4cb9c', '#454f3a', '#33691e', '#76ff03', ['bold'], 1.04),
    skill: { name: '독 물약', type: 'yWtPotion', cd: 220, desc: 'U: 터지면 독 웅덩이가 남음' },
    skills: [{ name: '독 물약', type: 'yWtPotion', cd: 220, desc: 'U: 터지면 독 웅덩이가 남음' }, { name: '박쥐 떼', type: 'yWtBats', cd: 200, desc: '↓+U: 박쥐 네 마리가 날아감' }, { name: '빗자루 돌진', type: 'yWtBroom', cd: 200, desc: '←→+U: 빗자루를 타고 들이받아 띄움' }], wpn: 'broom',
    tf: { name: '마녀 모드', type: 'champion', color: '#76ff03', desc: '펀치 피해·속도↑' },
    ult: { name: '마녀의 솥', type: 'nyCauldron', desc: '상대 발밑의 솥이 끓어 넘쳐 폭발' } },
  { name: '호박돈', title: '할로윈 밤의 돼지', type: '할로윈', hp: 114, power: 1.05, speed: 1, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big24', buy: 229468250000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (🎃 할로윈 밤)', perk: '업데이트 돼지', costume: 'pumpkin', costumeCol: '#ff9100',
    look: look('#ffcc80', '#9e7e4f', '#ffe3b9', '#ffbc80', '#59472d', '#3e2723', '#ff9100', ['bold'], 1.04),
    skill: { name: '낫 휘두르기', type: 'yPkScythe', cd: 170, desc: 'U: 큰 낫으로 두 번 벰' },
    skills: [{ name: '낫 휘두르기', type: 'yPkScythe', cd: 170, desc: 'U: 큰 낫으로 두 번 벰' }, { name: '호박 폭탄', type: 'yPkBomb', cd: 220, desc: '↓+U: 굴러가는 호박 폭탄' }, { name: '유령 사탕', type: 'yPkCandy', cd: 320, desc: '←→+U: 맞으면 어질어질 못 움직임' }], wpn: 'scythe',
    tf: { name: '할로윈 모드', type: 'champion', color: '#ff9100', desc: '펀치 피해·속도↑' },
    ult: { name: '할로윈 퍼레이드', type: 'nyParade', desc: '호박 등불들이 통통 튀며 몰려옴' } },
  { name: '어부돈', title: '바다를 사랑하는 돼지 어부', type: '어부', hp: 125, power: 1.07, speed: 1, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big25', buy: 413042850000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (🎣 바다 낚시)', perk: '업데이트 돼지', costume: 'fisher', costumeCol: '#fdd835',
    look: look('#ffccbc', '#9e7e75', '#ffe3da', '#ffbcad', '#594742', '#5d4037', '#1565c0', ['bold'], 1.04),
    skill: { name: '낚싯줄 당기기', type: 'yFsHook', cd: 240, desc: 'U: 낚싯바늘로 내 앞까지 끌어옴' },
    skills: [{ name: '낚싯줄 당기기', type: 'yFsHook', cd: 240, desc: 'U: 낚싯바늘로 내 앞까지 끌어옴' }, { name: '생선 던지기', type: 'yFsFish', cd: 160, desc: '↓+U: 빙글빙글 날아가는 생선' }, { name: '그물 던지기', type: 'yFsNet', cd: 320, desc: '←→+U: 그물에 걸리면 못 움직임' }], wpn: 'fishingrod',
    tf: { name: '어부 모드', type: 'champion', color: '#fdd835', desc: '펀치 피해·속도↑' },
    ult: { name: '고래 점프', type: 'nyWhale', desc: '상대 발밑에서 고래가 솟구침' } },
  { name: '궁수돈', title: '숲을 지키는 돼지 궁수', type: '궁수', hp: 105, power: 1.04, speed: 1.05, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big26', buy: 743477140000000000000, how: '🪙 돼지 도감에서 코인으로 사요 (🏹 숲의 궁수)', perk: '업데이트 돼지', costume: 'archer', costumeCol: '#43a047',
    look: look('#ffccbc', '#9e7e75', '#ffe3da', '#ffbcad', '#594742', '#3e2723', '#43a047', ['bold'], 1.04),
    skill: { name: '화살 3연사', type: 'yArShot', cd: 160, desc: 'U: 빠른 화살 세 발' },
    skills: [{ name: '화살 3연사', type: 'yArShot', cd: 160, desc: 'U: 빠른 화살 세 발' }, { name: '화살비', type: 'yArRain', cd: 260, desc: '↓+U: 상대 머리 위로 화살이 쏟아짐' }, { name: '덫 놓기', type: 'yArTrap', cd: 320, desc: '←→+U: 앞에 덫을 놓아 밟으면 묶임' }], wpn: 'bow',
    tf: { name: '궁수 모드', type: 'champion', color: '#43a047', desc: '펀치 피해·속도↑' },
    ult: { name: '천 개의 화살', type: 'nyArrowStorm', desc: '하늘을 덮는 화살비' } },
  { name: '마술돈', title: '무대 위의 돼지 마술사', type: '마술', hp: 108, power: 1.04, speed: 1.05, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big27', buy: 1.33825885e+21, how: '🪙 돼지 도감에서 코인으로 사요 (🎩 마술 쇼)', perk: '업데이트 돼지', costume: 'magician', costumeCol: '#d50000',
    look: look('#f8bbd0', '#9a7481', '#fbdae5', '#faafbc', '#574149', '#212121', '#d50000', ['bold'], 1.04),
    skill: { name: '카드 던지기', type: 'yMgCard', cd: 150, desc: 'U: 카드 세 장을 부채꼴로' },
    skills: [{ name: '카드 던지기', type: 'yMgCard', cd: 150, desc: 'U: 카드 세 장을 부채꼴로' }, { name: '비둘기 날리기', type: 'yMgDove', cd: 240, desc: '↓+U: 비둘기가 날아가 여러 번 쪼음' }, { name: '사라지기', type: 'yMgVanish', cd: 220, desc: '←→+U: 연기와 함께 상대 뒤로' }], wpn: 'cane',
    tf: { name: '마술 모드', type: 'champion', color: '#d50000', desc: '펀치 피해·속도↑' },
    ult: { name: '상자 절단 마술', type: 'nyMagicBox', desc: '상자에 가두고 톱으로 쓱싹' } },
  { name: '태권돈', title: '검은 띠 돼지 사범', type: '태권도', hp: 138, power: 1.07, speed: 1.08, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big28', buy: 2.40886592e+21, how: '🪙 돼지 도감에서 코인으로 사요 (🥋 태권도장)', perk: '업데이트 돼지', costume: 'dobok', costumeCol: '#d50000',
    look: look('#ffd0c0', '#9e8177', '#ffe5dc', '#ffbfb0', '#594943', '#212121', '#212121', ['bold'], 1.04),
    skill: { name: '뒤돌려차기', type: 'yTkBack', cd: 170, desc: 'U: 높이 차서 띄움' },
    skills: [{ name: '뒤돌려차기', type: 'yTkBack', cd: 170, desc: 'U: 높이 차서 띄움' }, { name: '나래차기', type: 'yTkFlurry', cd: 190, desc: '↓+U: 빠른 발차기 네 번' }, { name: '격파', type: 'yTkBreak', cd: 240, desc: '←→+U: 가드를 부수는 손날' }],
    tf: { name: '태권도 모드', type: 'champion', color: '#d50000', desc: '펀치 피해·속도↑' },
    ult: { name: '태권 연속 격파', type: 'nyTkCombo', desc: '붙잡고 연속 발차기 뒤 내려찍기' } },
  { name: '번개신돈', title: '천둥을 부르는 돼지 신', type: '번개', hp: 85, power: 0.96, speed: 0.95, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big29', buy: 4.33595866e+21, how: '🪙 돼지 도감에서 코인으로 사요 (⚡ 천둥 산)', perk: '업데이트 돼지', costume: 'thunder', costumeCol: '#ffee58',
    look: look('#ffe0b2', '#9e8b6e', '#ffeed5', '#ffcba6', '#594e3e', '#f57f17', '#c62828', ['bold'], 1.04),
    skill: { name: '망치 던지기', type: 'yThHammer', cd: 200, desc: 'U: 날아갔다 돌아오는 망치' },
    skills: [{ name: '망치 던지기', type: 'yThHammer', cd: 200, desc: 'U: 날아갔다 돌아오는 망치' }, { name: '번개 내려치기', type: 'yThBolt', cd: 260, desc: '↓+U: 상대 위로 번개가 떨어짐' }, { name: '망치 내려찍기', type: 'yThSlam', cd: 230, desc: '←→+U: 양쪽으로 땅울림 · 넘어뜨림' }], wpn: 'hammer',
    tf: { name: '번개 모드', type: 'champion', color: '#ffee58', desc: '펀치 피해·속도↑' },
    ult: { name: '천둥 폭풍', type: 'nyStorm', desc: '번개가 연달아 내리꽂힘' } },
  { name: '꿀벌돈', title: '꿀벌 왕국의 돼지 기사', type: '꿀벌', hp: 111, power: 1.06, speed: 1.08, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big30', buy: 7.80472558e+21, how: '🪙 돼지 도감에서 코인으로 사요 (🐝 꿀벌 왕국)', perk: '업데이트 돼지', costume: 'bee', costumeCol: '#ffd740',
    look: look('#ffe082', '#9e8b51', '#ffeeba', '#ffcb82', '#594e2e', '#212121', '#ffd740', ['bold'], 1.04),
    skill: { name: '벌침 찌르기', type: 'yBeSting', cd: 150, desc: 'U: 빠르게 찌르고 태움' },
    skills: [{ name: '벌침 찌르기', type: 'yBeSting', cd: 150, desc: 'U: 빠르게 찌르고 태움' }, { name: '꿀 웅덩이', type: 'yBeHoney', cd: 300, desc: '↓+U: 상대 발밑에 꿀 · 아주 느려짐' }, { name: '벌떼', type: 'yBeSwarm', cd: 240, desc: '←→+U: 따라가는 벌 다섯 마리' }], wpn: 'stinger',
    tf: { name: '꿀벌 모드', type: 'champion', color: '#ffd740', desc: '펀치 피해·속도↑' },
    ult: { name: '여왕벌 소환', type: 'nyQueen', desc: '여왕벌과 벌떼가 상대를 감쌈' } },
  // 🎉 대규모 업데이트 31 (relId big31): 합기도
  { name: '합기돈', title: '힘을 흘려 던지는 돼지 고수', type: '합기도', hp: 146, power: 1.1, speed: 1.02, ultRate: 0.95, scale: 1.12, unlock: 'admin', relId: 'big31', buy: 1.404850605e+22, how: '🪙 돼지 도감에서 코인으로 사요 (🥋 합기도장)', perk: '업데이트 돼지', costume: 'hapkido', costumeCol: '#283593',
    look: look('#f3c4b0', '#a8705c', '#fbe0d4', '#eba08c', '#3e2723', '#212121', '#283593', ['topknot', 'bold'], 1.04),
    skill: { name: '손목 꺾어 던지기', type: 'yHkThrow', cd: 200, desc: 'U: 붙잡아 꺾고 등 뒤로 넘겨 던짐' },
    skills: [{ name: '손목 꺾어 던지기', type: 'yHkThrow', cd: 200, desc: 'U: 붙잡아 꺾고 등 뒤로 넘겨 던짐' }, { name: '흘려 받기', type: 'yHkParry', cd: 300, desc: '↓+U: 0.75초 동안 들어오는 공격을 흘리고 되던짐' }, { name: '장타', type: 'yHkPalm', cd: 190, desc: '←→+U: 손바닥으로 기를 터뜨려 멀리 밀어냄' }],
    tf: { name: '합기도 모드', type: 'champion', color: '#283593', desc: '펀치 피해·속도↑' },
    ult: { name: '합기 연환투', type: 'nyHapkido', desc: '붙잡고 좌우로 세 번 메친 뒤 하늘로 던짐' } }
];
for (const c of CHARS) { if (c.costume) c.look.skinFx = { deco: c.costume, aura: c.costumeCol }; if (c.wpn) c.look.wpn = c.wpn; }   // 업데이트 돼지: 의상 · 손에 든 무기   // 업데이트 돼지는 의상을 입고 나옴 (스킨을 끼면 스킨 의상으로)
// 대규모 업데이트 목록 (이름에 숫자 없음) · skins: 이 업데이트에서 새 스킨을 받는 기존 돼지
const UPDATES = [
  { id: 'big3', icon: '⚔️', name: '기사단', ch: '기사돈', deco: 'knight', col: '#90a4ae', skins: ['분홍이', '깜돌이'] },
  { id: 'big4', icon: '🎅', name: '겨울 축제', ch: '산타돈', deco: 'santa', col: '#d32f2f', skins: ['멧돌이', '꼬미'] },
  { id: 'big5', icon: '🤠', name: '황야의 총잡이', ch: '카우돈', deco: 'cowboy', col: '#8d6e63', skins: ['얼음이', '족발왕'] },
  { id: 'big6', icon: '🎸', name: '록 페스티벌', ch: '펑크돈', deco: 'punk', col: '#e040fb', skins: ['오겹장군', '양념이'] },
  { id: 'big7', icon: '🏖️', name: '여름 바캉스', ch: '바캉스돈', deco: 'beach', col: '#26c6da', skins: ['항정', '목살'] },
  { id: 'big8', icon: '⚾', name: '야구장', ch: '야구돈', deco: 'sport', col: '#1e88e5', skins: ['갈비', '감자탕'] },
  { id: 'big9', icon: '🌃', name: '네온 시티', ch: '네온돈', deco: 'bolt', col: '#00e5ff', skins: ['냉삼', '금한돈'] },
  { id: 'big10', icon: '🌋', name: '화산섬', ch: '용암돈', deco: 'lava', col: '#ff6d00', skins: ['돼타로', '볼트돈'] },
  { id: 'big11', icon: '❄️', name: '눈의 왕국', ch: '눈꽃돈', deco: 'ice', col: '#40c4ff', skins: ['돼루토', '이타돼리'] },
  { id: 'big12', icon: '👑', name: '황금 제국', ch: '황제돈', deco: 'coin', col: '#ffd740', skins: ['훈제돈', '우주꿀돈'] },
  { id: 'big13', icon: '🌌', name: '은하 여행', ch: '은하돈', deco: 'star', col: '#b388ff', skins: ['핑크하트', '캡틴베이컨'] },
  { id: 'big14', icon: '🦄', name: '무지개 동산', ch: '유니돈', deco: 'rainbow', col: '#f48fb1', skins: ['꿀린', '분홍이'] },
  { id: 'big15', icon: '🌸', name: '벚꽃 축제', ch: '벚꽃돈', deco: 'petal', col: '#f8bbd0', skins: ['깜돌이', '멧돌이'] },
  { id: 'big16', icon: '👻', name: '유령선', ch: '유령돈', deco: 'poison', col: '#69f0ae', skins: ['꼬미', '얼음이'] },
  { id: 'big17', icon: '🌙', name: '달밤의 닌자', ch: '그림자돈', deco: 'shadow', col: '#3949ab', skins: ['족발왕', '오겹장군'] },
  { id: 'big18', icon: '😈', name: '지옥문', ch: '악마돈', deco: 'dark', col: '#7c4dff', skins: ['양념이', '항정'] },
  { id: 'big19', icon: '🔥', name: '불꽃 전사', ch: '불꽃돈', deco: 'fire', col: '#ff3d00', skins: ['목살', '갈비'] },
  { id: 'big20', icon: '🥊', name: '세계 챔피언전', ch: '펀치돈', deco: 'sport', col: '#d50000', skins: ['감자탕', '냉삼'] },
  { id: 'big21', icon: '🐉', name: '용의 둥지', ch: '드래곤돈', deco: 'dragon', col: '#b388ff', skins: ['금한돈', '돼타로'] },
  { id: 'big22', icon: '🤖', name: '메카 공장', ch: '메카돈', deco: 'mecha', col: '#00e5ff', skins: ['볼트돈', '돼루토'] },
  { id: 'big23', icon: '🧙‍♀️', name: '마녀의 숲', ch: '마녀돈', deco: 'witch', col: '#76ff03', skins: ['이타돼리', '훈제돈'] },
  { id: 'big24', icon: '🎃', name: '할로윈 밤', ch: '호박돈', deco: 'pumpkin', col: '#ff9100', skins: ['우주꿀돈', '핑크하트'] },
  { id: 'big25', icon: '🎣', name: '바다 낚시', ch: '어부돈', deco: 'fisher', col: '#fdd835', skins: ['캡틴베이컨', '꿀린'] },
  { id: 'big26', icon: '🏹', name: '숲의 궁수', ch: '궁수돈', deco: 'archer', col: '#43a047', skins: ['분홍이', '깜돌이'] },
  { id: 'big27', icon: '🎩', name: '마술 쇼', ch: '마술돈', deco: 'magician', col: '#d50000', skins: ['멧돌이', '꼬미'] },
  { id: 'big28', icon: '🥋', name: '태권도장', ch: '태권돈', deco: 'dobok', col: '#d50000', skins: ['얼음이', '족발왕'] },
  { id: 'big29', icon: '⚡', name: '천둥 산', ch: '번개신돈', deco: 'thunder', col: '#ffee58', skins: ['오겹장군', '양념이'] },
  { id: 'big30', icon: '🐝', name: '꿀벌 왕국', ch: '꿀벌돈', deco: 'bee', col: '#ffd740', skins: ['항정', '목살'] },
  { id: 'big31', icon: '🥋', name: '합기도장', ch: '합기돈', deco: 'hapkido', col: '#283593', skins: ['갈비', '감자탕'] }
];

const SPIRIT = look('#9575cd', '#4527a0', '#b39ddb', '#7e57c2', '#311b92', '#1a0f40', '#ffd54f', ['band', 'mane', 'muscle', 'glow', 'bold'], 1.2);   // 뚱타플레티나
const GHOST = look('#f4f8ff', '#aab8d6', '#ffffff', '#dde6f7', '#aab8d6', '#7a88a6', '#0000', []);
const ULT_RANGE = { boltRush: 500, dismantle: 900, broadside: 900, giantPotion: 300, coalRain: 900, stewFlood: 900, bbqParty: 900, meteor: 900, encore: 260, curseKing: 320, cyberSkel: 260, gumiho: 340, timeStop: 900, goldSafe: 900, sliceRain: 900, rush: 280, thousandKicks: 280, charge: 900, eruption: 700, stampede: 900, absoluteZero: 700, bodySlam: 500, beam: 900, thousandCuts: 480, megaton: 230 };
const PARTNAME = { head: '목살', belly: '삼겹', legs: '족발' };
const WEAPON = { head: '목살 몽둥이', belly: '삼겹 채찍', legs: '족발 망치' };

// ---- 로컬 저장 (연승 랭킹 · 닉네임) ----
// 🌍 월드3는 월드1과 같은 게임이지만 돈(💵 돼지달러)·빚·냉장고를 따로 저장: 월드3에 있으면 이 키들은 '_w3'이 붙은 칸을 씀
let WORLD = 1; try { WORLD = JSON.parse(localStorage.getItem('sgf_world')) === 3 ? 3 : 1; } catch (e) {}
const W3_KEYS = ['sgf_coin', 'sgf_debt', 'sgf_bank', 'sgf_debtbase', 'sgf_fridge'];
const wKey = k => WORLD === 3 && W3_KEYS.includes(k) ? k + '_w3' : k;
function lsGet(k, d) { try { const v = localStorage.getItem(wKey(k)); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(wKey(k), JSON.stringify(v)); } catch (e) {} if (!SAVE_SKIP.includes(k)) cloudDirty(); }

// ---- 계정 (게스트 / 회원) ----
// 회원 정보와 게임 진행 상황은 랭킹 서버와 따로, 회원 서버(Cloudflare Workers + D1)에 저장함.
// 회원은 기록이 바뀌면 몇 초 뒤 자동으로 계정에 저장 → 다른 기기에서 로그인해도 이어서 할 수 있음. 게스트는 이 기기에만 저장, 랭킹에 안 오름.
const AUTH_URL = 'https://samgyeopsal-auth.123eet7-1fe.workers.dev';
// 구글 로그인용 OAuth 클라이언트 ID (공개값). 비어 있으면 구글 버튼을 안 보여 줌. server/auth-worker.js의 DEFAULT_GOOGLE_CLIENT_ID와 같아야 함
const GOOGLE_CLIENT_ID = '36016988229-39ku26haf3v904rslpfvh5vnjlb3fc3t.apps.googleusercontent.com';
const AUTH_TEST = /autotest|view=|shot=|nettest/i.test(location.search);   // 자동 테스트에서는 회원 서버에 저장 안 함
const SAVE_SKIP = ['sgf_world', 'sgf_dev', 'sgf_auth', 'sgf_pid', 'sgf_homeTip', 'sgf_pidDropped', 'sgf_tyseen'];   // 기기마다 다른 값 → 계정 저장에서 뺌
let auth = lsGet('sgf_auth', null);   // null: 아직 선택 안 함 · { guest: true } · { uid, login, token, syncT }
const isMember = () => !!(auth && auth.token);
function setAuth(a) { auth = a; try { localStorage.setItem('sgf_auth', JSON.stringify(a)); } catch (e) {} }
function authFetch(path, method = 'GET', data, extra = {}) {
  const h = { 'Content-Type': 'application/json' };
  if (isMember()) h.Authorization = 'Bearer ' + auth.token;
  return fetch(AUTH_URL + path, { method, headers: h, body: data === undefined ? undefined : JSON.stringify(data), ...extra })
    .then(r => r.json().catch(() => ({})).then(d => { if (!r.ok) throw Object.assign(new Error(d.error || '서버 오류'), { status: r.status, data: d }); return d; }));
}
// 계정에 올리는 저장 데이터 = 이 기기의 sgf_ 값 전부(기기 전용 값 제외)
function collectSave() {
  const o = {};
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('sgf_') && !SAVE_SKIP.includes(k)) o[k] = localStorage.getItem(k); } } catch (e) {}
  return o;
}
function applySave(s) {
  try {
    Object.keys(localStorage).filter(k => k.startsWith('sgf_') && !SAVE_SKIP.includes(k)).forEach(k => localStorage.removeItem(k));
    for (const [k, v] of Object.entries(s || {})) if (k.startsWith('sgf_') && !SAVE_SKIP.includes(k) && typeof v === 'string') localStorage.setItem(k, v);
  } catch (e) {}
}
let cloudTimer = 0;
function cloudDirty() { if (!isMember() || AUTH_TEST) return; clearTimeout(cloudTimer); cloudTimer = setTimeout(cloudPush, 4000); }
function cloudPush(keepalive) {
  clearTimeout(cloudTimer); cloudTimer = 0;
  if (!isMember() || AUTH_TEST) return Promise.resolve();
  pushing++;
  return authFetch('/save', 'PUT', { save: collectSave(), base: auth.syncT || 0 }, keepalive ? { keepalive: true } : {})
    .then(d => setAuth({ ...auth, syncT: d.saved }))
    .catch(e => { if (e.status === 409 && e.data && e.data.conflict) return remoteSave(e.data); if (e.status === 401 || e.status === 403) authExpired(e.status === 403, e.message); }).finally(() => { pushing--; });
}
// 다른 기기에서 더 최근에 저장했으면 그 기록을 받아 옴 (게임 시작할 때)
function cloudPull() {
  if (!isMember() || AUTH_TEST) return;
  authFetch('/save').then(d => {
    if (d.save && d.saved > (auth.syncT || 0)) remoteSave(d);
  }).catch(e => { if (e.status === 401 || e.status === 403) authExpired(e.status === 403, e.message); });
}
// 서버에 더 새 기록이 있음 (관리자가 고쳤거나 다른 기기에서 함) → 새로고침 없이 그 자리에서 바로 바꿔 넣음 (싸우는 중이어도)
let pendingSave = null;
const authOpen = () => { try { return !!authShown; } catch (e) { return false; } };   // (로그인 창은 파일 끝에서 만들어짐)
const safeToReload = () => !authOpen();
function remoteSave(d) { pendingSave = d; if (safeToReload()) applyRemoteSave(); }
function applyRemoteSave() {
  const d = pendingSave; pendingSave = null; if (!d || !d.save) return;
  clearTimeout(cloudTimer); cloudTimer = 0;
  const c0 = coins;
  applySave(d.save); setAuth({ ...auth, syncT: d.saved });
  try { reloadState(); } catch (e) { try { sessionStorage.setItem('sgf_msg', '🔄 계정 기록이 바뀌어서 새로 불러왔어요'); } catch (e2) {} location.reload(); return; }
  const dc = coins - c0;
  toast(dc ? `🔄 계정 기록이 바뀌었어요 · 코인 ${dc > 0 ? '+' : ''}${fmtN(dc)}` : '🔄 계정 기록이 바뀌어서 바로 반영했어요');
}
// 저장된 값(localStorage)을 게임 안 변수에 다시 읽어 넣기 — 새로고침 대신
function reloadState() {
  coins = fixCoins(lsGet('sgf_coin', 100));
  fridge = lsGet('sgf_fridge', []);
  inv = Object.assign({ own: {}, eq: { hat: null, fx: null }, use: { meter: 0, hpup: 0, revive: 0 } }, lsGet('sgf_inv', {}));
  const auto = tyU.auto; tyU = Object.assign(TYU0(), lsGet('sgf_tycoon', {})); if (TY.phase !== 'lobby') tyU.auto = auto;   // 돌아가던 영업은 그대로
  migrateTP(); tp = lsGet('sgf_tp', 0); promo = lsGet('sgf_promo', null);
  debt = lsGet('sgf_debt', DEBT_START); bankDebt = lsGet('sgf_bank', 0); debtBase = lsGet('sgf_debtbase', DEBT_START);
  endSeen = lsGet('sgf_end', []); chapSeen = lsGet('sgf_chap', []);
  RW = rwLoad();
  refundOldSkins();
  if (typeof p1 !== 'undefined' && p1 && p1.ch && scene === 'select') p1.setChar(p1.ch);
}
let pushing = 0;   // 저장 중이면 건너뜀 (방금 내가 올린 기록을 '새 기록'으로 착각하지 않게)
function authExpired(banned, msg) { setAuth({ guest: true }); toast(banned ? '⛔ ' + (msg || '정지된 계정이에요. 관리자에게 문의하세요') : '🔑 로그인이 만료됐어요. 타이틀에서 다시 로그인해 주세요'); }
// 공지 · 랭킹 시즌 · 이벤트 · 선물 · 내 계정 기록 바뀜을 10초마다 한 번에 확인 (게임을 보고 있을 때만)
// 관리자가 바꾼 게 10초 안에, 새로고침 없이 반영됨
let IS_ADMIN = false, IS_TESTER = false;   // 테스트 계정이면 서버가 알려 줌 → 공개 전 돼지까지 모두 해금 (관리자 계정은 일반 플레이어와 같음)
let notice = '', EVT = null, GIFT = null; let BCAST = null, bcastT = 0;   // 관리자 메시지 (창·위쪽 띠 모두 14초)   // EVT: { coin, tp, ty, jackpot, spins, luck, daily, msg, until, id }
const evLive = () => !!(EVT && (!EVT.until || Date.now() < EVT.until));
const evMul = k => { if (!evLive()) return 1; const n = +EVT[k] || (EVT[k + '2x'] ? 2 : 1); return Math.max(1, n); };
const evOn = k => k.endsWith('2x') ? evMul(k.slice(0, -2)) > 1 : evLive() && !!EVT[k];
function evParts() {
  if (!evLive()) return [];
  return [evMul('coin') > 1 && `승리 코인 ${evMul('coin')}배`, evMul('tp') > 1 && `티어 점수 ${evMul('tp')}배`, evMul('ty') > 1 && `장사 매출 ${evMul('ty')}배`,
    EVT.jackpot > 0 && `잭팟 ${EVT.jackpot}%`, EVT.spins > 0 && `룰렛 무료 +${EVT.spins}`, EVT.luck && '룰렛 보상 2배', EVT.daily && '출석 보상 2배', EVT.sale > 0 && `상점 ${EVT.sale}% 할인`].filter(Boolean);
}
const evText = () => { const p = evParts(); return p.length ? '🎉 이벤트: ' + p.join(' · ') + (EVT.msg ? ` · ${EVT.msg}` : '') : ''; };
let cfgBusy = false, cfgN = 0, cfgPing = 0;
// ⚖️ 관리자 밸런스 패치: 캐릭터마다 체력·공격력·속도·필살 게이지·스킬 대기시간을 % 로 (100 = 원래대로). 다음 판부터 적용
let BASE_ST = null, balV = -1;
function applyBal(b) {
  const v = (b && b.v) || 0; if (v === balV) return;
  if (!BASE_ST) BASE_ST = CHARS.map(c => ({ hp: c.hp, power: c.power, speed: c.speed, ultRate: c.ultRate, cds: [c.skill.cd, ...(c.skills || []).map(s => s.cd)] }));
  const C = (b && b.c) || {};
  CHARS.forEach((c, i) => {
    const o = C[c.name] || {}, B = BASE_ST[i], p = k => (+o[k] || 100) / 100;
    c.hp = Math.round(B.hp * p('hp')); c.power = B.power * p('power'); c.speed = B.speed * p('speed'); c.ultRate = B.ultRate * p('ultRate');
    c.skill.cd = Math.round(B.cds[0] * p('cd')); (c.skills || []).forEach((s, j) => { s.cd = Math.round(B.cds[j + 1] * p('cd')); });
  });
  if (balV > 0 && v) toast('⚖️ 밸런스 패치가 적용됐어요 (다음 판부터)');
  balV = v;
}
setInterval(() => { if (!document.hidden) fetchConfig(); }, 10000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) fetchConfig(); });   // 다시 보면 바로 확인
function fetchConfig() {
  if (AUTH_TEST || cfgBusy) return;
  cfgBusy = true;
  if (!lsGet('sgf_dev', null)) lsSet('sgf_dev', Math.random().toString(36).slice(2, 12) + Date.now().toString(36));
  const ping = cfgPing++ % 6 === 0 ? `?p=${lsGet('sgf_dev', '')}&n=${encodeURIComponent(playerName)}&s=${scene}` : '';   // 1분마다 '지금 접속 중' 알림 (관리자 화면)
  authFetch('/config' + ping).then(d => {
    applyBal(d.bal);
    IS_ADMIN = !!d.admin; IS_TESTER = !!d.tester;
    setRel(d.rel);   // 관리자가 공개한 업데이트
    if (+d.mreset && +d.mreset !== (RW.mReset || 0)) { const today = dayKey(+d.mreset) === dayKey(); RW.mReset = +d.mreset; if (today) { RW.mDay = ''; rwMissions(); } rwSave(); if (today) toast('🎯 관리자가 일일 미션을 새로 바꿨어요! 🎁 보상 센터에서 확인'); }   // 관리자 미션 초기화
    notice = String(d.notice || '');
    const old = EVT; EVT = d.event || null;
    if (EVT && evLive() && (!old || old.id !== EVT.id) && lsGet('sgf_evseen', 0) !== (EVT.id || EVT.until || 1)) {   // 새 이벤트 시작 → 축하 팝업 (한 번만)
      lsSet('sgf_evseen', EVT.id || EVT.until || 1);
      popup({ icon: '🎉', title: '이벤트 시작!', lines: [...evParts(), EVT.msg || '', EVT.until ? `⏰ ${new Date(EVT.until).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' })}까지` : ''].filter(Boolean) });
    }
    GIFT = d.gift || null; claimGift();
    if (d.bcast && d.bcast.id && (!d.bcast.until || Date.now() < d.bcast.until)) { BCAST = d.bcast; if (lsGet('sgf_bcast', 0) !== d.bcast.id) { lsSet('sgf_bcast', d.bcast.id); bcastT = 60 * 14; popup({ auto: 60 * 14, icon: '📣', title: '관리자 메시지', lines: String(d.bcast.text).match(/.{1,26}/g) || [''], big: true }); SFX.bell(); } } else BCAST = null;   // 📣 관리자 화면 메시지
    const s = +d.season || 0;
    if (s > lsGet('sgf_season', 0)) {
      const had = tp > 0 || lsGet('sgf_rbest', 0) > 0;
      tp = 0; promo = null;
      for (const [k, v] of [['sgf_tp', 0], ['sgf_rbest', 0], ['sgf_ranked', false], ['sgf_rank', []], ['sgf_promo', null], ['sgf_rkpending', false], ['sgf_season', s]]) lsSet(k, v);
      if (had) toast('🏆 새 랭킹 시즌 시작! 티어와 연승 기록이 초기화됐어요');
    }
    // 내 계정 기록이 서버에서 바뀌었는지: 관리자가 고친 거면 기다리던 저장도 버리고 바로 받음, 다른 기기면 저장할 게 없을 때 받음
    if (isMember() && d.saved === undefined && ++cfgN % 2 === 0 && !pendingSave && !pushing && !cloudTimer) cloudPull();   // 옛 서버(계정 시각을 안 줌)면 20초마다 직접 확인
    if (isMember() && d.saved && d.saved > (auth.syncT || 0) && !pendingSave && !pushing) {
      if (d.adminEdit && d.adminEdit > (auth.syncT || 0)) { clearTimeout(cloudTimer); cloudTimer = 0; cloudPull(); }
      else if (!cloudTimer) cloudPull();
    }
  }).catch(e => { if (e && (e.status === 401 || e.status === 403) && isMember()) cloudPull(); }).finally(() => { cfgBusy = false; });
}
document.addEventListener('visibilitychange', () => { if (document.hidden && cloudTimer) cloudPush(true); });   // 앱을 내리거나 닫을 때 바로 저장
// 닉네임: 회원은 회원가입 때 정한 아이디 그대로(바꿀 수 없음), 게스트는 N으로 정한 이름 또는 '돼지123'
let playerName = isMember() ? auth.login : (lsGet('sgf_name', null) || ('돼지' + (100 + Math.random() * 900 | 0)));
function getRank() { return lsGet('sgf_rank', []); }
function saveRank(entry) {
  const r = getRank(); r.push(entry);
  r.sort((a, b) => b.streak - a.streak || a.time - b.time);
  const top = r.slice(0, 10); lsSet('sgf_rank', top);
  return top.indexOf(entry);
}
// 패배하면: 랜덤 부위 → 어울리는 요리 3가지 중 선택
const METHODS = {
  grill:  { label: '구이', cap: '지글지글~ 노릇노릇~', sfx: '치이이이익~~~', mid: '뒤집기!' },
  fry:    { label: '튀김', cap: '바삭바삭 튀겨지는 중...', sfx: '촤아아아~~~', mid: '건져내기!' },
  wok:    { label: '볶음', cap: '불맛 가득 웍질!', sfx: '화르르륵~~~', mid: '양념 투하!' },
  braise: { label: '조림', cap: '한약재 넣고 뭉근하게...', sfx: '뭉근뭉근~~~', mid: '건져내기!' },
  boil:   { label: '수육', cap: '푹 삶아서 부들부들~', sfx: '보글보글~~~', mid: '건져내기!' }
};
// [요리 이름, 조리법, 궁합(3 찰떡 / 2 괜찮음 / 1 모험)]
const MEATS = [
  { name: '삼겹살', opts: [['삼겹살 구이', 'grill', 3], ['보쌈', 'boil', 2], ['삼겹 튀김', 'fry', 1]] },
  { name: '목살', opts: [['목살 스테이크', 'grill', 3], ['제육볶음', 'wok', 2], ['목살 탕수육', 'fry', 1]] },
  { name: '등심', opts: [['돈까스', 'fry', 3], ['등심 구이', 'grill', 2], ['등심 장조림', 'braise', 1]] },
  { name: '앞다리', opts: [['제육볶음', 'wok', 3], ['수육', 'boil', 2], ['앞다리 돈까스', 'fry', 1]] },
  { name: '족', opts: [['족발', 'braise', 3], ['불족발 볶음', 'wok', 2], ['족발 튀김', 'fry', 1]] },
  { name: '갈비', opts: [['돼지갈비', 'grill', 3], ['갈비찜', 'braise', 2], ['갈비 튀김', 'fry', 1]] },
  { name: '항정살', opts: [['항정살 구이', 'grill', 3], ['항정 볶음', 'wok', 2], ['항정 수육', 'boil', 1]] }
];
const FIT = ['', '모험! 별점 랜덤 · 비싸게 팔림', '괜찮은 궁합', '찰떡 궁합 ★'];
const FITCOL = ['', '#ff8a80', '#fff59d', '#69f0ae'];
function makeDish(o) { return { name: o[0], method: o[1], fit: o[2], ...METHODS[o[1]], cap: (typeof DISH_CAP !== 'undefined' && DISH_CAP[o[0]]) || METHODS[o[1]].cap }; }   // 요리마다 다른 설명

// ---- 코인 · 음성 ----
// 돈은 자바스크립트 숫자의 끝(약 1.8e308) 바로 아래 1e308(=100UCe)에서 멈춤 — 넘으면 ∞가 되어 저장이 깨지므로
const COIN_MAX = 1e308;
const fixCoins = v => (typeof v === 'number' && v === v) ? Math.min(COIN_MAX, Math.max(0, v)) : (v === null ? COIN_MAX : 0);
let coins = fixCoins(lsGet('sgf_coin', 100)), bet = 0, betSel = 0;
const EARN = 0.5;   // 돈 벌기 어렵게: 싸움·장사·보상으로 버는 코인 절반
function addCoins(n) { coins = fixCoins(Math.round(coins + n)); lsSet('sgf_coin', coins); }
// 음성(TTS)은 껐음 — 호출하는 곳은 그대로 두고 아무것도 하지 않음
function speak() {}

