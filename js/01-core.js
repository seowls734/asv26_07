'use strict';
const cv = document.getElementById('c');
let ctx = cv.getContext('2d');   // let: 돼지에 색 효과를 줄 때 잠깐 작은 캔버스로 바꿔 그림 (drawPigFx)
const W = 960, H = 540, GROUND = 460, ROUND_T = 60 * 60, GRAV = 0.75;
const FONT = "'Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const TOUCH = ('ontouchstart' in window) || (window.matchMedia && matchMedia('(pointer: coarse)').matches);
// 화면 맞추기: PC는 비율 유지(여백), 모바일 가로는 화면을 꽉 채움, 모바일 세로는 위쪽 게임 화면 + 아래쪽 조작 버튼
let PORTRAIT = false, padReady = false;
// 아이폰 노치·홈 바 자리(safe area): 가로 화면에서 버튼·글자가 노치 밑에 가려지지 않게 그만큼 비움
const safeEl = document.createElement('div');
safeEl.style.cssText = 'position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
document.body.appendChild(safeEl);
function safeArea() { const s = getComputedStyle(safeEl), n = v => parseFloat(v) || 0; return { t: n(s.paddingTop), r: n(s.paddingRight), b: n(s.paddingBottom), l: n(s.paddingLeft) }; }
function fit() {
  const vw = innerWidth, vh = innerHeight;
  PORTRAIT = TOUCH && vh > vw;
  let w, h;
  if (PORTRAIT) { w = vw; h = Math.min(vw * H / W, vh * 0.55); }
  else if (TOUCH) { const sa = safeArea(); w = vw - 2 * Math.max(sa.l, sa.r); h = vh; }
  else { const s = Math.min(vw / W, vh / H); w = W * s; h = H * s; }
  Object.assign(cv.style, { width: w + 'px', height: h + 'px', top: PORTRAIT ? '0' : '50%', transform: PORTRAIT ? 'translate(-50%,0)' : 'translate(-50%,-50%)' });
  // 실제 화면 픽셀에 맞춰 캔버스 해상도를 올림 (흐릿함 방지). 휴대폰 성능을 위해 최대 2배
  const r = Math.min(2, Math.max(1, Math.max(w / W, h / H) * (window.devicePixelRatio || 1)));
  if (Math.abs(r - RES) > 0.01) { RES = r; cv.width = Math.round(W * RES); cv.height = Math.round(H * RES); ctx.imageSmoothingQuality = 'high'; }
  if (padReady) layoutPad(h);
}
let RES = 1;
addEventListener('resize', fit); addEventListener('orientationchange', () => setTimeout(fit, 200));
// 모바일 웹: 기기에 맞는 전체 화면, 길게 눌러 메뉴 뜨는 것 막기, 앱 전환 시 소리 멈춤
//  - 안드로이드 폰·태블릿: 터치하면 전체 화면 + 가로 화면 고정 (뒤로 가기로 나가도 다음 터치 때 다시 전체 화면)
//  - 아이패드: 터치하면 전체 화면 (Safari 방식)
//  - 아이폰: Safari가 전체 화면을 지원하지 않음 → '홈 화면에 추가'로 열면 전체 화면이라 처음 한 번 안내
//  - PC·터치스크린 노트북, 이미 앱처럼(홈 화면에서) 연 경우: 아무것도 안 함
const MOBILE = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
const STANDALONE = navigator.standalone === true || !!(window.matchMedia && matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches);
const IPHONE = /iPhone|iPod/.test(navigator.userAgent);
if (MOBILE && !STANDALONE) addEventListener('pointerdown', () => {
  const d = document.documentElement;
  if (IPHONE) {
    if (!lsGet('sgf_homeTip', false)) { lsSet('sgf_homeTip', true); toast('📱 공유 → "홈 화면에 추가"로 열면 전체 화면!'); }
    return;
  }
  if (document.fullscreenElement || document.webkitFullscreenElement) return;
  const lockLand = () => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} };
  if (d.requestFullscreen) d.requestFullscreen({ navigationUI: 'hide' }).then(lockLand).catch(() => {});
  else if (d.webkitRequestFullscreen) d.webkitRequestFullscreen();
});
addEventListener('contextmenu', e => e.preventDefault());
// 아이폰 Safari는 user-scalable=no를 무시해서, 두 손가락이나 빠른 두 번 탭에 화면이 확대돼 버림 → 막음 (로그인 창 안은 그대로)
const inAuth = e => e.target && e.target.closest && e.target.closest('#auth');
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('dblclick', e => { if (!inAuth(e)) e.preventDefault(); });
document.addEventListener('touchmove', e => { if (!inAuth(e)) e.preventDefault(); }, { passive: false });
let lastTouchEnd = 0;
document.addEventListener('touchend', e => {
  if (typeof initAudio === 'function') { initAudio(); try { if (AC && AC.state !== 'running') AC.resume(); } catch (er) {} }   // 아이폰은 손을 뗄 때 소리가 켜짐
  if (inAuth(e)) return;
  const n = Date.now(); if (n - lastTouchEnd < 320) e.preventDefault(); lastTouchEnd = n;
}, { passive: false });
try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}   // 아이폰 무음 스위치가 켜져 있어도 게임 소리 나게 (iOS 17+)
document.addEventListener('visibilitychange', () => { try { if (typeof AC !== 'undefined' && AC) document.hidden ? AC.suspend() : AC.resume(); } catch (e) {} });

// ================= utils =================
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => 1 - Math.pow(1 - clamp(k), 3);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.random() * arr.length | 0];
// 게임 결과에 영향을 주는 난수는 시드 난수로 (온라인에서 두 화면이 똑같이 진행되도록)
let seedS = 1;
function sseed(n) { seedS = (n >>> 0) || 1; }
function srnd() { seedS = seedS + 0x6D2B79F5 | 0; let t = Math.imul(seedS ^ seedS >>> 15, 1 | seedS); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
const srand = (a, b) => a + srnd() * (b - a);
const spick = arr => arr[srnd() * arr.length | 0];
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function ell(x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, Math.PI * 2); }
function poly(pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }
function line(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
// 글자가 maxW보다 넓으면 들어가도록 글자 크기를 줄여서 돌려줌 (최소 9px)
function fitSize(s, size, maxW) { ctx.font = `900 ${size}px ${FONT}`; const w = ctx.measureText(s).width; return w > maxW ? Math.max(9, Math.floor(size * maxW / w)) : size; }
function txt(s, x, y, size, fill, stroke = '#000', lw = 6, align = 'center') {
  if (WORLD === 3 && typeof s === 'string') s = w3Txt(s);   // 월드3: 🪙 코인 → 💵 달러
  if (typeof s === 'string' && s.length > 14 && size > 9) { ctx.font = `900 ${size}px ${FONT}`; const tw = ctx.measureText(s).width, lim = W - 16; if (tw > lim) size = Math.max(9, Math.floor(size * lim / tw)); }   // 화면보다 긴 글은 자동으로 줄임
  if (ctx.getTransform().a < 0) {   // 좌우가 뒤집힌 화면(온라인 게스트)에서도 글자는 거꾸로 안 보이게
    ctx.save(); ctx.translate(x, y); ctx.scale(-1, 1);
    txt(s, 0, 0, size, fill, stroke, lw, align === 'left' ? 'right' : align === 'right' ? 'left' : align);
    ctx.restore(); return;
  }
  ctx.font = `900 ${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.strokeText(s, x, y); }
  ctx.fillStyle = fill; ctx.fillText(s, x, y);
}
function bubble(x, y, s, size = 26) {
  ctx.font = `900 ${size}px ${FONT}`;
  const w = ctx.measureText(s).width + 34, h = size + 26;
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
  poly([[x + w * 0.12, y + h / 2 - 2], [x + w * 0.4, y + h / 2 + 26], [x + w * 0.3, y + h / 2 - 2]]); ctx.fill(); ctx.stroke();
  rr(x - w / 2, y - h / 2, w, h, 16); ctx.fill(); ctx.stroke();
  ctx.fillRect(x + w * 0.12 + 2, y + h / 2 - 4, w * 0.18 - 3, 5);
  txt(s, x, y, size, '#000', null);
}
// 받침 유무로 은/는, 이/가 선택
function josa(name, a, b) { const c = name.charCodeAt(name.length - 1); if (c < 0xAC00 || c > 0xD7A3) return name + b; return name + ((c - 0xAC00) % 28 ? a : b); }

// ================= input =================
const keys = {}, pressed = {}, lastPress = {};
let ginOpen = false;   // 게임 안 글자 입력 창이 떠 있으면 게임 조작 무시
function press(code) { if (!keys[code]) { pressed[code] = true; lastPress[code] = gT; } keys[code] = true; }
addEventListener('keydown', e => {
  if (authShown || ginOpen) return;   // 로그인 창 · 글자 입력 창이 떠 있으면 게임 조작 무시
  if (!e.repeat) { pressed[e.code] = true; lastPress[e.code] = gT; }
  keys[e.code] = true; initAudio();
  if (e.code.startsWith('Arrow') || e.code === 'Space' || e.code.startsWith('Numpad')) e.preventDefault();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
const MAP1 = { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', lp: 'KeyI', rp: 'KeyO', lk: 'KeyK', rk: 'KeyL', grab: 'KeyJ', skill: 'KeyU', ultD: 'KeyY', tf: 'KeyT' };   // J 업어치기 · U 스킬 · Y 필살기 (한 번에 누르는 단축키)
const MAP2 = { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown', lp: 'Numpad7', rp: 'Numpad8', lk: 'Numpad4', rk: 'Numpad5', grab: 'Numpad1', skill: 'Numpad9', ultD: 'Numpad6', tf: 'Numpad0' };
const EMPTY = { tf: false, ultD: false, left: false, right: false, up: false, down: false, leftP: false, rightP: false, lp: false, rp: false, lk: false, rk: false, grab: false, skill: false, ult: false, adCmd: false, cpu: false, mash: false, n1: false, n2: false, n3: false, ok: false };
// 두 키를 거의 동시에(6프레임 이내) 눌렀는지
function chord(a, b) { return !!(keys[a] && keys[b] && (pressed[a] || pressed[b]) && Math.abs((lastPress[a] ?? -99) - (lastPress[b] ?? -99)) <= 6); }
function readInput(m) {
  const o = { left: !!keys[m.left], right: !!keys[m.right], down: !!keys[m.down], up: !!pressed[m.up], leftP: !!pressed[m.left], rightP: !!pressed[m.right] };
  for (const b of ['lp', 'rp', 'lk', 'rk']) o[b] = !!pressed[m[b]];
  o.grab = !!pressed[m.grab] || chord(m.lp, m.lk) || chord(m.rp, m.rk);   // I+K / O+L = 업어치기
  o.skill = !!pressed[m.skill] || chord(m.lk, m.rk);                       // K+L = 스킬
  o.adCmd = chord(m.left, m.right);                                         // A+D = 필살 준비
  o.tf = !!pressed[m.tf];   // 변신 (게이지가 꽉 찼을 때)
  o.ultD = !!pressed[m.ultD];   // 필살기 단축키(Y, 모바일 필살기 버튼): A+D 없이 바로
  o.ult = chord(m.lk, m.rp) || o.ultD;                                                // (A+D 후) K+O = 필살기
  o.cpu = false;
  for (let n = 1; n <= 3; n++) o['n' + n] = !!(pressed['Digit' + n] || pressed['Numpad' + n]);
  o.ok = !!(pressed.Enter || pressed.Space);
  o.mash = o.lp || o.rp || o.lk || o.rk;
  return o;
}
function orInput(a, b) { const o = {}; for (const k in a) o[k] = a[k] || b[k]; return o; }

// ---- 화면 탭(메뉴용 핫스팟) ----
let hot = [];
function addHot(x, y, w, h, fn) { hot.push({ x, y, w, h, fn }); }
cv.addEventListener('pointerdown', e => {
  initAudio();
  const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
  for (let i = hot.length - 1; i >= 0; i--) { const h = hot[i]; if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) { h.fn(); e.preventDefault(); return; } }
});
// 🖱️ 목록 화면 스크롤: PC는 마우스 휠, 모바일은 손가락으로 위아래로 밀기 → ↑↓ 키를 누른 것처럼 (고른 칸 따라 화면이 넘어감)
const SCROLL_SCENES = ['select', 'pigs', 'market', 'tycoon', 'reward', 'cutlist', 'ranking', 'endings', 'keys', 'betpick', 'bank'];
const canScroll = () => SCROLL_SCENES.includes(scene) && !(scene === 'tycoon' && TY.phase !== 'lobby') && !POP && !qm && !(typeof authOpen === 'function' && authOpen());
function scrollStep(dir) { if (canScroll()) pressed[dir > 0 ? 'ArrowDown' : 'ArrowUp'] = true; }
let wheelAcc = 0;
cv.addEventListener('wheel', e => { if (!canScroll()) return; e.preventDefault(); wheelAcc += e.deltaY; if (Math.abs(wheelAcc) >= 50) { scrollStep(Math.sign(wheelAcc)); wheelAcc = 0; } }, { passive: false });
const swipe = {};
cv.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') swipe[e.pointerId] = e.clientY; });
cv.addEventListener('pointermove', e => { const y0 = swipe[e.pointerId]; if (y0 == null || !canScroll()) return; const r = cv.getBoundingClientRect(), dy = (y0 - e.clientY) * H / r.height; if (Math.abs(dy) >= 45) { scrollStep(Math.sign(dy)); swipe[e.pointerId] = e.clientY; } });
addEventListener('pointerup', e => { delete swipe[e.pointerId]; }); addEventListener('pointercancel', e => { delete swipe[e.pointerId]; });

// ---- 모바일 터치 패드 ----
// 왼쪽: 아무 데나 누르고 끌면 움직이는 조이스틱 (↖↗ 대각선 점프 · 아래로 끌면 앉기 · 뒤로 끌면 막기)
// 오른쪽: 공격 버튼. 손가락을 떼지 않고 옆 버튼으로 미끄러져도 바로 눌림
const PAD = [   // 공격 버튼 4개 + 업어치기·스킬·필살기 버튼 (조이스틱 커맨드 ↓→ · ↓← · →→ + 공격도 그대로 됨)
  { t: '오른손', codes: ['KeyI'] }, { t: '왼손', codes: ['KeyO'] },
  { t: '오른발', codes: ['KeyK'] }, { t: '왼발', codes: ['KeyL'] },
  { t: '업어<br>치기', codes: ['KeyJ'], c: 'grab' }, { t: '스킬', codes: ['KeyU'], c: 'skill' },
  { t: '필살기', codes: ['KeyY'], c: 'ult' }
];
// 버튼 위치: 오른쪽 아래 모서리 기준 [가로, 세로, 크기] (단위 u)
const PAD_POS = [[-2.15, -1.75, 1.08], [-1.0, -2.05, 1.08], [-2.15, -0.62, 1.08], [-1.0, -0.92, 1.08],   // 공격 버튼 4개
  [-3.3, -0.6, 0.9], [-3.3, -1.6, 0.9], [-1.55, -3.0, 0.95]];   // 업어치기·스킬 (왼쪽 줄) · 필살기 (위쪽)
const padEl = document.getElementById('pad');
const joyZ = document.createElement('div'), joyB = document.createElement('div'), joyK = document.createElement('div');
joyZ.id = 'joyz'; joyB.id = 'joyb'; joyK.id = 'joyk'; joyZ.append(joyB, joyK); padEl.appendChild(joyZ);
let joyHome = [0, 0];
function layoutPad(canvasH) {
  if (!TOUCH) return;
  const top = PORTRAIT ? canvasH : 0, w = innerWidth, h = innerHeight - top;
  padEl.style.top = top + 'px';
  const u = PORTRAIT ? Math.min((w - 16) / 7.4, h / 3.3, 84) : Math.max(52, Math.min(84, innerHeight / 5));
  const sa = safeArea(), right = w - 8 - sa.r, bottom = h - 8 - sa.b;   // 노치·홈 바 피하기
  PAD.forEach((p, i) => {
    const [qx, qy, qs] = PAD_POS[i], s = qs * u * 0.96;
    Object.assign(p.el.style, { width: s + 'px', height: s + 'px', left: right + qx * u - s / 2 + 'px', top: bottom + qy * u - s / 2 + 'px', right: '', bottom: '' });
  });
  // 조이스틱 영역: 버튼 왼쪽의 남는 곳 (가로 화면은 위쪽 HUD는 비워 둠)
  const zr = right - 3.9 * u, zt = PORTRAIT ? 0 : h * 0.3;
  Object.assign(joyZ.style, { left: sa.l + 'px', top: zt + 'px', width: Math.max(120, Math.min(zr, PORTRAIT ? zr : w * 0.45)) + 'px', height: h - zt + 'px' });
  joyHome = [Math.min(zr / 2, 1.6 * u + 20), (h - zt) - 1.6 * u];
  joyShow(joyHome[0], joyHome[1], 0, 0, false);
}
// 여러 손가락이 같은 키를 누를 수 있으니 몇 개가 누르고 있는지 센다
const padHold = {};
function padDown(c) { padHold[c] = (padHold[c] || 0) + 1; if (padHold[c] === 1) press(c); }
function padUp(c) { if (!padHold[c]) return; if (--padHold[c] === 0) keys[c] = false; }
function padReleaseAll() { for (const c in padHold) { if (padHold[c] > 0) keys[c] = false; padHold[c] = 0; } joy.id = null; for (const p of PAD) p.el.classList.remove('on'); btnPtr.clear(); }
// 조이스틱
const joy = { id: null, x0: 0, y0: 0, held: {} };
function joyShow(x, y, dx, dy, active) {
  Object.assign(joyB.style, { left: x + 'px', top: y + 'px', opacity: active ? 1 : 0.45 });
  Object.assign(joyK.style, { left: x + dx + 'px', top: y + dy + 'px', opacity: active ? 1 : 0.45 });
}
function joyMove(x, y) {
  const R = 52; let dx = x - joy.x0, dy = y - joy.y0;
  const d = Math.hypot(dx, dy);
  // 조이스틱 중심은 항상 같은 자리(joyHome)에 고정 → 손가락이 따라 움직여도 중심이 안 옮겨감
  // 위·아래는 확실히 위/아래로 끌었을 때만(각도 기준) → 옆으로 걷다가 손가락이 살짝 내려가도 앉아 멈추거나 점프하지 않게
  const ax = Math.abs(dx), want = { KeyA: dx < -14, KeyD: dx > 14, KeyW: dy < -36 && -dy > ax * 0.7, KeyS: dy > 34 && dy > ax * 0.7 };
  for (const c in want) { if (want[c] && !joy.held[c]) { joy.held[c] = true; padDown(c); } else if (!want[c] && joy.held[c]) { joy.held[c] = false; padUp(c); } }
  const m = Math.min(R, Math.hypot(dx, dy)) / (Math.hypot(dx, dy) || 1);
  joyShow(joy.x0, joy.y0, dx * m, dy * m, true);
}
function joyEnd() { for (const c in joy.held) if (joy.held[c]) { joy.held[c] = false; padUp(c); } joy.id = null; joyShow(joyHome[0], joyHome[1], 0, 0, false); }
const zxy = e => { const r = joyZ.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
joyZ.addEventListener('pointerdown', e => { e.preventDefault(); initAudio(); if (joy.id !== null) return; joy.id = e.pointerId; [joy.x0, joy.y0] = joyHome; joyMove(...zxy(e)); try { joyZ.setPointerCapture(e.pointerId); } catch (er) {} });   // 중심은 고정, 고정된 중심에서 손가락까지의 방향으로 조작
joyZ.addEventListener('pointermove', e => { if (e.pointerId === joy.id) { e.preventDefault(); joyMove(...zxy(e)); } });
for (const ev of ['pointerup', 'pointercancel']) joyZ.addEventListener(ev, e => { if (e.pointerId === joy.id) joyEnd(); });
// 공격 버튼: 손가락마다 지금 어느 버튼 위에 있는지 추적 (미끄러지면 바꿔 누름)
const btnPtr = new Map();
function btnSet(id, idx) {
  const old = btnPtr.get(id);
  if (old === idx) return;
  if (old !== undefined) { PAD[old].el.classList.remove('on'); for (const c of PAD[old].codes) padUp(c); }
  if (idx === undefined) { btnPtr.delete(id); return; }
  btnPtr.set(id, idx); PAD[idx].el.classList.add('on'); for (const c of PAD[idx].codes) padDown(c);
  try { navigator.vibrate && navigator.vibrate(8); } catch (e) {}
}
const btnAt = (x, y) => { const el = document.elementFromPoint(x, y); const b = el && el.closest && el.closest('#pad .b'); return b ? +b.dataset.i : undefined; };
PAD.forEach((p, i) => {
  const d = document.createElement('div'); d.className = 'b' + (p.c ? ' c' : ''); d.innerHTML = p.t; d.dataset.i = i; p.el = d;
  d.addEventListener('pointerdown', e => { e.preventDefault(); initAudio(); btnSet(e.pointerId, i); try { d.releasePointerCapture(e.pointerId); } catch (er) {} });   // 캡처를 풀어야 옆 버튼으로 미끄러질 수 있음
  padEl.appendChild(d);
});
addEventListener('pointermove', e => { if (btnPtr.has(e.pointerId)) { e.preventDefault(); const i = btnAt(e.clientX, e.clientY); if (i !== undefined) btnSet(e.pointerId, i); } });
for (const ev of ['pointerup', 'pointercancel']) addEventListener(ev, e => { if (btnPtr.has(e.pointerId)) btnSet(e.pointerId, undefined); });
padReady = true; fit();
let padShown = false;
function syncPad() {
  const want = TOUCH && mode !== 0 && mode !== 4 && ['intro', 'fight', 'roundEnd', 'wplay', 'lobby'].includes(scene);   // CPU끼리 싸우는 모드(구경·AI 베팅)엔 패드 숨김
  if (want !== padShown) { padShown = want; padEl.style.display = want ? 'block' : 'none'; if (!want) { joyEnd(); padReleaseAll(); } }   // 숨길 때 눌린 키가 남지 않게
  if (!padShown) return;
  // 특수 버튼 상태: 쓸 수 있으면 빛나고(필살기), 못 쓰면 흐리게
  const me = mode === 3 && NET.me ? NET.me : p1;
  const st = { grab: 1, skill: me.skillCD <= 0 ? 1 : 0, ult: me.meter >= 100 ? 2 : 0 };
  for (const p of PAD) if (p.c) { const v = st[p.c]; if (p.st !== v) { p.st = v; p.el.classList.toggle('off', v === 0); p.el.classList.toggle('rdy', v === 2); } }
}

// ================= audio =================
let AC = null, master = null, noiseBuf = null, sfxOut = null;   // sfxOut: 효과음 전용 통로 (배경음악보다 크게)
function initAudio() {
  if (AC) return;
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    const comp = AC.createDynamicsCompressor(); comp.threshold.value = -8; comp.ratio.value = 10; comp.knee.value = 4; comp.attack.value = 0.002; comp.release.value = 0.12; comp.connect(AC.destination);   // 큰 소리도 덜 눌러서 타격감 살림
    master = AC.createGain(); master.gain.value = 0.85; master.connect(comp);
    sfxOut = AC.createGain(); sfxOut.gain.value = 1.6; sfxOut.connect(master);   // 효과음 음량 (전보다 훨씬 크게)
    loadSamples();   // 펀치 녹음 파일 불러오기
    rev = AC.createConvolver(); rev.buffer = makeImpulse(1.8);
    const rg = AC.createGain(); rg.gain.value = 0.25; rev.connect(rg); rg.connect(comp);
    const send = AC.createGain(); send.gain.value = 0.12; master.connect(send); send.connect(rev);
    music = AC.createGain(); music.gain.value = 0; music.connect(comp);
    const ms = AC.createGain(); ms.gain.value = 0.3; music.connect(ms); ms.connect(rev);
  } catch (e) { AC = null; }
}
function tone(f, d, type = 'square', v = 0.2, f2) {
  if (!AC) return;
  const o = AC.createOscillator(), g = AC.createGain(), n = AC.currentTime;
  o.type = type === 'square' || type === 'sawtooth' ? 'triangle' : type; o.frequency.setValueAtTime(f, n);   // 거친 사각·톱니파는 '삑' 소리가 나서 부드러운 삼각파로
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, n + d);
  g.gain.setValueAtTime(v * 0.6, n); g.gain.exponentialRampToValueAtTime(0.001, n + d);
  o.connect(g); g.connect(master); o.start(n); o.stop(n + d);
}
function getNoise() {
  if (!noiseBuf) { noiseBuf = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  return noiseBuf;
}
function noise(d, v = 0.3, freq = 1000, type = 'lowpass') {
  if (!AC) return;
  const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(), n = AC.currentTime;
  s.buffer = getNoise(); f.type = type; f.frequency.value = freq;
  g.gain.setValueAtTime(v, n); g.gain.exponentialRampToValueAtTime(0.001, n + d);
  s.connect(f); f.connect(g); g.connect(sfxOut || master); s.start(n); s.stop(n + d);
}
// ---- 효과음 재료 (말소리·음성은 쓰지 않음: 전부 합성음) ----
// 짧은 소리 여러 겹을 동시에 울려서 '탁(순간)+퍽(살)+쿵(몸통 울림)' 같은 타격감을 만든다
let crunch = null;
function crunchOut() {   // 살짝 찌그러뜨려(디스토션) 묵직하게
  if (!crunch && AC) {
    crunch = AC.createWaveShaper(); const c = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; c[i] = Math.tanh(x * 3.2); }
    crunch.curve = c; const g = AC.createGain(); g.gain.value = 0.7; crunch.connect(g); g.connect(sfxOut || master);
  }
  return crunch;
}
const rnd = (a, b) => a + Math.random() * (b - a);
function osc(f, d, o = {}) {
  if (!AC) return;
  const { type = 'sine', v = 0.2, f2, at = 0, atk = 0.003, out } = o;
  const s = AC.createOscillator(), g = AC.createGain(), n = AC.currentTime + at;
  s.type = type; s.frequency.setValueAtTime(f, n); if (f2) s.frequency.exponentialRampToValueAtTime(f2, n + d);
  g.gain.setValueAtTime(0.0001, n); g.gain.exponentialRampToValueAtTime(v, n + atk); g.gain.exponentialRampToValueAtTime(0.0001, n + d);
  s.connect(g); g.connect(out || sfxOut || master); s.start(n); s.stop(n + d + 0.03);
}
function nz(d, o = {}) {
  if (!AC) return;
  const { v = 0.3, freq = 1000, f2, type = 'lowpass', q = 0.8, at = 0, atk = 0.002, out } = o;
  const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(), n = AC.currentTime + at;
  s.buffer = getNoise(); s.playbackRate.value = rnd(0.85, 1.15);
  f.type = type; f.Q.value = q; f.frequency.setValueAtTime(freq, n); if (f2) f.frequency.exponentialRampToValueAtTime(f2, n + d);
  g.gain.setValueAtTime(0.0001, n); g.gain.exponentialRampToValueAtTime(v, n + atk); g.gain.exponentialRampToValueAtTime(0.0001, n + d);
  s.connect(f); f.connect(g); g.connect(out || sfxOut || master); s.start(n, Math.random() * 1.5); s.stop(n + d + 0.03);
}
// 타격음: p(0~1) = 세기. 셀수록 저음·여운·공기 터지는 소리 층이 더해짐
let lastImpact = 0;
function impact(p, kind) {
  if (!AC) return;
  p = clamp(p);
  const now = AC.currentTime, rapid = now - lastImpact < 0.04; lastImpact = now;   // 연타가 겹치면 가볍게
  const pan = rnd(-0.12, 0.12), jit = rnd(0.96, 1.05);
  if (kind === 'kick') thump((0.9 - p * 0.15) * jit, (rapid ? 0.55 : 0.85) + p * 0.3, 0, { pan });   // 킥: 묵직한 펀치 녹음
  else knock((1.02 - p * 0.12) * jit, (rapid ? 0.5 : 0.8) + p * 0.3, 0, { pan });                    // 손: 밝은 너클 펀치 녹음
  if (!rapid && p > 0.6) { if (!smp('hard', { v: 0.55 * p, at: 0.008, rate: jit })) thump(0.72 * jit, 0.5 * p, 0.012, { lp: 1800 }); }   // 센 공격: 아주 묵직한 펀치 한 겹
}
function whoosh(d = 0.15, v = 0.2, lo = 500, hi = 3200, at = 0) { nz(d, { v, freq: lo, f2: hi, type: 'bandpass', q: 1.4, at, atk: d * 0.4 }); }
// 녹음 파일들. off = 앞쪽 무음을 건너뛰는 위치(초) — 안 건너뛰면 맞는 순간보다 0.07~0.17초 늦게 들림
const SAMPLES = {
  punch:   { file: 'universfield-punch-04-383965.mp3', off: 0.065 },              // 묵직하고 어두운 펀치 → 킥·센 공격
  knuckle: { file: 'khoamthanh-punch-knuckle-blunt-medium-503895.mp3', off: 0.16 },  // 밝고 딱 끊기는 너클 펀치 → 손 공격
  whip:    { file: 'freesound_community-whip01-6952.mp3', off: 0.1 },                // 휘익~착 → 휘두르는 스킬
  gun:     { file: 'dragon-studio-machine-gun-sfx-631486.mp3', off: 0.02 },          // 빠른 연타 13번 → 연타 필살기
  hard:    { file: 'dragon-studio-hard-punch-sfx-515251.mp3', off: 0.015 },        // 아주 크고 낮은 펀치 → KO·메치기·센 공격 마무리
  boom:    { file: 'dragon-studio-explosion-with-debris-494320.mp3', off: 0.015 }, // 폭발 + 파편 → 화염구 폭발
  deep:    { file: 'dragon-studio-large-underwater-explosion-sfx-450455.mp3', off: 0.015 },   // 아주 낮고 깊은 울림 → 필살기 '쾅'
  sizzle:  { file: '99DF20505CF11BED30.mp3', off: 0 },                            // 지글지글 굽는 소리 (27초) → 요리 장면
  blizzard: { file: 'dragon-studio-blizzard-transition-463210.mp3', off: 0.3 },     // 눈보라 휘몰아침 → 얼음이 필살기·얼음 변신
  ttSummon: { file: 'tt-summon.mp3', off: 0 },      // 돼타로: 뚱타플레티나 부르는 외침 → 필살기 컷신
  ttStop:   { file: 'tt-timestop.mp3', off: 0 },    // 돼타로: 시간 정지 외침 → 컷신 시계 장면
  ttRush:   { file: 'tt-rush.mp3', off: 0 },        // 돼타로: 연타 기합 → 뚱타플레티나 러시에서만
  ttWin:    { file: 'tt-win.mp3', off: 0 },         // 돼타로: 이겼을 때 한마디
  nrClone:  { file: 'naruto_shadow_clones.mp3', off: 0 },          // 돼루토: 분신술 외침 (사용자가 넣은 파일)
  nrRasen:  { file: 'naruto-rasenganshippuden-mp3cut.mp3', off: 0 }, // 돼루토: 회오리 구슬 외침 (사용자가 넣은 파일)
};
const BUF = {};
let punchBuf = null;   // (예전 이름 유지) = BUF.punch
function loadSamples() {
  if (!AC || location.protocol === 'file:') return;   // 내 컴퓨터 파일로 열면 브라우저가 막음 → 노이즈로 대신
  for (const [k, sm] of Object.entries(SAMPLES)) {
    if (BUF[k]) continue;
    fetch(sm.file).then(r => { if (!r.ok) throw r.status; return r.arrayBuffer(); })
      .then(b => new Promise((ok, no) => AC.decodeAudioData(b, ok, no))).then(buf => { BUF[k] = buf; if (k === 'punch') punchBuf = buf; }).catch(() => {});
  }
}
function playS(buf, o = {}) {
  if (!AC || !buf) return;
  const { rate = 1, v = 0.8, at = 0, pan = 0, hp, lp, out, off = 0, dur } = o;
  const s = AC.createBufferSource(), g = AC.createGain(); s.buffer = buf; s.playbackRate.value = rate; g.gain.value = v;
  let node = s;
  for (const [type, fr] of [['highpass', hp], ['lowpass', lp]]) if (fr) { const f = AC.createBiquadFilter(); f.type = type; f.frequency.value = fr; node.connect(f); node = f; }
  node.connect(g);
  const dest = out || sfxOut || master;
  if (pan && AC.createStereoPanner) { const p = AC.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(dest); } else g.connect(dest);
  const t = AC.currentTime + at;
  if (dur) { g.gain.setValueAtTime(v, t + dur * 0.8); g.gain.linearRampToValueAtTime(0.0001, t + dur); s.start(t, off, dur * rate + 0.05); } else s.start(t, off);
  return s;
}
// 목소리(외침·대사)는 한 번에 하나만: 새 목소리가 나오면 앞 목소리는 멈춤 (겹쳐서 웅성거리지 않게)
const VOICE = new Set(['ttSummon', 'ttStop', 'ttRush', 'ttWin', 'nrClone', 'nrRasen']);
let voiceSrc = null, voicePri = 0;
const VOICE_PRI = { ttStop: 3, ttSummon: 3, nrRasen: 2, nrClone: 2, ttRush: 2, ttWin: 1 };   // 필살기 외침은 스킬 소리가 끊지 못함
function smp(k, o = {}) {
  if (!BUF[k]) return false;
  const v = VOICE.has(k);
  if (v && voiceSrc && (VOICE_PRI[k] || 1) < voicePri) return !!playS(BUF[k], { off: SAMPLES[k].off, ...o });   // 더 중요한 외침이 나오는 중이면 끊지 않고 같이
  if (v && voiceSrc) { try { voiceSrc.stop(); } catch (e) {} voiceSrc = null; voicePri = 0; }
  if (v) { try { speechSynthesis.cancel(); } catch (e) {} }   // 브라우저 음성도 멈춤
  const s = playS(BUF[k], { off: SAMPLES[k].off, ...o });
  if (v && s) { voiceSrc = s; voicePri = VOICE_PRI[k] || 1; s.onended = () => { if (voiceSrc === s) { voiceSrc = null; voicePri = 0; } }; }
  return true;
}
// 타격 한 방(묵직한 펀치 녹음): rate 낮을수록 묵직, 높을수록 가볍게
function thump(rate = 1, v = 0.8, at = 0, o = {}) { if (!smp('punch', { rate, v, at, ...o })) nz(0.09, { v: v * 0.6, freq: 1100 * rate, f2: 150, at, out: o.out }); }
// 손 공격용 밝은 너클 펀치 (없으면 묵직한 펀치로)
function knock(rate = 1, v = 0.8, at = 0, o = {}) { if (!smp('knuckle', { rate, v, at, ...o })) thump(rate * 1.1, v, at, o); }
// 채찍 '휘익~착' (없으면 바람 소리)
function whipS(rate = 1, v = 0.6, at = 0, o = {}) { if (!smp('whip', { rate, v, at, ...o })) whoosh(0.2, v * 0.4, 400, 3500, at); }
const SFX = {
  // ---- 싸움 소리: 펀치 녹음(높낮이 바꿔 씀) + 노이즈(쉬익·촤악). 낮은 '뚱·뜨등' 합성음은 쓰지 않음 ----
  punch(dmg = 6) { impact(dmg / 20, 'punch'); },
  kick(dmg = 9) { impact(dmg / 17, 'kick'); },
  heavy(dmg = 16) { impact(Math.max(0.8, dmg / 16), 'kick'); smp('hard', { v: 0.6, rate: rnd(0.95, 1.05) }); },
  counterHit() { knock(1.3, 0.55, 0.03, { hp: 900 }); },                                   // 카운터: 짧고 높은 너클 한 번 더
  block() { knock(1.5, 0.45, 0, { hp: 1300 }); },   // 막기: 가볍고 높은 '탁'
  whiff() { whoosh(0.13, 0.18, 500, 2800); },
  jump() { whoosh(0.15, 0.12, 250, 1100); },
  special() { whoosh(0.3, 0.22, 300, 2600); thump(0.9, 0.5, 0.05); },
  boom() {   // 폭발: 아주 낮게 늘인 펀치 + 넓게 퍼지는 노이즈 + 파편
    if (!AC) return; const b = bus(0, 0.6);
    if (smp('boom', { v: 0.9, dur: 1.6 })) return;   // 녹음된 폭발이 있으면 그것만
    thump(0.5, 1.0, 0, { lp: 1200 }); thump(0.7, 0.6, 0.02);
    nz(0.9, { v: 0.55, freq: 1800, f2: 80, q: 0.9, out: b });
    for (let i = 0; i < 8; i++) nz(0.03, { v: 0.12, freq: rnd(1500, 3500), type: 'bandpass', q: 1, at: rnd(0.1, 0.6), out: bus(rnd(-0.6, 0.6), 0.2) });
  },
  splash() {   // 국물 쏟아짐: 촤아악 + 퐁퐁
    if (!AC) return; const b = bus(0, 0.3);
    nz(0.45, { v: 0.35, freq: 2500, f2: 400, type: 'bandpass', q: 0.9, atk: 0.03, out: b });
    for (let i = 0; i < 8; i++) nz(0.03, { v: 0.14, freq: rnd(300, 700), type: 'bandpass', q: 1.5, at: 0.06 + i * 0.045, out: b });
  },
  oink() { for (const t of [0, 0.14]) nz(0.11, { v: 0.3, freq: 380, type: 'bandpass', q: 3, at: t }); },
  squeal() { nz(0.3, { v: 0.12, freq: 1100, f2: 1500, type: 'bandpass', q: 2.5 }); },
  ko() { if (!smp('hard', { v: 1.0, rate: 0.9 })) thump(0.62, 1.0, 0, { lp: 2500 }); thump(0.85, 0.5, 0.02); nz(1.0, { v: 0.35, freq: 800, f2: 70, at: 0.05 }); },   // KO: 크고 낮은 펀치 두 겹
  chop() { nz(0.08, { v: 0.5, freq: 2200, type: 'bandpass', q: 1 }); thump(1.15, 0.45); },
  snip() { nz(0.04, { v: 0.3, freq: 5000, type: 'highpass' }); },
  bell() { tone(880, 0.3, 'sine', 0.12); setTimeout(() => tone(1320, 0.4, 'sine', 0.1), 120); },
  tick() { nz(0.015, { v: 0.2, freq: 3000, type: 'highpass' }); },
  gong() { thump(1.3, 0.7, 0, { hp: 700 }); nz(0.25, { v: 0.3, freq: 1800, f2: 800, type: 'bandpass', q: 1.5, out: bus(0, 0.5) }); },   // 숙성 패링: 탁! 튕겨냄
  ultStart() {   // 필살기: 바람이 0.8초 차오르다가 아주 낮은 펀치 '쾅'
    nz(0.85, { v: 0.32, freq: 150, f2: 4500, type: 'bandpass', q: 0.7, atk: 0.6, out: bus(0, 0.4) });
    if (!smp('deep', { v: 0.95, at: 0.78, dur: 1.6 })) { thump(0.55, 1.0, 0.78, { lp: 1500 }); nz(0.9, { v: 0.45, freq: 1500, f2: 80, at: 0.78, out: bus(0, 0.5) }); }
    smp('hard', { v: 0.7, at: 0.78, rate: 0.85 });   // 깊은 울림 + 묵직한 한 방
  },
  transform() { nz(0.6, { v: 0.3, freq: 200, f2: 3500, type: 'bandpass', q: 0.8, atk: 0.4 }); thump(0.65, 0.8, 0.4); },
  fire() {   // 화염구 날아감: 화르르륵 + 타닥
    if (!AC) return; const b = bus(0, 0.35);
    nz(0.5, { v: 0.4, freq: 250, f2: 2200, q: 1, atk: 0.08, out: b });
    for (let i = 0; i < 6; i++) nz(0.02, { v: 0.14, freq: rnd(2000, 4000), type: 'bandpass', q: 1, at: rnd(0.03, 0.45), out: b });
  },
  ice() {   // 얼음 표창 날아감: 쉬익 + 바스락
    if (!AC) return; const b = bus(0, 0.4);
    nz(0.25, { v: 0.25, freq: 6000, f2: 2000, type: 'highpass', out: b });
    for (let i = 0; i < 6; i++) nz(0.02, { v: 0.15, freq: rnd(4000, 7000), type: 'bandpass', q: 1, at: i * 0.03, out: b });
  },
  slam() { if (!smp('hard', { v: 0.95, rate: 0.95 })) thump(0.6, 1.0, 0, { lp: 2000 }); thump(0.8, 0.5, 0.015); nz(0.4, { v: 0.4, freq: 350, f2: 80 }); },   // 메치기: 바닥에 쿵
  thud() { thump(0.8, 0.6); },
  tender() { thump(1.2, 0.4); },
  partBreak() { nz(0.2, { v: 0.4, freq: 2000 }); },
  stamp() { thump(0.7, 0.8, 0, { lp: 1500 }); },
  hot() { noise(0.15, 0.12, 4000, 'highpass'); },
  flurryHit() { knock(rnd(1.05, 1.2), 0.32); },   // 연타 중 한 방 한 방은 작게 (연타 소리가 주인공)
  flurry() { smp('gun', { v: 0.55, lp: 2600, rate: 0.95 }); },   // 연타 필살기: 빠른 연타 소리 (기관총 녹음을 조금 둥글게)
  select() { tone(620, 0.05, 'sine', 0.06); },
  confirm() { tone(523, 0.08, 'sine', 0.08); setTimeout(() => tone(784, 0.12, 'sine', 0.08), 80); }
};
let sizzleNode = null, sizzleGain = null;
function sizzleOn() {   // 요리 장면 지글지글: 녹음(27초, 반복)이 있으면 그것, 없으면 노이즈
  if (!AC || sizzleNode) return;
  sizzleNode = AC.createBufferSource(); sizzleGain = AC.createGain(); sizzleGain.gain.value = 0;
  if (BUF.sizzle) {
    sizzleNode.buffer = BUF.sizzle; sizzleNode.loop = true; sizzleBoost = 4;   // 녹음이 작게 녹음돼 있어서 키움
    sizzleNode.connect(sizzleGain); sizzleGain.connect(sfxOut || master); sizzleNode.start(AC.currentTime, rnd(0, 20));
  } else {
    sizzleNode.buffer = getNoise(); sizzleNode.loop = true; sizzleBoost = 1;
    const f = AC.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3500;
    sizzleNode.connect(f); f.connect(sizzleGain); sizzleGain.connect(master); sizzleNode.start();
  }
}
let sizzleBoost = 1;
function sizzleSet(v) { if (sizzleGain) sizzleGain.gain.setTargetAtTime(v * sizzleBoost, AC.currentTime, 0.05); }
function sizzleOff() { if (sizzleNode) { try { sizzleNode.stop(); } catch (e) {} } sizzleNode = null; sizzleGain = null; }

