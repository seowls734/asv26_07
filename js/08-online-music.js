// ================= 캐릭터 선택 칸 =================
// (커스텀 캐릭터 만들기 기능은 뺐음 → 기본 캐릭터만. 예전 버전 상대가 커스텀을 보내도 첫 캐릭터로 대신함)
// 관리자 선물 돼지(unlock: 'admin')는 받기 전엔 어디에도 안 보임 (선택 칸·CPU 상대·AI 베팅·타이틀·장사 손님·오프닝 퍼레이드)
const shownChar = c => (IS_TESTER && isMember() && !!c) || !(c && c.relId && !isRel(c.relId)) && !(c && c.unlock === 'admin' && !isUnlocked(c) && !(c.relId && isRel(c.relId))) && !(c && NEW_CHARS.includes(c.name) && !isReleased());
const shownIdx = () => CHARS.map((c, i) => i).filter(i => shownChar(CHARS[i]));
const pickShown = () => { const s = shownIdx(); return s[Math.random() * s.length | 0]; };
const selCols = () => Math.min(11, Math.ceil(shownIdx().length / 2));   // 두 줄로 (돼지가 늘면 칸이 좁아짐)
const getChar = i => CHARS[clamp(i | 0, 0, CHARS.length - 1)];
// 온라인: 잠긴 돼지(금한돈 등)로는 못 나감 → 기본 돼지로 바꿈
function netCheckChar() { if (!isUnlocked(getChar(sel.c1))) { sel.c1 = 0; toast('🔒 아직 해금 안 된 돼지라 기본 돼지로 바꿨어요'); } }
const charDef = i => ({ idx: clamp(i | 0, 0, CHARS.length - 1), cos: { hat: inv.eq.hat, fx: inv.eq.fx } });
const defToChar = d => withCos(CHARS[clamp((d && d.idx) | 0, 0, CHARS.length - 1)], d && d.cos);

// ================= 온라인 1:1 (4자리 코드, WebRTC P2P) =================
// 두 브라우저가 매 프레임 입력만 주고받고, 같은 시드로 똑같이 시뮬레이션한다 (락스텝).
const NET = { peer: null, conn: null, host: false, code: '', status: '', err: '', ready: false, delay: 5, f: 0,
  local: {}, remote: {}, me: null, names: ['', ''], lastRecv: 0, theirName: '', theirDef: null };
const NETKEYS = ['left', 'right', 'up', 'down', 'leftP', 'rightP', 'lp', 'rp', 'lk', 'rk', 'grab', 'skill', 'ult', 'adCmd', 'mash', 'n1', 'n2', 'n3', 'ok', 'ultD', 'tf'];
const HELD_MASK = (1 << NETKEYS.indexOf('left')) | (1 << NETKEYS.indexOf('right')) | (1 << NETKEYS.indexOf('down'));
const packIn = o => NETKEYS.reduce((m, k, i) => o[k] ? m | (1 << i) : m, 0);
const unpackIn = b => { const o = { cpu: false }; NETKEYS.forEach((k, i) => { o[k] = !!(b & (1 << i)); }); return o; };
let netIn = { p1: EMPTY, p2: EMPTY }, selFor = 'run';
// 온라인 게스트는 화면을 좌우로 뒤집어 그림 → 두 사람 모두 '내 돼지가 왼쪽'으로 보임 (게임 계산은 그대로, 입력의 좌우만 뒤집어 보냄)
function MIRROR() { return mode === 3 && NET.me === p2; }
function flipLR(o) { if (!MIRROR()) return o; return { ...o, left: o.right, right: o.left, leftP: o.rightP, rightP: o.leftP }; }
function unmirrored(fn) { if (ctx.getTransform().a < 0) { ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1); fn(); ctx.restore(); } else fn(); }
// ?nettest=host|join&code=1234 : 두 브라우저가 자동 입력으로 실제 온라인 대전을 해 보는 테스트
const NETTEST = new URLSearchParams(location.search).get('nettest');
function testIn(n, side) {
  let x = Math.imul(Math.floor(n / 10) * 7 + side ^ 0x9e3779b9, 2654435761) >>> 0; x ^= x >>> 15; const h = Math.imul(x, 0x85ebca6b) >>> 0;
  const o = { ...EMPTY }, ev = n % 10 === 0;
  o.left = (h & 3) === 1; o.right = (h & 3) === 2; o.down = (h >> 2 & 7) === 0; o.leftP = ev && o.left; o.rightP = ev && o.right; o.up = ev && (h >> 5 & 7) === 0;
  if (ev) { o[['lp', 'rp', 'lk', 'rk', 'grab', 'skill', 'lp', 'rk'][h >> 8 & 7]] = true; o.mash = true; }
  if (ev && (h >> 12 & 7) === 0) { o.adCmd = true; o.ult = true; }
  o.ok = n % 240 === 0; o.n1 = n % 50 === 0;
  return o;
}
const PEER_PREFIX = 'samgyeopsal-fighter-ggulggul-room-';
function loadPeer(cb) {
  if (window.Peer) return cb();
  NET.status = '온라인 모듈 불러오는 중...';
  const s = document.createElement('script'); s.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
  s.onload = cb; s.onerror = () => { NET.status = ''; NET.err = '온라인 모듈을 불러오지 못했어요 (인터넷 연결을 확인하세요)'; };
  document.head.appendChild(s);
}
function netReset() {
  try { if (NET.conn) NET.conn.close(); } catch (e) {}
  try { if (NET.peer) NET.peer.destroy(); } catch (e) {}
  Object.assign(NET, { peer: null, conn: null, ready: false, status: '', local: {}, remote: {} });
}
function netHost() {
  netCheckChar();
  if (NET.code.length !== 4) { NET.err = '4자리 숫자를 먼저 입력하세요'; return; }
  NET.err = ''; netReset(); NET.host = true;
  loadPeer(() => {
    NET.status = '방 만드는 중...';
    const p = NET.peer = new Peer(PEER_PREFIX + NET.code);
    p.on('open', () => { NET.status = `방 코드 ${NET.code} · 친구가 같은 코드로 들어오길 기다리는 중...`; });
    p.on('connection', c => { if (NET.conn) { c.close(); return; } netBind(c); });
    p.on('error', e => { NET.status = ''; NET.err = e.type === 'unavailable-id' ? '이미 누가 쓰는 코드예요. 다른 숫자로!' : '연결 오류: ' + e.type; netReset(); });
  });
}
function netJoin() {
  netCheckChar();
  if (NET.code.length !== 4) { NET.err = '4자리 숫자를 먼저 입력하세요'; return; }
  NET.err = ''; netReset(); NET.host = false;
  loadPeer(() => {
    NET.status = `코드 ${NET.code} 방에 접속 중...`;
    const p = NET.peer = new Peer();
    p.on('open', () => netBind(p.connect(PEER_PREFIX + NET.code, { reliable: true })));
    p.on('error', e => { NET.status = ''; NET.err = e.type === 'peer-unavailable' ? '그 코드의 방이 없어요. 친구가 먼저 "방 만들기"를 눌러야 해요' : '연결 오류: ' + e.type; netReset(); });
  });
}
function netBind(c) {
  NET.conn = c;
  c.on('open', () => { NET.status = '연결됨! 대전 준비 중...'; NET.lastRecv = performance.now(); c.send({ t: 'hello', name: playerName, def: charDef(sel.c1), tp }); });
  c.on('data', onNet);
  c.on('close', () => netLost('상대가 나갔어요'));
  c.on('error', () => netLost('연결이 끊겼어요'));
}
function netSend(o) { try { if (NET.conn && NET.conn.open) NET.conn.send(o); } catch (e) {} }
function netLost(msg) {
  if (mode !== 3 && scene !== 'online') return;
  netReset(); mode = 1; scene = 'online'; NET.err = msg; sizzleOff();
}
function onNet(m) {
  if (!m || typeof m !== 'object') return;
  NET.lastRecv = performance.now();
  if (m.t === 'hello') {
    NET.theirName = String(m.name || '상대').slice(0, 16); NET.theirDef = m.def; NET.theirTp = m.tp | 0;
    if (NET.host && !NET.ready) {
      const seed = (Math.random() * 4294967296) >>> 0, myDef = charDef(sel.c1);
      netSend({ t: 'start', seed, hostName: playerName, hostDef: myDef, hostTp: tp }); NET.tps = [tp, NET.theirTp];
      beginNet(seed, playerName, myDef, NET.theirName, NET.theirDef);
    }
  } else if (m.t === 'start' && !NET.host) (NET.tps = [m.hostTp | 0, tp], beginNet(m.seed, String(m.hostName || '상대').slice(0, 16), m.hostDef, playerName, charDef(sel.c1)));
  else if (m.t === 'i') NET.remote[m.f] = m.b | 0;
  else if (m.t === 'bye') netLost('상대가 방을 나갔어요');
}
function beginNet(seed, hostName, hostDef, guestName, guestDef) {
  mode = 3; sseed(seed); NET.ready = true; NET.f = 0; NET.sent = NET.delay; NET.local = {}; NET.remote = {};
  for (let i = 0; i < NET.delay; i++) { NET.local[i] = 0; NET.remote[i] = 0; }
  p1.setChar(defToChar(hostDef)); p2.setChar(defToChar(guestDef));
  NET.names = [hostName, guestName]; NET.me = NET.host ? p1 : p2; NET.lastRecv = performance.now();
  scene = 'vs'; sceneT = 0; SFX.confirm(); speak('온라인 대전!');
}
// 한 틱: 내 입력을 (지연 프레임 뒤에 쓰이도록) 보내고, 상대 입력이 도착한 프레임만 진행
function netTick() {
  if (pressed.Escape) { netSend({ t: 'bye' }); netLost('방에서 나왔어요'); for (const k in pressed) delete pressed[k]; return; }
  // 아직 안 보낸 프레임을 빠짐없이 채워 보낸다. 같은 입력을 여러 프레임에 쓸 땐 '누름' 비트는 첫 프레임에만.
  let first = true;
  while (NET.sent <= NET.f + NET.delay) {
    const tf = NET.sent;
    let b = packIn(NETTEST ? testIn(tf, NET.host ? 1 : 2) : flipLR(orInput(readInput(MAP1), readInput(MAP2))));
    if (!first && !NETTEST) b &= HELD_MASK;
    NET.local[tf] = b; netSend({ t: 'i', f: tf, b }); NET.sent++; first = false;
  }
  for (const k in pressed) delete pressed[k];
  for (let n = 0; n < 3; n++) {   // 뒤처졌으면 최대 3프레임까지 따라잡기
    if (NET.remote[NET.f] === undefined || NET.local[NET.f] === undefined) {
      if (n === 0 && performance.now() - NET.lastRecv > 10000) netLost('상대 응답이 없어요');
      return;
    }
    const mine = unpackIn(NET.local[NET.f]), theirs = unpackIn(NET.remote[NET.f]);
    netIn = NET.host ? { p1: mine, p2: theirs } : { p1: theirs, p2: mine };
    delete NET.local[NET.f - 60]; delete NET.remote[NET.f - 60];
    NET.f++; step();
    if (NETTEST && NET.f % 600 === 0) console.log('NETHASH ' + NET.f + ' ' + [scene, p1.hp.toFixed(4), p2.hp.toFixed(4), p1.x.toFixed(3), p2.x.toFixed(3), p1.wins, p2.wins].join(','));
    if (mode !== 3 || NET.remote[NET.f + 2] === undefined) return;
  }
}
function updateOnline() {
  if (NET.ready) return;
  if (!NET.peer) {
    for (let n = 0; n < 10; n++) if ((pressed['Digit' + n] || pressed['Numpad' + n]) && NET.code.length < 4) { NET.code += n; SFX.select(); }
    if (pressed.Backspace) NET.code = NET.code.slice(0, -1);
    if (pressed.KeyH) netHost();
    if (pressed.KeyJ) netJoin();
    if (pressed.KeyC) { selFor = 'online'; scene = 'select'; }
  }
  if (pressed.Escape) { if (NET.peer) { netReset(); NET.err = '취소했어요'; } else toTitle(); }
}
function drawOnline() {
  ctx.drawImage(bgC, 0, 0, W, H); ctx.fillStyle = 'rgba(10,5,20,0.82)'; ctx.fillRect(0, 0, W, H);
  txt('온라인 1:1 대전', W / 2, 40, 36, '#fff', '#000', 7);
  txt('친구와 같은 4자리 코드를 입력 → 한 명은 "방 만들기", 다른 한 명은 "참가하기"', W / 2, 76, 15, '#ffe082', null);
  const c = getChar(sel.c1) || CHARS[0];
  txt(`내 돼지: ${c.name}`, W / 2 - 60, 108, 17, '#fff', null);
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(W / 2 + 40, 94, 90, 28, 8); ctx.fill(); txt('바꾸기 (C)', W / 2 + 85, 108, 13, '#fff', null);
  addHot(W / 2 + 40, 94, 90, 28, () => { pressed.KeyC = true; });
  for (let i = 0; i < 4; i++) {
    const x = W / 2 - 150 + i * 78;
    ctx.fillStyle = '#fff'; rr(x, 130, 66, 72, 12); ctx.fill();
    ctx.strokeStyle = i === NET.code.length && !NET.peer && gT % 40 < 20 ? '#ff5252' : '#999'; ctx.lineWidth = 3; rr(x, 130, 66, 72, 12); ctx.stroke();
    txt(NET.code[i] || '', x + 33, 168, 44, '#3e2723', null);
  }
  const keysL = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '🎲'];
  keysL.forEach((k, i) => {
    const x = 120 + (i % 3) * 92, y = 220 + (i / 3 | 0) * 62;
    ctx.fillStyle = 'rgba(255,255,255,0.14)'; rr(x, y, 84, 54, 10); ctx.fill();
    txt(k, x + 42, y + 27, 24, '#fff', null);
    addHot(x, y, 84, 54, () => {
      if (NET.peer) return;
      if (k === '⌫') pressed.Backspace = true;
      else if (k === '🎲') NET.code = String(1000 + (Math.random() * 9000 | 0));
      else pressed['Digit' + k] = true;
    });
  });
  const btn = (y, label, sub, col, code) => {
    ctx.fillStyle = NET.peer ? '#555' : col; rr(520, y, 320, 78, 14); ctx.fill();
    txt(label, 680, y + 30, 26, '#fff', '#000', 5); txt(sub, 680, y + 58, 13, '#fff', null);
    addHot(520, y, 320, 78, () => { pressed[code] = true; });
  };
  btn(222, '🏠 방 만들기 (H)', '코드를 정하고 친구를 기다려요', '#e53935', 'KeyH');
  btn(316, '🚪 참가하기 (J)', '친구가 만든 방 코드로 들어가요', '#1e88e5', 'KeyJ');
  const rec = lsGet('sgf_online', { w: 0, l: 0 });
  txt(`내 온라인 전적: ${rec.w}승 ${rec.l}패`, 680, 418, 15, '#ffe082', null);
  if (NET.status) txt(NET.status + ' ' + '.'.repeat((gT / 20 | 0) % 4), W / 2, 478, 17, '#69f0ae', '#000', 4);
  if (NET.err) txt(NET.err, W / 2, 506, 16, '#ff8a80', '#000', 4);
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(14, 14, 90, 30, 8); ctx.fill(); txt(NET.peer ? '취소' : '← 나가기', 59, 29, 13, '#fff', null);
  addHot(14, 14, 90, 30, () => { pressed.Escape = true; });
  txt('같은 와이파이가 아니어도 인터넷만 되면 OK · 처음 연결할 때만 PeerJS 공개 서버를 거쳐요', W / 2, 530, 11, '#888', null);
}

// ================= 배경음 (Web Audio로 실시간 합성) =================
let music = null, rev = null, musicMuted = lsGet('sgf_mute', false);
const bgm = { name: null, step: 0, next: 0 };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const CHORD = { m: [0, 3, 7], M: [0, 4, 7], m7: [0, 3, 7, 10], d7: [0, 4, 7, 10], M7: [0, 4, 7, 11], m9: [0, 3, 7, 10, 14] };
const TRACKS = {
  // 메뉴: 느긋한 로파이
  title: { bpm: 86, swing: 0.14, vol: 1, chords: [[57, 'm9'], [50, 'm7'], [55, 'd7'], [48, 'M7']],
    kick: 'x.....x...x.....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.xx', bass: 'x.....x.x.....x.', keys: '..x...x...x..x..', pad: true, arp: null },
  // 전투: 빠른 비트 + 아르페지오
  fight: { bpm: 140, swing: 0, vol: 0.85, chords: [[52, 'm'], [48, 'M'], [50, 'M'], [47, 'd7']],
    kick: 'x...x...x...x..x', snare: '....x.......x...', hat: '.xxx.xxx.xxx.xxx', bass: 'x.xx.x.xx.xx.x.x', keys: null, pad: true, arp: 'xxxxxxxxxxxxxxxx' },
  // 요리 컷신: 스윙 재즈풍
  cook: { bpm: 108, swing: 0.2, vol: 0.9, chords: [[53, 'M7'], [50, 'm7'], [55, 'm7'], [48, 'd7']],
    kick: 'x.......x.x.....', snare: '....x.......x..x', hat: 'x.xxx.xxx.xxx.xx', bass: 'x...x.x.x...x.x.', keys: 'x..x..x...x..x..', pad: false, arp: null }
};
function makeImpulse(sec) {
  const len = AC.sampleRate * sec | 0, b = AC.createBuffer(2, len, AC.sampleRate);
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
  return b;
}
function envGain(t, a, peak, d) {
  const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  return g;
}
function mKick(t) {
  const o = AC.createOscillator(); o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.11);
  const g = envGain(t, 0.002, 0.9, 0.32); o.connect(g); g.connect(music); o.start(t); o.stop(t + 0.4);
}
function mNoise(t, dur, type, freq, peak, q = 1) {
  const s = AC.createBufferSource(); s.buffer = getNoise();
  const f = AC.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = envGain(t, 0.001, peak, dur); s.connect(f); f.connect(g); g.connect(music); s.start(t, Math.random()); s.stop(t + dur + 0.05);
}
function mSnare(t) {
  mNoise(t, 0.16, 'bandpass', 1900, 0.45, 0.8);
  const o = AC.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.08);
  const g = envGain(t, 0.001, 0.25, 0.1); o.connect(g); g.connect(music); o.start(t); o.stop(t + 0.15);
}
function mBass(t, freq, dur) {
  const o = AC.createOscillator(), o2 = AC.createOscillator(), f = AC.createBiquadFilter();
  o.type = 'sawtooth'; o.frequency.value = freq; o2.type = 'sine'; o2.frequency.value = freq;
  f.type = 'lowpass'; f.Q.value = 4; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(180, t + dur);
  const g = envGain(t, 0.005, 0.3, dur); o.connect(f); f.connect(g); o2.connect(g); g.connect(music);
  o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
}
function mKeys(t, freqs, dur) {
  for (const fr of freqs) {
    const o = AC.createOscillator(), o2 = AC.createOscillator(), g2 = AC.createGain();
    o.type = 'sine'; o.frequency.value = fr; o2.type = 'triangle'; o2.frequency.value = fr * 2; g2.gain.value = 0.25;
    const g = envGain(t, 0.004, 0.06, dur); o.connect(g); o2.connect(g2); g2.connect(g); g.connect(music);
    o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
}
function mPad(t, freqs, dur) {
  const f = AC.createBiquadFilter(), g = AC.createGain(); f.type = 'lowpass'; f.frequency.value = 1100;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.045, t + 0.4); g.gain.setValueAtTime(0.045, t + dur - 0.3); g.gain.linearRampToValueAtTime(0.0001, t + dur);
  f.connect(g); g.connect(music);
  for (const fr of freqs) for (const det of [-7, 7]) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.detune.value = det; o.connect(f); o.start(t); o.stop(t + dur + 0.05); }
}
function mPluck(t, freq, v) {
  const o = AC.createOscillator(), f = AC.createBiquadFilter(); o.type = 'square'; o.frequency.value = freq;
  f.type = 'lowpass'; f.frequency.setValueAtTime(3200, t); f.frequency.exponentialRampToValueAtTime(500, t + 0.15);
  const g = envGain(t, 0.002, 0.045 * v, 0.16); o.connect(f); f.connect(g); g.connect(music); o.start(t); o.stop(t + 0.2);
}
function scheduleStep(tr, s, t, sp) {
  const i = s % 16, bar = Math.floor(s / 16) % tr.chords.length, root = tr.chords[bar][0], iv = CHORD[tr.chords[bar][1]];
  if (tr.kick[i] === 'x') mKick(t);
  if (tr.snare[i] === 'x') mSnare(t);
  if (tr.hat[i] === 'x') mNoise(t, 0.04, 'highpass', 8000, i % 4 === 2 ? 0.16 : 0.09);
  if (tr.bass[i] === 'x') mBass(t, mtof(root - 12 + (i === 7 || i === 14 ? 7 : 0)), sp * 1.8);
  if (tr.keys && tr.keys[i] === 'x') mKeys(t, iv.map(x => mtof(root + 12 + x)), sp * 2.5);
  if (tr.pad && i === 0) mPad(t, iv.slice(0, 3).map(x => mtof(root + 12 + x)), sp * 16);
  if (tr.arp && tr.arp[i] === 'x') { const ns = [...iv, ...iv.map(x => x + 12)]; mPluck(t, mtof(root + 24 + ns[(i + (bar % 2) * 3) % ns.length]), i % 4 === 0 ? 1 : 0.6); }
}
function musicTick() {
  if (!AC || !music || !bgm.name || bgm.file) return;   // 파일 배경음이 나오는 중이면 합성 음악은 안 만듦
  const tr = TRACKS[bgm.name], sp = 60 / tr.bpm / 4;
  if (bgm.next < AC.currentTime) bgm.next = AC.currentTime + 0.05;
  while (bgm.next < AC.currentTime + 0.15) {
    if (!musicMuted) scheduleStep(tr, bgm.step, bgm.next, sp);
    bgm.next += sp * (bgm.step % 2 === 0 ? 1 + tr.swing : 1 - tr.swing); bgm.step++;
  }
}
setInterval(musicTick, 30);
// ---- 배경음 파일 (One_Last_Challenger): 요리 장면을 뺀 모든 화면에서 반복 재생 ----
// 3분짜리라 통째로 풀지 않고 <audio>로 조금씩 읽으며 재생 → 음악 볼륨(music)을 거쳐서 M(음소거)도 그대로 적용
const BGM_FILE = 'One_Last_Challenger.mp3', FILE_TRACKS = { title: 1, fight: 1 };
let bgmEl = null, bgmOk = false;
function bgmFile() {
  if (bgmEl || !AC || location.protocol === 'file:') return bgmEl;   // 내 컴퓨터 파일로 열면 브라우저가 막음 → 합성 음악
  try {
    bgmEl = new Audio(BGM_FILE); bgmEl.loop = true; bgmEl.preload = 'auto';
    const src = AC.createMediaElementSource(bgmEl), g = AC.createGain(); g.gain.value = 1.15;
    src.connect(g); g.connect(music); bgmOk = true;
  } catch (e) { bgmEl = null; bgmOk = false; }
  return bgmEl;
}
function setMusic(name) {
  if (!AC || !music) return;
  const useFile = FILE_TRACKS[name] && bgmFile() && bgmOk;
  if (useFile && bgmEl.paused && !musicMuted && AC.state === 'running') bgmEl.play().catch(() => {});   // 첫 터치 전엔 막힐 수 있어서 계속 다시 시도
  if (bgm.name === name) return;
  bgm.file = !!useFile;
  if (!useFile && bgmEl && !bgmEl.paused) bgmEl.pause();   // 요리 장면: 파일 멈추고 합성 요리 음악 (돌아오면 이어서 재생)
  bgm.name = name; bgm.step = 0; bgm.next = AC.currentTime + 0.3;
  if (!musicMuted) { const n = AC.currentTime; music.gain.cancelScheduledValues(n); music.gain.setValueAtTime(0, n); music.gain.linearRampToValueAtTime(0.3 * TRACKS[name].vol, n + 0.8); }
}
function toggleMute() {
  musicMuted = !musicMuted; lsSet('sgf_mute', musicMuted);
  if (music) music.gain.setTargetAtTime(musicMuted ? 0 : 0.3, AC.currentTime, 0.05);
  toast(musicMuted ? '배경음 끔 (M)' : '배경음 켬 (M)');
}
const trackFor = s => s === 'cutscene' || (s === 'tycoon' && TY.phase === 'play') ? 'cook' : ['opening', 'vs', 'intro', 'fight', 'roundEnd'].includes(s) ? 'fight' : 'title';

