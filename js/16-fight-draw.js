// ================= fight drawing =================
function poseOf(f) {
  const p = { t: f.t, scale: f.sc, move: null, k: 0 };
  if (f.swingT > 0) { p.move = 'punch'; p.k = 1 - f.swingT / 12; }   // 야구돈 홈런 필살기: 배트 스윙
  const st = f.state;
  if (st === 'walk') p.walk = true;
  if (f.ch.spirit && st === 'idle' && !TSTOP) { const c = f.t % 360; if (c < 120) p.capPose = true; else if (c >= 200 && c < 280) p.point = true; }   // 돼타로: 서 있으면 모자 챙 잡기 ↔ 가리키기
  if (st === 'crouch' || st === 'cblock' || (st === 'blockstun' && f.blockLow)) p.crouch = true;
  if (st === 'block' || st === 'cblock' || st === 'blockstun') p.block = true;
  if (st === 'attack') {
    const a = f.atk, af = f.af;
    // 준비 동작은 부드럽게 끝까지 뻗고(가속→감속), 회수도 감속 곡선으로 → 30%에서 100%로 튀던 동작 개선
    const eo = x => 1 - (1 - x) * (1 - x);
    p.k = af < a.startup ? eo(af / a.startup) * 0.85 : af < a.startup + a.active ? 1 : 1 - eo(clamp((af - a.startup - a.active) / Math.max(1, a.recovery)));
    p.move = a.pose; if (a.crouch) p.crouch = true;
    p.backLimb = ['rp', 'rk', 'c_rp', 'c_rk'].includes(a.name);   // O·L(왼손·왼발)은 뒤쪽 팔다리로
    if (a.pose === 'roll') { p.roll = af * 0.5; p.move = null; }
    if (a.pose === 'spin') { p.spin = af * 0.4; p.move = 'highkick'; p.k = af >= a.startup && af < a.startup + a.active ? 1 : p.k; }
    if (a.teleport && af < a.startup - 4 && af > 2) p.alpha = 0.15;
  }
  if (st === 'ult') {
    const T = f.uT;
    switch (f.ch.ult.type) {
      case 'rush': p.move = f.ultHit ? (T % 10 < 5 ? 'punch' : 'jab') : 'dash'; p.k = 1; p.backLimb = T % 10 < 5; break;   // 양손 번갈아
      case 'thousandKicks': p.move = f.ultHit ? (T % 8 < 4 ? 'highkick' : 'lowkick') : 'dash'; p.k = 1; p.backLimb = T % 8 < 4; break;   // 양발 번갈아
      case 'charge': p.move = 'dash'; p.k = T < 10 ? 0.3 : 1; break;
      case 'eruption': if (T < 18) p.victory = true; else { p.crouch = true; p.move = 'punch'; p.k = 1; } break;
      case 'stampede': p.victory = true; break;
      case 'absoluteZero': case 'beam': p.move = 'throw'; p.k = 1; break;
      case 'bodySlam': if (!f.landed) { p.victory = true; p.air = true; } else p.crouch = true; break;
      case 'sliceRain': p.victory = T < 90; break;   // 두 팔 들고 냉삼을 부름
      case 'goldSafe': p.victory = T < 60; break;   // 금고 부르기
      case 'timeStop': p.victory = !f.ultHit; p.move = f.ultHit ? null : p.move; break;   // 돼타로은 서 있고 수호령이 때림
      case 'thousandCuts': p.move = 'punch'; p.k = 1; if (f.ultHit && T < 62) p.alpha = 0.15; break;
      case 'megaton': p.move = 'punch'; p.k = T < 36 ? 0 : 1; if (T < 36) p.aura = '#ffd600'; break;
    }
  }
  if (st === 'hit' || st === 'locked') p.hurt = true;
  if (st === 'locked' && f.opp.ch.ult.type === 'absoluteZero') p.filter = 'hue-rotate(170deg) saturate(0.5) brightness(1.3)';
  if (st === 'locked' && f.opp.ch.ult.type === 'timeStop') p.filter = 'grayscale(1) brightness(0.85)';   // 시간 정지: 멈춘 상대는 흑백
  if (st === 'parried') { p.hurt = true; p.filter = 'saturate(0.3) brightness(1.3)'; }
  if (st === 'ko') p.ko = Math.min(1, f.koT / 15);
  if (st === 'down') { p.ko = 1; p.lie = true; }
  if (st === 'grabbed') { if (f.opp.grabT > 20) { p.ko = 1; p.lie = true; } else p.hurt = true; }
  if (st === 'grabbing') { p.move = f.grabT > 20 ? (f.grabT % 8 < 4 ? 'punch' : 'jab') : 'grab'; p.k = 1; p.crouch = f.grabT > 20; p.backLimb = f.grabT > 20 && f.grabT % 8 < 4; }
  if (st === 'transforming') p.victory = true;
  if (st === 'jump' || f.y < GROUND - 1) p.air = true;
  p.flash = f.flash > 0;
  if (f.tfOn) {
    p.aura = f.ch.tf.color;
    const ty = f.ch.tf.type;
    if (ty === 'stone') p.filter = (p.filter || '') + ' grayscale(0.85)';
    if (ty === 'shadow') p.alpha = (p.alpha ?? 1) * 0.55;
    if (ty === 'fire' || ty === 'spicy') p.filter = (p.filter || '') + ' saturate(1.6)';
  }
  if (f.slowT > 0) p.filter = (p.filter || '') + ' hue-rotate(170deg) saturate(0.7)';
  if (f.weapon) p.weapon = f.weapon.kind;
  if (f.drunkT > 0 && f.state !== 'ko') { p.tilt = Math.sin(f.t * 0.12) * 0.18; p.filter = (p.filter || '') + ' saturate(1.4) hue-rotate(-12deg)'; }
  if (mode === 4 && f.cond >= 0 && f.state !== 'ko') {   // AI 베팅: 경기 중에도 컨디션이 보이게
    if (f.cond === 0) p.filter = (p.filter || '') + ' saturate(0.55) brightness(0.9)';
    if (f.cond >= 2 && !p.aura) p.aura = f.cond === 3 ? '#ff9100' : '#69f0ae';
  }
  return p;
}
// 자세가 한 번에 '툭' 바뀌지 않게: 앉기·맞음(몸 기울기)·막기·걷기를 몇 프레임에 걸쳐 부드럽게 바꿈 (화면 표시만, 판정과 무관)
function smoothPose(f, p) {
  const v = f._vis || (f._vis = { c: 0, h: 0, b: 0, w: 0, lt: f.t });
  const d = f.t - v.lt, n = Math.max(0, Math.min(10, d)); v.lt = f.t;   // 지난번 그린 뒤 지나간 게임 프레임 수 (화면 주사율과 상관없이 같은 속도)
  if (d < 0 || d > 9) Object.assign(v, { c: p.crouch ? 1 : 0, h: p.hurt ? 1 : 0, b: p.block ? 1 : 0, w: p.walk ? 1 : 0 });   // 새 라운드·오래 안 그린 경우는 바로 맞춤
  const go = (cur, on, rate) => cur + ((on ? 1 : 0) - cur) * (1 - Math.pow(1 - rate, n));
  v.c = go(v.c, p.crouch, 0.45); v.h = go(v.h, p.hurt, 0.5); v.b = go(v.b, p.block, 0.45); v.w = go(v.w, p.walk, 0.25);
  p.crouchK = v.c; p.hurtK = v.h; p.blockK = v.b; p.walkK = v.w;
  return p;
}
// 뚱타플레티나 (돼타로): 스킬·필살기 때 앞에 반투명 보라 돼지가 나와서 주먹 연타
function spiritOn(f) {
  if (!f.ch.spirit) return null;
  if (f.state === 'attack' && f.atk && f.atk.spiritPunch) { const a = f.atk, af = f.af; return { punching: af >= a.startup && af < a.startup + a.active, t: af, fade: 1, at: f.spX, jab: a.name.endsWith('lp') }; }   // 평타 = 수호령 주먹
  if (f.state === 'attack' && f.atk && f.atk.spirit) { const a = f.atk, af = f.af, go = af < a.startup ? ease(af / a.startup) : af < a.startup + a.active ? 1 : 1 - ease((af - a.startup - a.active) / a.recovery); return { punching: af >= a.startup && af < a.startup + a.active, t: af, fade: clamp(af / 6), go }; }
  if (f.state === 'ult' && f.ch.ult.type === 'timeStop') { const T = f.uT, go = f.ultHit ? (T < 86 ? ease(T / 10) : 1 - ease((T - 86) / 10)) : ease(T / 16) * (T < 24 ? 1 : 1 - ease((T - 24) / 10)); return { punching: f.ultHit && T >= 12 && T < 86, t: T, fade: clamp(T / 8), go }; }
  if (TSTOP && TSTOP.owner === f) { const at = f.state === 'attack' && f.atk; return { punching: !!at && f.af >= at.startup && f.af < at.startup + at.active, t: f.t, fade: 1, go: at ? 0.3 : 0, at: f.standOn ? f.spX : null }; }   // 시간 정지 동안 곁에 떠 있다가 같이 때림
  if (gT - (f.spiritGuardAt ?? -999) < 36) return { guard: true, punching: false, t: f.t, fade: 1, go: 0 };   // 방어해 줄 때
  if (f.standOn) return { punching: false, t: f.t, fade: 1, at: f.spX };   // 스탠드를 꺼내 둔 동안 계속 보임
  return null;
}
function drawSpirit(f, sp) {
  // 수호령은 돼타로 앞에서 나와 상대 바로 앞까지 날아감 (go: 0 = 돼타로 옆, 1 = 상대 앞)
  const k = f.sc / 1.15, home = f.x + f.facing * 62 * k, o = f.opp, dst = o ? o.x - f.facing * 95 * k : home;
  const x = sp.at != null ? sp.at : lerp(home, (dst - home) * f.facing > 0 ? dst : home, sp.go || 0), y = f.y - 24 * k - Math.sin((sp.go || 0) * Math.PI) * 18, T = sp.t;
  if (sp.go > 0.05 && sp.go < 0.95) { ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#b388ff'; for (let i = 1; i <= 3; i++) { ell(x - f.facing * i * 26 * k, y - 90 * k, 40 * k, 70 * k); ctx.fill(); } ctx.restore(); }   // 날아가는 잔상
  ctx.save(); ctx.globalAlpha = 0.6 * sp.fade; ctx.fillStyle = '#e1bee7';   // 주위에 반짝이는 별
  for (let i = 0; i < 5; i++) { const a = gT * 0.05 + i * 1.257, r = 70 + 10 * Math.sin(gT * 0.1 + i); star(x + Math.cos(a) * r * k, y - 90 * k + Math.sin(a) * r * 0.8 * k, 6 * k, 2.5 * k); ctx.fill(); }
  ctx.restore();
  drawPig(x, y, f.facing, f.ch.standLook || SPIRIT, { scale: f.sc * 1.06, t: gT, alpha: 0.78 * sp.fade, aura: f.ch.standCol || '#b388ff', move: sp.guard ? null : sp.jab !== undefined ? (sp.jab ? 'jab' : 'punch') : T % 6 < 3 ? 'punch' : 'jab', k: sp.punching ? 1 : 0.3, block: sp.guard, backLimb: sp.jab === undefined && T % 6 < 3 });
  if (sp.punching && sp.jab === undefined) {   // 잔상 주먹 (연타일 때만)
    ctx.save(); ctx.globalAlpha = 0.5;
    for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#b39ddb' : '#d1c4e9'; ell(x + f.facing * (80 + Math.random() * 80) * k, y - (60 + Math.random() * 90) * k, 13 * k, 11 * k); ctx.fill(); }
    ctx.restore();
  }
}
const timeStopped = () => !!TSTOP;
function drawFighter(f) {
  const p = smoothPose(f, poseOf(f)), s = f.sc / 1.15;
  const k = clamp(1 - (GROUND - f.y) / 300);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ell(f.x, GROUND + 2, 50 * k * s, 9 * k); ctx.fill();
  drawNewBack(f);
  if (f.tfIs('clone')) drawPig(f.x - f.facing * 45 * s, f.y, f.facing, f.C, { ...p, alpha: 0.35, aura: null });
  if (f.sukuna) p.curse = 1; else if (f.curseT > 0) p.curse = Math.min(1, f.curseT / 60); if (f.foxT > 0) p.foxTails = Math.min(1, f.foxT / 60);   // 몸에 붙는 효과
  if (f.C.wpn) p.wpnOut = (f.state === 'attack' && f.atk && !['lowkick', 'highkick', 'sweep', 'roll', 'grab'].includes(f.atk.pose) && (f.atk.skill || (!GUNS.includes(f.C.wpn) && ['punch', 'uppercut'].includes(f.atk.pose)))) || f.state === 'ult' || f.swingT > 0;   /* 무기를 더 자주: 스킬은 전부 무기로 · 근접 무기는 센 주먹(punch·uppercut)도 무기로 */   // 무기는 스킬·필살기 때만 손에 (평타는 맨손 · 던지는 스킬은 빈손으로)
  drawPig(f.x, f.y, f.facing, f.C, p);
  drawNewFront(f);
  drawCurse(f);   // 저주왕
  drawBigFront(f);
  drawAwake(f); drawSkinAura(f);   // 각성 오라 · 스킨 기운
  drawBig2Front(f);
  const sp = spiritOn(f); if (sp) drawSpirit(f, sp);
  if (f.ch.spirit && (f.state === 'idle' || f.state === 'walk' || TSTOP) && f.state !== 'ko') {   // 스탠드 사용자 주위에 떠다니는 만화 기운 글자 (ゴゴゴ · PIO는 ドドド)
    const k = f.sc / 1.15;
    for (let i = 0; i < 3; i++) {
      const ph = ((gT + i * 40) % 120) / 120, a = Math.sin(ph * Math.PI);
      ctx.save(); ctx.globalAlpha = a * 0.85; ctx.translate(f.x - f.facing * (70 + i * 26) * k, f.y - (120 + i * 30 + ph * 40) * k); ctx.rotate(-0.15 + i * 0.12);
      txt((f.ch.menace || 'ゴゴゴ')[i], 0, 0, (34 - i * 3) * k * (f.ch.menaceSize || 1), f.ch.menaceCol || '#b388ff', '#1a0f40', 6); ctx.restore();
    }
  }
  if (mode === 4 && f.cond >= 0 && f.cond !== 1 && f.state !== 'ko') drawCondFx(f.cond, f.x, f.y, f.sc);
  if (f.state === 'locked' && f.opp.ch.ult.type === 'absoluteZero') {
    ctx.fillStyle = 'rgba(179,229,252,0.45)'; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3;
    rr(f.x - 70 * s, f.y - 170 * s, 140 * s, 170 * s, 12); ctx.fill(); ctx.stroke();
    const T = f.opp.uT; const bx = f.x + Math.sin(T * 0.6) * 40;
    ctx.save(); ctx.translate(bx, f.y - 200 * s); ctx.fillStyle = '#eceff1'; ctx.strokeStyle = '#607d8b';
    rr(-90, -20, 180, 30, 6); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#795548'; rr(-60, -40, 120, 20, 6); ctx.fill(); ctx.restore();
  }
  if (f.state === 'parried') txt('!!', f.x, f.y - 180 * s, 30, '#81d4fa', '#000', 5);
  if (f.stamina < 35 && f.state !== 'ko' && f.t % 30 < 15) { ctx.fillStyle = 'rgba(110,180,255,0.8)'; ell(f.x + f.facing * 20 * s, f.y - 160 * s, 4, 6); ctx.fill(); }
  if (f.state === 'grabbing' && f.grabT > 20) txt(`연타!! ×${f.mashN}`, f.x, f.y - 200 * s, 24, '#ffeb3b', '#000', 5);
  if (f.beamT > 0) {
    const y = f.y - 95 * s, x0 = f.x + f.facing * 60 * s, x1 = f.facing > 0 ? W : 0;
    ctx.strokeStyle = `rgba(179,229,252,${f.beamT / 18})`; ctx.lineWidth = 30; line(x0, y, x1, y);
    ctx.strokeStyle = `rgba(255,255,255,${f.beamT / 18})`; ctx.lineWidth = 10; line(x0, y, x1, y);
  }
}
function keyHint(f, which) {
  if (mode === 0 || mode === 4 || (mode === 3 ? f !== NET.me : f === p2)) return '';
  if (TOUCH) return { ult: '[필살기 버튼]', skill: '[스킬 버튼]', tf: '[변신 버튼]' }[which] || '';   // 모바일은 버튼으로 안내
  const m = { ult: keyName(MAP1.ultD), skill: keyName(MAP1.skill), tf: keyName(MAP1.tf) };   // 키 설정에서 바꾼 키로   // 한 번에 누르는 단축키로 안내
  return `[${m[which]}]`;
}
function drawHUD() {
  const bw = 340, bh = 22, y = 22;
  for (const [f, dir] of MIRROR() ? [[p2, 1], [p1, -1]] : [[p1, 1], [p2, -1]]) {   // 게스트는 내 체력바가 왼쪽
    drawPortrait(dir > 0 ? 40 : W - 40, 42, 30, f.C, dir);
    const x0 = dir > 0 ? 80 : W - 80 - bw, al = dir > 0 ? 'left' : 'right', ax = dir > 0 ? x0 : x0 + bw;
    ctx.fillStyle = '#222'; rr(x0 - 4, y - 4, bw + 8, bh + 8, 6); ctx.fill();
    const wd = bw * f.dispHp / f.maxHp, wh = bw * f.hp / f.maxHp;
    ctx.fillStyle = '#e53935'; ctx.fillRect(dir > 0 ? x0 : x0 + bw - wd, y, wd, bh);
    const gr = ctx.createLinearGradient(0, y, 0, y + bh);
    if (f.hp / f.maxHp > 0.3) { gr.addColorStop(0, '#fff176'); gr.addColorStop(1, '#fbc02d'); } else { gr.addColorStop(0, '#ff8a65'); gr.addColorStop(1, '#e64a19'); }
    ctx.fillStyle = gr; ctx.fillRect(dir > 0 ? x0 : x0 + bw - wh, y, wh, bh);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(dir > 0 ? x0 : x0 + bw - wh, y + 2, wh, bh * 0.3);
    if (f.hp / f.maxHp < 0.25 && gT % 30 < 15) { ctx.strokeStyle = '#ff1744'; ctx.lineWidth = 3; rr(x0 - 4, y - 4, bw + 8, bh + 8, 6); ctx.stroke(); }
    const sw = bw * f.stamina / 100;
    ctx.fillStyle = '#222'; ctx.fillRect(x0, y + bh + 4, bw, 5);
    ctx.fillStyle = f.stamina < 35 ? '#ff7043' : '#66bb6a'; ctx.fillRect(dir > 0 ? x0 : x0 + bw - sw, y + bh + 4, sw, 5);
    const skn = (cursed(f) && f.ch.curseSkills ? f.ch.curseSkills[0] : f.ch.skill).name;
    const fnm = (f === p1 && mode === 1 ? honorTag() + (titleName() ? `[${titleName()}] ` : '') : '') + f.name; txt(fnm, ax, y + bh + 22, fitSize(fnm, 18, bw - 90), '#fff', '#000', 4, al);
    for (let i = 0; i < 2; i++) {
      const cx = dir > 0 ? x0 + bw - 10 - i * 24 : x0 + 10 + i * 24, cy = y + bh + 22;
      ctx.fillStyle = f.wins > i ? '#ff93ac' : '#444'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
      ell(cx, cy, 10, 9); ctx.fill(); ctx.stroke();
      ctx.fillStyle = f.wins > i ? '#c2185b' : '#222'; ell(cx - 3.5, cy, 2, 3); ctx.fill(); ell(cx + 3.5, cy, 2, 3); ctx.fill();
    }
    const st = [];
    if (f.burnT > 0) st.push('화상'); if (f.slowT > 0) st.push('둔화'); if (f.stamina < 35) st.push('지침'); if (f.drunkT > 0) st.push('취권');
    if (f.weapon) st.push(WEAPON[f.weapon.kind]); if (f.tfOn) st.push(`${f.ch.tf.name} ${Math.ceil(f.tfT / 60)}s`);
    if (st.length) txt(st.join(' · '), dir > 0 ? x0 : x0 + bw, y + bh + 46, 12, '#ffecb3', '#000', 3, al);
    // 하단 게이지
    const mw = 230, mx = dir > 0 ? 30 : W - 30 - mw, mal = dir > 0 ? 'left' : 'right', max = dir > 0 ? mx : mx + mw;
    const uln = `필살 ${keyHint(f, 'ult')} ${f.ch.ult.name}`; txt(uln, max, H - 62, fitSize(uln, 12, mw), '#ffe082', '#000', 3, mal);
    ctx.fillStyle = '#222'; rr(mx - 3, H - 53, mw + 6, 18, 5); ctx.fill();
    const full = f.meter >= 100, mwF = mw * f.meter / 100;
    ctx.fillStyle = full ? (gT % 20 < 10 ? '#ff4081' : '#ffeb3b') : '#ffb300';
    ctx.fillRect(dir > 0 ? mx : mx + mw - mwF, H - 50, mwF, 12);
    if (full) txt('MAX!', mx + mw / 2, H - 44, 12, '#fff', '#000', 3);
    const sx = dir > 0 ? mx + mw + 14 : mx - 14 - 120;
    ctx.fillStyle = '#222'; rr(sx, H - 52, 120, 40, 8); ctx.fill();
    if (f.skillCD > 0) { const cdMax = f.ch.skill.cd; ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(sx, H - 52, 120 * (1 - f.skillCD / cdMax), 40); }
    else { ctx.strokeStyle = '#ffdd33'; ctx.lineWidth = 2; rr(sx, H - 52, 120, 40, 8); ctx.stroke(); }
    txt(`스킬 ${keyHint(f, 'skill')}${f.ch.skills ? ' · ↓ 또는 ←→ +U' : ''}`, sx + 60, H - 42, fitSize(`스킬 ${keyHint(f, 'skill')} · ↓ 또는 ←→ +U`, 11, 114), '#bbb', null);
    txt((cursed(f) && f.ch.curseSkills ? f.ch.curseSkills[0] : f.ch.skill).name, sx + 60, H - 24, fitSize((cursed(f) && f.ch.curseSkills ? f.ch.curseSkills[0] : f.ch.skill).name, 13, 112), f.skillCD > 0 ? '#888' : '#ffdd33', null);
    if (f.comboT > 0 && f.combo >= 2) txt(`${f.combo} HIT!`, dir > 0 ? 130 : W - 130, 140, 32, '#ffeb3b', '#c62828', 6);
  }
  ctx.fillStyle = '#222'; ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3;
  rr(W / 2 - 38, 12, 76, 54, 10); ctx.fill(); ctx.stroke();
  txt(String(Math.max(0, Math.ceil(timer / 60))), W / 2, 40, 36, timer < 600 ? '#ff5252' : '#fff', null);
  if (mode === 1) txt(`${ranked ? "랭크전 · " : ""}${streak}연승 중`, W / 2, 82, 15, '#ffeb3b', '#000', 4);
  if (mode === 1 && (scene === 'fight' || scene === 'intro')) drawQuitBtn(W / 2 - 60, 94, 120, 28);
  if (mode === 6 && (scene === 'fight' || scene === 'intro')) drawQuitBtn(W / 2 - 85, 94, 170, 34);   // 🥊 연습 모드 나가기   // 모바일에서도 그만둘 수 있게
  if (mode === 4) {
    txt(bet4.stake ? `🎲 ${(bet4.side ? p2 : p1).base}에 ${fmtN(bet4.stake)}코인` : '👀 구경 중', W / 2, 82, 14, '#ffd740', '#000', 4);
    ctx.fillStyle = bet4.fast ? '#ff9100' : 'rgba(0,0,0,0.55)'; rr(W / 2 - 64, 136, 128, 26, 8); ctx.fill();
    txt(bet4.fast ? '▶▶▶ 3배속 (F)' : '▶ 빨리 보기 (F)', W / 2, 149, 13, '#fff', null);
    addHot(W / 2 - 64, 136, 128, 26, () => { pressed.KeyF = true; });
  }

}
// ---- 돼타로 필살기 컷신: ① 돼타로 얼굴 클로즈업 → ② 뒤에서 뚱타플레티나 등장 → ③ 시계가 멈추고 화면 반전 ----
const TS_CUT = 130;
// 필살기·스킬 컷신 건너뛰기: 아직 안 나온 외침은 바로 내고 컷신만 끝냄
function skipCut() {
  if (superKind === 'ult' && superOwner && superOwner.ch.ult.type === 'timeStop') { const ss = superOwner.ch.standSnd || {}, t = TS_CUT - superFreeze; if (t < (ss.stopAt ?? 80)) smp(ss.stop || 'ttStop', { v: 2.6 }); }
  superFreeze = 1; pressed.Enter = pressed.Space = false;
}
function tsCutSfx(t) {
  if (t === 40) SFX.special();   // (필살기에선 스타플래티나 외침 안 넣음)
  const ss = (superOwner && superOwner.ch.standSnd) || {};
  if (t === (ss.stopAt ?? 80)) smp(ss.stop || 'ttStop', { v: 2.6 });   // 시간 정지 외침 (크게, 캐릭터마다 다른 소리·시점)
  if (t === 84 || t === 94 || t === 104) SFX.tick();
  if (t === 114) { SFX.bell(); shake = 12; }
}
function drawTimeStopCut(f) {
  const t = TS_CUT - superFreeze, e = ease;
  ctx.fillStyle = '#0b0614'; ctx.fillRect(0, 0, W, H);
  // 집중선
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.fillStyle = t < 84 ? 'rgba(179,136,255,0.22)' : 'rgba(255,255,255,0.16)';   // 만화 집중선 (뾰족한 쐐기)
  for (let i = 0; i < 56; i++) {
    const a = i / 56 * Math.PI * 2 + Math.sin(i * 7.1) * 0.03, r0 = 150 + ((i * 53 + gT * 11) % 140), wd = 0.012 + (i % 4) * 0.006;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a - wd) * 900, Math.sin(a - wd) * 900); ctx.lineTo(Math.cos(a + wd) * 900, Math.sin(a + wd) * 900); ctx.fill();
  }
  ctx.restore();
  const z = 1 + 0.06 * e(t / 40);   // 천천히 다가가는 카메라
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  // ② 뚱타플레티나: 돼타로 뒤에서 솟아오름
  if (t >= 34) {
    const k = e((t - 34) / 26), gl = 0.5 + 0.3 * Math.sin(gT * 0.2);
    ctx.save(); ctx.globalAlpha = 0.35 * k; ctx.fillStyle = '#7c4dff'; ell(640, 300, 260 * k, 240 * k); ctx.fill(); ctx.restore();
    drawPig(610, 700 - 140 * k, -1, f.ch.standLook || SPIRIT, { scale: 3.1, t: gT, alpha: 0.85 * k, aura: f.ch.standCol || `rgba(179,136,255,${gl})`, move: t > 70 ? 'punch' : null, k: t > 70 ? 1 : 0 });
  }
  // ① 돼타로 얼굴 클로즈업 (모자 그림자 · 눈빛)
  const s = 3.3, bw = f.C.bw || 1, hx = 300, hy = 300 + (1 - e(t / 18)) * 120;
  drawPig(hx - 36 * bw * s, hy + 90 * s, 1, f.C, { scale: s, t: 0, capPose: true });   // 모자 챙을 잡은 채로
  ctx.restore();
  if (t >= 20 && t < 50) {   // 눈 클로즈업 칸: 비스듬한 칸에 눈만 크게 + 번뜩
    const k = e((t - 20) / 6), px = 520, py = 60, pw = 400, ph = 150;
    ctx.save(); ctx.globalAlpha = k;
    ctx.beginPath(); ctx.moveTo(px + 30, py); ctx.lineTo(px + pw, py); ctx.lineTo(px + pw - 30, py + ph); ctx.lineTo(px, py + ph); ctx.closePath();
    ctx.fillStyle = '#1a1020'; ctx.fill(); ctx.save(); ctx.clip();
    const es = 7.5, ex0 = px + pw / 2, ey0 = py + ph / 2 + 10;   // 눈(ex = hx + 12, ey = hy - 6)이 칸 가운데 오게
    drawPig(ex0 - (36 * bw + 12) * es, ey0 + (90 + 6) * es, 1, f.C, { scale: es, t: 0 });
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(px + 30, py); ctx.lineTo(px + pw, py); ctx.lineTo(px + pw - 30, py + ph); ctx.lineTo(px, py + ph); ctx.closePath();   // 칸 테두리 (돼지 그림이 경로를 바꿔서 다시 그림)
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.stroke();
    if (t > 30) { const g = e((t - 30) / 6) * (1 - clamp((t - 42) / 8)); ctx.fillStyle = `rgba(255,255,255,${g})`; star(ex0 + 14, ey0 - 4, 34 * g + 4, 5); ctx.fill(); }   // 번뜩!
    ctx.restore();
  }
  // 대사
  ctx.save();
  if (t >= 10 && t < 40) txt('......', 300, 110, 34, '#d1c4e9', '#000', 6);
  if (t >= 44) { const k = e((t - 44) / 10); ctx.globalAlpha = k; txt(`${f.ch.standName}!!`, W / 2 + (1 - k) * 200, 86, 52, '#e1bee7', '#311b92', 10); }
  ctx.restore();
  // ③ 시계: 바늘이 돌다가 멈춤
  if (t >= 80) {
    const k = e((t - 80) / 12), cx = W - 170, cy = 330, R = 92 * k;
    ctx.fillStyle = 'rgba(255,255,255,0.92)'; ell(cx, cy, R, R); ctx.fill(); ctx.strokeStyle = '#311b92'; ctx.lineWidth = 6; ctx.stroke();
    ctx.lineWidth = 3; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(cx + Math.cos(a) * R * 0.8, cy + Math.sin(a) * R * 0.8, cx + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92); }
    const stop = t >= 114, a1 = stop ? -Math.PI / 2 : (t - 80) * 0.5, a2 = stop ? -Math.PI / 2 + 0.6 : (t - 80) * 0.08;
    ctx.strokeStyle = '#1a0f40'; ctx.lineWidth = 6; line(cx, cy, cx + Math.cos(a1) * R * 0.75, cy + Math.sin(a1) * R * 0.75);
    ctx.lineWidth = 9; line(cx, cy, cx + Math.cos(a2) * R * 0.5, cy + Math.sin(a2) * R * 0.5);
    txt(stop ? (f.ch.stopLine || '시간이여, 멈춰라!') : '째깍... 째깍...', W / 2, H - 54, stop ? 44 : 26, stop ? '#fff' : '#b39ddb', '#311b92', 8);
  }
  if (t >= 114) {   // 멈추는 순간 화면 반전 번쩍
    ctx.save(); ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = `rgba(255,255,255,${clamp(1 - (t - 114) / 14)})`; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  // 위아래 검은 띠 (영화처럼)
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 36); ctx.fillRect(0, H - 22, W, 22);
}
function drawSuperBanner() {
  if (superKind === 'ult' && superOwner && superOwner.ch.ult.type === 'boltRush') return drawItCut(superOwner);
  if (superKind === 'ult' && superOwner && superOwner.ch.ult.type === 'dismantle') return drawItCut(superOwner);
  if (superKind === 'ult' && superOwner && BIG_THEME[superOwner.ch.ult.type]) return drawBigCut(superOwner);
  if (superKind === 'ult' && superOwner && superOwner.ch.ult.type === 'curseKing') return drawItCut(superOwner);
  if (superKind === 'rasen' && superOwner) return drawRasenCut(superOwner);
  if (superKind === 'ult' && superOwner && (superOwner.ch.ult.type === 'cyberSkel' || superOwner.ch.ult.type === 'gumiho')) return drawNewCut(superOwner);
  if (superKind === 'ult' && superOwner && superOwner.ch.ult.type === 'timeStop') return drawTimeStopCut(superOwner);
  const f = superOwner, isUlt = superKind === 'ult', total = isUlt ? 50 : 36;
  const k = ease((total - superFreeze) / 10);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H);
  ctx.save(); if (MIRROR()) { ctx.translate(W, 0); ctx.scale(-1, 1); } drawFighter(f); ctx.restore();
  ctx.save(); ctx.translate(W / 2 + (1 - k) * W * ((f.id === 0) !== MIRROR() ? -1 : 1), 170); ctx.rotate(-0.06);
  const col = isUlt ? '#ffb300' : f.ch.tf.color;
  const g = ctx.createLinearGradient(-W, 0, W, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(-W, -55, W * 2, 110);
  ctx.save(); ctx.beginPath(); ctx.rect(-W, -55, W * 2, 110); ctx.clip();
  drawPig(-260, 120, 1, f.C, { scale: 1.6, victory: true, t: gT, aura: col });
  ctx.restore();
  txt(isUlt ? '필살기!' : '변신!', 60, -26, 22, '#fff', '#000', 5);
  txt((isUlt ? f.ch.ult.name : f.ch.tf.name) + '!!', 60, 14, 46, '#fff', '#000', 9);
  ctx.restore();
}
function drawFight() {
  ctx.save();
  if (scene === 'roundEnd' && roundWinner && roundMsg !== 'TIME OVER' && sceneT < 90) {
    const L = roundWinner.opp, z = 1 + 0.4 * Math.sin(clamp(sceneT / 90) * Math.PI), cx = clamp(MIRROR() ? W - L.x : L.x, 220, W - 220), cy = L.y - 90;
    ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy);
  }
  if (MIRROR()) { ctx.translate(W, 0); ctx.scale(-1, 1); }
  drawStage();
  if (timeStopped()) { ctx.fillStyle = 'rgba(30,20,60,0.55)'; ctx.fillRect(0, 0, W, H); }   // 시간 정지: 세상이 어둡게 멈춤
  for (const f of [p1, p2]) if (f.curseT > 0) drawDomain(f);   // 저주 결계: 화면 전체 (두 돼지 모두 결계 안에)
  groundPass = true; for (const o of objs) if (o.owner && o.kind === 'sauce') drawBigObj(o); groundPass = false;   // 바닥 물건은 돼지보다 먼저
  const order = p1.state === 'attack' || p1.state === 'ult' || p1.state === 'grabbing' ? [p2, p1] : [p1, p2];
  for (const f of order) drawFighter(f);
  drawObjs();
  drawBlackout();
  if (bfT > 0) { ctx.save(); ctx.fillStyle = bfT % 4 < 2 ? `rgba(0,0,0,${bfT / 20})` : `rgba(183,28,28,${bfT / 26})`; ctx.fillRect(-20, -20, W + 40, H + 40); ctx.restore(); bfT--; }
  drawParts();
  ctx.restore();
  drawHUD();
  if (evBannerT > 0 && scene === 'fight') { ctx.globalAlpha = clamp(evBannerT / 20); ctx.fillStyle = 'rgba(0,0,0,0.6)'; rr(W / 2 - 250, 96, 500, 34, 10); ctx.fill(); txt(evBanner, W / 2, 113, 17, '#fff59d', null); ctx.globalAlpha = 1; }
  if (superFreeze > 0 && superOwner) drawSuperBanner();
  if (superFreeze > 2 && superOwner && mode !== 3) { txt(TOUCH ? '탭하면 건너뛰기' : 'Enter · Space 건너뛰기', W - 16, H - 30, 12, '#ccc', '#000', 3, 'right'); addHot(0, 0, W, H, () => { pressed.Enter = true; }); }
  if (TSTOP) { const s = TSTOP.left / 60; txt(`⏱ 시간 정지 ${s.toFixed(1)}초`, W / 2, 150, 34, s < 1 && gT % 10 < 5 ? '#fff' : '#d1c4e9', '#311b92', 7); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(W / 2 - 120, 172, 240, 8); ctx.fillStyle = '#b388ff'; ctx.fillRect(W / 2 - 120, 172, 240 * TSTOP.left / TSTOP.max, 8); }
  // 라운드 큰 글씨 뒤에 어두운 띠: 배경 네온 간판(꿀꿀 포차 · 철판 대난투)과 글자가 섞여 보이지 않게
  if (scene === 'intro' || (scene === 'roundEnd' && sceneT > 5)) {
    ctx.save(); ctx.globalAlpha = clamp((scene === 'intro' ? sceneT : sceneT - 5) / 12) * 0.7;
    ctx.fillStyle = '#0a0514'; ctx.fillRect(0, H / 2 - 125, W, 165); ctx.restore();
  }
  if (scene === 'intro') {
    if (sceneT < 75) txt(p1.wins === 1 && p2.wins === 1 ? 'FINAL ROUND' : `ROUND ${round}`, W / 2, H / 2 - 40, 64, '#fff', '#000', 10);
    else txt('FIGHT!', W / 2, H / 2 - 40, 80 * (1 + clamp((90 - sceneT) / 30)), '#ffeb3b', '#c62828', 12);
  } else if (scene === 'roundEnd') {
    if (sceneT < 8) { ctx.fillStyle = `rgba(255,255,255,${0.7 * (1 - sceneT / 8)})`; ctx.fillRect(0, 0, W, H); }
    if (sceneT > 5 && sceneT < 110) txt(roundMsg, W / 2, H / 2 - 60, 80, '#ff5252', '#fff', 10);
    if (sceneT > 70 && roundWinner) txt(`${roundWinner.base} 승리!`, W / 2, H / 2 - (sceneT < 110 ? 0 : 90), 40, '#fff', '#000', 7);
    if (sceneT >= 100 && roundWinner) {
      const r = roundWinner.hp / roundWinner.maxHp;
      const g = r >= 0.7 ? '1++ 등급' : r >= 0.4 ? '1 등급' : '합격';
      const sk = sceneT < 110 ? lerp(3, 1, (sceneT - 100) / 10) : 1;
      drawStamp(W / 2, H / 2 + 20, g, '돼지고기 등급 판정', sk, -0.12);
    }
    if (sceneT > 150 && roundWinner && roundWinner.wins >= 2) txt('패배한 돼지의 운명은...?', W / 2, H / 2 + 110, 28, '#ffcdd2', '#000', 6);
  }
}

function drawSelect() {
  ctx.drawImage(bgC, 0, 0, W, H);
  ctx.fillStyle = 'rgba(10,5,20,0.75)'; ctx.fillRect(0, 0, W, H);
  txt('캐릭터 선택', W / 2, 36, 36, '#fff', '#000', 7);
  txt('A/D/W/S 또는 방향키 이동 · I / Space / Enter 결정 · Esc 뒤로', W / 2, 64, 13, '#aaa', null);
  const sh = shownIdx(), SEL_COLS = selCols(), cw = Math.min(126, Math.floor((W - 20) / SEL_COLS)), ch = 112, gx = (W - SEL_COLS * cw) / 2, gy = 80;
  const selRows = Math.ceil(sh.length / SEL_COLS), selOff = clamp((Math.max(0, sh.indexOf(sel.c1)) / SEL_COLS | 0) - 1, 0, Math.max(0, selRows - 2));   // 두 줄씩 보여 주고 고른 줄 따라 스크롤
  sel.offS = sel.offS == null ? selOff : sel.offS + (selOff - sel.offS) * 0.22; if (Math.abs(sel.offS - selOff) < 0.01) sel.offS = selOff;
  if (selOff > 0) txt('▲', W - 10, 92, 14, '#ffcc80', '#000', 3); if (selOff + 2 < selRows) txt('▼', W - 10, 296, 14, '#ffcc80', '#000', 3);
  ctx.save(); ctx.beginPath(); ctx.rect(0, gy, W, ch * 2); ctx.clip();
  sh.forEach((i, pos) => {
    const row = (pos / SEL_COLS | 0) - sel.offS; if (row <= -1 || row >= 2) return;
    const c = getChar(i), x = gx + (pos % SEL_COLS) * cw, y = gy + row * ch;
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; rr(x + 4, y + 4, cw - 8, ch - 8, 10); ctx.fill();
    if (!isUnlocked(c)) {   // 잠긴 돼지: 검은 실루엣 + 자물쇠
      drawPig(x + cw / 2 - 6, y + ch - 26, 1, c.look, { scale: 0.5, t: 0, filter: 'brightness(0)', alpha: 0.6 });
      txt('🔒', x + cw / 2, y + 42, 26, '#fff', null);
      { const lk = c.buy ? '🪙 도감에서' : c.quest ? '🎯 퀘스트' : c.unlock === 'admin' ? '🎁 관리자 선물' : `${TIERS[c.unlock][0]} 해금`; txt(lk, x + cw / 2, y + ch - 14, fitSize(lk, 13, cw - 8), c.buy ? '#ffd740' : c.quest ? '#69f0ae' : c.unlock === 'admin' ? '#ce93d8' : TIERS[c.unlock][2], '#000', 3); }
    } else {
      drawPig(x + cw / 2 - 6, y + ch - 26, 1, c.look, { scale: 0.5, t: gT + i * 10 });
      txt(c.name, x + cw / 2, y + ch - 14, fitSize(c.name, 15, cw - 8), '#fff', '#000', 3);
    }
    if (row > -0.5 && row < 1.5) addHot(x + 4, y + 4, cw - 8, ch - 8, () => { if (sel.c1 === i) pressed.Enter = true; else { sel.c1 = i; SFX.select(); } });
    if (sel.c1 === i) { ctx.strokeStyle = gT % 20 < 10 ? '#ff5252' : '#ff8a80'; ctx.lineWidth = 5; rr(x + 3, y + 3, cw - 6, ch - 6, 10); ctx.stroke(); }
  });
  ctx.restore();
  const c = getChar(sel.c1), x = 160;
  if (!c) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; rr(x, 312, 640, 216, 12); ctx.fill();
    txt('나만의 돼지를 만들어 보세요!', W / 2, 380, 28, '#ffd54f', '#000', 6);
    txt('색 · 장식 · 스킬 · 필살기를 고르고, 체력/파워/스피드에 9포인트를 나눠요', W / 2, 420, 15, '#fff', null);
    txt(TOUCH ? '탭하거나 Enter' : 'Enter 또는 C', W / 2, 460, 16, '#aaa', null);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(14, 14, 70, 30, 8); ctx.fill(); txt('← 뒤로', 49, 29, 13, '#fff', null);
    addHot(14, 14, 70, 30, () => { pressed.Escape = true; });
    return;
  }
  if (!isUnlocked(c)) {   // 잠긴 돼지 설명: 정체는 살짝만 공개
    const adm = c.unlock === 'admin', tc = adm ? ['관리자 선물', 0, '#ce93d8'] : TIERS[c.unlock];
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; rr(x, 312, 640, 216, 12); ctx.fill();
    ctx.strokeStyle = tc[2]; ctx.lineWidth = 2; rr(x, 312, 640, 216, 12); ctx.stroke();
    drawPig(x + 540, 480, -1, c.look, { scale: c.scale * 0.95, t: 0, filter: 'brightness(0)', alpha: 0.7 });
    txt(`🔒 ${c.name}`, x + 20, 340, 26, tc[2], '#000', 5, 'left');
    txt(c.title, x + 20, 372, 15, '#ddd', null, 0, 'left');
    if (adm) {   // 관리자 선물 돼지
      txt(c.buy ? `🪙 돼지 도감에서 ${fmtN(c.buy)}에 살 수 있어요` : c.quest ? '🎯 퀘스트를 깨면 얻는 돼지예요' : '🎁 관리자가 선물로 주는 특별한 돼지예요', x + 20, 410, 18, '#fff', null, 0, 'left');
      txt(`스킬: ${c.skill.name} · 필살기: ${c.ult.name}`, x + 20, 444, 14, '#d1c4e9', null, 0, 'left');
      txt(c.buy ? '메인 화면 → 🐷 돼지 도감에서 골라 Enter' : c.quest ? (c.how || '🎁 보상 센터의 퀘스트에서 얻어요') : '관리자에게 받으면 바로 쓸 수 있어요', x + 20, 478, 13, '#aaa', null, 0, 'left');
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(14, 14, 70, 30, 8); ctx.fill(); txt('← 뒤로', 49, 29, 13, '#fff', null);
      addHot(14, 14, 70, 30, () => { pressed.Escape = true; });
      return;
    }
    txt(`랭크전에서 🏅 ${tc[0]} 티어를 달성하면 해금!`, x + 20, 410, 18, '#fff', null, 0, 'left');
    txt(`지금 ${tierLabel(tp)} · ${tp} / ${tc[1]}점`, x + 20, 440, 14, '#ffe082', null, 0, 'left');
    ctx.fillStyle = '#333'; ctx.fillRect(x + 20, 456, 300, 10); ctx.fillStyle = tc[2]; ctx.fillRect(x + 20, 456, 300 * clamp(tp / tc[1]), 10);
    txt(`💰 ${c.perk || ''}`, x + 20, 492, 14, '#ffd54f', null, 0, 'left');
    txt('한 번 해금하면 티어가 떨어져도 계속 쓸 수 있어요', x + 20, 514, 12, '#aaa', null, 0, 'left');
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(14, 14, 70, 30, 8); ctx.fill(); txt('← 뒤로', 49, 29, 13, '#fff', null);
    addHot(14, 14, 70, 30, () => { pressed.Escape = true; });
    return;
  }
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; rr(x, 312, 640, 216, 12); ctx.fill();
  ctx.strokeStyle = '#ff5252'; ctx.lineWidth = 2; rr(x, 312, 640, 216, 12); ctx.stroke();
  drawPig(x + 540, 480, -1, c.look, { scale: c.scale * 0.95, t: gT });
  txt(c.name, x + 20, 336, 26, '#ff5252', '#000', 5, 'left');
  { const tl = `${c.title} · ${c.type}${c.perk ? ' · 💰 ' + c.perk : ''}`; txt(tl, x + 20, 366, fitSize(tl, 14, 440), '#ddd', null, 0, 'left'); }
  if (c.stats) {   // 스탠드 사용자: 만화처럼 스탠드 능력치 (A~E) + 육각형 그래프
    txt(`【스탠드】 ${c.standName}`, x + 20, 388, fitSize(`【스탠드】 ${c.standName}`, 13, 340), c.standCol || '#d1c4e9', '#000', 3, 'left');
    c.stats.forEach(([nm, g], i) => { const sx = x + 20 + (i % 3) * 108, sy = 410 + (i / 3 | 0) * 22; txt(nm, sx, sy, 11, '#bbb', null, 0, 'left'); txt(g, sx + 74, sy, 17, g === 'A' ? '#ff5252' : '#ffd54f', '#000', 4, 'left'); });
    const hx0 = x + 395, hy0 = 410, R = 30, val = g => ({ A: 1, B: 0.8, C: 0.6, D: 0.4, E: 0.2 }[g] || 0.5);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
    for (const rr2 of [1, 0.5]) { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * Math.PI / 3; ctx.lineTo(hx0 + Math.cos(a) * R * rr2, hy0 + Math.sin(a) * R * rr2); } ctx.closePath(); ctx.stroke(); }
    ctx.beginPath(); c.stats.forEach(([, g], i) => { const a = -Math.PI / 2 + i * Math.PI / 3, r = R * val(g); ctx.lineTo(hx0 + Math.cos(a) * r, hy0 + Math.sin(a) * r); }); ctx.closePath();
    ctx.fillStyle = 'rgba(255,82,82,0.45)'; ctx.fill(); ctx.strokeStyle = '#ff5252'; ctx.lineWidth = 2; ctx.stroke();
    c.stats.forEach(([, g], i) => { const a = -Math.PI / 2 + i * Math.PI / 3; txt(g, hx0 + Math.cos(a) * (R + 10), hy0 + Math.sin(a) * (R + 10), 10, '#fff', '#000', 3); });
  } else {
  [['체력', c.hp / 130], ['파워', c.power / 1.2], ['스피드', c.speed / 1.3]].forEach(([n, v], i) => {
    const by = 390 + i * 18;
    txt(n, x + 20, by, 12, '#bbb', null, 0, 'left');
    ctx.fillStyle = '#333'; ctx.fillRect(x + 70, by - 5, 160, 10);
    ctx.fillStyle = '#ff5252'; ctx.fillRect(x + 70, by - 5, 160 * v, 10);
  });
  // 필살 게이지 충전 속도 (캐릭터마다 다름)
  const ur = c.ultRate ?? 1;
  txt('필살 충전', x + 250, 390, 12, '#bbb', null, 0, 'left');
  ctx.fillStyle = '#333'; ctx.fillRect(x + 312, 385, 110, 10);
  ctx.fillStyle = '#ffb300'; ctx.fillRect(x + 312, 385, 110 * clamp((ur - 0.6) / 0.7), 10);
  txt(ur >= 1.15 ? '빠름' : ur <= 0.85 ? '느림' : '보통', x + 312, 408, 12, '#ffcc80', null, 0, 'left');
  }
  ctx.fillStyle = '#ff5252'; rr(x + 470, 324, 150, 40, 10); ctx.fill(); txt(selFor === 'online' ? '이 돼지로 온라인!' : '이 돼지로 시작!', x + 545, 344, 16, '#fff', null);
  addHot(x + 470, 324, 150, 40, () => { pressed.Enter = true; });
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(14, 14, 70, 30, 8); ctx.fill(); txt('← 뒤로', 49, 29, 13, '#fff', null);
  addHot(14, 14, 70, 30, () => { pressed.Escape = true; });
  { const sl = `스킬 [${TOUCH ? '스킬 버튼 · ↓→+공격' : 'U · K+L'}]: ${c.skill.name} — ${c.skill.desc}`; txt(sl, x + 20, 452, fitSize(sl, 14, 612), '#ffdd33', null, 0, 'left'); }
  { const sl = `업어치기 [${TOUCH ? '업어치기 버튼 · ↓←+공격' : 'J · I+K'}]: 메치고 연타로 다지기`; txt(sl, x + 20, 476, fitSize(sl, 14, 612), '#e1bee7', null, 0, 'left'); }
  { const sl = `필살기 [${TOUCH ? '필살기 버튼 · →→+공격' : 'Y · A+D→K+O'}]: ${c.ult.name} — ${c.ult.desc}`; txt(sl, x + 20, 500, fitSize(sl, 14, 612), '#ffab91', null, 0, 'left'); }
}
// 그만하기 버튼 (랭크전 싸움 도중엔 패배 처리라서 한 번 더 눌러야 나감)
let quitAskT = 0;
function drawQuitBtn(x, y, w, h) {
  const risky = ranked && scene !== 'vs';
  if (quitAskT > 0) quitAskT--;
  const ask = risky && quitAskT > 0;
  ctx.fillStyle = ask ? 'rgba(198,40,40,0.9)' : 'rgba(0,0,0,0.5)'; rr(x, y, w, h, 8); ctx.fill();
  const qt = ask ? '한 번 더: 패배로 나가기' : mode === 6 ? (TOUCH ? '🚪 연습 나가기' : '🚪 연습 나가기 [Esc]') : '그만하기';
  txt(qt, x + w / 2, y + h / 2, fitSize(qt, 14, w - 8), '#fff', null);
  addHot(x, y, w, h, () => { if (risky && quitAskT <= 0) { quitAskT = 150; SFX.select(); } else { quitAskT = 0; pressed.Escape = true; } });
}
function drawVs() {
  const k = ease(sceneT / 20);
  ctx.fillStyle = '#b71c1c'; poly([[0, 0], [W / 2 + 60, 0], [W / 2 - 60, H], [0, H]]); ctx.fill();
  ctx.fillStyle = '#0d47a1'; poly([[W / 2 + 60, 0], [W, 0], [W, H], [W / 2 - 60, H]]); ctx.fill();
  const sw = MIRROR(), lf = sw ? p2 : p1, rf = sw ? p1 : p2;   // 온라인 게스트는 내 돼지가 왼쪽
  drawPig(lerp(-200, 260, k), 420, 1, lf.C, { scale: 2, t: gT, victory: true });
  drawPig(lerp(W + 200, 700, k), 420, -1, rf.C, { scale: 2, t: gT + 20, victory: true });
  if (mode === 4) {
    txt(p1.base, 220, 470, 34, '#fff', '#000', 8); txt(`×${bet4.oa.toFixed(2)} · ${COND[bet4.ca]} · 승률 ${Math.round(bet4.pa * 100)}%`, 220, 505, 17, '#ffd740', '#000', 4);
    txt(p2.base, 740, 470, 34, '#fff', '#000', 8); txt(`×${bet4.ob.toFixed(2)} · ${COND[bet4.cb]} · 승률 ${Math.round((1 - bet4.pa) * 100)}%`, 740, 505, 17, '#ffd740', '#000', 4);
    txt('🎲 AI 경기', W / 2, 50, 28, '#ffd740', '#000', 6);
    txt(bet4.stake ? `${(bet4.side ? p2 : p1).base}에 ${fmtN(bet4.stake)}코인!` : '구경 모드', W / 2, 92, 18, '#fff', '#000', 4);
    txt('VS', W / 2, H / 2 - 40, 120 * (1 + (1 - k)), '#ffeb3b', '#000', 14);
    return;
  }
  if (mode === 3) {
    const [li, ri] = sw ? [1, 0] : [0, 1];
    txt(NET.names[li], 220, 470, fitSize(NET.names[li], 34, 400), '#fff', '#000', 8); txt(lf.base, 220, 505, 18, '#ffcdd2', '#000', 4);
    txt(NET.names[ri], 740, 470, fitSize(NET.names[ri], 34, 400), '#fff', '#000', 8); txt(rf.base, 740, 505, 18, '#bbdefb', '#000', 4);
    if (NET.tps) { drawTierBadge(220, 432, NET.tps[li], 13); drawTierBadge(740, 432, NET.tps[ri], 13); }
    txt(`온라인 대전 · 코드 ${NET.code}`, W / 2, 50, 28, '#80d8ff', '#000', 6);
    txt('◀ 나 (왼쪽)', W / 2, 92, 18, '#ffeb3b', '#000', 4);
    txt('VS', W / 2, H / 2 - 40, 120 * (1 + (1 - k)), '#ffeb3b', '#000', 14);
    return;
  }
  txt(playerName, 220, 470, fitSize(playerName, 36, 400), '#fff', '#000', 8); txt(`${p1.base} · ${p1.ch.title}`, 220, 505, 18, '#ffcdd2', '#000', 4);
  txt(`${p2.base} Lv.${oppLv() + 1}`, 740, 470, 36, '#fff', '#000', 8); txt(p2.ch.title, 740, 505, 18, '#bbdefb', '#000', 4);
  txt(streak === 0 ? '첫 번째 상대!' : `현재 ${streak}연승 · ${streak + 1}번째 도전자`, W / 2, 50, 28, '#ffeb3b', '#000', 6);
  const betUI = mode === 1 && coins > 0;   // 베팅 창이 떠 있으면 VS를 아래로 내리고 조금 작게 (창 글씨와 겹치지 않게)
  txt('VS', W / 2, betUI ? H / 2 + 5 : H / 2 - 40, (betUI ? 96 : 120) * (1 + (1 - k)), '#ffeb3b', '#000', 14);
  if (mode === 1 && coins > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; rr(W / 2 - 300, 88, 600, 118, 14); ctx.fill();
    txt(`🪙 운명의 베팅 (보유 ${fmtN(coins)} 코인) — 남은 시간 ${Math.max(0, Math.ceil((600 - sceneT) / 60))}초`, W / 2, 108, 16, '#ffd740', null);
    const opts = [['베팅 안 함', '안전하게'], [`절반 ${fmtN(Math.floor(coins / 2))}`, '이기면 2배'], [`올인 ${fmtN(coins)}`, '이기면 3배!']];
    opts.forEach(([a, b], i) => {
      const x = W / 2 - 285 + i * 192, y = 124, on = betSel === i;
      ctx.fillStyle = on ? (i === 2 ? '#ff5252' : '#ffd740') : 'rgba(255,255,255,0.15)'; rr(x, y, 180, 50, 10); ctx.fill();
      txt(`${i + 1}. ${a}`, x + 90, y + 18, 16, on ? '#000' : '#fff', null); txt(b, x + 90, y + 38, 12, on ? '#333' : '#ccc', null);
      addHot(x, y, 180, 50, () => { if (betSel === i) pressed.Enter = true; else betSel = i; });
    });
    txt(TOUCH ? '고른 칸을 한 번 더 탭하면 시작' : '1/2/3 또는 ←→ 선택 · Enter 시작', W / 2, 190, 13, '#ccc', null);
  } else addHot(0, 0, W, H, () => { pressed.Enter = true; });
  if (mode === 1) drawQuitBtn(W - 134, 10, 120, 34);
}
function draw() {
  hot = []; syncPad(); if (AC) setMusic(trackFor(scene));
  ctx.setTransform(RES, 0, 0, RES, 0, 0);   // 고해상도 화면에서도 선명하게
  ctx.save();
  if (scene === 'title') drawTitle();
  else if (scene === 'opening') drawOpening();
  else if (scene === 'online') drawOnline();
  else if (scene === 'market') { drawMarket(); if (qm) drawQty(); }
  else if (scene === 'betpick') drawBetPick();
  else if (scene === 'story') drawStory();
  else if (scene === 'bank') { drawBank(); ctx.fillStyle = 'rgba(0,0,0,0.55)'; rr(14, 10, 90, 30, 8); ctx.fill(); txt('← 나가기', 59, 25, 13, '#fff', null); addHot(14, 10, 90, 30, () => { pressed.Escape = true; }); }   // 마우스·터치로 나가기
  else if (scene === 'endings') drawEndings();
  else if (scene === 'worlds') drawWorlds();
  else if (scene === 'wplay') drawCatch();
  else if (scene === 'wstory') drawWStory();
  else if (scene === 'stock') drawStock();
  else if (scene === 'lobby') drawLobby();
  else if (scene === 'snipe') drawSnipe();
  else if (scene === 'butcher') drawButcher();
  else if (scene === 'stall') drawStall();
  else if (scene === 'reward') drawReward();
  else if (scene === 'trailer') drawTrailer();
  else if (scene === 'nrtrailer') drawNrTrailer();
  else if (scene === 'ittrailer') drawItTrailer();
  else if (scene === 'bigtrailer') drawBigTrailer();
  else if (scene === 'big2trailer') drawBig2Trailer();
  else if (scene === 'keys') drawKeys();
  else if (scene === 'pigs') drawPigs();
  else if (scene === 'cutlist') drawCutList();
  else if (scene === 'revive') drawRevive();
  else if (scene === 'tycoon') drawTycoon();
  else if (scene === 'select') drawSelect();
  else if (scene === 'vs') drawVs();
  else if (scene === 'ranking') drawRanking();
  else if (scene === 'cutscene') drawCutscene();
  else { if (shake > 0.5) ctx.translate(rand(-shake, shake), rand(-shake, shake)); drawFight(); }
  ctx.restore();
  ctx.drawImage(vigC, 0, 0);
  const grp = ['intro', 'fight', 'roundEnd'].includes(scene) ? 'fight' : scene;
  if (grp !== lastGrp) { lastGrp = grp; fadeA = 1; }
  if (fadeA > 0) { ctx.fillStyle = `rgba(0,0,0,${fadeA})`; ctx.fillRect(0, 0, W, H); fadeA = Math.max(0, fadeA - 0.08); }
  if (toastT > 0 && scene !== 'title') {

    ctx.globalAlpha = clamp(toastT / 20); ctx.fillStyle = 'rgba(0,0,0,0.85)'; rr(W / 2 - 200, H - 90, 400, 34, 10); ctx.fill();
    txt(toastMsg, W / 2, H - 73, 15, '#fff', null); ctx.globalAlpha = 1;
  }
  if (mode === 5 && ['intro', 'fight', 'roundEnd'].includes(scene)) drawTutorial();   // 튜토리얼 설명 칸
  drawTour(); if (tutOffer && scene === 'title') drawTutOffer();
  if (BCAST && bcastT > 0) { bcastT--; ctx.save(); ctx.fillStyle = 'rgba(183,28,28,0.92)'; ctx.fillRect(0, 0, W, 26); ctx.font = `900 15px ${FONT}`; const msg = '📣 관리자: ' + BCAST.text, tw = ctx.measureText(msg).width, x = W - ((gT * 2) % (tw + W)); txt(msg, x, 13, 15, '#fff', '#000', 3, 'left'); ctx.restore(); }   // 위쪽 흐르는 관리자 메시지 띠
  drawPopup();
  drawPromoFx();   // 🏆 승급 연출 (맨 위)
  if (mode === 3 && NET.ready && NET.remote[NET.f] === undefined && performance.now() - NET.lastRecv > 300) txt('상대 기다리는 중...', W / 2, H / 2 + 120, 20, '#fff', '#000', 5);
}

