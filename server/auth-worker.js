// 삼겹살 파이터 회원 서버 (Cloudflare Workers + D1) — 랭킹 서버와 따로 운영
// 회원 정보와 게임 저장(진행 상황)만 다룸. 랭킹 기록은 여기 없음.
//   POST /signup  { login, pw, save? }  → { token, uid, login, saved }   회원가입 (게스트 기록을 save로 넘기면 이어짐)
//   POST /login   { login, pw }         → { token, uid, login, save, saved }
//   GET  /save    (Authorization: Bearer 토큰) → { uid, login, save, saved }
//   PUT  /save    (Bearer) { save }     → { saved }
//   POST /logout  (Bearer)              → { ok }
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
const LOGIN_RE = /^[a-z0-9_]{4,16}$/;

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
  return db.prepare('SELECT u.uid, u.login, u.save, u.saved FROM sessions s JOIN users u ON u.uid = s.uid WHERE s.tok = ?').bind(await sha(m[1])).first();
}
function checkSave(s) {
  if (s === undefined || s === null) return { ok: true, v: null };
  const v = JSON.stringify(s);
  if (typeof s !== 'object' || Array.isArray(s)) return { ok: false };
  if (v.length > MAX_SAVE) return { ok: false, msg: '저장 데이터가 너무 커요' };
  return { ok: true, v };
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
      const login = String(b.login || '').trim().toLowerCase(), pw = String(b.pw || '');
      if (!LOGIN_RE.test(login)) return err('아이디는 영어 소문자·숫자·_ 4~16자예요');
      if (pw.length < 4 || pw.length > 64) return err('비밀번호는 4~64자예요');
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
      const login = String(b.login || '').trim().toLowerCase(), pw = String(b.pw || '');
      const now = Date.now();
      const f = await db.prepare('SELECT n, t FROM fails WHERE login = ?').bind(login).first();
      if (f && f.n >= FAIL_MAX && now - f.t < FAIL_WIN) return err('비밀번호를 너무 많이 틀렸어요. 10분 뒤에 다시 해 주세요', 429);
      const u = await db.prepare('SELECT uid, login, salt, hash, save, saved FROM users WHERE login = ?').bind(login).first();
      if (!u || !same(await pbkdf2(pw, u.salt), u.hash)) {
        const n = f && now - f.t < FAIL_WIN ? f.n + 1 : 1;
        await db.prepare('INSERT INTO fails (login, n, t) VALUES (?, ?, ?) ON CONFLICT(login) DO UPDATE SET n = excluded.n, t = excluded.t').bind(login, n, now).run();
        return err('아이디 또는 비밀번호가 틀렸어요', 401);
      }
      if (f) await db.prepare('DELETE FROM fails WHERE login = ?').bind(login).run();
      return json({ token: await newSession(db, u.uid), uid: u.uid, login: u.login, save: u.save ? JSON.parse(u.save) : null, saved: u.saved || 0 });
    }

    if (path === '/save') {
      const u = await who(db, req);
      if (!u) return err('로그인이 만료됐어요', 401);
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
    return err('없는 주소예요', 404);
  }
};
