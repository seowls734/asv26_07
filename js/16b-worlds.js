// ================= 🌍 월드: 월드1(기본) · 🎄 크리스마스 월드 · 월드2 포장마차 · 월드3 주식 =================
// 크리스마스 월드는 해마다 12월 1~25일 자동으로 열림 (깨야 하는 월드 없음)
// 월드2는 월드1 클리어(사채 빚 다 갚기 엔딩), 월드3는 월드2 클리어가 있어야 열림
// 💎 다이아: 새 재화. 월드에서만 얻고, 월드 화면의 다이아 상점에서 씀
const diaGet = () => lsGet('sgf_dia', 0);
function addDia(n) { if (n) lsSet('sgf_dia', Math.max(0, diaGet() + n)); }
const W2_N = 5;
const w1Clear = () => endSeen.includes('ending');
const w2Stage = () => lsGet('sgf_w2', 0);
const w2Clear = () => w2Stage() >= W2_N;
const wTest = () => /worlds/.test(location.search) || (IS_TESTER && isMember());   // 테스트 계정은 월드 전부 열림
const wVal = v => typeof v === 'function' ? v() : v;

// ---- 🎄 크리스마스 퀘스트: 다 깨면 산타돈 + 눈꽃돈 둘 다 ----
QUESTS.push({ ch: '산타돈', icon: '🎄', key: 'sgf_q_xmas', unlockKey: 'sgf_xmas_got', also: ['산타돈', '눈꽃돈'], prize: '산타돈 · 눈꽃돈', msg: '🎄 산타돈과 눈꽃돈을 둘 다 받았어요! 캐릭터 선택에서 골라 보세요', open: () => xmasOpen(),
  steps: [{ id: 'gift', name: '크리스마스 월드에서 선물 100개 받기', goal: 100 }, { id: 'streak', name: '연승 모드에서 10연승 하기', goal: 10 }, { id: 'gold', name: '랭크전 골드 티어 찍기', goal: 1 }, { id: 'ultko', name: '필살기로 K.O. 10번', goal: 10 }] });
function xmasTick() { if (tierOf(tp) >= 3) nqAdd('gold', 1, true); }   // 골드 티어 이상이면 퀘스트 칸 채움

// ================= 월드 고르기 화면 =================
const WD = { sel: 0, shop: false, ssel: 0 };
const WORLDS = [
  { icon: '🐷', name: '월드1 · 기본 월드', desc: '랭크전·연승·장사로 사채 1억 갚기 (타이틀 메뉴가 곧 월드1)', lock: () => '', clear: w1Clear,
    go: () => { toTitle(); toast('🐷 월드1 · 사채 1억을 다 갚으면 클리어'); } },
  { icon: '🎄', name: '크리스마스 월드', desc: '🎁 선물 받기: 산타 썰매에서 떨어지는 선물을 받아요 (석탄은 피하기)', lock: () => xmasOpen() ? '' : '🔒 12월 1일 ~ 25일에만 열려요', clear: () => !!lsGet('sgf_xmas_got', false),
    go: () => startCatch() },
  { icon: '🏮', name: '월드2 · 포장마차 (대규모 업데이트)', desc: () => `🚶 로비: 🥊 사냥터·🎯 저격장 → 🔪 해체 → 🏮 납품 · 이야기 ${Math.min(w2Stage(), W2_N)}/${W2_N}장`, lock: () => w1Clear() ? '' : '🔒 월드1 클리어(사채 빚 다 갚기 엔딩)가 필요해요', clear: w2Clear,
    go: () => openLobby(2) },
  { icon: '📈', name: '월드3 · 증권가', desc: '월드1과 같은 게임 · 💵 돼지달러 따로 · 증권사 빚 10억 갚기 · 📈 주식', lock: () => w2Clear() ? '' : '🔒 월드2 클리어가 필요해요', clear: () => false,
    go: () => enterW3() }
];
const wLock = w => wTest() ? '' : w.lock();
function openWorlds() {
  scene = 'worlds'; WD.shop = false; mode = 1;
  if ((w1Clear() || wTest()) && !lsGet('sgf_w2seen', false)) { lsSet('sgf_w2seen', true); popup({ icon: '🏮', title: '대규모 업데이트 · 월드2 포장마차!', lines: ['🥊 싸우거나 🎯 총으로 사냥 → 🔪 해체해서 고기 모으기', '이야기 5장을 다 깨면 📈 월드3 주식 시장이 열려요'], big: true }); }
}
function worldGo(i) { const w = WORLDS[i], lk = wLock(w); WD.sel = i; if (lk) { SFX.block(); toast(lk); return; } SFX.confirm(); if (i !== 3) setWorld(1); w.go(); }   // 월드3 말고는 월드1 지갑으로
function updateWorlds() {
  if (WD.shop) return updateDiaShop();
  const n = WORLDS.length;
  if (pressed.KeyW || pressed.ArrowUp) { WD.sel = (WD.sel + n - 1) % n; SFX.select(); }
  if (pressed.KeyS || pressed.ArrowDown) { WD.sel = (WD.sel + 1) % n; SFX.select(); }
  for (let i = 0; i < n; i++) if (pressed['Digit' + (i + 1)] || pressed['Numpad' + (i + 1)]) return worldGo(i);
  if (pressed.Enter || pressed.Space || pressed.KeyI) worldGo(WD.sel);
  else if (pressed.KeyB) { WD.shop = true; WD.ssel = 0; SFX.select(); }
  else if (pressed.Escape) toTitle();
}
function wBack(fn) { ctx.fillStyle = 'rgba(0,0,0,0.55)'; rr(14, 10, 90, 30, 8); ctx.fill(); txt('← 나가기', 59, 25, 13, '#fff', null); addHot(14, 10, 90, 30, fn); }
function wDia() { txt(`💎 ${fmtN(diaGet())}  ·  🪙 ${fmtN(coins)}`, W - 20, 26, 16, '#b3e5fc', '#000', 4, 'right'); }
function drawWorlds() {
  if (WD.shop) return drawDiaShop();
  drawStage(); ctx.fillStyle = 'rgba(8,10,30,0.82)'; ctx.fillRect(0, 0, W, H);
  txt('🌍 월드', W / 2, 40, 34, '#fff', '#000', 7); wDia(); wBack(() => { pressed.Escape = true; });
  WORLDS.forEach((w, i) => {
    const y = 76 + i * 96, on = WD.sel === i, lk = wLock(w), cl = w.clear();
    ctx.fillStyle = lk ? 'rgba(40,40,50,0.85)' : on ? 'rgba(120,40,30,0.92)' : 'rgba(30,20,50,0.88)'; rr(110, y, 740, 84, 14); ctx.fill();
    ctx.strokeStyle = on ? '#ffd740' : 'rgba(255,255,255,0.18)'; ctx.lineWidth = on ? 4 : 2; rr(110, y, 740, 84, 14); ctx.stroke();
    txt(w.icon, 160, y + 42, 40, '#fff', null);
    txt(w.name, 210, y + 28, fitSize(w.name, 22, 480), lk ? '#9e9e9e' : '#fff', '#000', 4, 'left');
    const d = lk || wVal(w.desc); txt(d, 210, y + 60, fitSize(d, 14, 560), lk ? '#ff8a80' : '#ddd', null, 0, 'left');
    if (cl) txt('✅ 클리어', 830, y + 28, 15, '#69f0ae', '#000', 3, 'right');
    if ((i === 3 && WORLD === 3) || (i === 0 && WORLD === 1)) txt('📍 지금 여기', 830, y + 60, 14, '#ffd740', '#000', 3, 'right');
    addHot(110, y, 740, 84, () => worldGo(i));
  });
  ctx.fillStyle = '#1565c0'; rr(W / 2 - 120, 466, 240, 36, 10); ctx.fill(); txt('💎 다이아 상점 [B]', W / 2, 484, 16, '#fff', null);
  addHot(W / 2 - 120, 466, 240, 36, () => { WD.shop = true; WD.ssel = 0; SFX.select(); });
  txt('W/S 고르기 · Enter 들어가기 · Esc 타이틀', W / 2, 522, 12, '#90a4ae', null);
}

// ---- 💎 다이아 상점 (다이아로만 사는 아이템) ----
const DIA_SHOP = [
  ['💖 부활권', 3, 'revive', '졌을 때 이어하기 (연승·랭크전)'],
  ['💎 대형 부활권', 8, 'bigRevive', '이어하기 + 건 돈·티어 점수 안 잃음'],
  ['🔥 필살 게이지 100%', 5, 'fullMeter', '다음 판을 필살 게이지 가득 채우고 시작'],
  ['🍀 황금 행운 부적', 6, 'luckyCharm', '이기면 승리 코인 5배'],
  ['🛡️ 강철 체력', 2, 'hpup', '다음 판 체력 +15%']
];
function buyDia(i) {
  const [nm, c, k] = DIA_SHOP[i];
  if (diaGet() < c) { SFX.block(); toast(`💎 다이아가 부족해요 (${c}개 필요 · 월드에서 모아요)`); return; }
  addDia(-c); inv.use[k] = (inv.use[k] || 0) + 1; saveInv(); SFX.coin(); toast(`${nm} 구매! (가진 것 ${inv.use[k]}개)`);
}
function updateDiaShop() {
  const n = DIA_SHOP.length;
  if (pressed.KeyW || pressed.ArrowUp) { WD.ssel = (WD.ssel + n - 1) % n; SFX.select(); }
  if (pressed.KeyS || pressed.ArrowDown) { WD.ssel = (WD.ssel + 1) % n; SFX.select(); }
  if (pressed.Enter || pressed.Space || pressed.KeyI) buyDia(WD.ssel);
  else if (pressed.Escape || pressed.KeyB) { WD.shop = false; SFX.select(); }
}
function drawDiaShop() {
  drawStage(); ctx.fillStyle = 'rgba(5,15,40,0.88)'; ctx.fillRect(0, 0, W, H);
  txt('💎 다이아 상점', W / 2, 40, 32, '#b3e5fc', '#000', 7); wDia(); wBack(() => { pressed.Escape = true; });
  txt('다이아는 월드에서만 얻어요 (선물 10개마다 1개 · 포장마차 이야기 · 주식 대박)', W / 2, 74, 13, '#90caf9', null);
  DIA_SHOP.forEach(([nm, c, k, d], i) => {
    const y = 96 + i * 72, on = WD.ssel === i, can = diaGet() >= c;
    ctx.fillStyle = on ? 'rgba(21,101,192,0.9)' : 'rgba(20,30,60,0.88)'; rr(170, y, 620, 60, 12); ctx.fill();
    if (on) { ctx.strokeStyle = '#b3e5fc'; ctx.lineWidth = 3; rr(170, y, 620, 60, 12); ctx.stroke(); }
    txt(nm, 196, y + 22, 18, '#fff', '#000', 3, 'left'); txt(`${d} · 가진 것 ${inv.use[k] || 0}개`, 196, y + 45, 12, '#ccc', null, 0, 'left');
    txt(`💎 ${c}`, 770, y + 30, 20, can ? '#b3e5fc' : '#ff8a80', '#000', 4, 'right');
    addHot(170, y, 620, 60, () => { WD.ssel = i; buyDia(i); });
  });
  txt('W/S 고르기 · Enter 사기 · Esc 돌아가기', W / 2, 522, 12, '#90a4ae', null);
}

// ================= 🎁 선물 받기 (크리스마스 월드) =================
const MEAT3 = { sam: ['삼겹살', '#f48fb1'], mok: ['목살', '#c62828'], hang: ['항정살', '#ffcdd2'] };
const w2Need = s => ({ sam: 4 + s * 2, mok: 3 + s * 2, hang: 2 + s });   // 포장마차 N장 주문
const CATCH_Y = GROUND - 140;
let CG = null;
function startCatch() {
  CG = { kind: 'gift', t: 0, dur: 45 * 60, x: W / 2, vx: 0, face: 1, items: [], score: 0, stun: 0, ch: withCos(getChar(sel.c1)), done: false, endT: 0, win: false, res: [],
    snow: Array.from({ length: 70 }, () => [Math.random() * W, Math.random() * H, rand(0.6, 2.2)]) };
  parts = []; texts = [];
  mode = 7; scene = 'wplay'; SFX.confirm();
}
const sleighX = t => W / 2 + Math.sin(t * 0.013) * 380 + Math.sin(t * 0.031) * 60;
function catchSpawn() {
  const g = CG; if (g.t % Math.max(14, 26 - (g.t / 300 | 0)) !== 0) return;
  const r = Math.random(), k = r < 0.09 ? 'gold' : r < 0.27 ? 'coal' : 'gift';
  g.items.push({ k, x: sleighX(g.t), y: 96, vx: rand(-1.2, 1.2), vy: 1, rot: rand(-0.4, 0.4), c: ['#e53935', '#43a047', '#1e88e5', '#8e24aa'][Math.random() * 4 | 0] });
}
function catchGet(it) {
  const g = CG, px = g.x, py = CATCH_Y;
  if (it.k === 'coal') { g.stun = 36; g.score = Math.max(0, g.score - 2); SFX.thud(); popText(px, py - 40, '석탄! -2', '#9e9e9e', 26); burst(px, py, 12, ['#424242', '#757575', '#212121'], 6); return; }
  const v = it.k === 'gold' ? 3 : 1; g.score += v; SFX.coin();
  popText(px, py - 40, it.k === 'gold' ? '황금 선물! +3' : '+1', it.k === 'gold' ? '#ffd740' : '#fff', it.k === 'gold' ? 28 : 22);
  burst(px, py, 10, it.k === 'gold' ? ['#ffd740', '#fff59d'] : [it.c, '#fff59d', '#fff'], 6);
}
function catchFinish() {
  const g = CG; g.done = true; g.endT = 0; g.win = true;
  const n = g.score, d = Math.floor(n / 10), tot = lsGet('sgf_gifts', 0) + n, best = Math.max(lsGet('sgf_giftbest', 0), n);
  lsSet('sgf_gifts', tot); lsSet('sgf_giftbest', best); addDia(d); nqAdd('gift', n);
  const XQ = QUESTS.find(q => q.key === 'sgf_q_xmas');
  g.res = [`🎁 받은 선물 ${n}개 (최고 ${best}개)`, `💎 다이아 +${d}`, `크리스마스 퀘스트 선물: ${Math.min(100, qState(XQ).gift || 0)}/100`];
  SFX.gong();
}
function catchExit() { CG = null; mode = 1; openWorlds(); }
function updateCatch() {
  const g = CG; if (!g) return openWorlds();
  if (g.done) {
    g.endT++;
    if (g.endT > 30 && (pressed.Enter || pressed.Space || pressed.KeyI)) catchExit();
    else if (g.endT > 30 && pressed.KeyR) startCatch();
    else if (pressed.Escape) catchExit();
    return;
  }
  if (pressed.Escape) { catchExit(); toast('그만뒀어요 (보상 없음)'); return; }
  g.t++;
  const L = keys.KeyA || keys.ArrowLeft, R = keys.KeyD || keys.ArrowRight;
  if (g.stun > 0) { g.stun--; g.vx *= 0.8; }
  else { const want = (R ? 1 : 0) - (L ? 1 : 0); g.vx += (want * 9.5 - g.vx) * 0.35; if (want) g.face = want; }
  g.x = clamp(g.x + g.vx, 50, W - 50);
  catchSpawn();
  for (let i = g.items.length - 1; i >= 0; i--) {
    const it = g.items[i]; it.vy += 0.07; it.y += it.vy; it.x += it.vx; it.rot += it.vx * 0.02;
    if (Math.abs(it.x - g.x) < 66 && Math.abs(it.y - CATCH_Y) < 26) { g.items.splice(i, 1); catchGet(it); continue; }
    if (it.y > GROUND + 30) g.items.splice(i, 1);
  }
  for (const s of g.snow) { s[1] += s[2]; s[0] += Math.sin((gT + s[1]) * 0.01) * 0.3; if (s[1] > H) { s[1] = -5; s[0] = Math.random() * W; } }
  if (g.t >= g.dur) catchFinish();
}
function drawGiftItem(it) {
  ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot);
  if (it.k === 'coal') { ctx.fillStyle = '#212121'; ell(0, 0, 18, 14); ctx.fill(); ctx.fillStyle = '#616161'; ell(-5, -4, 5, 3); ctx.fill(); }
  else {
    const c = it.k === 'gold' ? '#ffc400' : it.c;
    if (it.k === 'gold') { ctx.shadowColor = '#ffd740'; ctx.shadowBlur = 18; }
    ctx.fillStyle = c; ctx.strokeStyle = '#000'; ctx.lineWidth = 2; rr(-17, -14, 34, 30, 4); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = it.k === 'gold' ? '#fff8e1' : '#ffd740'; ctx.fillRect(-4, -14, 8, 30); ctx.fillRect(-17, -2, 34, 7);
    ell(-7, -18, 7, 5, -0.4); ctx.fill(); ell(7, -18, 7, 5, 0.4); ctx.fill();
  }
  ctx.restore();
}
function drawMeatItem(it, x = it.x, y = it.y, rot = it.rot, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 2;
  if (it.k === 'sam') { for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#fff3e0' : '#f48fb1'; ctx.fillRect(-24, -12 + i * 5, 48, 5); } ctx.strokeRect(-24, -12, 48, 25); }
  else if (it.k === 'mok') { ctx.fillStyle = '#c62828'; rr(-22, -14, 44, 28, 10); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-16 + i * 12, -10); ctx.quadraticCurveTo(-10 + i * 12, 0, -16 + i * 12, 10); ctx.stroke(); } }
  else if (it.k === 'hang') { ctx.fillStyle = '#ffcdd2'; ell(0, 0, 24, 13); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { ell(-14 + i * 6, (i % 2 ? 4 : -4), 2, 1.5); ctx.fill(); } }
  else { ctx.fillStyle = '#3e2723'; rr(-22, -12, 44, 24, 6); ctx.fill(); ctx.fillStyle = '#000'; for (let i = 0; i < 4; i++) ctx.fillRect(-18 + i * 11, -10, 4, 20); ctx.fillStyle = 'rgba(160,160,160,0.5)'; ell(6, -22 - Math.sin(gT * 0.2) * 3, 8, 6); ctx.fill(); }
  ctx.restore();
}
function drawCatchBg() {
  const g = CG;
  if (g.kind === 'gift') {
    const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0b1636'); gr.addColorStop(1, '#283593'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff9c4'; ell(820, 90, 40, 40); ctx.fill();
    for (let i = 0; i < 9; i++) { const x = i * 120 + 20; ctx.fillStyle = '#1b5e20'; ctx.beginPath(); ctx.moveTo(x, GROUND - 10); ctx.lineTo(x + 40, GROUND - 120 - (i % 3) * 20); ctx.lineTo(x + 80, GROUND - 10); ctx.fill(); ctx.fillStyle = i % 2 ? '#ff5252' : '#ffd740'; ell(x + 40, GROUND - 60, 4, 4); ctx.fill(); }
    ctx.fillStyle = '#eceff1'; ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = '#fff'; for (const s of g.snow) { ell(s[0], s[1], s[2], s[2]); ctx.fill(); }
    const sx = sleighX(g.t);   // 산타 썰매
    ctx.save(); ctx.translate(sx, 70);
    for (let i = 0; i < 2; i++) { const rx = -112 + i * 44, lg = Math.sin(gT * 0.3 + i) * 3; ctx.fillStyle = '#8d6e63'; ell(rx, 6, 17, 8); ctx.fill(); ctx.fillRect(rx - 12 + lg, 10, 3, 13); ctx.fillRect(rx + 9 - lg, 10, 3, 13); ell(rx - 18, -4, 7, 6); ctx.fill(); ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(rx - 18, -9); ctx.lineTo(rx - 22, -20); ctx.moveTo(rx - 21, -16); ctx.lineTo(rx - 27, -18); ctx.moveTo(rx - 16, -9); ctx.lineTo(rx - 12, -19); ctx.stroke(); ctx.fillStyle = i ? '#3e2723' : '#ff1744'; ell(rx - 25, -3, 2.5, 2.5); ctx.fill(); }   /* 순록 (앞 순록 코가 빨강) */
    ctx.fillStyle = '#c62828'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2; rr(-36, -6, 70, 26, 8); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#ffd740'; ctx.beginPath(); ctx.moveTo(-40, 26); ctx.lineTo(42, 26); ctx.quadraticCurveTo(52, 26, 50, 14); ctx.stroke();
    ctx.fillStyle = '#d32f2f'; ell(0, -16, 14, 14); ctx.fill(); ctx.fillStyle = '#fff'; ell(0, -8, 10, 6); ctx.fill(); ctx.fillStyle = '#ffccbc'; ell(0, -20, 7, 6); ctx.fill();
    ctx.restore();
  } else {
    ctx.fillStyle = '#140b0d'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#e64a19'; ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(W, 60); ctx.lineTo(W - 40, 0); ctx.lineTo(40, 0); ctx.fill();
    for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? '#ff7043' : '#bf360c'; ctx.beginPath(); ctx.moveTo(i * 80, 60); ctx.quadraticCurveTo(i * 80 + 40, 90, i * 80 + 80, 60); ctx.fill(); }
    for (let i = 0; i < 16; i++) { const on = (gT / 20 + i) % 3 < 2; ctx.fillStyle = on ? '#ffd740' : '#8d6e63'; ell(30 + i * 60, 100 + Math.sin(i) * 6, 5, 5); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,152,0,0.12)'; ctx.fillRect(0, 60, W, GROUND - 60);
    txt('🏮 포 장 마 차', W / 2, 30, 26, '#fff3e0', '#5d1a00', 6);
    ctx.fillStyle = '#37474f'; ctx.fillRect(0, GROUND, W, H - GROUND); ctx.fillStyle = '#5d4037'; ctx.fillRect(0, GROUND, W, 8);
  }
}
function drawCatch() {
  const g = CG; if (!g) return;
  drawCatchBg();
  for (const it of g.items) drawGiftItem(it);
  const moving = Math.abs(g.vx) > 1;
  drawPig(g.x, GROUND, g.face, g.ch.look, { t: gT, scale: g.ch.scale * 0.9, hurt: g.stun > 0, victory: g.done, move: moving && !g.done ? 'walk' : undefined, k: (gT % 30) / 30 });
  ctx.save(); ctx.translate(g.x, CATCH_Y + 14);   // 선물 자루
  ctx.fillStyle = '#6d4c41'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-58, -6); ctx.quadraticCurveTo(0, 34, 58, -6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#a1887f'; ctx.fillRect(-58, -10, 116, 6);
  ctx.restore();
  drawParts();
  const left = Math.max(0, g.dur - g.t) / 60;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; rr(W / 2 - 160, 112, 320, 14, 7); ctx.fill(); ctx.fillStyle = left < 10 ? '#ff5252' : '#69f0ae'; rr(W / 2 - 158, 114, 316 * (left * 60 / g.dur), 10, 5); ctx.fill();
  txt(`⏰ ${Math.ceil(left)}초`, W / 2, 140, 16, '#fff', '#000', 4);
  txt(`🎁 ${g.score}`, 24, 150, 30, '#ffd740', '#000', 6, 'left');
  wBack(() => { pressed.Escape = true; });
  if (!g.done && g.t < 120) txt(TOUCH ? '조이스틱으로 좌우 이동' : 'A/D 또는 ←→ 로 움직여서 받기', W / 2, 240, 20, '#fff', '#000', 5);
  if (g.done) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; rr(W / 2 - 260, 170, 520, 200, 18); ctx.fill();
    txt('🎄 선물 받기 끝!', W / 2, 210, 32, '#ffd740', '#000', 6);
    g.res.forEach((l, i) => txt(l, W / 2, 256 + i * 30, fitSize(l, 18, 480), '#fff', null));
    if (g.endT > 30) { txt('Enter: 월드로 · R: 다시 하기', W / 2, 352, 13, '#bbb', null); addHot(W / 2 - 260, 170, 520, 200, () => { pressed.Enter = true; }); }
  }
}

// ================= 🏮 월드2 이야기 =================
const W2_STORY = [
  [['내레이션', '사채를 다 갚은 돼지. 하지만 통장엔 동전 몇 개뿐이다...'], ['포장마차 할머니', '"이 포차 네가 맡아 볼래? 고기는 네가 직접 구해 와야 한단다."'], ['포장마차 할머니', '"사냥터에서 싸우거나 저격장에서 총으로 잡아서, 해체해 오렴."'], ['내레이션', '1장 · 첫 장사 준비: 삼겹살·목살·항정살을 모아 납품하자!']],
  [['손님', '"사장님! 삼겹살 2인분이요! 목살도 주세요!"'], ['내레이션', '2장 · 첫 손님들: 손님이 늘었다. 고기가 모자라!']],
  [['옆집 고깃집 사장', '"흥, 포차 주제에. 사냥터 멧돼지들을 세게 풀어 놨지!"'], ['내레이션', '3장 · 방해 공작: 사냥터 돼지들이 더 강해졌다!']],
  [['손님들', '"여기 포차 항정살이 기가 막힌대!"'], ['내레이션', '4장 · 긴 줄: 주문이 더 많아졌다!']],
  [['포장마차 할머니', '"오늘은 동네 포차 축제란다. 최고의 고기를 모아 보렴."'], ['내레이션', '5장 · 포차 축제의 밤: 마지막 주문을 채워라!']]
];
const W2_END = [['내레이션', '포장마차가 동네 명물이 됐다!'], ['포장마차 할머니', '"이제 너는 진짜 고기 장인이야. 번 돈으로... 주식이라도 해 볼래?"'], ['내레이션', '🏮 월드2 클리어! 📈 월드3 주식 시장이 열렸어요']];
let WS = null;
function updateWStory() {
  if (!WS) return openWorlds();
  if (pressed.Enter || pressed.Space || pressed.KeyI) { SFX.select(); if (++WS.i >= WS.lines.length) WS.next(); }
  else if (pressed.Escape) WS.next();
}
function drawStallBg() {
  ctx.fillStyle = '#140b0d'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#e64a19'; ctx.fillRect(200, 120, 560, 40); ctx.fillStyle = '#4e342e'; ctx.fillRect(220, 160, 520, 200); ctx.fillStyle = '#ffb74d'; ctx.fillRect(250, 190, 460, 110);
  for (let i = 0; i < 9; i++) { ctx.fillStyle = (gT / 15 + i) % 2 < 1 ? '#ffd740' : '#ff7043'; ell(220 + i * 65, 120, 6, 6); ctx.fill(); }
  txt('🏮 포 장 마 차', W / 2, 140, 22, '#fff3e0', '#5d1a00', 5);
}
function drawWStory() {
  if (!WS) return;
  drawStallBg();
  drawMeatItem({ k: 'sam' }, 330, 245, 0.1, 1.2); drawMeatItem({ k: 'mok' }, 480, 250, -0.1, 1.2); drawMeatItem({ k: 'hang' }, 630, 245, 0.05, 1.2);
  drawPig(150, 372, 1, withCos(getChar(sel.c1)).look, { t: gT, scale: 0.62 });
  const [sp, tx] = WS.lines[Math.min(WS.i, WS.lines.length - 1)];
  ctx.fillStyle = 'rgba(0,0,0,0.8)'; rr(60, 380, 840, 120, 14); ctx.fill(); ctx.strokeStyle = '#ff7043'; ctx.lineWidth = 3; rr(60, 380, 840, 120, 14); ctx.stroke();
  txt(sp, 84, 404, 16, '#ffab91', null, 0, 'left'); txt(tx, W / 2, 448, fitSize(tx, 20, 800), '#fff', null);
  txt(`${WS.i + 1}/${WS.lines.length} · Enter 다음 · Esc 건너뛰기`, W / 2, 488, 12, '#999', null);
  addHot(0, 0, W, H, () => { pressed.Enter = true; });
}

// ================= 🚶 로비 (월드2 포장마차 거리): 걸어 다니다 건물에 들어감 =================
const w2Meat = () => ({ sam: 0, mok: 0, hang: 0, ...lsGet('sgf_w2meat', {}) });
function addMeat(k, n) { const m = w2Meat(); m[k] = Math.max(0, m[k] + n); lsSet('sgf_w2meat', m); }
const LOBBY = {
  2: { name: '🏮 월드2 · 포장마차 거리', sky: ['#1a0f1f', '#4a1c2c'], spots: [
    { x: 100, icon: '🚪', name: '월드로', col: '#546e7a', go: () => openWorlds() },
    { x: 330, icon: '🥊', name: '사냥터 (싸우기)', col: '#c62828', go: () => worldFight(2) },
    { x: 580, icon: '🎯', name: '저격장 (총 사냥)', col: '#2e7d32', go: () => startSnipe() },
    { x: 830, icon: '🏮', name: '포장마차', col: '#e65100', go: () => openStall() }] }
};
const LB = { w: 2, x: 200, vx: 0, face: 1, near: -1 };
function openLobby(w, keepX) {
  if (LB.w !== w || !keepX) { LB.x = 200; LB.vx = 0; LB.face = 1; }
  LB.w = w; mode = 7; scene = 'lobby'; parts = []; texts = [];
  if (w === 2 && !lsGet('sgf_w2tip', false)) { lsSet('sgf_w2tip', true); popup({ icon: '🏮', title: '포장마차 거리', lines: ['🥊 사냥터에서 싸우거나 🎯 저격장에서 총으로 사냥', '🔪 이기면 해체해서 삼겹살·목살·항정살을 얻어요', '🏮 포장마차에 납품하면 이야기가 이어져요'] }); }
}
const lobbyBack = () => openLobby(LB.w, true);
function lobbyEnter(i) { const s = LOBBY[LB.w].spots[i]; LB.x = s.x; SFX.confirm(); s.go(); }
function updateLobby() {
  const L = LOBBY[LB.w], left = keys.KeyA || keys.ArrowLeft, right = keys.KeyD || keys.ArrowRight, want = (right ? 1 : 0) - (left ? 1 : 0);
  LB.vx += (want * 6 - LB.vx) * 0.3; if (want) LB.face = want; LB.x = clamp(LB.x + LB.vx, 50, W - 50);
  LB.near = L.spots.findIndex(s => Math.abs(s.x - LB.x) < 75);
  if (LB.near >= 0 && (pressed.Enter || pressed.Space || pressed.KeyI || pressed.KeyW || pressed.ArrowUp)) return lobbyEnter(LB.near);
  if (pressed.Escape) openWorlds();
}
function drawLobby() {
  const L = LOBBY[LB.w], gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, L.sky[0]); gr.addColorStop(1, L.sky[1]); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  { for (let i = 0; i < 16; i++) { const on = (gT / 20 + i) % 3 < 2; ctx.fillStyle = on ? '#ffd740' : '#8d6e63'; ell(30 + i * 60, 96 + Math.sin(i) * 6, 5, 5); ctx.fill(); } ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 92); for (let i = 0; i <= 16; i++) ctx.lineTo(30 + i * 60, 96 + Math.sin(i) * 6); ctx.stroke(); }
  ctx.fillStyle = '#3e2723'; ctx.fillRect(0, GROUND, W, H - GROUND); ctx.fillStyle = 'rgba(255,255,255,0.08)'; for (let x = 0; x < W; x += 60) ctx.fillRect(x, GROUND + 30, 30, 4);
  L.spots.forEach((s, i) => {   // 건물
    const on = LB.near === i, bw = 170, bx = s.x - bw / 2, by = GROUND - 190;
    ctx.fillStyle = s.col; rr(bx, by, bw, 190, 10); ctx.fill(); ctx.strokeStyle = on ? '#ffd740' : '#000'; ctx.lineWidth = on ? 5 : 2; rr(bx, by, bw, 190, 10); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; rr(s.x - 34, GROUND - 84, 68, 84, 8); ctx.fill();   // 문
    txt(s.icon, s.x, by + 46, 40, '#fff', null); txt(s.name, s.x, by + 96, fitSize(s.name, 17, 158), '#fff', '#000', 4);
    addHot(bx, by, bw, 190, () => lobbyEnter(i));
  });
  const C = withCos(getChar(sel.c1));
  drawPig(LB.x, GROUND + 40, LB.face, C.look, { t: gT, scale: C.scale * 0.7, move: Math.abs(LB.vx) > 1 ? 'walk' : undefined, k: (gT % 30) / 30 });
  if (LB.near >= 0) txt(`▲ ${LOBBY[LB.w].spots[LB.near].name} 들어가기 (${TOUCH ? '건물 누르기' : 'W / Enter'})`, LB.x, GROUND - 210, 15, '#ffd740', '#000', 4);
  txt(L.name, W / 2, 34, 26, '#fff', '#000', 6); wDia(); wBack(() => { pressed.Escape = true; });
  if (LB.w === 2) {
    const m = w2Meat(), s = w2Stage(), hud = `🥓 삼겹살 ${m.sam} · 목살 ${m.mok} · 항정살 ${m.hang}  ·  📖 이야기 ${Math.min(s, W2_N)}/${W2_N}장`;
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; rr(W / 2 - 300, 116, 600, 32, 10); ctx.fill(); txt(hud, W / 2, 132, fitSize(hud, 15, 580), '#ffe0b2', null);
  }
  txt(TOUCH ? '조이스틱으로 걷기 · 건물을 누르면 들어가요' : 'A/D 걷기 · W/Enter 들어가기 · Esc 월드', W / 2, 526, 12, '#bbb', null);
}

// ---- 🥊 월드2 사냥터 싸움: 진짜 싸움 엔진 (mode 8) ----
const W2_FOES = ['분홍이', '깜돌이', '멧돌이', '꼬미', '얼음이', '족발왕', '오겹장군', '양념이', '항정', '목살', '갈비', '감자탕', '냉삼'];
let WF = { w: 2 };
function worldFight(w) {
  const pool = CHARS.filter(c => W2_FOES.includes(c.name));
  WF = { w }; mode = 8; ranked = false;
  p1.setChar(withCos(getChar(sel.c1))); p2.setChar(pool[Math.random() * pool.length | 0]); startMatch();
  p2.cpuLv = 1 + w2Stage() * 2; p1.reset(); p2.reset();
  p1.name = playerName; p2.name = '야생 ' + p2.base;
}
function worldFightEnd(win) {   // 싸움이 끝나면 (afterRound에서 부름)
  sizzleOff(); const foe = p2;
  if (win) return startButcher({ bonus: 1, look: foe.C, name: foe.base, how: '🥊 사냥 성공! (싸움 보너스: 부위마다 +1)', again: () => worldFight(2) });
  openLobby(2, true); toast('😵 사냥 실패... 다시 도전!');
}
function worldFightQuit() { sizzleOff(); openLobby(WF.w, true); toast('싸움을 그만뒀어요'); }

// ---- 🎯 저격장: 총으로 멀리 있는 돼지 사냥 ----
let SN = null;
function startSnipe() {
  const pool = CHARS.filter(c => W2_FOES.includes(c.name));
  SN = { t: 0, dur: 30 * 60, cx: W / 2, cy: 300, ammo: 3, hit: null, done: false, endT: 0,
    tg: [0, 1, 2].map(i => ({ ch: pool[Math.random() * pool.length | 0], x: rand(140, W - 140), y: 300 + i * 50, vx: rand(0.8, 1.6) * (Math.random() < 0.5 ? -1 : 1), s: 0.3 + i * 0.07, stopT: 0, dead: false })) };
  parts = []; texts = []; mode = 7; scene = 'snipe';
}
const snAim = () => [SN.cx + Math.sin(SN.t * 0.05) * 7, SN.cy + Math.cos(SN.t * 0.07) * 5];   // 조준이 살짝 흔들림
function snipeFire() {
  if (!SN || SN.done || SN.ammo <= 0) return;
  const [ax, ay] = snAim(); SN.ammo--; SFX.boom(); shake = Math.max(shake, 6); burst(ax, ay, 8, ['#fff59d', '#fff'], 5);
  const tg = [...SN.tg].sort((a, b) => b.y - a.y).find(t => !t.dead && Math.abs(ax - t.x) < 66 * t.s / 0.3 * 0.3 + 26 && ay > t.y - 150 * t.s && ay < t.y + 6);
  if (tg) {
    const f = Math.sign(tg.vx) || 1, head = Math.hypot(ax - (tg.x + f * 52 * tg.s), ay - (tg.y - 100 * tg.s)) < 34 * tg.s + 8;
    tg.dead = true; SN.hit = { tg, head }; SN.done = true; SN.endT = 0; burst(ax, ay, 16, ['#ff5252', '#ff8a80', '#fff'], 7);
    popText(ax, ay - 30, head ? '🎯 헤드샷!!' : '명중!', head ? '#ffd740' : '#fff', head ? 34 : 28);
  } else {
    popText(ax, ay - 30, '빗나감!', '#ff8a80', 24); for (const t of SN.tg) { t.vx = (Math.sign(t.vx) || 1) * Math.min(4.5, Math.abs(t.vx) * 1.7); t.stopT = 0; }   // 놀라서 도망
    if (SN.ammo <= 0) { SN.done = true; SN.endT = 0; }
  }
}
function updateSnipe() {
  const s = SN; if (!s) return lobbyBack();
 
  if (s.done) {
    s.endT++;
    if (s.hit && s.endT > 70) { const { tg, head } = s.hit; SN = null; return startButcher({ again: () => startSnipe(), bonus: head ? 1 : 0, look: tg.ch.look, name: tg.ch.name, how: head ? '🎯 헤드샷! (부위마다 +1)' : '🎯 저격 성공!' }); }
    if (!s.hit && s.endT > 30 && (pressed.Enter || pressed.Space)) return startSnipe();   // 바로 다시 (안 끊기게)
    if (!s.hit && s.endT > 30 && pressed.Escape) { SN = null; lobbyBack(); }
    return;
  }
  if (pressed.Escape) { SN = null; lobbyBack(); return; }
  s.t++;
  const sp = 7, dx = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0), dy = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0);
  s.cx = clamp(s.cx + dx * sp, 20, W - 20); s.cy = clamp(s.cy + dy * sp, 160, H - 40);
  for (const t of s.tg) {
    if (t.dead) continue;
    if (t.stopT > 0) t.stopT--; else { t.x += t.vx; if (Math.random() < 0.006) t.stopT = rand(40, 90); }
    if (t.x < 80 || t.x > W - 80) { t.vx = -t.vx; t.x = clamp(t.x, 80, W - 80); }
  }
  if (pressed.Space || pressed.Enter || pressed.KeyI || pressed.KeyJ) snipeFire();
  if (s.t >= s.dur && !s.done) { s.done = true; s.endT = 0; popText(W / 2, 260, '⏰ 시간 끝!', '#ff8a80', 32); }
}
function drawSnipe() {
  const s = SN; if (!s) return;
  const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#81d4fa'); gr.addColorStop(0.45, '#e1f5fe'); gr.addColorStop(0.46, '#7cb342'); gr.addColorStop(1, '#33691e'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#558b2f'; for (let i = 0; i < 7; i++) { ell(i * 160 + 40, 250, 120, 40); ctx.fill(); }
  ctx.fillStyle = '#2e7d32'; for (let i = 0; i < 14; i++) { const x = i * 72 + 20; ctx.beginPath(); ctx.moveTo(x, 248); ctx.lineTo(x + 18, 190 - (i % 3) * 14); ctx.lineTo(x + 36, 248); ctx.fill(); }
  for (const t of [...s.tg].sort((a, b) => a.y - b.y)) {
    const f = Math.sign(t.vx) || 1;
    if (t.dead) { ctx.save(); ctx.translate(t.x, t.y); ctx.rotate(f * Math.min(1.5, s.endT * 0.08)); drawPig(0, 0, f, t.ch.look, { t: gT, scale: t.s, hurt: true }); ctx.restore(); }
    else drawPig(t.x, t.y, f, t.ch.look, { t: gT, scale: t.s, move: t.stopT > 0 ? undefined : 'walk', k: (gT % 30) / 30 });
  }
  drawParts();
  const [ax, ay] = snAim(), R = 110;   // 스코프
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.82)'; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(ax, ay, R, 0, Math.PI * 2, true); ctx.fill();
  ctx.strokeStyle = '#000'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(ax, ay, R, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax - R, ay); ctx.lineTo(ax - 10, ay); ctx.moveTo(ax + 10, ay); ctx.lineTo(ax + R, ay); ctx.moveTo(ax, ay - R); ctx.lineTo(ax, ay - 10); ctx.moveTo(ax, ay + 10); ctx.lineTo(ax, ay + R); ctx.stroke();
  ctx.fillStyle = '#ff1744'; ell(ax, ay, 3, 3); ctx.fill(); ctx.restore();
  txt('🎯 저격장', W / 2, 30, 24, '#fff', '#000', 5); wBack(() => { pressed.Escape = true; });
  txt('🔫'.repeat(s.ammo) + '▫️'.repeat(3 - s.ammo), 24, 64, 22, '#fff', null, 0, 'left');
  txt(`⏰ ${Math.ceil(Math.max(0, s.dur - s.t) / 60)}초`, W - 24, 64, 18, '#fff', '#000', 4, 'right');
  if (!s.done && s.t < 150) txt(TOUCH ? '손가락으로 끌어서 조준 · 떼면 발사 · 3발 · 머리를 맞히면 헤드샷' : '마우스로 조준 · 클릭 발사 (WASD/화살표 + Space도 돼요) · 3발 · 헤드샷', W / 2, 500, 15, '#fff', '#000', 4);
  if (s.done && !s.hit) { ctx.fillStyle = 'rgba(0,0,0,0.7)'; rr(W / 2 - 200, 220, 400, 100, 16); ctx.fill(); txt('😢 사냥 실패...', W / 2, 256, 28, '#ff8a80', '#000', 5); if (s.endT > 30) txt('Enter: 다시 사냥 · Esc: 로비로', W / 2, 294, 14, '#bbb', null); }
  if (s.done && !s.hit && s.endT > 30) addHot(0, 0, W, H, () => { pressed.Enter = true; });
}

// ---- 🔪 해체: 칼이 지나갈 때 맞춰 눌러 부위별로 자르기 (목살 → 항정살 → 삼겹살) ----
const BCUTS = [['mok', '목살'], ['hang', '항정살'], ['sam', '삼겹살']];
let BT = null;
function startButcher(o) { BT = { again: o.again, i: 0, t: 0, pos: 0, dir: 1, zone: rand(0.3, 0.7), res: [], bonus: o.bonus || 0, look: o.look, name: o.name, how: o.how || '', done: false, endT: 0 }; parts = []; texts = []; mode = 7; scene = 'butcher'; }
function butcherCut() {
  const b = BT; if (!b || b.done) return;
  const d = Math.abs(b.pos - b.zone), [lab, n] = d < 0.05 ? ['완벽!', 3] : d < 0.13 ? ['좋음', 2] : ['아쉬움', 1], [k, nm] = BCUTS[b.i], amt = n + b.bonus;
  b.res.push([k, nm, amt, lab]); addMeat(k, amt); SFX.chop(); shake = Math.max(shake, 4);
  burst(W / 2, 250, 12, [MEAT3[k][1], '#fff'], 6); popText(W / 2, 200, `${nm} +${amt} (${lab})`, lab === '완벽!' ? '#ffd740' : '#fff', 28);
  if (++b.i >= BCUTS.length) { b.done = true; b.endT = 0; } else { b.zone = rand(0.25, 0.75); b.pos = 0; b.dir = 1; }
}
function updateButcher() {
  const b = BT; if (!b) return lobbyBack();
  b.t++;
  if (b.done) { b.endT++; if (b.endT > 30 && (pressed.Enter || pressed.Space || pressed.KeyI) && b.again) { BT = null; return b.again(); } if (b.endT > 30 && (pressed.Escape || ((pressed.Enter || pressed.Space || pressed.KeyI) && !b.again))) { BT = null; lobbyBack(); } return; }
  b.pos += b.dir * (0.013 + b.i * 0.004); if (b.pos > 1) { b.pos = 1; b.dir = -1; } if (b.pos < 0) { b.pos = 0; b.dir = 1; }
  if (pressed.Space || pressed.Enter || pressed.KeyI || pressed.KeyJ) butcherCut();
}
function drawButcher() {
  const b = BT; if (!b) return;
  ctx.fillStyle = '#3e2723'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#a1887f'; rr(130, 110, 700, 290, 24); ctx.fill(); ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 6; rr(130, 110, 700, 290, 24); ctx.stroke();   // 도마
  ctx.strokeStyle = 'rgba(93,64,55,0.4)'; ctx.lineWidth = 2; for (let y = 140; y < 390; y += 26) { ctx.beginPath(); ctx.moveTo(150, y); ctx.quadraticCurveTo(480, y + 8, 810, y); ctx.stroke(); }
  const cx = W / 2 + 40, cy = 255, cur = b.done ? -1 : b.i;   // 부위도 (돼지 몸 모양)
  ctx.fillStyle = '#f8bbd0'; ctx.strokeStyle = '#ad1457'; ctx.lineWidth = 3;
  ell(cx, cy, 230, 95); ctx.fill(); ctx.stroke(); ell(cx - 250, cy - 20, 70, 62); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f48fb1'; ell(cx - 305, cy - 12, 22, 18); ctx.fill(); ctx.stroke();
  const zones = { mok: [cx - 170, cy - 60, 110, 60], hang: [cx - 230, cy + 20, 100, 50], sam: [cx - 40, cy + 10, 230, 70] };
  for (const [k, nm] of BCUTS) {
    const [x, y, w, h] = zones[k], on = BCUTS[cur] && BCUTS[cur][0] === k, did = b.res.find(r => r[0] === k);
    ctx.fillStyle = did ? 'rgba(76,175,80,0.45)' : on ? `rgba(255,215,64,${0.35 + Math.sin(gT * 0.2) * 0.15})` : 'rgba(255,255,255,0.2)';
    rr(x, y, w, h, 12); ctx.fill(); ctx.setLineDash([8, 6]); ctx.strokeStyle = on ? '#ffd740' : '#880e4f'; ctx.lineWidth = on ? 4 : 2; rr(x, y, w, h, 12); ctx.stroke(); ctx.setLineDash([]);
    txt(did ? `${nm} ✔` : nm, x + w / 2, y + h / 2, 17, '#fff', '#4a0d25', 4);
  }
  drawPig(80, 470, 1, b.look, { t: gT, scale: 0.4, hurt: true }); txt(`오늘의 사냥: ${b.name}`, 130, 470, 13, '#ffe0b2', null, 0, 'left');
  txt('🔪 해체하기', W / 2, 40, 28, '#fff', '#000', 6); if (b.how) txt(b.how, W / 2, 78, 15, '#ffd740', '#000', 4);
  const bx = 230, bw = 500, by = 430;   // 타이밍 막대
  ctx.fillStyle = '#212121'; rr(bx, by, bw, 26, 13); ctx.fill();
  if (!b.done) {
    ctx.fillStyle = '#43a047'; ctx.fillRect(bx + bw * (b.zone - 0.13), by + 3, bw * 0.26, 20); ctx.fillStyle = '#ffd740'; ctx.fillRect(bx + bw * (b.zone - 0.05), by + 3, bw * 0.1, 20);
    txt('🔪', bx + bw * b.pos, by + 10, 30, '#fff', null);
    const tip = `${BCUTS[b.i][1]} 자르기: 칼이 노란 칸에 오면 ${TOUCH ? '화면을 누르기' : 'Space'}!`; txt(tip, W / 2, 500, fitSize(tip, 16, 700), '#fff', '#000', 4);
    addHot(0, 100, W, H - 100, () => butcherCut());
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; rr(W / 2 - 240, 150, 480, 200, 16); ctx.fill();
    txt('🥩 해체 끝!', W / 2, 186, 28, '#ffd740', '#000', 5);
    b.res.forEach(([k, nm, amt, lab], i) => txt(`${nm} +${amt}  (${lab})`, W / 2, 228 + i * 30, 18, MEAT3[k][1] === '#c62828' ? '#ff8a80' : MEAT3[k][1], '#000', 3));
    if (b.endT > 30) { txt(b.again ? 'Enter: 바로 다음 사냥 · Esc: 로비로' : 'Enter: 로비로', W / 2, 332, 13, '#bbb', null); addHot(0, 0, W, H, () => { pressed.Enter = true; }); }
  }
}

// ---- 🏮 포장마차: 이야기 보기 · 주문 납품 (월드2 클리어 뒤엔 고기 팔기) ----
function openStall() {
  const s = w2Stage();
  if (s < W2_N && lsGet('sgf_w2story', -1) < s) { lsSet('sgf_w2story', s); WS = { lines: W2_STORY[s], i: 0, next: () => { scene = 'stall'; } }; scene = 'wstory'; return; }
  mode = 7; scene = 'stall';
}
function stallAct() {
  const s = w2Stage(), m = w2Meat();
  if (s < W2_N) {
    const need = w2Need(s);
    if (!Object.keys(need).every(k => m[k] >= need[k])) { SFX.block(); toast('🥩 고기가 모자라요! 사냥터·저격장에서 사냥하고 해체해서 모아요'); return; }
    for (const k in need) m[k] -= need[k]; lsSet('sgf_w2meat', m);
    const d = 3 + s, c = Math.round(2000 * (s + 1) * EARN); lsSet('sgf_w2', s + 1); addDia(d); addCoins(c); SFX.gong();
    popup({ icon: '🏮', title: `${s + 1}장 클리어!`, lines: ['주문한 고기를 다 납품했어요', `💎 다이아 +${d} · 🪙 +${fmtN(c)}`] });
    if (s + 1 >= W2_N) { WS = { lines: W2_END, i: 0, next: () => { openWorlds(); popup({ icon: '📈', title: '월드2 클리어!', lines: ['📈 월드3 주식 시장이 열렸어요'], big: true }); } }; scene = 'wstory'; }
    else openStall();
    return;
  }
  const v = Math.round((m.sam * 300 + m.mok * 250 + m.hang * 400) * EARN);
  if (!v) { SFX.block(); toast('팔 고기가 없어요'); return; }
  addCoins(v); lsSet('sgf_w2meat', { sam: 0, mok: 0, hang: 0 }); SFX.coin(); toast(`🏮 고기를 전부 팔았어요! +${fmtN(v)} 코인`);
}
function updateStall() {
  if (pressed.Enter || pressed.Space || pressed.KeyI) stallAct();
  else if (pressed.Escape) lobbyBack();
}
function drawStall() {
  drawStallBg();
  const s = w2Stage(), m = w2Meat(), done = s >= W2_N;
  ctx.fillStyle = 'rgba(0,0,0,0.78)'; rr(180, 196, 600, 250, 16); ctx.fill(); ctx.strokeStyle = '#ff7043'; ctx.lineWidth = 3; rr(180, 196, 600, 250, 16); ctx.stroke();
  txt(done ? '🏮 월드2 클리어! 남은 고기는 팔 수 있어요' : `📖 ${s + 1}장 주문`, W / 2, 226, 22, '#ffe0b2', '#000', 4);
  const need = done ? null : w2Need(s);
  Object.keys(MEAT3).forEach((k, i) => {
    const y = 270 + i * 44, ok = !need || m[k] >= need[k];
    drawMeatItem({ k }, 270, y, 0, 0.9);
    txt(need ? `${MEAT3[k][0]}  ${m[k]} / ${need[k]}${ok ? ' ✅' : ''}` : `${MEAT3[k][0]}  ${m[k]}개`, 320, y, 19, ok ? '#69f0ae' : '#fff', '#000', 3, 'left');
  });
  const can = done ? m.sam + m.mok + m.hang > 0 : Object.keys(need).every(k => m[k] >= need[k]);
  ctx.fillStyle = can ? '#2e7d32' : '#616161'; rr(W / 2 - 140, 456, 280, 42, 10); ctx.fill();
  txt(done ? '🪙 고기 전부 팔기 (Enter)' : '📦 납품하기 (Enter)', W / 2, 477, 17, '#fff', null); addHot(W / 2 - 140, 456, 280, 42, () => stallAct());
  if (!done && !can) txt('부족한 고기는 🥊 사냥터나 🎯 저격장에서 구해 와요', W / 2, 516, 13, '#ffab91', null);
  wDia(); wBack(() => { pressed.Escape = true; });
}

// ================= 📈 월드3: 주식 시장 =================
// 한 번 투자할 때: 1% 대박 · 10% 오르기 · 20% 애매 · 29% 떨어지기 · 나머지 40% 상장폐지(전부 잃음)
const STOCKS = [['🐷', '돼지코인 (재상장)', '#ff80ab'], ['🥓', '삼겹전자', '#ff7043'], ['🏮', '포차홀딩스', '#ffa000'], ['🍯', '꿀꿀식품', '#ffd740']];
const ST_PCT = [0.1, 0.25, 0.5, 1];
const SK = { sel: 0, amt: 0, phase: 'pick', t: 0, stake: 0, res: null, path: [] };
function stockRoll(r = Math.random()) {
  if (r < 0.01) return { k: 'jackpot', m: rand(8, 12), name: '🚀 대박!!', col: '#ffd740' };
  if (r < 0.11) return { k: 'up', m: rand(1.4, 2), name: '📈 올랐다!', col: '#69f0ae' };
  if (r < 0.31) return { k: 'meh', m: rand(0.9, 1.1), name: '😐 애매...', col: '#fff' };
  if (r < 0.60) return { k: 'down', m: rand(0.3, 0.7), name: '📉 떨어졌다...', col: '#ff8a80' };
  return { k: 'delist', m: 0, name: '💀 상장폐지', col: '#ff1744' };
}
function openStock() { SK.phase = 'pick'; SK.t = 0; SK.res = null; mode = 7; scene = 'stock'; }
function stockBuy() {
  const stake = Math.floor(coins * ST_PCT[SK.amt]);
  if (stake < 1) { SFX.block(); toast('💸 투자할 코인이 없어요'); return; }
  addCoins(-stake); SK.stake = stake; SK.res = stockRoll(); SK.phase = 'run'; SK.t = 0; SFX.stamp();
  const N = 60, m = SK.res.m, P = [];   // 결과 쪽으로 흔들리며 가는 주가 그래프
  for (let i = 0; i <= N; i++) { const k = i / N; let v = SK.res.k === 'delist' ? (i < N - 8 ? 1 + Math.sin(i * 0.7) * 0.15 - k * 0.3 : Math.max(0, 0.7 * (N - i) / 8)) : 1 + (m - 1) * Math.pow(k, 1.6); if (i > 0 && i < N && SK.res.k !== 'delist') v *= 1 + rand(-0.12, 0.12); P.push(v); }
  SK.path = P;
}
function stockDone() {
  const r = SK.res, pay = Math.round(SK.stake * r.m); if (pay) addCoins(pay);
  if (r.k === 'jackpot') addDia(5);
  const st = lsGet('sgf_stock', { n: 0, gain: 0 }); st.n++; st.gain += pay - SK.stake; lsSet('sgf_stock', st);
  SK.pay = pay; SK.phase = 'result'; SK.t = 0; r.k === 'jackpot' || r.k === 'up' ? SFX.coin() : r.k === 'delist' ? SFX.thud() : SFX.select();
}
function updateStock() {
  SK.t++;
  if (SK.phase === 'run') { if (SK.t >= 150) stockDone(); return; }
  if (SK.phase === 'result') { if (SK.t > 20 && (pressed.Enter || pressed.Space || pressed.KeyI)) { SK.phase = 'pick'; SK.t = 0; } else if (pressed.Escape) toTitle(); return; }
  const n = STOCKS.length;
  if (pressed.KeyA || pressed.ArrowLeft) { SK.sel = (SK.sel + n - 1) % n; SFX.select(); }
  if (pressed.KeyD || pressed.ArrowRight) { SK.sel = (SK.sel + 1) % n; SFX.select(); }
  if (pressed.KeyW || pressed.ArrowUp) { SK.amt = Math.min(ST_PCT.length - 1, SK.amt + 1); SFX.select(); }
  if (pressed.KeyS || pressed.ArrowDown) { SK.amt = Math.max(0, SK.amt - 1); SFX.select(); }
  if (pressed.Enter || pressed.Space || pressed.KeyI) stockBuy();
  else if (pressed.Escape) toTitle();
}
function drawStock() {
  ctx.fillStyle = '#07131f'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(100,180,255,0.08)'; ctx.lineWidth = 1; for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  txt('📈 월드3 · 돼지 주식 시장', W / 2, 38, 30, '#e3f2fd', '#000', 6); wDia(); wBack(() => { pressed.Escape = true; });
  const st = lsGet('sgf_stock', { n: 0, gain: 0 });
  txt(`투자 ${st.n}번 · 누적 ${st.gain >= 0 ? '+' : ''}${fmtN(st.gain)} 코인`, W / 2, 68, 13, st.gain >= 0 ? '#69f0ae' : '#ff8a80', null);
  STOCKS.forEach(([ic, nm, col], i) => {
    const x = 70 + i * 210, on = SK.sel === i;
    ctx.fillStyle = on ? 'rgba(25,118,210,0.85)' : 'rgba(20,40,60,0.85)'; rr(x, 86, 190, 70, 12); ctx.fill();
    if (on) { ctx.strokeStyle = col; ctx.lineWidth = 3; rr(x, 86, 190, 70, 12); ctx.stroke(); }
    txt(ic, x + 30, 121, 28, '#fff', null); txt(nm, x + 115, 121, fitSize(nm, 15, 120), '#fff', null);
    if (SK.phase === 'pick') addHot(x, 86, 190, 70, () => { SK.sel = i; SFX.select(); });
  });
  const gx = 120, gy = 180, gw = 720, gh = 200;   // 그래프
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; rr(gx - 10, gy - 10, gw + 20, gh + 20, 10); ctx.fill();
  const base = gy + gh * 0.6; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(gx, base); ctx.lineTo(gx + gw, base); ctx.stroke(); ctx.setLineDash([]);
  if (SK.phase !== 'pick' && SK.path.length) {
    const N = SK.path.length - 1, upto = SK.phase === 'run' ? Math.floor(N * Math.min(1, SK.t / 140)) : N, mx = Math.max(2, ...SK.path);
    const yv = v => base - (v - 1) / (mx - 1) * (gh * 0.6) * (v >= 1 ? 1 : 0) + (v < 1 ? (1 - v) * gh * 0.4 : 0);
    ctx.strokeStyle = SK.phase === 'result' ? SK.res.col : '#90caf9'; ctx.lineWidth = 4; ctx.beginPath();
    for (let i = 0; i <= upto; i++) { const x = gx + gw * i / N, y = yv(SK.path[i]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
  } else txt('어떤 주식에 얼마나 넣을까?', W / 2, gy + gh / 2, 22, '#90caf9', null);
  if (SK.phase === 'pick') {
    const stake = Math.floor(coins * ST_PCT[SK.amt]);
    ST_PCT.forEach((p, i) => { const x = 200 + i * 145, on = SK.amt === i; ctx.fillStyle = on ? '#ef6c00' : 'rgba(255,255,255,0.1)'; rr(x, 404, 130, 38, 10); ctx.fill(); txt(`${p * 100}%`, x + 65, 423, 18, '#fff', null); addHot(x, 404, 130, 38, () => { SK.amt = i; SFX.select(); }); });
    ctx.fillStyle = '#2e7d32'; rr(W / 2 - 150, 452, 300, 40, 10); ctx.fill(); txt(`🪙 ${fmtN(stake)} 투자하기 (Enter)`, W / 2, 472, fitSize(`🪙 ${fmtN(stake)} 투자하기 (Enter)`, 17, 280), '#fff', null);
    addHot(W / 2 - 150, 452, 300, 40, () => { pressed.Enter = true; });
    txt('대박 1% · 오르기 10% · 애매 20% · 떨어지기 29% · 상장폐지 40%  ·  A/D 종목 · W/S 금액', W / 2, 516, 12, '#90a4ae', null);
  } else if (SK.phase === 'run') txt(`${STOCKS[SK.sel][1]} 주가가 움직이는 중...`, W / 2, 430, 20, '#fff', '#000', 4);
  else {
    const r = SK.res, d = SK.pay - SK.stake;
    txt(r.name, W / 2, 425, 38, r.col, '#000', 7);
    txt(r.k === 'delist' ? `${STOCKS[SK.sel][1]} 상장폐지... 투자한 ${fmtN(SK.stake)} 코인이 사라졌어요` : `${fmtN(SK.stake)} → ${fmtN(SK.pay)} 코인 (${d >= 0 ? '+' : ''}${fmtN(d)})${r.k === 'jackpot' ? ' · 💎 +5' : ''}`, W / 2, 468, 18, '#fff', null);
    if (SK.t > 20) { txt('Enter: 다시 투자 · Esc: 타이틀로', W / 2, 506, 13, '#bbb', null); addHot(0, 150, W, H - 150, () => { pressed.Enter = true; }); }
  }
}

// ================= 📈 월드3 · 증권가: 월드1과 같은 게임 (랭크전·연승·장사·은행…) + 다른 이야기 + 💵 돼지달러 =================
// 돈·빚·은행·냉장고는 월드3 전용 칸에 따로 저장 (02의 wKey) · 돼지·스킨·티어·아이템은 같이 씀
const W3_DEBT = 1000000000;   // 증권사 빚 10억 달러
const w3Txt = s => s.replace(/🪙/g, '💵').replace(/(?<!돼지)코인/g, '달러').replace(/사채업자 멧돼지 실장/g, '증권사 곰 부장').replace(/멧돼지 실장/g, '곰 부장').replace(/사채/g, '증권사 빚');
const W3_MENU = ['📈 증권거래소', '돼지 주식에 달러 투자 · 대박 1% · 상장폐지 40%', () => openStock()];
function w3Menu(on) { const i = MENU.indexOf(W3_MENU); if (on && i < 0) MENU.splice(MENU.findIndex(m => m[0] === '🌍 월드') + 1, 0, W3_MENU); if (!on && i >= 0) MENU.splice(i, 1); titleSel = Math.min(titleSel, MENU.length - 1); }
function setWorld(w) {
  if (WORLD === w) return;
  WORLD = w; localStorage.setItem('sgf_world', JSON.stringify(w));
  if (w === 3 && localStorage.getItem('sgf_debt_w3') === null) { lsSet('sgf_coin', 1000); lsSet('sgf_debt', W3_DEBT); lsSet('sgf_debtbase', W3_DEBT); lsSet('sgf_bank', 0); lsSet('sgf_fridge', []); }   // 처음 오면 💵 1000달러 · 빚 10억
  coins = fixCoins(lsGet('sgf_coin', 100)); debt = lsGet('sgf_debt', DEBT_START); bankDebt = lsGet('sgf_bank', 0); debtBase = lsGet('sgf_debtbase', DEBT_START); fridge = lsGet('sgf_fridge', []);
  w3Menu(w === 3);
}
function enterW3() {
  setWorld(3); toTitle();
  if (!lsGet('sgf_w3intro', false)) { lsSet('sgf_w3intro', true); startStory('w3intro', 'title'); }
  else toast('📈 월드3 · 증권가 · 💵 돼지달러로 해요');
}
function w3Reset() { coins = 1000; lsSet('sgf_coin', coins); debt = W3_DEBT; bankDebt = 0; debtBase = W3_DEBT; saveDebt(); lsSet('sgf_w3chap', []); }
function w3Chapters() {   // 월드3 이야기: 빚을 갚은 만큼 · 다 갚으면 월드3 클리어 · 파산하면 처음부터
  const seen = lsGet('sgf_w3chap', []), r = Math.max(0, debt) / W3_DEBT;
  for (const [k, th] of [['w3ch1', 0.75], ['w3ch2', 0.5], ['w3ch3', 0.25], ['w3end', 0]]) {
    if (seen.includes(k)) continue;
    if (k === 'w3end' ? totalDebt() <= 0 : r <= th) { seen.push(k); lsSet('sgf_w3chap', seen); if (k === 'w3end') { lsSet('sgf_w3clear', true); addDia(30); } startStory(k, scene); return true; }
  }
  if (isBroke()) { w3Reset(); startStory('w3bad', 'title'); return true; }
  return false;
}
Object.assign(STORY, {
  w3intro: [
    { sp: '내레이션', tx: '포장마차를 동네 명물로 만든 {name}님. 통장엔 처음으로 큰돈이 생겼어요.', art: 'stall' },
    { sp: '증권사 곰 부장', tx: '"사장님, 이 돈 그냥 두면 손해예요. 신용으로 10배 빌려 드릴 테니 주식 한번 하시죠?"', art: 'whisper' },
    { sp: '{name}', tx: '"삼겹전자... 포차홀딩스... 전부 다 사!! 신용 끝까지!!"', art: 'pump' },
    { sp: '내레이션', tx: '...그리고 그날 오후. 주가 폭락. 반대매매. 계좌가 텅 비었습니다.', art: 'crash' },
    { sp: '증권사 곰 부장', tx: '"갚으셔야 할 돈 10억 달러입니다. 이자는 판마다 붙어요. 못 갚으시면... 아시죠?"', art: 'boss' },
    { sp: '내레이션', tx: '여긴 증권가. 돈은 💵 돼지달러로 따로 세요. 다시 싸우고, 장사하고, 📈 증권거래소에서 한 방을 노려라!', art: 'fight' },
    { sp: 'TIP', tx: '월드1 코인은 그대로 남아 있어요. 🌍 월드 메뉴에서 월드1로 돌아가면 다시 코인으로 해요.', art: 'bank' }
  ],
  w3ch1: [{ sp: '증권사 곰 부장', tx: '"4분의 1이나 갚으셨다고요? 주식은 이제 안 하시는 거죠? ...그쵸?"', art: 'boss' }],
  w3ch2: [{ sp: '증권사 곰 부장', tx: '"벌써 절반이요?! 사장님, 혹시 다시 신용 쓰실 생각은..."', art: 'boss' }, { sp: '{name}', tx: '"절대 안 해!!"', art: 'fight' }],
  w3ch3: [{ sp: '증권사 곰 부장', tx: '"이제 4분의 1만 남았네요. 증권가에 소문났어요. 싸움 잘하는 돼지 투자자라고."', art: 'boss' }],
  w3end: [
    { sp: '증권사 곰 부장', tx: '"10억 달러... 전부 상환 확인했습니다. 대단하십니다."', art: 'boss' },
    { sp: '{name}', tx: '"이제 주식은 재미로만 할 거야. 진짜로."', art: 'rich' },
    { sp: '내레이션', tx: '📈 월드3 클리어! 💎 다이아 30개를 받았어요.', art: 'ending' }
  ],
  w3bad: [
    { sp: '증권사 곰 부장', tx: '"달러가 한 푼도 없으시네요. ...계좌를 처음부터 다시 만들어 드리죠."', art: 'bankrupt' },
    { sp: '내레이션', tx: '💀 월드3 파산! 💵 1000달러 · 빚 10억 달러로 처음부터 (월드1 코인은 그대로)', art: 'bankrupt' }
  ]
});
if (WORLD === 3) w3Menu(true);   // 월드3에서 게임을 껐다 켜도 증권거래소 메뉴

// ---- 🎯 저격장 조준: 마우스는 움직이면 조준 · 클릭 발사 / 손가락은 끌어서 조준 · 떼면 발사 ----
const snXY = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
function snPoint(e) { const [x, y] = snXY(e); SN.cx = clamp(x, 20, W - 20); SN.cy = clamp(y, 160, H - 40); }
const snOn = () => scene === 'snipe' && SN && !SN.done;
cv.addEventListener('pointermove', e => { if (snOn() && (e.pointerType === 'mouse' || SN.held === e.pointerId)) snPoint(e); });
cv.addEventListener('pointerdown', e => {
  if (!snOn()) return; const [x, y] = snXY(e); if (x < 120 && y < 50) return;   // 나가기 버튼
  snPoint(e); if (e.pointerType === 'mouse') snipeFire(); else SN.held = e.pointerId;
});
cv.addEventListener('pointerup', e => { if (snOn() && SN.held === e.pointerId) { SN.held = null; snipeFire(); } });
