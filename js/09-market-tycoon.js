// ================= 냉장고 · 시장 · 상점 =================
let fridge = lsGet('sgf_fridge', []);
let inv = Object.assign({ own: {}, eq: { hat: null, fx: null }, use: { meter: 0, hpup: 0, revive: 0 } }, lsGet('sgf_inv', {}));
const saveInv = () => lsSet('sgf_inv', inv), saveFridge = () => lsSet('sgf_fridge', fridge);
const MEAT_BASE = { '삼겹살': 30, '목살': 28, '등심': 26, '앞다리': 22, '족': 34, '갈비': 40, '항정살': 45 };
const MARKET_MS = 3 * 60 * 1000;   // 3분마다 시세가 바뀐다
const marketPeriod = () => Math.floor(Date.now() / MARKET_MS);
function hashStr(s) { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
const trend = (key, per) => 0.6 + (hashStr(key + '#' + per) % 1000) / 1000;   // 0.6 ~ 1.6배
const hotMethod = per => Object.keys(METHODS)[hashStr('hot' + per) % 5];      // 이번 시간 인기 조리법 ×1.8
function dishPrice(d, per = marketPeriod()) {
  const base = MEAT_BASE[d.m] || 25, fitM = [1, 1.5, 1.15, 1][d.f] || 1, starM = 0.4 + d.s * 0.25;
  return Math.max(5, Math.round(base * fitM * starM * trend(d.k, per) * Math.sqrt(trend(d.m, per)) * (hotMethod(per) === d.k ? 1.8 : 1) * EARN));
}
function addDish(dish, meat, stars) {
  fridge.push({ n: dish.name, m: meat, k: dish.method, s: stars, f: dish.fit, t: Date.now() });
  if (fridge.length > 30) fridge.shift();
  saveFridge();
}
const SHOP = [   // 2026-11-12: 가격 10배로 올림 · 비싼 새 물건 추가
  { id: 'sunglass', type: 'hat', name: '선글라스', price: 50000 },
  { id: 'flower', type: 'hat', name: '꽃 머리핀', price: 40000 },
  { id: 'chef', type: 'hat', name: '셰프 모자', price: 60000 },
  { id: 'phones', type: 'hat', name: '헤드폰', price: 80000 },
  { id: 'crown', type: 'hat', name: '황금 왕관', price: 5000000 },
  { id: 'fxfire', type: 'fx', name: '불꽃 오라', price: 100000 },
  { id: 'fxbolt', type: 'fx', name: '번개 오라', price: 200000 },
  { id: 'fxrainbow', type: 'fx', name: '무지개 오라', price: 10000000 },
  { id: 'meter', type: 'use', name: '필살 게이지 50%', price: 5000, desc: '다음 연승 경기 시작 시' },
  { id: 'hpup', type: 'use', name: '강철 체력 +15%', price: 8000, desc: '다음 연승 경기 1판' },
  { id: 'revive', type: 'use', name: '부활권', price: 50000, desc: '연승 모드에서 져도 1번 이어하기' },
  { id: 'bigRevive', type: 'use', name: '대형 부활권', price: 5000000, desc: '이어하기 + 돈·티어 점수 안 잃음' },
  { id: 'rankShield', type: 'use', name: '랭크 보호권', price: 1000000, desc: '랭크전 져도 티어 점수 그대로' },
  { id: 'fullMeter', type: 'use', name: '필살 게이지 100%', price: 300000, desc: '다음 연승 경기 바로 필살기' },
  { id: 'luckyCharm', type: 'use', name: '황금 행운 부적', price: 3000000, desc: '다음 경기 이기면 코인 5배' },
  { id: 'tix10', type: 'use', name: '룰렛 티켓 10장', price: 500000, desc: '🎁 보상 센터 행운 룰렛용' },
  { id: 'fastSpin', type: 'use', name: '룰렛 빨리 돌리기', price: 1e11, desc: '영구: 룰렛이 금방 멈춤 (1번만 사면 됨)' },
  { id: 'skinBox', type: 'use', name: '🎨 스킨 상자', price: 1e15, desc: '랜덤 돼지 전용 스킨 1개 · 중복 30% 환급' },
  { id: 'skinBox10', type: 'use', name: '🎨 스킨 상자 10개', price: 9e15, desc: '10번 열기 (1개 값 할인)' },
  { id: 'skinBoxP', type: 'use', name: '💎 프리미엄 스킨 상자', price: 5e16, desc: '영웅 이상 확정 (전설 10%)' },
  { id: 'honor', type: 'use', name: '🏅 명예 등급 올리기', price: 1000000000, desc: '등급마다 10배 · 이름 앞에 🏅' },
  { id: 'ttRich', type: 'title', name: '💰 졸부', price: 100000000 },
  { id: 'ttChef', type: 'title', name: '🔥 철판의 신', price: 10000000000 },
  { id: 'ttKing', type: 'title', name: '👑 돼지 재벌', price: 1000000000000 },
  { id: 'ttSpace', type: 'title', name: '🌌 우주 최강 돼지', price: 100000000000000 },
  { id: 'ttLegend', type: 'title', name: '🏆 살아있는 전설', price: 10000000000000000 }
];
const honorLv = () => +(inv && inv.honor) || 0;   // 🏅 명예 등급
const honorTag = () => honorLv() ? `🏅${honorLv()} ` : '';
const titleName = () => { const t = inv.eq && inv.eq.title && SHOP.find(x => x.id === inv.eq.title); return t ? t.name : ''; };

const itPrice = it => Math.round((it.id === 'honor' ? 1e9 * 10 ** honorLv() : it.price) * (1 - (evLive() ? Math.min(90, +EVT.sale || 0) : 0) / 100));   // 이벤트 할인
const USE_ICON = { skinBoxP: '💎', honor: '🏅', skinBox: '🎨', skinBox10: '🎁', fastSpin: '💨', meter: '⚡', hpup: '🛡️', revive: '💖', bigRevive: '💎', rankShield: '🏅', fullMeter: '🔥', luckyCharm: '🍀', tix10: '🎟️' };
const COS_IDS = SHOP.filter(s => s.type !== 'use').map(s => s.id);
// 스킨을 끼면 원래 옷·모자·소품은 숨기고 몸 특징(엄니·수염·흉터 등)만 남김 → 스킨이 잘 보임
const SKIN_KEEP_ACC = ['bold', 'tusks', 'whisker', 'spots', 'bristle', 'scar', 'muscle'];
const skinLook = (look, ps) => ({ ...look, ...ps.pal, skinFx: ps, acc: (look.acc || []).filter(a => SKIN_KEEP_ACC.includes(a)), hat: null });
const withCos = (ch, cos = inv.eq) => { const r = withCos0(ch, cos), ps = typeof pigSkinEq === 'function' ? pigSkinEq(ch) : null; if (ps) r.look = skinLook(r.look, ps); return r; };   // 🎨 그 돼지에 장착한 전용 스킨
const withCos0 = (ch, cos = inv.eq) => ({ ...ch, look: { ...ch.look, hat: COS_IDS.includes(cos && cos.hat) ? cos.hat : null, fx: COS_IDS.includes(cos && cos.fx) ? cos.fx : null } });
// ---- 스킬 효과음 (합성음만, 음성 없음) ----
// 재료: 여러 겹 톱니파 + 필터 열림(두껍게 '부우웅'), FM(쇳소리·칼날), 공간 울림(리버브), 좌우 퍼짐
function bus(pan = 0, wet = 0.3) {   // 소리가 나갈 길: 좌우 위치 + 울림 양
  if (!AC) return null;
  const g = AC.createGain(), p = AC.createStereoPanner ? AC.createStereoPanner() : null; g.gain.value = 1.5;   // 스킬음은 한 단계 더 크게
  if (p) { p.pan.value = pan; g.connect(p); p.connect(sfxOut || master); } else g.connect(sfxOut || master);
  if (rev && wet > 0) { const w = AC.createGain(); w.gain.value = wet; g.connect(w); w.connect(rev); }
  return g;
}
function supersaw(f, d, o = {}) {   // 살짝 어긋난 톱니파 5개 + 필터가 열리며 '부우웅' 두꺼운 소리
  if (!AC) return;
  const { f2, v = 0.12, lp = 300, lp2 = 3000, q = 4, at = 0, atk = 0.02, out } = o;
  const n = AC.currentTime + at, flt = AC.createBiquadFilter(), g = AC.createGain();
  flt.type = 'lowpass'; flt.Q.value = q; flt.frequency.setValueAtTime(lp, n); flt.frequency.exponentialRampToValueAtTime(lp2, n + d * 0.7);
  g.gain.setValueAtTime(0.0001, n); g.gain.exponentialRampToValueAtTime(v, n + atk); g.gain.exponentialRampToValueAtTime(0.0001, n + d);
  flt.connect(g); g.connect(out || sfxOut || master);
  for (const dt of [-14, -6, 0, 7, 15]) {
    const s = AC.createOscillator(); s.type = 'sawtooth'; s.detune.value = dt;
    s.frequency.setValueAtTime(f, n); if (f2) s.frequency.exponentialRampToValueAtTime(f2, n + d);
    s.connect(flt); s.start(n); s.stop(n + d + 0.05);
  }
}
function fm(f, ratio, index, d, o = {}) {   // FM: 쇳소리·종·칼날처럼 반짝이는 소리
  if (!AC) return;
  const { v = 0.1, f2, at = 0, atk = 0.002, out } = o;
  const n = AC.currentTime + at, c = AC.createOscillator(), m = AC.createOscillator(), mg = AC.createGain(), g = AC.createGain();
  c.frequency.setValueAtTime(f, n); m.frequency.setValueAtTime(f * ratio, n);
  if (f2) { c.frequency.exponentialRampToValueAtTime(f2, n + d); m.frequency.exponentialRampToValueAtTime(f2 * ratio, n + d); }
  mg.gain.setValueAtTime(f * index, n); mg.gain.exponentialRampToValueAtTime(f * index * 0.05 + 1, n + d);
  g.gain.setValueAtTime(0.0001, n); g.gain.exponentialRampToValueAtTime(v, n + atk); g.gain.exponentialRampToValueAtTime(0.0001, n + d);
  m.connect(mg); mg.connect(c.frequency); c.connect(g); g.connect(out || sfxOut || master);
  c.start(n); m.start(n); c.stop(n + d + 0.05); m.stop(n + d + 0.05);
}
function sub(f, d, v = 0.5, at = 0, out) { osc(f, d, { v, f2: Math.max(20, f * 0.35), at, atk: 0.004, out }); }   // 묵직한 저음 '둥'
function sweep(d, v, lo, hi, o = {}) { nz(d, { v, freq: lo, f2: hi, type: 'bandpass', q: o.q ?? 2.5, at: o.at || 0, atk: o.atk ?? d * 0.5, out: o.out }); }   // 바람 가르는 '쉬익'
// 스킬 쓰는 순간 공통 '파밧!': 바람 터짐 + 짧은 펀치 (낮은 합성음 없음)
function castPunch() {
  if (!AC) return;
  nz(0.16, { v: 0.32, freq: 3500, f2: 700, type: 'bandpass', q: 0.9, out: bus(0, 0.3) });
  thump(1.15, 0.45, 0, { hp: 600 });
}
// 스킬마다 다른 소리: 바람(쉬익)·땅울림 노이즈 + 펀치 녹음을 높낮이 바꿔서
const SKILL_SFX = {
  flambe() { nz(0.7, { v: 0.35, freq: 600, f2: 2400, type: 'bandpass', q: 0.6, atk: 0.05 }); },   // 화르륵
  sauceTrap() { SFX.splash(); },
  blackHole() { tone(220, 0.8, 'sine', 0.1, 55); nz(0.8, { v: 0.2, freq: 1500, f2: 200, type: 'bandpass', q: 2 }); },
  cheer() { for (let i = 0; i < 4; i++) setTimeout(() => tone(660 + i * 165, 0.14, 'triangle', 0.08), i * 90); },
  noteWave() { tone(784, 0.12, 'triangle', 0.09); setTimeout(() => tone(988, 0.12, 'triangle', 0.09), 90); setTimeout(() => tone(1175, 0.16, 'triangle', 0.09), 180); },
  wink() { tone(1320, 0.1, 'sine', 0.08); setTimeout(() => tone(1760, 0.18, 'sine', 0.07), 80); },
  kageClone() { if (smp('nrClone', { v: 1.1 })) return; for (const at of [0, 0.13]) nz(0.28, { v: 0.42, freq: 1400, f2: 180, type: 'bandpass', q: 0.7, at, atk: 0.01 }); tone(1200, 0.22, 'sine', 0.08, 2400); setTimeout(() => tone(1800, 0.2, 'triangle', 0.06, 900), 130); },   // 분신술: 펑·펑 연기 + 반짝
  rasen() { if (smp('nrRasen', { v: 1.1 })) return; nz(1.15, { v: 0.34, freq: 200, f2: 3800, type: 'bandpass', q: 3, atk: 0.9 }); tone(110, 1.1, 'sawtooth', 0.05, 440); whoosh(0.5, 0.22, 400, 2600, 0.6); },   // 회오리 구슬: 바람이 빨려 들며 위로 차오르는 소리
  spiritRush() { if (!smp('ttRush', { v: 1 })) { for (let i = 0; i < 40; i++) knock(1.1 + i * 0.03, 0.5, i * 0.08); } },   // 연타 기합 (파일 없으면 펀치 6번)
  dash() { const b = bus(0, 0.25); nz(0.5, { v: 0.4, freq: 90, f2: 500, atk: 0.25, out: b }); whoosh(0.3, 0.3, 250, 2200, 0.15); thump(0.75, 0.6, 0.3, { lp: 2200 }); },   // 우르르릉 → 휙 → 쿵
  armorShoulder() { const b = bus(0, 0.35); nz(0.45, { v: 0.45, freq: 120, f2: 400, atk: 0.15, out: b }); thump(0.65, 0.75, 0.05, { lp: 1800 }); nz(0.05, { v: 0.3, freq: 1500, type: 'bandpass', q: 1.5, at: 0.08, out: b }); },   // 쿠웅 + 철컥
  launcher() { const b = bus(0, 0.3); whipS(1.0, 0.7); for (let i = 0; i < 6; i++) nz(0.025, { v: 0.16, freq: 2200, type: 'bandpass', q: 1.2, at: 0.08 + i * 0.035, out: b }); thump(1.1, 0.45, 0.22); },   // 휙 걸고 촤르륵
  roll() { [0, 0.09, 0.18, 0.27].forEach((t, i) => thump(0.9 - i * 0.05, 0.35, t, { lp: 1500 })); whoosh(0.4, 0.15, 250, 1100); },   // 데굴데굴
  iceProj() { whoosh(0.15, 0.2, 2000, 6000); },
  fireProj() { const b = bus(0, 0.3); nz(0.4, { v: 0.45, freq: 150, f2: 2500, atk: 0.12, out: b }); },   // 화악
  stewSplash() { nz(0.25, { v: 0.25, freq: 600, f2: 1400, type: 'bandpass', q: 0.9 }); },
  spinKick() { [0, 0.11, 0.2].forEach((t, i) => whipS(1.15 + i * 0.12, 0.5, t)); },   // 휘익 휘익 휘익 (채찍 녹음, 점점 높게)
  counter() { const b = bus(0, 0.4); whoosh(0.2, 0.3, 2500, 8000); nz(0.03, { v: 0.35, freq: 5000, type: 'highpass', at: 0.18, out: b }); },   // 스르릉 → 착
  teleport() { nz(0.15, { v: 0.3, freq: 6000, f2: 500, type: 'bandpass', q: 1, out: bus(-0.6, 0.4) }); nz(0.15, { v: 0.3, freq: 500, f2: 6000, type: 'bandpass', q: 1, at: 0.2, out: bus(0.6, 0.4) }); },   // 슉 … 슉
  uppercut() { whoosh(0.25, 0.35, 300, 5000); },   // 아래에서 위로 슈웅
  coinToss() { whipS(1.2, 0.4); for (let i = 0; i < 6; i++) nz(0.03, { v: 0.18, freq: rnd(5000, 7500), type: 'bandpass', q: 2, at: 0.05 + i * 0.035 }); },   // 휙 + 짤랑짤랑
  boomerang() { whipS(1.35, 0.5); whoosh(0.35, 0.18, 1500, 4500, 0.05); },   // 휙 던지고 슈우웅
  boneSwing() { whipS(0.75, 0.75); thump(1.2, 0.35, 0.25, { hp: 800 }); },   // 무거운 갈빗대: 낮은 채찍 '부웅~착' + 딱
};
SFX.coin = () => { tone(1320, 0.08, 'sine', 0.08); setTimeout(() => tone(1760, 0.16, 'sine', 0.07), 70); };

const mk = { tab: 0, sel: 0 };
function openMarket() { mk.tab = 0; mk.sel = 0; scene = 'market'; }
function sellDish(i) {
  const d = fridge[i]; if (!d) return;
  const p = dishPrice(d); addCoins(p); fridge.splice(i, 1); saveFridge(); rwProgress('sell');
  SFX.coin(); popText(W / 2, 470, `${d.n} 판매! +${fmtN(p)} 코인`, '#ffd740', 28);
  mk.sel = Math.min(mk.sel, Math.max(0, fridge.length - 1));
}
function shopAct(i) {
  const it = SHOP[i]; if (!it) return;
  if (it.type === 'use') {
    if (coins < itPrice(it)) { SFX.block(); toast('코인이 부족해요'); return; }
    addCoins(-itPrice(it));
    if (it.id === 'fastSpin' && (inv.use.fastSpin || 0) > 0) { addCoins(itPrice(it)); SFX.block(); toast('이미 갖고 있어요 (영구)'); return; }
    if (it.id === 'skinBoxP') { saveInv(); openSkinBox(1, 2); SFX.bell(); return; }
    if (it.id === 'honor') { const h = honorLv() + 1; inv.honor = h; saveInv(); cloudDirty(); SFX.bell(); popup({ icon: '🏅', title: `명예 등급 Lv.${h}!`, lines: [`다음 등급: 🪙 ${fmtN(1e9 * 10 ** h)}`, '이름 앞에 🏅 표시가 붙어요'], big: true }); return; }
    if (it.id === 'skinBox' || it.id === 'skinBox10') { saveInv(); openSkinBox(it.id === 'skinBox10' ? 10 : 1); SFX.bell(); return; }   // 🎨 스킨 상자 열기
    if (it.id === 'tix10') { RW.bonus += 10; rwSave(); SFX.coin(); toast(`🎟️ 룰렛 티켓 10장! (보유 ${RW.bonus}장)`); saveInv(); cloudDirty(); return; }
    inv.use[it.id] = (inv.use[it.id] || 0) + 1; SFX.coin(); toast(`${it.name} 구매! (보유 ${inv.use[it.id]}개)`);
  } else if (it.type === 'skin' && !inv.own[it.id]) { SFX.block(); toast('🎨 스킨은 스킨 상자에서만 나와요'); return;
  } else if (inv.own[it.id]) {
    inv.eq[it.type] = inv.eq[it.type] === it.id ? null : it.id; SFX.select();
    toast(inv.eq[it.type] ? `${it.name} 장착!` : `${it.name} 해제`);
  } else {
    if (coins < itPrice(it)) { SFX.block(); toast('코인이 부족해요'); return; }
    addCoins(-itPrice(it)); inv.own[it.id] = true; inv.eq[it.type] = it.id; SFX.coin(); toast(`${it.name} 구매 + 장착!`);
  }
  saveInv();
}
function updateMarket() {
  if (qm) { updateQty(); return; }   // 수량 고르는 창
  if (pressed.Digit1 || pressed.Numpad1 || pressed.KeyQ) { mk.tab = 0; mk.sel = 0; SFX.select(); }
  if (pressed.Digit2 || pressed.Numpad2 || pressed.KeyE) { mk.tab = 1; mk.sel = 0; SFX.select(); }
  if (pressed.Digit3 || pressed.Numpad3 || pressed.KeyT) { openTycoon(); return; }   // 포장마차 장사(타이쿤)
  const n = mk.tab === 0 ? fridge.length : SHOP.length, step = mk.tab === 0 ? 1 : 4;
  if (n) {
    if (pressed.KeyW || pressed.ArrowUp) mk.sel = (mk.sel - step + n * 4) % n;
    if (pressed.KeyS || pressed.ArrowDown) mk.sel = (mk.sel + step) % n;
    if (mk.tab === 1 && (pressed.KeyA || pressed.ArrowLeft)) mk.sel = (mk.sel + n - 1) % n;
    if (mk.tab === 1 && (pressed.KeyD || pressed.ArrowRight)) mk.sel = (mk.sel + 1) % n;
  }
  if (pressed.Enter || pressed.Space || pressed.KeyI) { if (mk.tab === 0) sellDish(mk.sel); else if (SHOP[mk.sel] && SHOP[mk.sel].type === 'use' && SHOP[mk.sel].id !== 'fastSpin') openQty(mk.sel); else shopAct(mk.sel); }   // 소모품은 개수 골라 사기
  if (mk.tab === 0 && pressed.KeyX && fridge.length) {
    const total = fridge.reduce((s, d) => s + dishPrice(d), 0); addCoins(total); fridge = []; saveFridge(); mk.sel = 0;
    SFX.coin(); popText(W / 2, 470, `전부 판매! +${fmtN(total)} 코인`, '#ffd740', 32);
  }
  if (pressed.Escape) toTitle();
}

// ================= 포장마차 장사 (타이쿤) =================
// 90초 영업: 불판에 고기 올리기 → 잘 익었을 때 집기(완벽하면 비싸게) → 손님 눌러서 주문대로 서빙 → 코인!
// 번 돈으로 고기 등급·불판·소문·알바·메뉴를 업그레이드 → 가게 등급이 오르고 점점 크게 벌 수 있음 (사채 1000만 갚기용)
// 영업이 끝나면 알바비를 줌: 알바가 많을수록·손님이 많을수록·오래 일할수록(경력) 오름. 🤖 자동 영업은 점장이 다 해 주지만 점장 월급이 더 듦
const TY_MEAT = {
  s: { name: '삼겹살', base: 25, cook: 240, raw: '#f2a49b', fat: '#fff3e8' },
  m: { name: '목살', base: 40, cook: 330, raw: '#d8786b', fat: '#f5d3c3' },
  h: { name: '항정살', base: 70, cook: 290, raw: '#f0b7aa', fat: '#ffffff' }
};
const TY_UP = [
  { id: 'grade', name: '🥩 고기 등급', max: 20, cost: l => Math.round(500 * 2.6 ** l), desc: l => `판매가 ×${fmtN(2 ** l)} → ×${fmtN(2 ** (l + 1))}` },
  { id: 'grill', name: '🔥 불판 늘리기', max: 3, cost: l => 800 * 3 ** l, desc: l => `불판 ${3 + l}칸 → ${4 + l}칸` },
  { id: 'rep', name: '📣 가게 소문', max: 10, cost: l => 1000 * 3 ** l, desc: () => '손님이 더 자주 오고 더 오래 기다려요' },
  { id: 'staff', name: '🐷 알바 고용', max: 5, cost: l => [5000, 60000, 400000, 2500000, 15000000][l],
    desc: l => ['알바가 손님에게 알아서 서빙 (알바비 있음)', '알바가 고기도 알아서 굽고 집어요', '사이드 담당: 찌개·계란찜·냉면을 알아서 만들어요', '숙련 알바: 알바들이 2배 빨라져요', '매니저: 손님이 25% 더 오래 기다리고 팁↑'][l] },
  { id: 'menu', name: '📜 새 메뉴: 항정살', max: 1, cost: () => 20000, desc: () => '비싼 항정살 주문이 들어와요 (1개 70×등급)' },
  { id: 'side', name: '🍲 사이드 메뉴', max: 4, cost: l => [3000, 20000, 80000, 300000][l], desc: l => `${Object.values(TY_SIDE)[l].icon} ${Object.values(TY_SIDE)[l].name} 추가 · 고기랑 같이 주문하면 더 벌어요` },
  { id: 'deco', name: '🪑 인테리어', max: 10, cost: l => 20000 * 4 ** l, desc: () => '손님이 더 오래 기다리고 VIP가 더 자주 와요' },
  { id: 'sauce', name: '🧂 비법 양념', max: 8, cost: l => Math.round(30000 * 3.2 ** l), desc: l => `모든 고기 판매가 +${l * 10}% → +${(l + 1) * 10}%` },
  { id: 'neon', name: '🏮 네온 간판', max: 6, cost: l => Math.round(200000 * 4 ** l), desc: l => `영업 끝 보너스 매출 +${l * 5}% → +${(l + 1) * 5}%` },
  { id: 'chain', name: '🏢 체인점 열기', max: 16, cost: l => 1e8 * 2 ** l, desc: l => `${l}곳 → ${l + 1}곳 · 영업 끝날 때마다 체인점마다 그날 매출의 40%` },
  { id: 'brand', name: '👑 본사 브랜드', max: 6, cost: l => Math.round(1e9 * 4 ** l), desc: l => `모든 체인점 수익 +${l * 25}% → +${(l + 1) * 25}%` },
  { id: 'idle', name: '🌙 무인 영업', max: 1, cost: () => 1e10, desc: () => '사 두면 게임을 꺼 두거나 유튜브를 봐도 영업이 계속 돼요 (자동 영업 안 켜도 됨)' },
  { id: 'branch', name: '🏙️ 체인점별 강화', max: 0, cost: () => 0, desc: () => '체인점마다 다른 특별 강화 (들어가서 고르기)' },
];
// 사이드 메뉴: 음료는 바로 나가고, 찌개·계란찜·냉면은 냄비에서 만들어서(다 되면 탭) 고기랑 같이 서빙
const TY_SIDE = {
  drink: { name: '소주·음료', icon: '🍺', base: 12, cook: 0, key: '' },
  stew: { name: '된장찌개', icon: '🍲', base: 30, cook: 360, key: 'Z' },
  egg: { name: '계란찜', icon: '🥚', base: 22, cook: 260, key: 'X' },
  noodle: { name: '냉면', icon: '🍜', base: 45, cook: 200, key: 'C' }
};
const tySides = () => Object.keys(TY_SIDE).slice(0, tyU.side);
const tyPots = () => tySides().filter(k => TY_SIDE[k].cook);
const tySidePrice = k => Math.round(TY_SIDE[k].base * 2 ** tyU.grade);
// 그날의 사건 (영업 시작 때 가끔)
const TY_EV = [
  { id: 'rain', name: '☔ 비 오는 날', desc: '손님은 적지만 찌개·음료를 많이 찾아요', spawn: 1.3, side: 0.85 },
  { id: 'party', name: '🎉 회식 단체 손님', desc: '손님이 훨씬 많이 오고 많이 시켜요', spawn: 0.65, more: 1 },
  { id: 'tv', name: '📺 맛집 방송 촬영', desc: 'VIP 손님이 3배 자주 와요', vip: 3 },
  { id: 'payday', name: '💰 월급날', desc: '손님들이 팁을 2배로 줘요', tip: 2 },
  { id: 'inspect', name: '🧽 위생 점검', desc: '고기를 태우면 벌금! 조심하세요', fine: true }
];
const TY_TOWN = ['강남', '홍대', '부산 서면', '대구 동성로', '제주', '인천 송도', '대전 둔산', '광주 충장로', '수원', '전주 한옥마을', '강릉', '울산', '판교', '여의도', '잠실', '해운대'];
// 가게 등급: 지금까지 번 돈(총매출)으로 올라감
const TY_RANK = [['🏮 길거리 포장마차', 0], ['🍖 작은 고깃집', 50000], ['🏠 동네 맛집', 1000000], ['⭐ 소문난 맛집', 10000000], ['🏢 고깃집 프랜차이즈', 100000000], ['👑 전국 1등 고기 체인', 1000000000]];
const TY_SHIFT = 60 * 90;
const TYU0 = () => ({ sauce: 0, neon: 0, brand: 0, br: {}, grill: 0, grade: 0, rep: 0, staff: 0, menu: 0, side: 0, deco: 0, chain: 0, chains: [], idle: 0, lastT: 0, rating: 3, best: 0, shifts: 0, total: 0, cust: 0, hist: [], auto: false });
let tyU = Object.assign(TYU0(), lsGet('sgf_tycoon', {}));
const saveTyU = () => lsSet('sgf_tycoon', tyU);
const TY = { phase: 'lobby', sel: 0, t: 0, left: 0, slots: [], meat: 's', tray: { s: [], m: [], h: [] }, cust: [], earned: 0, served: 0, missed: 0, burnt: 0, vip: 0, spawn: 0, combo: 0, wage: null, autoT: 0, banner: 0 };
const tyPrice = k => TY_MEAT[k].base * 2 ** tyU.grade;
const tyKinds = () => tyU.menu ? ['s', 'm', 'h'] : ['s', 'm'];
const tyRank = () => { let i = 0; TY_RANK.forEach((r, k) => { if (tyU.total >= r[1]) i = k; }); return i; };
const tySlotXY = i => [340 + (i % 3) * 132, 318 + (i / 3 | 0) * 96];
const tySeatX = s => 150 + s * 220;
// 알바비: 알바 수에 따라 매출의 4~12% + 손님 1명당 작은 수고비, 점장(자동 영업)은 매출의 5% 더. 경력 인상은 최대 25%
// (전에는 알바 5명+점장+경력이면 매출의 거의 절반이 나가서 남는 게 54%뿐이었음 → 최대 약 25%로 낮춤)
const tyRaise = () => 1 + 0.01 * Math.min(25, tyU.shifts);
const TY_STAFF_PCT = [0, 0.04, 0.07, 0.09, 0.11, 0.12];   // 알바 수에 따른 알바비 (매출 대비)
function tyWage(earned, served) {
  const staff = Math.round((earned * TY_STAFF_PCT[tyU.staff] + tyU.staff * served * 0.5 * 2 ** tyU.grade) * tyRaise());
  const boss = tyU.auto ? Math.round(earned * 0.05 * tyRaise()) : 0;
  const wc = Math.max(0.5, 1 - 0.03 * brSum('wage'));   // 체인점(알바 특화)이 알바비를 줄여 줌
  return { staff: Math.round(staff * wc), boss: Math.round(boss * wc), total: Math.round(staff * wc) + Math.round(boss * wc) };
}
function openTycoon() { if (!(tyU.auto && TY.phase !== 'lobby')) { TY.phase = 'lobby'; TY.autoT = 180; } TY.sel = 0; scene = 'tycoon'; }   // 자동 영업 중이면 하던 영업 화면 그대로
// 자동 영업은 장사 화면을 안 보고 있어도 계속 돌아감 (싸움·시장 등 어디서든). 소리·효과·입력 없이 조용히 진행하고, 영업이 끝나면 알림만
// ---- 🌙 무인 영업 (10B): 사 두면 화면을 안 보고 있어도(다른 앱·유튜브·게임 끔·폰 잠금) 영업이 계속 됨 ----
// 브라우저는 안 보이는 게임을 멈추니까, 게임이 보일 때 5초마다 '마지막으로 본 시각'을 이 기기에 적어 두고,
// 다시 보이면(또는 다시 켜면) 그 뒤로 지난 시간만큼 한꺼번에 계산함 → 앱을 강제로 꺼도 됨
// 한 번 영업 = 약 94초, 남은 시간은 다음에 이어서, 최대 3일치. 벌이는 최근 영업 순이익 평균 (기록이 없으면 등급에 맞춘 기본값)
const SEEN_K = 'sgf_tyseen';
function tySeen() { try { localStorage.setItem(SEEN_K, String(Date.now())); } catch (e) {} }
function tyAway() { tySeen(); }
function tyOffline() {
  let last = 0; try { last = +localStorage.getItem(SEEN_K) || 0; } catch (e) {}
  last = Math.max(last, tyU.lastT || 0);
  tySeen(); if (tyU.lastT) tyU.lastT = 0;
  if (!tyU.idle || !last || pendingSave) return;
  const per = (TY_SHIFT + 240) / 60 * 1000, cap = Math.floor(3 * 86400000 / per);
  const ms = Math.max(0, Date.now() - last) + (tyU.awayCarry || 0);
  const n = Math.min(Math.floor(ms / per), cap);
  tyU.awayCarry = n >= cap ? 0 : ms - n * per;   // 94초가 안 되는 남은 시간은 다음에 이어서
  if (n < 1) { saveTyU(); return; }
  const hs = (tyU.hist || []).filter(v => v > 0);
  const avg = hs.length ? hs.reduce((a, b) => a + b, 0) / hs.length : 1500 * 2 ** tyU.grade * (1 + 0.4 * tyU.chain);
  const gain = Math.round(avg * n);
  addCoins(gain); tyU.shifts += n; tyU.total += gain; tyU.cust += n * 15; saveTyU();
  toast(`🌙 무인 영업: 자리 비운 동안 ${n}일 영업 · +${fmtN(gain)} 코인`); toastT = 420;
}
document.addEventListener('visibilitychange', () => { if (document.hidden) tyAway(); else tyOffline(); });
addEventListener('pagehide', tyAway);
setInterval(() => { if (!document.hidden) tySeen(); }, 5000);   // 보고 있는 동안은 계속 '지금 보는 중'으로
function tyBackground() {
  const keep = { ...pressed }, ac = AC, pp = parts, tt = texts, tm = toastMsg, tT = toastT, before = TY.phase, au = tyU.auto;
  for (const k in pressed) delete pressed[k];
  AC = null; parts = []; texts = []; tyU.auto = true;   // 무인 영업이 있으면 자동 영업을 안 켜도 점장이 맡음
  try { updateTycoon(); } finally {
    Object.assign(pressed, keep); AC = ac; parts = pp; texts = tt; toastMsg = tm; toastT = tT; tyU.auto = au;
  }
  if (before === 'play' && TY.phase === 'result') {
    const w = TY.wage || { paid: 0 }, net = TY.earned - w.paid + TY.chainInc + TY.bonus - TY.fines;
    toast(`🏮 자동 영업 ${tyU.shifts}일차 끝 · 순이익 ${net >= 0 ? '+' : ''}${fmtN(net)}`);
  }
}
function tyStart() {
  Object.assign(TY, { phase: 'play', t: 0, left: TY_SHIFT, slots: Array(3 + tyU.grill).fill(null), meat: 's', tray: { s: [], m: [], h: [] }, cust: [],
    earned: 0, served: 0, missed: 0, burnt: 0, vip: 0, spawn: 40, combo: 0, wage: null, autoT: 0, banner: 150,
    pots: {}, sideStock: { stew: 0, egg: 0, noodle: 0 }, stars: [], fines: 0, chainInc: 0, bonus: 0,
    ev: tyU.shifts >= 2 && Math.random() < 0.5 ? pick(TY_EV) : null,   // 3일차부터 가끔 사건
    goal: Math.round(Math.max(800 * 2 ** tyU.grade, tyU.best * 0.9) / 10) * 10 });   // 오늘의 목표 매출
  SFX.confirm();
}
// 별점(1~5): 빨리·잘 구워서 줄수록 높음, 그냥 가 버리면 1점. 가게 별점이 높으면 손님이 더 자주 옴
const tyStarAvg = () => TY.stars.length ? TY.stars.reduce((a, b) => a + b, 0) / TY.stars.length : tyU.rating;
function tyEnd() {
  rwProgress('shift');   // 일일 미션
  nqAdd('shift', 1);
  const w = tyWage(TY.earned, TY.served), pay = Math.min(coins, w.total);
  addCoins(-pay); TY.wage = { ...w, paid: pay };
  TY.chainInc = Math.round(TY.earned * 0.4 * brIncome() * (1 + 0.25 * (tyU.brand || 0)));   // 체인점 수익 (체인점별 강화 · 본사 브랜드)   // 체인점 수익
  TY.bonus = TY.earned >= TY.goal ? Math.round(TY.goal * 0.2) : 0;   // 목표 달성 보너스
  TY.bonus += Math.round(TY.earned * (0.05 * (tyU.neon || 0) + 0.03 * brSum('tip')));   // 네온 간판 · 체인점(팁 특화)
  addCoins(TY.chainInc + TY.bonus);
  if (TY.stars.length) tyU.rating = Math.round((tyU.rating * 0.6 + tyStarAvg() * 0.4) * 10) / 10;
  tyU.shifts++; tyU.best = Math.max(tyU.best, TY.earned); tyU.total += TY.earned + TY.chainInc; tyU.cust += TY.served;
  tyU.hist = (tyU.hist || []).concat([TY.earned - pay + TY.chainInc + TY.bonus - TY.fines]).slice(-7); saveTyU();
  TY.phase = 'result'; TY.autoT = 240; SFX.bell();
}
function tyBuy(u) {
  if (u.id === 'branch') return;   // 체인점별 강화는 따로 들어가서
  const l = tyU[u.id];
  if (l >= u.max) { SFX.block(); toast('이미 최고 단계예요'); return; }
  const c = u.cost(l);
  if (coins < c) { SFX.block(); toast(`코인이 부족해요 (${fmtN(c)} 필요)`); return; }
  addCoins(-c); tyU[u.id]++;
  if (u.id === 'chain') {   // 체인점 이름은 아직 없는 동네로
    const left = TY_TOWN.filter(t => !(tyU.chains || []).includes(t)), town = left.length ? pick(left) : `${tyU.chain}호`;
    tyU.chains = (tyU.chains || []).concat([town]); saveTyU(); SFX.bell(); burst(W / 2, H / 2, 40, ['#ffd740', '#fff'], 12);
    toast(`🏢 꿀꿀 포차 ${town}점 오픈! (체인점 ${tyU.chain}곳)`); return;
  }
  saveTyU(); SFX.coin(); toast(`${u.name} ${tyU[u.id]}단계!`);
}
// ---- 🏙️ 체인점별 강화: 동네마다 특화가 달라요 (수익 · 팁 · VIP · 알바) ----
const BR_SPEC = {
  '강남': ['💎 VIP 라운지', 'vip'], '홍대': ['🎸 버스킹 무대', 'tip'], '부산 서면': ['🐟 수산시장 직거래', 'income'], '대구 동성로': ['🔥 막창 콜라보', 'income'],
  '제주': ['🐷 흑돼지 농장', 'income'], '인천 송도': ['✈️ 공항 지점', 'tip'], '대전 둔산': ['🍞 빵집 콜라보', 'tip'], '광주 충장로': ['🎨 예술 거리 축제', 'vip'],
  '수원': ['🏯 성곽 야경 테라스', 'vip'], '전주 한옥마을': ['🍚 한옥 비빔 세트', 'income'], '강릉': ['☕ 커피 거리 디저트', 'tip'], '울산': ['⚓ 조선소 단체 회식', 'income'],
  '판교': ['💻 IT 회식 예약제', 'wage'], '여의도': ['📈 증권가 점심 특선', 'vip'], '잠실': ['⚾ 야구장 배달', 'tip'], '해운대': ['🏖️ 바닷가 무인 키오스크', 'wage']
};
const BR_FX = { income: l => `이 체인점 수익 +${l * 30}%`, tip: l => `영업 끝 보너스 매출 +${l * 3}%`, vip: l => `VIP 손님 +${l}%`, wage: l => `알바비 -${l * 3}%` };
const brSpec = t => BR_SPEC[t] || ['🏪 동네 단골 이벤트', ['income', 'tip', 'vip', 'wage'][hashStr(t) % 4]];
const brLv = t => ((tyU.br || {})[t] || 0);
const BR_MAX = 10;
const brCost = (t, l) => Math.round(5e7 * 2.6 ** l * (1 + 0.2 * (tyU.chains || []).indexOf(t)));
function brSum(kind) { return (tyU.chains || []).reduce((a, t) => a + (brSpec(t)[1] === kind ? brLv(t) : 0), 0); }
function brIncome() { return (tyU.chains || []).reduce((a, t) => a + 1 + 0.1 * brLv(t) + (brSpec(t)[1] === 'income' ? 0.3 * brLv(t) : 0), 0); }   // 모든 체인점은 단계마다 +10%, 수익 특화는 +30% 더
function updateBranch() {
  const L = tyU.chains || [], n = L.length;
  if (pressed.KeyW || pressed.ArrowUp) { TY.bsel = (TY.bsel + n - 1) % n; SFX.select(); }
  if (pressed.KeyS || pressed.ArrowDown) { TY.bsel = (TY.bsel + 1) % n; SFX.select(); }
  if (pressed.Enter || pressed.Space || pressed.KeyI) {
    const t = L[TY.bsel], l = brLv(t);
    if (l >= BR_MAX) { SFX.block(); toast('이미 최고 단계예요'); }
    else { const c = brCost(t, l); if (coins < c) { SFX.block(); toast(`코인이 부족해요 (${fmtN(c)} 필요)`); } else { addCoins(-c); tyU.br = { ...(tyU.br || {}), [t]: l + 1 }; saveTyU(); SFX.coin(); burst(W / 2, 140 + TY.bsel * 26, 20, ['#ffd740', '#ce93d8'], 8); toast(`${t}점 ${brSpec(t)[0]} ${l + 1}단계!`); } }
  }
  if (pressed.Escape) { TY.phase = 'lobby'; SFX.select(); }
  TY.autoT = Math.max(TY.autoT, 300);
}
function drawBranch() {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a1030'); g.addColorStop(1, '#3a1a20'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  txt('🏙️ 체인점별 강화', W / 2, 30, 28, '#ffe082', '#000', 7);
  txt(`🪙 ${fmtN(coins)}  ·  체인점 ${(tyU.chains || []).length}곳  ·  동네마다 특화가 달라요`, W / 2, 62, 14, '#fff59d', null);
  const L = tyU.chains || [], VIS = 14, off = clamp(TY.bsel - 7, 0, Math.max(0, L.length - VIS));
  L.forEach((t, i) => {
    if (i < off || i >= off + VIS) return;
    const y = 80 + (i - off) * 30, on = TY.bsel === i, [nm, kind] = brSpec(t), l = brLv(t);
    ctx.fillStyle = on ? 'rgba(255,145,0,0.5)' : 'rgba(255,255,255,0.07)'; rr(40, y, 880, 27, 7); ctx.fill();
    txt(`${t}점`, 54, y + 14, 13, '#fff', null, 0, 'left');
    txt(nm, 190, y + 14, 13, '#ce93d8', null, 0, 'left');
    txt(`Lv.${l}/${BR_MAX}  ${BR_FX[kind](l)}${l < BR_MAX ? '  →  ' + BR_FX[kind](l + 1) : ''}`, 420, y + 14, 12, '#ddd', null, 0, 'left');
    if (l < BR_MAX) { const c = brCost(t, l); txt(`🪙 ${fmtN(c)}`, 906, y + 14, 13, coins >= c ? '#69f0ae' : '#ff8a80', null, 0, 'right'); } else txt('최고!', 906, y + 14, 13, '#ffd740', null, 0, 'right');
    addHot(40, y, 880, 27, () => { if (TY.bsel === i) pressed.Enter = true; else TY.bsel = i; });
  });
  txt(TOUCH ? '탭해서 고르기 · 한 번 더 탭하면 강화' : 'W/S 고르기 · Enter 강화 · Esc 돌아가기', W / 2, 516, 13, '#aaa', null);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(14, 10, 100, 34, 8); ctx.fill(); txt('← 돌아가기', 64, 27, 13, '#fff', null);
  addHot(14, 10, 100, 34, () => { pressed.Escape = true; });
}
function tyToggleAuto() { tyU.auto = !tyU.auto; saveTyU(); SFX.select(); toast(tyU.auto ? '🤖 자동 영업 켬: 점장이 굽고·집고·서빙하고 다음 영업도 알아서 시작해요 (점장 월급 있음)' : '🤖 자동 영업 끔');
  if (tyU.auto && TY.phase === 'lobby') tyStart();   // 켜면 바로 영업 시작
  else if (tyU.auto && TY.phase === 'result') TY.autoT = Math.min(TY.autoT, 90);
}
// 익힘 정도 → 품질: 덜 익음 0.7 · 잘 익음 1 · 완벽 1.25 · 탐 -1(버림)
const tyQual = p => p < 0.75 ? null : p < 1 ? 0.7 : p <= 1.35 ? 1.25 : p <= 1.6 ? 1 : -1;
function tySlot(i) {
  const s = TY.slots; if (i >= s.length) return;
  const c = s[i], [x, y] = tySlotXY(i);
  if (!c) { s[i] = { k: TY.meat, p: 0 }; if (AC) nz(0.35, { v: 0.12, freq: 4000, type: 'highpass' }); return; }   // 치익
  const q = tyQual(c.p);
  if (q === null) { SFX.block(); popText(x, y - 30, '아직 덜 익었어요', '#fff', 18); return; }
  s[i] = null;
  if (q < 0) {
    TY.burnt++; smokePuff(x, y); popText(x, y - 30, '탔다! 버림', '#bbb', 20);
    if (TY.ev && TY.ev.fine) { const f = Math.min(coins, tyPrice('s') * 3); addCoins(-f); TY.fines += f; popText(x, y - 56, `🧽 위생 벌금 -${fmtN(f)}`, '#ff8a80', 18); }
    return;
  }
  const tr = TY.tray[c.k];
  if (tr.length >= 12) { s[i] = c; SFX.block(); toast('접시가 꽉 찼어요! 손님에게 먼저 서빙하세요'); return; }
  tr.push(q); tr.sort((a, b) => b - a); SFX.select();
  popText(x, y - 30, q > 1.2 ? '✨ 완벽!' : q < 1 ? '덜 익음' : '좋아!', q > 1.2 ? '#ffd740' : '#fff', 20);
}
// 사이드가 준비됐나 (음료는 언제나 OK)
const tySideOk = c => !c.side || c.side === 'drink' || TY.sideStock[c.side] > 0;
const tyReady = c => TY.tray[c.k].length >= c.n && tySideOk(c);
function tyServe(j) {
  const c = TY.cust[j]; if (!c) return;
  const tr = TY.tray[c.k];
  if (tr.length < c.n) { SFX.block(); toast(`${TY_MEAT[c.k].name} ${c.n}개가 필요해요 (접시에 ${tr.length}개)`); return; }
  if (!tySideOk(c)) { SFX.block(); toast(`${TY_SIDE[c.side].icon} ${TY_SIDE[c.side].name}도 같이 시켰어요! 냄비에서 만들어 주세요`); return; }
  if (c.side && c.side !== 'drink') TY.sideStock[c.side]--;
  const qs = tr.splice(0, c.n), pay = (qs.reduce((s, q) => s + tyPrice(c.k) * q, 0) + (c.side ? tySidePrice(c.side) : 0)) * (c.vip ? 3 : 1);
  TY.combo = Math.min(5, TY.combo + 1);
  const tip = 0.5 * (TY.ev && TY.ev.tip || 1) * (tyU.staff >= 5 ? 1.2 : 1);
  const total = Math.round((pay + pay * tip * (c.pat / c.max)) * (1 + 0.1 * (TY.combo - 1)) * evMul('ty') * (1 + 0.1 * (tyU.sauce || 0)) * EARN);   // 이벤트: 장사 N배   // 빨리 줄수록 팁↑ · 연속 서빙 보너스
  const avgQ = qs.reduce((a, b) => a + b, 0) / qs.length;
  TY.stars.push(clamp(2 + 3 * (c.pat / c.max) + (avgQ > 1.2 ? 0.5 : avgQ < 1 ? -0.5 : 0), 1, 5));
  addCoins(total); TY.earned += total; TY.served++; if (c.vip) TY.vip++; TY.cust.splice(j, 1); SFX.coin();
  popText(tySeatX(c.seat), 120, `${c.vip ? '👑 ' : ''}+${fmtN(total)}${TY.combo > 1 ? ` (${TY.combo}연속!)` : ''}`, '#ffd740', c.vip ? 28 : 24);
  burst(tySeatX(c.seat), 150, c.vip ? 18 : 8, ['#ffd740', '#fff8e1'], 6);
}
// 손님 주문은 많은데 접시·불판에 모자란 고기
const tyNeed = k => TY.cust.filter(c => c.k === k).reduce((s, c) => s + c.n, 0) - TY.tray[k].length - TY.slots.filter(c => c && c.k === k).length;
function tyPlaceBest(e) { const keep = TY.meat; TY.meat = tyKinds().reduce((a, b) => tyNeed(b) > tyNeed(a) ? b : a, 's'); tySlot(e); TY.meat = keep; }
// 점장 / 알바 행동
function tyBotPick() {
  const i = TY.slots.findIndex(c => c && ((c.p >= 1.08 && c.p <= 1.35) || c.p > 1.6));
  if (i >= 0) { tySlot(i); return true; } return false;
}
function tyBotServe() {
  const ok = TY.cust.map((c, j) => [c, j]).filter(([c]) => tyReady(c)).sort((a, b) => b[0].vip - a[0].vip || a[0].pat - b[0].pat)[0];
  if (ok) { tyServe(ok[1]); return true; } return false;
}
// 사이드 냄비: 비었으면 끓이기 시작 → 다 되면(1) 탭해서 그릇에 담기 → 너무 오래 두면(2.2) 넘쳐서 버림
function tyPot(k) {
  const p = TY.pots[k], i = tyPots().indexOf(k); if (i < 0) return;
  const x = 714, y = 308 + i * 62;
  if (!p) { TY.pots[k] = { p: 0 }; SFX.select(); return; }
  if (p.p < 1) { SFX.block(); popText(x, y - 20, '아직이에요', '#fff', 15); return; }
  if (TY.sideStock[k] >= 6) { SFX.block(); toast('그릇이 꽉 찼어요! 먼저 서빙하세요'); return; }
  TY.pots[k] = null; TY.sideStock[k]++; SFX.coin(); popText(x, y - 20, `${TY_SIDE[k].icon} 완성!`, '#ffd740', 16);
}
function tyBotSide() {
  for (const k of tyPots()) { const p = TY.pots[k]; if (p && p.p >= 1 && TY.sideStock[k] < 6) { tyPot(k); return true; } }
  for (const k of tyPots()) {
    const want = TY.cust.filter(c => c.side === k).length;
    if (!TY.pots[k] && (TY.sideStock[k] < want || TY.sideStock[k] < 1)) { tyPot(k); return true; }
  }
  return false;
}
function tyBotPlace() { const e = TY.slots.findIndex(c => !c); if (e >= 0) { tyPlaceBest(e); return true; } return false; }
function updateTycoon() {
  if (TY.phase === 'branch') { updateBranch(); return; }
  if (TY.phase === 'lobby') {
    const n = TY_UP.length + 2;   // 0 영업 시작 · 1~5 업그레이드 · 6 자동 영업
    if (pressed.KeyW || pressed.ArrowUp) { TY.sel = (TY.sel + n - 1) % n; SFX.select(); }
    if (pressed.KeyS || pressed.ArrowDown) { TY.sel = (TY.sel + 1) % n; SFX.select(); }
    if (pressed.Enter || pressed.Space || pressed.KeyI) { if (TY.sel === 0) tyStart(); else if (TY.sel === n - 1) tyToggleAuto(); else if (TY_UP[TY.sel - 1].id === 'branch') { if (!(tyU.chains || []).length) { SFX.block(); toast('체인점을 먼저 열어 주세요 (🏢 체인점 열기)'); } else { TY.phase = 'branch'; TY.bsel = 0; SFX.confirm(); } return; } else tyBuy(TY_UP[TY.sel - 1]); }
    if (pressed.KeyR) tyToggleAuto();
    if (pressed.Escape) { openMarket(); return; }
    if (Object.keys(pressed).some(k => pressed[k])) TY.autoT = Math.max(TY.autoT, 300);   // 업그레이드 고르는 중엔 자동 시작 미룸
    if (tyU.auto && TY.phase === 'lobby' && --TY.autoT <= 0) tyStart();   // 자동 영업 켜진 채로 들어오면 잠깐 뒤 시작
    return;
  }
  if (TY.phase === 'result') {
    if (pressed.Escape && tyU.auto) { tyToggleAuto(); return; }
    if (pressed.Enter || pressed.Space || pressed.KeyI || pressed.Escape) { TY.phase = 'lobby'; TY.sel = 0; TY.autoT = 300; return; }
    if (tyU.auto && --TY.autoT <= 0) tyStart();   // 자동 영업: 잠깐 쉬고 다음 영업
    return;
  }
  // ---- 영업 중 ----
  TY.t++; TY.left--; if (TY.banner > 0) TY.banner--;
  for (let i = 0; i < 6; i++) if (pressed['Digit' + (i + 1)] || pressed['Numpad' + (i + 1)]) tySlot(i);
  if (pressed.KeyQ) TY.meat = 's'; if (pressed.KeyE) TY.meat = 'm'; if (pressed.KeyW && tyU.menu) TY.meat = 'h';
  ['KeyA', 'KeyS', 'KeyD', 'KeyF'].forEach((k, s) => { if (pressed[k]) { const j = TY.cust.findIndex(c => c.seat === s); if (j >= 0) tyServe(j); } });
  if (pressed.KeyR) tyToggleAuto();
  tyPots().forEach(k => { if (pressed['Key' + TY_SIDE[k].key]) tyPot(k); });   // Z·X·C: 사이드 냄비
  for (const k of tyPots()) {   // 냄비 끓이기 (너무 오래 두면 넘침)
    const p = TY.pots[k]; if (!p) continue;
    p.p += 1 / TY_SIDE[k].cook;
    if (p.p >= 2.2) { TY.pots[k] = null; TY.burnt++; popText(714, 308 + tyPots().indexOf(k) * 62 - 20, '넘쳤다!', '#bbb', 15); }
  }
  for (let i = 0; i < TY.slots.length; i++) {
    const c = TY.slots[i]; if (!c) continue;
    c.p += 1 / TY_MEAT[c.k].cook;
    const [x, y] = tySlotXY(i);
    if (c.p > 1.35 && gT % 10 === 0) smoke(x + rand(-20, 20), y - 10, c.p > 1.6 ? '60,60,60' : '200,200,200');
  }
  if (--TY.spawn <= 0 && TY.left > 240) {   // 손님 등장 (빈자리가 있을 때)
    const ev = TY.ev || {}, rate = 0.85 + 0.075 * (tyU.rating - 3);   // 별점이 높을수록 손님이 자주 옴
    TY.spawn = Math.max(55, 250 - 28 * tyU.rep) * (ev.spawn || 1) / rate * (0.7 + Math.random() * 0.6) | 0;
    const used = TY.cust.map(c => c.seat), free = [0, 1, 2, 3].filter(s => !used.includes(s));
    if (free.length) {
      const vip = Math.random() < (0.08 + 0.02 * tyU.deco + 0.01 * brSum('vip')) * (ev.vip || 1), ch = CHARS[pickShown()];
      const mx = ((1000 + 160 * tyU.rep) * (1 + 0.12 * tyU.deco) * (tyU.staff >= 5 ? 1.25 : 1) * (vip ? 0.6 : 1)) | 0;   // 기다려 주는 시간
      const r = Math.random(), k = tyU.menu && r < 0.22 ? 'h' : r < 0.6 ? 's' : 'm';
      const sides = tySides(), side = sides.length && Math.random() < (ev.side || 0.45) ? pick(sides) : null;
      TY.cust.push({ seat: pick(free), k, n: Math.min(4, 1 + (Math.random() < 0.5 ? 0 : Math.random() < 0.6 ? 1 : 2) + (ev.more || 0)), side, pat: mx, max: mx, look: ch.look, t: 0, vip });
      if (vip) popText(tySeatX(TY.cust[TY.cust.length - 1].seat), 90, '👑 VIP 손님! (3배)', '#ffd740', 20);
    }
  }
  for (let j = TY.cust.length - 1; j >= 0; j--) {
    const c = TY.cust[j]; c.t++;
    if (--c.pat <= 0) { TY.cust.splice(j, 1); TY.missed++; TY.stars.push(1); TY.combo = 0; SFX.block(); popText(tySeatX(c.seat), 120, '😡 그냥 갈래!', '#ff8a80', 22); }
  }
  if (tyU.auto) {   // 🤖 점장: 고기 집기 → 서빙 → 빈 불판에 올리기 (사람보다 조금 느림)
    if (TY.t % 14 === 0) tyBotPick() || tyBotServe() || tyBotSide() || tyBotPlace();
  } else {
    const sp = tyU.staff >= 4 ? 2 : 1;   // 숙련 알바: 2배 빠름
    if (tyU.staff >= 1 && TY.t % (50 / sp | 0) === 0) tyBotServe();               // 알바 1: 서빙
    if (tyU.staff >= 2 && TY.t % (26 / sp | 0) === 0) tyBotPick() || tyBotPlace();   // 알바 2: 굽기·집기
    if (tyU.staff >= 3 && TY.t % (34 / sp | 0) === 0) tyBotSide();                 // 알바 3: 사이드
  }
  if (TY.left <= 0) tyEnd();
  else if (pressed.Escape) { if (tyU.auto) tyToggleAuto(); tyEnd(); }
}
const tyMix = (a, b, t) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * clamp(t))).join(',')})`; };
function tyDrawMeat(k, p, x, y, sc = 1) {
  const m = TY_MEAT[k];
  const col = p < 1 ? tyMix(m.raw, '#c97a3e', p) : p <= 1.35 ? '#d38a32' : p <= 1.6 ? tyMix('#d38a32', '#5d3418', (p - 1.35) / 0.25) : '#2a1a10';
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; rr(-42, -15, 88, 34, 10); ctx.fill();
  ctx.fillStyle = col; rr(-44, -18, 88, 34, 10); ctx.fill();
  ctx.fillStyle = p > 1.6 ? '#3a2a20' : p < 1 ? m.fat : '#f3d9a8';
  if (k === 's') { ctx.fillRect(-40, -8, 80, 5); ctx.fillRect(-40, 4, 80, 4); }   // 삼겹살: 지방 줄무늬
  else if (k === 'm') { ell(-12, -2, 10, 5); ctx.fill(); ell(16, 4, 8, 4); ctx.fill(); }   // 목살: 마블링
  else for (let i = 0; i < 9; i++) { ell(-34 + (i * 37) % 70, -10 + (i * 13) % 22, 3, 2); ctx.fill(); }   // 항정살: 촘촘한 마블링
  if (p >= 1 && p <= 1.35) { ctx.strokeStyle = '#7a3d1d'; ctx.lineWidth = 3; for (let i = -1; i <= 1; i++) line(i * 22 - 8, -14, i * 22 + 8, 12); }   // 그릴 자국
  ctx.restore();
}
// 가게 정면 그림 (가게 등급이 오를수록 간판·등불이 화려해짐)
function tyDrawShop(x, y, w) {
  const r = tyRank();
  ctx.fillStyle = ['#8d2a2a', '#9c4a1a', '#6d4c41', '#4527a0', '#263238', '#b8860b'][r]; rr(x, y, w, 46, 10); ctx.fill();
  ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = r >= 3 ? 4 : 2; rr(x, y, w, 46, 10); ctx.stroke();
  txt(`${TY_RANK[r][0]} · 꿀꿀 포차`, x + w / 2, y + 24, 18, '#fff8e1', '#000', 4);
  for (let i = 0; i < 2 + r; i++) { const lx = x + 20 + i * (w - 40) / Math.max(1, 1 + r); ctx.fillStyle = `rgba(255,${110 + (i % 2) * 70},60,${0.6 + 0.3 * Math.sin(gT * 0.06 + i)})`; ell(lx, y + 64, 9, 12); ctx.fill(); }
}
function drawTycoon() {
  if (TY.phase === 'branch') { drawBranch(); return; }
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2b1420'); g.addColorStop(1, '#120a10');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 9; i++) { const x = 60 + i * 105; ctx.fillStyle = `rgba(255,${120 + (i % 2) * 60},60,${0.5 + 0.2 * Math.sin(gT * 0.05 + i)})`; ell(x, 18, 14, 18); ctx.fill(); }   // 포장마차 등불
  txt(`🪙 ${fmtN(coins)}`, W - 20, 50, 18, '#ffd740', '#000', 4, 'right');
  if (TY.phase !== 'play') {
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(14, 40, 80, 30, 8); ctx.fill(); txt('← 나가기', 54, 55, 13, '#fff', null);
    addHot(14, 40, 80, 30, () => { pressed.Escape = true; });
  }
  if (TY.phase === 'lobby') {
    // 왼쪽: 내 가게 현황
    const r = tyRank(), nx = TY_RANK[r + 1];
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; rr(20, 80, 420, 446, 14); ctx.fill();
    tyDrawShop(40, 92, 380);
    txt(`📅 ${tyU.shifts + 1}일차 영업 준비`, 40, 190, fitSize(`📅 ${tyU.shifts + 1}일차 영업 준비`, 18, 380), '#fff', null, 0, 'left');
    txt(nx ? `다음 가게 등급 ${nx[0]}까지 ${fmtN(nx[1] - tyU.total)}` : '최고 가게 등급!', 40, 216, fitSize(nx ? `다음 가게 등급 ${nx[0]}까지 ${fmtN(nx[1] - tyU.total)}` : '최고 가게 등급!', 13, 380), '#ffe082', null, 0, 'left');
    ctx.fillStyle = '#333'; ctx.fillRect(40, 226, 380, 8); ctx.fillStyle = '#ffd54f'; ctx.fillRect(40, 226, 380 * (nx ? clamp((tyU.total - TY_RANK[r][1]) / (nx[1] - TY_RANK[r][1])) : 1), 8);
    txt(`총매출 ${fmtN(tyU.total)} · 손님 ${fmtN(tyU.cust)}명 · 최고 하루 매출 ${fmtN(tyU.best)}`, 40, 254, fitSize(`총매출 ${fmtN(tyU.total)} · 손님 ${fmtN(tyU.cust)}명 · 최고 하루 매출 ${fmtN(tyU.best)}`, 13, 380), '#ddd', null, 0, 'left');
    // 최근 7일 순이익 그래프
    txt('📈 최근 영업 순이익', 40, 282, 13, '#bbb', null, 0, 'left');
    const hs = tyU.hist || [], mx = Math.max(1, ...hs.map(Math.abs));
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(40, 294, 380, 90);
    hs.forEach((v, i) => { const bh = 80 * Math.abs(v) / mx, bx = 50 + i * 53; ctx.fillStyle = v >= 0 ? '#66bb6a' : '#ef5350'; ctx.fillRect(bx, 380 - bh, 40, bh); txt(fmtN(v), bx + 20, 372 - bh, 10, '#fff', '#000', 2); });
    if (!hs.length) txt('아직 영업 기록이 없어요', 230, 340, 13, '#888', null);
    // 알바비 안내
    const ex = tyWage(1000 * 2 ** tyU.grade, 20);
    txt(`💸 알바비: 알바 ${tyU.staff}명${tyU.auto ? ' + 점장' : ''} · 경력 인상 +${Math.round((tyRaise() - 1) * 100)}%`, 40, 404, fitSize(`💸 알바비: 알바 ${tyU.staff}명${tyU.auto ? ' + 점장' : ''} · 경력 인상 +${Math.round((tyRaise() - 1) * 100)}%`, 13, 380), '#ffab91', null, 0, 'left');
    const chs = tyU.chains || [];
    txt(`⭐ 가게 별점 ${tyU.rating.toFixed(1)}  ·  🏢 체인점 ${tyU.chain}곳  ·  🐷 알바 ${tyU.staff}명`, 40, 452, fitSize(`⭐ 가게 별점 ${tyU.rating.toFixed(1)}  ·  🏢 체인점 ${tyU.chain}곳  ·  🐷 알바 ${tyU.staff}명`, 14, 380), '#ffe082', null, 0, 'left');
    const chTxt = chs.length ? chs.map(t => t + '점').join(' · ') : '체인점이 아직 없어요 (1억부터 열 수 있어요)';
    txt(chTxt, 40, 474, fitSize(chTxt, 12, 380), chs.length ? '#ce93d8' : '#888', null, 0, 'left');
    if (tyU.chain) txt(`체인점 수익: 영업마다 그날 매출 × ${(tyU.chain * 0.4).toFixed(1)}`, 40, 496, fitSize(`체인점 수익: 영업마다 그날 매출 × ${(tyU.chain * 0.4).toFixed(1)}`, 12, 380), '#b39ddb', null, 0, 'left');
    txt(`손님이 많을수록 알바비도 올라요 (예: 매출 ${fmtN(1000 * 2 ** tyU.grade)}·손님 20명 → ${fmtN(ex.total)})`, 40, 424, fitSize(`손님이 많을수록 알바비도 올라요 (예: 매출 ${fmtN(1000 * 2 ** tyU.grade)}·손님 20명 → ${fmtN(ex.total)})`, 12, 380), '#ccc', null, 0, 'left');
    // 오른쪽: 영업 시작 · 업그레이드 · 자동 영업
    const rows = [['🔔 영업 시작! (90초)', `1개당 ${tyKinds().map(k => `${TY_MEAT[k].name} ${fmtN(tyPrice(k))}`).join(' · ')}`, null]]
      .concat(TY_UP.map(u => { const l = tyU[u.id]; if (u.id === 'branch') return [`${u.name}  (${(tyU.chains || []).length}곳)`, u.desc(), null]; return [`${u.name}  Lv.${l}/${u.max}`, l >= u.max ? '최고 단계!' : u.desc(l), l >= u.max ? null : u.cost(l)]; }))
      .concat([[`🤖 자동 영업 ${tyU.auto ? 'ON' : 'OFF'} ${TOUCH ? '' : '[R]'}`, '점장이 다 하고 영업도 계속 이어서 (점장 월급: 매출의 5%)', null]]);
    const VIS = 11, off = clamp(TY.sel - 5, 0, Math.max(0, rows.length - VIS));   // 줄이 많으면 고른 줄 따라 스크롤
    if (off > 0) txt('▲', 698, 66, 12, '#ffcc80', null); if (off + VIS < rows.length) txt('▼', 698, 526, 12, '#ffcc80', null);
    rows.forEach(([a, b, c], i) => {
      if (i < off || i >= off + VIS) return;
      const y = 74 + (i - off) * 41, on = TY.sel === i, x = 456, last = i === rows.length - 1;
      ctx.fillStyle = on ? (i === 0 ? '#e53935' : 'rgba(255,145,0,0.5)') : last && tyU.auto ? 'rgba(67,160,71,0.55)' : 'rgba(255,255,255,0.08)'; rr(x, y, 484, 37, 9); ctx.fill();
      if (on) { ctx.strokeStyle = '#ffcc80'; ctx.lineWidth = 2; rr(x, y, 484, 37, 9); ctx.stroke(); }
      txt(a, x + 14, y + 12, fitSize(a, 13, c !== null ? 360 : 456), '#fff', null, 0, 'left'); txt(b, x + 14, y + 27, fitSize(b, 10, c !== null ? 340 : 450), '#ddd', null, 0, 'left');
      if (c !== null) txt(`${fmtN(c)}`, x + 470, y + 19, 15, coins >= c ? '#69f0ae' : '#ff8a80', null, 0, 'right');
      addHot(x, y, 484, 37, () => { TY.sel = i; pressed.Enter = true; });
    });
    txt(TOUCH ? '탭해서 시작·업그레이드' : 'W/S 고르기 · Enter 시작/구매 · R 자동 영업 · Esc 시장으로', 698, 538, 11, '#aaa', null);
    if (tyU.auto) txt(`🤖 자동 영업 ON: ${Math.ceil(Math.max(0, TY.autoT) / 60)}초 뒤 점장이 영업을 시작해요`, W / 2, 30, 16, '#69f0ae', '#000', 4);
    return;
  }
  if (TY.phase === 'result') {
    const w = TY.wage || { staff: 0, boss: 0, paid: 0 };
    const net = TY.earned - w.paid + TY.chainInc + TY.bonus - TY.fines;
    txt(`🏮 ${tyU.shifts}일차 영업 끝!`, W / 2, 96, 36, '#ffcc80', '#000', 7);
    if (TY.ev) txt(`오늘의 사건: ${TY.ev.name}`, W / 2, 128, 14, '#b3e5fc', null);
    txt(`매출 +${fmtN(TY.earned)}${TY.chainInc ? `  ·  🏢 체인점 ${tyU.chain}곳 +${fmtN(TY.chainInc)}` : ''}`, W / 2, 156, 22, '#ffd740', '#000', 5);
    txt(`🎯 목표 ${fmtN(TY.goal)} ${TY.bonus ? `달성! 보너스 +${fmtN(TY.bonus)}` : '못 넘었어요'}`, W / 2, 186, 15, TY.bonus ? '#69f0ae' : '#bbb', null);
    txt(`💸 알바비 -${fmtN(w.staff)}${w.boss ? ` · 점장 월급 -${fmtN(w.boss)}` : ''}${TY.fines ? ` · 🧽 벌금 -${fmtN(TY.fines)}` : ''}`, W / 2, 212, 16, '#ff8a80', '#000', 4);
    txt(`순이익 ${fmtN(net)}`, W / 2, 250, 30, net >= 0 ? '#69f0ae' : '#ff8a80', '#000', 5);
    txt(`서빙 ${TY.served}명${TY.vip ? ` (👑VIP ${TY.vip})` : ''} · 놓친 손님 ${TY.missed}명 · 태운 것 ${TY.burnt}개`, W / 2, 290, 15, '#fff', null);
    txt(`⭐ 오늘 별점 ${tyStarAvg().toFixed(1)} → 가게 별점 ${tyU.rating.toFixed(1)}`, W / 2, 314, 15, '#ffe082', null);
    if (TY.earned >= tyU.best && TY.earned > 0) txt('🏆 최고 매출 갱신!', W / 2, 340, 17, '#69f0ae', '#000', 4);
    txt(`가게 등급 ${TY_RANK[tyRank()][0]} · 남은 사채 ${fmtN(Math.max(0, debt))} (🏦 은행에서 갚기)`, W / 2, 364, 13, '#ffab91', null);
    ctx.fillStyle = '#e53935'; rr(W / 2 - 120, 380, 240, 50, 12); ctx.fill(); txt('확인', W / 2, 405, 20, '#fff', null);
    addHot(W / 2 - 120, 380, 240, 50, () => { pressed.Enter = true; });
    if (tyU.auto) txt(`🤖 자동 영업: ${Math.ceil(TY.autoT / 60)}초 뒤 다음 영업 시작 · Esc로 자동 끄기`, W / 2, 458, 14, '#69f0ae', null);
    return;
  }
  // ---- 영업 중 화면 ----
  const sec = Math.ceil(TY.left / 60);
  txt(`⏰ ${sec}초 · ${tyU.shifts + 1}일차`, 20, 50, 18, sec <= 10 && gT % 30 < 15 ? '#ff5252' : '#fff', '#000', 4, 'left');
  txt(`오늘 매출 ${fmtN(TY.earned)} / 🎯${fmtN(TY.goal)}${TY.earned >= TY.goal ? ' ✅' : ''}${TY.combo > 1 ? ` · 🔥${TY.combo}연속` : ''}`, W / 2, 50, 17, TY.earned >= TY.goal ? '#69f0ae' : '#ffd740', '#000', 4);
  ctx.fillStyle = '#333'; ctx.fillRect(W / 2 - 110, 62, 220, 4); ctx.fillStyle = TY.earned >= TY.goal ? '#69f0ae' : '#ffd740'; ctx.fillRect(W / 2 - 110, 62, 220 * clamp(TY.earned / TY.goal), 4);
  if (TY.ev) txt(TY.ev.name, 20, 72, 12, '#b3e5fc', '#000', 3, 'left');
  ctx.fillStyle = tyU.auto ? '#43a047' : 'rgba(255,255,255,0.15)'; rr(W - 250, 36, 110, 28, 8); ctx.fill();
  txt(`🤖 자동 ${tyU.auto ? 'ON' : 'OFF'}`, W - 195, 50, 13, '#fff', null);
  addHot(W - 250, 36, 110, 28, () => { pressed.KeyR = true; });
  if (tyU.auto) txt('🤖 점장이 굽고·집고·서빙하는 중 (그냥 보고 있어도 돼요)', W / 2, 22, 13, gT % 60 < 40 ? '#69f0ae' : '#2e7d32', '#000', 3);
  // 손님 자리 4개 (새 손님은 오른쪽에서 걸어 들어옴)
  for (let s = 0; s < 4; s++) { ctx.fillStyle = 'rgba(255,255,255,0.05)'; rr(tySeatX(s) - 95, 70, 190, 180, 14); ctx.fill(); }
  TY.cust.forEach((c, j) => {
    const x = tySeatX(c.seat) + (1 - clamp(c.t / 30)) * 260, k = c.pat / c.max, ready = tyReady(c);
    drawPig(x - 40, 238, 1, c.look, { scale: 0.42, t: gT + c.seat * 20, hurt: k < 0.25 && gT % 40 < 20, walk: c.t < 30, aura: c.vip ? '#ffd700' : null });
    if (c.vip) txt('👑', x - 40, 158, 22, '#fff', null);
    ctx.fillStyle = ready ? '#fffde7' : '#fff'; rr(x - 10, 82, 100, 74, 10); ctx.fill();
    if (ready || c.vip) { ctx.strokeStyle = c.vip ? '#ffb300' : '#43a047'; ctx.lineWidth = 3; rr(x - 10, 82, 100, 74, 10); ctx.stroke(); }
    tyDrawMeat(c.k, 1.1, x + 40, 106, 0.5);
    txt(`${TY_MEAT[c.k].name} ×${c.n}`, x + 40, 138, 14, '#3e2723', null);
    if (c.side) { ctx.globalAlpha = tySideOk(c) ? 1 : 0.45; txt(`+${TY_SIDE[c.side].icon}`, x + 74, 96, 17, '#000', null); ctx.globalAlpha = 1; }
    ctx.fillStyle = '#333'; ctx.fillRect(x - 80, 252, 160, 8);
    ctx.fillStyle = k > 0.5 ? '#66bb6a' : k > 0.25 ? '#ffca28' : '#ef5350'; ctx.fillRect(x - 80, 252, 160 * k, 8);
    if (!TOUCH) txt(['A', 'S', 'D', 'F'][c.seat], tySeatX(c.seat) + 80, 76, 12, '#aaa', null);
    addHot(tySeatX(c.seat) - 95, 70, 190, 190, () => tyServe(j));
  });
  ctx.fillStyle = '#5d4037'; ctx.fillRect(0, 268, W, 12);   // 카운터
  // 왼쪽: 다 구운 고기 접시
  const ks = tyKinds(), gap = ks.length === 3 ? 72 : 90;
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; rr(20, 290, 240, 236, 14); ctx.fill();
  txt('🍽️ 다 구운 고기', 140, 306, 15, '#ffe0b2', null);
  ks.forEach((k, r) => {
    const tr = TY.tray[k], y = (ks.length === 3 ? 330 : 350) + r * gap;
    ctx.fillStyle = '#eceff1'; ell(140, y + 12, 100, ks.length === 3 ? 22 : 30); ctx.fill();
    for (let i = 0; i < Math.min(6, tr.length); i++) tyDrawMeat(k, 1.1, 80 + i * 24, y + 8 - (i % 2) * 6, 0.4);
    const pf = tr.filter(q => q > 1.2).length;
    txt(`${TY_MEAT[k].name} ${tr.length}개${pf ? ` (✨${pf})` : ''}`, 140, y + (ks.length === 3 ? 42 : 56), 13, '#fff', '#000', 3);
  });
  // 가운데: 불판
  ctx.fillStyle = '#212121'; rr(268, 274, 494, 256, 16); ctx.fill();
  TY.slots.forEach((c, i) => {
    const [x, y] = tySlotXY(i);
    ctx.fillStyle = '#3e2723'; rr(x - 60, y - 40, 120, 84, 10); ctx.fill();
    ctx.strokeStyle = '#616161'; ctx.lineWidth = 2; for (let j = -2; j <= 2; j++) line(x - 54, y + j * 14, x + 54, y + j * 14);
    if (c) {
      tyDrawMeat(c.k, c.p, x, y);
      const bw = 100, bx = x - 50, by = y + 30;   // 익힘 막대 (노란 칸 = 완벽 타이밍)
      ctx.fillStyle = '#111'; ctx.fillRect(bx, by, bw, 7);
      ctx.fillStyle = 'rgba(255,215,64,0.5)'; ctx.fillRect(bx + bw * 1 / 1.7, by, bw * 0.35 / 1.7, 7);
      ctx.fillStyle = c.p > 1.6 ? '#000' : c.p >= 1 ? '#ffd740' : '#ff8a65'; ctx.fillRect(bx, by, bw * clamp(c.p / 1.7), 7);
      if (c.p >= 1 && c.p <= 1.35 && gT % 20 < 10) txt('지금!', x, y - 32, 13, '#ffd740', '#000', 3);
      if (c.p > 1.6) txt('탔다!', x, y - 32, 13, '#bbb', '#000', 3);
    } else txt(`+ ${TY_MEAT[TY.meat].name}`, x, y, 13, 'rgba(255,255,255,0.45)', null);
    if (!TOUCH) txt(String(i + 1), x - 50, y - 30, 11, '#999', null);
    addHot(x - 60, y - 40, 120, 84, () => tySlot(i));
  });
  // 불판 오른쪽: 사이드 메뉴 칸 (냄비 · 음료 냉장고)
  const sx0 = 672, sw0 = 84;
  if (!tyU.side) { ctx.fillStyle = 'rgba(255,255,255,0.05)'; rr(sx0, 280, sw0, 244, 10); ctx.fill(); txt('🔒', sx0 + 42, 380, 22, '#fff', null); txt('사이드 메뉴', sx0 + 42, 410, 11, '#aaa', null); txt('업그레이드', sx0 + 42, 426, 11, '#aaa', null); }
  tyPots().forEach((k, i) => {
    const s = TY_SIDE[k], p = TY.pots[k], y = 280 + i * 62, cx = sx0 + sw0 / 2, done = p && p.p >= 1, over = p && p.p > 1.8;
    ctx.fillStyle = done && gT % 20 < 10 ? '#5d4037' : '#3e2723'; rr(sx0, y, sw0, 56, 10); ctx.fill();
    ctx.fillStyle = '#9e9e9e'; ell(cx, y + 26, 26, 14); ctx.fill();   // 냄비
    if (p) {
      ctx.fillStyle = { stew: '#a1662f', egg: '#ffe082', noodle: '#8d6e63' }[k]; ell(cx, y + 24, 21, 10); ctx.fill();
      if (gT % 12 < 6) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ell(cx - 8 + (gT % 24) / 2, y + 22, 3, 2); ctx.fill(); }   // 보글보글
      if (gT % 8 === 0) smoke(cx + rand(-10, 10), y + 10, over ? '90,90,90' : '230,230,230');
      ctx.fillStyle = '#111'; ctx.fillRect(sx0 + 6, y + 46, sw0 - 12, 5);
      ctx.fillStyle = over ? '#ef5350' : done ? '#69f0ae' : '#ff8a65'; ctx.fillRect(sx0 + 6, y + 46, (sw0 - 12) * clamp(p.p / 2.2), 5);
      if (done) txt(over ? '넘친다!' : '다 됐다!', cx, y + 8, 11, over ? '#ff8a80' : '#69f0ae', '#000', 3);
    } else txt('+ 끓이기', cx, y + 26, 10, 'rgba(255,255,255,0.6)', null);
    txt(`${s.icon}${TY.sideStock[k]}`, sx0 + 6, y + 9, 12, '#fff', '#000', 3, 'left');
    if (!TOUCH) txt(s.key, sx0 + sw0 - 8, y + 9, 10, '#999', null);
    addHot(sx0, y, sw0, 56, () => tyPot(k));
  });
  if (tyU.side) { const y = 280 + tyPots().length * 62; ctx.fillStyle = 'rgba(33,150,243,0.25)'; rr(sx0, y, sw0, 40, 10); ctx.fill(); txt('🍺 음료', sx0 + 42, y + 13, 12, '#fff', null); txt('바로 나가요', sx0 + 42, y + 29, 10, '#bbdefb', null); }
  // 오른쪽: 올릴 고기 고르기
  const bh = ks.length === 3 ? 58 : 80;
  ks.forEach((k, r) => {
    const x = 780, y = 290 + r * (bh + 6), on = TY.meat === k;
    ctx.fillStyle = on ? '#ef6c00' : 'rgba(255,255,255,0.1)'; rr(x, y, 160, bh, 12); ctx.fill();
    if (on) { ctx.strokeStyle = '#ffe0b2'; ctx.lineWidth = 3; rr(x, y, 160, bh, 12); ctx.stroke(); }
    tyDrawMeat(k, 0, x + 80, y + bh * 0.35, bh / 130);
    txt(`${TOUCH ? '' : ['[Q] ', '[E] ', '[W] '][r]}${TY_MEAT[k].name} ${fmtN(tyPrice(k))}`, x + 80, y + bh - 14, 12, '#fff', null);
    addHot(x, y, 160, bh, () => { TY.meat = k; SFX.select(); });
  });
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(780, 484, 160, 40, 10); ctx.fill(); txt('영업 끝내기', 860, 504, 14, '#fff', null);
  addHot(780, 484, 160, 40, () => { pressed.Escape = true; });
  if (TY.banner > 0) {   // 영업 시작 안내
    ctx.globalAlpha = clamp(TY.banner / 30); ctx.fillStyle = 'rgba(0,0,0,0.75)'; rr(W / 2 - 240, 140, 480, TY.ev ? 104 : 80, 14); ctx.fill();
    txt(`☀️ ${tyU.shifts + 1}일차 영업 시작!`, W / 2, 166, 26, '#ffd740', '#000', 5);
    txt(`🎯 오늘 목표 ${fmtN(TY.goal)} · 넘기면 보너스!`, W / 2, 194, 13, '#69f0ae', null);
    txt(tyU.auto ? '🤖 점장이 알아서 장사해요' : '고기를 굽고, 익으면 집고, 손님을 눌러 서빙!', W / 2, 214, 13, '#fff', null);
    if (TY.ev) txt(`${TY.ev.name}: ${TY.ev.desc}`, W / 2, 234, 14, '#b3e5fc', null);
    ctx.globalAlpha = 1;
  }
  drawParts();
}
// ================= 요리 그림: 요리 이름마다 생김새가 전부 다름 =================
// (전에는 조리법 5가지로만 그려서 삼겹살 구이·등심 구이·목살 스테이크·항정살 구이·돼지갈비가 똑같이 보였음)
// 좌표는 접시 위 약 ±110 × ±45 기준. 아이콘·선택 카드·완성 접시가 모두 같은 그림을 크기만 바꿔서 씀
const DC = { grill: '#9c4e26', lean: '#b9734a', fatRim: '#f3d9a8', golden: '#d98a1c', goldenHi: '#f6c05a', red: '#b3281b',
  dark: '#4e2310', darkHi: '#7a3d1d', bone: '#f5ecd8', boneE: '#cdbb98' };
function blob(x, y, rx, ry, rot, c, hi) {   // 둥근 덩어리(튀김·고기): 그림자 + 둥근 입체 그라데이션 + 테두리 + 빛 반사
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ell(x + 2, y + 3, rx, ry, rot); ctx.fill();
  const g = ctx.createRadialGradient(x - rx * 0.35, y - ry * 0.4, 1, x, y, Math.max(rx, ry) * 1.1);
  g.addColorStop(0, shadeHex(hi || c, 1.15)); g.addColorStop(0.55, c); g.addColorStop(1, shadeHex(c, 0.7));
  ctx.fillStyle = g; ell(x, y, rx, ry, rot); ctx.fill(); ctx.strokeStyle = shadeHex(c, 0.55); ctx.lineWidth = 1.3; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ell(x - rx * 0.3, y - ry * 0.45, rx * 0.3, ry * 0.18, rot); ctx.fill();
}
function slab(x, y, w, h, rot, c, o = {}) {   // 고기 한 조각: 그림자 + 위는 밝고 아래는 어두운 입체감 + 테두리 (+ 지방·속살·그릴 자국·마블링·튀김옷·윤기)
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const r = Math.min(w, h) * 0.3;
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; rr(-w / 2 + 2, -h / 2 + 3, w, h, r); ctx.fill();
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, shadeHex(c, 1.2)); g.addColorStop(1, shadeHex(c, 0.78));
  ctx.fillStyle = g; rr(-w / 2, -h / 2, w, h, r); ctx.fill();
  ctx.strokeStyle = shadeHex(c, 0.55); ctx.lineWidth = 1.4; ctx.stroke();
  ctx.save(); rr(-w / 2, -h / 2, w, h, r); ctx.clip();   // 자국·마블링이 고기 밖으로 안 나가게
  if (o.rim) { ctx.fillStyle = o.rim; rr(-w / 2, -h / 2, w, h * 0.24, Math.min(r, h * 0.12)); ctx.fill(); }
  if (o.inner) { ctx.fillStyle = o.inner; rr(-w * 0.36, -h * 0.2, w * 0.72, h * 0.45, 3); ctx.fill(); }
  if (o.marble) { ctx.strokeStyle = 'rgba(255,232,200,0.6)'; ctx.lineWidth = 1.6; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-w * 0.4, -h * 0.3 + i * h * 0.2); ctx.quadraticCurveTo(0, -h * 0.12 + i * h * 0.18, w * 0.4, -h * 0.26 + i * h * 0.2); ctx.stroke(); } }
  if (o.marks) {
    ctx.strokeStyle = 'rgba(40,15,5,0.6)'; ctx.lineWidth = Math.max(2, h * 0.12); for (let i = -1; i <= 1; i++) line(i * w * 0.28 - h * 0.3, h / 2 - 2, i * w * 0.28 + h * 0.3, -h / 2 + 2);
    ctx.fillStyle = 'rgba(50,20,5,0.35)'; for (let i = 0; i < 8; i++) { ell(Math.sin(i * 2.7) * w * 0.4, Math.cos(i * 1.9) * h * 0.35, 1.6, 1.2); ctx.fill(); }   // 탄 자국 점
  }
  if (o.crumb) { ctx.fillStyle = 'rgba(255,236,170,0.75)'; for (let i = 0; i < Math.round(w * h / 60); i++) { ell(Math.sin(i * 2.3) * w * 0.45, Math.cos(i * 1.7) * h * 0.42, 1.6, 1.2, i); ctx.fill(); } }   // 바삭한 튀김옷
  if (o.gloss) { ctx.fillStyle = 'rgba(255,255,255,0.32)'; rr(-w * 0.35, -h * 0.38, w * 0.4, h * 0.16, 2); ctx.fill(); }
  ctx.restore(); ctx.restore();
}
function boneStick(x1, y1, x2, y2, w = 7) {
  ctx.lineCap = 'round'; ctx.strokeStyle = DC.boneE; ctx.lineWidth = w + 3; line(x1, y1, x2, y2);
  ctx.strokeStyle = DC.bone; ctx.lineWidth = w; line(x1, y1, x2, y2); ctx.fillStyle = DC.bone; ell(x2, y2, w * 0.9, w * 0.9); ctx.fill();
}
function greenOnion(x, y, n = 6, sp = 28) { for (let i = 0; i < n; i++) { ctx.fillStyle = i % 2 ? '#7cb342' : '#aed581'; ell(x + Math.sin(i * 2.3) * sp, y + Math.cos(i * 1.7) * sp * 0.35, 5, 2.5, i); ctx.fill(); } }
function sesame(x, y, n = 10, sp = 40) { ctx.fillStyle = '#fff8e1'; for (let i = 0; i < n; i++) { ell(x + Math.sin(i * 3.1) * sp, y + Math.cos(i * 2.3) * sp * 0.35, 1.8, 1.1, i); ctx.fill(); } }
function dipBowl(x, y, c, s = 1) { ctx.fillStyle = '#fafafa'; ell(x, y, 18 * s, 9 * s); ctx.fill(); ctx.strokeStyle = '#bdbdbd'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = c; ell(x, y, 13 * s, 6 * s); ctx.fill(); }
function drizzle(pts, c, w = 4) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.stroke(); }
const DISH_ART = {
  '삼겹살 구이'() {   // 층층이 기름층 보이는 삼겹 6줄 + 마늘
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) drawStrip(-100 + c * 58 + r * 14, -30 + r * 26, 52, 20, 1, 1);
    for (let i = 0; i < 4; i++) { ctx.fillStyle = '#fff3e0'; ell(86 + (i % 2) * 12, -22 + i * 11, 7, 5); ctx.fill(); ctx.fillStyle = '#ffcc80'; ell(86 + (i % 2) * 12, -22 + i * 11, 3, 2); ctx.fill(); }
  },
  '보쌈'() { drawSliceFan(-25, 52, 8, 0.5, '#d9b8a0', '#f3e3d8'); drawKimchi(84, -4, 0.68); },
  '삼겹 튀김'() { for (let i = 0; i < 5; i++) slab(-72 + i * 34, (i % 2) * 10 - 5, 26, 66, 0.25, DC.golden, { crumb: true, gloss: true }); dipBowl(98, 22, '#ffcc80', 0.9); },
  '목살 스테이크'() {   // 두툼한 스테이크 한 덩이 + 마블링 + 허브
    slab(-14, 0, 150, 78, -0.08, DC.grill, { marks: true, marble: true });
    ctx.strokeStyle = '#558b2f'; ctx.lineWidth = 3; line(68, -26, 104, -42);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = '#689f38'; ell(72 + i * 6, -30 - i * 2.5, 5, 1.8, -0.5); ctx.fill(); }
  },
  '제육볶음'() { for (let i = 0; i < 14; i++) drawChunk(Math.sin(i * 2.7) * 72, Math.cos(i * 1.9) * 16 - (i % 3) * 5, i, 1, 1); greenOnion(0, -8, 8, 60); sesame(0, 0, 12, 60); },
  '목살 탕수육'() {   // 둥근 튀김 + 주황 소스 + 채소
    for (let i = 0; i < 9; i++) blob(-64 + (i % 5) * 30 + (i > 4 ? 15 : 0), i > 4 ? 16 : -10, 16, 12, i, DC.golden, DC.goldenHi);
    drizzle([[-84, -22], [-44, 10], [0, -18], [42, 12], [84, -14]], 'rgba(255,112,67,0.9)', 7);
    ctx.fillStyle = '#66bb6a'; ell(-22, -2, 7, 3.5, 0.5); ctx.fill(); ctx.fillStyle = '#ffa726'; ell(32, 2, 6, 3.5, -0.3); ctx.fill();
  },
  '돈까스'() { ctx.strokeStyle = '#c5e1a5'; ctx.lineWidth = 2; for (let i = 0; i < 12; i++) line(-112 + i * 3, -18, -86 + i * 2.5, 16); drawCutlet(22, -4, 1, true, 0.74); },
  '등심 구이'() {   // 기름 적은 등심을 가지런히(지방은 가장자리 한 줄만) + 버섯
    for (let i = 0; i < 4; i++) slab(-80 + i * 46, (i % 2) * 8 - 4, 40, 62, 0.12, DC.lean, { rim: DC.fatRim, marks: true });
    ctx.fillStyle = '#8d6e63'; ell(98, -12, 13, 9); ctx.fill(); ctx.fillStyle = '#d7ccc8'; ctx.fillRect(94, -6, 8, 13);
  },
  '등심 장조림'() {   // 간장 국물 + 잘게 찢은 고기 + 메추리알
    ctx.fillStyle = 'rgba(93,50,20,0.85)'; ell(-10, 8, 108, 34); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ell(-40, -6, 50, 8, -0.1); ctx.fill();   // 국물 윤기
    for (let i = 0; i < 16; i++) slab(-74 + (i % 8) * 18, -6 + (i > 7 ? 16 : 0), 8, 24, (i % 3 - 1) * 0.4, '#6d3a1a');
    for (const [ex, ey, s] of [[70, -4, 1], [46, 18, 0.85]]) { ctx.fillStyle = '#7a4a22'; ell(ex, ey, 15 * s, 12 * s); ctx.fill(); ctx.fillStyle = '#ffb300'; ell(ex + 1, ey + 1, 7 * s, 6 * s); ctx.fill(); }
  },
  '수육'() { for (let i = 0; i < 7; i++) slab(-84 + i * 22, 0, 30, 72, 0, '#e8cbb5', { rim: '#c99a7c' }); dipBowl(98, 22, '#f8bbd0'); },   // 가지런히 썬 수육 + 새우젓
  '앞다리 돈까스'() {   // 썰지 않은 통 돈까스 + 케첩 + 주먹밥
    ctx.save(); ctx.translate(-14, 0); ctx.scale(0.82, 0.95); drawCutlet(0, 0, 1, false, 0.72); ctx.restore();
    drizzle([[-66, -14], [-36, 6], [-6, -12], [24, 6], [48, -10]], '#c62828', 5);
    ctx.fillStyle = '#fafafa'; ell(96, 6, 20, 17); ctx.fill(); ctx.strokeStyle = '#bdbdbd'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#263238'; ctx.fillRect(87, 10, 18, 12);   // 주먹밥(테두리) + 김
  },
  '족발'() { drawSliceFan(-25, 52, 8, 0.5, DC.dark, DC.darkHi); boneStick(66, 24, 100, -24, 13); },
  '불족발 볶음'() {   // 빨간 양념 족발 조각 + 고추 + 깨
    for (let i = 0; i < 8; i++) slab(-72 + (i % 4) * 42, i > 3 ? 16 : -14, 36, 24, i % 2 ? 0.3 : -0.2, DC.red, { rim: '#5d1a10', gloss: true });
    for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#d32f2f' : '#43a047'; ell(-64 + i * 32, -2, 6, 2.5, i); ctx.fill(); }
    sesame(0, 0, 14, 72);
  },
  '족발 튀김'() { for (let i = 0; i < 4; i++) { const x = -64 + i * 40, y = (i % 2) * 12 - 4; blob(x, y, 20, 17, i, DC.golden, DC.goldenHi); boneStick(x + 10, y - 10, x + 22, y - 26, 5); } dipBowl(98, 20, '#9e9e9e', 0.8); },
  '돼지갈비'() { for (let i = 0; i < 3; i++) { const y = -26 + i * 26; boneStick(-96, y, -74, y, 8); slab(-12, y, 124, 20, 0, '#7b3214', { marks: true, gloss: true }); } },   // 뼈 붙은 갈비 3대
  '갈비찜'() {   // 진한 국물 + 뼈 갈비 덩어리 + 당근·밤
    ctx.fillStyle = 'rgba(78,35,16,0.9)'; ell(0, 6, 112, 38); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.16)'; ell(-30, -8, 55, 9, -0.1); ctx.fill();   // 국물 윤기
    for (let i = 0; i < 6; i++) { const x = -62 + i * 25, y = (i % 2) * 12 - 6; blob(x, y, 15, 12, i, '#5d2810', '#8a4a24'); boneStick(x - 4, y - 10, x + 4, y - 22, 5); }
    ctx.fillStyle = '#ef6c00'; ell(72, -8, 10, 7); ctx.fill(); ell(-84, 14, 9, 6); ctx.fill(); ctx.fillStyle = '#ffe0b2'; ell(42, 18, 8, 7); ctx.fill();
  },
  '갈비 튀김'() { for (let i = 0; i < 4; i++) { const y = -26 + i * 17; slab(-8, y, 102, 14, 0.05, DC.golden, { crumb: true, gloss: true }); boneStick(48, y, 74, y, 6); } greenOnion(-64, 28, 5, 20); },
  '항정살 구이'() {   // 얇고 하얀 항정살 + 옅은 그릴 자국 + 소금
    for (let i = 0; i < 6; i++) slab(-74 + (i % 3) * 48, i > 2 ? 16 : -14, 42, 22, i % 2 ? 0.15 : -0.1, '#d8a07a', { inner: '#f3d1b0', marks: true });
    ctx.fillStyle = '#e0e0e0'; ell(98, 0, 15, 10); ctx.fill(); ctx.fillStyle = '#fff'; ell(98, -2, 10, 5); ctx.fill();
  },
  '항정 볶음'() { for (let i = 0; i < 10; i++) slab(Math.sin(i * 2.1) * 72, Math.cos(i * 1.6) * 14, 34, 14, i, '#a1683f', { gloss: true }); ctx.strokeStyle = '#fff9c4'; ctx.lineWidth = 2.5; for (let i = 0; i < 10; i++) line(-84 + i * 17, -10 + (i % 3) * 8, -74 + i * 17, 4 + (i % 3) * 8); },   // 간장 볶음 + 숙주
  '항정 수육'() { for (let i = 0; i < 6; i++) { const x = -78 + i * 30; ctx.fillStyle = '#f3e3d8'; ell(x, 0, 13, 20); ctx.fill(); ctx.strokeStyle = '#d7b9a5'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, 0, 7, 0, 5); ctx.stroke(); } dipBowl(98, 18, '#fdd835', 0.8); },   // 돌돌 만 수육 + 겨자
};
function drawDishArt(name, method, x, y, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  const f = DISH_ART[name];
  if (f) f(); else drawDishIcon(method, 0, 0, 4);   // 목록에 없는 요리는 조리법 그림
  if (sc >= 0.5) {   // 크게 그릴 때(선택 카드·완성 접시)만: 모락모락 김
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const sx = -50 + i * 50, ph = gT * 0.06 + i * 2;
      ctx.beginPath(); ctx.moveTo(sx, -40);
      for (let k = 1; k <= 6; k++) ctx.lineTo(sx + Math.sin(ph + k * 0.9) * 7, -40 - k * 9);
      ctx.stroke();
    }
  }
  ctx.restore();
}
function drawDishIcon(k, x, y, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  if (k === 'grill') { drawStrip(-26, -12, 24, 12, 1, 1); drawStrip(2, -4, 24, 12, 1, 1); }
  else if (k === 'fry') drawCutlet(0, 0, 1, true, 0.3);
  else if (k === 'wok') for (let j = 0; j < 6; j++) drawChunk(Math.sin(j * 2.7) * 16, Math.cos(j * 1.9) * 6, j, 1, 1);
  else drawSliceFan(0, 22, 5, 0.22, k === 'braise' ? '#4e2310' : '#d9b8a0', k === 'braise' ? '#8d5a3a' : '#f3e3d8');
  ctx.restore();
}
function drawMarket() {
  drawStage(); ctx.fillStyle = 'rgba(15,8,25,0.78)'; ctx.fillRect(0, 0, W, H);
  txt('🏮 포장마차 시장', W / 2, 34, 32, '#ffcc80', '#000', 6);
  txt(`🪙 ${fmtN(coins)} 코인`, W - 24, 34, 20, '#ffd740', '#000', 4, 'right');
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(14, 18, 80, 32, 8); ctx.fill(); txt('← 나가기', 54, 34, 13, '#fff', null);
  addHot(14, 18, 80, 32, () => { pressed.Escape = true; });
  ['🧊 냉장고 (요리 팔기)', '🛒 상점 (코인 쓰기)', '🔥 장사하기 (돈 벌기!)'].forEach((s, i) => {
    const x = W / 2 - 375 + i * 250, on = mk.tab === i;
    ctx.fillStyle = on ? '#ff7043' : i === 2 ? (gT % 60 < 30 ? '#c62828' : '#e53935') : 'rgba(255,255,255,0.12)'; rr(x, 60, 240, 38, 10); ctx.fill();
    txt(`[${i + 1}] ${s}`, x + 120, 79, 15, '#fff', null);
    addHot(x, 60, 240, 38, () => { pressed['Digit' + (i + 1)] = true; });
  });
  const per = marketPeriod();
  if (mk.tab === 0) {
    const left = MARKET_MS - (Date.now() % MARKET_MS), mm = Math.floor(left / 60000), ss = Math.floor(left / 1000) % 60;
    txt(`시세 변동까지 ${mm}:${String(ss).padStart(2, '0')}  ·  🔥 지금 인기: ${METHODS[hotMethod(per)].label} 요리 ×1.8`, W / 2, 118, 15, '#fff59d', null);
    if (!fridge.length) {
      txt('냉장고가 비었어요', W / 2, 260, 26, '#fff', '#000', 5);
      txt('연승 모드나 온라인에서 이기면, 진 돼지로 만든 요리가 여기 들어와요!', W / 2, 300, 16, '#ccc', null);
      return;
    }
    const top = clamp(mk.sel - 4, 0, Math.max(0, fridge.length - 8));
    for (let r = 0; r < 8 && top + r < fridge.length; r++) {
      const i = top + r, d = fridge[i], y = 136 + r * 42, on = mk.sel === i;
      const p = dishPrice(d, per), pp = dishPrice(d, per - 1);
      ctx.fillStyle = on ? 'rgba(120,70,40,0.92)' : 'rgba(25,12,40,0.85)'; rr(80, y, 800, 38, 8); ctx.fill();
      addHot(80, y, 680, 38, () => { mk.sel = i; });
      drawDishArt(d.n, d.k, 120, y + 19, 0.2);
      txt(d.n, 170, y + 19, 18, '#fff', null, 0, 'left');
      txt(`${'★'.repeat(d.s)}${'☆'.repeat(5 - d.s)}`, 400, y + 19, 15, '#ffd54f', null);
      txt(`${d.m} · ${METHODS[d.k].label}${d.f === 1 ? ' · 모험' : ''}`, 530, y + 19, 13, '#bbb', null);
      txt(`${fmtN(p)}코인 ${p > pp ? '▲' : p < pp ? '▼' : '-'}`, 660, y + 19, 17, p > pp ? '#69f0ae' : p < pp ? '#ff8a80' : '#fff', null);
      ctx.fillStyle = '#43a047'; rr(770, y + 5, 100, 28, 8); ctx.fill(); txt('팔기', 820, y + 19, 15, '#fff', null);
      addHot(770, y + 5, 100, 28, () => { mk.sel = i; pressed.Enter = true; });
    }
    const total = fridge.reduce((s, d) => s + dishPrice(d, per), 0);
    ctx.fillStyle = '#ef6c00'; rr(W / 2 - 150, 486, 300, 40, 10); ctx.fill(); txt(`[X] 전부 팔기 (+${fmtN(total)} 코인)`, W / 2, 506, 17, '#fff', null);
    addHot(W / 2 - 150, 486, 300, 40, () => { pressed.KeyX = true; });
  } else {
    txt(`보유: 필살50% ${inv.use.meter || 0} · 강철체력 ${inv.use.hpup || 0} · 부활권 ${inv.use.revive || 0}   (꾸미기는 내 돼지에게 표시, 온라인 상대에게도 보여요)`, W / 2, 118, 13, '#fff59d', null);
    const SROWS = 5, SHOFF = clamp((mk.sel / 4 | 0) - 2, 0, Math.max(0, Math.ceil(SHOP.length / 4) - SROWS));   // 물건이 많아서 고른 줄 따라 스크롤
    if (SHOFF > 0) { txt('▲', W - 30, 150, 22, '#ffcc80', '#000', 4); addHot(W - 50, 130, 40, 40, () => { mk.sel = Math.max(0, mk.sel - 4); }); }
    if (SHOFF + SROWS < Math.ceil(SHOP.length / 4)) { txt('▼', W - 30, 480, 22, '#ffcc80', '#000', 4); addHot(W - 50, 460, 40, 40, () => { mk.sel = Math.min(SHOP.length - 1, mk.sel + 4); }); }
    mk.offS = mk.offS == null ? SHOFF : mk.offS + (SHOFF - mk.offS) * 0.22; if (Math.abs(mk.offS - SHOFF) < 0.01) mk.offS = SHOFF;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 130, W, SROWS * 78); ctx.clip();
    SHOP.forEach((it, i) => {
      const rowS = (i / 4 | 0) - mk.offS; if (rowS <= -1 || rowS >= SROWS) return;
      const CH = 72, x = 70 + (i % 4) * 208, y = 134 + rowS * (CH + 6), on = mk.sel === i, own = !!inv.own[it.id], eq = inv.eq[it.type] === it.id;
      ctx.fillStyle = on ? 'rgba(120,70,40,0.92)' : 'rgba(25,12,40,0.85)'; rr(x, y, 196, CH, 12); ctx.fill();
      if (on) { ctx.strokeStyle = '#ffcc80'; ctx.lineWidth = 2; rr(x, y, 196, CH, 12); ctx.stroke(); }
      if (rowS > -0.5 && rowS < SROWS - 0.5) addHot(x, y, 196, CH, () => { if (mk.sel === i) pressed.Enter = true; else mk.sel = i; });
      if (it.type === 'use') txt(USE_ICON[it.id] || '🎁', x + 44, y + CH / 2 - 4, 34, '#fff', null);
      else if (it.type === 'title') { txt('🏷️', x + 44, y + CH / 2 - 4, 30, '#fff', null); }
      else { const lk = { ...CHARS[0].look, hat: it.type === 'hat' ? it.id : null, fx: it.type === 'fx' ? it.id : null, ...(it.type === 'skin' ? { ...SKIN_DEF[it.id].pal, skin: it.id } : {}) }; ctx.save(); ctx.beginPath(); ctx.rect(x, y, 100, CH); ctx.clip(); drawPig(x + 40, y + CH - 8, 1, lk, { scale: 0.55, t: gT }); ctx.restore(); }
      txt(it.name, x + 145, y + CH * 0.25, fitSize(it.name, 15, 98), '#fff', null);   // 카드(오른쪽 끝 x+196) 밖으로 안 나가게
      txt(it.type === 'use' ? `보유 ${inv.use[it.id] || 0}` : eq ? '장착 중' : own ? '보유 (탭=장착)' : '', x + 145, y + CH * 0.47, 12, eq ? '#69f0ae' : '#bbb', null);
      if (it.desc) txt(it.desc, x + 98, y + CH - 9, fitSize(it.desc, 10, 186), '#aaa', null);
      if (it.type === 'skin' && !own) txt('📦 상자 전용', x + 145, y + CH * 0.69, 13, '#ce93d8', null); else if (!own || it.type === 'use') txt(`🪙 ${fmtN(itPrice(it))}`, x + 145, y + CH * 0.69, 16, coins >= itPrice(it) ? '#ffd740' : '#ff8a80', null);
    });
    ctx.restore();
    txt('Enter / 탭: 구매 · 장착/해제 · 🎨 스킨은 돼지마다 전용 · 🐷 돼지 도감에서 장착', W / 2, 530, 14, '#aaa', null);
  }
}

