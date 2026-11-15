// ================= 📥 게임 다운로드 (앱처럼 설치 · PWA) =================
// 크롬·엣지·삼성 인터넷(안드로이드·PC): 버튼 한 번에 설치 창 · 아이폰/아이패드 사파리: 공유 → 홈 화면에 추가 안내
// 설치하면 바탕화면·홈 화면의 🐷 아이콘으로 주소창 없이 전체 화면으로 켜짐 · 한 번 받은 파일은 저장돼서 인터넷이 끊겨도 켜짐 (sw.js)
let installEvt = null, appInstalled = false;
const isStandalone = () => { try { return matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true; } catch (e) { return false; } };
const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; });
addEventListener('appinstalled', () => { appInstalled = true; installEvt = null; lsSet('sgf_installed', true); toast('📥 다운로드 완료! 바탕화면·홈 화면의 🐷 아이콘으로 켜요'); });
if ('serviceWorker' in navigator && location.protocol === 'https:' && !AUTH_TEST) addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
const showInstall = () => !AUTH_TEST && !isStandalone() && !appInstalled;
function doInstall() {
  SFX.confirm();
  if (installEvt) {
    const e = installEvt; installEvt = null;
    try { e.prompt(); (e.userChoice || Promise.resolve({})).then(r => { if (r && r.outcome === 'accepted') toast('📥 다운로드 중... 끝나면 아이콘이 생겨요'); }).catch(() => {}); } catch (er) {}
    return;
  }
  const L = isIOS() ? ['1. 사파리 아래(또는 위)의 공유 버튼 (□↑) 누르기', '2. 「홈 화면에 추가」 누르기 → 「추가」', '🐷 홈 화면 아이콘으로 앱처럼 전체 화면으로 켜져요']
    : TOUCH ? ['1. 브라우저 메뉴 (⋮) 누르기', '2. 「앱 설치」 또는 「홈 화면에 추가」 누르기', '🐷 홈 화면 아이콘으로 앱처럼 전체 화면으로 켜져요']
    : ['1. 주소창 오른쪽의 설치 아이콘 (⊕ / 🖥️) 누르기', '   (안 보이면 메뉴 ⋮ → 「앱」 / 「저장 및 공유」 → 「설치」)', '🐷 바탕화면 아이콘으로 창 하나에 게임처럼 켜져요'];
  popup({ icon: '📥', title: '게임 다운로드', lines: L, big: true });
}
function drawInstallBtn() {   // 타이틀 오른쪽 위 (설치한 앱으로 켰으면 안 보임)
  if (!showInstall()) return;
  const y = TOUCH ? 66 : 96, x = W - 112, glow = gT % 60 < 30;
  ctx.fillStyle = glow ? 'rgba(46,125,50,0.95)' : 'rgba(67,160,71,0.85)'; rr(x, y, 100, 26, 8); ctx.fill();
  txt('📥 다운로드', x + 50, y + 13, 13, '#fff', null);
  addHot(x, y, 100, 26, () => doInstall());
}
