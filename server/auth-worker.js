// 삼겹살 파이터 회원 서버 (Cloudflare Workers + D1) — 랭킹 서버와 따로 운영
// 회원 정보와 게임 저장(진행 상황)만 다룸. 랭킹 기록은 여기 없음.
//   POST /signup  { login, pw, save? }  → { token, uid, login, saved }   회원가입 (게스트 기록을 save로 넘기면 이어짐)
//   POST /login   { login, pw }         → { token, uid, login, save, saved }
//   GET  /save    (Authorization: Bearer 토큰) → { uid, login, save, saved }
//   PUT  /save    (Bearer) { save }     → { saved }
//   POST /logout  (Bearer)              → { ok }
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
  ready = true;
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
  return db.prepare('SELECT u.uid, u.login, u.save, u.saved, u.banned FROM sessions s JOIN users u ON u.uid = s.uid WHERE s.tok = ?').bind(await sha(m[1])).first();
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
const SUM_KEYS = { coin: 'sgf_coin', debt: 'sgf_debt', bank: 'sgf_bank', tp: 'sgf_tp', end: 'sgf_end', tycoon: 'sgf_tycoon', rbest: 'sgf_rbest' };
const sumCols = Object.entries(SUM_KEYS).map(([a, k]) => `json_extract(save, '$.${k}') AS s_${a}`).join(', ');
async function admin(req, env, db, path) {
  const me = await who(db, req);
  if (!me) return err('로그인이 필요해요', 401);
  const admins = adminList(env);
  if (!admins.includes(me.login)) return err('관리자만 쓸 수 있어요', 403);
  const url = new URL(req.url), now = Date.now();
  const target = async uid => uid ? db.prepare('SELECT uid, login, created, save, saved, banned FROM users WHERE uid = ?').bind(String(uid)).first() : null;

  if (path === '/admin/stats' && req.method === 'GET') {
    const day = now - 86400000;
    const [a, b, c, d, e] = await Promise.all([
      db.prepare('SELECT COUNT(*) n FROM users').first(), db.prepare('SELECT COUNT(*) n FROM users WHERE banned = 1').first(),
      db.prepare('SELECT COUNT(*) n FROM users WHERE created > ?').bind(day).first(), db.prepare('SELECT COUNT(*) n FROM users WHERE saved > ?').bind(day).first(),
      db.prepare('SELECT COUNT(*) n FROM sessions').first()]);
    return json({ users: a.n, banned: b.n, newToday: c.n, activeToday: d.n, sessions: e.n, admins });
  }
  if (path === '/admin/users' && req.method === 'GET') {
    const q = normLogin(url.searchParams.get('q')), off = Math.max(0, +url.searchParams.get('offset') || 0), lim = Math.min(100, Math.max(1, +url.searchParams.get('limit') || 50));
    const order = { created: 'created DESC', saved: 'saved DESC', login: 'login ASC' }[url.searchParams.get('sort')] || 'created DESC';
    const where = q ? 'WHERE login LIKE ? OR uid = ?' : '';
    const args = q ? [`%${q}%`, q] : [];
    const rows = (await db.prepare(`SELECT uid, login, created, saved, banned, ${sumCols}, (SELECT COUNT(*) FROM sessions s WHERE s.uid = users.uid) AS sessions FROM users ${where} ORDER BY ${order} LIMIT ? OFFSET ?`).bind(...args, lim, off).all()).results;
    const total = (await db.prepare(`SELECT COUNT(*) n FROM users ${where}`).bind(...args).first()).n;
    return json({ total, rows });
  }
  if (path === '/admin/user' && req.method === 'GET') {
    const u = await target(url.searchParams.get('uid')); if (!u) return err('없는 계정이에요', 404);
    const s = await db.prepare('SELECT COUNT(*) n FROM sessions WHERE uid = ?').bind(u.uid).first();
    const f = await db.prepare('SELECT n, t FROM fails WHERE login = ?').bind(u.login).first();
    return json({ ...u, save: u.save ? JSON.parse(u.save) : null, sessions: s.n, fails: f || null, isAdmin: admins.includes(u.login) });
  }
  const b = await body(req); if (!b) return err('잘못된 요청이에요');
  const u = await target(b.uid); if (!u) return err('없는 계정이에요', 404);
  const protectedAdmin = admins.includes(u.login) && u.uid !== me.uid;   // 다른 관리자는 정지·삭제 못 함
  if (path === '/admin/user' && req.method === 'PUT') {   // 저장 데이터 고치기 (saved를 지금으로 → 그 사람이 다음에 게임을 켜면 이 값으로 받아감)
    const s = checkSave(b.save); if (!s.ok) return err(s.msg || '저장 데이터 형식이 이상해요');
    await db.prepare('UPDATE users SET save = ?, saved = ? WHERE uid = ?').bind(s.v, now, u.uid).run();
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
    const ban = b.banned ? 1 : 0;
    await db.prepare('UPDATE users SET banned = ? WHERE uid = ?').bind(ban, u.uid).run();
    if (ban) await db.prepare('DELETE FROM sessions WHERE uid = ?').bind(u.uid).run();
    return json({ ok: true, banned: ban });
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
      const u = await db.prepare('SELECT uid, login, salt, hash, save, saved, banned FROM users WHERE login = ?').bind(login).first();
      if (!u || !same(await pbkdf2(pw, u.salt), u.hash)) {
        const n = f && now - f.t < FAIL_WIN ? f.n + 1 : 1;
        await db.prepare('INSERT INTO fails (login, n, t) VALUES (?, ?, ?) ON CONFLICT(login) DO UPDATE SET n = excluded.n, t = excluded.t').bind(login, n, now).run();
        return err('아이디 또는 비밀번호가 틀렸어요', 401);
      }
      if (f) await db.prepare('DELETE FROM fails WHERE login = ?').bind(login).run();
      if (u.banned) return err('정지된 계정이에요. 관리자에게 문의하세요', 403);
      return json({ token: await newSession(db, u.uid), uid: u.uid, login: u.login, save: u.save ? JSON.parse(u.save) : null, saved: u.saved || 0 });
    }

    if (path === '/save') {
      const u = await who(db, req);
      if (!u) return err('로그인이 만료됐어요', 401);
      if (u.banned) return err('정지된 계정이에요', 403);
      if (req.method === 'GET') return json({ uid: u.uid, login: u.login, save: u.save ? JSON.parse(u.save) : null, saved: u.saved || 0 });
      if (req.method === 'PUT') {
        const b = await body(req); if (!b) return err('잘못된 요청이에요');
        const s = checkSave(b.save); if (!s.ok) return err(s.msg || '저장 데이터 형식이 이상해요');
        const now = Date.now();
        await db.prepare('UPDATE users SET save = ?, saved = ? WHERE uid = ?').bind(s.v, now, u.uid).run();
        return json({ saved: now });
      }
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
