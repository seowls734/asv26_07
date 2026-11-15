// ================= ⚾ 대규모 업데이트 · 야구장: 홈런 더비 (야구돈) =================
// 야구돈이 타석에 서서 공을 침. 타이밍 맞춰 스윙 → 홈런! · 아웃 10개면 끝
// 직구·커브(뚝 떨어짐)·체인지업(느림)·강속구 · 높은 '볼'은 참으면 그냥 넘어감(치면 아웃) · ✨ 황금 공 홈런 +3
// 홈런 3연속이면 🔥 피버: 맞히는 범위가 넓어지고 홈런 점수 2배 (아웃 되면 끝)
// 공개(big8)된 뒤 월드 목록에 나옴 · 테스트 계정은 늘 보임
const DB_HOME = 300, DB_Y = GROUND - 82, DB_OUTS = 10;
const DB_PITCH = [['직구', -11, 0], ['커브', -8.5, 1], ['체인지업', -6.2, 0], ['강속구', -14, 0]];
let DB = null;
function startDerby() {
  DB = { t: 0, hr: 0, pts: 0, outs: 0, streak: 0, fever: false, best: 0, ball: null, fly: null, wait: 50, swingT: 0, msg: '', msgC: '#fff', msgT: 0, done: false, endT: 0, res: [], n: 0,
    ch: withCos(CHARS.find(c => c.name === '야구돈') || CHARS[0]), pit: CHARS[Math.random() * 12 | 0], crowd: Array.from({ length: 160 }, (_, i) => [i * 6.1 % W, 150 + (i * 37 % 60), ['#ef5350', '#42a5f5', '#ffee58', '#fff', '#66bb6a'][i % 5]]) };
  parts = []; texts = []; mode = 7; scene = 'derby'; SFX.confirm();
}
function dbMsg(s, c, t = 70) { DB.msg = s; DB.msgC = c; DB.msgT = t; }
function dbPitch() {   // 투수가 공을 던짐
  const g = DB, fast = Math.min(1, g.n / 25), r = Math.random();
  const k = r < 0.15 + fast * 0.15 ? 3 : r < 0.45 ? 0 : r < 0.72 ? 1 : 2, P = DB_PITCH[k];
  const ballHigh = !g.fever && Math.random() < 0.16;   // 볼: 너무 높음 → 참기
  g.ball = { x: 735, y: GROUND - 118, vx: P[1] * (1 + fast * 0.15), name: P[0], curve: P[2], high: ballHigh, gold: Math.random() < 0.08, t: 0 };
  g.n++;
}
function dbBallY(b) {   // 홈 쪽으로 오면서 높이가 바뀜 (커브는 마지막에 뚝)
  const p = clamp((735 - b.x) / (735 - DB_HOME)), base = GROUND - 118 + (DB_Y - (GROUND - 118)) * p;
  return base + (b.curve ? Math.pow(p, 3) * 30 - 18 * p : 0) + (b.high ? -70 * p : 0);
}
function dbOut(why) {
  const g = DB; g.outs++; g.streak = 0; if (g.fever) { g.fever = false; why += ' · 피버 끝'; }
  dbMsg(`아웃! ${why}`, '#ff8a80'); SFX.thud();
  if (g.outs >= DB_OUTS) dbFinish();
}
function dbSwing() {
  const g = DB; if (g.swingT > 0 || g.done || g.fly) return;
  g.swingT = 14; SFX.whiff();
  const b = g.ball; if (!b || b.swung) return; b.swung = true;
  const d = Math.abs(b.x - DB_HOME), zone = g.fever ? 70 : 46;
  if (d > zone) return;   // 헛스윙은 공이 지나간 뒤 판정
  const y = dbBallY(b); g.ball = null;
  if (b.high) { g.fly = { x: DB_HOME, y, vx: -3, vy: -12, hr: false, t: 0 }; dbOut('높은 볼을 쳐서 파울 플라이'); return; }
  if (d < zone * 0.57) {   // 홈런!
    const perfect = d < zone * 0.26, dist = Math.round((perfect ? 140 : 105) + (1 - d / zone) * 25 + rand(0, 8));
    g.streak++; const pts = (b.gold ? 3 : 1) * (g.fever ? 2 : 1); g.hr++; g.pts += pts; g.best = Math.max(g.best, dist);
    if (g.streak === 3 && !g.fever) { g.fever = true; toast('🔥 3연속 홈런! 피버 타임 (점수 2배)'); }
    g.fly = { x: DB_HOME + 20, y, vx: 10 + (perfect ? 5 : 2), vy: -(11 + (perfect ? 4 : 1)), hr: true, gold: b.gold, t: 0 };
    dbMsg(`${perfect ? '💥 장외 ' : ''}${dist}m 홈런!!${pts > 1 ? ` +${pts}` : ''}`, b.gold ? '#ffd740' : '#fff59d', 80);
    SFX.heavy(18); SFX.coin(); burst(DB_HOME + 20, y, 30, b.gold ? ['#ffd740', '#fff'] : ['#fff', '#ffe082', '#90caf9'], 12);
    return;
  }
  g.fly = { x: DB_HOME, y, vx: 8, vy: -4, hr: false, t: 0 };   // 빗맞음
  dbOut(Math.random() < 0.5 ? '평범한 뜬공' : '땅볼');
}
function updateDerby() {
  const g = DB; if (!g) return openWorlds();
  g.t++; if (g.swingT > 0) g.swingT--; if (g.msgT > 0) g.msgT--;
  if (g.done) {
    g.endT++;
    if (g.endT > 30 && (pressed.Enter || pressed.Space || pressed.KeyI)) { DB = null; mode = 1; openWorlds(); }
    else if (g.endT > 30 && pressed.KeyR) startDerby();
    else if (pressed.Escape) { DB = null; mode = 1; openWorlds(); }
    return;
  }
  if (pressed.Escape) { DB = null; mode = 1; openWorlds(); toast('그만뒀어요 (보상 없음)'); return; }
  if (['KeyI', 'KeyO', 'KeyK', 'KeyL', 'KeyJ', 'KeyU', 'Space', 'Enter'].some(k => pressed[k])) dbSwing();
  if (g.fly) {   // 친 공 날아감
    const f = g.fly; f.x += f.vx; f.y += f.vy; f.vy += f.hr ? 0.22 : 0.45; f.t++;
    if (f.hr && f.t % 2 === 0) parts.push({ x: f.x, y: f.y, vx: 0, vy: 0, life: 18, max: 18, c: f.gold ? '#ffd740' : '#fff', s: 4, g: 0, type: 'dot', glow: true });
    if (f.hr && f.t === 40) for (let i = 0; i < 3; i++) burst(rand(200, 760), rand(60, 140), 26, [['#ff5252', '#ffd740', '#69f0ae', '#40c4ff'][i], '#fff'], 9);   // 폭죽
    if (f.t > 70 || (!f.hr && f.y > GROUND)) { g.fly = null; g.wait = 30; }
  } else if (g.ball) {   // 오는 공
    const b = g.ball; b.x += g.fever ? b.vx * 0.85 : b.vx; b.t++;
    if (b.x < DB_HOME - 80) {
      g.ball = null; g.wait = 30;
      if (b.swung) dbOut('헛스윙 삼진');
      else if (b.high) { dbMsg('볼! 잘 참았어요 👍', '#b3e5fc', 50); SFX.select(); }
      else dbOut('스트라이크 (안 쳤어요)');
    }
  } else if (--g.wait <= 0 && !g.done) dbPitch();
}
function dbFinish() {
  const g = DB; g.done = true; g.endT = 0; g.ball = null;
  const best = Math.max(lsGet('sgf_hrbest', 0), g.pts), d = Math.floor(g.pts / 2), c = rwBase() * g.pts;
  lsSet('sgf_hrbest', best); lsSet('sgf_hrlong', Math.max(lsGet('sgf_hrlong', 0), g.best)); addDia(d); addCoins(c);
  g.res = [`⚾ 홈런 ${g.hr}개 · 점수 ${g.pts}점 (최고 ${best}점)`, `제일 멀리 ${g.best}m (기록 ${lsGet('sgf_hrlong', 0)}m)`, `💎 +${d} · 🪙 +${fmtN(c)}`];
  SFX.gong();
}
function drawDerbyBg() {
  const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0d1b3a'); gr.addColorStop(1, '#1b3a6b'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 4; i++) { const x = 120 + i * 240; ctx.fillStyle = '#455a64'; ctx.fillRect(x - 3, 20, 6, 110); ctx.fillStyle = '#fffde7'; ctx.shadowColor = '#fff59d'; ctx.shadowBlur = 25; rr(x - 26, 12, 52, 20, 4); ctx.fill(); ctx.shadowBlur = 0; }   // 조명탑
  ctx.fillStyle = '#263238'; ctx.fillRect(0, 140, W, 80);   // 관중석
  for (const [x, y, c] of DB.crowd) { const jump = DB.fly && DB.fly.hr ? Math.abs(Math.sin(gT * 0.4 + x)) * 6 : Math.sin(gT * 0.05 + x) > 0.97 ? 3 : 0; ctx.fillStyle = c; ell(x, y - jump, 3.5, 3.5); ctx.fill(); }
  ctx.fillStyle = '#1b5e20'; ctx.fillRect(0, 214, W, 18); txt('⚾ 꿀꿀 야구장 · 홈런 더비', W / 2, 223, 13, '#fff', null);   // 펜스
  ctx.fillStyle = '#2e7d32'; ctx.fillRect(0, 232, W, GROUND - 232);
  ctx.fillStyle = '#388e3c'; for (let i = 0; i < 10; i++) ctx.fillRect(i * 96, 232, 48, GROUND - 232);   // 잔디 줄무늬
  ctx.fillStyle = '#a1887f'; ell(DB_HOME, GROUND + 4, 150, 26); ctx.fill(); ell(760, GROUND - 4, 90, 18); ctx.fill();   // 흙 (홈 · 마운드)
  ctx.fillStyle = '#8d6e63'; ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(DB_HOME - 18, GROUND); ctx.lineTo(DB_HOME + 18, GROUND); ctx.lineTo(DB_HOME + 18, GROUND + 6); ctx.lineTo(DB_HOME, GROUND + 12); ctx.lineTo(DB_HOME - 18, GROUND + 6); ctx.fill();   // 홈 플레이트
}
function drawDerby() {
  const g = DB; if (!g) return;
  drawDerbyBg();
  const wind = g.ball ? 0 : g.wait < 25 && !g.fly ? 1 - g.wait / 25 : 0;   // 투수 와인드업
  drawPig(760, GROUND - 6, -1, g.pit.look, { t: gT, scale: g.pit.scale * 0.75, move: wind > 0 || (g.ball && g.ball.t < 8) ? 'punch' : undefined, k: g.ball ? 1 : wind });
  if (g.fever) { ctx.fillStyle = `rgba(255,109,0,${0.15 + Math.sin(gT * 0.2) * 0.08})`; ell(DB_HOME, DB_Y, 70, 70); ctx.fill(); }
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.strokeRect(DB_HOME - 26, DB_Y - 40, 52, 70); ctx.setLineDash([]);   // 스트라이크 존
  drawPig(DB_HOME - 70, GROUND, 1, g.ch.look, { t: gT, scale: g.ch.scale, move: 'punch', k: g.swingT > 0 ? 1 - g.swingT / 14 : 0.05, wpnOut: true, victory: g.done && g.pts > 0 });
  if (g.ball) {
    const b = g.ball, y = dbBallY(b);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ell(b.x, GROUND - 2, 8, 3); ctx.fill();
    if (b.gold) { ctx.shadowColor = '#ffd740'; ctx.shadowBlur = 18; }
    ctx.fillStyle = b.gold ? '#ffd740' : '#fff'; ell(b.x, y, 8, 8); ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = '#e53935'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(b.x - 3, y, 6, -1, 1); ctx.stroke(); ctx.beginPath(); ctx.arc(b.x + 3, y, 6, 2.1, 4.2); ctx.stroke();
    if (b.t < 30) txt(b.high ? '높다! 참아요' : b.name, 735, GROUND - 160, 15, b.high ? '#ff8a80' : '#fff', '#000', 4);
  }
  if (g.fly) { const f = g.fly; ctx.fillStyle = f.gold ? '#ffd740' : '#fff'; ell(f.x, f.y, 8, 8); ctx.fill(); }
  drawParts();
  txt(`⚾ 홈런 ${g.hr}  ·  점수 ${g.pts}`, 24, 70, 24, '#ffe082', '#000', 5, 'left');
  for (let i = 0; i < DB_OUTS; i++) { ctx.fillStyle = i < g.outs ? '#ff5252' : 'rgba(255,255,255,0.25)'; ell(W - 230 + i * 21, 70, 8, 8); ctx.fill(); }
  txt('아웃', W - 250, 70, 14, '#fff', '#000', 3, 'right');
  if (g.fever) txt(`🔥 피버! 점수 2배 · ${g.streak}연속 홈런`, W / 2, 112, 20, gT % 20 < 10 ? '#ff9100' : '#ffd740', '#000', 5);
  else if (g.streak >= 1) txt(`${g.streak}연속 홈런 · 3연속이면 피버!`, W / 2, 112, 15, '#fff', '#000', 4);
  if (g.msgT > 0) { const s = 1 + Math.max(0, g.msgT - 60) * 0.03; txt(g.msg, W / 2, 290, fitSize(g.msg, 34 * s, 700), g.msgC, '#000', 7); }
  wBack(() => { pressed.Escape = true; });
  if (!g.done) addHot(0, 44, W, H - 44, () => { dbSwing(); });   // 화면을 탭하면 스윙
  if (!g.done && g.n <= 1) txt(TOUCH ? '공이 점선 칸에 오면 화면을 탭! (높은 공은 참기)' : '공이 점선 칸에 오면 스페이스/I! (높은 공은 참기)', W / 2, 150, 18, '#fff', '#000', 5);
  if (g.done) {
    ctx.fillStyle = 'rgba(0,0,0,0.78)'; rr(W / 2 - 280, 170, 560, 200, 18); ctx.fill();
    txt('⚾ 홈런 더비 끝!', W / 2, 210, 32, '#ffe082', '#000', 6);
    g.res.forEach((l, i) => txt(l, W / 2, 256 + i * 30, fitSize(l, 18, 520), '#fff', null));
    if (g.endT > 30) { txt('Enter: 월드로 · R: 다시 하기', W / 2, 352, 13, '#bbb', null); addHot(W / 2 - 280, 170, 560, 200, () => { pressed.Enter = true; }); }
  }
}
