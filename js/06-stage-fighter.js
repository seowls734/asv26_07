// ================= pork belly =================
const RAW = { meat: [236, 112, 124], fat: [253, 238, 232], skin: [244, 186, 176] };
const COOK = { meat: [156, 78, 38], fat: [238, 188, 104], skin: [184, 108, 40] };
const mixC = (a, b, k) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})`;
function drawStrip(x, y, w, h, cook, marks) {
  cook = clamp(cook);
  const r = Math.min(10, h * 0.25, w * 0.25);
  ctx.save(); rr(x, y, w, h, r); ctx.clip();
  const layers = [['skin', 0.1], ['fat', 0.22], ['meat', 0.24], ['fat', 0.14], ['meat', 0.3]];
  let yy = y;
  for (const [k, f] of layers) {
    ctx.fillStyle = mixC(RAW[k], COOK[k], cook);
    ctx.beginPath(); ctx.moveTo(x, yy);
    for (let xx = 0; xx <= w + 8; xx += 8) ctx.lineTo(x + xx, yy + Math.sin((x + xx) * 0.06 + yy) * h * 0.03);
    ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
    yy += h * f;
  }
  if (marks > 0) {
    ctx.strokeStyle = `rgba(50,20,5,${0.55 * marks})`; ctx.lineWidth = Math.max(3, h * 0.12);
    for (let xx = x - h; xx < x + w; xx += 26) line(xx, y + h, xx + h * 0.8, y);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x, y, w, h * 0.12);
  if (cook > 0.3) { ctx.fillStyle = 'rgba(255,255,230,0.5)'; for (let i = 0; i < w / 40; i++) { ell(x + 12 + i * 40, y + h * 0.45 + (i % 2) * h * 0.2, 3, 1.6); ctx.fill(); } }
  ctx.restore();
  ctx.strokeStyle = mixC([200, 90, 100], [90, 45, 20], cook); ctx.lineWidth = 2;
  rr(x, y, w, h, r); ctx.stroke();
}

// ================= stage: 포장마차 철판 =================
const BG_RES = 2;   // 배경은 2배 해상도로 만들어 두고 W×H로 줄여 그림 (고해상도 화면에서 선명)
const bgC = document.createElement("canvas"); bgC.width = W * BG_RES; bgC.height = H * BG_RES;
(function buildBg() {
  const g = bgC.getContext("2d"); g.scale(BG_RES, BG_RES);
  let gr = g.createLinearGradient(0, 0, 0, GROUND);
  gr.addColorStop(0, '#140c2c'); gr.addColorStop(0.6, '#3d2352'); gr.addColorStop(1, '#6e3346');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = '#fff';
  for (let i = 0; i < 60; i++) { g.globalAlpha = Math.random() * 0.7 + 0.2; g.fillRect(Math.random() * W, Math.random() * 200, 2, 2); }
  g.globalAlpha = 1;
  // city
  for (let x = 0; x < W; x += 50) {
    const h = 80 + (Math.sin(x * 0.13) * 0.5 + 0.5) * 120 + (x % 3) * 15;
    g.fillStyle = '#21152f'; g.fillRect(x, 330 - h, 46, h + 40);
    g.fillStyle = 'rgba(255,214,120,0.6)';
    for (let wy = 340 - h; wy < 320; wy += 18) for (let wx = x + 6; wx < x + 40; wx += 12) if (Math.sin(wx * 7.3 + wy * 3.1) > 0.3) g.fillRect(wx, wy, 6, 8);
  }
  // tent
  g.fillStyle = '#c62828'; g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W, 60);
  for (let x = W; x >= 0; x -= 60) g.quadraticCurveTo(x - 30, 90, x - 60, 60);
  g.closePath(); g.fill();
  g.fillStyle = '#ef5350'; for (let x = 0; x < W; x += 120) g.fillRect(x, 0, 60, 62);
  // string lights
  g.strokeStyle = '#333'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 100); g.quadraticCurveTo(W / 2, 150, W, 100); g.stroke();
  for (let x = 20; x < W; x += 40) {
    const t = x / W, y = (1 - t) * (1 - t) * 100 + 2 * (1 - t) * t * 150 + t * t * 100 + 8;
    const rg = g.createRadialGradient(x, y, 1, x, y, 22); rg.addColorStop(0, 'rgba(255,230,140,0.9)'); rg.addColorStop(1, 'rgba(255,200,80,0)');
    g.fillStyle = rg; g.beginPath(); g.arc(x, y, 22, 0, 7); g.fill();
    g.fillStyle = '#fff3b0'; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill();
  }
  // neon sign
  g.save(); g.shadowColor = '#ff4081'; g.shadowBlur = 20; g.fillStyle = '#ff80ab';
  g.font = `900 46px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('꿀꿀 포차', W / 2, 210);
  g.shadowColor = '#40c4ff'; g.fillStyle = '#80d8ff'; g.font = `900 18px ${FONT}`; g.fillText('철판 대난투 · 24시', W / 2, 250); g.restore();
  bgC._back = document.createElement('canvas'); bgC._back.width = W * BG_RES; bgC._back.height = H * BG_RES; bgC._back.getContext("2d").drawImage(bgC, 0, 0);
  // crowd
  for (let i = 0; i < 22; i++) {
    const x = 20 + i * 44 + Math.sin(i * 3) * 8, y = 360 + (i % 2) * 8;
    g.fillStyle = i % 3 ? '#2a1d38' : '#33244a';
    g.beginPath(); g.arc(x, y, 20, 0, 7); g.fill();
    g.beginPath(); g.moveTo(x - 16, y - 10); g.lineTo(x - 12, y - 30); g.lineTo(x - 4, y - 16); g.fill();
    g.beginPath(); g.moveTo(x + 16, y - 10); g.lineTo(x + 12, y - 30); g.lineTo(x + 4, y - 16); g.fill();
    g.fillStyle = 'rgba(255,170,190,0.25)'; g.beginPath(); g.ellipse(x + 2, y + 6, 8, 6, 0, 0, 7); g.fill();
  }
  // counter (전경 레이어에도 따로)
  bgC._front = document.createElement('canvas'); bgC._front.width = W * BG_RES; bgC._front.height = H * BG_RES; bgC._front.getContext("2d").scale(BG_RES, BG_RES);
  for (const gg of [g, bgC._front.getContext('2d')]) {
    gg.fillStyle = '#4e342e'; gg.fillRect(0, 378, W, 60);
    gg.fillStyle = '#6d4c41'; gg.fillRect(0, 378, W, 8);
    for (let x = 40; x < W; x += 110) {
      gg.fillStyle = 'rgba(46,125,50,0.85)'; gg.fillRect(x, 352, 14, 30); gg.fillRect(x + 4, 340, 6, 14);
      gg.fillStyle = '#eee'; gg.beginPath(); gg.ellipse(x + 40, 380, 22, 6, 0, 0, 7); gg.fill();
    }
  }
})();

const temps = new Array(8).fill(0);
let flareI = -1, flareT = 0, flareNext = 0;
function tileOf(x) { return clamp(Math.floor(x / 120), 0, 7); }
function updateFloor() {
  const s = (ROUND_T - timer) / 60;
  if (s >= 12 && --flareNext <= 0) { flareI = 1 + (srnd() * 6 | 0); flareT = 240; flareNext = 480; }   // (불길 이동 글씨는 뺐음)
  if (flareT > 0) flareT--;
  for (let i = 0; i < 8; i++) {
    const e = Math.abs(i - 3.5);
    const tg = clamp((s / 60) * 85 * (0.3 + e / 3.5 * 0.7) + (e >= 3 && s > 15 ? 25 : 0) + (i === flareI && flareT > 0 ? 65 : 0), 0, 100);
    temps[i] += (tg - temps[i]) * 0.02;
    if (temps[i] > 65 && Math.random() < temps[i] / 1500) smoke(i * 120 + rand(10, 110), GROUND - 20);
  }
  for (const f of [p1, p2]) {
    if (f.state === 'ko' || f.y < GROUND - 2 || scene !== 'fight') continue;
    const tp = temps[tileOf(f.x)];
    if (tp >= 70) {
      f.hp = Math.max(0, f.hp - (tp - 60) / 40 * 0.06);
      f.stamina = Math.max(0, f.stamina - 0.08);
      if (f.hotT++ % 40 === 0) { SFX.hot(); burst(f.x, GROUND - 2, 5, ['#ffab40', '#fff176'], 4); }
      if (f.hp <= 0) {
        f.state = 'ko'; f.koT = 0; f.vy = -12; f.vx = 0; hitstop = 20; shake = 12;
        SFX.ko(); setTimeout(SFX.squeal, 250);
        // (바싹 익음 글씨는 뺐음)
        endRound(f.opp, 'K.O.!!');
      }
    } else f.hotT = 0;
  }
}
function drawFloor() {
  for (let i = 0; i < 8; i++) {
    const tp = temps[i] / 100;
    ctx.fillStyle = mixC([58, 56, 62], [220, 70, 25], clamp(tp * 1.1));
    ctx.fillRect(i * 120, GROUND - 28, 120, H - GROUND + 28);
    if (tp > 0.6) {
      ctx.fillStyle = `rgba(255,200,80,${(tp - 0.6) * 0.9 * (0.7 + 0.3 * Math.sin(gT * 0.2 + i))})`;
      ctx.fillRect(i * 120, GROUND - 28, 120, H - GROUND + 28);
      ctx.strokeStyle = `rgba(255,180,120,${(tp - 0.6) * 0.6})`; ctx.lineWidth = 2;
      for (let j = 0; j < 3; j++) {
        const bx = i * 120 + 20 + j * 40, ph = gT * 0.08 + j * 2 + i;
        ctx.beginPath(); ctx.moveTo(bx, GROUND - 30);
        for (let yy = 0; yy < 60; yy += 6) ctx.lineTo(bx + Math.sin(ph + yy * 0.15) * 5, GROUND - 30 - yy);
        ctx.stroke();
      }
    }
    if (tp >= 0.7) txt('🔥', i * 120 + 60, H - 14, 16, '#fff', null);
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 4;
  for (let y = GROUND - 18; y < H; y += 14) line(0, y, W, y);
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 2;
  for (let i = 1; i < 8; i++) line(i * 120, GROUND - 28, i * 120, H);
  ctx.fillStyle = '#1b1b1b'; ctx.fillRect(0, GROUND - 32, W, 5);
}

// ================= fighter =================
class Fighter {
  constructor(id) { this.id = id; this.wins = 0; this.meter = 0; this.tfG = 0; this.cpuLv = 0; this.ai = { think: 0, move: 0, guard: 0, low: false }; }
  setChar(ch) { this.ch = ch; this.C = ch.look; this.base = ch.name; }
  newMatch() { this.wins = 0; this.meter = 0; this.tfG = 0; this.stats = { maxCombo: 0, parries: 0, parts: 0, minHpRatio: 1, ultFinish: false, hits: 0 }; }
  reset() {
    this.x = this.id === 0 ? 240 : 720; this.y = GROUND; this.vx = 0; this.vy = 0; this.facing = this.id === 0 ? 1 : -1;
    this.maxHp = Math.round(this.ch.hp * (1 + Math.min(0.35, 0.025 * this.cpuLv)) * (this.hpMul || 1)); this.hp = this.maxHp; this.dispHp = this.maxHp;
    this.scaleSh = false;
    this.state = 'idle'; this.stun = 0; this.atk = null; this.af = 0; this.atkHit = false; this.hitsDone = 0; this.lastHitF = 0; this.chain = 0; this.cbuf = null; this.mot = null;
    this.flash = 0; this.t = 0; this.koT = 0; this.combo = 0; this.comboT = 0; this.skillCD = 0;
    this.tfOn = false; this.tfT = 0; this.stamina = 100;
    this.parts = { head: 40, belly: 40, legs: 40 }; this.broken = { head: false, belly: false, legs: false };
    this.weapon = null; this.throwKind = 'head'; this.burnT = 0; this.slowT = 0; this.parryT = 0; this.parryCD = 0;
    this.juggle = 0; this.downT = 0; this.launched = false; this.blockLow = false;
    this.uT = 0; this.ultHit = false; this.ultInv = false; this.ultArmor = false; this.landed = false; this.beamT = 0;
    this.grabT = 0; this.mashN = 0; this.cloneQ = []; this.sandT = 0; this.cyberT = 0; this.foxT = 0; this.curseT = 0; this.lateQ = null; this.frogT = 0; this.giantT = 0; this.trail = []; this.invT = 0; this.hotT = 0; this.cmdT = 0; this.drunkT = 0;
    Object.assign(this.ai, { think: 0, move: 0, guard: 0, low: false });
  }
  get sc() { return this.ch.scale * (this.tfIs('giant') ? 1.3 : 1) * (this.cyberT > 0 ? 1.35 : 1) * (this.giantT > 0 ? 1.5 : 1) * (this.frogT > 0 ? 0.68 : 1); }
  tfIs(t) { return this.tfOn && this.ch.tf.type === t; }
  crouching() {
    const s = this.state;
    return s === 'crouch' || s === 'cblock' || (s === 'blockstun' && this.blockLow) || (s === 'attack' && (!!this.atk.crouch || this.atk.pose === 'roll'));
  }
  speedMul() { let m = this.ch.speed; if (this.sandT > 0) m *= 1.3; if (this.foxT > 0) m *= 1.3; if (this.cyberT > 0) m *= 1.1; if (this.curseT > 0) m *= 1.15; if (this.frogT > 0) m *= 0.7; if (this.tfIs('wild')) m *= 1.4; if (this.tfIs('thaw')) m *= 1.15; if (this.tfIs('shadow')) m *= 1.2; if (this.tfIs('stone')) m *= 0.8; if (this.tfIs('giant')) m *= 0.85; if (this.slowT > 0) m *= 0.6; if (this.stamina < 35) m *= 0.75; return m; }
  atkSpeedMul(isPunch) { let m = 1; if (this.tfIs('wild')) m *= 0.7; if (this.tfIs('champion') && isPunch) m *= 0.7; if (this.slowT > 0) m *= 1.25; if (this.stamina < 35) m *= 1.25; return m; }
  dmgMul(kind) {
    let m = this.ch.power * (this.condDmg || 1);   // condDmg: AI 베팅 컨디션
    if (this.tfIs('fire')) m *= 1.25; if (this.tfIs('giant')) m *= 1.15; if (this.tfIs('spicy')) m *= 1.1; if (this.tfIs('gilded')) m *= 1.2;
    if (this.tfIs('champion') && kind === 'punch') m *= 1.4; if (this.tfIs('ironHoof') && kind === 'kick') m *= 1.5;
    if (this.weapon && (kind === 'punch' || kind === 'kick')) m *= 1.25;
    if (this.drunkT > 0) m *= 1.25;
    if (this.cyberT > 0) m *= 1.3; if (this.foxT > 0) m *= 1.35; if (this.curseT > 0) m *= 1.4; if (this.awk && AWAKE[this.ch.name]) m *= AWAKE[this.ch.name].power; if (this.giantT > 0) m *= 1.4; if (this.frogT > 0) m *= 0.6; if (this.lvMul) m *= this.lvMul;
    return m * (1 + Math.min(0.25, 0.02 * this.cpuLv));
  }
  defMul() { let m = this.cyberT > 0 ? 0.7 : 1; if (this.tfIs('stone')) m *= 0.6; if (this.tfIs('giant')) m *= 0.85; return m; }
  armored(dmg) {
    return this.tfIs('stone') || (this.tfIs('giant') && dmg < 8) || (this.cyberT > 0 && dmg < 10) || (this.giantT > 0 && dmg < 12) ||
      (this.state === 'attack' && this.atk.armor && this.af < this.atk.startup + this.atk.active) || (this.state === 'ult' && this.ultArmor);
  }
  update(inp, o) {
    this.t++;
    if (!inp.bot) inp = readMotion(this, inp);   // 커맨드 입력(↓→ 등 + 공격)을 스킬·업어치기·필살기·변신으로
    this.inp = inp;   // 스킬 고르기(↓+U · →+U)에 씀
    itUpdate(this);   // 이타돼리: 늦게 터지는 주먹 · 저주왕 칼날
    bigUpdate(this);
    big2Update(this);
    nxRunTick(this);   // 소환형 필살기 진행
    if (this.sandT > 0) { this.sandT--; this.trail.unshift([this.x, this.y]); if (this.trail.length > 10) this.trail.pop(); } else if (this.trail.length) this.trail = [];
    if (this.cyberT > 0 && --this.cyberT === 0) popText(this.x, this.y - 200, '슈트 해제', '#ccc', 20);
    if (this.foxT > 0) { this.foxT--; if (this.state !== 'ko' && this.hp > 0) this.hp = Math.min(this.maxHp, this.hp + 0.02); }
    if (this.flash > 0) this.flash--; if (this.comboT > 0) this.comboT--; if (this.skillCD > 0) this.skillCD--;
    if (this.parryT > 0) this.parryT--; if (this.parryCD > 0) this.parryCD--; if (this.invT > 0) this.invT--;
    if (this.slowT > 0) this.slowT--; if (this.beamT > 0) this.beamT--;
    if (this.cmdT > 0) this.cmdT--; if (this.drunkT > 0) this.drunkT--;
    if (inp.adCmd && this.state !== 'ko') { this.cmdT = 45; if (this.meter >= 100) popText(this.x, this.y - 200 * this.sc / 1.15, '필살 준비! K+O', '#ffd54f', 20); }
    if (this.dispHp > this.hp) this.dispHp = Math.max(this.hp, this.dispHp - 0.6);
    if (this.weapon && --this.weapon.t <= 0) this.weapon = null;
    if (this.state !== 'ko') {
      if (this.burnT > 0) { this.burnT--; this.hp = Math.max(1, this.hp - 2 / 60); if (this.t % 5 === 0) flame(this.x + rand(-30, 30), this.y - rand(30, 110) * this.sc / 1.15); }
      if (this.state !== 'grabbed') this.stamina = Math.min(100, this.stamina + 0.12);
      if (this.tfIs('thaw') && this.hp > 0) this.hp = Math.min(this.maxHp, this.hp + 0.035);   // 급속 해동: 체력 서서히 회복 (변신 8초 동안 약 17)
      if (this.tfOn && --this.tfT <= 0) { this.tfOn = false; popText(this.x, this.y - 180, '변신 해제', '#ccc', 20); }
    }
    for (const q of this.cloneQ) q.t--;
    while (this.cloneQ.length && this.cloneQ[0].t <= 0) {
      const q = this.cloneQ.shift();
      if (scene === 'fight' && (o.state === 'hit' || o.y < GROUND - 5))
        dealHit(this, o, { dmg: q.dmg, height: 'mid', kb: 2, stun: 12, src: this.x, kind: 'skill', clone: true, noPart: true, txt: q.arm ? ['팔 하나 더!', '퍽!'] : ['분신!'], hitstop: 2 });
    }
    switch (this.state) {
      case 'ko': this.koT++; break;
      case 'hit': if (--this.stun <= 0 && !this.launched) this.state = 'idle'; break;
      case 'blockstun': if (--this.stun <= 0) this.state = this.blockLow ? 'crouch' : 'idle'; break;
      case 'parried': if (--this.stun <= 0) this.state = 'idle'; break;
      case 'down': if (--this.downT <= 0) { this.state = 'idle'; this.invT = 24; } break;
      case 'transforming': if (++this.af >= 30) this.state = 'idle'; break;
      case 'grabbed': if (o.state !== 'grabbing') { this.state = 'hit'; this.stun = 10; } break;
      case 'locked': if (o.state !== 'ult') { this.state = 'hit'; this.stun = 10; this.launched = this.y < GROUND - 2; } break;
      case 'grabbing': grabUpdate(this, o, inp); break;
      case 'ult': ultUpdate(this, o); break;
      case 'attack': attackUpdate(this, o, inp); break;
      default: freeUpdate(this, o, inp);
    }
    if (this.state !== 'grabbed' && this.state !== 'locked') {
      this.vy += GRAV; this.y += this.vy;
      if (this.y >= GROUND) {
        if (this.state === 'ko' && this.vy > 5) { burst(this.x, GROUND, 8, ['#a07850', '#c8a070'], 5); this.vy = -this.vy * 0.3; this.y = GROUND; }
        else {
          this.y = GROUND;
          if (this.state === 'hit' && this.launched) { this.state = 'down'; this.downT = 40; this.launched = false; burst(this.x, GROUND, 10, ['#888', '#bbb'], 5); SFX.thud(); }
          this.vy = 0;
        }
        this.juggle = 0;
        if (this.state === 'jump') this.state = 'idle';
      }
      if (this.y >= GROUND && ['hit', 'blockstun', 'ko', 'attack', 'down', 'parried', 'ult', 'transforming', 'grabbing'].includes(this.state)) this.vx *= 0.82;
      this.x = clamp(this.x + this.vx, 50, W - 50);
    }
  }
}
const p1 = new Fighter(0), p2 = new Fighter(1);
p1.opp = p2; p2.opp = p1;
p1.setChar(CHARS[0]); p2.setChar(CHARS[1]);

// ---- 커맨드 입력 (모바일은 공격 버튼 4개뿐이라 이걸로, PC에서도 됨) ----
//   ↓→ + 공격 = 스킬 · ↓← + 공격 = 업어치기 · →→ + 공격 = 필살기   (→ = 상대 쪽)
// 방향을 새로 누른 순간만 기록 → 두 방향 사이 24프레임, 마지막 방향 뒤 16프레임 안에 공격 버튼
// 게임 입력(inp)과 프레임 번호만 써서 계산 → 온라인 두 화면에서도 똑같이 판정됨
function readMotion(f, inp) {
  const m = f.mot || (f.mot = { d: false, fw: false, bk: false, toks: [] });
  const fw = f.facing > 0 ? inp.right : inp.left, bk = f.facing > 0 ? inp.left : inp.right, d = inp.down;
  const add = k => { m.toks.push([k, f.t]); if (m.toks.length > 4) m.toks.shift(); };
  if (d && !m.d) add('D'); if (fw && !m.fw) add('F'); if (bk && !m.bk) add('B');
  m.d = d; m.fw = fw; m.bk = bk;
  if (!(inp.lp || inp.rp || inp.lk || inp.rk) || m.toks.length < 2) return inp;
  const [a, b] = m.toks.slice(-2);
  if (f.t - b[1] > 16 || b[1] - a[1] > 24) return inp;
  const cmd = { DF: 'skill', DB: 'grab', FF: 'ult' }[a[0] + b[0]];   // (변신은 뺐음)
  if (!cmd || (cmd === 'ult' && f.meter < 100) || (cmd === 'tf' && (f.tfG < 100 || f.tfOn)) || (cmd === 'skill' && f.skillCD > 0)) return inp;   // 못 쓰는 상황이면 그냥 공격
  m.toks = [];
  const o = { ...inp, lp: false, rp: false, lk: false, rk: false, down: false };
  if (cmd === 'ult') { o.ult = true; o.ultD = true; } else o[cmd] = true;
  return o;
}
function freeUpdate(f, o, inp) {
  const ground = f.y >= GROUND;
  if (ground) f.facing = o.x > f.x ? 1 : -1;
  const back = f.facing > 0 ? inp.left : inp.right, backP = f.facing > 0 ? inp.leftP : inp.rightP;
  if (backP && f.parryCD <= 0 && ground) { f.parryT = 7; f.parryCD = 26; }
  if (inp.ult && f.meter >= 100 && ground && (f.cmdT > 0 || inp.cpu || inp.ultD)) return startUlt(f);
  if (inp.skill && f.skillCD <= 0 && ground) return startSkill(f, false);
  if (inp.grab && ground) {
    if (f.weapon) { f.throwKind = f.weapon.kind; f.weapon = null; return startAtk(f, 'throw', THROWDEF); }
    return startAtk(f, 'grab', GRABDEF);
  }
  if (f.ch.spirit && ((inp.lp && inp.rp) || (inp.bot && !f.standOn))) return standToggle(f);   // I+O 같이 누르면 스탠드 켜기·끄기 (CPU는 늘 켬)
  const b = inp.lp ? 'lp' : inp.rp ? 'rp' : inp.lk ? 'lk' : inp.rk ? 'rk' : null;
  if (b) return startAtk(f, !ground ? (b === 'lp' || b === 'rp' ? 'j_p' : 'j_k') : inp.down ? 'c_' + b : b);
  if (ground) {
    if (inp.down) { f.state = back ? 'cblock' : 'crouch'; f.vx = 0; }
    else {
      const mv = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
      f.vx = mv * 4.2 * f.speedMul() * (back ? 0.7 : 1);
      f.state = back ? 'block' : mv ? 'walk' : 'idle';
      if (inp.up) { f.vy = -15; f.vx = mv * 4.6 * f.speedMul(); f.state = 'jump'; SFX.jump(); }
    }
  } else f.state = 'jump';
}

function startAtk(f, name, def, chain) {
  def = def || NORM[name];
  const isPunch = ['lp', 'rp', 'c_lp', 'c_rp', 'j_p'].includes(name);
  const isKick = ['lk', 'rk', 'c_lk', 'c_rk', 'j_k'].includes(name);
  const m = f.atkSpeedMul(isPunch || def.kind === 'punch');
  f.atk = { ...def, name, isPunch, isKick, startup: Math.max(1, Math.round(def.startup * m)), recovery: Math.max(2, Math.round(def.recovery * m)) };
  if (f.ch.spirit && isPunch && f.standOn) f.atk.spiritPunch = true;   // 돼타로: 스탠드를 꺼내 둔 동안 I/O 평타는 뚱타플레티나가 (스탠드 자리에서) 때림
  if (f.ch.blackFlash && !def.skill && !def.grab && f.atk.dmg && srnd() < (cursed(f) ? 0.18 : 0.08)) { f.atk.dmg *= 2.5; f.atk.boltCrit = true; f.atk.hitstop = 18; f.atk.shake = 14; }   // 평타 검은 번개
  f.state = 'attack'; f.af = 0; f.atkHit = false; f.hitsDone = 0; f.lastHitF = 0;
  if (!chain) { f.chain = 0; f.cbuf = null; }
  if (def.rise) f.vy = def.rise;
  if (!def.skill && !def.grab) SFX.whiff();
}
function startSkill(f, chain) {
  const s = pickSkill(f);   // 여러 스킬이 있는 돼지: U / ↓+U / →+U
  f.skillCD = Math.round(s.cd * (f.tfIs('spicy') ? 0.5 : 1));
  startAtk(f, 'skill', { ...SKILLDEF[s.type], skill: true, skType: s.type }, chain);
  newSkillStart(f, s);
  popText(f.x, f.y - 200 * f.sc / 1.15, s.name + '!', '#ffdd33', 26); castPunch(); const rsnd = s.type === 'spiritRush' && f.ch.standSnd && f.ch.standSnd.rush;   // 스탠드마다 다른 연타 기합 (PIO: 무다무다)
  if (rsnd) { if (!smp(rsnd, { v: 1.2 })) for (let i = 0; i < 40; i++) knock(1.1 + (i % 5) * 0.03, 0.5, i * 0.08); } else (SKILL_SFX[s.type] || SFX.special)();   // 스킬마다 고유한 소리 하나만 (공통 소리와 겹쳐 지저분하던 것 제거)
}
function startTf(f) {
  f.tfG = 0; f.tfOn = true; f.tfT = 480; f.state = 'transforming'; f.af = 0; f.vx = 0;
  superFreeze = 36; superOwner = f; superKind = 'tf'; SFX.transform(); if (f.ch.tf.type === 'freeze') smp('blizzard', { v: 0.75, dur: 2.2 });   // 얼음 변신: 눈보라
  burst(f.x, f.y - 80, 30, [f.ch.tf.color, '#ffffff'], 10);
}
function attackUpdate(f, o, inp) {
  const a = f.atk; f.af++;
  const ground = f.y >= GROUND;
  // 동시 입력: 먼저 눌린 기본기의 첫 몇 프레임 안에 짝 버튼이 들어오면 커맨드로 바꾼다
  if (f.ch.spirit && f.af <= 6 && f.chain === 0 && ((a.name.endsWith('lp') && inp.rp) || (a.name.endsWith('rp') && inp.lp))) { endAtk(f); return standToggle(f); }   // I+O 같이: 스탠드 켜기·끄기
  if (f.af <= 6 && !a.skill && !a.grab && f.chain === 0 && ground) {
    if (inp.ult && f.meter >= 100 && (f.cmdT > 0 || inp.cpu || inp.ultD)) return startUlt(f);
    if (inp.grab) return startAtk(f, 'grab', GRABDEF);
    if (inp.skill && f.skillCD <= 0) return startSkill(f, false);
  }
  if (a.rasen && f.atkHit && f.af < a.startup + a.active) { f.af = a.startup + a.active; f.vx = 0; }   // 회오리 구슬: 맞히면 그 자리에서 멈춤
  if (f.af === a.startup) wpnSwingFx(f);   // 무기로 휘두르는 순간 베기 이펙트
  if (a.rasen && f.af === a.startup) f.facing = Math.sign(f.opp.x - f.x) || f.facing;   // 달려가기 전에 상대 쪽을 봄
  if (a.dash && f.af >= a.startup && f.af < a.startup + a.active) {
    f.vx = f.facing * a.dash;
    if (f.t % 2 === 0) burst(f.x - f.facing * 40, GROUND - 5, 2, ['#a07850', '#c8a070'], 4);
  }
  if (a.teleport && f.af === Math.max(1, a.startup - 4)) {
    const side = Math.sign(o.x - f.x) || 1;
    smokePuff(f.x, f.y - 70); f.x = clamp(o.x + side * 110, 50, W - 50); f.facing = -side; smokePuff(f.x, f.y - 70); SFX.whiff();
  }
  if (a.proj && f.af === a.startup) {
    spawnProj(f, a.proj);
    if (f.tfIs('spicy') && a.proj.kind === 'fire') spawnProj(f, { ...a.proj, y: 50, speed: 9 });
    ({ ice: SFX.ice, fire: SFX.fire, stew: SFX.splash }[a.proj.kind] || SFX.whiff)();
  }
  if (a.hits && f.atkHit && f.hitsDone < a.hits && f.af - f.lastHitF >= a.hitEvery) f.atkHit = false;
  // 콤보 입력 기억: 연결 가능한 순간보다 조금(10프레임) 일찍 눌러도 다음 공격으로 이어짐 (전엔 딱 맞춰 눌러야 해서 콤보가 어려웠음)
  const pb = inp.lp ? 'lp' : inp.rp ? 'rp' : inp.lk ? 'lk' : inp.rk ? 'rk' : null;
  if (f.af > 2 && (pb || inp.skill)) f.cbuf = { b: pb, skill: !!inp.skill, down: !!inp.down, t: 10 };
  else if (f.cbuf && --f.cbuf.t <= 0) f.cbuf = null;
  if (f.atkHit && f.af >= a.startup + a.active && !a.skill && !a.grab && f.chain < 4 && f.cbuf) {
    const { b, skill, down } = f.cbuf;
    if (skill && f.skillCD <= 0 && ground) { f.cbuf = null; f.chain++; startSkill(f, true); return; }
    if (b) { f.cbuf = null; f.chain++; startAtk(f, ground ? (down ? 'c_' + b : b) : (b === 'lp' || b === 'rp' ? 'j_p' : 'j_k'), null, true); return; }
  }
  if (a.air && ground && f.af > 2) { endAtk(f); return; }
  if (f.af >= a.startup + a.active + a.recovery) endAtk(f);
}
function endAtk(f) { const a = f.atk; f.atk = null; f.state = f.y < GROUND ? 'jump' : (a && a.crouch ? 'crouch' : 'idle'); }

// ================= projectiles & hazards =================
let objs = [];
const hitGroups = new Set();
function addObj(o) {
  const ob = Object.assign({ t: 0, delay: 0, hits: 0, maxHits: 1, multi: 0, lastHit: -99, life: 120, kb: 6, stun: 20, height: 'mid', w: 30, h: 30, vx: 0, vy: 0 }, o); objs.push(ob); return ob;
}
function spawnProj(f, p) {
  const s = f.sc / 1.15;
  if (p.spread) {   // 돈뿌리기: 동전 여러 개를 부채꼴로 (각도는 고정 → 온라인에서도 같음)
    for (let i = 0; i < p.spread; i++) {
      const k = i / Math.max(1, p.spread - 1);
      addObj({ owner: f, kind: p.kind, x: f.x + f.facing * 60 * s, y: f.y - 100 * s, vx: f.facing * p.speed * (p.flat ? 1 : 0.7 + 0.45 * k), vy: p.flat ? (k - 0.5) * 3.2 : -7.5 + k * 5.5, g: p.g,
        w: p.w, h: p.h, dmg: p.dmg, height: p.height, life: p.life, clash: false, kb: 3, stun: 14 });
    }
    return;
  }
  addObj({ owner: f, kind: p.kind, sub: f.throwKind, x: f.x + f.facing * 70 * s, y: f.y - (p.y || 95) * s, vx: f.facing * p.speed, w: p.w || 40, h: p.h || 32,
    vy: p.vy || 0, g: p.g || 0, boom: p.boom || 0, multi: p.multi || 0, maxHits: p.maxHits || 1, back: p.back || 0, dir: f.facing,
    dmg: p.dmg, height: p.height || 'mid', life: p.life || 140, burn: p.burn, slow: p.slow, clash: p.kind !== 'stew' });   // 국물은 바닥을 흘러서 다른 발사체와 부딪혀도 안 사라짐
}
// 포물선 발사체가 땅에 닿으면 그 자리에서 넓게 터짐 (한 번만 맞음)
function boomObj(o) {
  o.boom = 0; o.g = 0; o.vx = 0; o.vy = 0; o.y = GROUND - 50; o.w = 150; o.h = 100; o.life = 6; o.exploded = true;
  shake = Math.max(shake, 7); SFX.boom();
  burst(o.x, GROUND - 20, 22, ['#ff5722', '#ff9800', '#ffeb3b'], 9);
  for (let i = 0; i < 6; i++) flame(o.x + rand(-60, 60), GROUND - rand(10, 50));
}
function overlapD(o, d) {
  if (d.state === 'ko') return false;
  const s = d.sc / 1.15, hw = 42 * s, top = d.y - (d.crouching() ? 95 : 140) * s;
  if (Math.abs(o.x - d.x) < hw + o.w / 2 && o.y + o.h / 2 > top && o.y - o.h / 2 < d.y) return true;
  return !!(d.ch.spirit && d.standOn && d.spX != null && Math.abs(o.x - d.spX) < hw + o.w / 2 && o.y + o.h / 2 > top - 20 && o.y - o.h / 2 < d.y);   // 꺼내 둔 스탠드에 맞아도 본체 피해
}
function updateObjs(onlyTs) {   // onlyTs: 시간 정지 중 → 로드롤러처럼 tsMove 표시된 것만 움직임
  for (const o of objs) {
    if (onlyTs && !o.tsMove) continue;
    if (o.delay > 0) { o.delay--; continue; }
    o.t++; o.life--;
    if (!o.owner) { envUpdate(o); continue; }
    o.x += o.vx; o.y += o.vy;
    if (o.g) { o.vy += o.g; if (o.boom && o.y >= GROUND - 20) boomObj(o); }
    if (o.back) {   // 냉삼 부메랑: 점점 느려지다 되돌아와서, 던진 돼지가 받으면 사라짐
      o.vx -= o.dir * o.back;
      if (o.t > 12 && Math.sign(o.vx) === -o.dir && Math.abs(o.x - o.owner.x) < 50) o.life = 0;
    }
    if (o.kind === 'coin' && o.y > GROUND - 10) { o.life = 0; burst(o.x, GROUND - 8, 5, ['#ffd700', '#fff8e1'], 4); }   // 바닥에 떨어진 동전은 반짝 사라짐
    if (o.kind === 'safe' && o.y >= GROUND - 62) {   // 금고가 바닥에 쿵
      o.y = GROUND - 62; o.vy = 0; o.g = 0; o.dmg = 0;
      if (!o.landed) { o.landed = true; o.life = 45; shake = Math.max(shake, 16); SFX.slam(); burst(o.x, GROUND - 10, 26, ['#ffd700', '#ffecb3', '#a1887f'], 10); }
    }
    if (o.kind === 'slice' && o.g && o.y > GROUND - 14) { o.life = 0; burst(o.x, GROUND - 8, 8, ['#e1f5fe', '#f6c9c4', '#ffffff'], 5); }   // 떨어진 냉삼이 바닥에서 깨짐
    const f = o.owner, d = f.opp;
    if (o.kind === 'pclone') { cloneTick(o); continue; }
    if (bigObjTick(o)) continue;   // 소스 웅덩이 · 블랙홀 · 유성
    if (big2ObjTick(o)) continue;
    if (nxObjTick(o)) continue;
    if (nyObjTick(o)) continue;
    if (o.kind === 'stew' && o.t % 4 === 0) smoke(o.x + rand(-20, 20), o.y - 10);
    if (o.follow) {
      if (f.state !== 'ult') { o.life = 0; continue; }
      o.x = f.x + f.facing * (o.w / 2 + 60 * f.sc / 1.15); o.y = f.y - 95 * f.sc / 1.15;
    }
    if (o.kind === 'minipig' && o.t % 5 === 0) burst(o.x, GROUND - 4, 2, ['#a07850', '#c8a070'], 3);
    if (o.kind === 'fire' && o.t % 2 === 0) flame(o.x - Math.sign(o.vx) * 15, o.y);
    if (o.kind === 'pillar' && o.t < 3) { shake = Math.max(shake, 6); burst(o.x, GROUND - 10, 6, ['#ff9800', '#ffeb3b'], 8); }
    if (!o.dmg || scene !== 'fight') continue;
    const can = o.hits < o.maxHits && (o.multi ? o.t - o.lastHit >= o.multi : o.hits === 0) && !(o.group && hitGroups.has(o.group));
    if (can && overlapD(o, d)) {
      const src = o.follow || !o.vx ? f.x : o.x - Math.sign(o.vx) * 100;
      const r = dealHit(f, d, { dmg: o.dmg, height: o.height, src, kind: o.ult ? 'ult' : 'proj', kb: o.kb, stun: o.stun, launch: o.launch,
        knockdown: o.knockdown, pull: o.pull, burn: o.burn, slow: o.slow, chip: o.chip, unblockable: o.unblockable, txt: o.txt, proj: true, hx: o.x });
      if (r !== 'miss') {
        o.hits++; o.lastHit = o.t;
        if (o.group) hitGroups.add(o.group);
        if (!o.multi && !o.ult) o.life = 0;
        if (o.kind === 'blood' && f === p1 && mode === 1) awkAdd(f.ch.name, 'blood');
      }
    }
  }
  for (const a of objs) for (const b of objs) {
    if (a.owner !== b.owner && a.clash && b.clash && a.life > 0 && b.life > 0 && Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2) {
      a.life = b.life = 0; burst((a.x + b.x) / 2, a.y, 16, ['#fff', '#ffcc80'], 8); SFX.block();
    }
  }
  objs = objs.filter(o => o.life > 0 && o.x > -300 && o.x < W + 300);
}
function drawObjs() {
  drawNxTint();   // 업데이트 돼지 필살기 화면 색
  for (const o of objs) { const tn = o.owner && o.owner.C && o.owner.C.skinFx && o.owner.C.skinFx.fxTint ? skinHue(o.owner.C.skinFx) : ''; if (tn) { ctx.save(); ctx.filter = tn; } try {   // 스킨 색 이펙트
    if (!o.owner) { drawEnv(o); continue; }
    if (o.kind === 'pclone') { drawClone(o); continue; }
    if (drawBigObj(o)) continue;
    if (drawBig2Obj(o)) continue;
    if (drawNxObj(o)) continue;
    if (drawNyObj(o)) continue;
    if (o.kind === 'kunai') { drawKunai(o); continue; }
    if (o.delay > 0) {
      if (o.kind === 'pillar') { ctx.fillStyle = `rgba(255,120,0,${0.3 + 0.3 * Math.sin(gT * 0.5)})`; ell(o.x, GROUND - 10, 40, 8); ctx.fill(); }
      if (o.kind === 'safe') {   // 금고가 떨어질 자리: 점점 커지는 그림자 + 경고 (보고 피하기)
        const k = 1 - o.delay / 40;
        ctx.fillStyle = `rgba(0,0,0,${0.25 + 0.25 * k})`; ell(o.x, GROUND - 6, 30 + 55 * k, 8 + 8 * k); ctx.fill();
        ctx.strokeStyle = `rgba(255,82,82,${0.5 + 0.5 * Math.sin(gT * 0.6)})`; ctx.lineWidth = 3; ell(o.x, GROUND - 6, 85, 16); ctx.stroke();
      }
      continue;
    }
    const dir = Math.sign(o.vx) || o.owner.facing;
    ctx.save(); ctx.translate(o.x, o.y);
    switch (o.kind) {
      case 'coin': {   // 빙글빙글 도는 금화
        const sx = Math.abs(Math.cos(o.t * 0.4)) * 0.85 + 0.15;
        ctx.scale(sx, 1); ctx.fillStyle = '#ffb300'; ell(0, 0, 13, 13); ctx.fill();
        ctx.fillStyle = '#ffd54f'; ell(0, 0, 10, 10); ctx.fill(); ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2; ell(0, 0, 6, 6); ctx.stroke();
        break;
      }
      case 'safe': {   // 황금 금고
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; rr(-72, -56, 150, 122, 12); ctx.fill();
        const gg = ctx.createLinearGradient(0, -60, 0, 60); gg.addColorStop(0, '#ffe082'); gg.addColorStop(1, '#c79100');
        ctx.fillStyle = gg; rr(-75, -60, 150, 120, 12); ctx.fill(); ctx.strokeStyle = '#8d6e00'; ctx.lineWidth = 4; ctx.stroke();
        ctx.strokeStyle = '#a07800'; ctx.lineWidth = 3; rr(-60, -46, 120, 92, 8); ctx.stroke();
        ctx.fillStyle = '#5d4300'; ell(0, 0, 22, 22); ctx.fill(); ctx.fillStyle = '#ffd54f'; ell(0, 0, 14, 14); ctx.fill();
        ctx.strokeStyle = '#5d4300'; ctx.lineWidth = 3; for (let a = 0; a < 6; a++) line(Math.cos(a) * 8, Math.sin(a) * 8, Math.cos(a) * 14, Math.sin(a) * 14);
        ctx.fillStyle = '#5d4300'; ctx.fillRect(42, -10, 8, 20); txt('₩', -45, -32, 18, '#5d4300', null);
        break;
      }
      case 'slice': {   // 얇게 얼린 냉삼 한 장 (빙글빙글)
        ctx.rotate(o.t * 0.45);
        ctx.fillStyle = '#f6c9c4'; rr(-27, -10, 54, 20, 8); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; line(-21, -3, 21, -3); line(-17, 4, 17, 4);
        ctx.strokeStyle = 'rgba(129,212,250,0.95)'; ctx.lineWidth = 2.5; rr(-27, -10, 54, 20, 8); ctx.stroke();
        break;
      }
      case 'stew': {   // 바닥을 흐르는 빨간 국물 웅덩이
        const wv = Math.sin(o.t * 0.3) * 3;
        ctx.fillStyle = 'rgba(183,28,28,0.75)'; ell(0, 6, 38 + wv, 9); ctx.fill();
        ctx.fillStyle = 'rgba(244,81,30,0.85)'; ell(dir * 4, 3, 26 - wv, 6); ctx.fill();
        ctx.fillStyle = 'rgba(255,224,178,0.8)'; ell(dir * 12 + wv, 1, 4, 3); ctx.fill(); ell(-dir * 10, 4, 3, 2); ctx.fill();
        break;
      }
      case 'ice':
        ctx.rotate(o.t * 0.4); ctx.fillStyle = 'rgba(179,229,252,0.5)'; ell(0, 0, 26, 26); ctx.fill();
        ctx.globalAlpha = 0.9; ctx.filter = 'hue-rotate(170deg) saturate(0.6) brightness(1.3)';
        drawStrip(-22, -8, 44, 16, 0, 0); ctx.filter = 'none';
        break;
      case 'fire': {
        if (o.exploded) {   // 땅에 닿아 터진 화염구
          const k = 1 - o.life / 6;
          ctx.globalAlpha = 1 - k * 0.7; ctx.fillStyle = 'rgba(255,87,34,0.55)'; ell(0, 30, 70 + k * 20, 34 + k * 10); ctx.fill();
          ctx.fillStyle = 'rgba(255,193,7,0.7)'; ell(0, 30, 40 + k * 14, 20 + k * 6); ctx.fill();
          break;
        }
        const fl = Math.sin(o.t * 0.8) * 3;
        ctx.fillStyle = 'rgba(255,87,34,0.5)'; ell(-dir * 10, 0, 28 + fl, 20); ctx.fill();
        ctx.fillStyle = '#ff9800'; ell(0, 0, 18 + fl, 16); ctx.fill();
        ctx.fillStyle = '#ffeb3b'; ell(dir * 3, 0, 9, 8); ctx.fill();
        break;
      }
      case 'meat':
        ctx.rotate(o.t * 0.5);
        if (o.sub === 'legs') { ctx.fillStyle = '#d7a86e'; rr(-16, -10, 32, 20, 6); ctx.fill(); }
        else if (o.sub === 'belly') drawStrip(-24, -8, 48, 16, 0.5, 0);
        else { ctx.fillStyle = '#f5f5f5'; rr(-20, -3, 40, 6, 3); ctx.fill(); ctx.fillStyle = '#e57373'; ell(8, 0, 13, 10); ctx.fill(); }
        break;
      case 'pillar': {
        const k = Math.min(1, o.t / 5), h = o.h * k;
        const g = ctx.createLinearGradient(0, o.h / 2 - h, 0, o.h / 2);
        g.addColorStop(0, '#fff176'); g.addColorStop(0.4, '#ff9800'); g.addColorStop(1, '#bf360c');
        ctx.fillStyle = g; rr(-o.w / 2 + Math.sin(o.t) * 3, o.h / 2 - h, o.w, h, 20); ctx.fill();
        break;
      }
      case 'minipig':
        ctx.restore(); drawPig(o.x, GROUND, dir, o.owner.C, { scale: 0.42, walk: true, t: o.t * 2, move: 'dash', k: 0.6 }); continue;
      case 'shock':
        ctx.strokeStyle = `rgba(255,255,255,${clamp(o.life / 40)})`; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.ellipse(0, 10, 40, 22, 0, Math.PI, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = `rgba(255,213,79,${clamp(o.life / 40)})`; ctx.lineWidth = 3; ctx.stroke();
        break;
      case 'beam': {
        const fl = Math.sin(o.t * 1.3) * 6;
        const g = ctx.createLinearGradient(0, -o.h / 2, 0, o.h / 2);
        g.addColorStop(0, 'rgba(255,61,0,0)'); g.addColorStop(0.3, '#ff3d00'); g.addColorStop(0.5, '#fff59d'); g.addColorStop(0.7, '#ff3d00'); g.addColorStop(1, 'rgba(255,61,0,0)');
        ctx.fillStyle = g; ctx.fillRect(-o.w / 2, -o.h / 2 - fl / 2, o.w, o.h + fl);
        break;
      }
    }
    ctx.restore();
  } finally { if (tn) ctx.restore(); } }
}

