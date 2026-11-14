// ================= 🆕 신캐릭터 업데이트 (2026-11-12 오후 3:40 공개) =================
// 볼트돈: 사이버 돼지. 스킬 3개(U / ↓+U / →+U) · 필살기 '메가 강화 슈트' 20초 · 행운 룰렛에서 얻음
// 돼루토: 닌자 돼지. 스킬 3개 · U 분신술(분신 2마리가 대신 싸움, 한 대 맞으면 둘 다 펑) · 필살기 '구미호 모드' · 퀘스트로 얻음
const RELEASE_T = Date.parse('2026-11-12T15:40:00+09:00');
const isReleased = () => Date.now() >= RELEASE_T || /newchars/.test(location.search);
const NEW_CHARS = ['볼트돈', '돼루토'];
{ const c = CHARS.find(x => x.name === '볼트돈'); if (c) c.look.pixel = true; }   // 볼트돈만 도트 그림
// 스킬 고르기: 여러 스킬이 있는 돼지는 U만 = 1번, ↓+U = 2번, 앞(→)+U = 3번
function pickSkill(f) {
  if (cursed(f) && f.ch.curseSkills) { const c = f.ch.curseSkills, i2 = f.inp || {}, fw2 = i2.right || i2.left; return i2.down ? c[1] : fw2 ? c[2] : c[0]; }   // 저주왕: 스킬 세트가 바뀜
  const ss = f.ch.skills; if (!ss) return f.ch.skill;
  const i = f.inp || {}, side = i.right || i.left;   // 좌우 어느 쪽이든 누른 채 U = 세 번째 스킬 (보는 방향 상관없이)
  return i.down ? ss[1] : side ? ss[2] : ss[0];
}
// 스킬을 쓸 때 특별한 효과
function newSkillStart(f, s) {
  nxSkillStart(f, s);   // 대규모 업데이트 3~20 돼지
  nySkillStart(f, s);   // 대규모 업데이트 21~30 돼지
  bigSkillStart(f, s);   // 대규모 업데이트 돼지
  itSkillStart(f, s);   // 이타돼리
  const k = f.sc / 1.15;
  if (s.type === 'rasen') { superFreeze = RASEN_CUT; superOwner = f; superKind = 'rasen'; }   // 회오리 구슬: 모으는 컷신 뒤에 날림
  if (s.type === 'sande') { f.sandT = 150; SFX.special(); burst(f.x, f.y - 90 * k, 24, ['#00e5ff', '#76ff03', '#fff'], 9); popText(f.x, f.y - 230 * k, '세상이 느려진다...', '#76ff03', 22); }
  if (s.type === 'kageClone') {
    for (const o of objs) if (o.kind === 'pclone' && o.owner === f) o.life = 0;
    for (let i = 0; i < 2; i++) { smokePuff(f.x + (i ? 1 : -1) * 70, f.y - 70); addObj({ owner: f, kind: 'pclone', x: clamp(f.x + (i ? 1 : -1) * 70, 40, W - 40), y: GROUND, w: 70, h: 140, life: 600, dmg: 0, face: f.facing, cd: 20 + i * 22, hop: 0 }); }
    popText(f.x, f.y - 230 * k, '분신술!!', '#ffab40', 30);
  }
}
// 분신: 상대에게 걸어가서 때림. 상대 공격이 닿거나(한 대) 상대가 분신을 맞히면 둘 다 펑
function cloneTick(o) {
  const f = o.owner, d = f.opp;
  if (scene !== 'fight' || f.state === 'ko') { o.life = 0; return; }
  const dx = d.x - o.x; o.face = Math.sign(dx) || o.face;
  if (Math.abs(dx) > 95) o.x += Math.sign(dx) * 3.4; else if (--o.cd <= 0) {
    o.cd = 38; o.punch = 10;
    if (Math.abs(d.y - GROUND) < 120) dealHit(f, d, { dmg: 3.5, height: 'mid', kb: 3, stun: 14, src: o.x, kind: 'skill', clone: true, noPart: true, hitstop: 3, txt: ['분신 펀치!', '팍!', '퍽!'] });
  }
  if (o.punch > 0) o.punch--;
  o.x = clamp(o.x, 40, W - 40);
  const a = d.atk;
  if (d.state === 'attack' && a && d.af >= a.startup && d.af < a.startup + a.active && Math.abs(d.x + d.facing * (a.range || 150) * 0.6 - o.x) < (a.range || 150) * 0.6 && Math.sign(o.x - d.x) === d.facing) {
    for (const c of objs) if (c.kind === 'pclone' && c.owner === f) { c.life = 0; smokePuff(c.x, GROUND - 70); }
    popText(o.x, GROUND - 180, '펑!', '#fff', 30); SFX.whiff();
  }
}
function drawClone(o) {
  const f = o.owner;
  ctx.save(); ctx.globalAlpha = 0.82;
  drawPig(o.x, GROUND, o.face, f.C, { t: gT + o.x, scale: f.ch.scale * 0.95, move: o.punch > 0 ? 'punch' : null, k: o.punch > 0 ? 0.9 : 0, walk: Math.abs(f.opp.x - o.x) > 95 });
  ctx.restore();
}
// 필살기 (컷신 뒤 시작)
function newUltUpdate(f, o, T) {
  const type = f.ch.ult.type, s = f.sc / 1.15;
  f.vx = 0;
  if (type === 'cyberSkel' && T === 6) {
    f.cyberT = 720; shake = 18; SFX.slam(); burst(f.x, f.y - 100 * s, 50, ['#00e5ff', '#ff1744', '#cfd8dc', '#fff'], 12);
    popText(f.x, f.y - 260 * s, '메가 강화 슈트 · 12초!!', '#00e5ff', 32);
    if (Math.abs(o.x - f.x) < 260) dealHit(f, o, { dmg: 16, launch: -14, kb: 16, stun: 40, src: f.x, kind: 'ult', height: 'mid', hitstop: 16, shake: 16, txt: ['슈트 충격파!!'] });
    ultEnd(f, o);
  }
  if (type === 'gumiho') {
    if (T === 6) { f.foxT = 720; shake = 20; SFX.boom(); burst(f.x, f.y - 100 * s, 60, ['#ff6d00', '#ffab40', '#ffd180', '#fff'], 13); popText(f.x, f.y - 260 * s, '구미호 모드!!', '#ff6d00', 34); }
    if (T === 16 && Math.abs(o.x - f.x) < 340) dealHit(f, o, { dmg: 22, launch: -16, kb: 20, stun: 45, src: f.x, kind: 'ult', height: 'mid', hitstop: 18, shake: 18, txt: ['꼬리 휩쓸기!!'] });
    if (T >= 24) ultEnd(f, o);
  }
}
const NEW_ULT_CUT = 100;   // 필살기 컷신 길이 (프레임)
// ---- 🌀 회오리 구슬 컷신: 손바닥 위에서 바람이 빨려 들며 구슬이 커지고, 마지막에 번쩍 ----
const RASEN_CUT = 70;
SFX.rasenHit = () => { SFX.boom(); nz(0.7, { v: 0.4, freq: 3200, f2: 260, type: 'bandpass', q: 1 }); tone(880, 0.4, 'sine', 0.08, 110); };   // 회오리 구슬 맞을 때: 쾅 + 바람 터짐
function drawRasenCut(f) {
  const T = RASEN_CUT - superFreeze, k = Math.min(1, T / 50);
  const g = ctx.createRadialGradient(W * 0.62, H / 2, 10, W * 0.62, H / 2, 600); g.addColorStop(0, '#0d47a1'); g.addColorStop(1, '#020814'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(W * 0.62, H / 2);   // 빨려 드는 바람 줄
  for (let i = 0; i < 40; i++) { const a = i * 2.39 + T * 0.18, r = 420 - ((T * 9 + i * 37) % 400); ctx.strokeStyle = `rgba(179,229,252,${0.15 + 0.5 * (1 - r / 420)})`; ctx.lineWidth = 2 + (1 - r / 420) * 3; ctx.beginPath(); ctx.arc(0, 0, r, a, a + 0.5); ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.translate(W * 0.28, H + 40); drawPig(0, 0, 1, f.C, { t: gT, scale: f.ch.scale * 2.1, move: 'punch', k: 0.5 }); ctx.restore();   // 돼루토 클로즈업
  const R = 30 + 110 * k + Math.sin(T * 0.7) * 4, cx = W * 0.62, cy = H / 2;   // 구슬
  ctx.save(); ctx.shadowColor = '#4fc3f7'; ctx.shadowBlur = 50;
  const og = ctx.createRadialGradient(cx, cy, 4, cx, cy, R); og.addColorStop(0, '#ffffff'); og.addColorStop(0.35, '#b3e5fc'); og.addColorStop(0.75, '#29b6f6'); og.addColorStop(1, 'rgba(13,71,161,0)');
  ctx.fillStyle = og; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.8, R * (0.25 + 0.1 * (i % 3)), T * 0.35 + i * 1.05, 0, Math.PI * 1.3); ctx.stroke(); }
  const sh = T > 40 ? (Math.random() - 0.5) * 8 : 0;
  txt('회오리 구슬!!', W / 2 + sh, 80 + sh, 50 * Math.min(1, T / 12), '#e1f5fe', '#01579b', 10);
  if (T > 62) { ctx.fillStyle = `rgba(255,255,255,${(T - 62) / 8})`; ctx.fillRect(0, 0, W, H); }   // 마지막 번쩍
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 26); ctx.fillRect(0, H - 18, W, 18);
}
function drawNewCut(f) {
  const T = NEW_ULT_CUT - superFreeze, cyber = f.ch.ult.type === 'cyberSkel', k = ease(T / 14);
  ctx.fillStyle = cyber ? '#02060c' : '#1a0700'; ctx.fillRect(0, 0, W, H);
  // 배경: 사이버 = 네온 격자 · 구미호 = 붉은 소용돌이
  if (cyber) {
    ctx.strokeStyle = 'rgba(0,229,255,0.35)'; ctx.lineWidth = 1;
    for (let i = -20; i < 20; i++) { line(W / 2 + i * 60, H, W / 2 + i * 12, H * 0.45); }
    for (let j = 0; j < 10; j++) { const y = H * 0.45 + ((j * 30 + T * 4) % 300); line(0, y, W, y); }
    for (let i = 0; i < 40; i++) { ctx.fillStyle = i % 3 ? 'rgba(118,255,3,0.6)' : 'rgba(255,23,68,0.6)'; ctx.fillRect((i * 97 + T * 30) % W, (i * 53) % (H * 0.45), 40, 2); }
  } else {
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(T * 0.04);
    for (let i = 0; i < 18; i++) { ctx.rotate(Math.PI / 9); ctx.fillStyle = i % 2 ? 'rgba(255,109,0,0.35)' : 'rgba(120,20,0,0.5)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-70, -600); ctx.lineTo(70, -600); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    for (let i = 0; i < 9; i++) drawTail(W / 2, H / 2 + 70, -Math.PI / 2 + (i - 4) * 0.32, 260 * k, T, 1);
  }
  // 가운데: 돼지 클로즈업
  ctx.save(); ctx.translate(W / 2 - (cyber ? 20 : 0), H / 2 + (cyber ? 190 : 150)); const sc = (cyber ? 1.15 : 1.9) + T * 0.004;
  const cf = { x: 0, y: 0, facing: 1, sc: f.ch.scale * sc };
  if (cyber) drawCyberBack(cf, Math.min(1, T / 30));
  drawPig(0, 0, 1, f.C, { t: gT, scale: f.ch.scale * sc, victory: true });
  if (cyber) drawCyberFront(cf, Math.min(1, T / 30));
  ctx.restore();
  // 글자
  const name = f.ch.ult.name;
  ctx.save(); ctx.translate((1 - k) * -W, 0);
  ctx.fillStyle = cyber ? 'rgba(0,229,255,0.85)' : 'rgba(255,109,0,0.85)'; ctx.fillRect(0, 60, W, 70);
  txt(name, W / 2, 95, 44, '#fff', cyber ? '#002b36' : '#3e0a00', 9); ctx.restore();
  if (T > 30) txt(cyber ? 'MEGA SUIT · 12 SEC' : '九尾 · 구미호의 힘', W / 2, H - 50, 24, cyber ? '#76ff03' : '#ffd180', '#000', 6);
  if (cyber && T % 12 < 2) { ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(0, 0, W, H); }   // 글리치 번쩍
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 30); ctx.fillRect(0, H - 18, W, 18);
}
// 메가 강화 슈트: 돼지를 통째로 감싸는 거대한 군용 강화 슈트 (등 리액터 · 거대한 기계 팔과 주먹 · 어깨 장갑 · 가슴판 · 다리 피스톤 · 빛나는 바이저)
// 뒤쪽(돼지 뒤에 그림) / 앞쪽(돼지 위에 그림) 두 번 나눠 그림. f: { x, y, facing, sc, state?, af?, atk? }
const CY_DARK = '#17191c', CY_MID = '#33383d', CY_LIGHT = '#5f666d', CY_EDGE = '#9aa3ab';   // 군용 짙은 회색 + 주황빛
function cyPlate(pts, fill, stroke = '#11181c') { ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.closePath(); ctx.fill(); ctx.stroke(); }
function cyGlow(c, b = 14) { ctx.shadowColor = c; ctx.shadowBlur = b; }
function cyBegin(f, a) { ctx.save(); ctx.globalAlpha *= a; ctx.translate(f.x, f.y); const s = f.sc * 0.82; ctx.scale(f.facing * s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; }
function cyPunch(f) { const at = f.atk; return f.state === 'attack' && at && f.af >= at.startup && f.af < at.startup + at.active + 4 ? 1 : 0; }
function drawCyberBack(f, a = 1) {
  cyBegin(f, a);
  const br = Math.sin(gT * 0.15) * 2;
  // 등 리액터 + 배기관
  cyPlate([-150, -215, -85, -225, -70, -60, -140, -50], CY_MID);
  cyPlate([-140, -200, -95, -207, -85, -75, -132, -68], CY_DARK);
  for (let i = 0; i < 4; i++) { cyGlow('#ff6d00'); ctx.fillStyle = `rgba(255,109,0,${0.55 + 0.35 * Math.sin(gT * 0.2 + i)})`; ctx.fillRect(-128, -185 + i * 28, 30, 9); ctx.shadowBlur = 0; }
  for (const [x, h] of [[-138, 60], [-105, 74]]) { cyPlate([x - 9, -215, x + 9, -215, x + 7, -215 - h, x - 7, -215 - h], CY_LIGHT); if (gT % 6 < 3) { ctx.fillStyle = 'rgba(200,220,230,0.35)'; ctx.beginPath(); ctx.arc(x, -225 - h - (gT % 30), 9 + (gT % 30) / 3, 0, Math.PI * 2); ctx.fill(); } }
  // 뒤쪽 거대한 팔
  ctx.strokeStyle = CY_DARK; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(-40, -165 + br); ctx.lineTo(-95, -95); ctx.lineTo(-70, -30); ctx.stroke();
  ctx.strokeStyle = CY_MID; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(-40, -165 + br); ctx.lineTo(-95, -95); ctx.lineTo(-70, -30); ctx.stroke();
  ctx.fillStyle = CY_DARK; ctx.beginPath(); ctx.arc(-68, -22, 36, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#11181c'; ctx.lineWidth = 3; ctx.stroke();
  // 다리 피스톤 (뒤)
  cyPlate([-55, -40, -20, -40, -24, 18, -60, 18], CY_MID);
  ctx.restore();
}
function drawCyberFront(f, a = 1) {
  cyBegin(f, a);
  const br = Math.sin(gT * 0.15) * 2, pu = cyPunch(f) * 48;
  // 가슴판
  cyPlate([-55, -160 + br, 60, -168 + br, 72, -70, 40, -38, -45, -38, -62, -80], 'rgba(69,90,100,0.92)');
  cyPlate([-30, -145 + br, 40, -150 + br, 48, -95, -25, -90], 'rgba(38,50,56,0.95)');
  cyGlow('#ff6d00'); ctx.strokeStyle = '#ff6d00'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-20, -120 + br); ctx.lineTo(10, -120 + br); ctx.lineTo(22, -105); ctx.moveTo(-40, -60); ctx.lineTo(50, -62); ctx.stroke();
  ctx.fillStyle = `rgba(255,109,0,${0.6 + 0.4 * Math.sin(gT * 0.25)})`; ctx.beginPath(); ctx.arc(8, -128 + br, 9, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;   // 가슴 코어
  // 다리 피스톤 (앞) + 발판
  cyPlate([18, -40, 55, -40, 58, 18, 15, 18], CY_LIGHT);
  ctx.strokeStyle = CY_DARK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(36, -36); ctx.lineTo(36, 12); ctx.stroke();
  cyPlate([5, 10, 75, 10, 80, 26, 0, 26], CY_DARK); cyPlate([-70, 10, -10, 10, -6, 26, -75, 26], CY_DARK);
  // 어깨 장갑 (빨간 줄)
  cyPlate([-20, -205 + br, 55, -215 + br, 95, -175 + br, 80, -135, 0, -140], CY_LIGHT);
  ctx.fillStyle = '#d50000'; ctx.fillRect(5, -200 + br, 60, 9);
  // 앞쪽 거대한 팔: 어깨 → 팔꿈치 → 주먹 (공격할 땐 앞으로 쭉)
  const ex = 95 + pu * 0.4, ey = -120, fx = 150 + pu, fy = -110;
  ctx.strokeStyle = '#11181c'; ctx.lineWidth = 40; ctx.beginPath(); ctx.moveTo(45, -170 + br); ctx.lineTo(ex, ey); ctx.lineTo(fx - 20, fy); ctx.stroke();
  ctx.strokeStyle = CY_MID; ctx.lineWidth = 32; ctx.beginPath(); ctx.moveTo(45, -170 + br); ctx.lineTo(ex, ey); ctx.lineTo(fx - 20, fy); ctx.stroke();
  ctx.strokeStyle = CY_LIGHT; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(ex, ey - 12); ctx.lineTo(fx - 26, fy - 12); ctx.stroke();
  ctx.fillStyle = CY_DARK; ctx.beginPath(); ctx.arc(ex, ey, 16, 0, Math.PI * 2); ctx.fill();   // 팔꿈치 관절
  cyGlow('#ff6d00', 8); ctx.fillStyle = '#ff6d00'; ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  rr(fx - 30, fy - 34, 62, 68, 14); ctx.fillStyle = CY_DARK; ctx.fill(); ctx.strokeStyle = '#11181c'; ctx.lineWidth = 3; ctx.stroke();   // 거대한 주먹
  ctx.strokeStyle = CY_LIGHT; ctx.lineWidth = 4; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(fx + 12, fy - 22 + i * 18); ctx.lineTo(fx + 28, fy - 22 + i * 18); ctx.stroke(); }
  if (pu) { cyGlow('#ff1744', 20); ctx.strokeStyle = 'rgba(255,23,68,0.8)'; ctx.lineWidth = 4; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(fx - 60 - i * 25, fy - 20 + i * 12); ctx.lineTo(fx - 20 - i * 25, fy - 20 + i * 12); ctx.stroke(); } ctx.shadowBlur = 0; }
  // 머리 보호대 + 빛나는 바이저
  cyPlate([10, -215 + br, 70, -222 + br, 98, -190 + br, 95, -165 + br, 20, -170 + br], 'rgba(55,71,79,0.95)');
  cyGlow('#ff1744', 18); ctx.fillStyle = `rgba(255,23,68,${0.75 + 0.25 * Math.sin(gT * 0.3)})`; rr(40, -200 + br, 54, 12, 5); ctx.fill();
  ctx.fillStyle = '#ff6d00'; cyGlow('#ff6d00'); ctx.fillRect(28, -196 + br, 8, 4); ctx.shadowBlur = 0;
  // 등에서 나온 케이블 + 가끔 튀는 불꽃
  ctx.strokeStyle = '#0b0b0b'; ctx.lineWidth = 10; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-80, -170 + i * 22); ctx.quadraticCurveTo(-30, -210 + i * 18 + Math.sin(gT * 0.2 + i) * 6, 15, -165 + i * 10 + br); ctx.stroke(); }
  ctx.fillStyle = '#ff6d00'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-80, -170 + i * 22, 6, 0, Math.PI * 2); ctx.fill(); }   // 척추에 꽂힌 케이블 단자
  if (gT % 20 < 2) { ctx.fillStyle = '#ffd740'; for (let i = 0; i < 5; i++) ctx.fillRect(ex + rand(-20, 20), ey + rand(-20, 20), 3, 3); }
  ctx.restore();
}
function drawCyberSkel(f, a = 1) { drawCyberBack(f, a); drawCyberFront(f, a); }
// 외골격도 도트 그림으로 (볼트돈는 전부 픽셀 아트)
const cyBackRaw = drawCyberBack, cyFrontRaw = drawCyberFront;
drawCyberBack = (f, a = 1) => { const s = f.sc * 0.82; pixelate(f.x - 280 * s, f.y - 330 * s, 560 * s, 380 * s, () => cyBackRaw(f, a)); };
drawCyberFront = (f, a = 1) => { const s = f.sc * 0.82; pixelate(f.x - 280 * s, f.y - 330 * s, 560 * s, 380 * s, () => cyFrontRaw(f, a)); };
function drawTail(x, y, ang, len, t, a) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang + Math.sin(t * 0.08 + ang * 3) * 0.12);
  const g = ctx.createLinearGradient(0, 0, len, 0); g.addColorStop(0, `rgba(255,109,0,${0.85 * a})`); g.addColorStop(1, `rgba(255,209,128,${0.2 * a})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -14); ctx.quadraticCurveTo(len * 0.5, -40 + Math.sin(t * 0.1) * 12, len, 0); ctx.quadraticCurveTo(len * 0.5, 30, 0, 14); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// 싸움 화면에서 새 돼지 꾸미기 (몸 뒤/앞)
function drawNewBack(f) {
  const s = f.sc / 1.15;
  if (f.cyberT > 0) drawCyberBack(f, Math.min(1, f.cyberT / 60));   // 메가 강화 슈트 (몸 뒤쪽)
  if (f.sandT > 0 && f.trail) for (let i = 0; i < f.trail.length; i += 2) { const p = f.trail[i]; ctx.save(); ctx.globalAlpha = 0.18 + i * 0.03; drawPig(p[0], p[1], f.facing, i % 4 ? SANDE_G : SANDE_C, { t: gT, scale: f.sc }); ctx.restore(); }
  if (f.foxT > 0) {
    const a = Math.min(1, f.foxT / 60);
    if (gT % 3 === 0) flame(f.x + rand(-50, 50) * s, f.y - rand(20, 160) * s);
  }
}
function drawNewFront(f) {
  const s = f.sc / 1.15;
  if (f.cyberT > 0) { drawCyberFront(f, Math.min(1, f.cyberT / 60)); if (f.cyberT < 180) txt(`슈트 ${Math.ceil(f.cyberT / 60)}초`, f.x, f.y - 230 * s, 16, '#00e5ff', '#000', 4); }
  if (f.state === 'attack' && f.atk && f.atk.rasen && f.af < f.atk.startup + f.atk.active + 4) {   // 회오리 구슬
    const hx = f.x + f.facing * 75 * s, hy = f.y - 95 * s, r = 16 + Math.min(14, f.af);
    const g = ctx.createRadialGradient(hx, hy, 2, hx, hy, r); g.addColorStop(0, '#fff'); g.addColorStop(0.5, '#4fc3f7'); g.addColorStop(1, 'rgba(41,121,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(hx, hy, r * 0.7, gT * 0.5 + i * 2, gT * 0.5 + i * 2 + 1.4); ctx.stroke(); }
  }
  if (f.state === 'attack' && f.atk && f.atk.wire && f.af >= f.atk.startup && f.af < f.atk.startup + f.atk.active) {   // 레이저 채찍
    const hx = f.x + f.facing * 60 * s, hy = f.y - 100 * s, ex = f.x + f.facing * (f.atk.range * s), ey = f.y - 60 * s + Math.sin(f.af * 0.9) * 50;
    ctx.save(); ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 14; ctx.strokeStyle = '#ff5252'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo((hx + ex) / 2, hy - 60 * Math.cos(f.af * 0.7), ex, ey); ctx.stroke(); ctx.restore();
  }
}
const SANDE_C = look('#00e5ff', '#00838f', '#84ffff', '#18ffff', '#006064', '#004d40', '#76ff03', [], 1);
const SANDE_G = look('#76ff03', '#33691e', '#ccff90', '#b2ff59', '#1b5e20', '#1b5e20', '#00e5ff', [], 1);
// ---- 돼루토 얻는 퀘스트 (좀 어렵게): 4단계를 차례로 ----
const NQ = [
  { id: 'streak', name: '연승 모드에서 7연승 하기', goal: 7 },
  { id: 'ranked', name: '랭크전 15번 이기기', goal: 15 },
  { id: 'clear', name: '일일 미션 올 클리어 2번', goal: 2 },
  { id: 'shift', name: '장사 15번 끝내기', goal: 15 }
];
// 👊 이타돼리 퀘스트: 관리자가 공개(또는 다시 열기)한 뒤 10일 안에만 진행 · 깨야 해금
const IQ = [
  { id: 'ranked', name: '랭크전 5번 이기기', goal: 5 },
  { id: 'ultko', name: '필살기로 K.O. 2번', goal: 2 },
  { id: 'streak', name: '연승 모드에서 3연승 하기', goal: 3 },
  { id: 'clear', name: '일일 미션 올 클리어 1번', goal: 1 }
];
// 🚀 우주꿀돈 퀘스트 (대규모 업데이트에서 제일 센 돼지라 퀘스트로)
const SQ = [
  { id: 'spin', name: '행운 룰렛 10번 돌리기', goal: 10 },
  { id: 'ranked', name: '랭크전 8번 이기기', goal: 8 },
  { id: 'shift', name: '장사 20번 끝내기', goal: 20 },
  { id: 'ultko', name: '필살기로 K.O. 3번', goal: 3 }
];
// 🩸 모듈로 각성 퀘스트: 이타돼리를 얻은 뒤, 이타돼리로만 채우는 조건 → 모듈로 모습
const MQ = [
  { id: 'itwin', name: '이타돼리로 40번 이기기', goal: 40 },
  { id: 'itbolt', name: '이타돼리로 검은 번개 100번 터뜨리기', goal: 100 },
  { id: 'itultko', name: '이타돼리 필살기로 K.O. 15번', goal: 15 },
  { id: 'itstreak', name: '이타돼리로 연승 모드 10연승', goal: 10 }
];
const IT_DAYS = 10;
const itWinEnd = () => (REL.itadoriWin || REL.itadori || 0) + IT_DAYS * 86400000;
const itWinOpen = () => /newchars/.test(location.search) || (isRel('itadori') && Date.now() < itWinEnd());
const QUESTS = [
  { ch: '돼루토', icon: '🍥', key: 'sgf_nq', steps: NQ, open: () => isReleased() },
  { ch: '이타돼리', icon: '👊', key: 'sgf_q_it', steps: IQ, open: () => itWinOpen(), timed: true },
  // (모듈로 이타돼리 퀘스트는 뺐음)
  { ch: '우주꿀돈', icon: '🚀', key: 'sgf_q_sp', steps: SQ, open: () => isRel('big1') },
  { ch: '꿀린', icon: '🧙', key: 'sgf_q_wz', steps: [{ id: 'bet', name: 'AI 경기 베팅 10번 하기', goal: 10 }, { id: 'ranked', name: '랭크전 12번 이기기', goal: 12 }, { id: 'streak', name: '연승 모드에서 8연승 하기', goal: 8 }, { id: 'ultko', name: '필살기로 K.O. 5번', goal: 5 }], open: () => isRel('big2') }
];
const qState = Q => lsGet(Q.key, {});
const qDoneN = Q => { const q = qState(Q); return Q.steps.filter(s => (q[s.id] || 0) >= s.goal).length; };
const qOpen = Q => Q.open() && !lsGet(Q.unlockKey || 'sgf_unlock_' + Q.ch, false);
const openQuests = () => QUESTS.filter(qOpen);
function nqState() { return qState(QUESTS[0]); }
function nqStep() { const q = nqState(); return NQ.findIndex(s => (q[s.id] || 0) < s.goal); }
// 진행: 열려 있는 퀘스트 전부에 한꺼번에 쌓임 (각 퀘스트 안의 4가지도 한꺼번에)
function nqAdd(id, v, max) {
  for (const Q of QUESTS) {
    if (!qOpen(Q)) continue;
    const st = Q.steps.find(s => s.id === id); if (!st) continue;
    const q = qState(Q), was = q[id] || 0; if (was >= st.goal) continue;
    q[id] = Math.min(st.goal, max ? Math.max(was, v) : was + v); lsSet(Q.key, q); cloudDirty();
    if (q[id] < st.goal) continue;
    if (qDoneN(Q) >= Q.steps.length) qGrant(Q, `캐릭터 선택에서 ${Q.ch}를 고를 수 있어요`);
    else toast(`${Q.icon} ${Q.ch} 퀘스트 완료: ${st.name} (${qDoneN(Q)}/${Q.steps.length})`);
  }
}
// 이미 다 채운 퀘스트도 해금 (목표를 낮췄을 때 · 다른 기기에서 채웠을 때 등) — 1초마다 확인
function questCheckAll() {
  { const all = awkAll(); let ch = false; for (const [name, A] of Object.entries(AWAKE)) { const q = all[name] || {}; if (!q.done && A.steps.every(st => (q[st.id] || 0) >= st.goal)) { q.done = true; all[name] = q; ch = true; popup({ icon: '⚡', title: `${name} 각성!!!`, lines: [A.title, `체력 ×${A.hp} · 공격력 ×${A.power}`, A.note], big: true }); } } if (ch) { lsSet('sgf_awake', all); cloudDirty(); } }   // 이미 채운 각성 조건도 각성
  for (const Q of QUESTS) if (qOpen(Q) && qDoneN(Q) >= Q.steps.length) qGrant(Q, '캐릭터 선택에서 골라 보세요');
}
function qGrant(Q, pickMsg) {   // 퀘스트 보상 주기 (Q.also: 같이 주는 돼지)
  lsSet(Q.unlockKey || 'sgf_unlock_' + Q.ch, true); for (const n of Q.also || []) lsSet('sgf_unlock_' + n, true); cloudDirty();
  popup({ icon: Q.icon, title: `${Q.prize || Q.ch} 해금!!`, lines: [`퀘스트 ${Q.steps.length}가지를 모두 끝냈어요!`, Q.msg || (Q.prize ? '🐷 돼지 도감에서 모습을 바꿀 수 있어요' : pickMsg)], big: true });
}
function questLines(Q) {
  const q = qState(Q), L = Q.steps.map(s => `${(q[s.id] || 0) >= s.goal ? '✅' : '⬜'} ${s.name}  ${Math.min(q[s.id] || 0, s.goal)}/${s.goal}`);
  if (Q.timed) { const d = Math.max(0, itWinEnd() - Date.now()); L.push(`⏰ 남은 기간 ${Math.floor(d / 86400000)}일 ${Math.floor(d / 3600000) % 24}시간`); }
  return L;
}
function showQuests() {
  const L = openQuests(); if (!L.length) return;
  for (const Q of L) popup({ icon: Q.icon, title: `${Q.prize || Q.ch} 퀘스트 (4가지 다 하면 해금)`, lines: questLines(Q) });
}
// ---- 업데이트 예고편 (공개 시각이 지나면 한 번 자동으로) ----
const TRAILER_T = 900;
let trl = { t: 0, back: 'title' };
function startTrailer() { lsSet('sgf_trailer2', true); trl = { t: 0, back: scene === 'trailer' ? 'title' : scene }; scene = 'trailer'; SFX.gong(); }
function updateTrailer() {
  trl.t++;
  const T = trl.t;
  if (T === 1 || T === 300 || T === 600) SFX.boom();
  if (T === 160 || T === 460) SFX.special();
  if (T === 760) { SFX.bell(); }
  if (T >= TRAILER_T || (T > 60 && (pressed.Escape || pressed.Enter || pressed.Space))) { if (cutBack) { cutBack = false; scene = 'cutlist'; return; }   // 다시 보기에서 틀었으면 목록으로
    scene = 'title'; toTitle(); popup({ icon: '🆕', title: '새 돼지 2마리 등장!', lines: ['🤖 볼트돈: 🎁 보상 센터 행운 룰렛에서', '🍥 돼루토: 보상 센터의 퀘스트를 깨면', '🎟️ 룰렛은 이제 티켓으로 돌려요'], big: true }); }
}
function drawTrailer() {
  const T = trl.t, dv = CHARS.find(c => c.name === '볼트돈'), nr = CHARS.find(c => c.name === '돼루토');
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const seg = T < 300 ? 0 : T < 600 ? 1 : 2, lt = T - seg * 300;
  if (seg === 0) {   // 1막: 볼트돈 — 네온 도시 · 느려지는 세상
    for (let i = 0; i < 14; i++) { const h = 120 + (i * 73) % 200; ctx.fillStyle = `rgba(0,${40 + i * 6},${70 + i * 5},0.9)`; ctx.fillRect(i * 72 - (lt * 0.6) % 72, H - 60 - h, 64, h); for (let j = 0; j < 6; j++) { ctx.fillStyle = (i + j + (lt >> 4)) % 3 ? 'rgba(0,229,255,0.5)' : 'rgba(255,23,68,0.6)'; ctx.fillRect(i * 72 - (lt * 0.6) % 72 + 10, H - 60 - h + 14 + j * 20, 10, 6); } }
    ctx.fillStyle = '#0a1520'; ctx.fillRect(0, H - 60, W, 60);
    const slow = lt > 150, x = slow ? 300 + (lt - 150) * 1.2 : -100 + lt * 2.7;
    for (let i = 1; i <= (slow ? 6 : 0); i++) { ctx.save(); ctx.globalAlpha = 0.12 * (7 - i); drawPig(x - i * 40, H - 60, 1, i % 2 ? SANDE_C : SANDE_G, { t: gT, scale: 1.3 }); ctx.restore(); }
    drawPig(x, H - 60, 1, dv.look, { t: gT, scale: 1.3, walk: true });
    if (slow) { ctx.fillStyle = 'rgba(118,255,3,0.08)'; ctx.fillRect(0, 0, W, H); for (let i = 0; i < 12; i++) { ctx.fillStyle = '#ffd740'; ctx.fillRect((i * 83) % W, 80 + ((i * 47 + lt * 0.3) % 200), 3, 3); } }
    if (lt > 40) txt(lt < 150 ? '버려진 고기 공장, 로봇 돼지가 눈을 떴다.' : '"시스템... 오버클럭."', W / 2, 70, 26, slow ? '#76ff03' : '#00e5ff', '#000', 6);
    if (lt > 220) { txt('볼트돈', W / 2, H / 2 - 20, 70 * Math.min(1, (lt - 220) / 15), '#fff', '#00838f', 12); txt('오버클럭 · 레이저 채찍 · 로켓 대시 · 메가 강화 슈트 20초', W / 2, H / 2 + 40, 18, '#84ffff', '#000', 5); }
  } else if (seg === 1) {   // 2막: 돼루토 — 노을 숲 · 분신
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ff6f00'); g.addColorStop(1, '#3e1500'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#1b0a00'; for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.moveTo(i * 110 - 30, H - 60); ctx.lineTo(i * 110 + 25, H - 260 - (i % 3) * 40); ctx.lineTo(i * 110 + 80, H - 60); ctx.fill(); }
    ctx.fillStyle = '#2b1200'; ctx.fillRect(0, H - 60, W, 60);
    const n = lt < 100 ? 1 : lt < 140 ? 3 : 7;
    for (let i = 0; i < n; i++) { const xx = W / 2 + (i - (n - 1) / 2) * 110; if (lt >= 100 && lt < 108) smokePuffAt(xx); drawPig(xx, H - 60, i % 2 ? -1 : 1, nr.look, { t: gT + i * 10, scale: 1.2, victory: lt > 180 }); }
    if (lt === 100 || lt === 140) SFX.whiff();
    if (lt > 20) txt(lt < 100 ? '포기를 모르는 닌자 돼지.' : '"분신술!!"', W / 2, 70, 28, '#fff3e0', '#000', 6);
    if (lt > 210) { txt('돼루토', W / 2, H / 2 - 30, 70 * Math.min(1, (lt - 210) / 15), '#fff', '#e65100', 12); txt('분신술 · 회오리 구슬 · 구미호 모드', W / 2, H / 2 + 30, 18, '#ffe0b2', '#000', 5); }
  } else {   // 3막: 맞대결 · 출시
    ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(lt * 0.01); for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.fillStyle = i % 2 ? 'rgba(0,229,255,0.15)' : 'rgba(255,109,0,0.15)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-60, -600); ctx.lineTo(60, -600); ctx.fill(); } ctx.restore();
    const k = Math.min(1, lt / 40);
    drawPig(W / 2 - 330 + 120 * k, H - 50, 1, dv.look, { t: gT, scale: 1.5, victory: lt > 80 });
    drawCyberFront({ x: W / 2 - 330 + 120 * k, y: H - 50, facing: 1, sc: 1.5 }, lt > 80 ? 1 : 0);
    for (let i = 0; i < 9; i++) if (lt > 80) drawTail(W / 2 + 330 - 120 * k, H - 110, -(i - 4) * 0.2 - 0.3, 170, gT, 1);
    drawPig(W / 2 + 330 - 120 * k, H - 50, -1, nr.look, { t: gT, scale: 1.5, victory: lt > 80 });
    if (lt > 40 && lt < 60 && lt % 4 < 2) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(0, 0, W, H); }
    txt('VS', W / 2, H / 2 + 20, 60 * k, '#ffd740', '#000', 10);
    if (lt > 120) { txt('🆕 신캐릭터 2마리 업데이트', W / 2, 70, 34, '#fff', '#000', 8); txt('지금 바로 · 🎁 보상 센터에서', W / 2, 115, 20, '#ffd740', '#000', 5); }
  }
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 26); ctx.fillRect(0, H - 22, W, 22);
  if (T > 60) txt(TOUCH ? '탭하면 건너뛰기' : 'Enter 건너뛰기', W - 20, H - 11, 12, '#888', null, 0, 'right');
  addHot(0, 0, W, H, () => { if (trl.t > 60) pressed.Enter = true; });
}
function smokePuffAt(x) { for (let i = 0; i < 3; i++) smoke(x + rand(-40, 40), H - 120 + rand(-40, 40), '255,255,255'); }
// ---- 공개 시각 · 자동 업데이트 ----
// 공개 시각이 지나면: 싸우는 중이면 그 판은 이긴 걸로 처리하고, 끝나면 예고편 (한 번만)
let forceWon = false, itForced = false, bigForced = false, big2Forced = false;
function forceWin(why) {
  if (!['intro', 'fight', 'roundEnd'].includes(scene) || mode === 3 || mode === 4 || mode === 0 || mode === 5 || mode === 6 || forceWon) return false;
  forceWon = true;
  p2.hp = 0; p2.state = 'ko'; p1.wins = Math.max(p1.wins, 1); objs = []; TSTOP = null;
  toast(why || '⚡ 업데이트! 이 판은 승리로 처리됐어요');
  if (scene !== 'roundEnd') endRound(p1, 'K.O.!!'); else { roundWinner = p1; }
  return true;
}
const TRAILER_SAFE = ['title', 'select', 'market', 'bank', 'endings', 'ranking', 'reward', 'tycoon', 'betpick'];
function releaseTick() {
  if (!AUTH_TEST && gT % 60 === 0 && TRAILER_SAFE.includes(scene) && !POP) questCheckAll();   // 이미 다 채운 퀘스트 해금 (1초마다 · 타이틀 같은 화면에서만)
  if (!AUTH_TEST && REL.big2 && !lsGet('sgf_big2trailer', false)) {   // 대규모 업데이트 · 해적과 마법사 공개
    if (['intro', 'fight', 'roundEnd'].includes(scene)) { if (!big2Forced) { big2Forced = true; forceWon = false; forceWin('🎉 대규모 업데이트 · 해적과 마법사 공개! 이 판은 승리로 처리됐어요'); } return; }
    if (TRAILER_SAFE.includes(scene) && !POP && !POPQ.length && !authOpen()) { startBig2Trailer(); return; }
  }
  if (!AUTH_TEST && REL.big1 && !lsGet('sgf_bigtrailer', false)) {   // 🎉 대규모 업데이트 공개: 싸우는 중이면 그 판은 승리, 끝나면 예고편
    if (['intro', 'fight', 'roundEnd'].includes(scene)) { if (!bigForced) { bigForced = true; forceWon = false; forceWin('🎉 대규모 업데이트 공개! 이 판은 승리로 처리됐어요'); } return; }
    if (TRAILER_SAFE.includes(scene) && !POP && !POPQ.length && !authOpen()) { startBigTrailer(); return; }
  }
  if (!AUTH_TEST && REL.itadori && !lsGet('sgf_ittrailer', false)) {   // 👊 이타돼리 공개: 싸우는 중이면 그 판은 승리, 끝나면 예고편
    if (['intro', 'fight', 'roundEnd'].includes(scene)) { if (!itForced) { itForced = true; forceWon = false; forceWin('🆕 이타돼리 공개! 이 판은 승리로 처리됐어요'); } return; }
    if (TRAILER_SAFE.includes(scene) && !POP && !POPQ.length && !authOpen()) { startItTrailer(); return; }
  }
  if (!AUTH_TEST && isReleased() && lsGet('sgf_trailer2', false) && !lsGet('sgf_nrtrailer', false) && TRAILER_SAFE.includes(scene) && !POP && !POPQ.length && !authOpen()) { startNrTrailer(); return; }   // 🍥 돼루토 예고편 (한 번)
  if (AUTH_TEST || !isReleased() || lsGet('sgf_trailer2', false)) return;
  if (['intro', 'fight', 'roundEnd'].includes(scene)) { forceWin('🆕 업데이트 공개! 이 판은 승리로 처리됐어요'); return; }
  if (TRAILER_SAFE.includes(scene) && !POP && !authOpen()) startTrailer();
}
// 새 버전이 올라오면 자동으로 받기 (1분마다 version.txt 확인). 싸우는 중이면 이긴 걸로 하고 끝난 뒤 새로 불러옴
const BUILD = '20261114-6';
let newBuild = false;
function checkVersion() {
  if (AUTH_TEST || location.protocol === 'file:' || newBuild) return;
  fetch('version.txt?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.text() : '').then(v => { v = v.trim(); if (v && v !== BUILD) newBuild = true; }).catch(() => {});
}
setInterval(() => { if (!document.hidden) checkVersion(); }, 60000);
setTimeout(checkVersion, 8000);
function updateTick() {
  if (!newBuild) return;
  if (['intro', 'fight', 'roundEnd'].includes(scene)) { forceWin(); return; }
  if (['cutscene', 'vs', 'opening', 'story', 'trailer', 'nrtrailer', 'ittrailer', 'bigtrailer', 'big2trailer', 'revive'].includes(scene) || (scene === 'online' && NET.ready) || authOpen() || pushing) return;
  newBuild = false;
  try { sessionStorage.setItem('sgf_msg', '🆕 새 버전으로 업데이트됐어요!'); } catch (e) {}
  const go = () => location.reload();
  if (cloudTimer) cloudPush(true).finally(go); else go();
}
function drawKunai(o) {
  ctx.save(); ctx.translate(o.x, o.y); ctx.scale(Math.sign(o.vx) || 1, 1);
  ctx.fillStyle = '#90a4ae'; ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(0, -6); ctx.lineTo(0, 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#37474f'; ctx.fillRect(-14, -2, 14, 4); ctx.strokeStyle = '#ff9100'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-17, 0, 4, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}
// ================= 🍥 돼루토 예고편 (트레일러): 닌자 달리기 → 분신술 → 쿠나이 → 회오리 구슬 → 구미호 모드 → 타이틀 =================
const NRT_T = 960;
const nrt = { t: 0, sh: 0 };
function startNrTrailer() { lsSet('sgf_nrtrailer', true); nrt.t = 0; nrt.sh = 0; scene = 'nrtrailer'; }
function updateNrTrailer() {
  const T = ++nrt.t;
  if (nrt.sh > 0) nrt.sh *= 0.88;
  const hit = (s = 10) => { nrt.sh = s; };
  if (T === 1) SFX.gong();
  if (T === 60 || T === 100 || T === 140) SFX.jump();
  if (T === 200 || T === 230 || T === 260) { SFX.whiff(); hit(6); }
  if (T >= 330 && T < 400 && T % 6 === 0) SFX.whiff();
  if (T === 400) SFX.special();
  if (T >= 420 && T < 500 && T % 5 === 0) SFX.tick();
  if (T === 520) { SFX.boom(); hit(22); }
  if (T === 600) SFX.gong();
  if (T === 690) { SFX.boom(); hit(26); }
  if (T === 820) SFX.bell();
  if (T >= NRT_T || (T > 60 && (pressed.Escape || pressed.Enter || pressed.Space))) { if (cutBack) { cutBack = false; scene = 'cutlist'; return; }   // 다시 보기에서 틀었으면 목록으로
    toTitle(); popup({ icon: '🍥', title: '돼루토', lines: ['분신술 · 회오리 구슬 · 쿠나이 · 구미호 모드', '🎁 보상 센터의 돼루토 퀘스트를 깨면 얻어요'], big: true }); }
}
// 화면에 크게 박히는 기술 이름
function nrtCard(s, sub, lt, col, edge) {
  const k = Math.min(1, lt / 10), sc = 1 + (1 - k) * 1.5;
  ctx.save(); ctx.translate(W / 2, H / 2 - 120); ctx.scale(sc, sc); ctx.globalAlpha = k;
  txt(s, 0, 0, 58, '#fff', edge, 12); ctx.restore();
  if (sub && lt > 14) txt(sub, W / 2, H / 2 - 70, 18, col, '#000', 5);
}
function nrtSpeed(col, n = 30, T = 0) { for (let i = 0; i < n; i++) { const y = (i * 53 + T * 7) % H; ctx.fillStyle = col; ctx.fillRect((i * 97 + T * 40) % (W + 300) - 300, y, 160 + (i % 4) * 60, 2); } }
function drawNrTrailer() {
  const T = nrt.t, nr = CHARS.find(c => c.name === '돼루토'), L = nr.look;
  ctx.save(); if (nrt.sh > 0.5) ctx.translate(rand(-nrt.sh, nrt.sh), rand(-nrt.sh, nrt.sh));
  if (T < 180) {   // 1컷: 노을 숲 위를 뛰어다니는 닌자 돼지 (실루엣 → 컬러)
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ff6f00'); g.addColorStop(0.6, '#bf360c'); g.addColorStop(1, '#3e1500'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,224,130,0.9)'; ctx.beginPath(); ctx.arc(W * 0.7, H * 0.42, 70, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1b0a00'; for (let i = 0; i < 12; i++) { const x = ((i * 120 - T * 3) % (W + 240)) - 120; ctx.beginPath(); ctx.moveTo(x - 40, H); ctx.lineTo(x + 20, H - 300 - (i % 3) * 50); ctx.lineTo(x + 80, H); ctx.fill(); }
    const ph = (T % 40) / 40, jx = 120 + T * 3.6, jy = H - 120 - Math.sin(ph * Math.PI) * 160;
    ctx.save(); if (T < 90) ctx.filter = 'brightness(0)'; drawPig(jx, jy, 1, L, { t: T, scale: 1.1, move: 'dash', k: 0.8 }); ctx.restore();
    if (T > 30) txt(T < 100 ? '포기를 모르는 닌자 돼지가 있었다.' : '"절대 안 져!!"', W / 2, 70, 28, '#fff3e0', '#000', 7);
  } else if (T < 320) {   // 2컷: 분신술 — 연기 펑 펑 펑, 1 → 3 → 9
    const lt = T - 180;
    ctx.fillStyle = '#2b1200'; ctx.fillRect(0, 0, W, H); nrtSpeed('rgba(255,171,64,0.25)', 30, T);
    ctx.fillStyle = '#4e2100'; ctx.fillRect(0, H - 70, W, 70);
    const n = lt < 20 ? 1 : lt < 50 ? 3 : 9;
    for (let i = 0; i < n; i++) {
      const row = n === 9 ? (i < 5 ? 0 : 1) : 0, cols = n === 9 ? (row ? 4 : 5) : n, ci = n === 9 ? (row ? i - 5 : i) : i;
      const x = W / 2 + (ci - (cols - 1) / 2) * (n === 9 ? 150 : 200), y = H - 70 - row * 70, sc = n === 9 ? (row ? 0.85 : 1) : 1.15;
      drawPig(x, y, i % 2 ? -1 : 1, L, { t: T + i * 9, scale: sc, victory: lt > 70 });
      const born = n === 3 ? 20 : n === 9 ? 50 : -99;
      if (lt - born < 14 && lt >= born) { ctx.fillStyle = `rgba(255,255,255,${0.9 - (lt - born) / 16})`; for (let j = 0; j < 5; j++) { ctx.beginPath(); ctx.arc(x + Math.cos(j * 1.3) * 40, y - 80 + Math.sin(j * 1.7) * 40, 30 + (lt - born) * 3, 0, Math.PI * 2); ctx.fill(); } }
    }
    nrtCard('분신술!!', '분신이 대신 싸워 줘요 · 한 대 맞으면 펑', lt, '#ffcc80', '#e65100');
  } else if (T < 400) {   // 3컷: 쿠나이 세례
    const lt = T - 320;
    ctx.fillStyle = '#10121a'; ctx.fillRect(0, 0, W, H); nrtSpeed('rgba(255,255,255,0.18)', 40, T);
    drawPig(160, H - 60, 1, L, { t: T, scale: 1.25, move: 'throw', k: (lt % 12) / 12 });
    for (let i = 0; i < 14; i++) { const x = 230 + ((lt * 18 + i * 70) % 800), y = H - 200 + Math.sin(i * 2.1) * 120; drawKunai({ x, y, vx: 1 }); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; line(x - 60, y, x - 18, y); }
    nrtCard('쿠나이!', '→+U · 빠른 쿠나이 3개', lt, '#cfd8dc', '#263238');
  } else if (T < 560) {   // 4컷: 회오리 구슬 — 모으고 → 달려가서 → 쾅
    const lt = T - 400;
    if (lt < 100) {
      const k = Math.min(1, lt / 80), cx = W * 0.6, cy = H / 2 + 10;
      const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, 650); g.addColorStop(0, '#0d47a1'); g.addColorStop(1, '#020814'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(cx, cy); for (let i = 0; i < 46; i++) { const a = i * 2.39 + lt * 0.2, r = 460 - ((lt * 10 + i * 37) % 440); ctx.strokeStyle = `rgba(179,229,252,${0.12 + 0.55 * (1 - r / 460)})`; ctx.lineWidth = 2 + (1 - r / 460) * 3; ctx.beginPath(); ctx.arc(0, 0, r, a, a + 0.5); ctx.stroke(); } ctx.restore();
      ctx.save(); ctx.translate(W * 0.26, H + 50); drawPig(0, 0, 1, L, { t: T, scale: nr.scale * 2.2, move: 'punch', k: 0.5 }); ctx.restore();
      const R = 24 + 120 * k + Math.sin(lt * 0.8) * 5;
      ctx.save(); ctx.shadowColor = '#4fc3f7'; ctx.shadowBlur = 60; const og = ctx.createRadialGradient(cx, cy, 4, cx, cy, R); og.addColorStop(0, '#fff'); og.addColorStop(0.35, '#b3e5fc'); og.addColorStop(0.75, '#29b6f6'); og.addColorStop(1, 'rgba(13,71,161,0)'); ctx.fillStyle = og; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.8, R * (0.25 + 0.1 * (i % 3)), lt * 0.4 + i * 1.05, 0, Math.PI * 1.3); ctx.stroke(); }
      nrtCard('회오리 구슬!!', '↓+U · 손바닥에 모은 회오리로 날려 버림', lt, '#b3e5fc', '#01579b');
    } else {
      const lt2 = lt - 100, x = 120 + Math.min(1, lt2 / 20) * 520;
      ctx.fillStyle = '#071a33'; ctx.fillRect(0, 0, W, H); nrtSpeed('rgba(179,229,252,0.4)', 50, T * 2);
      drawPig(x, H - 70, 1, L, { t: T, scale: 1.3, move: 'dash', k: 1 });
      const ox = x + 95, oy = H - 190; ctx.save(); ctx.shadowColor = '#4fc3f7'; ctx.shadowBlur = 40; ctx.fillStyle = '#b3e5fc'; ctx.beginPath(); ctx.arc(ox, oy, 36, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      if (lt2 >= 20) {   // 맞는 순간: 흰 번쩍 + 충격파 고리
        const r = (lt2 - 20) * 22; ctx.strokeStyle = `rgba(179,229,252,${Math.max(0, 1 - r / 600)})`; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(ox + 40, oy, r, 0, Math.PI * 2); ctx.stroke();
        if (lt2 < 28) { ctx.fillStyle = `rgba(255,255,255,${1 - (lt2 - 20) / 8})`; ctx.fillRect(0, 0, W, H); }
      }
    }
  } else if (T < 800) {   // 5컷: 구미호 모드 — 붉은 기운, 꼬리 아홉 개가 하나씩
    const lt = T - 560;
    ctx.fillStyle = '#120000'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, H / 2 + 40); ctx.rotate(lt * 0.01); for (let i = 0; i < 18; i++) { ctx.rotate(Math.PI / 9); ctx.fillStyle = i % 2 ? `rgba(255,109,0,${0.12 + 0.2 * Math.min(1, lt / 130)})` : 'rgba(80,0,0,0.5)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-80, -700); ctx.lineTo(80, -700); ctx.fill(); } ctx.restore();
    const tails = Math.min(9, Math.floor(lt / 14));
    for (let i = 0; i < tails; i++) drawTail(W / 2 - 20, H - 150, -Math.PI / 2 + (i - 4) * 0.3, 300, gT + i * 7, 1);
    for (let i = 0; i < 3; i++) flame(W / 2 + rand(-120, 120), H - rand(60, 260));
    drawParts();
    ctx.save(); if (lt < 130) ctx.filter = 'brightness(0.35) sepia(1) saturate(4) hue-rotate(-30deg)'; drawPig(W / 2, H - 50, 1, L, { t: T, scale: 1.7, victory: lt > 130 }); ctx.restore();
    if (lt > 60 && lt < 130) { ctx.save(); ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 20; ctx.fillStyle = '#ff1744'; ctx.beginPath(); ctx.ellipse(W / 2 + 70, H - 235, 9, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }   // 붉게 빛나는 눈
    if (lt > 130 && lt < 138) { ctx.fillStyle = `rgba(255,140,0,${1 - (lt - 130) / 8})`; ctx.fillRect(0, 0, W, H); }
    if (lt > 140) nrtCard('구미호 모드', '필살기 · 아홉 꼬리 폭발 + 12초 동안 강해짐', lt - 140, '#ffd180', '#bf360c');
    else if (lt > 20) txt('"...이게 내 진짜 힘이야."', W / 2, 70, 26, '#ffccbc', '#000', 6);
  } else {   // 6컷: 타이틀 카드
    const lt = T - 800, k = Math.min(1, lt / 20);
    ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i++) drawTail(W / 2 + 230, H - 120, -Math.PI / 2 + (i - 4) * 0.26, 200, gT + i * 7, 0.7 * k);
    drawPig(W / 2 + 230, H - 40, -1, L, { t: T, scale: 1.6, victory: true });
    txt('돼루토', W / 2 - 160, H / 2 - 30, 90 * k, '#fff', '#e65100', 14);
    if (lt > 25) txt('포기를 모르는 닌자 돼지', W / 2 - 160, H / 2 + 40, 22, '#ffcc80', '#000', 6);
    if (lt > 45) txt('🎁 보상 센터 퀘스트를 깨고 얻으세요', W / 2 - 160, H / 2 + 85, 18, '#ffd740', '#000', 5);
  }
  ctx.restore();
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 34); ctx.fillRect(0, H - 30, W, 30);   // 영화처럼 위아래 검은 띠
  if (T > 60) txt(TOUCH ? '탭하면 건너뛰기' : 'Enter 건너뛰기', W - 20, H - 15, 12, '#888', null, 0, 'right');
  addHot(0, 0, W, H, () => { if (nrt.t > 60) pressed.Enter = true; });
}
// ================= 👊 이타돼리: 관리자가 '업데이트 공개'를 누르면 등장 (한 번 켜면 못 끔) =================
// 저주를 몸에 품은 돼지 고등학생. 분홍 삐죽 머리 · 남색 교복 · 빨간 후드. 맨주먹 격투 (스킬 3개) + 필살기 '저주 결계'
// 공개(REL.itadori)되면: 모두에게 무료 해금 + 예고편 한 번 (싸우는 중이면 그 판은 승리)
let REL = lsGet('sgf_rel', {});   // 관리자가 공개한 업데이트 { itadori: 공개 시각 } — 서버가 10초마다 알려 줌
const xmasOpen = () => { const d = new Date(); return (d.getMonth() === 11 && d.getDate() <= 25) || /xmas/.test(location.search); };   // 🎄 크리스마스 업데이트: 해마다 12월 1~25일 자동
const isRel = id => id === 'xmas' ? xmasOpen() || !!lsGet('sgf_unlock_산타돈', false) || !!lsGet('sgf_unlock_눈꽃돈', false) : !!REL[id] || /newchars/.test(location.search);
function setRel(r) { if (!r || typeof r !== 'object') return; const was = { ...REL }; REL = { ...REL, ...r }; lsSet('sgf_rel', REL); if (!was.itadori && REL.itadori) toast('🆕 새 돼지 이타돼리 공개! 10일 안에 퀘스트를 깨면 해금'); else if (was.itadoriWin && REL.itadoriWin > was.itadoriWin) toast('👊 이타돼리 퀘스트 기간이 다시 열렸어요! (10일)'); if (!was.big1 && REL.big1) toast('🎉 대규모 업데이트 공개! 새 돼지 3마리'); if (!was.big2 && REL.big2) toast('🎉 대규모 업데이트 · 해적과 마법사 공개! 새 돼지 2마리');
  for (const u of UPDATES) if (!was[u.id] && REL[u.id]) { const c = CHARS.find(x => x.name === u.ch); if (c && c.relId !== u.id) continue;
    toast(`${u.icon} 대규모 업데이트 · ${u.name} 공개!`); if (Date.now() - REL[u.id] < 3 * 864e5) popup({ icon: u.icon, title: `대규모 업데이트 · ${u.name}!`, lines: [`🐷 새 돼지 ${u.ch}: 돼지 도감에서 🪙 ${fmtN(c ? c.buy : 0)}에 살 수 있어요`, `🎨 새 스킨: ${u.skins.map(n => u.name + ' ' + n).join(' · ')}`, '스킨 상자에서 나오고 도감에서 바로 살 수도 있어요'], big: true }); } }
// 스킬 시작 효과
function itSkillStart(f, s) {
  if (s.type === 'bloodShot' && f.awk && f.atk && f.atk.proj) f.atk.proj = { ...f.atk.proj, spread: 5 };   // 각성: 피의 화살 5개
  const k = f.sc / 1.15;
  if (s.type === 'lateFist') f.lateQ = { t: 24, hp: f.opp.hp };   // 늦게 터지는 주먹: 첫 주먹이 맞았으면 한 박자 뒤에 한 번 더 터짐
  if (s.type === 'blackBolt' && f.atk && (['hit', 'blockstun'].includes(f.opp.state) || srnd() < 0.5)) {   // 연타로 이어 쓰면 반드시 · 아니면 50%
    f.atk.dmg *= 2.5; f.atk.boltCrit = true; f.atk.hitstop = 22; f.atk.shake = 18; f.atk.txt = ['검은 번개!!']; popText(f.x, f.y - 230 * k, '검은 번개!!', '#ff1744', 30); }   // 35%: 2.5배
}
function itUpdate(f) {   // 매 프레임 (싸우는 돼지 update에서)
  const o = f.opp;
  if (f.state === 'attack' && f.atk && f.atk.boltCrit && f.af < f.atk.startup + 2) { const s = f.sc / 1.15; for (let i = 0; i < 2; i++) parts.push({ x: f.x + f.facing * 70 * s + rand(-14, 14), y: f.y - 95 * s + rand(-14, 14), vx: rand(-3, 3), vy: rand(-3, 3), life: 10, max: 10, c: i ? '#ff1744' : '#000', s: rand(2, 4), g: 0, type: 'dot', glow: true }); }
  if (f.lateQ && --f.lateQ.t <= 0) {
    const hitNow = o.hp < f.lateQ.hp; f.lateQ = null;
    if (hitNow && o.state !== 'ko') { dealHit(f, o, { dmg: 7, height: 'mid', kb: 10, stun: 22, src: f.x, kind: 'skill', force: true, hitstop: 8, shake: 10, txt: ['쾅!! (한 번 더)'] }); burst(o.x, o.y - 100, 24, ['#ff8a80', '#fff'], 9); SFX.heavy(14); }
  }
  if (f.curseT > 0) {
    f.curseT--;
    if (f.curseT % (f.awk ? 45 : 75) === 0 && o.state !== 'ko' && scene === 'fight') {   // 저주왕: 보이지 않는 칼날이 상대를 저절로 벰
      f.slashN = (f.slashN || 0) + 1; const big = f.slashN % 4 === 0;   // 네 번째마다 큰 베기
      dealHit(f, o, { dmg: big ? 10 : 4.5, height: 'mid', kb: big ? 10 : 2, stun: big ? 26 : 12, launch: big ? -8 : 0, src: f.x, kind: 'ult', force: true, hitstop: big ? 10 : 4, shake: big ? 14 : 6, txt: big ? ['크게 베기!!'] : ['베기!', '싹둑!', '촥!'] });
      for (let i = 0; i < (big ? 6 : 2); i++) slash(o.x + rand(-40, 40), o.y - rand(40, 160)); whipS(big ? 0.8 : 1.3, big ? 0.9 : 0.5);
    }
    if (f.curseT === 0) {   // 결계가 닫히면서 불화살 한 발
      const s = f.sc / 1.15; f.facing = Math.sign(o.x - f.x) || f.facing;
      addObj({ owner: f, kind: 'fire', x: f.x + f.facing * 70 * s, y: f.y - 95 * s, vx: f.facing * 15, w: 90, h: 34, dmg: 18, burn: 200, kb: 14, launch: -10, stun: 40, life: 80, ult: true, txt: ['불화살!!'] });
      popText(f.x, f.y - 230 * s, '불화살!!', '#ff6d00', 32); SFX.boom(); f.slashN = 0;
    }
  }
}
// 베어 가르기 (저주왕 상태에서 필살기): 상대를 묶고 보이지 않는 칼날 14번 → 마지막 십자 베기
function boltRushUlt(f, o, T) {   // 검은 번개 연타: 달려가서 잡으면 검은 번개 3번 → 날려 버림
  const s = f.sc / 1.15;
  if (!f.ultHit) {
    if (T < 40) { f.vx = f.facing * 17; if (Math.abs(o.x - f.x) < 130 * s && Math.abs(o.y - f.y) < 140) { f.ultHit = true; f.uT = 0; f.vx = 0; if (o.state !== 'ko') { o.state = 'locked'; o.vx = 0; o.vy = 0; o.atk = null; } } }
    else ultEnd(f, o);
    return;
  }
  f.vx = 0; if (o.state === 'locked') o.x = clamp(f.x + f.facing * 110 * s, 50, W - 50);
  if (T === 10 || T === 26 || T === 42) { const last = T === 42; dealHit(f, o, { dmg: last ? 12 : 7, height: 'mid', kb: last ? 22 : 0, launch: last ? -16 : 0, stun: 40, src: f.x, kind: 'ult', force: true, noReact: !last, hitstop: 16, shake: 18, boltCrit: true, txt: ['검은 번개!!'] }); }
  if (T >= 60) ultEnd(f, o);
}
function dismantleUlt(f, o, T) {   // 베어 가르기(해): 여러 번이 아니라 온 힘을 담은 거대한 칼날 한 번
  const s = f.sc / 1.15; f.vx = 0;
  if (T === 4) { popText(f.x, f.y - 250 * s, '해.', '#ff1744', 40); whipS(0.6, 1); }
  if (T === 16) {
    const y0 = o.y - 95 * o.sc / 1.15;
    for (let i = 0; i < 3; i++) parts.push({ x: o.x, y: y0 + (i - 1) * 6, a: -0.35 + i * 0.02, len: W * 1.6, life: 22, max: 22, type: 'slash', vx: 0, vy: 0, g: 0 });   // 화면을 가로지르는 거대한 칼날
    burst(o.x, y0, 60, ['#fff', '#ff1744', '#000'], 16); bfT = 12; SFX.boom(); whipS(0.5, 1);
    if (o.state !== 'ko') dealHit(f, o, { dmg: f.awk ? 40 : 34, height: 'mid', launch: -17, kb: 24, stun: 54, src: f.x, kind: 'ult', force: true, hitstop: 26, shake: 28, txt: ['해!!'] });
  }
  if (T >= 46) ultEnd(f, o);
}
function itUlt(f, o, T) {
  const s = f.sc / 1.15; f.vx = 0;
  if (T === 6) {
    f.curseT = f.awk ? 1320 : 900; shake = 22; SFX.boom();
    burst(f.x, f.y - 100 * s, 60, ['#b71c1c', '#000', '#ff5252', '#fff'], 13);
    popText(f.x, f.y - 260 * s, '저주 결계 · 15초!!', '#ff1744', 32);
    if (Math.abs(o.x - f.x) < 320) dealHit(f, o, { dmg: 20, launch: -15, kb: 18, stun: 44, src: f.x, kind: 'ult', height: 'mid', hitstop: 18, shake: 18, txt: ['저주 폭발!!'] });
    ultEnd(f, o);
  }
}
// 저주왕 모습: 붉은 기운 · 얼굴 문신 · 붉은 눈 두 쌍
let groundPass = false; let CUTLESS_ULT = false; let bfT = 0;   // 검은 번개 번쩍
function drawDomain(f) { const a0 = Math.min(1, f.curseT / 60); ctx.save(); ctx.fillStyle = `rgba(70,0,0,${0.2 * a0})`; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = `rgba(255,23,68,${0.35 * a0})`; ctx.lineWidth = 2; for (let i = 0; i < 12; i++) { const yy = (i * 47 + gT * 2) % H; line(0, yy, W, yy + 30); } ctx.strokeStyle = `rgba(255,23,68,${0.6 * a0})`; ctx.lineWidth = 8; ctx.strokeRect(6, 6, W - 12, H - 12); txt('저주 결계', W / 2, 92, 16, `rgba(255,138,128,${a0})`, '#000', 4); ctx.restore(); }
function drawCurse(f) {
  if (!(f.curseT > 0 || f.sukuna)) return;
  const s = f.sc, a = f.sukuna ? 0.7 : Math.min(1, f.curseT / 60), hx = f.x + f.facing * 36 * s, hy = f.y - 90 * s;
  ctx.save(); ctx.globalAlpha *= a;
  for (let i = 0; i < 3; i++) { const g = ctx.createRadialGradient(f.x, f.y - 80 * s, 10, f.x, f.y - 80 * s, (110 + i * 25 + Math.sin(gT * 0.2 + i) * 8) * s); g.addColorStop(0, 'rgba(183,28,28,0)'); g.addColorStop(0.7, 'rgba(183,28,28,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y - 80 * s, (110 + i * 25) * s, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  if (gT % 4 === 0) parts.push({ x: f.x + rand(-50, 50) * s, y: f.y - rand(20, 170) * s, vx: 0, vy: -1.5, life: 30, max: 30, c: '#b71c1c', s: rand(2, 4), g: -0.02, type: 'dot', glow: true });
}
// ---- 필살기 컷신: 붉은 달 · 손가락 문신이 퍼지고 · 눈이 뜨임 ----
const IT_FORMS = {
  base: { name: '기본', acc: ['uniform', 'pinkhair', 'bold'] },
  modulo: { name: '모듈로', acc: ['hoodie', 'hoodup', 'bold'], skills: [{ name: '늦게 터지는 주먹', type: 'lateFist', cd: 150, desc: 'U: 맞히면 한 박자 뒤에 한 번 더 쾅' }, { name: '검은 번개', type: 'blackBolt', cd: 260, desc: '↓+U: 연타로 이어 쓰면 반드시 검은 번개' }, { name: '피의 관통탄', type: 'bloodShot', cd: 220, desc: '←→+U: 상대를 쫓아가는 피의 유도탄 3발' }], ult: { name: '베어 가르기', type: 'dismantle', desc: '온 힘을 담은 거대한 칼날 한 번 · 막을 수 없음' } },
  sukuna: { name: '스쿠나', acc: ['uniform', 'pinkhair', 'bold'], skills: [{ name: '크게 베기', type: 'cleave', cd: 200, desc: 'U: 앞을 크게 베어 날림' }, { name: '불화살', type: 'fireArrow', cd: 300, desc: '↓+U: 불타는 화살 · 화상' }, { name: '보이지 않는 칼날', type: 'slashWave', cd: 160, desc: '←→+U: 아주 빠른 칼날 바람' }], ult: { name: '저주 결계', type: 'curseKing', desc: '화면 전체를 저주 결계로 · 칼날이 반드시 벰 · 끝나면 불화살' } }
};
const itFormOk = k => k === 'base' || (k === 'sukuna' && isAwake('이타돼리'));   // 모듈로 모습은 뺐음 (예전에 골랐으면 기본 모습)
const itForm = () => { if (isAwake('이타돼리') && !lsGet('sgf_itsuk', false)) { lsSet('sgf_itsuk', true); lsSet('sgf_itform', 'sukuna'); }   // 각성하면 처음 한 번은 스쿠나 모습으로 바꿔 줌 (그 뒤엔 도감에서 고른 대로)
  const k = lsGet('sgf_itform', 'base'); return itFormOk(k) ? k : 'base'; };
function cycleItForm() { const L = ['base', 'sukuna'].filter(itFormOk); const i = L.indexOf(itForm()); const k = L[(i + 1) % L.length]; lsSet('sgf_itform', k); cloudDirty(); SFX.select(); toast(L.length < 2 ? '🔒 모듈로는 모듈로 각성 퀘스트(보상 센터), 스쿠나는 각성으로 열려요' : `👊 이타돼리 모습: ${IT_FORMS[k].name}`); }
function applyItForm(f, k) {   // 싸우는 돼지에 모습 입히기 (그 돼지 것만 바뀜)
  const F = IT_FORMS[k] || IT_FORMS.base;
  f.ch = { ...f.ch, ...(F.skills ? { skills: F.skills, skill: F.skills[0] } : {}), ...(F.ult ? { ult: F.ult } : {}) };
  f.C = { ...f.C, acc: F.acc }; f.itForm = k;
  if (k === 'sukuna') { f.sukuna = true; f.awk = true; }
}
const IT_CUT = 110;
const itYoung = C => ({ ...C, acc: ['uniform', 'pinkhair', 'bold'] });   // 컷신·예고편은 원래 젊은 모습 (분홍 삐죽 머리 · 교복 · 빨간 후드)
function drawItCut(f) {
  const T = IT_CUT - superFreeze, k = Math.min(1, T / 30);
  ctx.fillStyle = '#0a0000'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = `rgba(183,28,28,${0.5 + 0.3 * k})`; ctx.beginPath(); ctx.arc(W * 0.72, H * 0.35, 110, 0, Math.PI * 2); ctx.fill();   // 붉은 달
  ctx.save(); ctx.translate(W / 2, H / 2); for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); ctx.fillStyle = i % 2 ? `rgba(120,0,0,${0.25 * k})` : 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-60, -700); ctx.lineTo(60, -700); ctx.fill(); } ctx.restore();
  ctx.save(); ctx.translate(W * 0.38, H + 60); const sc = f.ch.scale * (2.2 + T * 0.003); drawPig(0, 0, 1, f.C, { t: gT, scale: sc, victory: T > 60, curse: (f.ch.ult.type === 'curseKing' || f.sukuna) && T > 35 ? Math.min(1, (T - 35) / 20) : 0 }); ctx.restore();
  if (T > 35 && f.ch.ult.type === 'curseKing') drawCurse({ x: W * 0.38, y: H + 60, facing: 1, sc: f.ch.scale * (2.2 + T * 0.003), curseT: Math.min(60, (T - 35) * 3) });
  if (T > 70) for (let i = 0; i < 6; i++) { ctx.strokeStyle = `rgba(255,255,255,${0.8 - ((T * 3 + i * 20) % 60) / 80})`; ctx.lineWidth = 3; const y = 80 + i * 70; line(0, y + ((T * 13 + i * 50) % 60), W, y - 40 + ((T * 13 + i * 50) % 60)); }   // 보이지 않는 칼날
  ctx.save(); ctx.translate((1 - Math.min(1, T / 14)) * -W, 0); ctx.fillStyle = 'rgba(120,0,0,0.85)'; ctx.fillRect(0, 60, W, 70); txt(f.ch.ult.name, W / 2, 95, 46, '#fff', '#1a0000', 10); ctx.restore();
  const ty = f.ch.ult.type, l1 = ty === 'dismantle' ? '"...해."' : ty === 'curseKing' ? '"...꽤 재밌는 몸이군."' : '"검은 번개!!"', l2 = ty === 'dismantle' ? '온 힘을 담은 칼날 한 번으로 베어 가른다' : ty === 'curseKing' ? '화면 전체가 저주 결계로 · 칼날이 반드시 벤다' : '달려가서 검은 번개 3연타';
  if (T > 40) txt(T < 75 ? l1 : l2, W / 2, H - 50, 22, '#ffcdd2', '#000', 6);
  if (T > 102) { ctx.fillStyle = `rgba(255,23,68,${(T - 102) / 8})`; ctx.fillRect(0, 0, W, H); }
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 30); ctx.fillRect(0, H - 18, W, 18);
}
// ---- 예고편 (공개되면 한 번): 옥상의 밤 → 늦게 터지는 주먹 → 검은 번개 → 저주가 깨어남 → 타이틀 ----
const ITT_T = 900; const itt = { t: 0, sh: 0 };
function startItTrailer() { lsSet('sgf_ittrailer', true); itt.t = 0; itt.sh = 0; scene = 'ittrailer'; }
function updateItTrailer() {
  const T = ++itt.t; if (itt.sh > 0) itt.sh *= 0.88;
  if (T === 1) SFX.gong();
  if (T === 200 || T === 214) { SFX.heavy(16); itt.sh = 12; }
  if (T === 380) { SFX.boom(); itt.sh = 24; }
  if (T === 520) SFX.ultStart();
  if (T === 640) { SFX.boom(); itt.sh = 26; }
  if (T >= 660 && T < 760 && T % 8 === 0) whipS(1.2, 0.5);
  if (T === 780) SFX.bell();
  if (T >= ITT_T || (T > 60 && (pressed.Escape || pressed.Enter || pressed.Space))) { if (cutBack) { cutBack = false; scene = 'cutlist'; return; }   // 다시 보기에서 틀었으면 목록으로
    toTitle(); popup({ icon: '👊', title: '이타돼리 등장!', lines: ['⏰ 10일 안에 이타돼리 퀘스트를 깨면 해금!', '늦게 터지는 주먹 · 검은 번개 · 돌려차기', '필살기: 저주 결계 (15초)', '🎁 보상 센터에서 퀘스트 확인'], big: true }); }
}
function drawItTrailer() {
  const T = itt.t, c = CHARS.find(x => x.name === '이타돼리'), L = itYoung(c.look);
  ctx.save(); if (itt.sh > 0.5) ctx.translate(rand(-itt.sh, itt.sh), rand(-itt.sh, itt.sh));
  if (T < 180) {   // 1컷: 밤 학교 옥상
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1026'); g.addColorStop(1, '#1d2547'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.3 * Math.sin(T * 0.05 + i)})`; ctx.fillRect((i * 131) % W, (i * 47) % 260, 2, 2); }
    ctx.fillStyle = '#0d1020'; ctx.fillRect(0, H - 90, W, 90); ctx.strokeStyle = '#2a3150'; ctx.lineWidth = 4; for (let i = 0; i < 20; i++) line(i * 50, H - 150, i * 50, H - 90); line(0, H - 150, W, H - 150);
    ctx.save(); if (T < 100) ctx.filter = 'brightness(0.2)'; drawPig(W / 2, H - 90, 1, L, { t: T, scale: 1.4 }); ctx.restore();
    if (T > 30) txt(T < 110 ? '평범한 돼지 고등학생이었다.' : '...그 손가락을 삼키기 전까지는.', W / 2, 70, 28, '#e8eaf6', '#000', 7);
  } else if (T < 340) {   // 2컷: 늦게 터지는 주먹 — 쾅, 쾅
    const lt = T - 180;
    ctx.fillStyle = '#14080c'; ctx.fillRect(0, 0, W, H); nrtSpeed('rgba(255,138,128,0.25)', 30, T);
    drawPig(W / 2 - 120, H - 60, 1, L, { t: T, scale: 1.4, move: 'punch', k: Math.min(1, lt / 8) });
    for (const at of [20, 34]) if (lt > at) { const r = (lt - at) * 14; ctx.strokeStyle = `rgba(255,205,210,${Math.max(0, 1 - r / 400)})`; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(W / 2 + 60, H - 190, r, 0, Math.PI * 2); ctx.stroke(); }
    nrtCard('늦게 터지는 주먹!', 'U · 맞고 한 박자 뒤에 한 번 더 쾅', lt, '#ffcdd2', '#880e4f');
  } else if (T < 480) {   // 3컷: 검은 번개 — 화면이 검붉게 번쩍
    const lt = T - 340;
    ctx.fillStyle = lt > 40 && lt < 50 ? '#fff' : '#050005'; ctx.fillRect(0, 0, W, H);
    drawPig(W / 2 - 80, H - 60, 1, L, { t: T, scale: 1.5, move: 'punch', k: 1 });
    if (lt > 38) { ctx.save(); ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 25; for (let i = 0; i < 7; i++) { ctx.strokeStyle = i % 2 ? '#ff1744' : '#000'; ctx.lineWidth = 6 - i * 0.5; ctx.beginPath(); let x = W / 2 + 40, y = H - 200; ctx.moveTo(x, y); for (let j = 0; j < 6; j++) { x += rand(20, 60); y += rand(-60, 60); ctx.lineTo(x, y); } ctx.stroke(); } ctx.restore(); }
    nrtCard('검은 번개!!', '↓+U · 가끔 검은 번개가 터지면 2.5배 피해', lt, '#ff8a80', '#000');
  } else if (T < 760) {   // 4컷: 저주가 깨어남
    const lt = T - 480;
    ctx.fillStyle = '#0a0000'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = `rgba(183,28,28,${Math.min(0.8, lt / 120)})`; ctx.beginPath(); ctx.arc(W * 0.72, H * 0.33, 120, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(W / 2, H + 80); drawPig(0, 0, 1, L, { t: T, scale: 2.4, victory: lt > 160, curse: lt > 60 ? Math.min(1, (lt - 60) / 30) : 0 }); ctx.restore();
    if (lt > 60) drawCurse({ x: W / 2, y: H + 80, facing: 1, sc: 2.4 * c.scale, curseT: Math.min(60, (lt - 60) * 2) });
    if (lt > 160) for (let i = 0; i < 8; i++) { ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3; const y = (i * 67 + lt * 9) % H; line(0, y, W, y - 80); }
    if (lt > 20 && lt < 150) txt('"...드디어 나왔군."', W / 2, 70, 30, '#ffcdd2', '#000', 7);
    if (lt > 160) nrtCard('저주 결계', '필살기 · 15초 동안 저절로 베는 칼날 + 공격력↑', lt - 160, '#ffcdd2', '#5d0000');
  } else {   // 5컷: 타이틀
    const lt = T - 760, k = Math.min(1, lt / 20);
    ctx.fillStyle = '#07040a'; ctx.fillRect(0, 0, W, H);
    drawPig(W / 2 + 230, H - 40, -1, L, { t: T, scale: 1.6, victory: true });
    txt('이타돼리', W / 2 - 150, H / 2 - 30, 84 * k, '#fff', '#b71c1c', 14);
    if (lt > 25) txt('저주를 품은 돼지 고등학생', W / 2 - 150, H / 2 + 40, 22, '#ffcdd2', '#000', 6);
    if (lt > 45) txt('⏰ 10일 안에 퀘스트를 깨면 해금!', W / 2 - 150, H / 2 + 85, 20, '#ffd740', '#000', 5);
  }
  ctx.restore();
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 34); ctx.fillRect(0, H - 30, W, 30);
  if (T > 60) txt(TOUCH ? '탭하면 건너뛰기' : 'Enter 건너뛰기', W - 20, H - 15, 12, '#888', null, 0, 'right');
  addHot(0, 0, W, H, () => { if (itt.t > 60) pressed.Enter = true; });
}
// ================= 🎉 대규모 업데이트: 새 돼지 3마리 (관리자가 '대규모 업데이트 공개'를 누르면 모두 무료) =================
// 🍖 훈제돈: 바비큐 셰프 · 🚀 우주꿀돈: 우주비행사 · 🎤 핑크하트: 돼지 아이돌
const BIG_CHARS = ['훈제돈', '우주꿀돈', '핑크하트'];
// 스킬을 쓸 때 특별한 효과 (몸에 거는 스킬 · 물건 깔기)
function bigSkillStart(f, s) {
  big2SkillStart(f, s);   // 대규모 업데이트 · 해적과 마법사
  const k = f.sc / 1.15;
  if (s.type === 'iceFloor') { addObj({ owner: f, kind: 'sauce', ice: true, x: clamp(f.x + f.facing * 180 * k, 60, W - 60), y: GROUND - 6, w: 170, h: 20, life: 420, dmg: 0 }); popText(f.x, f.y - 220 * k, '꽁꽁 얼음 바닥!', '#81d4fa', 24); }
  if (s.type === 'smokeBomb') { f.invT = Math.max(f.invT, 60); smokePuff(f.x, f.y - 70); smokePuff(f.x, f.y - 70); popText(f.x, f.y - 220 * k, '연막!', '#b39ddb', 24); }
  if (s.type === 'stewHeal') { const h = Math.min(10, f.maxHp - f.hp); f.hp += h; for (let i = 0; i < 10; i++) smoke(f.x + rand(-30, 30), f.y - 120 * k, '255,255,255'); popText(f.x, f.y - 230 * k, `뜨끈~ +${Math.round(h)}`, '#ffcc80', 24); }
  if (s.type === 'sauceTrap') { addObj({ owner: f, kind: 'sauce', x: clamp(f.x + f.facing * 190 * k, 60, W - 60), y: GROUND - 6, w: 150, h: 20, life: 420, dmg: 0 }); popText(f.x, f.y - 220 * k, '비법 소스 투하!', '#ff8f00', 24); }
  if (s.type === 'blackHole') { addObj({ owner: f, kind: 'hole', x: f.x + f.facing * 90 * k, y: f.y - 95 * k, vx: f.facing * 2.6, w: 70, h: 70, life: 170, dmg: 0, hitT: 0 }); popText(f.x, f.y - 220 * k, '블랙홀!', '#b388ff', 24); }
  if (s.type === 'cheer') { const h = Math.min(14, f.maxHp - f.hp); f.hp += h; for (let i = 0; i < 18; i++) parts.push({ x: f.x + rand(-60, 60), y: f.y - rand(20, 180) * k, vx: 0, vy: -1.5, life: 40, max: 40, c: pick(['#ff80ab', '#fff59d', '#80d8ff']), s: rand(3, 5), g: -0.02, type: 'dot', glow: true }); popText(f.x, f.y - 230 * k, `응원 받았다! +${Math.round(h)}`, '#ff80ab', 26); }
}
// 매 프레임: 소스 웅덩이 · 블랙홀 · 불꽃 · 유성
function bigObjTick(o) {
  const f = o.owner, d = f.opp;
  if (o.kind === 'sauce') { if (Math.abs(d.x - o.x) < o.w / 2 && d.y >= GROUND - 10) { d.slowT = Math.max(d.slowT, 20); if (o.t % 20 === 0) popText(d.x, d.y - 160, o.ice ? '꽁꽁!' : '미끌!', o.ice ? '#81d4fa' : '#ffb300', 16); } return true; }
  if (o.kind === 'hole') {
    if (o.x < 30 || o.x > W - 30) o.vx = 0;   // (움직임·수명은 updateObjs가 처리)
    const dx = o.x - d.x;
    if (Math.abs(dx) < 320 && d.state !== 'ko' && scene === 'fight') { d.x += Math.sign(dx) * 2.4; if (Math.abs(dx) < 70 && o.t - o.hitT >= 15) { o.hitT = o.t; dealHit(f, d, { dmg: 2.5, height: 'mid', kb: 0, stun: 16, src: o.x, kind: 'skill', noPart: true, hitstop: 2, txt: ['빨려 든다!', '휘융!'] }); } }
    return true;
  }
  if (o.kind === 'meteor' && o.y >= GROUND - 20) { o.life = 0; shake = Math.max(shake, 8); burst(o.x, GROUND - 10, 16, ['#ff9100', '#ffd180', '#8d6e63'], 9); return true; }
  return false;
}
function bigUpdate(f) {   // 싸우는 돼지 매 프레임
  if (f.state === 'attack' && f.atk && f.atk.wave && f.af >= f.atk.startup && f.af < f.atk.startup + f.atk.active && f.af % 2 === 0) parts.push({ type: 'ring', x: f.x + f.facing * 90 * f.sc / 1.15, y: f.y - 95 * f.sc / 1.15, r: 10 + (f.af - f.atk.startup) * 18, life: 10, max: 10, c: '255,255,255', vx: 0, vy: 0, g: 0 });
  if (f.state === 'attack' && f.atk && f.atk.flame && f.af >= f.atk.startup && f.af < f.atk.startup + f.atk.active) for (let i = 0; i < 2; i++) flame(f.x + f.facing * rand(60, 190) * f.sc / 1.15, f.y - rand(60, 130) * f.sc / 1.15);
}
// 필살기
function bigUlt(f, o, T) {
  const type = f.ch.ult.type, s = f.sc / 1.15;
  const U = h => dealHit(f, o, Object.assign({ src: f.x, kind: 'ult', height: 'mid', noPart: true }, h));
  f.vx = 0;
  if (type === 'bbqParty') {   // 상대 발밑에 거대한 숯불 그릴 → 불기둥 세 번
    if (T === 8) { const g = 'bbq' + gT + f.id; for (let i = 0; i < 3; i++) addObj({ owner: f, kind: 'pillar', x: clamp(o.x + (i - 1) * 110, 30, W - 30), y: GROUND - 130, w: 90, h: 260, dmg: 12, launch: -12, kb: 4, stun: 36, delay: i * 12, life: 30, group: g + i, ult: true, burn: 240, txt: ['지글지글!!', '바비큐!!'] }); shake = 12; SFX.slam(); }
    if (T >= 70) ultEnd(f, o);
  }
  if (type === 'coalRain') {   // 숯불 소나기: 숯이 우수수 (맞으면 화상)
    if (T >= 10 && T < 100 && T % 6 === 0) addObj({ owner: f, kind: 'meteor', coal: true, x: clamp(o.x + (T % 18 === 0 ? 0 : srand(-180, 180)), 30, W - 30), y: -40, vx: 0, vy: 10, g: 0.15, w: 44, h: 44, dmg: 4.5, burn: 150, kb: 3, stun: 18, life: 110, ult: true, txt: ['앗뜨!', '숯불!'] });
    if (T >= 115) ultEnd(f, o);
  }
  if (type === 'stewFlood') {   // 뚝배기 홍수: 끓는 국물 파도가 화면 끝까지
    if (T === 10) { addObj({ owner: f, kind: 'flood', x: f.x + f.facing * 40, y: GROUND - 70, vx: f.facing * 8, w: 130, h: 150, dmg: 18, launch: -13, kb: 10, stun: 40, burn: 120, life: 160, ult: true, txt: ['펄펄!!', '뜨거워!!'] }); SFX.splash(); }
    if (T >= 90) ultEnd(f, o);
  }
  if (type === 'meteor') {   // 하늘에서 유성이 우수수
    if (T >= 10 && T < 110 && T % 7 === 0) addObj({ owner: f, kind: 'meteor', x: clamp(o.x + (T % 21 === 0 ? 0 : srand(-170, 170)), 30, W - 30), y: -60, vx: T % 21 === 0 ? 0 : srand(-1.5, 1.5), vy: 9, g: 0.15, w: 56, h: 56, dmg: 5.5, kb: 4, stun: 20, life: 120, ult: true, txt: ['쾅!', '유성!', '콰콰광!'] });
    if (T % 14 === 0 && T < 110) SFX.boom();
    if (T >= 125) ultEnd(f, o);
  }
  if (type === 'encore') {   // 무대 조명 아래 상대가 꼼짝 못 하고 춤추다 마지막에 날아감
    if (T === 6 && o.state !== 'ko') { o.state = 'locked'; o.vx = 0; o.vy = 0; o.atk = null; }
    if (o.state === 'locked') {
      o.x = clamp(f.x + f.facing * 170 * s, 50, W - 50);
      if (T % 12 === 0 && T < 150) { U({ dmg: 2.6, force: true, noReact: true, hitstop: 1, shake: 3, txt: ['♪', '♫', '♬', '앙코르!'] }); tone(660 + (T % 48) * 10, 0.12, 'triangle', 0.08); }
      if (T === 160) U({ dmg: 16, force: true, launch: -16, kb: 16, stun: 40, hitstop: 18, shake: 18, txt: ['피날레!!'] });
    }
    if (T >= 175) ultEnd(f, o);
  }
}
// 그리기: 물건
function drawBigObj(o) {
  if (o.kind === 'sauce' && !groundPass) return true;   // 바닥 물건은 돼지보다 먼저(밑에) 그림
  if (o.kind === 'sauce' && o.ice) { ctx.fillStyle = `rgba(179,229,252,${Math.min(0.75, o.life / 60)})`; ell(o.x, GROUND - 2, o.w / 2, 9); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ell(o.x - 25, GROUND - 4, 24, 3); ctx.fill(); return true; }
  if (o.kind === 'sauce') { ctx.fillStyle = `rgba(191,54,12,${Math.min(0.75, o.life / 60)})`; ell(o.x, GROUND - 2, o.w / 2, 9); ctx.fill(); ctx.fillStyle = 'rgba(255,183,77,0.5)'; ell(o.x - 20, GROUND - 4, 20, 3); ctx.fill(); return true; }
  if (o.kind === 'hole') {
    ctx.save(); const r = 34 + Math.sin(gT * 0.3) * 3; const g = ctx.createRadialGradient(o.x, o.y, 4, o.x, o.y, r * 1.8); g.addColorStop(0, '#000'); g.addColorStop(0.5, '#311b92'); g.addColorStop(1, 'rgba(124,77,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, r * 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(179,136,255,0.8)'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(o.x, o.y, r * 1.4, r * 0.5, gT * 0.2 + i * 1.05, 0, Math.PI * 1.4); ctx.stroke(); } ctx.restore(); return true;
  }
  if (o.kind === 'flood') { ctx.save(); const g = ctx.createLinearGradient(0, o.y - 80, 0, GROUND); g.addColorStop(0, 'rgba(255,171,64,0.9)'); g.addColorStop(1, 'rgba(121,40,0,0.95)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(o.x - 70, GROUND); for (let i = 0; i <= 8; i++) ctx.lineTo(o.x - 70 + i * 17.5, o.y - 60 + Math.sin(gT * 0.4 + i) * 12 - Math.sin(i / 8 * Math.PI) * 30); ctx.lineTo(o.x + 70, GROUND); ctx.closePath(); ctx.fill(); for (let i = 0; i < 3; i++) smoke(o.x + rand(-60, 60), o.y - 90, '255,255,255'); ctx.restore(); return true; }
  if (o.kind === 'meteor' && o.coal) { ctx.save(); ctx.shadowColor = '#ff3d00'; ctx.shadowBlur = 14; ctx.fillStyle = '#3e2723'; ctx.beginPath(); ctx.arc(o.x, o.y, 15, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = gT % 6 < 3 ? '#ff3d00' : '#ffab00'; ctx.beginPath(); ctx.arc(o.x - 3, o.y - 3, 6, 0, Math.PI * 2); ctx.fill(); ctx.restore(); if (o.t % 3 === 0) flame(o.x, o.y - 10); return true; }
  if (o.kind === 'meteor') {
    ctx.save(); ctx.strokeStyle = 'rgba(255,145,0,0.6)'; ctx.lineWidth = 18; line(o.x - o.vx * 8, o.y - 70, o.x, o.y); ctx.shadowColor = '#ff9100'; ctx.shadowBlur = 20;
    ctx.fillStyle = '#6d4c41'; ctx.beginPath(); ctx.arc(o.x, o.y, 22, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ffab40'; ctx.beginPath(); ctx.arc(o.x - 6, o.y - 6, 8, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return true;
  }
  if (o.kind === 'note') { ctx.save(); ctx.translate(o.x, o.y); ctx.shadowColor = '#ff80ab'; ctx.shadowBlur = 10; txt(o.t % 20 < 10 ? '♪' : '♫', 0, 0, 30, '#ff80ab', '#fff', 3); ctx.restore(); return true; }
  return false;
}
// 그리기: 공격 중 효과 · 앙코르 무대 조명
function drawBigFront(f) {
  const s = f.sc / 1.15;
  if (f.state === 'attack' && f.atk && f.atk.skewer && f.af >= f.atk.startup - 2 && f.af < f.atk.startup + f.atk.active + 4) {
    const x0 = f.x + f.facing * 60 * s, x1 = f.x + f.facing * (f.atk.range + 10) * s, y = f.y - 95 * s;
    ctx.strokeStyle = '#a1887f'; ctx.lineWidth = 5; line(x0, y, x1, y);
    for (let i = 0; i < 3; i++) { ctx.fillStyle = i % 2 ? '#8d6e63' : '#e57373'; ell(x0 + (x1 - x0) * (0.3 + i * 0.2), y, 12, 10); ctx.fill(); }
  }
  if (f.state === 'ult' && f.ch.ult.type === 'encore') {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) { const x = 120 + i * 240 + Math.sin(gT * 0.05 + i) * 80; const g = ctx.createLinearGradient(x, 0, f.opp.x, GROUND); g.addColorStop(0, `hsla(${(gT * 5 + i * 90) % 360},90%,65%,0.35)`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 10, 0); ctx.lineTo(x + 10, 0); ctx.lineTo(f.opp.x + 80, GROUND); ctx.lineTo(f.opp.x - 80, GROUND); ctx.fill(); }
    ctx.restore();
  }
}
// ---- 필살기 컷신 (세 돼지 공통 틀 · 색과 연출만 다름) ----
const BIG_CUT = 95;
const BIG_THEME = {
  broadside: { bg: ['#0d2a4a', '#020a14'], band: 'rgba(198,40,40,0.85)', edge: '#2a0000', sub: '"전 대포, 발사 준비!!"', tag: '해적선 대포알이 쏟아짐' },
  giantPotion: { bg: ['#2a0a4a', '#08020f'], band: 'rgba(124,77,255,0.85)', edge: '#1a0f40', sub: '"꿀꺽... 크하하!"', tag: '12초 동안 거대해짐' },
  rush: { bg: ['#4a0018', '#120006'], band: 'rgba(255,64,129,0.85)', edge: '#4a0018', sub: '"한 판 제대로 굽자!"', tag: '돌진 후 폭풍 연타' },
  eruption: { bg: ['#3e1000', '#0a0300'], band: 'rgba(255,87,34,0.85)', edge: '#3e1000', sub: '"한라산이 깨어난다..."', tag: '앞으로 용암 기둥 다섯 개' },
  charge: { bg: ['#2e1d10', '#0d0804'], band: 'rgba(141,110,99,0.9)', edge: '#2e1d10', sub: '"비켜!!!"', tag: '화면 끝까지 무적 돌진' },
  stampede: { bg: ['#3a2a10', '#100a04'], band: 'rgba(255,183,77,0.85)', edge: '#3a2a10', sub: '"얘들아, 가자!"', tag: '꼬마 돼지 8마리 돌격' },
  absoluteZero: { bg: ['#022a40', '#000a12'], band: 'rgba(79,195,247,0.85)', edge: '#01304a', sub: '"...얼어붙어라."', tag: '꽁꽁 얼리고 대패로 썬다' },
  thousandKicks: { bg: ['#2a1a00', '#0a0600'], band: 'rgba(255,193,7,0.85)', edge: '#3e2a00', sub: '"족발 천 번!"', tag: '돌진 후 발차기 난무' },
  bodySlam: { bg: ['#2a2a40', '#0a0a14'], band: 'rgba(255,255,255,0.8)', edge: '#2a2a40', sub: '"하늘에서 떨어지는 오겹살!"', tag: '높이 뛰어 깔아뭉개기' },
  beam: { bg: ['#4a0a00', '#140200'], band: 'rgba(255,61,0,0.85)', edge: '#4a0a00', sub: '"매운맛 좀 볼래?"', tag: '화면을 가르는 불 빔' },
  thousandCuts: { bg: ['#1a1030', '#06030c'], band: 'rgba(179,157,219,0.85)', edge: '#1a1030', sub: '"...이미 베었다."', tag: '보이지 않는 천 번 베기' },
  megaton: { bg: ['#3a0000', '#100000'], band: 'rgba(229,57,53,0.9)', edge: '#3a0000', sub: '"원 펀치."', tag: '가드를 부수는 한 방' },
  sliceRain: { bg: ['#0d2a3a', '#03090d'], band: 'rgba(129,212,250,0.85)', edge: '#0d2a3a', sub: '"냉동실 문 열어!"', tag: '하늘에서 얼린 냉삼이 우수수' },
  goldSafe: { bg: ['#3a2a00', '#0d0900'], band: 'rgba(255,215,64,0.9)', edge: '#3a2a00', sub: '"돈으로 때린다."', tag: '머리 위로 금고 쿵!' },
  coalRain: { bg: ['#2a0a00', '#0a0200'], band: 'rgba(255,111,0,0.85)', edge: '#2a0a00', sub: '"숯불 맛 좀 봐라!"', tag: '하늘에서 뜨거운 숯이 쏟아짐' },
  stewFlood: { bg: ['#3a1a00', '#0d0600'], band: 'rgba(255,171,64,0.85)', edge: '#3a1a00', sub: '"뚝배기 대령이오~"', tag: '끓는 국물 파도가 휩쓸어 감' },
  bbqParty: { bg: ['#3e1200', '#120400'], band: 'rgba(255,111,0,0.85)', edge: '#3e1200', sub: '"오늘의 메뉴는... 너야!"', tag: '숯불 위로 불기둥 세 번' },
  meteor: { bg: ['#0d0b2e', '#000'], band: 'rgba(124,77,255,0.85)', edge: '#1a0f40', sub: '"우주에서 배달 왔습니다."', tag: '하늘에서 유성이 우수수' },
  encore: { bg: ['#4a0030', '#12000c'], band: 'rgba(255,64,129,0.85)', edge: '#4a0030', sub: '"앙코르! 앙코르!"', tag: '무대 조명 아래 꼼짝 마!' }
};
function drawBigCut(f) {
  const ty = f.ch.ult.type, th = BIG_THEME[ty], T = BIG_CUT - superFreeze, k = Math.min(1, T / 14);
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, th.bg[0]); g.addColorStop(1, th.bg[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (ty === 'bbqParty') { for (let i = 0; i < 12; i++) { ctx.fillStyle = '#2b2b2b'; ctx.fillRect(0, H - 120 + i * 10, W, 3); } for (let i = 0; i < 4; i++) flame(rand(0, W), H - rand(20, 120)); drawParts(); }
  if (ty === 'meteor') { for (let i = 0; i < 60; i++) { ctx.fillStyle = '#fff'; ctx.fillRect((i * 151 + T * (1 + i % 3)) % W, (i * 71) % H, 2, 2); } for (let i = 0; i < 4; i++) { const x = (i * 260 + T * 9) % (W + 200) - 100, y = (i * 90 + T * 6) % H; ctx.strokeStyle = 'rgba(255,145,0,0.7)'; ctx.lineWidth = 10; line(x - 60, y - 60, x, y); ctx.fillStyle = '#8d6e63'; ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill(); } }
  if (!['bbqParty', 'meteor', 'encore'].includes(ty)) {   // 원래 돼지들: 테마 색 집중선 + 불티
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(T * 0.01); for (let i = 0; i < 20; i++) { ctx.rotate(Math.PI / 10); ctx.fillStyle = i % 2 ? th.band.replace(/[\d.]+\)$/, '0.22)') : 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-50, -700); ctx.lineTo(50, -700); ctx.fill(); } ctx.restore();
    for (let i = 0; i < 24; i++) { const y = (i * 41 + T * 14) % H; ctx.fillStyle = th.band.replace(/[\d.]+\)$/, '0.5)'); ctx.fillRect((i * 97) % W, y, 3, 22); }
  }
  if (ty === 'encore') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const x = 100 + i * 190; ctx.fillStyle = `hsla(${(T * 6 + i * 70) % 360},90%,60%,0.25)`; ctx.beginPath(); ctx.moveTo(x - 8, 0); ctx.lineTo(x + 8, 0); ctx.lineTo(W / 2 + 120, H); ctx.lineTo(W / 2 - 120, H); ctx.fill(); } ctx.restore(); for (let i = 0; i < 10; i++) txt(i % 2 ? '♪' : '♫', (i * 97 + T * 4) % W, H - ((i * 53 + T * 5) % H), 30, '#ff80ab', null); }
  ctx.save(); ctx.translate(W / 2, H + 70); drawPig(0, 0, 1, f.C, { t: gT, scale: f.ch.scale * (2 + T * 0.004), victory: true }); ctx.restore();
  ctx.save(); ctx.translate((1 - k) * -W, 0); ctx.fillStyle = th.band; ctx.fillRect(0, 60, W, 70); txt(f.ch.ult.name, W / 2, 95, 46, '#fff', th.edge, 10); ctx.restore();
  if (T > 30) txt(T < 65 ? th.sub : th.tag, W / 2, H - 50, 22, '#fff', '#000', 6);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 30); ctx.fillRect(0, H - 18, W, 18);
}
// ---- 대규모 업데이트 예고편: 세 돼지 한 컷씩 → 타이틀 ----
const BIGT_T = 840; const bigt = { t: 0, sh: 0 };
function startBigTrailer() { lsSet('sgf_bigtrailer', true); bigt.t = 0; bigt.sh = 0; scene = 'bigtrailer'; }
function updateBigTrailer() {
  const T = ++bigt.t; if (bigt.sh > 0) bigt.sh *= 0.88;
  if (T === 1) SFX.gong();
  if (T === 120) { SFX.slam(); bigt.sh = 18; }
  if (T === 330) { SFX.boom(); bigt.sh = 22; }
  if (T >= 470 && T < 600 && T % 12 === 0) tone(523 + (T % 36) * 12, 0.15, 'triangle', 0.09);
  if (T === 700) SFX.bell();
  if (T >= BIGT_T || (T > 60 && (pressed.Escape || pressed.Enter || pressed.Space))) { if (cutBack) { cutBack = false; scene = 'cutlist'; return; }   // 다시 보기에서 틀었으면 목록으로
    toTitle(); popup({ icon: '🎉', title: '대규모 업데이트!', lines: ['🍖 훈제돈 · 🎤 핑크하트: 모두 무료 해금!', '🚀 우주꿀돈: 보상 센터 퀘스트를 깨면 해금', '캐릭터 선택에서 골라 보세요'], big: true }); }
}
function drawBigTrailer() {
  const T = bigt.t, C = n => CHARS.find(c => c.name === n);
  ctx.save(); if (bigt.sh > 0.5) ctx.translate(rand(-bigt.sh, bigt.sh), rand(-bigt.sh, bigt.sh));
  if (T < 70) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); txt('🎉 대규모 업데이트', W / 2, H / 2, 54 * Math.min(1, T / 15), '#ffd740', '#3e2723', 10); }
  else if (T < 260) {   // 🍖 훈제돈
    const lt = T - 70; ctx.fillStyle = '#2a0e00'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#333'; for (let i = 0; i < 10; i++) ctx.fillRect(0, H - 100 + i * 9, W, 3);
    if (lt > 50) for (let i = 0; i < 3; i++) { const x = 560 + i * 110, h = Math.min(260, (lt - 50 - i * 8) * 14); if (h > 0) { const g = ctx.createLinearGradient(0, H - 100 - h, 0, H - 100); g.addColorStop(0, 'rgba(255,235,59,0)'); g.addColorStop(1, 'rgba(255,111,0,0.9)'); ctx.fillStyle = g; ctx.fillRect(x - 40, H - 100 - h, 80, h); } }
    drawPig(260, H - 100, 1, C('훈제돈').look, { t: T, scale: 1.4, victory: lt > 50 });
    nrtCard('훈제돈', '바비큐 셰프 · 플람베 · 소스 덫 · 꼬치 · 필살기 바비큐 파티', lt, '#ffcc80', '#bf360c');
  } else if (T < 450) {   // 🚀 우주꿀돈
    const lt = T - 260; ctx.fillStyle = '#05051a'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) { ctx.fillStyle = '#fff'; ctx.fillRect((i * 151) % W, (i * 71) % H, 2, 2); }
    ctx.fillStyle = '#4a4a6a'; ctx.beginPath(); ctx.arc(W / 2, H + 380, 520, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 5; i++) if (lt > 60 + i * 12) { const p = Math.min(1, (lt - 60 - i * 12) / 30), x = 520 + i * 90 - p * 100, y = -60 + p * (H - 80); ctx.strokeStyle = 'rgba(255,145,0,0.7)'; ctx.lineWidth = 12; line(x + 50, y - 70, x, y); ctx.fillStyle = '#8d6e63'; ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill(); }
    drawPig(260, H - 110 - Math.sin(lt * 0.05) * 20, 1, C('우주꿀돈').look, { t: T, scale: 1.4 });
    nrtCard('우주꿀돈', '우주비행사 · 저중력 · 블랙홀 · 로켓 박치기 · 필살기 유성우', lt, '#b388ff', '#1a0f40');
  } else if (T < 640) {   // 🎤 핑크하트
    const lt = T - 450; ctx.fillStyle = '#1a0010'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const x = 100 + i * 190 + Math.sin(T * 0.05 + i) * 60; ctx.fillStyle = `hsla(${(T * 6 + i * 70) % 360},90%,60%,0.25)`; ctx.beginPath(); ctx.moveTo(x - 8, 0); ctx.lineTo(x + 8, 0); ctx.lineTo(W / 2 + 140, H); ctx.lineTo(W / 2 - 140, H); ctx.fill(); } ctx.restore();
    ctx.fillStyle = '#3d0026'; ctx.fillRect(0, H - 90, W, 90);
    for (let i = 0; i < 12; i++) txt(i % 2 ? '♪' : '♫', (i * 83 + T * 3) % W, H - ((i * 47 + T * 4) % H), 28, '#ff80ab', null);
    drawPig(W / 2, H - 90, 1, C('핑크하트').look, { t: T, scale: 1.45, victory: (T >> 4) % 2 === 0 });
    nrtCard('핑크하트', '돼지 아이돌 · 음표 파동 · 응원 회복 · 하트 윙크 · 필살기 앙코르 콘서트', lt, '#ff80ab', '#4a0030');
  } else {   // 타이틀
    const lt = T - 640, k = Math.min(1, lt / 20);
    ctx.fillStyle = '#07040a'; ctx.fillRect(0, 0, W, H);
    BIG_CHARS.forEach((n, i) => drawPig(220 + i * 260, H - 60, i === 2 ? -1 : 1, C(n).look, { t: T + i * 20, scale: 1.2, victory: true }));
    txt('새 돼지 3마리 등장!', W / 2, 120, 50 * k, '#fff', '#e65100', 10);
    if (lt > 30) txt('🎁 훈제돈·핑크하트 무료 · 🚀 우주꿀돈은 퀘스트', W / 2, 180, 22, '#ffd740', '#000', 6);
  }
  ctx.restore();
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 34); ctx.fillRect(0, H - 30, W, 30);
  if (T > 60) txt(TOUCH ? '탭하면 건너뛰기' : 'Enter 건너뛰기', W - 20, H - 15, 12, '#888', null, 0, 'right');
  addHot(0, 0, W, H, () => { if (bigt.t > 60) pressed.Enter = true; });
}
// ================= ⚡ 캐릭터 각성 (모듈식: AWAKE에 돼지와 조건만 추가하면 됨) =================
// 그 돼지로 연승 모드·랭크전을 하며 조건을 전부 채우면 각성: 체력·공격력↑ · 필살기 강화 · 각성 오라
// 저장: sgf_awake = { 돼지이름: { 조건id: 숫자, done: true } }
const AWAKE = {
  '이타돼리': {
    title: '각성 · 스쿠나', color: '#ff1744', hp: 1.2, power: 1.2,
    note: '스쿠나 모습이 열려요 (문신 · 팔 두 쌍 · 크게 베기 · 불화살 · 필살기 저주 결계)',
    steps: [
      { id: 'win', name: '이타돼리로 40번 이기기', goal: 40 },
      { id: 'bolt', name: '검은 번개 60번 터뜨리기 (평타·스킬 모두)', goal: 60 },
      { id: 'ultko', name: '이타돼리 필살기로 K.O. 10번', goal: 10 },
      { id: 'lose', name: '이타돼리로 15번 지기 (쓰러져야 강해진다)', goal: 15 },
      { id: 'streak', name: '이타돼리로 연승 모드 10연승', goal: 10 },
      { id: 'perfect', name: '이타돼리로 한 대도 안 맞고 이기기 5번', goal: 5 }
    ]
  }
};
const awkAll = () => lsGet('sgf_awake', {});
const awkOf = name => awkAll()[name] || {};
const isAwake = name => !!(AWAKE[name] && awkOf(name).done);
const awkOff = name => !!lsGet('sgf_awkoff', {})[name];   // 각성 끔 (돼지 도감에서 켜고 끄기)
const awkOn = name => name === '이타돼리' ? itForm() === 'sukuna' : isAwake(name) && !awkOff(name);   // 이타돼리는 도감에서 고른 모습(스쿠나)이 곧 각성
function toggleAwake(name) { const o = lsGet('sgf_awkoff', {}); o[name] = !o[name]; lsSet('sgf_awkoff', o); cloudDirty(); SFX.select(); toast(o[name] ? `⚡ ${name} 각성 끔 (보통 모습)` : `⚡ ${name} 각성 켬!`); }
const cursed = f => !!(f && (f.curseT > 0 || f.sukuna));   // 저주왕 모습 (필살기 중이거나 각성)
function awkAdd(name, id, v = 1, max = false) {
  const A = AWAKE[name]; if (!A || isAwake(name)) return;
  const st = A.steps.find(s => s.id === id); if (!st) return;
  const all = awkAll(), q = all[name] || {}, was = q[id] || 0; if (was >= st.goal) return;
  q[id] = Math.min(st.goal, max ? Math.max(was, v) : was + v); all[name] = q;
  if (q[id] >= st.goal) {
    if (A.steps.every(s => (q[s.id] || 0) >= s.goal)) { q.done = true; popup({ icon: '⚡', title: `${name} 각성!!!`, lines: [A.title, `체력 ×${A.hp} · 공격력 ×${A.power}`, A.note], big: true }); }
    else toast(`⚡ ${name} 각성 조건 달성: ${st.name}`);
  }
  lsSet('sgf_awake', all); cloudDirty();
}
function showAwake() {
  const L = Object.keys(AWAKE).filter(n => isUnlocked(CHARS.find(c => c.name === n)));
  if (!L.length) { toast('⚡ 각성할 수 있는 돼지가 아직 없어요 (이타돼리를 먼저 얻으세요)'); return; }
  for (const n of L) {
    const A = AWAKE[n], q = awkOf(n);
    popup({ icon: '⚡', title: isAwake(n) ? `${n} · ${A.title} (각성 완료)` : `${n} 각성 조건 (전부 채우면 각성)`, lines: [...A.steps.map(s => `${(q[s.id] || 0) >= s.goal ? '✅' : '⬜'} ${s.name}  ${Math.min(q[s.id] || 0, s.goal)}/${s.goal}`), `보상: 체력 ×${A.hp} · 공격력 ×${A.power} · ${A.note}`] });
  }
}
// 각성 오라: 검붉은 번개가 몸 주위에서 튐
function drawAwake(f) {
  if (!f.awk || f.state === 'ko') return;
  const s = f.sc / 1.15, A = AWAKE[f.ch.name];
  if (gT % 6 < 3) { ctx.save(); ctx.shadowColor = A.color; ctx.shadowBlur = 14; ctx.strokeStyle = gT % 12 < 6 ? A.color : '#000'; ctx.lineWidth = 3; ctx.beginPath(); let x = f.x + rand(-60, 60) * s, y = f.y - rand(30, 170) * s; ctx.moveTo(x, y); for (let j = 0; j < 4; j++) { x += rand(-22, 22); y += rand(-22, 22); ctx.lineTo(x, y); } ctx.stroke(); ctx.restore(); }
  txt('각성', f.x, f.y - 232 * s, 13, A.color, '#000', 4);
}
// ================= 🎨 스킨: 몸 색 + 때릴 때 효과가 바뀜 (상점에서 사서 장착, 내 돼지에 적용) =================
const SKIN_DEF = {
  skHell:   { name: '지옥불', pal: { body: '#6d1b1b', dark: '#1a0000', belly: '#9c2a2a', snout: '#b23a3a', hoof: '#120000', brow: '#000' }, fx: ['#ff3d00', '#ffab00', '#3e0000'], kind: 'fire', aura: '#ff3d00' },
  skIce:    { name: '빙하', pal: { body: '#b3e5fc', dark: '#0277bd', belly: '#e1f5fe', snout: '#81d4fa', hoof: '#01579b', brow: '#01579b' }, fx: ['#e1f5fe', '#4fc3f7', '#ffffff'], kind: 'ice', aura: '#81d4fa' },
  skBolt:   { name: '번개', pal: { body: '#fff176', dark: '#6a1b9a', belly: '#fff9c4', snout: '#ffd54f', hoof: '#4a148c', brow: '#4a148c' }, fx: ['#ffeb3b', '#b388ff', '#ffffff'], kind: 'bolt', aura: '#ffeb3b' },
  skGalaxy: { name: '은하수', pal: { body: '#311b92', dark: '#0d0630', belly: '#4527a0', snout: '#5e35b1', hoof: '#0d0630', brow: '#000' }, fx: ['#b388ff', '#80d8ff', '#ffffff'], kind: 'star', aura: '#b388ff' },
  skSakura: { name: '벚꽃', pal: { body: '#fce4ec', dark: '#c2185b', belly: '#ffffff', snout: '#f8bbd0', hoof: '#ad1457', brow: '#880e4f' }, fx: ['#f8bbd0', '#ffffff', '#f48fb1'], kind: 'petal', aura: '#f48fb1' },
  skGold:   { name: '황금 왕', pal: { body: '#ffd54f', dark: '#8d6e00', belly: '#fff8e1', snout: '#ffca28', hoof: '#5d4037', brow: '#5d4037' }, fx: ['#ffd740', '#fff8e1', '#ffab00'], kind: 'coin', aura: '#ffd740' },
  skPoison: { name: '독안개', pal: { body: '#9ccc65', dark: '#33691e', belly: '#c5e1a5', snout: '#8bc34a', hoof: '#1b5e20', brow: '#1b5e20' }, fx: ['#76ff03', '#ccff90', '#33691e'], kind: 'poison', aura: '#76ff03' },
  skShadow: { name: '그림자', pal: { body: '#424242', dark: '#000000', belly: '#616161', snout: '#535353', hoof: '#000', brow: '#000' }, fx: ['#212121', '#9e9e9e', '#000'], kind: 'shadow', aura: '#616161' },
  skLava:   { name: '용암', pal: { body: '#3e2723', dark: '#ff3d00', belly: '#ff6e40', snout: '#5d4037', hoof: '#bf360c', brow: '#ff3d00' }, fx: ['#ff3d00', '#ffab40', '#3e2723'], kind: 'lava', aura: '#ff6e40' },
  skRainbow: { name: '무지개', pal: { body: '#fff3fb', dark: '#7c4dff', belly: '#ffffff', snout: '#ffd1f0', hoof: '#7c4dff', brow: '#7c4dff' }, fx: ['#ff5252', '#ffeb3b', '#69f0ae', '#40c4ff', '#e040fb'], kind: 'rainbow', aura: '#e040fb' },
};
const skinOf = f => f && f.C && ((f.C.skinFx && f.C.skinFx.fx && f.C.skinFx) || (f.C.skin && SKIN_DEF[f.C.skin]) || null);   // 업데이트 돼지 의상(fx 없음)은 기본 타격 효과
// 때릴 때: 스킨마다 다른 파편 · 모양
function skinHitFx(a, x, y, dmg) {
  const S = skinOf(a); if (!S) return;
  const n = Math.min(14, 4 + dmg * 0.6 | 0);
  if (S.kind === 'fire') for (let i = 0; i < n; i++) flame(x + rand(-20, 20), y + rand(-20, 20));
  if (S.kind === 'ice') for (let i = 0; i < n; i++) parts.push({ x, y, vx: rand(-7, 7), vy: rand(-8, 2), life: 26, max: 26, c: pick(S.fx), s: rand(3, 6), g: 0.3, type: 'dot', glow: true });
  if (S.kind === 'poison') for (let i = 0; i < n; i++) parts.push({ x: x + rand(-20, 20), y: y + rand(-10, 10), vx: rand(-2, 2), vy: rand(-3, -1), life: 30, max: 30, c: pick(S.fx), s: rand(4, 8), g: -0.03, type: 'dot', glow: true });
  if (S.kind === 'shadow') for (let i = 0; i < 4; i++) smoke(x + rand(-20, 20), y + rand(-20, 20), '30,30,30');
  if (S.kind === 'lava') for (let i = 0; i < n; i++) { flame(x + rand(-20, 20), y); parts.push({ x, y, vx: rand(-6, 6), vy: rand(-8, -2), life: 26, max: 26, c: pick(S.fx), s: rand(3, 5), g: 0.35, type: 'dot', glow: true }); }
  if (S.kind === 'rainbow') for (let i = 0; i < n + 4; i++) parts.push({ x, y, vx: Math.cos(i) * 7, vy: Math.sin(i) * 7, life: 24, max: 24, c: `hsl(${(gT * 8 + i * 40) % 360},90%,60%)`, s: rand(3, 5), g: 0.05, type: 'dot', glow: true });
  if (S.kind === 'bolt') { for (let i = 0; i < 3; i++) slash(x + rand(-20, 20), y + rand(-20, 20)); }
  if (S.kind === 'star' || S.kind === 'petal' || S.kind === 'coin') for (let i = 0; i < Math.min(5, n); i++) texts.push({ x: x + rand(-30, 30), y: y + rand(-20, 20), s: S.kind === 'star' ? '✦' : S.kind === 'petal' ? '🌸' : '🪙', c: pick(S.fx), size: 18 + rand(0, 10), life: 30, max: 30 });
  parts.push({ type: 'ring', x, y, r: 10, life: 16, max: 16, c: S.kind === 'ice' ? '129,212,250' : S.kind === 'fire' ? '255,61,0' : S.kind === 'bolt' ? '255,235,59' : S.kind === 'star' ? '179,136,255' : S.kind === 'petal' ? '248,187,208' : '255,215,64', vx: 0, vy: 0, g: 0 });
}
// 서 있을 때도 스킨 기운이 살짝
function drawSkinAura(f) {
  const S = skinOf(f); if (!S || f.state === 'ko' || gT % 7) return;
  const s = f.sc / 1.15;
  parts.push({ x: f.x + rand(-50, 50) * s, y: f.y - rand(20, 150) * s, vx: rand(-0.3, 0.3), vy: -1, life: 30, max: 30, c: S.aura, s: rand(2, 3.5), g: -0.01, type: 'dot', glow: true });
}
// ================= 🏴‍☠️🧙 대규모 업데이트 · 해적과 마법사: 캡틴베이컨(해적 · 무료) · 꿀린(마법사 · 퀘스트) — 관리자가 공개(big2) =================
const BIG2_CHARS = ['캡틴베이컨', '꿀린'];
function big2SkillStart(f, s) {
  const k = f.sc / 1.15;
  if (s.type === 'blink') {   // 점멸: 원래 자리에 마법 폭발을 남기고 상대 뒤로
    addObj({ owner: f, kind: 'magicBoom', x: f.x, y: f.y - 90 * k, w: 150, h: 150, dmg: 8, kb: 10, launch: -8, stun: 26, delay: 14, life: 16, txt: ['펑!'] });
    const side = Math.sign(f.opp.x - f.x) || 1; f.x = clamp(f.opp.x + side * 120, 50, W - 50); f.facing = -side; f.invT = Math.max(f.invT, 14);
    for (let i = 0; i < 16; i++) parts.push({ x: f.x + rand(-40, 40), y: f.y - rand(20, 160) * k, vx: rand(-2, 2), vy: rand(-2, 2), life: 24, max: 24, c: pick(['#b388ff', '#ea80fc', '#fff']), s: rand(2, 4), g: 0, type: 'dot', glow: true });
  }
}
function big2ObjTick(o) {
  const f = o.owner, d = f.opp;
  if (o.kind === 'blood' && o.hits === 0) {   // 피의 유도탄: 상대를 쫓아감 (지나치면 돌아옴)
    const tx = d.x, ty = d.y - 95 * d.sc / 1.15, ang = Math.atan2(ty - o.y, tx - o.x), sp = 14, cur = Math.atan2(o.vy, o.vx);
    let da = ang - cur; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
    const na = cur + clamp(da, -0.13, 0.13); o.vx = Math.cos(na) * sp; o.vy = Math.sin(na) * sp;
  }
  if (o.kind === 'orb') {   // 유도 마법 구슬: 상대 쪽으로 천천히 꺾임
    const ty = d.y - 95 * d.sc / 1.15; o.vy = clamp(o.vy + Math.sign(ty - o.y) * 0.35, -4, 4);
    if (Math.sign(d.x - o.x) !== Math.sign(o.vx) && Math.abs(d.x - o.x) > 40 && o.t > 20) o.vx *= 0.96;
    if (o.t % 2 === 0) parts.push({ x: o.x, y: o.y, vx: 0, vy: 0, life: 16, max: 16, c: '#ea80fc', s: 4, g: 0, type: 'dot', glow: true });
  }
  if (o.kind === 'cannon' && o.t % 3 === 0) smoke(o.x - Math.sign(o.vx) * 20, o.y, '90,90,90');
  return false;
}
function big2Update(f) {
  if (f.frogT > 0 && --f.frogT === 0) { popText(f.x, f.y - 160, '저주가 풀렸다!', '#c5e1a5', 20); smokePuff(f.x, f.y - 60); }
  if (f.giantT > 0 && --f.giantT === 0) { popText(f.x, f.y - 200, '원래대로...', '#ccc', 20); smokePuff(f.x, f.y - 80); }
}
function big2Ult(f, o, T) {
  const s = f.sc / 1.15; f.vx = 0;
  if (f.ch.ult.type === 'broadside') {   // 일제 사격: 뒤쪽 화면 밖 해적선에서 대포알이 높이를 바꿔 가며 날아옴
    if (T >= 8 && T < 80 && T % 9 === 0) { const i = (T - 8) / 9, low = i % 2 === 0; addObj({ owner: f, kind: 'cannon', x: f.facing > 0 ? -40 : W + 40, y: low ? GROUND - 40 : GROUND - 130, vx: f.facing * 15, w: 54, h: 54, dmg: 7, kb: 8, stun: 24, height: low ? 'low' : 'mid', life: 90, ult: true, txt: ['쾅!', '펑!', '발사!'] }); SFX.boom(); shake = Math.max(shake, 6); }
    if (T >= 100) ultEnd(f, o);
  }
  if (f.ch.ult.type === 'giantPotion') {   // 거대화 물약: 꿀꺽 → 쿵! 12초 동안 거대
    if (T === 10) { f.giantT = 720; shake = 24; SFX.slam(); burst(f.x, GROUND - 10, 50, ['#b388ff', '#ea80fc', '#fff'], 14); popText(f.x, f.y - 300 * s, '거대화!! 12초', '#ea80fc', 34); if (Math.abs(o.x - f.x) < 420) dealHit(f, o, { dmg: 16, launch: -14, kb: 16, stun: 40, src: f.x, kind: 'ult', height: 'mid', hitstop: 16, shake: 18, txt: ['쿠웅!!'] }); }
    if (T >= 26) ultEnd(f, o);
  }
}
function drawBig2Obj(o) {
  if (o.kind === 'blood') { const v = Math.hypot(o.vx, o.vy) || 1, tx = o.x - o.vx / v * 60, ty = o.y - o.vy / v * 60; ctx.save(); ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 16; ctx.strokeStyle = '#b71c1c'; ctx.lineWidth = 8; line(tx, ty, o.x, o.y); ctx.strokeStyle = '#ff8a80'; ctx.lineWidth = 3; line(tx, ty, o.x, o.y); ctx.fillStyle = '#ff1744'; ctx.beginPath(); ctx.arc(o.x, o.y, 6, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return true; }   // 날아가는 방향으로 꺾여 보임
  if (o.kind === 'orb') { ctx.save(); ctx.shadowColor = '#ea80fc'; ctx.shadowBlur = 20; const g = ctx.createRadialGradient(o.x, o.y, 2, o.x, o.y, 18); g.addColorStop(0, '#fff'); g.addColorStop(0.5, '#ea80fc'); g.addColorStop(1, 'rgba(124,77,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, 18, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return true; }
  if (o.kind === 'cannon') { ctx.save(); ctx.fillStyle = '#212121'; ctx.beginPath(); ctx.arc(o.x, o.y, 20, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(o.x - 6, o.y - 6, 6, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return true; }
  if (o.kind === 'parrot') {   // 앵무새: 날개를 퍼덕이며 날아감
    const fl = Math.sin(o.t * 0.8) * 10, dir = Math.sign(o.vx) || 1; ctx.save(); ctx.translate(o.x, o.y); ctx.scale(dir, 1);
    ctx.fillStyle = '#43a047'; ell(0, 0, 18, 11); ctx.fill(); ctx.fillStyle = '#e53935'; poly([[-4, -2], [-22, -12 - fl], [-12, 4]]); ctx.fill(); ctx.fillStyle = '#fdd835'; poly([[16, -3], [26, 0], [16, 4]]); ctx.fill();
    ctx.fillStyle = '#1e88e5'; poly([[-16, 0], [-30, 6], [-16, 6]]); ctx.fill(); ctx.fillStyle = '#000'; ell(9, -4, 2, 2); ctx.fill(); ctx.restore(); return true;
  }
  if (o.kind === 'magicBoom') { if (o.delay > 0) { ctx.strokeStyle = `rgba(234,128,252,${0.4 + 0.4 * Math.sin(gT * 0.6)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(o.x, o.y, 40, 0, Math.PI * 2); ctx.stroke(); return true; } ctx.save(); ctx.globalAlpha = Math.max(0, o.life / 16); ctx.fillStyle = '#ea80fc'; ctx.beginPath(); ctx.arc(o.x, o.y, 80 - o.life * 2, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return true; }
  return false;
}
// 개구리 저주 · 거대화 그리기
function drawBig2Front(f) {
  const s = f.sc / 1.15;
  if (f.frogT > 0) { ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#7cb342'; ell(f.x, f.y - 60 * s, 48 * s, 40 * s); ctx.fill(); ctx.restore(); txt('🐸', f.x, f.y - 150 * s, 26, '#fff', null); }
  if (f.giantT > 0 && gT % 5 === 0) parts.push({ x: f.x + rand(-80, 80) * s, y: f.y - rand(20, 220) * s, vx: 0, vy: -1.2, life: 30, max: 30, c: pick(['#ea80fc', '#b388ff']), s: rand(2, 4), g: -0.01, type: 'dot', glow: true });
}
// ---- 예고편 ----
const BIG2T_T = 660; const big2t = { t: 0, sh: 0 };
function startBig2Trailer() { lsSet('sgf_big2trailer', true); big2t.t = 0; big2t.sh = 0; scene = 'big2trailer'; }
function updateBig2Trailer() {
  const T = ++big2t.t; if (big2t.sh > 0) big2t.sh *= 0.88;
  if (T === 1) SFX.gong();
  if (T >= 140 && T < 230 && T % 15 === 0) { SFX.boom(); big2t.sh = 10; }
  if (T === 400) { SFX.slam(); big2t.sh = 26; }
  if (T === 540) SFX.bell();
  if (T >= BIG2T_T || (T > 60 && (pressed.Escape || pressed.Enter || pressed.Space))) { if (cutBack) { cutBack = false; scene = 'cutlist'; return; }   // 다시 보기에서 틀었으면 목록으로
    toTitle(); popup({ icon: '🏴‍☠️', title: '대규모 업데이트 · 해적과 마법사!', lines: ['🏴‍☠️ 캡틴베이컨: 모두 무료 해금!', '🧙 꿀린: 보상 센터 퀘스트를 깨면 해금', '캐릭터 선택에서 골라 보세요'], big: true }); }
}
function drawBig2Trailer() {
  const T = big2t.t, C = n => CHARS.find(c => c.name === n);
  ctx.save(); if (big2t.sh > 0.5) ctx.translate(rand(-big2t.sh, big2t.sh), rand(-big2t.sh, big2t.sh));
  if (T < 60) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); txt('🎉 대규모 업데이트 · 해적과 마법사', W / 2, H / 2, 50 * Math.min(1, T / 15), '#ffd740', '#3e2723', 10); }
  else if (T < 300) {   // 바다 위 해적선 · 대포
    const lt = T - 60; const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ff8a65'); g.addColorStop(0.55, '#5d4037'); g.addColorStop(0.56, '#0d47a1'); g.addColorStop(1, '#002171'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#3e2723'; ctx.beginPath(); ctx.moveTo(560, 330); ctx.lineTo(900, 330); ctx.lineTo(860, 390); ctx.lineTo(600, 390); ctx.fill(); ctx.fillRect(720, 140, 8, 190); ctx.fillStyle = '#fafafa'; poly([[730, 150], [830, 220], [730, 300]]); ctx.fill(); ctx.fillStyle = '#212121'; ctx.fillRect(640, 120, 70, 44); txt('☠', 675, 142, 30, '#fff', null);
    for (let i = 0; i < 4; i++) if (lt > 80 + i * 15) { const p = (lt - 80 - i * 15) * 14; ctx.fillStyle = '#212121'; ctx.beginPath(); ctx.arc(600 - p, 350 - i * 12, 12, 0, Math.PI * 2); ctx.fill(); }
    drawPig(250, H - 120, 1, C('캡틴베이컨').look, { t: T, scale: 1.4, victory: lt > 60 });
    nrtCard('캡틴베이컨', '해적 · 대포알 · 갈고리 · 앵무새 · 필살기 일제 사격', lt, '#ffcc80', '#3e2723');
  } else if (T < 520) {   // 마법 탑 · 거대화
    const lt = T - 300; ctx.fillStyle = '#12082a'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 50; i++) { ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.4 * Math.sin(T * 0.1 + i)})`; ctx.fillRect((i * 151) % W, (i * 71) % H, 2, 2); }
    const big = lt > 100, sc = big ? 1.4 + Math.min(1, (lt - 100) / 20) * 0.9 : 1.4;
    drawPig(W / 2, H - 50, 1, C('꿀린').look, { t: T, scale: sc, victory: big });
    if (lt > 40 && lt < 100) { ctx.fillStyle = '#ea80fc'; ctx.beginPath(); ctx.arc(W / 2 + 90, H - 200, 12 + (lt - 40) * 0.3, 0, Math.PI * 2); ctx.fill(); txt('🧪', W / 2 + 90, H - 230, 30, '#fff', null); }
    nrtCard('꿀린', '마법사 · 마법 구슬 · 개구리 저주 · 점멸 · 필살기 거대화 물약', lt, '#ea80fc', '#311b92');
  } else {
    const lt = T - 520, k = Math.min(1, lt / 20); ctx.fillStyle = '#07040a'; ctx.fillRect(0, 0, W, H);
    BIG2_CHARS.forEach((n, i) => drawPig(300 + i * 360, H - 60, i ? -1 : 1, C(n).look, { t: T + i * 20, scale: 1.3, victory: true }));
    txt('새 돼지 2마리 등장!', W / 2, 120, 50 * k, '#fff', '#4a148c', 10);
    if (lt > 30) txt('🏴‍☠️ 캡틴베이컨 무료 · 🧙 꿀린은 퀘스트', W / 2, 180, 22, '#ffd740', '#000', 6);
  }
  ctx.restore();
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 34); ctx.fillRect(0, H - 30, W, 30);
  if (T > 60) txt(TOUCH ? '탭하면 건너뛰기' : 'Enter 건너뛰기', W - 20, H - 15, 12, '#888', null, 0, 'right');
  addHot(0, 0, W, H, () => { if (big2t.t > 60) pressed.Enter = true; });
}
