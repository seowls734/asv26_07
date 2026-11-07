// 삼겹살 파이터 랭킹 서버 (Cloudflare Workers + D1)
// Firebase Realtime Database와 같은 주소 규칙으로 동작해서, 게임은 주소만 추가하면 됨
//   GET    /rank.json        → { id: { name, tier, tp, streak, t }, ... }  (없으면 null)
//   GET    /rank.json?orderBy="tp"&limitToLast=150  → 티어 점수 상위 150명만 (streak도 가능)
//   PUT    /rank/<id>.json   → 내 기록 저장(덮어쓰기)
//   DELETE /rank/<id>.json   → 내 기록 삭제
// 설정: Worker의 D1 바인딩 변수 이름을 DB 로 연결할 것

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
};
const json = (d, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const int = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(v) || 0)));

let ready = false;   // 표는 처음 한 번만 만든다
async function init(db) {
  if (ready) return;
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS rank (id TEXT PRIMARY KEY, name TEXT, tier INTEGER, tp INTEGER, streak INTEGER, t INTEGER)'),
    // 색인: 상위 N명을 고를 때 표 전체를 훑지 않고 N줄만 읽게 함 (D1 무료 읽기 한도 절약)
    db.prepare('CREATE INDEX IF NOT EXISTS rank_tp ON rank (tp)'),
    db.prepare('CREATE INDEX IF NOT EXISTS rank_streak ON rank (streak)')
  ]);
  ready = true;
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (!env.DB) return json({ error: 'D1 바인딩(DB)이 연결되지 않았어요' }, 500);
    await init(env.DB);
    const url = new URL(req.url), path = url.pathname;

    // 랭킹: ?orderBy="tp"&limitToLast=N 이면 그 항목 상위 N명만 (Firebase와 같은 질의 방식)
    //        질의가 없으면 티어 상위 300 + 연승 상위 300을 합쳐서 돌려줌
    if (path === '/rank.json' && req.method === 'GET') {
      const q = (col, n) => env.DB.prepare(`SELECT * FROM rank ORDER BY ${col} DESC LIMIT ?`).bind(n).all();
      const ob = (url.searchParams.get('orderBy') || '').replace(/"/g, '');
      const rs = ['tp', 'streak'].includes(ob) ? [await q(ob, int(url.searchParams.get('limitToLast'), 1, 300))]
        : await Promise.all([q('tp', 300), q('streak', 300)]);
      const out = {};
      for (const r of rs.flatMap(x => x.results)) out[r.id] = { name: r.name, tier: r.tier, tp: r.tp, streak: r.streak, t: r.t };
      return json(Object.keys(out).length ? out : null);
    }

    const m = path.match(/^\/rank\/([a-z0-9]{4,32})\.json$/);
    if (m) {
      const id = m[1];
      if (req.method === 'PUT') {
        let b; try { b = await req.json(); } catch (e) { return json({ error: 'JSON 형식이 아니에요' }, 400); }
        const row = [id, String(b.name || '?').slice(0, 16), int(b.tier, 0, 99), int(b.tp, 0, 1e6), int(b.streak, 0, 1e5), int(b.t, 0, 9e15)];
        await env.DB.prepare('INSERT INTO rank (id, name, tier, tp, streak, t) VALUES (?, ?, ?, ?, ?, ?) ' +
          'ON CONFLICT(id) DO UPDATE SET name = excluded.name, tier = excluded.tier, tp = excluded.tp, streak = excluded.streak, t = excluded.t')
          .bind(...row).run();
        return json({ ok: true });
      }
      if (req.method === 'DELETE') {
        await env.DB.prepare('DELETE FROM rank WHERE id = ?').bind(id).run();
        return json(null);
      }
    }
    return json({ error: '없는 주소예요' }, 404);
  }
};
