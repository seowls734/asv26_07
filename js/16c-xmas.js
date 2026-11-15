// ================= 🎄 대규모 업데이트 · 크리스마스 (해마다 12월 1~25일) =================
// 12월 전에는 아무 데도 안 보임 (월드 목록·퀘스트·돼지 도감·타이틀 전부 숨김) → 12월 1일에 '깜짝 공개' 팝업
// 테스트 계정(서버가 tester로 알려 준 회원)은 미리 다 보임
// 내용: 🎁 선물 받기(전부터 있던 것) · ⛄ 눈싸움(새 미니게임) · 📅 크리스마스 달력(날마다 선물 상자) · 타이틀에 눈 · 🎅 산타돈·❄️ 눈꽃돈 퀘스트
const xmasYear = () => new Date().getFullYear();
const xmasDay = () => { const d = new Date(); return d.getMonth() === 11 ? d.getDate() : 0; };   // 12월이 아니면 0
function xmasBigPop() {   // 공개 첫날(그 해 처음) 한 번만 깜짝 팝업
  if (AUTH_TEST || !xmasOpen() || lsGet('sgf_xmasbig', 0) === xmasYear()) return;
  lsSet('sgf_xmasbig', xmasYear());
  popup({ icon: '🎄', title: '🎉 깜짝 대규모 업데이트 · 크리스마스!', lines: ['🎁 선물 받기 · ⛄ 눈싸움 (새 미니게임!) · 📅 크리스마스 달력', '🎅 산타돈 · ❄️ 눈꽃돈: 크리스마스 퀘스트를 깨면 둘 다!', '🌍 월드 → 🎄 크리스마스 · 12월 25일까지만 열려요'], big: true });
}

// ---- 크리스마스 화면 (월드에서 들어옴) ----
const XM = { sel: 0, cal: false, csel: 0, snow: Array.from({ length: 80 }, () => [Math.random() * 960, Math.random() * 540, 0.6 + Math.random() * 1.8]) };
const XM_GAMES = [
  { icon: '🎁', name: '선물 받기', desc: '산타 썰매에서 떨어지는 선물 받기 · 석탄은 피하기', best: () => `최고 ${lsGet('sgf_giftbest', 0)}개`, go: () => startCatch() },
  { icon: '⛄', name: '눈싸움', desc: '요정 돼지에게 눈덩이 던지기 · 산타는 맞히면 안 돼요!', best: () => `최고 ${lsGet('sgf_snowbest', 0)}점`, go: () => startSnow() },
  { icon: '📅', name: '크리스마스 달력', desc: '12월 1~25일 날마다 선물 상자 하나', best: () => advToday() ? '🎁 오늘 상자 열기!' : `연 상자 ${advGot().length}/25`, go: () => { XM.cal = true; XM.csel = Math.max(0, (xmasDay() || 1) - 1); } }
];
function openXmas() { if (!xmasOpen()) { openWorlds(); return; } scene = 'xmas'; XM.cal = false; mode = 1; parts = []; texts = []; }
function xmasSnowTick() { for (const s of XM.snow) { s[1] += s[2]; s[0] += Math.sin((gT + s[1]) * 0.01) * 0.3; if (s[1] > H) { s[1] = -5; s[0] = Math.random() * W; } } }
function updateXmas() {
  xmasSnowTick();
  if (XM.cal) return updateAdvent();
  const n = XM_GAMES.length;
  if (pressed.KeyA || pressed.ArrowLeft || pressed.KeyW || pressed.ArrowUp) { XM.sel = (XM.sel + n - 1) % n; SFX.select(); }
  if (pressed.KeyD || pressed.ArrowRight || pressed.KeyS || pressed.ArrowDown) { XM.sel = (XM.sel + 1) % n; SFX.select(); }
  for (let i = 0; i < n; i++) if (pressed['Digit' + (i + 1)] || pressed['Numpad' + (i + 1)]) { XM.sel = i; SFX.confirm(); XM_GAMES[i].go(); return; }
  if (pressed.Enter || pressed.Space || pressed.KeyI) { SFX.confirm(); XM_GAMES[XM.sel].go(); }
  else if (pressed.Escape) openWorlds();
}
function xmasBg() {
  const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0b1636'); gr.addColorStop(1, '#1a237e'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#eceff1'; ctx.fillRect(0, GROUND, W, H - GROUND);
  for (let i = 0; i < 2; i++) {   // 큰 트리 두 그루
    const x = i ? 880 : 80, b = GROUND;
    ctx.fillStyle = '#5d4037'; ctx.fillRect(x - 8, b - 30, 16, 30);
    for (let k = 0; k < 3; k++) { ctx.fillStyle = '#2e7d32'; ctx.beginPath(); ctx.moveTo(x - 60 + k * 12, b - 30 - k * 55); ctx.lineTo(x, b - 120 - k * 55); ctx.lineTo(x + 60 - k * 12, b - 30 - k * 55); ctx.fill(); }
    for (let k = 0; k < 7; k++) { ctx.fillStyle = (gT / 15 + k + i) % 3 < 1.5 ? ['#ff5252', '#ffd740', '#40c4ff'][k % 3] : '#555'; ell(x - 34 + (k * 23) % 68, b - 50 - k * 22, 5, 5); ctx.fill(); }
    txt('⭐', x, b - 236, 26, '#ffd740', null);
  }
  ctx.fillStyle = '#fff'; for (const s of XM.snow) { ell(s[0], s[1], s[2], s[2]); ctx.fill(); }
}
function xmasQuestLine() {
  const XQ = QUESTS.find(q => q.key === 'sgf_q_xmas'); if (!XQ) return '';
  if (lsGet('sgf_xmas_got', false)) return '🎅 산타돈 · ❄️ 눈꽃돈 받음! ✅';
  const st = qState(XQ), done = XQ.steps.filter(s => (st[s.id] || 0) >= s.goal).length;
  return `🎅 크리스마스 퀘스트 ${done}/${XQ.steps.length} · 다 깨면 산타돈 + 눈꽃돈 (🎁 보상 센터에서 확인)`;
}
function drawXmas() {
  xmasBg();
  if (XM.cal) return drawAdvent();
  const d = xmasDay();
  txt('🎄 대규모 업데이트 · 크리스마스', W / 2, 44, 34, '#fff', '#b71c1c', 8);
  txt(d ? (d < 25 ? `🎅 크리스마스까지 D-${25 - d} · 12월 25일까지만 열려요` : '🎅 메리 크리스마스! 오늘이 마지막 날이에요') : '🧪 테스트 계정 미리 보기 (12월 1일에 모두에게 공개)', W / 2, 84, 16, '#ffd740', '#000', 4);
  wDia(); wBack(() => { pressed.Escape = true; });
  XM_GAMES.forEach((g, i) => {
    const x = 120 + i * 250, y = 120, on = XM.sel === i, hl = i === 2 && advToday();
    ctx.fillStyle = on ? 'rgba(183,28,28,0.93)' : 'rgba(20,30,70,0.9)'; rr(x, y, 220, 250, 18); ctx.fill();
    ctx.strokeStyle = on ? '#ffd740' : hl && gT % 40 < 20 ? '#69f0ae' : 'rgba(255,255,255,0.25)'; ctx.lineWidth = on ? 5 : 3; rr(x, y, 220, 250, 18); ctx.stroke();
    txt(g.icon, x + 110, y + 70 + Math.sin(gT * 0.08 + i) * 5, 64, '#fff', null);
    txt(`${i + 1}  ${g.name}`, x + 110, y + 142, 22, '#fff', '#000', 5);
    txt(g.desc, x + 110, y + 176, fitSize(g.desc, 13, 200), '#e0e0e0', null);
    const b = g.best(); txt(b, x + 110, y + 214, fitSize(b, 16, 200), hl ? '#69f0ae' : '#ffe082', '#000', 4);
    addHot(x, y, 220, 250, () => { XM.sel = i; pressed.Enter = true; });
  });
  const q = xmasQuestLine(); ctx.fillStyle = 'rgba(0,0,0,0.6)'; rr(120, 392, 720, 40, 12); ctx.fill(); txt(q, W / 2, 412, fitSize(q, 16, 700), '#fff', null);
  txt(TOUCH ? '칸을 탭해서 들어가기' : 'A/D 고르기 · Enter 들어가기 · 숫자키 바로가기 · Esc 월드로', W / 2, 522, 12, '#90a4ae', null);
}

// ---- 📅 크리스마스 달력: 12월 1~25일, 그날 상자 하나 (지난 날은 못 엶 · 테스트 계정은 아무 날이나) ----
const advKey = () => 'sgf_adv' + xmasYear();
const advGot = () => lsGet(advKey(), []);
const advCan = day => !advGot().includes(day) && (wTest() ? true : day === xmasDay());
const advToday = () => xmasDay() > 0 && advCan(xmasDay());
function advPrize(day) {   // 5일마다 큰 상자 · 25일은 제일 큰 상자
  const big = day === 25, mid = !big && day % 5 === 0;
  return { coin: rwBase() * (big ? 20 : mid ? 6 : 2), dia: big ? 25 : mid ? 5 : 2, tix: big ? 5 : mid ? 1 : 0, revive: big ? 2 : 0 };
}
function advOpen(day) {
  if (!advCan(day)) { SFX.block(); toast(advGot().includes(day) ? '이미 연 상자예요' : day < xmasDay() ? '지난 날 상자는 못 열어요 😢' : `${day}일에 열 수 있어요`); return; }
  const p = advPrize(day); lsSet(advKey(), [...advGot(), day]);
  addCoins(p.coin); addDia(p.dia); if (p.tix) { RW.bonus += p.tix; rwSave(); } if (p.revive) { inv.use.revive = (inv.use.revive || 0) + p.revive; saveInv(); }
  SFX.coin(); SFX.gong(); burst(W / 2, H / 2, 40, ['#ff5252', '#ffd740', '#69f0ae', '#fff'], 12);
  const L = [`🪙 +${fmtN(p.coin)} 코인 · 💎 +${p.dia} 다이아`]; if (p.tix) L.push(`🎟️ 룰렛 티켓 +${p.tix}장`); if (p.revive) L.push(`💖 부활권 +${p.revive}개`);
  L.push(day === 25 ? '🎄 메리 크리스마스!!' : '내일 또 열어요!');
  popup({ icon: day === 25 ? '🎄' : '🎁', title: `크리스마스 달력 ${day}일 상자!`, lines: L, big: day === 25 });
}
function updateAdvent() {
  if (pressed.KeyA || pressed.ArrowLeft) { XM.csel = (XM.csel + 24) % 25; SFX.select(); }
  if (pressed.KeyD || pressed.ArrowRight) { XM.csel = (XM.csel + 1) % 25; SFX.select(); }
  if (pressed.KeyW || pressed.ArrowUp) { XM.csel = (XM.csel + 20) % 25; SFX.select(); }
  if (pressed.KeyS || pressed.ArrowDown) { XM.csel = (XM.csel + 5) % 25; SFX.select(); }
  if (pressed.Enter || pressed.Space || pressed.KeyI) advOpen(XM.csel + 1);
  else if (pressed.Escape) { XM.cal = false; SFX.select(); }
}
function drawAdvent() {
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, W, H);
  txt('📅 크리스마스 달력', W / 2, 36, 30, '#fff', '#b71c1c', 7); wDia(); wBack(() => { pressed.Escape = true; });
  txt('날마다 그날 상자 하나! · 5일마다 큰 상자 · 25일엔 제일 큰 상자', W / 2, 68, 14, '#ffe082', '#000', 3);
  const got = advGot(), today = xmasDay();
  for (let i = 0; i < 25; i++) {
    const day = i + 1, c = i % 5, r = i / 5 | 0, x = 230 + c * 104, y = 86 + r * 80, open = got.includes(day), can = advCan(day), on = XM.csel === i, big = day % 5 === 0;
    ctx.fillStyle = open ? 'rgba(60,60,70,0.85)' : day === 25 ? '#c62828' : big ? '#2e7d32' : ['#d32f2f', '#1565c0', '#6a1b9a', '#ef6c00'][i % 4];
    rr(x, y, 94, 70, 10); ctx.fill();
    if (!open) { ctx.fillStyle = '#ffd740'; ctx.fillRect(x + 42, y, 10, 70); ctx.fillRect(x, y + 30, 94, 10); }
    ctx.strokeStyle = on ? '#fff' : can && gT % 40 < 20 ? '#69f0ae' : 'rgba(0,0,0,0.4)'; ctx.lineWidth = on ? 4 : can ? 4 : 2; rr(x, y, 94, 70, 10); ctx.stroke();
    txt(open ? '✅' : String(day), x + 22, y + 18, open ? 18 : 20, '#fff', '#000', 4);
    if (day === today && !open) txt('오늘!', x + 70, y + 58, 13, '#fff59d', '#000', 3);
    if (big && !open) txt(day === 25 ? '🎄' : '🎁', x + 72, y + 18, 18, '#fff', null);
    addHot(x, y, 94, 70, () => { XM.csel = i; advOpen(day); });
  }
  const p = advPrize(XM.csel + 1), d = `${XM.csel + 1}일 상자: 🪙 ${fmtN(p.coin)} · 💎 ${p.dia}${p.tix ? ` · 🎟️ ${p.tix}` : ''}${p.revive ? ` · 💖 ${p.revive}` : ''}`;
  txt(d, W / 2, 502, fitSize(d, 16, 800), '#fff', '#000', 4);
  txt(TOUCH ? '오늘 상자를 탭해서 열기' : '방향키 고르기 · Enter 열기 · Esc 돌아가기', W / 2, 526, 12, '#90a4ae', null);
}

// ---- ⛄ 눈싸움: 좌우로 움직이며 눈덩이를 위로 던져 요정 돼지 맞히기 ----
// 요정 돼지 +1 (연속으로 맞히면 콤보 ×2 · ×3) · 황금 순록 +5 · 산타를 맞히면 -3 · 요정이 던진 눈덩이에 맞으면 잠깐 못 움직임
const SB_ROWS = [170, 250, 330];
let SB = null;
function startSnow() {
  SB = { t: 0, dur: 45 * 60, x: W / 2, vx: 0, face: 1, cd: 0, stun: 0, tg: [], balls: [], foe: [], deer: null, score: 0, combo: 0, maxCombo: 0, hits: 0, done: false, endT: 0, res: [], ch: withCos(getChar(sel.c1)) };
  parts = []; texts = []; mode = 7; scene = 'snowball'; SFX.confirm();
}
function snowSpawn() {
  const g = SB, fast = g.t / g.dur;
  if (g.tg.length < 3 + (fast * 3 | 0) && g.t % Math.max(16, 40 - (fast * 24 | 0)) === 0) {
    const row = Math.random() * 3 | 0, x = rand(110, W - 110);
    if (!g.tg.some(o => o.row === row && Math.abs(o.x - x) < 120)) g.tg.push({ row, x, vx: rand(-1.2, 1.2) * (1 + fast), up: 0, life: rand(90, 150) * (1 - fast * 0.35), santa: Math.random() < 0.16, hit: 0 });
  }
  if (!g.deer && g.t > 300 && g.t % 480 === 0) { const L = Math.random() < 0.5; g.deer = { x: L ? -60 : W + 60, vx: L ? 5.5 : -5.5, hit: 0 }; toast('✨ 황금 순록이 날아가요! +5'); }
}
function snowThrow(tx) {
  const g = SB; if (g.cd > 0 || g.stun > 0 || g.done) return;
  g.cd = 12; if (tx !== undefined) g.face = tx > g.x ? 1 : -1;
  const vx = tx === undefined ? g.vx * 0.15 : clamp((tx - g.x) / 40, -4, 4);
  g.balls.push({ x: g.x + g.face * 20, y: CATCH_Y - 70, vx, vy: -13 }); SFX.whiff();
}
function snowScore(n, x, y, msg, col) {
  const g = SB; if (n > 0) { g.combo++; g.maxCombo = Math.max(g.maxCombo, g.combo); g.hits++; } else g.combo = 0;
  const mul = n > 0 ? (g.combo >= 10 ? 3 : g.combo >= 5 ? 2 : 1) : 1, v = n * mul; g.score = Math.max(0, g.score + v);
  popText(x, y - 30, `${msg} ${v > 0 ? '+' : ''}${v}${mul > 1 ? ` (콤보 ×${mul})` : ''}`, col, mul > 1 ? 28 : 24);
}
function updateSnow() {
  const g = SB; if (!g) return openXmas();
  xmasSnowTick();
  if (g.done) {
    g.endT++;
    if (g.endT > 30 && (pressed.Enter || pressed.Space || pressed.KeyI)) { SB = null; mode = 1; openXmas(); }
    else if (g.endT > 30 && pressed.KeyR) startSnow();
    else if (pressed.Escape) { SB = null; mode = 1; openXmas(); }
    return;
  }
  if (pressed.Escape) { SB = null; mode = 1; openXmas(); toast('그만뒀어요 (보상 없음)'); return; }
  g.t++; if (g.cd > 0) g.cd--;
  const L = keys.KeyA || keys.ArrowLeft, R = keys.KeyD || keys.ArrowRight;
  if (g.stun > 0) { g.stun--; g.vx *= 0.8; }
  else { const want = (R ? 1 : 0) - (L ? 1 : 0); g.vx += (want * 8.5 - g.vx) * 0.35; if (want) g.face = want; }
  g.x = clamp(g.x + g.vx, 50, W - 50);
  if (keys.KeyI || keys.KeyO || keys.KeyK || keys.KeyL || keys.KeyJ || keys.Space || keys.KeyU) snowThrow();
  snowSpawn();
  for (let i = g.tg.length - 1; i >= 0; i--) {   // 요정·산타: 눈벽 뒤에서 올라왔다가 내려감
    const o = g.tg[i]; o.life--; o.up = o.hit ? Math.max(0, o.up - 0.12) : o.life > 0 ? Math.min(1, o.up + 0.08) : o.up - 0.08;
    o.x += o.vx; if (o.x < 90 || o.x > W - 90) o.vx *= -1;
    if (!o.hit && !o.santa && o.up >= 1 && Math.random() < 0.004 + g.t / g.dur * 0.006) g.foe.push({ x: o.x, y: SB_ROWS[o.row] - 30, vx: clamp((g.x - o.x) / 70, -5, 5), vy: -3 });   // 나한테 눈덩이 던짐
    if (o.up <= 0 && (o.life <= 0 || o.hit)) g.tg.splice(i, 1);
  }
  if (g.deer) { g.deer.x += g.deer.vx; if (g.deer.x < -80 || g.deer.x > W + 80) g.deer = null; }
  for (let i = g.balls.length - 1; i >= 0; i--) {   // 내 눈덩이
    const b = g.balls[i]; b.x += b.vx; b.y += b.vy; b.vy += 0.12; let hit = false;
    for (const o of g.tg) {
      if (o.hit || o.up < 0.5) continue;
      const hy = SB_ROWS[o.row] - 34 * o.up;
      if (Math.hypot(b.x - o.x, b.y - hy) < 32) {
        o.hit = 1; hit = true; burst(o.x, hy, 16, ['#fff', '#e3f2fd', '#b3e5fc'], 7);
        if (o.santa) { SFX.thud(); snowScore(-3, o.x, hy, '산타 맞힘!', '#ff8a80'); toast('🎅 산타는 맞히면 안 돼요!'); } else { SFX.punch(5); snowScore(1, o.x, hy, '철퍼덕!', '#fff'); }
        break;
      }
    }
    if (!hit && g.deer && !g.deer.hit && Math.hypot(b.x - g.deer.x, b.y - 90) < 40) { g.deer.hit = 1; hit = true; SFX.coin(); burst(g.deer.x, 90, 30, ['#ffd740', '#fff59d', '#fff'], 9); snowScore(5, g.deer.x, 110, '황금 순록!', '#ffd740'); g.deer.vx *= 2.2; }
    if (hit) { g.balls.splice(i, 1); continue; }
    if (b.y < -20 || b.x < -20 || b.x > W + 20) { g.balls.splice(i, 1); g.combo = 0; }   // 빗나가면 콤보 끊김
  }
  for (let i = g.foe.length - 1; i >= 0; i--) {   // 요정이 던진 눈덩이
    const b = g.foe[i]; b.x += b.vx; b.y += b.vy; b.vy += 0.16;
    if (g.stun <= 0 && Math.abs(b.x - g.x) < 40 && Math.abs(b.y - (CATCH_Y - 40)) < 40) { g.foe.splice(i, 1); g.stun = 45; g.combo = 0; SFX.thud(); popText(g.x, CATCH_Y - 90, '으악 차가워!', '#b3e5fc', 24); burst(g.x, CATCH_Y - 50, 18, ['#fff', '#e3f2fd'], 7); continue; }
    if (b.y > GROUND + 10) { burst(b.x, GROUND, 5, ['#fff'], 3); g.foe.splice(i, 1); }
  }
  if (g.t >= g.dur) snowFinish();
}
function snowFinish() {
  const g = SB; g.done = true; g.endT = 0;
  const n = g.score, d = Math.floor(n / 8), best = Math.max(lsGet('sgf_snowbest', 0), n);
  lsSet('sgf_snowbest', best); addDia(d);
  if (n >= 40) nqAdd('gift', 10);   // 40점 넘으면 크리스마스 퀘스트 선물 칸도 10개 채워 줌
  g.res = [`⛄ 점수 ${n}점 (최고 ${best}점) · 맞힌 수 ${g.hits} · 최대 콤보 ${g.maxCombo}`, `💎 다이아 +${d}  (8점마다 1개)`, n >= 40 ? '🎁 크리스마스 퀘스트 선물 +10!' : '40점 넘으면 크리스마스 퀘스트 선물 +10'];
  SFX.gong();
}
function drawElf(o) {
  const hy = SB_ROWS[o.row] - 34 * o.up, x = o.x;
  ctx.save(); ctx.beginPath(); ctx.rect(x - 60, 0, 120, SB_ROWS[o.row]); ctx.clip();   // 눈벽 뒤로 숨음
  ctx.translate(x, hy); if (o.hit) ctx.rotate(Math.sin(gT * 0.6) * 0.3);
  ctx.strokeStyle = '#5a1a2a'; ctx.lineWidth = 2;
  ctx.fillStyle = '#f8bbd0'; ctx.beginPath(); ctx.moveTo(-22, -14); ctx.lineTo(-28, -32); ctx.lineTo(-10, -22); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(22, -14); ctx.lineTo(28, -32); ctx.lineTo(10, -22); ctx.fill(); ctx.stroke();
  ell(0, 0, 26, 24); ctx.fill(); ctx.stroke();
  if (o.hit) { ctx.fillStyle = '#fff'; ell(-4, -6, 18, 12); ctx.fill(); txt('x x', 0, -2, 14, '#5a1a2a', null); }
  else { ctx.fillStyle = '#1a1a1a'; ell(-9, -4, 3.5, 4); ctx.fill(); ell(9, -4, 3.5, 4); ctx.fill(); }
  ctx.fillStyle = '#f06292'; ell(0, 8, 11, 8); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#5a1a2a'; ell(-4, 8, 2, 3); ctx.fill(); ell(4, 8, 2, 3); ctx.fill();
  if (o.santa) {   // 산타: 빨간 모자 + 흰 수염
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-24, 6); ctx.quadraticCurveTo(0, 46, 24, 6); ctx.fill();
    ctx.fillStyle = '#d32f2f'; ctx.beginPath(); ctx.moveTo(-24, -16); ctx.quadraticCurveTo(4, -64, 30, -40); ctx.lineTo(22, -16); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(-26, -20, 50, 8); ell(30, -40, 6, 6); ctx.fill();
  } else {   // 요정: 초록 뾰족 모자
    ctx.fillStyle = '#2e7d32'; ctx.beginPath(); ctx.moveTo(-22, -16); ctx.lineTo(-4, -60); ctx.lineTo(22, -16); ctx.fill(); ctx.fillStyle = '#ffd740'; ell(-4, -60, 5, 5); ctx.fill(); ctx.fillStyle = '#c62828'; ctx.fillRect(-23, -20, 46, 6);
  }
  ctx.restore();
}
function drawSnow() {
  const g = SB; if (!g) return;
  xmasBg();
  if (g.deer) {   // 황금 순록
    const d = g.deer, f = Math.sign(d.vx); ctx.save(); ctx.translate(d.x, 90 + Math.sin(gT * 0.2) * 6); ctx.scale(f, 1); ctx.shadowColor = '#ffd740'; ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffc400'; ell(0, 0, 30, 14); ctx.fill(); ell(28, -14, 11, 9); ctx.fill(); ctx.fillRect(-20, 8, 5, 18); ctx.fillRect(14, 8, 5, 18);
    ctx.strokeStyle = '#ffab00'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(26, -22); ctx.lineTo(20, -40); ctx.moveTo(22, -32); ctx.lineTo(12, -36); ctx.moveTo(32, -22); ctx.lineTo(38, -40); ctx.stroke();
    ctx.fillStyle = '#ff1744'; ell(39, -14, 4, 4); ctx.fill(); ctx.restore();
  }
  for (let r = 0; r < 3; r++) {   // 줄마다: 요정 → 그 앞 눈벽
    for (const o of g.tg) if (o.row === r) drawElf(o);
    const y = SB_ROWS[r]; ctx.fillStyle = r === 2 ? '#ffffff' : r === 1 ? '#eef4fb' : '#dde8f5';
    for (let x = 0; x < W + 60; x += 60) { ell(x, y + 10, 40, 20); ctx.fill(); }
    ctx.fillRect(0, y + 10, W, 18);
  }
  ctx.fillStyle = '#fff'; for (const b of g.balls) { ell(b.x, b.y, 9, 9); ctx.fill(); }
  ctx.fillStyle = '#e3f2fd'; ctx.strokeStyle = '#90caf9'; ctx.lineWidth = 2; for (const b of g.foe) { ell(b.x, b.y, 10, 10); ctx.fill(); ctx.stroke(); }
  const moving = Math.abs(g.vx) > 1;
  drawPig(g.x, GROUND, g.face, g.ch.look, { t: gT, scale: g.ch.scale * 0.9, hurt: g.stun > 0, victory: g.done, move: g.cd > 6 ? 'punch' : moving && !g.done ? 'walk' : undefined, k: g.cd > 6 ? 1 - (g.cd - 6) / 6 : (gT % 30) / 30 });
  if (g.stun > 0) txt('❄️', g.x, CATCH_Y - 120, 26, '#fff', null);
  drawParts();
  const left = Math.max(0, g.dur - g.t) / 60;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; rr(W / 2 - 160, 112, 320, 14, 7); ctx.fill(); ctx.fillStyle = left < 10 ? '#ff5252' : '#69f0ae'; rr(W / 2 - 158, 114, 316 * (left * 60 / g.dur), 10, 5); ctx.fill();
  txt(`⏰ ${Math.ceil(left)}초`, W / 2, 140, 16, '#fff', '#000', 4);
  txt(`⛄ ${g.score}`, 24, 70, 30, '#b3e5fc', '#000', 6, 'left');
  if (g.combo >= 2) txt(`🔥 ${g.combo} 콤보${g.combo >= 10 ? ' ×3' : g.combo >= 5 ? ' ×2' : ''}`, 24, 104, 18, g.combo >= 5 ? '#ffd740' : '#fff', '#000', 4, 'left');
  wBack(() => { pressed.Escape = true; });
  if (!g.done) addHot(0, 44, W, GROUND - 44, () => { snowThrow(tapXY[0]); });   // 화면을 탭하면 그쪽으로 던짐
  if (!g.done && g.t < 150) txt(TOUCH ? '조이스틱 이동 · 화면이나 공격 버튼을 누르면 던지기' : 'A/D 이동 · I/J/스페이스 던지기 · 🎅 산타는 맞히지 마세요!', W / 2, 200, 18, '#fff', '#000', 5);
  if (g.done) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; rr(W / 2 - 280, 170, 560, 200, 18); ctx.fill();
    txt('⛄ 눈싸움 끝!', W / 2, 210, 32, '#b3e5fc', '#000', 6);
    g.res.forEach((l, i) => txt(l, W / 2, 256 + i * 30, fitSize(l, 18, 520), '#fff', null));
    if (g.endT > 30) { txt('Enter: 크리스마스로 · R: 다시 하기', W / 2, 352, 13, '#bbb', null); addHot(W / 2 - 280, 170, 560, 200, () => { pressed.Enter = true; }); }
  }
}

// ---- 타이틀에 눈 내리기 (크리스마스 기간) ----
function xmasTitleFx() {
  if (!xmasOpen()) return;
  xmasSnowTick(); ctx.fillStyle = 'rgba(255,255,255,0.85)'; for (const s of XM.snow) { ell(s[0], s[1], s[2], s[2]); ctx.fill(); }
}
