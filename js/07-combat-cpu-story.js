// ================= combat =================
function dealHit(a, d, h) {
  if (mode === 6 && d === p2 && d.hp - (h.dmg || 0) * 1.5 <= 1) d.hp = d.maxHp;   // 연습 모드: 상대는 안 쓰러지고 체력이 다시 참
  if (h.kind === 'ult' || h.ult) h = { ...h, unblockable: true };   // 필살기는 모두 방어 무시 (막기·패링으로 못 막음)
  if (d.parryT > 0 && h.kind !== 'ult' && !h.ult && !h.proj && !h.force && a !== d) {   // 🥋 흘려 받기: 공격을 흘리고 되던짐 (필살기·발사체는 못 흘림)
    d.parryT = 0; popText(d.x, d.y - 190 * d.sc / 1.15, '흘려 넘기기!', '#90caf9', 30); SFX.block();
    dealHit(d, a, { dmg: 9, launch: -9, kb: 0, stun: 34, src: d.x, kind: 'skill', throwBehind: true, height: 'mid', hitstop: 14, shake: 12, txt: ['합기!'] }); return 'block';
  }
  if (TSTOP && TSTOP.owner === a && d.state === 'locked') { h = { ...h, force: true, noReact: true, launch: 0, kb: 0 }; TSTOP.dmg += h.dmg || 0; }   // 멈춘 상대: 반응 없이 피해만 쌓임
  if (d.ch.spirit && !h.force && !h.ult && h.kind !== 'ult' && ['idle', 'walk', 'crouch', 'block', 'cblock', 'blockstun', 'jump'].includes(d.state) && srnd() < 0.1) {   // 10%: 뚱타플레티나가 막아 줌
    d.spiritGuardAt = gT; SFX.gong(); hitstop = Math.max(hitstop, 8); burst(d.x + d.facing * 50, d.y - 100, 14, ['#b388ff', '#e1bee7', '#fff'], 7);
    popText(d.x, d.y - 190 * d.sc / 1.15, `${d.ch.standName || '스탠드'} 방어!`, '#d1c4e9', 28); return 'block';
  }
  if (d.state === 'ko') return 'miss';
  if (d.scaleSh && !(TSTOP && TSTOP.owner === a)) {   // 드래곤돈 비늘 방패: 맞기 전까지 유지 · 필살기 빼고 한 번 다 막음 (필살기는 뚫고 방패도 깨짐)
    d.scaleSh = false; burst(d.x, d.y - 90 * d.sc / 1.15, 14, ['#69f0ae', '#b9f6ca', '#fff'], 7);
    if (!(h.kind === 'ult' || h.ult)) { SFX.block(); hitstop = Math.max(hitstop, 6); popText(d.x, d.y - 190 * d.sc / 1.15, '비늘 방패!', '#69f0ae', 28); return 'block'; }
    popText(d.x, d.y - 190 * d.sc / 1.15, '방패가 깨졌다!', '#ff8a80', 24);
  }
  if (!h.force) {
    if (['down', 'transforming', 'grabbed', 'grabbing', 'locked'].includes(d.state) || d.invT > 0) return 'miss';
    if (d.state === 'ult' && d.ultInv) return 'miss';
    if (d.state === 'attack' && d.atk.invuln && d.af < d.atk.invulnF) return 'miss';
    if (h.height === 'high' && d.crouching()) return 'miss';
    if (h.height === 'low' && d.y < GROUND - 30) return 'miss';
    if (d.y < GROUND - 5 && d.juggle >= 5) return 'miss';
    if (d.tfIs('shadow') && !h.clone && srnd() < 0.3) { popText(d.x, d.y - 160, '회피!', '#b39ddb', 26); d.invT = 12; return 'miss'; }
    // 뱃살 튕기기 반격
    if (d.state === 'attack' && d.atk.counter && d.af >= d.atk.startup && d.af < d.atk.startup + d.atk.active) {
      d.atk = null; d.state = 'idle';
      popText(d.x, d.y - 180 * d.sc / 1.15, '뱃살 반사!!', '#ffeb3b', 32); SFX.slam();
      if (!h.proj) dealHit(d, a, { dmg: 18, height: 'mid', kb: 14, launch: -12, stun: 30, force: true, src: d.x, kind: 'skill', hitstop: 14, shake: 14, txt: ['뿌잉!!', '튕겨!!'] });
      return 'counter';
    }
    // 숙성 패링
    const canDef = d.y >= GROUND && ['idle', 'walk', 'block', 'cblock', 'crouch', 'blockstun'].includes(d.state);
    if (d.parryT > 0 && !h.unblockable && canDef) {
      d.parryT = 0; d.stats.parries++; d.meter = Math.min(100, d.meter + 5); d.state = 'idle';
      if (!h.proj) { a.state = 'parried'; a.stun = 50; a.atk = null; a.vx = 0; a.ultInv = false; a.ultArmor = false; }
      SFX.gong(); hitstop = Math.max(hitstop, 14); shake = 6;
      burst((h.src + d.x) / 2, d.y - 100, 18, ['#e1f5fe', '#ffffff', '#81d4fa'], 8);
      popText(d.x, d.y - 180 * d.sc / 1.15, '숙성 패링!', '#e1f5fe', 34);
      return 'parry';
    }
    const toward = d.facing === Math.sign(h.src - d.x) || h.src === d.x;
    const sb = d.state === 'block' || (d.state === 'blockstun' && !d.blockLow);
    const cb = d.state === 'cblock' || (d.state === 'blockstun' && d.blockLow);
    if (!h.unblockable && toward && ((h.height !== 'low' && sb) || (h.height === 'low' && cb))) {
      if (h.guardBreak) { popText(d.x, d.y - 170, '가드 브레이크!', '#ff5252', 30); h = { ...h, dmg: h.dmg * 0.75 }; }
      else {
        const chip = h.dmg * (h.chip ?? 0.1) * a.dmgMul(h.kind);
        d.hp = Math.max(1, d.hp - chip); d.blockLow = cb; d.state = 'blockstun'; d.stun = Math.round((h.stun || 16) * 0.6);
        d.vx = (Math.sign(d.x - h.src) || -d.facing) * (h.kb || 4) * 0.6;
        // 막기는 필살 게이지 없음
        burst(h.hx ?? (h.src + d.x) / 2, d.y - 95 * d.sc / 1.15, 8, ['#80d8ff', '#ffffff'], 6); SFX.block(); hitstop = Math.max(hitstop, 3);
        return 'block';
      }
    }
  }
  let dmg = h.dmg * a.dmgMul(h.kind) * d.defMul();
  const counterHit = !h.force && d.state === 'attack' && d.af < d.atk.startup;
  if (counterHit) dmg *= 1.25;
  const juggling = ['hit', 'locked', 'grabbed'].includes(d.state) || d.y < GROUND - 5;
  a.combo = juggling ? a.combo + 1 : 1; a.comboT = 80; a.stats.maxCombo = Math.max(a.stats.maxCombo, a.combo);
  if (COMBO_CALL[a.combo] && !h.force) { popText(W / 2, 175, `${a.combo} COMBO! ${COMBO_CALL[a.combo]}`, '#ffd740', 38); speak(COMBO_CALL[a.combo]); }
  if (!firstHit && !h.force && scene === 'fight') { firstHit = true; popText(a.x, a.y - 215, '퍼스트 어택!', '#80d8ff', 24); }
  if (a.combo >= 4 && !h.force) dmg *= Math.max(0.5, 1 - 0.08 * (a.combo - 3));
  dmg = Math.round(dmg * 10) / 10;
  d.hp = Math.max(0, d.hp - dmg); d.flash = 6; a.stats.hits++;
  // (싸우는 중 부위 자르기·부위 무기 줍기는 뺐음)
  // 필살 게이지는 때린 쪽만 참. 한 방이 센 공격(8 넘는 피해)은 넘는 만큼 절반만 쳐줌 → 딜 센 캐릭은 궁이 천천히 참.
  // 캐릭터마다 충전 속도(ultRate)가 다름: 빠르고 약한 캐릭은 빨리, 묵직한 캐릭은 천천히
  a.meter = Math.min(100, a.meter + (dmg <= 8 ? dmg : 8 + (dmg - 8) * 0.5) * 1.6 * (a.ch.ultRate ?? 1) * (a.tfIs('gilded') ? 1.5 : 1));   // 황금 각성: 1.5배
  d.stamina = Math.max(0, d.stamina - dmg * 0.6);
  if (h.frog) { d.frogT = Math.max(d.frogT || 0, 240); popText(d.x, d.y - 170, '개구리가 됐다!', '#9ccc65', 24); smokePuff(d.x, d.y - 60); }   // 개구리 저주
  if (h.burn || a.tfIs('fire') || a.tfIs('spicy')) d.burnT = Math.max(d.burnT, h.burn || 120);
  if (h.slow || a.tfIs('freeze')) d.slowT = Math.max(d.slowT, h.slow || 120);
  if (a.tfIs('clone') && !h.clone && !h.force && ['punch', 'kick', 'skill'].includes(h.kind)) a.cloneQ.push({ t: 10, dmg: h.dmg * 0.5 });
  if (cursed(a) && !h.clone && !h.force && ['punch', 'kick'].includes(h.kind || (h.isPunch ? 'punch' : h.isKick ? 'kick' : ''))) a.cloneQ.push({ t: 6, dmg: h.dmg * 0.6, arm: true });   // 저주왕: 남은 팔로 한 번 더
  hitstop = Math.max(hitstop, h.hitstop ?? Math.round(3 + dmg * 0.4)); shake = Math.max(shake, h.shake ?? dmg * 0.6);
  const hx = h.hx ?? (h.src + d.x) / 2, hy = d.y - 95 * d.sc / 1.15;
  burst(hx, hy, Math.min(30, 8 + dmg), skinOf(a) ? skinOf(a).fx : ['#fff176', '#ffffff', '#ff8a65'], Math.min(14, 6 + dmg * 0.4)); skinHitFx(a, hx, hy, dmg); wpnHitFx(a, hx, hy, dmg);   // 🎨 스킨마다 다른 타격 효과
  if (h.boltCrit) { bfT = 14; SFX.boom(); if (a === p1 && mode === 1 && a.ch.name === '이타돼리') nqAdd('itbolt', 1); if (a === p1 && mode === 1) awkAdd(a.ch.name, 'bolt'); popText(hx, hy - 90, '검은 번개!!', '#ff1744', 32); }
  if (h.cleave) { for (let i = 0; i < 5; i++) slash(hx + rand(-30, 30), hy + rand(-50, 50)); }   // 검은 번개: 화면이 검붉게 번쩍
  if (h.boltCrit) { for (let i = 0; i < 6; i++) slash(hx + rand(-40, 40), hy + rand(-40, 40)); burst(hx, hy, 30, ['#000', '#ff1744', '#b71c1c'], 14); shake = Math.max(shake, 20); }   // 검은 번개
  parts.push({ type: 'ring', x: hx, y: hy, r: 8, life: 14, max: 14, c: dmg > 10 ? '255,213,79' : '255,255,255', vx: 0, vy: 0, g: 0 });
  hype = Math.min(1.5, hype + dmg * 0.04);
  if (dmg >= 2) popText(d.x + rand(-24, 24), d.y - 170 * d.sc / 1.15, `-${dmg}`, '#ff8a80', 17);
  // (때릴 때 뜨던 '퍽! 빡! 쾅!' 같은 글자는 뺐음 — 화면이 지저분해서)
  if (counterHit) popText(hx, hy - 80, '카운터!', '#ff1744', 24);
  (SFX[h.sfx] || (h.kind === 'kick' || h.isKick ? SFX.kick : SFX.punch))(dmg * (h.kind === 'ult' || h.skill ? 1.3 : 1));   // 셀수록 묵직한 소리
  if (counterHit) SFX.counterHit();
  // (맞을 때마다 나던 꿀꿀 소리는 '삑삑'거려서 뺐음)
  if (d.hp <= 0) {
    d.state = 'ko'; d.koT = 0; d.vy = -11; d.vx = (Math.sign(d.x - h.src) || -d.facing) * 9; d.atk = null;
    hitstop = 22; shake = 18; SFX.ko(); setTimeout(SFX.squeal, 250);
    if (h.kind === 'ult') a.stats.ultFinish = true; if (h.kind === 'ult' && a === p1 && mode === 1) { nqAdd('ultko', 1); if (a.ch.name === '이타돼리') nqAdd('itultko', 1); awkAdd(a.ch.name, a.ch.ult.type === 'dismantle' || a.ultAlt === 'dismantle' ? 'dismko' : 'ultko'); }   // 퀘스트: 필살기로 K.O.
    if (scene === 'fight') endRound(a, 'K.O.!!');
    return 'hit';
  }
  // 스킬 쓰는 중엔 맞아도 끊기지 않음 (모든 돼지). 넘어뜨리거나 띄우는 공격만 끊김
  const skillArmor = d.state === 'attack' && d.atk && d.atk.skill && !h.knockdown && h.kind !== 'ult' && !h.ult;   // 띄우는 공격·반사에도 안 끊김 (넘어뜨리기·필살기만 끊김)
  if (h.pull && !h.noReact && ((!h.force && !h.launch && d.armored(dmg)) || skillArmor)) { d.pullT = 12; d.pullX = clamp(a.x + (Math.sign(d.x - a.x) || a.facing) * 100 * a.sc / 1.15, 40, W - 40); }   // 버티는 중이어도 갈고리·사슬·채찍·올가미에는 끌려옴
  if ((!h.force && !h.launch && d.armored(dmg)) || skillArmor) { if (gT - (d.armorTxtT || -99) > 20) { d.armorTxtT = gT; popText(d.x, d.y - 150, skillArmor ? '버팀!' : '슈퍼아머', '#ddd', 18); } return 'armor'; }
  if (h.noReact) return 'hit';
  const dir = Math.sign(d.x - h.src) || -d.facing;
  if (d.state === 'attack' || d.state === 'ult') { d.atk = null; d.ultInv = false; d.ultArmor = false; }
  d.state = 'hit'; d.stun = h.stun || 16; d.vx = dir * (h.kb ?? 4);
  if (h.throwBehind) { d.x = clamp(a.x - (Math.sign(d.x - a.x) || a.facing) * 95 * a.sc / 1.15, 40, W - 40); d.facing = Math.sign(a.x - d.x) || d.facing; d.launched = true; d.vy = h.launch || -8; d.vx = 0; burst(d.x, GROUND - 6, 8, ['#d7ccc8', '#a1887f'], 5); }   // 🥋 등 뒤로 넘겨 던짐
  if (h.pull) { d.pullT = 12; d.pullX = clamp(a.x + (Math.sign(d.x - a.x) || a.facing) * 100 * a.sc / 1.15, 40, W - 40); d.vx = 0; }   // 갈고리·사슬·채찍: 내 앞까지 끌고 옴
  if (h.launch || h.knockdown || d.y < GROUND - 5) { d.launched = true; d.vy = h.launch || (h.knockdown ? -6 : -7); d.juggle++; }
  return 'hit';
}

function checkHit(a, d) {
  if (a.state !== 'attack' || a.atkHit) return;
  const at = a.atk;
  if (at.counter || at.proj || at.buff) return;   // buff: 몸에 거는 스킬(오버클럭 · 분신술)은 직접 때리지 않음
  if (a.af < at.startup || a.af >= at.startup + at.active) return;
  // 몸집이 사거리에 주는 영향을 줄임 (전: 몸집 비례 → 작은 돼지는 헛치고 큰 돼지는 사거리 우위)
  const s = 1 + (a.sc / 1.15 - 1) * 0.35;
  const reach = (at.range || 150) * s + (d.sc - 1.15) * 40 + (a.weapon && !at.skill && !at.grab ? 20 : 0);
  const ox = at.spiritPunch && a.spX != null ? a.spX : a.x;   // 수호령 주먹은 수호령 자리에서 잼
  const dx = (d.x - ox) * a.facing;
  let standHit = false;
  if (dx < -20 || dx > reach || Math.abs(d.y - a.y) > 110) {   // 본체엔 안 닿아도, 꺼내 둔 스탠드에 닿으면 본체가 피해를 입음
    if (at.grab || !d.ch.spirit || !d.standOn || d.spX == null) return;
    const ds = (d.spX - ox) * a.facing;
    if (ds < -20 || ds > reach || Math.abs(d.y - a.y) > 130) return;
    standHit = true;
  }
  if (at.grab) {
    a.atkHit = true;
    const bad = d.y < GROUND - 5 || d.crouching() || ['ko', 'down', 'grabbed', 'grabbing', 'locked', 'ult', 'transforming'].includes(d.state) || d.invT > 0;
    if (bad) { popText(a.x + a.facing * 60, a.y - 150, '헛잡기!', '#aaa', 20); return; }
    startGrab(a, d); return;
  }
  const kind = at.kind || (at.isPunch ? 'punch' : at.isKick ? 'kick' : 'skill');
  const r = dealHit(a, d, { ...at, src: a.x, kind });
  if (standHit && r !== 'miss' && r !== 'block') popText(d.spX, d.y - 190 * d.sc / 1.15, '스탠드 피격! 본체도 아파!', '#ff8a80', 20);
  if (r !== 'miss') { a.atkHit = true; a.lastHitF = a.af; a.hitsDone++; if (at.dash && !at.hits) a.af = at.startup + at.active; }
}

function separate(a, b) {
  const skip = ['ko', 'down', 'grabbed', 'grabbing', 'locked', 'ult'];
  if (skip.includes(a.state) || skip.includes(b.state)) return;
  const dx = b.x - a.x, MIN = 60 * (a.sc + b.sc);
  if (Math.abs(dx) < MIN && Math.abs(a.y - b.y) < 100) {
    const push = (MIN - Math.abs(dx)) / 2, s = dx >= 0 ? 1 : -1;
    a.x = clamp(a.x - s * push, 50, W - 50); b.x = clamp(b.x + s * push, 50, W - 50);
  }
}

// ---- 다지기 잡기 ----
function startGrab(a, d) {
  a.state = 'grabbing'; a.grabT = 0; a.mashN = 0; a.vx = 0;
  d.state = 'grabbed'; d.vx = 0; d.vy = 0; d.atk = null;
  SFX.whiff(); popText(a.x, a.y - 190 * a.sc / 1.15, '잡았다!', '#fff', 28);
}
function grabUpdate(a, d, inp) {
  const T = ++a.grabT, s = a.sc / 1.15;
  if (d.state !== 'grabbed') { a.state = 'idle'; return; }
  if (T <= 20) {
    const k = T / 20;
    d.x = clamp(a.x + a.facing * lerp(-30, 110, k) * s, 50, W - 50); d.y = GROUND - 4 * k * (1 - k) * 130;   // sin 대신 다항식: 브라우저마다 결과가 같도록
    if (T === 20) {
      d.y = GROUND; shake = 12; SFX.slam(); burst(d.x, GROUND, 14, ['#a07850', '#c8a070'], 6);
      dealHit(a, d, { dmg: 6, force: true, noReact: true, noPart: true, src: a.x, kind: 'grab', hitstop: 6, txt: ['메치기!!'] });
    }
  } else if (T <= 140) {
    d.x = clamp(a.x + a.facing * 110 * s, 50, W - 50); d.y = GROUND;
    if (inp.mash && a.mashN < 30) {
      a.mashN++; d.stamina = Math.max(0, d.stamina - 4);
      dealHit(a, d, { dmg: 1.2, force: true, noReact: true, noPart: true, src: a.x, kind: 'grab', hitstop: 1, shake: 3, sfx: 'tender', txt: ['탕!', '쾅!', '팡!', '다다닥!'] });
    }
  } else {
    d.state = 'hit'; d.launched = true; d.vy = -5; d.vx = a.facing * 6; d.stun = 20; a.state = 'idle';
    popText(a.x, a.y - 190, `다지기 ${a.mashN}회!`, '#ffd54f', 26);
  }
}

// ---- 궁극기 ----
const ultCount = {};
function startUlt(f) {
  f.ultAlt = null;   // 저주왕 상태에서 쓰면 다른 필살기
  f.meter = 0; f.state = 'ult'; f.uT = 0; f.ultHit = false; f.ultInv = true; f.ultArmor = false; f.landed = false; f.vx = 0; f.atk = null;
  superFreeze = 50; superOwner = f; superKind = 'ult'; SFX.ultStart(); if (f.ch.ult.type === 'absoluteZero') smp('blizzard', { v: 0.8 });   // 절대영도: 눈보라가 휘몰아침 speak(f.ch.ult.name + '!', 1.2);
  ultCount[f.ch.ult.type] = (ultCount[f.ch.ult.type] || 0) + 1;
  if (!['gumiho', 'dismantle', 'curseKing', 'timeStop', 'boltRush'].includes(f.ch.ult.type)) CUTLESS_ULT = true;   // 컷신 없는 필살기 (아래에서 멈춤 시간을 0으로)
  if (f.ch.ult.type === 'timeStop') superFreeze = TS_CUT;   // 돼타로: 시간 정지 컷신 (약 2초)
  if (f.ch.ult.type === 'cyberSkel' || f.ch.ult.type === 'gumiho') superFreeze = NEW_ULT_CUT;
  if (f.ch.ult.type === 'curseKing') superFreeze = IT_CUT;
  if (f.ch.ult.type === 'dismantle' || f.ch.ult.type === 'boltRush') superFreeze = IT_CUT;   // 이타돼리: 저주왕 컷신   // 새 돼지: 필살기 컷신
  if (BIG_THEME[f.ch.ult.type]) superFreeze = BIG_CUT;   // 대규모 업데이트 돼지: 필살기 컷신
  if (CUTLESS_ULT) { CUTLESS_ULT = false; superFreeze = 0; popText(f.x, f.y - 230 * f.sc / 1.15, f.ch.ult.name + '!!', '#ffd740', 32); shake = Math.max(shake, 8); }   // 컷신 없이 이름만 크게
}
function ultEnd(f, o) {
  f.state = 'idle'; f.ultInv = false; f.ultArmor = false; f.vx = 0;
  if (o.state === 'locked') { o.state = 'hit'; o.stun = 20; o.launched = true; o.vy = -6; }
}
function ultUpdate(f, o) {
  const type = f.ch.ult.type, T = ++f.uT, s = f.sc / 1.15;
  const inFront = r => { const dx = (o.x - f.x) * f.facing; return dx > -20 && dx < r * s; };
  const U = h => dealHit(f, o, Object.assign({ src: f.x, kind: 'ult', height: 'mid', noPart: true }, h));
  const lock = () => { if (o.state !== 'ko') { o.state = 'locked'; o.vx = 0; o.vy = 0; } };
  switch (type) {
    case 'cyberSkel': case 'gumiho': newUltUpdate(f, o, T); break;
    case 'curseKing': if (f.ultAlt === 'dismantle') dismantleUlt(f, o, T); else itUlt(f, o, T); break;
    case 'dismantle': dismantleUlt(f, o, T); break;
    case 'boltRush': boltRushUlt(f, o, T); break;
    case 'bbqParty': case 'meteor': case 'encore': case 'coalRain': case 'stewFlood': bigUlt(f, o, T); break;
    case 'broadside': case 'giantPotion': big2Ult(f, o, T); break;
    case 'nxExcalibur': case 'nxSleigh': case 'nxHighNoon': case 'nxAmp': case 'nxTsunami': case 'nxHomeRun': case 'nxHack': case 'nxVolcano': case 'nxIcePath': case 'nxGoldWheel': case 'nxSupernova': case 'nxRainbow': case 'nxSakura': case 'nxGhostShip': case 'nxMoonSlash': case 'nxHellGate': case 'nxPhoenix': case 'nxKO': case 'nyDragon': case 'nyMegaLaser': case 'nyCauldron': case 'nyParade': case 'nyWhale': case 'nyArrowStorm': case 'nyMagicBox': case 'nyTkCombo': case 'nyStorm': case 'nyQueen': case 'nyHapkido': nxUlt(f, o, T); break;
    case 'rush': case 'thousandKicks': {
      const kick = type === 'thousandKicks';
      if (!f.ultHit) {
        if (T <= 36) {
          f.ultInv = T < 6; f.vx = f.facing * 16;
          if (T % 2 === 0) burst(f.x - f.facing * 40, GROUND - 5, 2, ['#a07850', '#c8a070'], 4);
          if (inFront(150) && Math.abs(o.y - f.y) < 120) {
            const r = U({ dmg: 4, stun: 30, hitstop: 8, kb: 0 });
            if (r === 'hit' || r === 'armor') { f.ultHit = true; f.uT = 0; lock(); SFX.flurry(); }   // 연타 시작: 두두두두 연타 소리
            else if (r !== 'miss') ultEnd(f, o);
          }
        } else ultEnd(f, o);
      } else {
        f.vx = 0;
        if (o.state === 'locked') {
          o.x = clamp(f.x + f.facing * 120 * s, 50, W - 50);
          if (T % 5 === 0 && T < 65) U({ dmg: 2.2, force: true, noReact: true, hitstop: 1, shake: 4, sfx: 'flurryHit', txt: kick ? ['슉', '팡', '파박', '촤악'] : ['퍽', '팍', '빡', '퍼퍽'], hx: o.x - f.facing * 20 });
          if (T === 70) U({ dmg: 14, force: true, launch: -14, kb: 12, stun: 40, hitstop: 16, shake: 16, txt: [kick ? '천족난무!!' : '삼겹 폭풍!!'] });
        }
        if (T >= 85) ultEnd(f, o);
      }
      break;
    }
    case 'charge': {
      if (T < 10) { f.vx = 0; break; }
      if (T < 70 && !f.ultHit) {
        f.ultInv = true; f.vx = f.facing * 20;
        if (T % 2 === 0) burst(f.x - f.facing * 40, GROUND - 5, 3, ['#a07850', '#c8a070'], 5);
        if (inFront(140) && Math.abs(o.y - f.y) < 130) {
          const r = U({ dmg: 34, launch: -15, kb: 22, stun: 50, hitstop: 18, shake: 20, chip: 0.15, txt: ['멧돼지 대돌진!!'] });
          if (r !== 'miss') { f.ultHit = true; f.uT = 70; }
        }
        if ((f.facing > 0 && f.x >= W - 51) || (f.facing < 0 && f.x <= 51)) { f.uT = 70; shake = 10; }
      } else { f.ultInv = false; f.vx *= 0.8; if (T >= 95) ultEnd(f, o); }
      break;
    }
    case 'eruption': {
      f.vx = 0;
      if (T === 18) {
        f.ultInv = false; shake = 14; SFX.slam();
        const g = 'er' + gT + f.id;
        for (let i = 0; i < 5; i++) addObj({ owner: f, kind: 'pillar', x: clamp(f.x + f.facing * (130 + i * 110), 20, W - 20), y: GROUND - 130, w: 80, h: 260,
          dmg: 30, launch: -16, kb: 6, stun: 40, delay: i * 7, life: 28, group: g, ult: true, chip: 0.15, txt: ['화산 폭발!!'] });
      }
      if (T >= 60) ultEnd(f, o);
      break;
    }
    case 'stampede': {
      f.vx = 0;
      if (T === 10) {
        f.ultInv = false; SFX.oink();
        for (let i = 0; i < 8; i++) addObj({ owner: f, kind: 'minipig', x: f.facing > 0 ? -40 : W + 40, y: GROUND - 28, vx: f.facing * 11, w: 50, h: 50,
          dmg: 4.2, height: 'low', kb: 2, stun: 16, delay: i * 8, life: 140, ult: true, chip: 0.15, txt: ['꿀!', '꾸잉!', '꿀꿀!'] });
      }
      if (T >= 40) ultEnd(f, o);
      break;
    }
    case 'absoluteZero': {
      f.vx = 0;
      if (!f.ultHit) {
        if (T === 14) {
          f.ultInv = false; SFX.ice(); f.beamT = 18;
          if ((o.x - f.x) * f.facing > 0 && o.y > GROUND - 160) {
            const r = U({ dmg: 6, stun: 20, hitstop: 6, kb: 0, txt: ['쩡!!'] });
            if (r === 'hit' || r === 'armor') { f.ultHit = true; f.uT = 0; lock(); }
          }
        }
        if (T >= 45) ultEnd(f, o);
      } else {
        if (o.state === 'locked') {
          if (T % 10 === 0 && T >= 20 && T < 70) { U({ dmg: 4.5, force: true, noReact: true, hitstop: 2, shake: 6, sfx: 'chop', txt: ['사각!', '슥삭!', '대패!'] }); burst(o.x, o.y - 100, 8, ['#e1f5fe', '#b3e5fc'], 6); }
          if (T === 85) U({ dmg: 12, force: true, launch: -12, kb: 10, stun: 40, hitstop: 14, shake: 14, txt: ['절대영도!!'] });
        }
        if (T >= 100) ultEnd(f, o);
      }
      break;
    }
    case 'bodySlam': {
      if (T === 1) { f.vy = -20; f.y = GROUND - 1; }
      if (!f.landed) {
        f.ultInv = true;
        if (T > 1) f.vx = clamp((o.x - f.x) * 0.08, -14, 14);
        if (T > 5 && f.y >= GROUND) {
          f.landed = true; f.uT = 200; f.vx = 0; f.ultInv = false; shake = 22; SFX.slam();
          burst(f.x, GROUND, 30, ['#a07850', '#c8a070', '#fff'], 10);
          const g = 'sl' + gT + f.id;
          if (Math.abs(o.x - f.x) < 130 * s && o.y > GROUND - 110) {
            const r = U({ dmg: 38, launch: -14, kb: 10, stun: 50, hitstop: 18, shake: 22, unblockable: true, txt: ['스모 대압살!!'] });
            if (r !== 'miss') hitGroups.add(g);
          }
          for (const dir of [-1, 1]) addObj({ owner: f, kind: 'shock', x: f.x + dir * 60, y: GROUND - 18, vx: dir * 9, w: 60, h: 36,
            dmg: 14, height: 'low', knockdown: true, kb: 6, stun: 30, life: 40, group: g, ult: true, chip: 0.15, txt: ['쿠웅!'] });
        }
      } else if (T >= 230) ultEnd(f, o);
      break;
    }
    case 'beam': {
      f.vx = 0;
      if (T === 16) {
        f.ultInv = false; SFX.fire();
        addObj({ owner: f, kind: 'beam', follow: true, x: f.x, y: f.y - 95, w: 900, h: 70, dmg: 3.4, multi: 6, maxHits: 10, height: 'mid',
          burn: 120, kb: 1, stun: 14, life: 62, ult: true, chip: 0.2, txt: ['화르륵', '활활!', '매워!'] });
      }
      if (T > 16 && T < 78 && T % 8 === 0) SFX.fire();
      if (T >= 88) ultEnd(f, o);
      break;
    }
    case 'thousandCuts': {
      f.vx = 0;
      if (!f.ultHit) {
        if (T === 8) {
          let r = 'miss';
          if (Math.abs(o.x - f.x) < 480) r = U({ dmg: 3, stun: 30, hitstop: 4, kb: 0, unblockable: true, txt: ['...!'] });
          if (r === 'hit' || r === 'armor') { f.ultHit = true; f.uT = 0; lock(); }
          else popText(f.x, f.y - 170, '빗나감...', '#aaa', 22);
        }
        if (T >= 30) ultEnd(f, o);
      } else {
        f.ultInv = true;
        if (o.state === 'locked') {
          if (T % 3 === 0 && T < 58) slash(o.x + rand(-60, 60), o.y - rand(40, 140));
          if (T % 6 === 0 && T < 56) U({ dmg: 2.4, force: true, noReact: true, hitstop: 1, shake: 3, sfx: 'snip', txt: ['슥', '삭', '챙'] });
        }
        if (T === 62) {
          const side = Math.sign(o.x - f.x) || 1;
          f.x = clamp(o.x + side * 110, 50, W - 50); f.facing = -side;
          if (o.state === 'locked') U({ dmg: 12, force: true, launch: -12, kb: 10, stun: 40, hitstop: 16, shake: 16, txt: ['비전 · 천살!!'] });
        }
        if (T >= 80) ultEnd(f, o);
      }
      break;
    }
    case 'timeStop': {   // 시간 정지: 컷신 뒤 상대를 3~5초(스타플래티나 티어 이상이면 3~7초) 멈추고, 그동안 돼타로를 마음대로 움직여 때림
      f.vx = 0;
      if (T === 6) {
        if (f.ch.spirit && !f.standOn) { f.standOn = true; f.spX = f.x + f.facing * 62 * f.sc / 1.15; burst(f.spX, f.y - 100, 20, ['#b388ff', '#e1bee7', '#fff'], 8); }   // 필살기를 쓰면 스탠드가 저절로 나옴 (외침이 안 끊기게 소리 없이)
        if (o.state !== 'ko') {
          o.state = 'locked'; o.vx = 0; o.vy = 0; o.atk = null;
          const maxS = mode !== 3 && f === p1 && tierOf(tp) >= TIER_SP ? 7 : 5;   // 온라인은 두 화면이 같아야 해서 5초까지
          const D = Math.round(srand(3, maxS) * 60);
          TSTOP = { owner: f, left: D, max: D, dmg: 0 };
          popText(f.x, f.y - 200 * s, `시간 정지! ${(D / 60).toFixed(1)}초`, '#d1c4e9', 30);
        }
        f.state = 'idle'; f.ultInv = false; f.ultArmor = false;   // 이제 마음대로 움직임
      }
      break;
    }
    case 'goldSafe': {   // 황금 금고 떨구기: 상대 자리에 그림자 → 0.67초 뒤 금고 낙하 (막을 수 없음, 피할 수는 있음)
      f.vx = 0;
      if (T === 8) addObj({ owner: f, kind: 'safe', x: clamp(o.x, 90, W - 90), y: -150, vx: 0, vy: 2, g: 1.3, delay: 40, w: 150, h: 120,
        dmg: 30, kb: 6, stun: 50, launch: -11, height: 'mid', unblockable: true, life: 220, ult: true, maxHits: 1, clash: false });   // ult: 필살기 마무리로 인정 + 맞혀도 금고가 바닥까지 떨어짐
      if (T === 8) f.ultInv = false;   // 금고를 부른 뒤엔 무적 해제 (피한 상대가 때릴 수 있게)
      if (T >= 100) ultEnd(f, o);
      break;
    }
    case 'sliceRain': {   // 냉삼 폭탄 투하: 상대 머리 위로 얼린 냉삼이 우수수 (위치는 시드 난수 → 온라인에서도 같음)
      f.vx = 0;
      if (T === 12) f.ultInv = false;   // 냉삼을 부르기 시작하면 무적 해제
      if (T >= 12 && T <= 78 && T % 6 === 0) {
        const tx = clamp(o.x + srand(-90, 90), 60, W - 60);
        addObj({ owner: f, kind: 'slice', x: tx, y: -40, vx: 0, vy: 5, g: 0.55, w: 60, h: 42, dmg: 5, kb: 2, stun: 24, height: 'mid', life: 150, hitstop: 4, ult: false });
      }
      if (T >= 108) ultEnd(f, o);
      break;
    }
    case 'megaton': {
      f.vx = 0;
      if (T < 36) {
        f.ultInv = T < 10; f.ultArmor = true;
        if (T % 2 === 0) { const a = rand(0, 7); parts.push({ x: f.x + Math.cos(a) * 90, y: f.y - 90 + Math.sin(a) * 90, vx: -Math.cos(a) * 4, vy: -Math.sin(a) * 4, life: 20, max: 20, c: '#ffd600', s: 3, g: 0, type: 'dot' }); }
      } else {
        f.ultArmor = false; f.ultInv = false;
        if (T === 36) f.vx = f.facing * 8;
        if (T < 44 && !f.ultHit && inFront(220) && Math.abs(o.y - f.y) < 130) {
          const r = U({ dmg: 38, guardBreak: true, launch: -13, kb: 26, stun: 50, hitstop: 22, shake: 24, txt: ['홈런!!', '메가톤!!'] });
          if (r !== 'miss') f.ultHit = true;
        }
        if (T >= 64) ultEnd(f, o);
      }
      break;
    }
  }
}

// ================= CPU =================
function skillGood(t, dist, op) {
  if (t === 'fireProj') return dist > 220 && dist < 400;   // 포물선: 이 정도 거리에 떨어짐
  if (t === 'iceProj' || t === 'stewSplash') return dist > 200;
  if (t === 'boneSwing') return dist > 120 && dist < 230;
  if (t === 'teleport') return true;
  if (t === 'boomerang') return dist > 150 && dist < 460;   // 냉삼 부메랑: 떨어진 상대에게
  if (t === 'coinToss') return dist < 340;   // 돈뿌리기: 가까이서
  if (t === 'spiritRush') return dist < 420;   // 뚱타플레티나 러시: 수호령이 날아가서 때림 (방어 무시)
  if (t === 'uppercut') return dist < 170;
  if (t === 'launcher') return dist > 90 && dist < 180;   // 엄니 걸기: 조금 떨어진 상대를 끌어당김
  if (t === 'counter') return op.state === 'attack' || dist < 170;
  return dist < 260;
}
// CPU 콤보 순서 (첫 공격이 맞은 뒤 이어서 누를 버튼들)
const CPU_COMBOS = [['rp', 'rk'], ['lp', 'rp', 'rk'], ['lp', 'lk', 'skill'], ['lk', 'rp', 'skill'], ['lp', 'lp', 'rp', 'rk'], ['c_lk', 'rp', 'rk'], ['rp', 'skill']];
function cpuInput(me, op) {
  const inp = { ...EMPTY }, ai = me.ai, L = me.cpuLv;
  // 연승이 쌓일수록(레벨↑) 반응·패링·콤보 확률이 올라간다
  const pGuard = Math.min(0.6, 0.2 + 0.03 * L), pParry = Math.min(0.2, 0.03 + 0.012 * L), pChain = Math.min(0.6, 0.2 + 0.025 * L);   // 밸런스 패치: 너무 잘 막고 콤보가 길어서 낮춤
  if (me.state === 'grabbing') { inp.mash = Math.random() < Math.min(0.6, 0.25 + 0.02 * L); return inp; }
  const dx = op.x - me.x, dist = Math.abs(dx), dir = Math.sign(dx) || 1;
  const bk = dir > 0 ? 'left' : 'right';
  if (me.state === 'blockstun') { inp[bk] = true; inp.down = ai.low; return inp; }
  if (['ko', 'grabbed', 'locked', 'down', 'hit', 'parried', 'transforming', 'ult'].includes(me.state)) return inp;
  if (me.state === 'attack') {
    // 콤보: 첫 공격이 맞으면 정해 둔 콤보 순서대로 다음 버튼을 누름 (입력 기억 덕분에 맞은 순간 눌러도 이어짐)
    if (me.atkHit && !me.atk.skill && !me.atk.grab) {
      if (!ai.route && me.chain === 0) ai.route = Math.random() < pChain ? pick(CPU_COMBOS) : [];
      const nx = ai.route && ai.route[me.chain];
      if (nx && ai.pressedAt !== me.chain) {
        ai.pressedAt = me.chain;
        if (nx === 'skill') { if (me.skillCD <= 0) inp.skill = true; else inp.rk = true; }
        else if (nx.startsWith('c_')) { inp.down = true; inp[nx.slice(2)] = true; }
        else inp[nx] = true;
      }
    }
    return inp;
  }
  ai.route = null; ai.pressedAt = -1;
  if (op.state === 'attack' && op.atk && !op.atk.proj && op.af === op.atk.startup - 3 && dist < 220 && Math.random() < pParry) { inp[bk] = true; inp[bk + 'P'] = true; return inp; }
  if (ai.guard > 0) { ai.guard--; inp[bk] = true; inp.down = ai.low; return inp; }
  if (op.state === 'attack' && op.atk && op.af <= 2 && dist < 240 && Math.random() < pGuard) { ai.guard = op.atk.startup + (op.atk.active || 1) + 4; ai.low = op.atk.height === 'low'; }
  if (op.state === 'ult' && op.uT < 3 && Math.random() < 0.35) { ai.guard = 40; ai.low = op.ch.ult.type === 'stampede'; }
  for (const o of objs) if (o.owner === op && o.dmg && !o.delay && Math.abs(o.x - me.x) < 180 && Math.random() < 0.06) {
    if (o.height === 'low') inp.up = true; else { ai.guard = 12; ai.low = false; }
  }
  if (temps[tileOf(me.x)] >= 70 && ai.move === 0) { ai.move = (me.x < W / 2 ? 1 : -1) * 30; if (Math.random() < 0.3) inp.up = true; }
  if (--ai.think <= 0) {
    ai.think = Math.max(5, 10 - L * 0.3) + (Math.random() * Math.max(8, 18 - L * 0.6) | 0);   // 밸런스 패치: 생각 간격을 늘려 덜 몰아붙이게
    const r = Math.random();
    if (me.meter >= 100 && dist < ULT_RANGE[me.ch.ult.type] && r < 0.5) { inp.ult = true; inp.cpu = true; }
    else if (me.skillCD <= 0 && r < 0.35 && skillGood(me.ch.skill.type, dist, op)) inp.skill = true;
    else if (dist < 130 && r < 0.12) inp.grab = true;
    else if (dist < 200) {
      const q = Math.random();
      if (q < 0.22) inp.lp = true; else if (q < 0.42) inp.rp = true; else if (q < 0.58) inp.lk = true; else if (q < 0.72) inp.rk = true;
      else if (q < 0.8) { inp.down = true; inp[pick(['lp', 'rp', 'lk', 'rk'])] = true; }
      else if (q < 0.9) ai.move = -dir * 16; else inp.up = true;
    } else { ai.move = dir * (14 + (Math.random() * 24 | 0)); if (r < 0.06) inp.up = true; }
  }
  if (ai.move !== 0) { const sg = Math.sign(ai.move); inp[sg > 0 ? 'right' : 'left'] = true; ai.move -= sg; }
  return inp;
}

// ================= 필드 이벤트 (재미 요소) =================
let evT = 0, blackoutT = 0, saltT = 0, evBanner = '', evBannerT = 0;
function banner(s) {}   // (이벤트 안내 띠 글씨는 뺐음)
function updateEvents() {
  if (evBannerT > 0) evBannerT--;
  if (--evT <= 0) {
    evT = 60 * srand(12, 18) | 0;
    const e = spick(['gold', 'soju', 'ssam', 'blackout', 'salt', 'gold']);
    if (e === 'blackout') { blackoutT = 240; banner('정전!! 스포트라이트만 보인다'); speak('정전!'); SFX.thud(); }
    else if (e === 'salt') { saltT = 240; banner('하늘에서 왕소금 우박이 쏟아진다!'); speak('소금 우박!'); }
    else {
      addObj({ owner: null, kind: 'item', sub: e, x: srand(140, W - 140), y: -40, w: 44, h: 44, life: 600 });
      banner({ gold: '황금 돼지저금통 등장! 먼저 줍는 쪽이 코인!', soju: '소주병 등장! 마시면 취권 모드', ssam: '상추쌈 등장! 먹으면 체력 회복' }[e]);
      speak({ gold: '황금 저금통!', soju: '소주 등장!', ssam: '상추쌈!' }[e]);
    }
  }
  if (blackoutT > 0) blackoutT--;
  if (saltT > 0 && --saltT % 6 === 0) addObj({ owner: null, kind: 'salt', x: srand(30, W - 30), y: -20, vy: 7, w: 16, h: 16, life: 120 });
}
function pickup(f, k) {
  SFX.bell();
  if (k === 'gold') {
    if (f === p1 && mode === 1) addCoins(Math.round(30 * EARN));
    // (아이템 주울 때 뜨던 글씨는 뺐음)
  } else if (k === 'soju') { f.drunkT = 360; }
  else { f.hp = Math.min(f.maxHp, f.hp + f.maxHp * 0.15); }
}
function envUpdate(o) {
  if (o.kind === 'item') {
    if (o.y < GROUND - 24) { o.vy += 0.4; o.y = Math.min(GROUND - 24, o.y + o.vy); }
    for (const f of [p1, p2]) if (f.state !== 'ko' && Math.abs(f.x - o.x) < 60 * f.sc / 1.15 && f.y > GROUND - 140) { pickup(f, o.sub); o.life = 0; break; }
  } else if (o.kind === 'salt') {
    o.y += o.vy;
    for (const f of [p1, p2]) if (f.state !== 'ko' && overlapD(o, f)) { f.hp = Math.max(1, f.hp - 2.5); f.flash = 4; o.life = 0; SFX.block(); break; }
    if (o.y > GROUND - 10) { o.life = 0; burst(o.x, GROUND - 10, 4, ['#ffffff', '#e0e0e0'], 3); }
  }
}
function drawEnv(o) {
  ctx.save(); ctx.translate(o.x, o.y + (o.y >= GROUND - 24 ? Math.sin(o.t * 0.15) * 3 : 0));
  if (o.kind === 'salt') { ctx.fillStyle = '#fff'; ctx.rotate(o.t * 0.3); ctx.fillRect(-6, -6, 12, 12); }
  else if (o.sub === 'gold') {
    const g = ctx.createRadialGradient(-6, -8, 2, 0, 0, 26); g.addColorStop(0, '#fff8e1'); g.addColorStop(1, '#ffb300');
    ctx.fillStyle = g; ell(0, 0, 26, 20); ctx.fill(); ell(20, -4, 8, 8); ctx.fill();
    ctx.fillStyle = '#e65100'; ctx.fillRect(-8, -18, 16, 3); ell(22, -4, 2, 3); ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.5 * Math.sin(o.t * 0.3)})`; ell(-10, -8, 4, 4); ctx.fill();
  } else if (o.sub === 'soju') {
    ctx.fillStyle = 'rgba(46,125,50,0.9)'; rr(-10, -18, 20, 38, 6); ctx.fill(); rr(-4, -32, 8, 16, 3); ctx.fill();
    ctx.fillStyle = '#e8f5e9'; ctx.fillRect(-8, -6, 16, 12);
  } else { ctx.fillStyle = '#7cb342'; ell(0, 0, 26, 18); ctx.fill(); ctx.fillStyle = '#9ccc65'; ell(0, -2, 18, 12); ctx.fill(); drawChunk(0, -4, 0.2, 1, 0); }
  ctx.restore();
}
function drawBlackout() {
  if (blackoutT <= 0) return;
  const a = Math.min(1, blackoutT / 20, (240 - blackoutT) / 20) * 0.9;
  ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.beginPath(); ctx.rect(0, 0, W, H);
  for (const f of [p1, p2]) { ctx.moveTo(f.x + 115, f.y - 80); ctx.arc(f.x, f.y - 80, 115, 0, Math.PI * 2, true); }
  ctx.fill('evenodd');
}

// ================= 오프닝 컷신 =================
const OPEN_T = 540;
function updateOpening() {
  const T = sceneT;
  if (T === 10) noise(1.2, 0.25, 300);
  if (T === 90) speak('처음에 지는 돼지는... 요리가 된다!', 1.2, 1.0);
  if (T === 250) { SFX.chop(); SFX.slam(); shake = 18; }
  if (T > 250 && T < 370 && T % 3 === 0) flame(rand(0, W), H - rand(0, 30));
  if (T === 370) { speak('이겨라!', 1.5, 1.1); SFX.bell(); noise(1.5, 0.3, 2500, 'bandpass'); shake = 12; }
  if (T > 370 && T % 14 === 0) {
    burst(rand(100, W - 100), rand(60, 260), 30, [pick(['#ff5252', '#ffd740', '#69f0ae', '#40c4ff', '#ea80fc']), '#fff'], 9);
    tone(rand(500, 900), 0.2, 'triangle', 0.06);
  }
}
function drawOpening() {
  const t = sceneT / 60;
  ctx.save(); if (shake > 0.5) ctx.translate(rand(-shake, shake), rand(-shake, shake));
  ctx.drawImage(bgC, 0, 0, W, H); drawFloor();
  ctx.fillStyle = `rgba(0,0,0,${t < 1.4 ? 0.9 : 0.55})`; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 3; i++) {
    const cx = 200 + i * 280 + Math.sin(t * 2 + i * 2) * 140;
    ctx.fillStyle = 'rgba(255,240,180,0.12)'; poly([[cx - 20, 0], [cx + 20, 0], [cx + 130, H], [cx - 130, H]]); ctx.fill();
  }
  if (t < 1.4) txt('꿀꿀 포차 · 철판 대난투', W / 2, H / 2, Math.max(1, 44 * ease(t / 0.6)), '#ffb5c5', '#000', 8);
  if (t > 1.2) {   // 사회자 셰프 돼지
    const y = lerp(-200, 470, ease((t - 1.2) / 0.4)), sc = 1.5;
    drawPig(480, y, 1, CHARS[0].look, { scale: sc, victory: t > 4, t: sceneT });
    const hx = 480 + 36 * sc, hy = y - 90 * sc;
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#ccc'; ctx.lineWidth = 2;
    ctx.fillRect(hx - 24, hy - 46, 48, 22);
    for (const dx of [-16, 0, 16]) { ell(hx + dx, hy - 54, 16, 16); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = '#333'; ell(hx + 50, hy + 30, 7, 7); ctx.fill(); ctx.fillRect(hx + 47, hy + 34, 6, 22);
  }
  if (t > 1.6 && t < 4.2) bubble(330, 150, '처음에 지는 돼지는...', 30);
  if (t > 4.15 && t < 6.2) {
    const k = ease((t - 4.15) / 0.25);
    txt('요리가 된다!!!', W / 2, 150, 70 * (2 - k), '#ff5252', '#fff', 12);
    for (let i = 0; i < 6; i++) {   // 날아다니는 칼·요리
      const p = ((t - 4.15) * 0.6 + i / 6) % 1, x = lerp(-100, W + 100, p), y = 260 + Math.sin(i * 2 + t * 3) * 80;
      ctx.save(); ctx.translate(x, y); ctx.rotate(t * 6 + i);
      if (i % 3 === 0) { ctx.scale(0.4, 0.4); drawCleaver(0, 60, false); }
      else if (i % 3 === 1) drawStrip(-40, -12, 80, 24, (i % 2) * 0.8, 1);
      else drawCutlet(0, 0, 1, true, 0.4);
      ctx.restore();
    }
  }
  if (t > 6.15) {
    const k = ease((t - 6.15) / 0.2);
    ctx.save(); ctx.translate(W / 2 + rand(-4, 4), 150); ctx.scale(2.4 - 1.4 * k, 2.4 - 1.4 * k);
    txt('이겨라!!!', 0, 0, 90, '#ffd740', '#b71c1c', 14); ctx.restore();
    drawPig(lerp(-150, 170, ease((t - 6.3) / 0.3)), 470, 1, p1.C, { scale: 1.3, victory: true, t: sceneT });
    for (const [j, i] of shownIdx().entries()) {   // 돼지 퍼레이드 (받기 전 선물 돼지는 빼고)
      const x = ((t - 6.15) * 160 + j * (W + 200) / shownIdx().length) % (W + 200) - 100;
      drawPig(W - x, 520, -1, CHARS[i].look, { scale: 0.42, walk: true, t: sceneT * 2 + i * 9 });
    }
  }
  drawParts();
  ctx.restore();
  txt(TOUCH ? '탭하여 건너뛰기' : 'SPACE 건너뛰기', W - 16, 20, 14, '#aaa', null, 0, 'right');
  addHot(0, 0, W, H, () => { pressed.Space = true; });
}

