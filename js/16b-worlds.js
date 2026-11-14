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
    go: () => { toTitle(); toast('🐷 월드1은 타이틀 메뉴 그대로예요 · 사채 1억을 다 갚으면 클리어'); } },
  { icon: '🎄', name: '크리스마스 월드', desc: '🎁 선물 받기: 산타 썰매에서 떨어지는 선물을 받아요 (석탄은 피하기)', lock: () => xmasOpen() ? '' : '🔒 12월 1일 ~ 25일에만 열려요', clear: () => !!lsGet('sgf_xmas_got', false),
    go: () => startCatch('gift') },
  { icon: '🏮', name: '월드2 · 포장마차 (대규모 업데이트)', desc: () => `삼겹살·목살·항정살 모으기 · 이야기 ${Math.min(w2Stage(), W2_N)}/${W2_N}장`, lock: () => w1Clear() ? '' : '🔒 월드1 클리어(사채 빚 다 갚기 엔딩)가 필요해요', clear: w2Clear,
    go: () => w2Go() },
  { icon: '📈', name: '월드3 · 주식 시장', desc: '돼지 주식에 코인 투자 · 대박 아니면 상장폐지?!', lock: () => w2Clear() ? '' : '🔒 월드2 클리어가 필요해요', clear: () => false,
    go: () => openStock() }
];
const wLock = w => wTest() ? '' : w.lock();
function openWorlds() {
  scene = 'worlds'; WD.shop = false;
  if ((w1Clear() || wTest()) && !lsGet('sgf_w2seen', false)) { lsSet('sgf_w2seen', true); popup({ icon: '🏮', title: '대규모 업데이트 · 월드2 포장마차!', lines: ['삼겹살·목살·항정살을 모아 포장마차를 키워요', '이야기 5장을 다 깨면 📈 월드3 주식 시장이 열려요'], big: true }); }
}
function worldGo(i) { const w = WORLDS[i], lk = wLock(w); WD.sel = i; if (lk) { SFX.block(); toast(lk); return; } SFX.confirm(); w.go(); }
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

// ================= 받기 게임: 🎁 선물 받기(크리스마스) · 🥩 고기 모으기(월드2) =================
const MEAT3 = { sam: ['삼겹살', '#f48fb1'], mok: ['목살', '#c62828'], hang: ['항정살', '#ffcdd2'] };
const w2Need = s => ({ sam: 5 + s * 2, mok: 3 + s * 2, hang: 2 + s });
const CATCH_Y = GROUND - 140;
let CG = null;
function startCatch(kind, stage = 0) {
  CG = { kind, stage, t: 0, dur: (kind === 'gift' ? 45 : 50) * 60, x: W / 2, vx: 0, face: 1, items: [], score: 0, got: { sam: 0, mok: 0, hang: 0 }, stun: 0, combo: 0,
    ch: withCos(getChar(sel.c1)), done: false, endT: 0, win: false, res: [], need: kind === 'meat' ? w2Need(stage) : null,
    snow: Array.from({ length: 70 }, () => [Math.random() * W, Math.random() * H, rand(0.6, 2.2)]) };
  parts = []; texts = [];
  mode = 7; scene = 'wplay'; SFX.confirm();
}
const sleighX = t => W / 2 + Math.sin(t * 0.013) * 380 + Math.sin(t * 0.031) * 60;
const needMet = () => Object.keys(CG.need).every(k => CG.got[k] >= CG.need[k]);
function catchSpawn() {
  const g = CG, sp = 1 + g.stage * 0.15;
  if (g.kind === 'gift') {
    if (g.t % Math.max(14, 26 - (g.t / 300 | 0)) !== 0) return;
    const r = Math.random(), k = r < 0.09 ? 'gold' : r < 0.27 ? 'coal' : 'gift';
    g.items.push({ k, x: sleighX(g.t), y: 96, vx: rand(-1.2, 1.2), vy: 1, rot: rand(-0.4, 0.4), c: ['#e53935', '#43a047', '#1e88e5', '#8e24aa'][Math.random() * 4 | 0] });
  } else {
    if (g.t % Math.max(10, 24 - g.stage * 3) !== 0) return;
    const r = Math.random(), burnt = 0.12 + g.stage * 0.04;
    const k = r < burnt ? 'burnt' : r < burnt + (1 - burnt) * 0.45 ? 'sam' : r < burnt + (1 - burnt) * 0.8 ? 'mok' : 'hang';
    g.items.push({ k, x: rand(60, W - 60), y: -20, vx: rand(-0.8, 0.8), vy: 1.2 * sp, rot: rand(-0.5, 0.5) });
  }
}
function catchGet(it) {
  const g = CG, px = g.x, py = CATCH_Y;
  if (it.k === 'coal' || it.k === 'burnt') {
    g.stun = 36; g.combo = 0; SFX.thud();
    if (it.k === 'coal') { g.score = Math.max(0, g.score - 2); popText(px, py - 40, '석탄! -2', '#9e9e9e', 26); }
    else { const ks = Object.keys(g.got).filter(k => g.got[k] > 0); if (ks.length) { const k = ks[Math.random() * ks.length | 0]; g.got[k]--; popText(px, py - 40, `탄 고기! ${MEAT3[k][0]} -1`, '#8d6e63', 24); } else popText(px, py - 40, '탄 고기!', '#8d6e63', 24); }
    burst(px, py, 12, ['#424242', '#757575', '#212121'], 6); return;
  }
  g.combo++;
  if (g.kind === 'gift') { const v = it.k === 'gold' ? 3 : 1; g.score += v; popText(px, py - 40, it.k === 'gold' ? '황금 선물! +3' : '+1', it.k === 'gold' ? '#ffd740' : '#fff', it.k === 'gold' ? 28 : 22); burst(px, py, 10, it.k === 'gold' ? ['#ffd740', '#fff59d'] : [it.c, '#fff59d', '#fff'], 6); }
  else { g.got[it.k]++; popText(px, py - 40, `${MEAT3[it.k][0]} +1`, MEAT3[it.k][1], 22); burst(px, py, 8, [MEAT3[it.k][1], '#fff'], 5); }
  SFX.coin();
}
function catchFinish() {
  const g = CG; g.done = true; g.endT = 0;
  if (g.kind === 'gift') {
    const n = g.score, d = Math.floor(n / 10), tot = lsGet('sgf_gifts', 0) + n, best = Math.max(lsGet('sgf_giftbest', 0), n);
    lsSet('sgf_gifts', tot); lsSet('sgf_giftbest', best); addDia(d); nqAdd('gift', n); g.win = true;
    g.res = [`🎁 받은 선물 ${n}개 (최고 ${best}개)`, `💎 다이아 +${d}`, `크리스마스 퀘스트 선물: ${Math.min(100, (qState(QUESTS.find(q => q.key === 'sgf_q_xmas')).gift || 0))}/100`];
  } else {
    g.win = needMet();
    if (g.win) {
      const first = g.stage >= w2Stage(), d = first ? 3 + g.stage : 1, c = Math.round(2000 * (g.stage + 1) * EARN);
      if (first) lsSet('sgf_w2', g.stage + 1); addDia(d); addCoins(c);
      g.res = [`🏮 ${g.stage + 1}장 클리어!`, `💎 다이아 +${d} · 🪙 +${fmtN(c)}`];
      if (first && g.stage + 1 >= W2_N) g.res.push('🎉 월드2 클리어! 📈 월드3 주식 시장이 열렸어요');
    } else g.res = ['⏰ 시간 끝! 주문을 다 못 채웠어요', 'R: 다시 하기'];
  }
  SFX[g.win ? 'gong' : 'thud']();
}
function catchExit() {
  const g = CG; CG = null; mode = 1;
  if (g && g.kind === 'meat' && g.win && g.stage + 1 >= W2_N && w2Stage() >= W2_N && !lsGet('sgf_w2end', false)) { lsSet('sgf_w2end', true); WS = { lines: W2_END, i: 0, next: () => openWorlds() }; scene = 'wstory'; return; }
  if (g && g.kind === 'meat' && g.win && w2Stage() < W2_N) return w2Go();
  openWorlds();
}
function updateCatch() {
  const g = CG; if (!g) return openWorlds();
  if (g.done) {
    g.endT++; updParts();
    if (g.endT > 30 && (pressed.Enter || pressed.Space || pressed.KeyI)) catchExit();
    else if (g.endT > 30 && pressed.KeyR) startCatch(g.kind, g.stage);
    else if (pressed.Escape) { CG = null; mode = 1; openWorlds(); }
    return;
  }
  if (pressed.Escape) { CG = null; mode = 1; openWorlds(); toast('그만뒀어요 (보상 없음)'); return; }
  g.t++; updParts();
  const L = keys.KeyA || keys.ArrowLeft, R = keys.KeyD || keys.ArrowRight;
  if (g.stun > 0) { g.stun--; g.vx *= 0.8; }
  else { const want = (R ? 1 : 0) - (L ? 1 : 0); g.vx += (want * 9.5 - g.vx) * 0.35; if (want) g.face = want; }
  g.x = clamp(g.x + g.vx, 50, W - 50);
  catchSpawn();
  const grav = g.kind === 'gift' ? 0.07 : 0.07 * (1 + g.stage * 0.15);
  for (let i = g.items.length - 1; i >= 0; i--) {
    const it = g.items[i]; it.vy += grav; it.y += it.vy; it.x += it.vx; it.rot += it.vx * 0.02;
    if (Math.abs(it.x - g.x) < 66 && Math.abs(it.y - CATCH_Y) < 26) { g.items.splice(i, 1); catchGet(it); continue; }
    if (it.y > GROUND + 30) { g.items.splice(i, 1); if (it.k !== 'coal' && it.k !== 'burnt') g.combo = 0; }
  }
  for (const s of g.snow) { s[1] += s[2]; s[0] += Math.sin((gT + s[1]) * 0.01) * 0.3; if (s[1] > H) { s[1] = -5; s[0] = Math.random() * W; } }
  if ((g.kind === 'meat' && needMet()) || g.t >= g.dur) catchFinish();
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
  for (const it of g.items) g.kind === 'gift' ? drawGiftItem(it) : drawMeatItem(it);
  const moving = Math.abs(g.vx) > 1;
  drawPig(g.x, GROUND, g.face, g.ch.look, { t: gT, scale: g.ch.scale * 0.9, hurt: g.stun > 0, victory: g.done && g.win, move: moving && !g.done ? 'walk' : undefined, k: (gT % 30) / 30 });
  ctx.save(); ctx.translate(g.x, CATCH_Y + 14);   // 받는 그릇: 선물 자루 / 고기 쟁반
  if (g.kind === 'gift') { ctx.fillStyle = '#6d4c41'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-58, -6); ctx.quadraticCurveTo(0, 34, 58, -6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#a1887f'; ctx.fillRect(-58, -10, 116, 6); }
  else { ctx.fillStyle = '#90a4ae'; ctx.strokeStyle = '#263238'; ctx.lineWidth = 2; ell(0, 0, 62, 12); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#455a64'; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 22, -8); ctx.lineTo(i * 22, 8); ctx.stroke(); } }
  ctx.restore();
  drawParts();
  // HUD
  const left = Math.max(0, g.dur - g.t) / 60;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; rr(W / 2 - 160, 112, 320, 14, 7); ctx.fill(); ctx.fillStyle = left < 10 ? '#ff5252' : '#69f0ae'; rr(W / 2 - 158, 114, 316 * (left * 60 / g.dur), 10, 5); ctx.fill();
  txt(`⏰ ${Math.ceil(left)}초`, W / 2, 140, 16, '#fff', '#000', 4);
  if (g.kind === 'gift') txt(`🎁 ${g.score}`, 24, 150, 30, '#ffd740', '#000', 6, 'left');
  else {
    txt(`🏮 ${g.stage + 1}장 주문`, 24, 140, 18, '#ffe0b2', '#000', 4, 'left');
    Object.keys(MEAT3).forEach((k, i) => { const y = 172 + i * 36, ok = g.got[k] >= g.need[k]; drawMeatItem({ k }, 46, y, 0, 0.7); txt(`${MEAT3[k][0]} ${Math.min(g.got[k], g.need[k])}/${g.need[k]}${ok ? ' ✅' : ''}`, 76, y, 16, ok ? '#69f0ae' : '#fff', '#000', 4, 'left'); });
  }
  wBack(() => { pressed.Escape = true; });
  if (!g.done && g.t < 120) txt(TOUCH ? '조이스틱으로 좌우 이동' : 'A/D 또는 ←→ 로 움직여서 받기', W / 2, 240, 20, '#fff', '#000', 5);
  if (g.done) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; rr(W / 2 - 260, 170, 520, 200, 18); ctx.fill();
    txt(g.win ? (g.kind === 'gift' ? '🎄 선물 받기 끝!' : '🏮 주문 완료!') : '😢 실패...', W / 2, 210, 32, g.win ? '#ffd740' : '#ff8a80', '#000', 6);
    g.res.forEach((l, i) => txt(l, W / 2, 256 + i * 30, fitSize(l, 18, 480), '#fff', null));
    if (g.endT > 30) { txt('Enter: 계속 · R: 다시 하기 · Esc: 월드로', W / 2, 352, 13, '#bbb', null); addHot(W / 2 - 260, 170, 520, 200, () => { pressed.Enter = true; }); }
  }
}

// ================= 🏮 월드2 이야기: 포장마차 고기 모으기 =================
const W2_STORY = [
  [['내레이션', '사채를 다 갚은 돼지. 하지만 통장엔 동전 몇 개뿐이다...'], ['포장마차 할머니', '"이 포차 네가 맡아 볼래? 고기만 잘 모으면 손님은 알아서 온단다."'], ['내레이션', '1장 · 첫 장사 준비: 쏟아지는 고기를 쟁반으로 받아라! (탄 고기는 피하기)']],
  [['손님', '"사장님! 삼겹살 2인분이요! 목살도 주세요!"'], ['내레이션', '2장 · 첫 손님들: 손님이 늘었다. 고기가 모자라!']],
  [['옆집 고깃집 사장', '"흥, 포차 주제에. 탄 고기 맛 좀 봐라!"'], ['내레이션', '3장 · 방해 공작: 탄 고기가 더 많이 날아온다!']],
  [['손님들', '"여기 포차 항정살이 기가 막힌대!"'], ['내레이션', '4장 · 긴 줄: 고기가 더 빨리 떨어진다!']],
  [['포장마차 할머니', '"오늘은 동네 포차 축제란다. 최고의 고기를 모아 보렴."'], ['내레이션', '5장 · 포차 축제의 밤: 마지막 주문을 채워라!']]
];
const W2_END = [['내레이션', '포장마차가 동네 명물이 됐다!'], ['포장마차 할머니', '"이제 너는 진짜 고기 장인이야. 번 돈으로... 주식이라도 해 볼래?"'], ['내레이션', '🏮 월드2 클리어! 📈 월드3 주식 시장이 열렸어요']];
let WS = null;
function w2Go() {
  const s = w2Stage();
  if (s >= W2_N) { startCatch('meat', W2_N - 1); toast('🏮 월드2 클리어! 마지막 장을 다시 해요 (다이아 +1)'); return; }
  WS = { lines: W2_STORY[s], i: 0, next: () => startCatch('meat', s) }; scene = 'wstory';
}
function updateWStory() {
  if (!WS) return openWorlds();
  if (pressed.Enter || pressed.Space || pressed.KeyI) { SFX.select(); if (++WS.i >= WS.lines.length) WS.next(); }
  else if (pressed.Escape) WS.next();
}
function drawWStory() {
  if (!WS) return;
  ctx.fillStyle = '#140b0d'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#e64a19'; ctx.fillRect(200, 120, 560, 40); ctx.fillStyle = '#4e342e'; ctx.fillRect(220, 160, 520, 200); ctx.fillStyle = '#ffb74d'; ctx.fillRect(250, 190, 460, 110);
  for (let i = 0; i < 9; i++) { ctx.fillStyle = (gT / 15 + i) % 2 < 1 ? '#ffd740' : '#ff7043'; ell(220 + i * 65, 120, 6, 6); ctx.fill(); }
  txt('🏮 포 장 마 차', W / 2, 140, 22, '#fff3e0', '#5d1a00', 5);
  drawMeatItem({ k: 'sam' }, 330, 245, 0.1, 1.2); drawMeatItem({ k: 'mok' }, 480, 250, -0.1, 1.2); drawMeatItem({ k: 'hang' }, 630, 245, 0.05, 1.2);
  drawPig(150, 372, 1, withCos(getChar(sel.c1)).look, { t: gT, scale: 0.62 });
  const [sp, tx] = WS.lines[Math.min(WS.i, WS.lines.length - 1)];
  ctx.fillStyle = 'rgba(0,0,0,0.8)'; rr(60, 380, 840, 120, 14); ctx.fill(); ctx.strokeStyle = '#ff7043'; ctx.lineWidth = 3; rr(60, 380, 840, 120, 14); ctx.stroke();
  txt(sp, 84, 404, 16, '#ffab91', null, 0, 'left'); txt(tx, W / 2, 448, fitSize(tx, 20, 800), '#fff', null);
  txt(`${WS.i + 1}/${WS.lines.length} · Enter 다음 · Esc 건너뛰기`, W / 2, 488, 12, '#999', null);
  addHot(0, 0, W, H, () => { pressed.Enter = true; });
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
function openStock() { SK.phase = 'pick'; SK.t = 0; SK.res = null; scene = 'stock'; }
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
  if (SK.phase === 'result') { if (SK.t > 20 && (pressed.Enter || pressed.Space || pressed.KeyI)) { SK.phase = 'pick'; SK.t = 0; } else if (pressed.Escape) openWorlds(); return; }
  const n = STOCKS.length;
  if (pressed.KeyA || pressed.ArrowLeft) { SK.sel = (SK.sel + n - 1) % n; SFX.select(); }
  if (pressed.KeyD || pressed.ArrowRight) { SK.sel = (SK.sel + 1) % n; SFX.select(); }
  if (pressed.KeyW || pressed.ArrowUp) { SK.amt = Math.min(ST_PCT.length - 1, SK.amt + 1); SFX.select(); }
  if (pressed.KeyS || pressed.ArrowDown) { SK.amt = Math.max(0, SK.amt - 1); SFX.select(); }
  if (pressed.Enter || pressed.Space || pressed.KeyI) stockBuy();
  else if (pressed.Escape) openWorlds();
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
    if (SK.t > 20) { txt('Enter: 다시 투자 · Esc: 월드로', W / 2, 506, 13, '#bbb', null); addHot(0, 150, W, H - 150, () => { pressed.Enter = true; }); }
  }
}
