// 📥 설치한 게임(앱)용 서비스 워커
// 항상 인터넷에서 새 파일을 먼저 받음 → 업데이트는 전처럼 바로 반영 (version.txt 자동 새로고침 그대로)
// 인터넷이 안 되면 저장해 둔 파일로 켬. ?v= 꼬리표는 빼고 파일마다 하나만 저장 (예전 버전이 쌓이지 않게)
const CACHE = 'sgf-app-1';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {})); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || /version\.txt$/.test(u.pathname) || r.headers.has('range')) return;   // 새 버전 확인·다른 서버는 그대로
  const key = u.origin + u.pathname;
  e.respondWith(fetch(r).then(res => {
    if (res.ok && res.status === 200 && res.type === 'basic') { const cp = res.clone(); caches.open(CACHE).then(c => c.put(key, cp)).catch(() => {}); }
    return res;
  }).catch(() => caches.match(key).then(m => m || (r.mode === 'navigate' ? caches.match(u.origin + u.pathname.replace(/[^/]*$/, '')) : undefined)).then(m => m || Response.error())));
});
