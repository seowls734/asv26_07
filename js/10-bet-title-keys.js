// ================= AI 경기 베팅 =================
// 컨디션은 실제 경기에 반영됨: AI 실력(COND_LV) + 체력(COND_HP) + 공격력(COND_DMG). 화면에도 돼지 모습·효과로 보여 줌
const COND = ['😵 나쁨', '🙂 보통', '😤 좋음', '🔥 최상'], COND_LV = [0, 3, 6, 10], BET_PCT = [0, 0.1, 0.25, 0.5, 1];
const COND_HP = [0.85, 1, 1.08, 1.15], COND_DMG = [0.9, 1, 1.05, 1.1], COND_COL = ['#ff8a80', '#fff', '#69f0ae', '#ffd740'];
const COND_FX = ['체력·공격↓ · 반응 느림', '평소 실력', '체력·공격↑ · 반응 빠름', '체력·공격↑↑ · 신들림'];
const bet4 = { a: 0, b: 1, ca: 1, cb: 1, oa: 2, ob: 2, pa: 0.5, side: 0, amt: 1, stake: 0, fast: false };
// 예상 전투력: 체력 × 공격력 × 속도 × 컨디션 (AI 실력 포함)
const betPower = (c, cd) => (c.hp / 100) * COND_HP[cd] * c.power * COND_DMG[cd] * Math.sqrt(c.speed) * (1 + 0.04 * COND_LV[cd]);
function openBet() {
  if (coins < 10) toast('💸 파산! 🏦 은행에서 대출을 받으세요 (지금은 구경만 가능)');
  const a = pickShown(); let b; do { b = pickShown(); } while (b === a);
  Object.assign(bet4, { a, b, ca: Math.random() * 4 | 0, cb: Math.random() * 4 | 0, side: 0, amt: 1, stake: 0 });
  const ra = betPower(CHARS[a], bet4.ca) ** 3, rb = betPower(CHARS[b], bet4.cb) ** 3;
  const pa = bet4.pa = clamp(ra / (ra + rb) + (Math.random() - 0.5) * 0.06, 0.1, 0.9);   // 숨은 변수 조금
  bet4.oa = Math.max(1.1, Math.round(92 / pa) / 100); bet4.ob = Math.max(1.1, Math.round(92 / (1 - pa)) / 100);
  mode = 4; scene = 'betpick';
}
// 컨디션을 돼지 모습으로: 나쁨 = 칙칙·식은땀·움찔, 좋음 = 초록 기운, 최상 = 불꽃 기운 + 만세
function condPose(cd, p, x, y, sc) {
  if (cd === 0) { p.filter = (p.filter || '') + ' saturate(0.45) brightness(0.85)'; if (gT % 90 < 30) p.hurt = true; }
  if (cd === 2) p.aura = '#69f0ae';
  if (cd === 3) p.aura = '#ff9100';
  return p;
}
function drawCondFx(cd, x, y, sc) {   // 머리 위 땀방울·한숨 / 반짝이·불꽃
  if (cd === 0) {
    const k = (gT % 50) / 50; ctx.fillStyle = `rgba(130,200,255,${1 - k})`; ell(x + 30 * sc, y - 170 * sc + k * 30, 5, 8); ctx.fill();
    txt('💦', x - 34 * sc, y - 185 * sc, 20, '#fff', null);
  }
  if (cd === 2 && gT % 60 < 30) txt('💪', x - 40 * sc, y - 185 * sc, 20, '#fff', null);
  if (cd === 3) { txt(gT % 40 < 20 ? '🔥' : '✨', x - 40 * sc, y - 190 * sc, 24, '#fff', null); txt('🔥', x + 42 * sc, y - 150 * sc + Math.sin(gT * 0.2) * 4, 18, '#fff', null); }
}
function updateBetPick() {
  if (pressed.KeyA || pressed.ArrowLeft) { bet4.side = 0; SFX.select(); }
  if (pressed.KeyD || pressed.ArrowRight) { bet4.side = 1; SFX.select(); }
  if (pressed.KeyW || pressed.ArrowUp) { bet4.amt = Math.min(4, bet4.amt + 1); SFX.select(); }
  if (pressed.KeyS || pressed.ArrowDown) { bet4.amt = Math.max(0, bet4.amt - 1); SFX.select(); }
  for (let i = 0; i < 5; i++) if (pressed['Digit' + (i + 1)]) { bet4.amt = i; SFX.select(); }
  if (pressed.KeyR) openBet();
  if (pressed.Enter || pressed.Space || pressed.KeyI) {
    bet4.stake = bet4.amt ? Math.max(1, Math.floor(coins * BET_PCT[bet4.amt])) : 0;
    if (bet4.stake > coins) bet4.stake = coins;
    if (bet4.stake > 0) { addCoins(-bet4.stake); SFX.stamp(); rwProgress('bet'); nqAdd('bet', 1); }
    p1.setChar(CHARS[bet4.a]); p2.setChar(CHARS[bet4.b]); scene = 'vs'; sceneT = 0;
  }
  if (pressed.Escape) { mode = 1; toTitle(); }
}
function drawBetPick() {
  drawStage(); ctx.fillStyle = 'rgba(15,8,25,0.7)'; ctx.fillRect(0, 0, W, H);
  txt('🎲 AI 경기 베팅', W / 2, 32, 32, '#fff', '#000', 6);
  txt(`🪙 ${fmtN(coins)} 코인`, W - 24, 32, 20, '#ffd740', '#000', 4, 'right');
  // 예상 승률 막대: 왼쪽 돼지 vs 오른쪽 돼지 (능력치 + 컨디션으로 계산)
  const pa = bet4.pa, bx = W / 2 - 200, bwid = 400;
  ctx.fillStyle = '#222'; rr(bx - 2, 54, bwid + 4, 18, 6); ctx.fill();
  ctx.fillStyle = '#ef5350'; ctx.fillRect(bx, 56, bwid * pa, 14); ctx.fillStyle = '#42a5f5'; ctx.fillRect(bx + bwid * pa, 56, bwid * (1 - pa), 14);
  txt(`예상 승률 ${Math.round(pa * 100)}%`, bx - 10, 63, 14, '#ff8a80', '#000', 3, 'right');
  txt(`${Math.round((1 - pa) * 100)}%`, bx + bwid + 10, 63, 14, '#82b1ff', '#000', 3, 'left');
  txt(pa > 0.62 ? '◀ 왼쪽 우세' : pa < 0.38 ? '오른쪽 우세 ▶' : '막상막하!', W / 2, 63, 12, '#fff', '#000', 3);
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(14, 16, 80, 32, 8); ctx.fill(); txt('← 나가기', 54, 32, 13, '#fff', null);
  addHot(14, 16, 80, 32, () => { pressed.Escape = true; });
  [[bet4.a, bet4.ca, bet4.oa], [bet4.b, bet4.cb, bet4.ob]].forEach(([ci, cd, od], s) => {
    const c = CHARS[ci], x = s ? 500 : 60, on = bet4.side === s;
    ctx.fillStyle = on ? 'rgba(110,25,35,0.9)' : 'rgba(25,12,40,0.85)'; rr(x, 80, 400, 300, 16); ctx.fill();
    ctx.strokeStyle = on ? '#ff5252' : 'rgba(255,255,255,0.2)'; ctx.lineWidth = on ? 4 : 2; rr(x, 80, 400, 300, 16); ctx.stroke();
    addHot(x, 80, 400, 300, () => { bet4.side = s; SFX.select(); });
    const psc = c.scale * 1.15;
    drawPig(x + 110, 330, s ? -1 : 1, c.look, condPose(cd, { scale: psc, t: gT + s * 40, victory: cd === 3 ? gT % 80 < 40 : on && gT % 120 < 40 }, x + 110, 330, psc));
    drawCondFx(cd, x + 110, 330, psc);
    txt(c.name, x + 290, 106, 26, '#fff', '#000', 5); txt(`${c.title} · ${c.type}`, x + 290, 130, 12, '#ccc', null);
    // 컨디션: 배지 + 실제 효과
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; rr(x + 195, 142, 190, 44, 8); ctx.fill(); ctx.strokeStyle = COND_COL[cd]; ctx.lineWidth = 2; rr(x + 195, 142, 190, 44, 8); ctx.stroke();
    txt(`컨디션 ${COND[cd]}`, x + 290, 156, 15, COND_COL[cd], null);
    txt(COND_FX[cd], x + 290, 175, fitSize(COND_FX[cd], 11, 180), '#ddd', null);
    // 능력치 막대 (컨디션 반영된 값은 밝게, 원래 값은 흐리게)
    const stats = [['체력', c.hp / 130, COND_HP[cd]], ['공격', c.power / 1.4, COND_DMG[cd]], ['속도', c.speed / 1.4, 1]];
    stats.forEach(([lb, v, m], k) => {
      const yy = 198 + k * 18, bx2 = x + 232, bw2 = 150;
      txt(lb, x + 212, yy + 5, 11, '#bbb', null);
      ctx.fillStyle = '#333'; ctx.fillRect(bx2, yy, bw2, 9);
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(bx2, yy, bw2 * clamp(v), 9);
      ctx.fillStyle = COND_COL[cd] === '#fff' ? '#90caf9' : COND_COL[cd]; ctx.fillRect(bx2, yy, bw2 * clamp(v * m), 9);
    });
    txt(`배당`, x + 290, 262, 13, '#bbb', null);
    txt(`×${od.toFixed(2)}`, x + 290, 292, 34, '#ffd740', '#000', 6);
    txt(`필살기: ${c.ult.name}`, x + 290, 324, 12, '#ffab91', null);
    if (on) txt('✔ 여기에 건다!', x + 290, 352, 18, '#ff8a80', '#000', 4);
  });
  ['구경만', '10%', '25%', '50%', '올인!'].forEach((s, i) => {
    const x = W / 2 - 300 + i * 122, on = bet4.amt === i, v = i ? Math.max(1, Math.floor(coins * BET_PCT[i])) : 0;
    ctx.fillStyle = on ? (i === 4 ? '#ff1744' : '#ffb300') : 'rgba(255,255,255,0.12)'; rr(x, 398, 112, 50, 10); ctx.fill();
    txt(`${i + 1}. ${s}`, x + 56, 414, 15, on ? '#000' : '#fff', null); txt(i ? `${fmtN(Math.min(v, coins))}코인` : '0코인', x + 56, 434, 12, on ? '#222' : '#ccc', null);
    addHot(x, 398, 112, 50, () => { bet4.amt = i; SFX.select(); });
  });
  const od = bet4.side ? bet4.ob : bet4.oa, st = bet4.amt ? Math.min(coins, Math.max(1, Math.floor(coins * BET_PCT[bet4.amt]))) : 0;
  ctx.fillStyle = '#e53935'; rr(W / 2 - 170, 462, 340, 50, 12); ctx.fill();
  txt(st ? `🔔 경기 시작! (적중 시 +${fmtN(st * od)})` : '🔔 경기 시작! (구경만)', W / 2, 487, 18, '#fff', '#000', 4);
  addHot(W / 2 - 170, 462, 340, 50, () => { pressed.Enter = true; });
  txt('A/D 고르기 · W/S 금액 · Enter 시작 · R 다른 대진', W / 2, 528, 12, '#aaa', null);
}

// ================= 살아 있는 무대 (관중·조명) =================
const bgBackC = bgC._back, bgFrontC = bgC._front;   // buildBg에서 만든 뒤·앞 레이어
let lastGrp = '', fadeA = 0;
const vigC = document.createElement('canvas'); vigC.width = W; vigC.height = H;
const glowC = document.createElement('canvas'); glowC.width = glowC.height = 64;
(function buildLayers() {
  const v = vigC.getContext('2d'), vg = v.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)'); v.fillStyle = vg; v.fillRect(0, 0, W, H);
  const g = glowC.getContext('2d'), gg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gg.addColorStop(0, 'rgba(255,236,170,1)'); gg.addColorStop(0.3, 'rgba(255,200,90,0.5)'); gg.addColorStop(1, 'rgba(255,170,60,0)');
  g.fillStyle = gg; g.fillRect(0, 0, 64, 64);
})();
let hype = 0;
function drawStage() {
  unmirrored(() => ctx.drawImage(bgBackC, 0, 0, W, H));   // 배경 그림(간판 글씨 포함)은 뒤집지 않음
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let x = 20, i = 0; x < W; x += 40, i++) {
    const t = x / W, y = (1 - t) * (1 - t) * 100 + 2 * (1 - t) * t * 150 + t * t * 100 + 8;
    ctx.globalAlpha = 0.25 + 0.25 * Math.sin(gT * 0.06 + i * 1.7) + hype * 0.2;
    ctx.drawImage(glowC, x - 32, y - 32);
  }
  ctx.restore();
  hype *= 0.985;
  for (let i = 0; i < 22; i++) {   // 관중: 타격이 크면 들썩인다
    const x = 20 + i * 44 + Math.sin(i * 3) * 8, jump = Math.max(0, Math.sin(gT * (0.15 + hype * 0.15) + i * 1.3)) * (2 + hype * 10);
    const y = 360 + (i % 2) * 8 - jump;
    ctx.fillStyle = i % 3 ? '#2a1d38' : '#33244a';
    ell(x, y, 20, 20); ctx.fill();
    poly([[x - 16, y - 10], [x - 12, y - 30], [x - 4, y - 16]]); ctx.fill();
    poly([[x + 16, y - 10], [x + 12, y - 30], [x + 4, y - 16]]); ctx.fill();
    if (hype > 0.5 && i % 2) { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 6; ctx.lineCap = 'round'; line(x - 14, y + 4, x - 24, y - 26 - jump); line(x + 14, y + 4, x + 24, y - 26 - jump); }
    ctx.fillStyle = 'rgba(255,170,190,0.25)'; ell(x + 2, y + 6, 8, 6); ctx.fill();
  }
  unmirrored(() => ctx.drawImage(bgFrontC, 0, 0, W, H));
  drawFloor();
}
// 돼지 입체감: 왼쪽 위에서 빛을 받은 그라데이션
const shadeCache = new Map();
function tintHex(hex, k) {
  const key = hex + k; if (shadeCache.has(key)) return shadeCache.get(key);
  let out = hex;
  if (/^#[0-9a-f]{6}$/i.test(hex)) {
    const n = parseInt(hex.slice(1), 16), c = [n >> 16, n >> 8 & 255, n & 255].map(v => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)));
    out = `rgb(${c.join(',')})`;
  }
  shadeCache.set(key, out); return out;
}
function shadeFill(col, x, y, r) {
  if (!/^#[0-9a-f]{6}$/i.test(col)) return col;
  const g = ctx.createRadialGradient(x, y, 2, x + r * 0.3, y + r * 0.4, r * 1.5);
  g.addColorStop(0, tintHex(col, 0.35)); g.addColorStop(0.5, col); g.addColorStop(1, tintHex(col, -0.15));
  return g;
}
function drawPortrait(cx, cy, r, C, face) {
  ctx.save(); ell(cx, cy, r, r); ctx.fillStyle = '#1b1030'; ctx.fill(); ctx.clip();
  drawPig(cx - 18 * face, cy + 47, face, C, { scale: 0.52, t: gT });
  ctx.restore();
  ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 3; ell(cx, cy, r, r); ctx.stroke();
}

// ================= 타이틀 메뉴 =================
const MENU = [
  ['🏆 랭크전', () => isMember() ? '티어에 맞춰 강해지는 CPU · 랭킹 반영' : '티어별 CPU · 게스트는 랭킹 미반영', () => { mode = 1; ranked = true; selFor = 'run'; scene = 'select'; }],
  ['🔥 연승 모드', 'CPU와 끝없는 연승 도전 (랭킹 미반영)', () => { mode = 1; ranked = false; selFor = 'run'; scene = 'select'; }],
  ['🥊 연습 모드', '가만히 있는 상대에게 기술 연습 · 시간·체력·필살 무한', () => { mode = 6; ranked = false; selFor = 'run'; scene = 'select'; }],
  ['🌐 온라인 1:1', '4자리 코드로 친구와 대전', () => { mode = 1; ranked = false; selFor = 'online'; NET.err = ''; scene = 'online'; }],
  ['🎲 AI 경기 베팅', 'CPU끼리 싸움에 코인 걸기', () => openBet()],
  ['🎁 보상 센터', () => rewardBadge() ? (spinFree() ? `출석·미션 · 🎟️ 룰렛 티켓 ${spinFree()}장!` : '받을 보상이 있어요!') : '출석 체크 · 행운 룰렛 · 일일 미션', () => openReward()],
  ['🐷 돼지 도감', () => `모은 돼지 ${pigList().filter(c => isUnlocked(c)).length}/${pigList().length} · 강화 · 레벨업`, () => openPigs()],
  ['🏮 포장마차 시장', '장사로 돈 벌기 · 요리 팔기 · 상점', () => openMarket()],
  ['🏦 은행 · 빚 갚기', () => totalDebt() > 0 ? `빚 ${fmtN(totalDebt())} 남음` : '빚 청산 완료! 👑', () => { bk.sel = 0; scene = 'bank'; }],
  ['📊 랭킹', '랭크전 티어 · 최고 연승 TOP 100', () => openRanking(false)],
  ['🎬 엔딩 수집', () => `${endSeen.length}/${ENDINGS.length} · 본 엔딩 다시 보기`, () => { endSel = 0; scene = 'endings'; }]
];
// ================= 엔딩 수집 화면 =================
// 이미 본 엔딩은 여기서만 다시 볼 수 있음. 안 본 엔딩은 얻는 방법 힌트만
const END_INFO = {
  ending: ['🎉', '사채 1000만 코인을 모두 갚기'],
  rich: ['💰', '빚을 다 갚고 코인 3000만 모으기'],
  master: ['🏆', '랭크전 최고 티어(그렌드피아노) 달성'],
  bad: ['💀', '코인이 0이 되어 파산하기']
};
let endSel = 0;
function updateEndings() {
  const n = ENDINGS.length;
  if (pressed.KeyA || pressed.ArrowLeft || pressed.KeyD || pressed.ArrowRight) { endSel ^= 1; SFX.select(); }
  if (pressed.KeyW || pressed.ArrowUp || pressed.KeyS || pressed.ArrowDown) { endSel = (endSel + 2) % n; SFX.select(); }
  if (pressed.Enter || pressed.Space || pressed.KeyI) {
    const k = ENDINGS[endSel][0];
    if (endSeen.includes(k)) { SFX.confirm(); startStory(k, 'endings'); story.replay = true; }
    else { SFX.block(); toast(`아직 못 본 엔딩이에요 · 힌트: ${END_INFO[k][1]}`); }
  }
  if (pressed.KeyC) { openCutList(); return; }   // 컷신·예고편 다시 보기
  if (pressed.Escape) toTitle();
}
function drawEndings() {
  drawStage(); ctx.fillStyle = 'rgba(10,5,25,0.8)'; ctx.fillRect(0, 0, W, H);
  txt('🎬 엔딩 수집', W / 2, 40, 34, '#ffe082', '#000', 7);
  txt(`모은 엔딩 ${endSeen.length} / ${ENDINGS.length} · 본 엔딩은 눌러서 다시 볼 수 있어요`, W / 2, 76, 15, '#fff', null);
  ENDINGS.forEach(([k, nm], i) => {
    const x = 90 + (i % 2) * 400, y = 104 + (i >> 1) * 170, got = endSeen.includes(k), on = endSel === i;
    ctx.fillStyle = on ? (got ? 'rgba(255,145,0,0.35)' : 'rgba(255,255,255,0.12)') : 'rgba(25,12,40,0.85)'; rr(x, y, 380, 150, 16); ctx.fill();
    ctx.strokeStyle = on ? '#ffd54f' : got ? 'rgba(255,224,130,0.5)' : 'rgba(255,255,255,0.15)'; ctx.lineWidth = on ? 4 : 2; rr(x, y, 380, 150, 16); ctx.stroke();
    txt(got ? END_INFO[k][0] : '🔒', x + 60, y + 75, 48, '#fff', null);
    txt(got ? `${nm} 엔딩` : '???', x + 230, y + 42, 24, got ? '#fff' : '#888', '#000', 4);
    txt(got ? '본 엔딩' : '아직 못 본 엔딩', x + 230, y + 74, 13, got ? '#69f0ae' : '#aaa', null);
    txt(`조건: ${END_INFO[k][1]}`, x + 230, y + 100, fitSize(`조건: ${END_INFO[k][1]}`, 12, 260), '#ffe0b2', null);
    if (got) { ctx.fillStyle = on ? '#ff5252' : 'rgba(255,82,82,0.6)'; rr(x + 170, y + 114, 120, 26, 8); ctx.fill(); txt('▶ 다시 보기', x + 230, y + 127, 13, '#fff', null); }
    addHot(x, y, 380, 150, () => { endSel = i; pressed.Enter = true; });
  });
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(14, 14, 80, 30, 8); ctx.fill(); txt('← 나가기', 54, 29, 13, '#fff', null);
  addHot(14, 14, 80, 30, () => { pressed.Escape = true; });
  ctx.fillStyle = gT % 50 < 30 ? '#c62828' : '#e53935'; rr(W / 2 - 170, 456, 340, 38, 11); ctx.fill(); txt('🎬 컷신 · 예고편 다시 보기' + (TOUCH ? '' : ' [C]'), W / 2, 475, 16, '#fff', null); addHot(W / 2 - 170, 456, 340, 38, () => openCutList());
  txt(TOUCH ? '엔딩 칸을 탭하면 다시 보기' : '방향키/WASD 고르기 · Enter 다시 보기 · Esc 나가기', W / 2, 510, 13, '#aaa', null);
}
let titleSel = 0;
const MENU_H = () => Math.min(32.5, 330 / MENU.length);   // 메뉴가 늘어도 화면 안에 (한 칸 높이)
function updateTitle() {
  if (tutOffer) { updateTutOffer(); return; }
  if (pressed.KeyW || pressed.ArrowUp) { titleSel = (titleSel + MENU.length - 1) % MENU.length; SFX.select(); }
  if (pressed.KeyS || pressed.ArrowDown) { titleSel = (titleSel + 1) % MENU.length; SFX.select(); }
  let go = pressed.Enter || pressed.Space || pressed.KeyI;
  for (let i = 0; i < MENU.length; i++) if (pressed['Digit' + (i + 1)] || pressed['Numpad' + (i + 1)]) { titleSel = i; go = true; }
  if (go) { SFX.confirm(); MENU[titleSel][2](); }
  else if (pressed.KeyN && isMember()) toast(`👤 회원 닉네임은 아이디(${auth.login})와 같아요`);
  else if (pressed.KeyN) {
    gameInput('닉네임 (최대 8글자)', playerName, 8, n => { if (n && n.trim()) { playerName = n.trim().slice(0, 8); lsSet('sgf_name', playerName); uploadRank(); toast(`👤 닉네임: ${playerName}`); } });   // 브라우저 창 대신 게임 안 창
  }
  else if (pressed.KeyL) openAuth(isMember() ? 'account' : 'choose');   // L = 로그인·회원가입 / 내 계정
  maybeOfferTut();   // 처음 온 사람에게 튜토리얼 권하기 (끝냈거나 다시 보지 않기면 안 뜸)
  if (attReady() && !AUTH_TEST && auth && gT > 90) claimAttendance();   // 오늘 처음 켜면 출석 보상 팝업
  if (gT % 5 === 0) flame(W / 2 + rand(-230, 230), 100 + rand(-5, 5));
}
function drawTitle() {
  drawStage();
  ctx.fillStyle = 'rgba(10,5,25,0.5)'; ctx.fillRect(0, 0, W, H);
  const b = Math.sin(gT * 0.05) * 4;
  drawParts();
  ctx.save(); ctx.shadowColor = '#ff4081'; ctx.shadowBlur = 28;
  txt('삼겹살 파이터', W / 2, 62 + b, 70, '#ffc1d0', '#5a1a2a', 14); ctx.restore();
  const evT = evText();   // 이벤트 중이면 부제 자리에 이벤트 안내
  if (evT) txt(evT, W / 2, 112, fitSize(evT, 18, W - 80), gT % 40 < 28 ? '#ffd740' : '#fff59d', '#000', 5);
  else txt('철판 대난투 · 지는 돼지는 오늘의 요리가 된다!', W / 2, 112, 18, '#ffe0b2', '#000', 5);
  const best = Math.max(lsGet('sgf_rbest', 0), getRank().filter(r => r.name === playerName && r.rk).reduce((m, r) => Math.max(m, r.streak), 0));   // 랭킹과 같게: 랭크전 최고 연승도 같이 봄
  // 티어 배지 + 상태 줄을 한 덩어리로 가운데 정렬 (숫자가 길어져도 배지와 겹치지 않게, 너무 길면 글자를 줄임)
  const stat = `👤 ${honorTag()}${titleName() ? titleName() + ' ' : ''}${playerName}${isMember() ? '' : ' [N]'}  ·🏆 ${best}연승  ·  🪙 ${fmtN(coins)}  ·  💸 빚 ${fmtN(debt + bankDebt)}  ·  🧊 ${fridge.length}`;
  ctx.font = `900 12px ${FONT}`; const bw = ctx.measureText(`🏅 ${tierLabel(tp)}`).width + 16;
  const ss = fitSize(stat, 14, W - 60 - bw), sw = (ctx.font = `900 ${ss}px ${FONT}`, ctx.measureText(stat).width), sx = W / 2 - (bw + 10 + sw) / 2;
  drawTierBadge(sx, 138, tp, 12, 'left');
  txt(stat, sx + bw + 10, 139, ss, '#e0e0e0', '#000', 4, 'left');
  if (coins < 10 && gT % 60 < 40) txt("💸 파산 직전! 🏦 은행에서 대출받으세요", W / 2, 464, 15, '#ff8a80', '#000', 4);
  addHot(W / 2 - 300, 128, 600, 24, () => { pressed.KeyN = true; });
  // 왼쪽 위: 계정 버튼 (게스트 → 로그인·가입 / 회원 → 내 계정)
  const acc = isMember() ? `👤 ${auth.login} [L]` : '🔑 로그인 · 가입 [L]';
  const accS = fitSize(acc, 13, 160);
  ctx.fillStyle = isMember() ? 'rgba(255,255,255,0.15)' : 'rgba(255,128,171,0.45)'; rr(14, 12, 170, 30, 8); ctx.fill();
  txt(acc, 99, 27, accS, '#fff', null);
  if (!isMember()) txt('게스트 · 랭킹 미반영', 99, 52, 11, '#ffcdd2', '#000', 3);
  addHot(14, 12, 170, 30, () => openAuth(isMember() ? 'account' : 'choose'));
  MENU.forEach(([label, sub], i) => {
    const x = W / 2 - 190, y = 150 + i * MENU_H(), mh = MENU_H() - 1, on = titleSel === i;
    if (on) {
      const g = ctx.createLinearGradient(x, 0, x + 380, 0); g.addColorStop(0, '#ff5252'); g.addColorStop(1, '#ff9100');
      ctx.save(); ctx.shadowColor = '#ff5252'; ctx.shadowBlur = 16; ctx.fillStyle = g; rr(x, y, 380, mh, 11); ctx.fill(); ctx.restore();
    } else { ctx.fillStyle = "rgba(25,12,40,0.85)"; rr(x, y, 380, mh, 11); ctx.fill(); }
    txt(`${i + 1}  ${label}`, x + 18, y + mh / 2, 17, '#fff', on ? '#7f0000' : null, 4, 'left');
    { const st = typeof sub === "function" ? sub() : sub; ctx.font = `900 17px ${FONT}`; const lw2 = ctx.measureText(`${i + 1}  ${label}`).width; txt(st, x + 366, y + mh / 2, fitSize(st, 12, 366 - 18 - lw2 - 14), on ? '#fff' : '#bbb', null, 0, 'right'); }   // 설명이 길면 이름과 안 겹치게 줄임
    if (label.startsWith('🎁') && rewardBadge()) { ctx.fillStyle = gT % 40 < 20 ? '#ff1744' : '#ff8a80'; ctx.beginPath(); ctx.arc(x + 6, y + 4, 7, 0, Math.PI * 2); ctx.fill(); txt('!', x + 6, y + 4, 11, '#fff', null); }   // 받을 보상이 있으면 빨간 점
    addHot(x, y, 380, mh, () => { titleSel = i; pressed.Enter = true; });   // 한 번 탭하면 바로 들어감
  });
  const sh = shownIdx(), i = sh[(gT / 150 | 0) % sh.length], i2 = sh[((gT / 150 | 0) + 5) % sh.length];
  drawPig(150, 470, 1, withCos(CHARS[i]).look, { t: gT, scale: CHARS[i].scale * 1.1 });
  drawPig(810, 470, -1, CHARS[i2].look, { t: gT + 30, scale: CHARS[i2].scale * 1.1 });
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; rr(60, 482, 840, 50, 10); ctx.fill();
  const hl = notice ? `📢 공지: ${notice}` : TOUCH ? '왼쪽 조이스틱: 이동·점프·앉기 (뒤로 끌면 막기) · 오른쪽 버튼: 공격·스킬·업어치기·필살기' : '이동 A/D · 점프 W · 앉기 S · 막기=뒤로 · 펀치 I/O · 킥 K/L · 업어치기 J · 스킬 U · 필살 Y (↓→ 같은 커맨드도 됨)'; txt(hl, W / 2, 497, fitSize(hl, 13, 900), notice ? '#ffe57f' : '#ffd6df', null);   // 길면 글자를 줄여서 한 줄에
  txt(TOUCH ? '📱 버튼으로 조작 · 메뉴는 탭!' : 'W/S 메뉴 이동 · Enter 선택 · 숫자키 바로가기 · M 배경음', W / 2, 518, 12, '#80d8ff', null);
  txt(`🔊 ${musicMuted ? '꺼짐' : '켜짐'}`, W - 16, 20, 13, '#ccc', '#000', 3, 'right');
  addHot(W - 90, 6, 84, 28, () => { toggleMute(); });
  { const nd = !lsGet('sgf_tut_done', false); ctx.fillStyle = nd && gT % 40 < 20 ? 'rgba(255,145,0,0.85)' : 'rgba(255,255,255,0.15)'; rr(W - 112, TOUCH ? 36 : 66, 100, 26, 8); ctx.fill(); txt(nd ? '📖 튜토리얼!' : '📖 튜토리얼', W - 62, TOUCH ? 49 : 79, 13, '#fff', null); addHot(W - 112, TOUCH ? 36 : 66, 100, 26, () => startTutorial()); }   // 꿀선생 튜토리얼
  if (!TOUCH) { ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(W - 112, 36, 100, 26, 8); ctx.fill(); txt('⌨️ 키 설정', W - 62, 49, 13, '#fff', null); addHot(W - 112, 36, 100, 26, () => openKeys()); }   // 키 바꾸기
  if (toastT > 0) {
    ctx.globalAlpha = clamp(toastT / 20); ctx.fillStyle = 'rgba(0,0,0,0.85)'; rr(W / 2 - 230, 446, 460, 32, 10); ctx.fill();
    txt(toastMsg, W / 2, 462, 15, '#fff', null); ctx.globalAlpha = 1;
  }
}

// ================= ⌨️ 키 설정: 공격·이동 키를 마음대로 바꾸기 (1P 키보드) =================
const KEY_ACTS = [['left', '← 왼쪽 이동'], ['right', '→ 오른쪽 이동'], ['up', '↑ 점프'], ['down', '↓ 앉기'], ['lp', '👊 약펀치'], ['rp', '👊 강펀치'], ['lk', '🦵 약킥'], ['rk', '🦵 강킥'],
  ['grab', '🤼 업어치기'], ['skill', '✨ 스킬'], ['ultD', '💥 필살기']];
const KEY_DEF = { ...MAP1 };
Object.assign(MAP1, lsGet('sgf_keys', {}));
const keyName = c => !c ? '-' : c.replace(/^Key/, '').replace(/^Digit/, '').replace(/^Numpad/, '숫자패드 ').replace(/^Arrow/, '방향 ').replace('Left', '←').replace('Right', '→').replace('Up', '↑').replace('Down', '↓').replace('ShiftLeft', '왼 Shift').replace('Space', '스페이스');
const KS = { sel: 0, wait: false, back: 'title' };
function openKeys() { KS.sel = 0; KS.wait = false; KS.back = scene; scene = 'keys'; }
function updateKeys() {
  if (KS.wait) {
    const c = Object.keys(pressed).find(k => pressed[k] && !k.startsWith('Mouse'));
    if (!c) return;
    if (c === 'Escape') { KS.wait = false; SFX.block(); return; }
    const act = KEY_ACTS[KS.sel][0], old = MAP1[act], other = Object.keys(MAP1).find(k => k !== act && MAP1[k] === c);
    if (other) MAP1[other] = old;   // 이미 다른 동작에 쓰던 키면 서로 바꿈
    MAP1[act] = c; KS.wait = false; lsSet('sgf_keys', { ...MAP1 }); SFX.confirm();
    toast(other ? `${keyName(c)} 키를 서로 바꿨어요` : `${KEY_ACTS[KS.sel][1]} = ${keyName(c)}`);
    return;
  }
  const n = KEY_ACTS.length;
  if (pressed.ArrowUp) { KS.sel = (KS.sel + n - 1) % n; SFX.select(); }
  if (pressed.ArrowDown) { KS.sel = (KS.sel + 1) % n; SFX.select(); }
  if (pressed.Enter || pressed.Space) { KS.wait = true; SFX.select(); }
  if (pressed.Backspace || pressed.Delete) { Object.assign(MAP1, KEY_DEF); lsSet('sgf_keys', { ...MAP1 }); SFX.confirm(); toast('키를 처음대로 되돌렸어요'); }
  if (pressed.Escape) { scene = 'title'; SFX.select(); }
}
function drawKeys() {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#101828'); g.addColorStop(1, '#2a1030'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  txt('⌨️ 키 설정', W / 2, 32, 30, '#ffe082', '#000', 7);
  txt('바꿀 동작을 고르고 Enter → 쓰고 싶은 키를 누르세요 (Esc 취소)', W / 2, 66, 14, '#ccc', null);
  KEY_ACTS.forEach(([k, label], i) => {
    const col = i < 6 ? 0 : 1, row = i % 6, x = 120 + col * 380, y = 90 + row * 58, on = KS.sel === i;
    ctx.fillStyle = on ? (KS.wait ? 'rgba(255,82,82,0.6)' : 'rgba(255,145,0,0.5)') : 'rgba(255,255,255,0.08)'; rr(x, y, 340, 48, 10); ctx.fill();
    txt(label, x + 16, y + 24, 16, '#fff', null, 0, 'left');
    const kn = on && KS.wait ? (gT % 40 < 25 ? '키를 누르세요...' : '') : keyName(MAP1[k]);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(x + 190, y + 8, 138, 32, 8); ctx.fill();
    txt(kn, x + 259, y + 24, fitSize(kn, 16, 128), MAP1[k] !== KEY_DEF[k] ? '#69f0ae' : '#fff59d', null);
    addHot(x, y, 340, 48, () => { KS.sel = i; KS.wait = true; });
  });
  ctx.fillStyle = 'rgba(229,57,53,0.85)'; rr(W / 2 - 110, 418, 220, 36, 10); ctx.fill(); txt('↺ 키 설정 초기화', W / 2, 436, 16, '#fff', null);
  addHot(W / 2 - 110, 418, 220, 36, () => { if (!KS.wait) pressed.Backspace = true; });
  txt('↑↓ 고르기 · Enter 바꾸기 · Backspace 처음대로 · Esc 나가기', W / 2, 470, 13, '#80d8ff', null);
  txt('같은 키를 고르면 두 동작의 키가 서로 바뀌어요 · 2P(방향키·숫자패드)는 그대로', W / 2, 494, 12, '#aaa', null);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(14, 10, 100, 34, 8); ctx.fill(); txt('← 나가기', 64, 27, 14, '#fff', null);
  addHot(14, 10, 100, 34, () => { if (!KS.wait) pressed.Escape = true; });
}
