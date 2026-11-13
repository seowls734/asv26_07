// 삼겹살 파이터 회원 서버 (Cloudflare Workers + D1) — 랭킹 서버와 따로 운영
// 회원 정보와 게임 저장(진행 상황)만 다룸. 랭킹 기록은 여기 없음.
//   POST /signup  { login, pw, save? }  → { token, uid, login, saved }   회원가입 (게스트 기록을 save로 넘기면 이어짐)
//   POST /login   { login, pw }         → { token, uid, login, save, saved }
//   GET  /save    (Authorization: Bearer 토큰) → { uid, login, save, saved }
//   PUT  /save    (Bearer) { save }     → { saved }
//   POST /logout  (Bearer)              → { ok }
// 구글 로그인 (Google Identity Services의 ID 토큰을 credential로 받음, 구글 서버에 물어서 진짜인지 확인):
//   POST /google  { credential, login?, save? } → 연결된 계정이 있으면 로그인 결과 / 없으면 { need: 'name' } → login(닉네임)을 붙여 다시 보내면 가입
//   POST /google/link   (Bearer) { credential } → 지금 계정에 구글 연결 · POST /google/unlink (Bearer) → 연결 해제 (비밀번호가 있는 계정만)
// 관리자 (관리자 아이디로 로그인한 토큰만, admin.html에서 씀): 관리자 아이디는 환경변수 ADMINS(쉼표로 여러 명) 또는 기본값
//   GET  /admin/stats · GET /admin/users?q=&offset=&sort= · GET /admin/user?uid=
//   PUT  /admin/user { uid, save }  · POST /admin/user/{password,ban,logout,unlock,rename,delete} { uid, ... }
// 관리자 비밀번호는 코드에 넣지 않음: 관리자 아이디로 일반 회원가입한 비밀번호를 그대로 씀
// 비밀번호는 PBKDF2(SHA-256, 소금값)로 바꿔서 저장하고, 원래 비밀번호는 어디에도 남기지 않음.
// 로그인 토큰도 SHA-256 값만 저장함.
// 설정: Worker의 D1 바인딩 변수 이름을 USERS 로 연결할 것

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};
const json = (d, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const err = (msg, status = 400) => json({ error: msg }, status);

const ITER = 20000;                 // PBKDF2 반복 횟수 (무료 요금제 CPU 시간 한도 안에서)
const MAX_SAVE = 200000;            // 저장 데이터 최대 글자 수
const FAIL_MAX = 10, FAIL_WIN = 10 * 60 * 1000;   // 10분에 10번 틀리면 10분 잠금
// 아이디: 한글·영어 소문자·숫자·_ 2~16자 (영어는 소문자로 바꿔서 저장 → 대소문자만 다른 중복 가입 불가)
const LOGIN_RE = /^[a-z0-9_가-힣]{2,16}$/;
// 비밀번호: 영어·숫자·기호만 (한글 입력 실수 방지), 4~64자
const PW_RE = /^[!-~]{4,64}$/;
const normLogin = v => String(v || '').trim().normalize('NFC').toLowerCase();
// 관리자 아이디 (Cloudflare 환경변수 ADMINS에 쉼표로 넣으면 그걸 씀)
const DEFAULT_ADMINS = '정우쮝';
const adminList = env => String(env.ADMINS || DEFAULT_ADMINS).split(',').map(normLogin).filter(Boolean);
const DEFAULT_TESTERS = 'pigtest01';   // 테스트 계정: 공개 전 돼지까지 모두 써 봄 (관리자 계정은 일반 플레이어처럼)
const testerList = env => String(env.TESTERS || DEFAULT_TESTERS).split(',').map(normLogin).filter(Boolean);
// 구글 OAuth 클라이언트 ID (공개값이라 코드에 둬도 됨. 환경변수 GOOGLE_CLIENT_ID가 있으면 그걸 씀) — index.html의 GOOGLE_CLIENT_ID와 같아야 함
const DEFAULT_GOOGLE_CLIENT_ID = '36016988229-39ku26haf3v904rslpfvh5vnjlb3fc3t.apps.googleusercontent.com';
// 구글 ID 토큰 확인 → 구글 계정 고유번호(sub) / 실패하면 null
async function googleSub(cred, env) {
  const cid = env.GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;
  if (!cid || typeof cred !== 'string' || cred.length > 4096) return null;
  const r = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(cred));
  if (!r.ok) return null;
  const t = await r.json().catch(() => null);
  if (!t || t.aud !== cid || !['accounts.google.com', 'https://accounts.google.com'].includes(t.iss) || !(+t.exp * 1000 > Date.now()) || !t.sub) return null;
  return { sub: String(t.sub), name: String(t.given_name || t.name || '') };
}

const enc = new TextEncoder();
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const rndHex = n => hex(crypto.getRandomValues(new Uint8Array(n)));
const sha = async s => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
async function pbkdf2(pw, saltHex) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  const salt = new Uint8Array(saltHex.match(/../g).map(h => parseInt(h, 16)));
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITER }, key, 256));
}
function same(a, b) { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }
function newUid() { const c = 'abcdefghijklmnopqrstuvwxyz0123456789', r = crypto.getRandomValues(new Uint8Array(15)); return 'u' + [...r].map(x => c[x % 36]).join(''); }

let ready = false;
async function init(db) {
  if (ready) return;
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS users (uid TEXT PRIMARY KEY, login TEXT UNIQUE NOT NULL, salt TEXT NOT NULL, hash TEXT NOT NULL, created INTEGER, save TEXT, saved INTEGER DEFAULT 0)'),
    db.prepare('CREATE TABLE IF NOT EXISTS sessions (tok TEXT PRIMARY KEY, uid TEXT NOT NULL, created INTEGER)'),
    db.prepare('CREATE TABLE IF NOT EXISTS fails (login TEXT PRIMARY KEY, n INTEGER, t INTEGER)')
  ]);
  try { await db.prepare('ALTER TABLE users ADD COLUMN banned INTEGER DEFAULT 0').run(); } catch (e) {}   // 계정 정지 칸 (이미 있으면 무시)
  try { await db.prepare('ALTER TABLE users ADD COLUMN google TEXT').run(); } catch (e) {}   // 연결된 구글 계정 고유번호
  await db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS users_google ON users(google)').run();
  for (const c of ['ban_until INTEGER DEFAULT 0', 'ban_reason TEXT', 'totp TEXT', 'totp_on INTEGER DEFAULT 0', 'admin_edit INTEGER DEFAULT 0'])   // 정지 기간·사유, 2단계 인증
    try { await db.prepare('ALTER TABLE users ADD COLUMN ' + c).run(); } catch (e) {}
  await db.prepare('CREATE TABLE IF NOT EXISTS config (k TEXT PRIMARY KEY, v TEXT)').run();   // 공지 · 랭킹 시즌 번호
  await db.prepare('CREATE TABLE IF NOT EXISTS presence (id TEXT PRIMARY KEY, t INTEGER, login TEXT, scene TEXT)').run();   // 지금 접속 중 (게임이 1분마다 알림)
  ready = true;
}
async function getConf(db, k, d) { const r = await db.prepare('SELECT v FROM config WHERE k = ?').bind(k).first(); return r ? r.v : d; }
// 공지 · 시즌 · 이벤트 · 선물을 한 번에 읽음 (게임이 10초마다 물어봐서 쿼리 1번으로)
async function pubConf(db) {
  const r = (await db.prepare("SELECT k, v FROM config WHERE k IN ('notice', 'season', 'event', 'gift', 'bal', 'mreset', 'rel', 'bcast')").all()).results || [];
  const c = Object.fromEntries(r.map(x => [x.k, x.v]));
  const pj = s => { try { return JSON.parse(s || 'null'); } catch (e) { return null; } };
  return { notice: c.notice || '', season: +c.season || 0, event: pj(c.event), gift: pj(c.gift), bal: pj(c.bal), mreset: +c.mreset || 0, rel: pj(c.rel) || {}, bcast: pj(c.bcast) };
}
const setConf = (db, k, v) =>db.prepare('INSERT INTO config (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v').bind(k, String(v)).run();
// 정지: banned=1 이고 ban_until이 0(영구)이거나 아직 안 지났으면 정지 중
const isBanned = u => !!(u && u.banned && (!u.ban_until || Date.now() < u.ban_until));
const kst = t => new Date(t + 9 * 3600000).toISOString().slice(0, 16).replace('T', ' ');
const banMsg = u => `정지된 계정이에요 (${u.ban_until ? kst(u.ban_until) + '까지' : '영구 정지'})${u.ban_reason ? ' · 사유: ' + u.ban_reason : ''}`;

// ---- 2단계 인증 (TOTP: 구글 OTP 같은 인증 앱의 6자리 숫자, 30초마다 바뀜) ----
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function b32dec(s) {
  let bits = 0, val = 0; const out = [];
  for (const ch of s.replace(/=+$/, '').toUpperCase()) { const i = B32.indexOf(ch); if (i < 0) continue; val = (val << 5) | i; bits += 5; if (bits >= 8) { out.push((val >>> (bits - 8)) & 255); bits -= 8; } }
  return new Uint8Array(out);
}
function b32enc(bytes) { let bits = 0, val = 0, s = ''; for (const b of bytes) { val = (val << 8) | b; bits += 8; while (bits >= 5) { s += B32[(val >>> (bits - 5)) & 31]; bits -= 5; } } if (bits) s += B32[(val << (5 - bits)) & 31]; return s; }
async function totpAt(secret, step) {
  const key = await crypto.subtle.importKey('raw', b32dec(secret), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const msg = new Uint8Array(8); let x = step; for (let i = 7; i >= 0; i--) { msg[i] = x & 255; x = Math.floor(x / 256); }
  const h = new Uint8Array(await crypto.subtle.sign('HMAC', key, msg)), o = h[19] & 15;
  return String((((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3]) % 1e6).padStart(6, '0');
}
async function totpOk(secret, code) {   // 앞뒤 30초까지 봐 줌 (폰 시계가 조금 틀려도 됨)
  code = String(code || '').replace(/\D/g, ''); if (!secret || code.length !== 6) return false;
  const st = Math.floor(Date.now() / 30000);
  for (const d of [0, -1, 1]) if (await totpAt(secret, st + d) === code) return true;
  return false;
}
// 로그인할 때 2단계 인증 확인: 코드가 없으면 { need2fa } 답, 틀리면 실패 횟수에 넣음 / 통과하면 null
async function check2fa(db, u, code) {
  if (!u.totp_on) return null;
  if (!code) return json({ need2fa: true });
  const now = Date.now(), f = await db.prepare('SELECT n, t FROM fails WHERE login = ?').bind(u.login).first();
  if (f && f.n >= FAIL_MAX && now - f.t < FAIL_WIN) return err('너무 많이 틀렸어요. 10분 뒤에 다시 해 주세요', 429);
  if (await totpOk(u.totp, code)) return null;
  const n = f && now - f.t < FAIL_WIN ? f.n + 1 : 1;
  await db.prepare('INSERT INTO fails (login, n, t) VALUES (?, ?, ?) ON CONFLICT(login) DO UPDATE SET n = excluded.n, t = excluded.t').bind(u.login, n, now).run();
  return err('인증 코드가 틀렸어요. 인증 앱의 지금 숫자를 넣어 주세요', 401);
}
async function body(req) { try { return await req.json(); } catch (e) { return null; } }
async function newSession(db, uid) {
  const token = rndHex(32);
  await db.prepare('INSERT INTO sessions (tok, uid, created) VALUES (?, ?, ?)').bind(await sha(token), uid, Date.now()).run();
  return token;
}
async function who(db, req) {
  const m = (req.headers.get('Authorization') || '').match(/^Bearer ([0-9a-f]{64})$/);
  if (!m) return null;
  return db.prepare('SELECT u.uid, u.login, u.save, u.saved, u.banned, u.ban_until, u.ban_reason, u.google, u.hash, u.totp, u.totp_on, u.admin_edit FROM sessions s JOIN users u ON u.uid = s.uid WHERE s.tok = ?').bind(await sha(m[1])).first();
}
function checkSave(s) {
  if (s === undefined || s === null) return { ok: true, v: null };
  const v = JSON.stringify(s);
  if (typeof s !== 'object' || Array.isArray(s)) return { ok: false };
  if (v.length > MAX_SAVE) return { ok: false, msg: '저장 데이터가 너무 커요' };
  return { ok: true, v };
}

// ---- 관리자 ----
// 목록에서 보여 줄 요약값 (저장 데이터는 { sgf_키: "JSON 문자열" } 모양)
const SUM_KEYS = { coin: 'sgf_coin', debt: 'sgf_debt', bank: 'sgf_bank', tp: 'sgf_tp', tpv2: 'sgf_tpv2', tpv3: 'sgf_tpv3', end: 'sgf_end', tycoon: 'sgf_tycoon', rbest: 'sgf_rbest' };
const sumCols = Object.entries(SUM_KEYS).map(([a, k]) => `json_extract(save, '$.${k}') AS s_${a}`).join(', ');
async function admin(req, env, db, path) {
  const me = await who(db, req);
  if (!me) return err('로그인이 필요해요', 401);
  const admins = adminList(env);
  if (!admins.includes(me.login)) return err('관리자만 쓸 수 있어요', 403);
  const url = new URL(req.url), now = Date.now();
  const target = async uid => uid ? db.prepare('SELECT uid, login, created, save, saved, banned, ban_until, ban_reason, totp_on, google IS NOT NULL AS g, (hash IS NULL OR length(hash) = 0) AS gonly FROM users WHERE uid = ?').bind(String(uid)).first() : null;

  if (path === '/admin/stats' && req.method === 'GET') {
    const day = now - 86400000;
    const [a, b, c, d, e] = await Promise.all([
      db.prepare('SELECT COUNT(*) n FROM users').first(), db.prepare('SELECT COUNT(*) n FROM users WHERE banned = 1 AND (ban_until IS NULL OR ban_until = 0 OR ban_until > ?)').bind(now).first(),
      db.prepare('SELECT COUNT(*) n FROM users WHERE created > ?').bind(day).first(), db.prepare('SELECT COUNT(*) n FROM users WHERE saved > ?').bind(day).first(),
      db.prepare('SELECT COUNT(*) n FROM sessions').first()]);
    const on = (await db.prepare('SELECT id, login, scene, t FROM presence WHERE t > ? ORDER BY t DESC LIMIT 200').bind(now - 130000).all()).results || [];
    db.prepare('DELETE FROM presence WHERE t < ?').bind(now - 86400000).run().catch(() => {});
    return json({ users: a.n, banned: b.n, newToday: c.n, activeToday: d.n, sessions: e.n, admins, online: on.length, onlineList: on });
  }
  if (path === '/admin/users' && req.method === 'GET') {
    const q = normLogin(url.searchParams.get('q')), off = Math.max(0, +url.searchParams.get('offset') || 0), lim = Math.min(100, Math.max(1, +url.searchParams.get('limit') || 50));
    const order = { created: 'created DESC', saved: 'saved DESC', login: 'login ASC' }[url.searchParams.get('sort')] || 'created DESC';
    const where = q ? 'WHERE login LIKE ? OR uid = ?' : '';
    const args = q ? [`%${q}%`, q] : [];
    const rows = (await db.prepare(`SELECT uid, login, created, saved, banned, ban_until, ban_reason, totp_on, google IS NOT NULL AS g, ${sumCols}, (SELECT COUNT(*) FROM sessions s WHERE s.uid = users.uid) AS sessions FROM users ${where} ORDER BY ${order} LIMIT ? OFFSET ?`).bind(...args, lim, off).all()).results;
    const total = (await db.prepare(`SELECT COUNT(*) n FROM users ${where}`).bind(...args).first()).n;
    return json({ total, rows });
  }
  if (path === '/admin/user' && req.method === 'GET') {
    const u = await target(url.searchParams.get('uid')); if (!u) return err('없는 계정이에요', 404);
    const s = await db.prepare('SELECT COUNT(*) n FROM sessions WHERE uid = ?').bind(u.uid).first();
    const f = await db.prepare('SELECT n, t FROM fails WHERE login = ?').bind(u.login).first();
    return json({ ...u, save: u.save ? JSON.parse(u.save) : null, sessions: s.n, fails: f || null, isAdmin: admins.includes(u.login) });
  }
  if (path === '/admin/config' && req.method === 'GET') return json(await pubConf(db));
  const b = await body(req); if (!b) return err('잘못된 요청이에요');
  if (path === '/admin/event' && req.method === 'POST') {
    // 이벤트: 승리 코인 ×N · 티어 점수 ×N · 장사 매출 ×N · 잭팟(이기면 N% 확률로 코인 10배) · 룰렛 무료 +N번 · 룰렛 보상 2배 · 출석 보상 2배
    // (+ 안내 문구, 끝나는 시각). 예전 모양(coin2x 등)도 받음
    const hours = Math.max(0, Math.min(24 * 30, +b.hours || 0));
    const mul = (v, old, max) => { const n = Math.round(+v || (old ? 2 : 1)); return Math.max(1, Math.min(max, n)); };
    const ev = { coin: mul(b.coin, b.coin2x, 10), tp: mul(b.tp, b.tp2x, 5), ty: mul(b.ty, b.ty2x, 10),
      jackpot: Math.max(0, Math.min(50, Math.round(+b.jackpot || 0))), spins: Math.max(0, Math.min(10, Math.round(+b.spins || 0))),
      luck: !!b.luck, daily: !!b.daily, sale: Math.max(0, Math.min(90, Math.round(+b.sale || 0))), tix: Math.max(0, Math.min(10, Math.round(+b.tix || 0))),
      msg: String(b.msg || '').trim().slice(0, 60), until: hours ? now + hours * 3600000 : 0, id: now };
    ev.coin2x = ev.coin > 1; ev.tp2x = ev.tp > 1; ev.ty2x = ev.ty > 1;   // 아직 새로고침 안 한 옛 게임도 알아듣게
    const on = ev.coin > 1 || ev.tp > 1 || ev.ty > 1 || ev.jackpot > 0 || ev.spins > 0 || ev.luck || ev.daily || ev.sale > 0 || ev.tix > 0;
    await setConf(db, 'event', on ? JSON.stringify(ev) : 'null');
    return json({ ok: true, event: on ? ev : null });
  }
  if (path === '/admin/gift' && req.method === 'POST') {   // 🎁 선물 뿌리기: 지금 게임을 켜 둔(또는 기간 안에 켜는) 모든 사람이 한 번씩 받음
    const coins = Math.max(0, Math.min(1e12, Math.round(+b.coins || 0))), spins = Math.max(0, Math.min(20, Math.round(+b.spins || 0)));
    const items = Math.max(0, Math.min(10, Math.round(+b.items || 0)));
    const hours = Math.max(1, Math.min(24 * 30, +b.hours || 72));
    const ITEMS = ['bigRevive', 'rankShield', 'fullMeter', 'luckyCharm', 'revive', 'meter', 'hpup'];
    const item = ITEMS.includes(b.item) ? b.item : '', itemN = item ? Math.max(1, Math.min(20, Math.round(+b.itemN || 1))) : 0, ch = String(b.char || '').trim().slice(0, 20);
    const g = { id: now, coins, spins, items, item, itemN, char: ch, msg: String(b.msg || '').trim().slice(0, 60), until: now + hours * 3600000 };
    const on = coins > 0 || spins > 0 || items > 0 || !!item || !!ch;
    await setConf(db, 'gift', on ? JSON.stringify(g) : 'null');
    return json({ ok: true, gift: on ? g : null });
  }
  if (path === '/admin/release' && req.method === 'POST') {   // 🚀 업데이트 공개 (새 돼지 등): 한 번 켜면 끌 수 없음 — 추가만 되고 지우는 길은 없음
    const id = String(b.id || '').trim(); if (!['itadori', 'big1', 'big2'].includes(id) && !/^big([3-9]|[12]\d|3[01])$/.test(id)) return err('없는 업데이트예요');   // big3~big20: 미리 넣어 둔 대규모 업데이트
    let rel = {}; try { rel = JSON.parse(await getConf(db, 'rel', '{}')) || {}; } catch (e) {}
    if (!rel[id]) rel[id] = now;
    if (id === 'itadori' && (!rel.itadoriWin || b.reopen)) rel.itadoriWin = now;   // 이타돼리 퀘스트 기간(10일) 시작 · 관리자가 원하면 다시 열기
    await setConf(db, 'rel', JSON.stringify(rel));
    return json({ ok: true, rel });
  }
  if (path === '/admin/mreset' && req.method === 'POST') {   // 🎯 일일 미션 초기화: 모두의 오늘 미션을 새로 뽑고 진행·받기도 처음부터 (게임이 10초 안에 받아 감)
    await setConf(db, 'mreset', now); return json({ ok: true, mreset: now });
  }
  if (path === '/admin/balance' && req.method === 'POST') {   // 캐릭터 밸런스 패치: { 이름: { hp, power, speed, ultRate, cd } } (100 = 그대로, %)
    const bal = {}; const lim = v => Math.max(30, Math.min(300, Math.round(+v || 100)));
    for (const [k, v] of Object.entries(b.bal || {}).slice(0, 60)) { if (!v || typeof v !== 'object') continue; const o = {}; for (const f of ['hp', 'power', 'speed', 'ultRate', 'cd']) if (+v[f] && +v[f] !== 100) o[f] = lim(v[f]); if (Object.keys(o).length) bal[String(k).slice(0, 20)] = o; }
    await setConf(db, 'bal', JSON.stringify({ v: now, c: bal }));
    return json({ ok: true, bal: { v: now, c: bal } });
  }
  if (path === '/admin/broadcast' && req.method === 'POST') {   // 📣 관리자 화면 메시지: 모두의 화면에 팝업 + 위쪽 띠 (빈 글이면 끔)
    const t = String(b.text || '').trim().slice(0, 120), hours = Math.max(1, Math.min(24 * 7, +b.hours || 24));
    const bc = t ? { id: now, text: t, until: now + hours * 3600000 } : null;
    await setConf(db, 'bcast', JSON.stringify(bc)); return json({ ok: true, bcast: bc });
  }
  if (path === '/admin/notice' && req.method === 'POST') {   // 게임 타이틀에 뜨는 공지 (빈 글이면 공지 없음)
    const t = String(b.text || '').trim().slice(0, 200);
    await setConf(db, 'notice', t); await setConf(db, 'noticeT', now);
    return json({ ok: true, notice: t });
  }
  if (path === '/admin/season' && req.method === 'POST') {
    // 랭킹 시즌 초기화: 시즌 번호를 올리고 모든 회원 저장의 티어 점수·최고 연승·랭크전 기록을 0으로.
    // 게임은 켤 때 시즌 번호가 바뀐 걸 보면 이 기기 기록도 같이 지움 (게스트 포함). 랭킹 서버 기록은 관리자 페이지가 따로 지움.
    const season = (+(await getConf(db, 'season', 0)) || 0) + 1;
    await setConf(db, 'season', season);
    const r = await db.prepare(`UPDATE users SET save = json_set(save, '$.sgf_tp', '0', '$.sgf_rbest', '0', '$.sgf_ranked', 'false', '$.sgf_rank', '[]', '$.sgf_rkpending', 'false', '$.sgf_promo', 'null', '$.sgf_season', ?), saved = ? WHERE save IS NOT NULL AND json_valid(save)`).bind(String(season), now).run();
    return json({ ok: true, season, users: r.meta && r.meta.changes });
  }
  const u = await target(b.uid); if (!u) return err('없는 계정이에요', 404);
  const protectedAdmin = admins.includes(u.login) && u.uid !== me.uid;   // 다른 관리자는 정지·삭제 못 함
  if (path === '/admin/user' && req.method === 'PUT') {   // 저장 데이터 고치기 (saved를 지금으로 → 그 사람이 다음에 게임을 켜면 이 값으로 받아감)
    const s = checkSave(b.save); if (!s.ok) return err(s.msg || '저장 데이터 형식이 이상해요');
    await db.prepare('UPDATE users SET save = ?, saved = ?, admin_edit = ? WHERE uid = ?').bind(s.v, now, now, u.uid).run();
    return json({ ok: true, saved: now });
  }
  if (req.method !== 'POST') return err('없는 주소예요', 404);
  if (path === '/admin/user/password') {
    const pw = String(b.pw || ''); if (!PW_RE.test(pw)) return err('비밀번호는 영어·숫자·기호로 4~64자예요');
    const salt = rndHex(16);
    await db.batch([db.prepare('UPDATE users SET salt = ?, hash = ? WHERE uid = ?').bind(salt, await pbkdf2(pw, salt), u.uid),
      db.prepare('DELETE FROM sessions WHERE uid = ? AND uid != ?').bind(u.uid, me.uid), db.prepare('DELETE FROM fails WHERE login = ?').bind(u.login)]);
    return json({ ok: true });
  }
  if (path === '/admin/user/ban') {
    if (protectedAdmin || u.uid === me.uid) return err('관리자 계정은 정지할 수 없어요', 403);
    // days: 정지 일수 (0이면 영구), reason: 정지 사유 (정지당한 사람이 로그인할 때 보임)
    const ban = b.banned ? 1 : 0, days = Math.max(0, Math.min(3650, +b.days || 0));
    const until = ban && days ? now + days * 86400000 : 0, reason = ban ? String(b.reason || '').trim().slice(0, 100) : '';
    await db.prepare('UPDATE users SET banned = ?, ban_until = ?, ban_reason = ? WHERE uid = ?').bind(ban, until, reason || null, u.uid).run();
    if (ban) await db.prepare('DELETE FROM sessions WHERE uid = ?').bind(u.uid).run();
    return json({ ok: true, banned: ban, ban_until: until, ban_reason: reason });
  }
  if (path === '/admin/user/google-unlink') {   // 구글 연결 끊기 (실수로 따로 만든 계정 정리용)
    await db.prepare('UPDATE users SET google = NULL WHERE uid = ?').bind(u.uid).run();
    return json({ ok: true });
  }
  if (path === '/admin/user/2fa-off') {   // 폰을 잃어버린 사람: 2단계 인증 끄기
    await db.prepare('UPDATE users SET totp_on = 0, totp = NULL WHERE uid = ?').bind(u.uid).run();
    return json({ ok: true });
  }
  if (path === '/admin/user/logout') {
    await db.prepare('DELETE FROM sessions WHERE uid = ? AND uid != ?').bind(u.uid, me.uid).run();
    return json({ ok: true });
  }
  if (path === '/admin/user/unlock') {
    await db.prepare('DELETE FROM fails WHERE login = ?').bind(u.login).run();
    return json({ ok: true });
  }
  if (path === '/admin/user/rename') {
    const login = normLogin(b.login);
    if (!LOGIN_RE.test(login)) return err('아이디는 한글·영어·숫자 2~16자예요');
    if (protectedAdmin) return err('다른 관리자 아이디는 바꿀 수 없어요', 403);
    if (await db.prepare('SELECT 1 FROM users WHERE login = ? AND uid != ?').bind(login, u.uid).first()) return err('이미 있는 아이디예요', 409);
    await db.prepare('UPDATE users SET login = ? WHERE uid = ?').bind(login, u.uid).run();
    return json({ ok: true, login });
  }
  if (path === '/admin/user/delete') {
    if (protectedAdmin || u.uid === me.uid) return err('관리자 계정은 지울 수 없어요', 403);
    await db.batch([db.prepare('DELETE FROM sessions WHERE uid = ?').bind(u.uid), db.prepare('DELETE FROM fails WHERE login = ?').bind(u.login),
      db.prepare('DELETE FROM users WHERE uid = ?').bind(u.uid)]);
    return json({ ok: true });
  }
  return err('없는 주소예요', 404);
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const db = env.USERS;
    if (!db) return err('D1 바인딩(USERS)이 연결되지 않았어요', 500);
    await init(db);
    const path = new URL(req.url).pathname;

    if (path === '/signup' && req.method === 'POST') {
      const b = await body(req); if (!b) return err('잘못된 요청이에요');
      const login = normLogin(b.login), pw = String(b.pw || '');
      if (!LOGIN_RE.test(login)) return err('아이디는 한글·영어·숫자 2~16자예요 (띄어쓰기·특수문자 안 돼요)');
      if (!PW_RE.test(pw)) return err('비밀번호는 영어·숫자·기호로 4~64자예요 (한글·띄어쓰기 안 돼요)');
      const s = checkSave(b.save); if (!s.ok) return err(s.msg || '저장 데이터 형식이 이상해요');
      if (await db.prepare('SELECT 1 FROM users WHERE login = ?').bind(login).first()) return err('이미 있는 아이디예요', 409);
      const uid = newUid(), salt = rndHex(16), now = Date.now();
      try {
        await db.prepare('INSERT INTO users (uid, login, salt, hash, created, save, saved) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind(uid, login, salt, await pbkdf2(pw, salt), now, s.v, s.v ? now : 0).run();
      } catch (e) { return err('이미 있는 아이디예요', 409); }
      return json({ token: await newSession(db, uid), uid, login, saved: s.v ? now : 0 });
    }

    if (path === '/login' && req.method === 'POST') {
      const b = await body(req); if (!b) return err('잘못된 요청이에요');
      const login = normLogin(b.login), pw = String(b.pw || '');
      const now = Date.now();
      const f = await db.prepare('SELECT n, t FROM fails WHERE login = ?').bind(login).first();
      if (f && f.n >= FAIL_MAX && now - f.t < FAIL_WIN) return err('비밀번호를 너무 많이 틀렸어요. 10분 뒤에 다시 해 주세요', 429);
      const u = await db.prepare('SELECT uid, login, salt, hash, save, saved, banned, ban_until, ban_reason, google, totp, totp_on FROM users WHERE login = ?').bind(login).first();
      if (!u || !same(await pbkdf2(pw, u.salt), u.hash)) {
        const n = f && now - f.t < FAIL_WIN ? f.n + 1 : 1;
        await db.prepare('INSERT INTO fails (login, n, t) VALUES (?, ?, ?) ON CONFLICT(login) DO UPDATE SET n = excluded.n, t = excluded.t').bind(login, n, now).run();
        return err('아이디 또는 비밀번호가 틀렸어요', 401);
      }
      if (isBanned(u)) return err(banMsg(u), 403);
      const t2 = await check2fa(db, u, b.code); if (t2) return t2;   // 2단계 인증 켠 계정은 인증 앱 숫자까지 맞아야 함
      if (f) await db.prepare('DELETE FROM fails WHERE login = ?').bind(login).run();
      return json({ token: await newSession(db, u.uid), uid: u.uid, login: u.login, save: u.save ? JSON.parse(u.save) : null, saved: u.saved || 0, google: !!u.google });
    }

    if (path === '/google' && req.method === 'POST') {
      const b = await body(req); if (!b) return err('잘못된 요청이에요');
      const g = await googleSub(b.credential, env);
      if (!g) return err('구글 로그인을 확인하지 못했어요. 다시 해 주세요', 401);
      const u = await db.prepare('SELECT uid, login, save, saved, banned, ban_until, ban_reason, totp, totp_on FROM users WHERE google = ?').bind(g.sub).first();
      if (u) {   // 이미 연결된 계정 → 로그인
        if (isBanned(u)) return err(banMsg(u), 403);
        const t2 = await check2fa(db, u, b.code); if (t2) return t2;
        return json({ token: await newSession(db, u.uid), uid: u.uid, login: u.login, save: u.save ? JSON.parse(u.save) : null, saved: u.saved || 0, google: true, existed: true });
      }
      if (b.login === undefined) return json({ need: 'name', suggest: g.name.slice(0, 16) });   // 처음 온 구글 계정 → 새로 가입 또는 기존 아이디에 연결
      if (b.pw !== undefined) {   // 이미 있는 아이디에 이 구글 계정 연결 (아이디·비밀번호 확인) → 그 계정으로 로그인
        const login = normLogin(b.login), pw = String(b.pw || ''), now = Date.now();
        const f = await db.prepare('SELECT n, t FROM fails WHERE login = ?').bind(login).first();
        if (f && f.n >= FAIL_MAX && now - f.t < FAIL_WIN) return err('비밀번호를 너무 많이 틀렸어요. 10분 뒤에 다시 해 주세요', 429);
        const v = await db.prepare('SELECT uid, login, salt, hash, save, saved, banned, ban_until, ban_reason, google, totp, totp_on FROM users WHERE login = ?').bind(login).first();
        if (!v || !v.hash || !same(await pbkdf2(pw, v.salt), v.hash)) {
          const n = f && now - f.t < FAIL_WIN ? f.n + 1 : 1;
          await db.prepare('INSERT INTO fails (login, n, t) VALUES (?, ?, ?) ON CONFLICT(login) DO UPDATE SET n = excluded.n, t = excluded.t').bind(login, n, now).run();
          return err('아이디 또는 비밀번호가 틀렸어요', 401);
        }
        if (isBanned(v)) return err(banMsg(v), 403);
        const t2 = await check2fa(db, v, b.code); if (t2) return t2;
        if (f) await db.prepare('DELETE FROM fails WHERE login = ?').bind(login).run();
        if (v.google && v.google !== g.sub) return err('이 아이디는 이미 다른 구글 계정과 연결돼 있어요', 409);
        await db.prepare('UPDATE users SET google = ? WHERE uid = ?').bind(g.sub, v.uid).run();
        return json({ token: await newSession(db, v.uid), uid: v.uid, login: v.login, save: v.save ? JSON.parse(v.save) : null, saved: v.saved || 0, google: true, linked: true });
      }
      const login = normLogin(b.login);
      if (!LOGIN_RE.test(login)) return err('아이디는 한글·영어·숫자 2~16자예요 (띄어쓰기·특수문자 안 돼요)');
      const s = checkSave(b.save); if (!s.ok) return err(s.msg || '저장 데이터 형식이 이상해요');
      if (await db.prepare('SELECT 1 FROM users WHERE login = ?').bind(login).first()) return err('이미 있는 아이디예요', 409);
      const uid = newUid(), now = Date.now();
      try {   // 구글로만 가입한 계정은 비밀번호가 없음 (hash가 빈 값이라 비밀번호 로그인은 절대 안 맞음)
        await db.prepare('INSERT INTO users (uid, login, salt, hash, created, save, saved, google) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
          .bind(uid, login, rndHex(16), '', now, s.v, s.v ? now : 0, g.sub).run();
      } catch (e) { return err('이미 있는 아이디이거나 이미 가입한 구글 계정이에요', 409); }
      return json({ token: await newSession(db, uid), uid, login, saved: s.v ? now : 0, google: true });
    }
    if (path === '/google/link' || path === '/google/unlink') {
      if (req.method !== 'POST') return err('없는 주소예요', 404);
      const u = await who(db, req);
      if (!u) return err('로그인이 만료됐어요', 401);
      if (isBanned(u)) return err(banMsg(u), 403);
      if (path === '/google/unlink') {
        if (!u.hash) return err('구글로 가입한 계정은 연결을 끊을 수 없어요 (비밀번호가 없어요)');
        await db.prepare('UPDATE users SET google = NULL WHERE uid = ?').bind(u.uid).run();
        return json({ ok: true, google: false });
      }
      const b = await body(req); if (!b) return err('잘못된 요청이에요');
      const g = await googleSub(b.credential, env);
      if (!g) return err('구글 로그인을 확인하지 못했어요. 다시 해 주세요', 401);
      const o = await db.prepare('SELECT uid FROM users WHERE google = ?').bind(g.sub).first();
      if (o && o.uid !== u.uid) return err('이 구글 계정은 이미 다른 아이디에 연결돼 있어요', 409);
      await db.prepare('UPDATE users SET google = ? WHERE uid = ?').bind(g.sub, u.uid).run();
      return json({ ok: true, google: true });
    }

    if (path === '/save') {
      const u = await who(db, req);
      if (!u) return err('로그인이 만료됐어요', 401);
      if (isBanned(u)) return err(banMsg(u), 403);
      if (req.method === 'GET') return json({ uid: u.uid, login: u.login, save: u.save ? JSON.parse(u.save) : null, saved: u.saved || 0 });
      if (req.method === 'PUT') {
        const b = await body(req); if (!b) return err('잘못된 요청이에요');
        const s = checkSave(b.save); if (!s.ok) return err(s.msg || '저장 데이터 형식이 이상해요');
        const now = Date.now();
        if (u.admin_edit && u.admin_edit > (+b.base || 0)) return json({ conflict: true, save: u.save ? JSON.parse(u.save) : null, saved: u.saved || 0 }, 409);   // 관리자가 고친 뒤의 옛 기록으로 덮어쓰지 않게 → 게임이 새 기록을 받아 감
        await db.prepare('UPDATE users SET save = ?, saved = ? WHERE uid = ?').bind(s.v, now, u.uid).run();
        return json({ saved: now });
      }
    }

    // 공지 · 랭킹 시즌 (누구나 읽음, 게임 켤 때 한 번)
    // 로그인 토큰을 같이 보내면 내 계정 기록이 마지막으로 바뀐 시각(saved · 관리자 수정 시각)도 줌 → 게임이 바뀐 걸 바로 알아채고 받아 감
    if (path === '/config' && req.method === 'GET') {
      const c = await pubConf(db);
      const m = (req.headers.get('Authorization') || '').match(/^Bearer ([0-9a-f]{64})$/);
      let login = '';
      if (m) {
        const u = await db.prepare('SELECT u.login, u.saved, u.admin_edit FROM sessions s JOIN users u ON u.uid = s.uid WHERE s.tok = ?').bind(await sha(m[1])).first();
        if (u) { c.saved = u.saved || 0; c.adminEdit = u.admin_edit || 0; login = u.login; if (adminList(env).includes(u.login)) c.admin = true; if (testerList(env).includes(u.login)) c.tester = true; }
      }
      // 지금 접속 중 알림 (?p=기기번호&n=이름&s=화면): 게임이 1분마다 한 번 보냄 → 관리자 화면의 '지금 접속'
      const q = new URL(req.url).searchParams, p = String(q.get('p') || '').slice(0, 40);
      if (/^[0-9a-z]{6,40}$/i.test(p)) {
        const nm = login || ('게스트 ' + String(q.get('n') || '').slice(0, 16));
        await db.prepare('INSERT INTO presence (id, t, login, scene) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET t = excluded.t, login = excluded.login, scene = excluded.scene')
          .bind(p, Date.now(), nm, String(q.get('s') || '').slice(0, 20)).run();
      }
      return json(c);
    }

    // 2단계 인증: setup(비밀키 만들기) → on(인증 앱 숫자로 확인하면 켜짐) · off(숫자 확인하고 끄기) · GET 상태
    if (path.startsWith('/2fa')) {
      const u = await who(db, req);
      if (!u) return err('로그인이 만료됐어요', 401);
      if (isBanned(u)) return err(banMsg(u), 403);
      if (path === '/2fa' && req.method === 'GET') return json({ on: !!u.totp_on });
      if (req.method !== 'POST') return err('없는 주소예요', 404);
      const b = (await body(req)) || {};
      if (path === '/2fa/setup') {
        if (u.totp_on) return err('이미 2단계 인증이 켜져 있어요');
        const secret = b32enc(crypto.getRandomValues(new Uint8Array(20)));
        await db.prepare('UPDATE users SET totp = ? WHERE uid = ?').bind(secret, u.uid).run();
        const label = encodeURIComponent('삼겹살 파이터:' + u.login);
        return json({ secret, uri: `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent('삼겹살 파이터')}&digits=6&period=30` });
      }
      if (path === '/2fa/on') {
        if (u.totp_on) return json({ ok: true, on: true });
        if (!(await totpOk(u.totp, b.code))) return err('숫자가 틀렸어요. 인증 앱에 지금 보이는 6자리를 넣어 주세요');
        await db.prepare('UPDATE users SET totp_on = 1 WHERE uid = ?').bind(u.uid).run();
        return json({ ok: true, on: true });
      }
      if (path === '/2fa/off') {
        if (!u.totp_on) return json({ ok: true, on: false });
        if (!(await totpOk(u.totp, b.code))) return err('숫자가 틀렸어요. 인증 앱에 지금 보이는 6자리를 넣어 주세요');
        await db.prepare('UPDATE users SET totp_on = 0, totp = NULL WHERE uid = ?').bind(u.uid).run();
        return json({ ok: true, on: false });
      }
      return err('없는 주소예요', 404);
    }

    if (path === '/logout' && req.method === 'POST') {
      const m = (req.headers.get('Authorization') || '').match(/^Bearer ([0-9a-f]{64})$/);
      if (m) await db.prepare('DELETE FROM sessions WHERE tok = ?').bind(await sha(m[1])).run();
      return json({ ok: true });
    }
    if (path.startsWith('/admin/')) return admin(req, env, db, path);
    return err('없는 주소예요', 404);
  }
};
