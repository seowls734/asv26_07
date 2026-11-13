// ================= moves =================
// height: high(앉으면 피함) / mid(서서 막기) / low(앉아 막기)
const NORM = {
  lp:   { startup: 4,  active: 3, recovery: 8,  dmg: 5,  range: 150, height: 'high', kb: 3, stun: 13, pose: 'jab' },
  rp:   { startup: 7,  active: 4, recovery: 12, dmg: 9,  range: 165, height: 'mid',  kb: 5, stun: 17, pose: 'punch' },
  lk:   { startup: 7,  active: 4, recovery: 12, dmg: 7,  range: 165, height: 'low',  kb: 4, stun: 15, pose: 'lowkick' },
  rk:   { startup: 11, active: 5, recovery: 16, dmg: 13, range: 185, height: 'high', kb: 9, stun: 22, pose: 'highkick' },
  c_lp: { startup: 4,  active: 3, recovery: 9,  dmg: 4,  range: 145, height: 'low',  kb: 2, stun: 12, pose: 'jab', crouch: true },
  c_rp: { startup: 12, active: 5, recovery: 20, dmg: 12, range: 150, height: 'mid',  kb: 2, stun: 30, pose: 'uppercut', crouch: true, launch: -15 },
  c_lk: { startup: 9,  active: 5, recovery: 18, dmg: 9,  range: 180, height: 'low',  kb: 5, stun: 20, pose: 'sweep', crouch: true, knockdown: true },
  c_rk: { startup: 8,  active: 4, recovery: 14, dmg: 8,  range: 175, height: 'low',  kb: 6, stun: 16, pose: 'lowkick', crouch: true },
  j_p:  { startup: 5,  active: 8, recovery: 6,  dmg: 9,  range: 150, height: 'mid',  kb: 6, stun: 20, pose: 'punch', air: true },
  j_k:  { startup: 6,  active: 10, recovery: 8, dmg: 11, range: 170, height: 'mid',  kb: 8, stun: 22, pose: 'highkick', air: true }
};
const SKILLDEF = {
  dash:          { sfx: 'heavy', startup: 10, active: 18, recovery: 18, dmg: 16, range: 150, height: 'mid', kb: 14, stun: 34, launch: -9, dash: 15, pose: 'dash', hitstop: 10, shake: 12, txt: ['꾸에엑!!', '쿠아앙!!'] },
  armorShoulder: { sfx: 'heavy', startup: 12, active: 14, recovery: 22, dmg: 14, range: 150, height: 'mid', kb: 18, stun: 30, dash: 11, armor: true, guardBreak: true, pose: 'dash', hitstop: 12, shake: 14, txt: ['쿵!!', '가드 박살!'] },   // 막아도 뚫는 어깨 돌진 (띄우지 않고 멀리 밀어냄)
  launcher:      { startup: 9,  active: 8,  recovery: 18, dmg: 10, range: 175, height: 'low', kb: -11, stun: 48, dash: 4, pose: 'uppercut', hitstop: 8, shake: 6, txt: ['이리 와!', '엄니 걸기!'] },   // 엄니로 걸어 내 쪽으로 끌어당기고 오래 경직 (앉아도 맞음)
  // 밸런스: 전에는 너무 멀리(288px) 굴러 상대를 지나쳐 등 뒤에서 반격당함 → 이동거리↓ 사거리↑
  roll:          { startup: 4,  active: 18, recovery: 12, dmg: 12, range: 140, height: 'low', kb: 6, stun: 22, dash: 9, knockdown: true, invuln: true, invulnF: 14, pose: 'roll', txt: ['데굴!'] },
  iceProj:       { startup: 12, active: 1,  recovery: 20, proj: { kind: 'ice', speed: 9, dmg: 9, slow: 120, height: 'mid' }, pose: 'throw' },
  fireProj:      { startup: 14, active: 1,  recovery: 22, proj: { kind: 'fire', speed: 5.5, vy: -10, g: 0.42, boom: 95, dmg: 13, burn: 120, height: 'mid' }, pose: 'throw' },   // 포물선으로 던져 땅에 닿으면 펑 (넓은 범위)
  spinKick:      { startup: 8,  active: 24, recovery: 16, dmg: 6, hits: 3, hitEvery: 8, range: 165, height: 'mid', kb: 3, stun: 18, dash: 4, pose: 'spin', kind: 'kick', txt: ['휙!', '팍!', '빡!'] },
  counter:       { startup: 2,  active: 40, recovery: 16, counter: true, pose: 'counter' },
  teleport:      { startup: 16, active: 5,  recovery: 14, dmg: 12, range: 150, height: 'mid', kb: 8, stun: 24, teleport: true, invuln: true, invulnF: 13, pose: 'punch', txt: ['슉!'] },
  boneSwing:     { startup: 12, active: 8,  recovery: 22, dmg: 11, range: 220, height: 'low', kb: 5, stun: 28, knockdown: true, dash: 3, pose: 'punch', hitstop: 9, shake: 8, txt: ['갈비!!', '다리 걸기!'] },   // 긴 갈빗대로 다리를 후려 넘어뜨림 (앉아서 막아야 함)
  stewSplash:    { startup: 14, active: 1,  recovery: 22, proj: { kind: 'stew', speed: 4.5, dmg: 4, burn: 160, height: 'low', y: 18, multi: 14, maxHits: 3, life: 200, w: 70, h: 26 }, pose: 'throw' },   // 바닥을 천천히 흐르는 국물: 밟으면 여러 번 데임 (발사체끼리 부딪혀도 안 사라짐)
  spiritRush:    { startup: 10, active: 330, recovery: 22, dmg: 0.7, hits: 55, hitEvery: 6, range: 440, height: 'mid', kb: 0.6, stun: 12, hitstop: 0, shake: 2, pose: 'punch', kind: 'punch', spirit: true, unblockable: true, txt: ['팍!', '파박!', '두두두!'] },   // 뚱타플레티나 러시: 수호령이 앞에서 6연타
  coinToss:      { startup: 10, active: 1, recovery: 20, proj: { kind: 'coin', spread: 5, speed: 9, dmg: 3.2, height: 'mid', g: 0.32, life: 80, w: 26, h: 26 }, pose: 'throw' },   // 돈뿌리기: 동전 5개 부채꼴
  sande:         { startup: 4, active: 1, recovery: 8, pose: 'counter', buff: true },
  monowire:      { startup: 8, active: 18, recovery: 16, dmg: 4, hits: 3, hitEvery: 6, range: 290, height: 'mid', kb: 0, pull: true, stun: 18, pose: 'punch', kind: 'skill', wire: true, txt: ['찌릿!', '슥!', '촤악!'] },
  cyberDash:     { startup: 3, active: 14, recovery: 14, dmg: 14, range: 150, height: 'mid', kb: 16, stun: 30, launch: -8, dash: 22, invuln: true, invulnF: 10, pose: 'dash', hitstop: 10, shake: 10, txt: ['찰칵!', '쾅!'] },
  kageClone:     { startup: 6, active: 1, recovery: 10, pose: 'counter', buff: true },
  rasen:         { startup: 6, active: 42, recovery: 18, dmg: 20, range: 150, height: 'mid', kb: 20, launch: -11, stun: 42, dash: 15, pose: 'punch', hitstop: 14, shake: 14, rasen: true, sfx: 'rasenHit', txt: ['회오리 구슬!!'] },
  lateFist:      { startup: 5, active: 4, recovery: 12, dmg: 9, range: 160, height: 'mid', kb: 4, stun: 30, pose: 'punch', hitstop: 8, shake: 6, txt: ['퍽!'] },
  kneeDash:      { startup: 6, active: 14, recovery: 16, dmg: 13, range: 150, height: 'mid', kb: 13, stun: 28, dash: 15, rise: -7, pose: 'dash', hitstop: 10, shake: 10, txt: ['무릎!!'] },
  slashWave:     { startup: 7, active: 1, recovery: 14, proj: { kind: 'blood', speed: 20, dmg: 11, height: 'mid', w: 60, h: 30, life: 60 }, pose: 'punch' },
  bloodShot:     { startup: 8, active: 1, recovery: 14, proj: { kind: 'blood', spread: 3, flat: true, speed: 14, dmg: 8, height: 'mid', w: 40, h: 26, life: 110 }, pose: 'punch' },   // 피의 유도탄 3발 (상대를 쫓아감)
  fireArrow:     { startup: 14, active: 1, recovery: 20, proj: { kind: 'fire', speed: 14, dmg: 15, burn: 200, height: 'mid', w: 90, h: 30 }, pose: 'throw' },
  cleave:        { startup: 10, active: 6, recovery: 18, dmg: 16, range: 220, height: 'mid', kb: 15, launch: -9, stun: 32, pose: 'punch', hitstop: 14, shake: 14, cleave: true, txt: ['크게 베기!!'] },
  cannonShot:    { startup: 12, active: 1, recovery: 22, proj: { kind: 'cannon', speed: 10, dmg: 13, height: 'mid', kb: 12, w: 44, h: 44 }, pose: 'throw' },
  hookPull:      { startup: 10, active: 6, recovery: 18, dmg: 8, range: 300, height: 'mid', kb: 0, pull: true, stun: 40, pose: 'punch', skewer: true, txt: ['이리 와!', '갈고리!'] },
  parrotRaid:    { startup: 8, active: 1, recovery: 16, proj: { kind: 'parrot', speed: 7, dmg: 3.5, height: 'mid', multi: 14, maxHits: 3, life: 120, w: 50, h: 30 }, pose: 'throw' },
  magicOrb:      { startup: 12, active: 1, recovery: 18, proj: { kind: 'orb', speed: 6, dmg: 10, height: 'mid', life: 160, w: 34, h: 34 }, pose: 'throw' },
  frogCurse:     { startup: 10, active: 6, recovery: 18, dmg: 5, range: 220, height: 'mid', kb: 4, stun: 20, frog: true, pose: 'counter', txt: ['개굴!'] },
  blink:         { startup: 4, active: 1, recovery: 10, pose: 'counter', buff: true },
  porkRoll:      { startup: 4, active: 22, recovery: 12, dmg: 14, range: 150, height: 'low', kb: 8, stun: 24, dash: 10, knockdown: true, invuln: true, invulnF: 16, pose: 'roll', txt: ['데굴데굴!'] },
  tuskToss:      { startup: 10, active: 6, recovery: 20, dmg: 12, range: 160, height: 'low', kb: 3, stun: 40, launch: -20, armor: true, pose: 'uppercut', hitstop: 12, shake: 10, txt: ['퍼올리기!!'] },
  miniDash:      { startup: 3, active: 16, recovery: 12, dmg: 5.5, hits: 2, hitEvery: 7, range: 140, height: 'mid', kb: 5, stun: 16, dash: 17, pose: 'dash', txt: ['다다닥!', '쿵!'] },
  oinkWave:      { startup: 10, active: 6, recovery: 20, dmg: 6, range: 230, height: 'mid', kb: 18, stun: 46, pose: 'counter', hitstop: 10, shake: 10, wave: true, txt: ['꾸에에엑!!'] },
  basaltSlam:    { startup: 14, active: 6, recovery: 22, dmg: 16, range: 170, height: 'mid', kb: 6, stun: 30, knockdown: true, pose: 'uppercut', hitstop: 12, shake: 16, txt: ['쿠웅!!'] },
  blackRam:      { startup: 8, active: 16, recovery: 18, dmg: 13, range: 150, height: 'mid', kb: 16, stun: 28, dash: 13, armor: true, pose: 'dash', hitstop: 10, shake: 10, txt: ['흑돼지!!'] },
  dustCharge:    { startup: 6, active: 18, recovery: 16, dmg: 12, range: 150, height: 'low', kb: 10, stun: 24, dash: 16, knockdown: true, pose: 'dash', txt: ['흙먼지!'] },
  miniKick:      { startup: 6, active: 10, recovery: 14, dmg: 11, range: 160, height: 'mid', kb: 9, stun: 22, rise: -14, dash: 6, pose: 'highkick', kind: 'kick', txt: ['얍!'] },
  iceFloor:      { startup: 8, active: 1, recovery: 14, pose: 'throw', buff: true },
  frostPunch:    { startup: 7, active: 5, recovery: 14, dmg: 10, range: 165, height: 'mid', kb: 6, stun: 24, slow: 150, pose: 'punch', txt: ['꽁꽁!'] },
  lowSweep:      { startup: 7, active: 6, recovery: 16, dmg: 9, range: 190, height: 'low', kb: 6, stun: 22, knockdown: true, pose: 'sweep', kind: 'kick', txt: ['쓱!'] },
  flyKick:       { startup: 8, active: 14, recovery: 16, dmg: 14, range: 160, height: 'mid', kb: 14, stun: 26, dash: 14, rise: -8, pose: 'highkick', kind: 'kick', hitstop: 10, txt: ['날아차기!'] },
  sumoPush:      { startup: 10, active: 10, recovery: 18, dmg: 10, range: 170, height: 'mid', kb: 24, stun: 26, dash: 8, armor: true, pose: 'punch', hitstop: 10, shake: 10, txt: ['핫!!'] },
  bellyBump:     { startup: 9, active: 6, recovery: 18, dmg: 10, range: 150, height: 'mid', kb: 4, stun: 40, launch: -16, pose: 'counter', hitstop: 10, txt: ['뿌잉!'] },
  chiliSpray:    { startup: 8, active: 18, recovery: 16, dmg: 2.5, hits: 4, hitEvery: 5, range: 190, height: 'mid', kb: 2, stun: 12, pose: 'punch', kind: 'skill', flame: true, burn: 180, txt: ['매워!'] },
  chiliBomb:     { startup: 10, active: 1, recovery: 18, proj: { kind: 'fire', speed: 11, dmg: 10, burn: 120, height: 'mid' }, pose: 'throw' },
  shadowCut:     { startup: 5, active: 15, recovery: 14, dmg: 4.5, hits: 3, hitEvery: 5, range: 175, height: 'mid', kb: 3, stun: 16, dash: 6, pose: 'punch', txt: ['슥!', '삭!', '촥!'] },
  smokeBomb:     { startup: 2, active: 1, recovery: 6, pose: 'counter', buff: true },
  bodyBlow:      { startup: 6, active: 5, recovery: 16, dmg: 12, range: 150, height: 'mid', kb: 4, stun: 44, pose: 'punch', hitstop: 12, shake: 8, txt: ['헉!'] },
  jabCombo:      { startup: 4, active: 15, recovery: 12, dmg: 4.5, hits: 3, hitEvery: 5, range: 160, height: 'mid', kb: 3, stun: 16, dash: 3, pose: 'jab', kind: 'punch', txt: ['잽!', '잽!', '스트레이트!'] },
  coalToss:      { startup: 12, active: 1, recovery: 20, proj: { kind: 'fire', speed: 6.5, vy: -9, g: 0.4, boom: 80, dmg: 11, burn: 150, height: 'mid' }, pose: 'throw' },
  ribSpear:      { startup: 10, active: 5, recovery: 18, dmg: 12, range: 260, height: 'mid', kb: 9, stun: 24, pose: 'punch', skewer: true, txt: ['갈비뼈!'] },
  boneThrow:     { startup: 10, active: 1, recovery: 18, proj: { kind: 'slice', speed: 10, back: 0.35, dmg: 6, height: 'mid', multi: 16, maxHits: 2, life: 100, w: 46, h: 30 }, pose: 'throw' },
  stewHeal:      { startup: 6, active: 1, recovery: 14, pose: 'counter', buff: true },
  frostSlice:    { startup: 6, active: 20, recovery: 14, dmg: 3, hits: 4, hitEvery: 5, range: 175, height: 'low', kb: 2, stun: 14, slow: 100, pose: 'sweep', txt: ['샥!', '샥!'] },
  frostDash:     { startup: 5, active: 16, recovery: 14, dmg: 10, range: 150, height: 'low', kb: 8, stun: 22, dash: 15, slow: 140, pose: 'roll', txt: ['미끄덩!'] },
  cashSwing:     { startup: 10, active: 8, recovery: 18, dmg: 13, range: 200, height: 'mid', kb: 12, stun: 26, pose: 'punch', hitstop: 10, txt: ['돈벼락!'] },
  goldDash:      { startup: 4, active: 14, recovery: 14, dmg: 12, range: 150, height: 'mid', kb: 14, stun: 26, dash: 18, invuln: true, invulnF: 10, pose: 'dash', txt: ['골드!!'] },
  flambe:        { startup: 8, active: 20, recovery: 16, dmg: 3, hits: 4, hitEvery: 5, range: 200, height: 'mid', kb: 2, stun: 14, pose: 'punch', kind: 'skill', flame: true, burn: 150, txt: ['화르륵!', '앗뜨!'] },
  sauceTrap:     { startup: 6, active: 1, recovery: 12, pose: 'throw', buff: true },
  skewer:        { startup: 9, active: 5, recovery: 16, dmg: 11, range: 250, height: 'mid', kb: 8, stun: 22, pose: 'punch', skewer: true, txt: ['푹!', '꼬치!'] },
  lowGrav:       { startup: 8, active: 5, recovery: 14, dmg: 6, range: 200, height: 'mid', launch: -19, kb: 2, stun: 40, pose: 'counter', txt: ['둥실~', '무중력!'] },
  blackHole:     { startup: 10, active: 1, recovery: 16, pose: 'throw', buff: true },
  rocketHead:    { startup: 4, active: 14, recovery: 14, dmg: 13, range: 150, height: 'mid', kb: 16, stun: 28, launch: -7, dash: 20, invuln: true, invulnF: 10, pose: 'dash', hitstop: 10, shake: 10, txt: ['로켓!!', '쿵!'] },
  noteWave:      { startup: 10, active: 1, recovery: 16, proj: { kind: 'note', spread: 3, flat: true, speed: 8, dmg: 4, height: 'mid', g: 0, life: 90, w: 30, h: 30 }, pose: 'throw' },
  cheer:         { startup: 6, active: 1, recovery: 14, pose: 'counter', buff: true },
  wink:          { startup: 6, active: 6, recovery: 14, dmg: 2, range: 270, height: 'mid', kb: 0, stun: 75, pose: 'counter', txt: ['💕 두근!', '💘 반했다!'] },
  blackBolt:     { startup: 10, active: 4, recovery: 18, dmg: 10, range: 165, height: 'mid', kb: 12, stun: 30, launch: -8, pose: 'punch', hitstop: 12, shake: 10, txt: ['쾅!'] },
  kunai:         { startup: 8, active: 1, recovery: 14, proj: { kind: 'kunai', spread: 3, flat: true, speed: 13, dmg: 4, height: 'mid', g: 0, life: 70, w: 30, h: 14 }, pose: 'throw' },
  boomerang:     { startup: 12, active: 1, recovery: 20, proj: { kind: 'slice', speed: 11, back: 0.4, dmg: 7, height: 'mid', multi: 16, maxHits: 2, life: 95, w: 52, h: 36 }, pose: 'throw' },   // 냉삼 부메랑: 날아갔다 돌아오며 두 번 맞힘
  uppercut:      { startup: 3,  active: 10, recovery: 20, dmg: 18, range: 150, dash: 4, height: 'mid', kb: 4, stun: 40, launch: -17, rise: -13, invuln: true, invulnF: 8, pose: 'uppercut', kind: 'punch', txt: ['어퍼!!'] }
};
const THROWDEF = { startup: 6, active: 1, recovery: 16, proj: { kind: 'meat', speed: 11, dmg: 14, height: 'mid' }, pose: 'throw', skill: true };
// 잡기 사거리: 두 돼지는 서로 약 138px 안으로 못 붙음(separate) → 예전 125px로는 절대 안 닿아서 업어치기가 안 됐음
const GRABDEF = { startup: 6, active: 3, recovery: 24, range: 175, grab: true, pose: 'grab' };
const COMBO_CALL = { 5: '굿!', 8: '그레이트!', 12: '어메이징!!', 16: '돼지 신!!!' };
const DEFTXT = { punch: ['퍽!', '팍!', '뻑!'], kick: ['빡!', '쾅!', '뻐억!'], skill: ['꽝!', '쿠앙!'], proj: ['명중!', '팍!'], ult: ['콰광!!'], grab: ['쿵!'] };

// ================= particles =================
let parts = [], texts = [];
function burst(x, y, n, cols, spd = 10) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = rand(spd * 0.3, spd);
    parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, life: rand(15, 30), max: 30, c: cols[i % cols.length], s: rand(2, 5), g: 0.35, type: 'dot', glow: true });
  }
}
function smoke(x, y, c = '220,220,220') { parts.push({ x, y, vx: rand(-0.4, 0.4), vy: rand(-1.8, -0.8), life: rand(50, 90), max: 90, c, s: rand(8, 16), g: -0.005, type: 'smoke' }); }
function smokePuff(x, y) { for (let i = 0; i < 10; i++) smoke(x + rand(-30, 30), y + rand(-40, 40), '120,100,150'); }
function flame(x, y) { parts.push({ x, y, vx: rand(-0.6, 0.6), vy: rand(-2.5, -1), life: rand(15, 25), max: 25, c: pick(['#ff9800', '#ffeb3b', '#ff5722']), s: rand(3, 6), g: -0.05, type: 'dot', glow: true }); }
function slash(x, y) { parts.push({ x, y, a: rand(0, Math.PI), len: rand(80, 160), life: 12, max: 12, type: 'slash', vx: 0, vy: 0, g: 0 }); }
function popText(x, y, s, c, size = 36) { texts.push({ x, y, s, c, size, life: 50, max: 50 }); }
function updParts() {
  for (const p of parts) { p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life--; if (p.type === 'smoke') { p.s += 0.35; p.vx *= 0.99; } if (p.type === 'ring') p.r += 4.5; }
  parts = parts.filter(p => p.life > 0);
  if (parts.length > 600) parts.splice(0, parts.length - 600);
  for (const t of texts) { t.life--; t.y -= 0.6; }
  texts = texts.filter(t => t.life > 0);
}
function drawParts() {
  for (const p of parts) {
    const a = clamp(p.life / p.max);
    if (p.type === 'smoke') { ctx.fillStyle = `rgba(${p.c},${a * 0.35})`; ell(p.x, p.y, p.s, p.s); ctx.fill(); }
    else if (p.type === 'slash') {
      ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 4 * a + 1;
      const dx = Math.cos(p.a) * p.len / 2, dy = Math.sin(p.a) * p.len / 2;
      line(p.x - dx, p.y - dy, p.x + dx, p.y + dy);
    } else if (p.type === 'ring') { ctx.strokeStyle = `rgba(${p.c},${a})`; ctx.lineWidth = 6 * a + 1; ell(p.x, p.y, p.r, p.r * 0.8); ctx.stroke(); }
    else {
      ctx.globalAlpha = a; if (p.glow) ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = p.c; ell(p.x, p.y, p.s, p.s); ctx.fill();
      if (p.glow) { ctx.globalAlpha = a * 0.3; ell(p.x, p.y, p.s * 2.4, p.s * 2.4); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
      ctx.globalAlpha = 1;
    }

  }
  for (const t of texts) {
    const k = 1 - t.life / t.max;
    const sc = k < 0.15 ? 0.5 + k / 0.15 * 0.7 : 1.2 - Math.min(0.2, k - 0.15);
    ctx.save(); ctx.globalAlpha = clamp(t.life / 15); ctx.translate(t.x, t.y); ctx.scale(sc, sc); ctx.rotate(-0.08);
    txt(t.s, 0, 0, t.size, t.c, '#000', 7); ctx.restore();
  }
}

// ================= pig drawing =================
// 뒤쪽 팔다리용: 같은 색을 조금 어둡게 (canvas filter는 느려서 색을 직접 계산, 한 번 만들면 재사용)
const backLookCache = new WeakMap();
// 별 모양 경로 (x, y 중심, r 바깥 반지름, ri 안쪽 반지름)
function star(x, y, r, ri) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? ri : r; ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } ctx.closePath(); }
function shadeHex(c, k) {
  if (typeof c !== 'string' || !/^#[0-9a-f]{6}$/i.test(c)) return c;
  const v = [1, 3, 5].map(i => Math.min(255, Math.round(parseInt(c.slice(i, i + 2), 16) * k)));   // k>1이면 밝게
  return '#' + v.map(x => x.toString(16).padStart(2, '0')).join('');
}
function shadeLook(C) {
  let s = backLookCache.get(C);
  if (!s) { s = { ...C, body: shadeHex(C.body, 0.82), dark: shadeHex(C.dark, 0.82), hoof: shadeHex(C.hoof, 0.82) }; backLookCache.set(C, s); }
  return s;
}
let LWM = 1;   // 돼지 외곽선 굵기 배수
function limb(x1, y1, x2, y2, w, C, hc, hr) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = C.dark; ctx.lineWidth = w + 4 * LWM; line(x1, y1, x2, y2);
  ctx.strokeStyle = C.body; ctx.lineWidth = w; line(x1, y1, x2, y2);
  ctx.fillStyle = hc || C.hoof; ell(x2, y2, hr || w / 2 + 1, hr || w / 2 + 1); ctx.fill();
  if (hc) { ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2; ctx.stroke(); }
}
const KICKS = { lowkick: [0.25, 36], highkick: [-0.7, 38], sweep: [0.02, 48] };

// 색 효과(맞을 때 번쩍·잠긴 돼지 실루엣·얼음·화상 등)가 있는 돼지: 큰 화면에 filter를 걸면 아주 느려서(한 번에 150ms 넘게)
// 작은 캔버스에 효과 없이 그린 뒤, 그 그림만 filter를 걸어 붙임
const pigFxC = document.createElement('canvas'), pigFxX = pigFxC.getContext('2d');
// 🟦 픽셀 아트로 그리기 (볼트돈만): 작은 캔버스에 낮은 해상도로 그린 뒤 부드럽게 하지 않고 크게 늘림 → 도트 그림처럼
// x0,y0,w,h: 지금 좌표계에서 그릴 범위 · fn: 그 안에 그리는 함수
const pxC = document.createElement('canvas'), pxX = pxC.getContext('2d'); const pxO = document.createElement('canvas'), pxOX = pxO.getContext('2d'); let pxOn = false;
function pixelate(x0, y0, w, h, fn, dot = 2.4) {
  if (pxOn) return fn();
  const m = ctx.getTransform(), pts = [[x0, y0], [x0 + w, y0], [x0, y0 + h], [x0 + w, y0 + h]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
  const bx = Math.floor(Math.min(...pts.map(p => p[0]))), by = Math.floor(Math.min(...pts.map(p => p[1]))), bw = Math.ceil(Math.max(...pts.map(p => p[0]))) - bx, bh = Math.ceil(Math.max(...pts.map(p => p[1]))) - by;
  const P = Math.max(2, dot * Math.hypot(m.a, m.b));   // 도트 한 칸 = 화면 픽셀 몇 개
  const cw = Math.max(1, Math.ceil(bw / P)), ch = Math.max(1, Math.ceil(bh / P));
  if (cw > 1200 || ch > 1200) return fn();
  if (pxC.width < cw || pxC.height < ch) { pxC.width = Math.max(pxC.width, cw); pxC.height = Math.max(pxC.height, ch); }
  pxX.setTransform(1, 0, 0, 1, 0, 0); pxX.clearRect(0, 0, pxC.width, pxC.height); pxX.globalAlpha = 1;
  pxX.setTransform(m.a / P, m.b / P, m.c / P, m.d / P, (m.e - bx) / P, (m.f - by) / P);
  const main = ctx; ctx = pxX; pxOn = true;
  try { fn(); } finally { ctx = main; pxOn = false; }
  // 도트 그림 테두리: 모양을 상하좌우 1칸씩 밀어 검게 칠한 걸 먼저 깔기
  if (pxO.width < cw + 2 || pxO.height < ch + 2) { pxO.width = Math.max(pxO.width, cw + 2); pxO.height = Math.max(pxO.height, ch + 2); }
  pxOX.setTransform(1, 0, 0, 1, 0, 0); pxOX.globalCompositeOperation = 'source-over'; pxOX.clearRect(0, 0, pxO.width, pxO.height);
  for (const [dx, dy] of [[0, 1], [2, 1], [1, 0], [1, 2]]) pxOX.drawImage(pxC, 0, 0, cw, ch, dx, dy, cw, ch);
  pxOX.globalCompositeOperation = 'source-in'; pxOX.fillStyle = '#140a14'; pxOX.fillRect(0, 0, cw + 2, ch + 2);
  pxOX.globalCompositeOperation = 'source-over'; pxOX.drawImage(pxC, 0, 0, cw, ch, 1, 1, cw, ch);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(pxO, 0, 0, cw + 2, ch + 2, bx - P, by - P, (cw + 2) * P, (ch + 2) * P); ctx.restore();
}
const FILTER_OK = typeof pigFxX.filter === 'string' && !/nofilter/.test(location.search);   // 캔버스 filter 지원 (옛날 아이폰 Safari는 없음)
const PFX = { w: 600, h: 540, ox: 300, oy: 440 };   // 돼지 하나가 들어가는 상자 (돼지 기준 좌표)
function drawPigFx(x, y, face, C, p, filt) {
  const s = p.scale || 1, m = ctx.getTransform(), R = clamp(s * Math.hypot(m.a, m.b), 0.3, 2);   // 화면 픽셀 / 돼지 좌표 1칸
  const cw = Math.ceil(PFX.w * R), ch = Math.ceil(PFX.h * R);
  if (pigFxC.width < cw || pigFxC.height < ch) { pigFxC.width = Math.max(pigFxC.width, cw); pigFxC.height = Math.max(pigFxC.height, ch); }
  const main = ctx; ctx = pigFxX;
  try {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, cw, ch);
    ctx.setTransform(R / s, 0, 0, R / s, 0, 0);
    drawPig(PFX.ox * s, PFX.oy * s, face, C, { ...p, filter: '', flash: false, alpha: undefined });
  } finally { ctx = main; }
  if (!FILTER_OK) {   // 옛날 아이폰 Safari: filter가 없어서 색을 덧칠해 비슷하게
    const tint = /brightness\(0\)/.test(filt) ? ['#000', 1] : /brightness\(2\.5\)/.test(filt) ? ['#fff', 0.55] : /hue-rotate\(170/.test(filt) ? ['#4fc3f7', 0.35]
      : /grayscale/.test(filt) ? ['#9e9e9e', 0.5] : /saturate\(1\.[46]\)/.test(filt) ? ['#ff7043', 0.2] : /brightness\(0\.[89]/.test(filt) ? ['#000', 0.2] : null;
    if (tint) { pigFxX.setTransform(1, 0, 0, 1, 0, 0); pigFxX.globalCompositeOperation = 'source-atop'; pigFxX.globalAlpha = tint[1]; pigFxX.fillStyle = tint[0]; pigFxX.fillRect(0, 0, cw, ch); pigFxX.globalCompositeOperation = 'source-over'; pigFxX.globalAlpha = 1; }
  }
  ctx.save(); if (p.alpha !== undefined) ctx.globalAlpha *= p.alpha;
  if (FILTER_OK) ctx.filter = filt;
  ctx.drawImage(pigFxC, 0, 0, cw, ch, x - PFX.ox * s, y - PFX.oy * s, PFX.w * s, PFX.h * s);
  ctx.restore();
}
