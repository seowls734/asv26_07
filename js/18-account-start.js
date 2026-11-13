// ================= 계정 창 (로그인 · 회원가입 · 게스트 선택) =================
// 글자 입력이 필요해서 캔버스가 아닌 HTML 창으로 띄움. 떠 있는 동안 게임 키 입력은 무시됨.
const authEl = document.createElement('div'); authEl.id = 'auth'; document.body.appendChild(authEl);
let authShown = false, authPage = '';
const escH = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function closeAuth() { authShown = false; authEl.style.display = 'none'; authEl.innerHTML = ''; for (const k in keys) keys[k] = false; }
// ---- 구글 로그인 (Google Identity Services) ----
// 구글이 준 ID 토큰을 회원 서버(/google)로 보내면 서버가 구글에 확인하고 계정을 찾거나 만듦. 처음 온 구글 계정은 닉네임만 정하면 가입.
let gsiP = null, gCred = '', gSuggest = '';
function loadGsi() {
  return gsiP || (gsiP = new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
    s.onload = ok; s.onerror = () => { gsiP = null; no(); }; document.head.appendChild(s);
  }));
}
function renderGoogle() {
  const el = authEl.querySelector('#gbtn'); if (!el) return;
  loadGsi().then(() => {
    if (!authEl.contains(el)) return;
    google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: r => onGoogle(r.credential), ux_mode: 'popup', auto_select: false });
    google.accounts.id.renderButton(el, { theme: 'filled_black', size: 'large', shape: 'pill', text: authPage === 'account' ? 'signin_with' : 'continue_with', locale: 'ko', width: Math.min(300, el.clientWidth || 280) });
  }).catch(() => { el.textContent = '구글 로그인을 불러오지 못했어요 (인터넷 확인)'; });
}
function onGoogle(cred) {
  if (!cred) return;
  if (authPage === 'account') {   // 로그인한 계정에 구글 연결
    authBusy(true, '구글 계정 연결 중...');
    authFetch('/google/link', 'POST', { credential: cred })
      .then(() => { setAuth({ ...auth, google: true }); openAuth('account'); SFX.confirm(); toast('✅ 구글 계정을 연결했어요! 다음부터 구글로 바로 로그인돼요'); })
      .catch(authFail);
    return;
  }
  gCred = cred; pend2fa = { credential: cred }; authBusy(true, '구글 계정 확인 중...');
  authFetch('/google', 'POST', { credential: cred })
    .then(d => authDone(d, 'login'))
    .catch(authFail);
}
let pend2fa = null;   // 2단계 인증 숫자를 기다리는 로그인 (아이디·비번 또는 구글 토큰)
function openAuth(page, arg) {
  authShown = true; authPage = page; authEl.style.display = 'flex';
  for (const k in keys) keys[k] = false;
  const idIn = ph => `<input id="a_id" placeholder="${ph}" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="16">`;
  let h = '';
  if (page === 'choose') h = `<h2>🐷 삼겹살 파이터</h2><p>어떻게 시작할까요?</p>
    ${GOOGLE_CLIENT_ID ? '<div id="gbtn"></div><div class="err"></div><div class="or">또는</div>' : ''}
    <button data-go="login">🔑 로그인</button><button data-go="signup">✨ 회원가입</button>
    ${auth ? '' : '<button class="sub" data-guest>👤 게스트로 하기</button>'}
    <small>게스트는 랭킹에 오르지 않고, 기록은 이 기기에만 저장돼요.<br>나중에 타이틀 화면 왼쪽 위에서 언제든 로그인·회원가입할 수 있어요.</small>`;
  else if (page === 'login') h = `<h2>🔑 로그인</h2>${idIn('아이디')}
    <input id="a_pw" type="password" placeholder="비밀번호" autocomplete="current-password" maxlength="64">
    <div class="err"></div><button data-ok>로그인</button><button class="sub" data-back>뒤로</button>
    <small>로그인하면 계정에 저장된 기록을 불러와요.</small>`;
  else if (page === 'signup') h = `<h2>✨ 회원가입</h2>${idIn('아이디 (한글·영어·숫자 2~16자)')}
    <input id="a_pw" type="password" placeholder="비밀번호 (영어·숫자 4자 이상)" autocomplete="new-password" maxlength="64">
    <input id="a_pw2" type="password" placeholder="비밀번호 확인" autocomplete="new-password" maxlength="64">
    <div class="err"></div><button data-ok>가입하기</button><button class="sub" data-back>뒤로</button>
    <small>지금까지 하던 기록(코인·티어 등)은 새 계정으로 그대로 옮겨져요.<br>다른 사이트에서 쓰는 비밀번호는 쓰지 마세요.</small>`;
  // 처음 온 구글 계정: 전에는 바로 새 계정을 만들어서, 이미 아이디가 있던 사람도 계정이 따로 하나 더 생겼음 → 먼저 고르게 함
  else if (page === 'gpick') h = `<h2>🔗 구글 계정 확인</h2><p>이 구글 계정에 연결된 아이디가 아직 없어요</p>
    <button data-go="glink">🔗 이미 아이디가 있어요 (내 계정에 연결)</button>
    <button class="sub" data-go="gname">✨ 처음이에요 (새 계정 만들기)</button>
    <button class="sub" data-back>뒤로</button>
    <small>이미 하던 아이디가 있으면 꼭 위 버튼을 눌러 주세요.<br>연결하면 다음부터 구글로 그 아이디에 바로 로그인돼요.</small>`;
  else if (page === 'glink') h = `<h2>🔗 내 계정에 구글 연결</h2><p>원래 쓰던 아이디와 비밀번호를 한 번만 넣어 주세요</p>${idIn('아이디')}
    <input id="a_pw" type="password" placeholder="비밀번호" autocomplete="current-password" maxlength="64">
    <div class="err"></div><button data-ok>연결하고 로그인</button><button class="sub" data-back>뒤로</button>
    <small>그 아이디의 기록을 그대로 불러와요.</small>`;
  else if (page === 'gname') h = `<h2>🐷 닉네임 정하기</h2><p>처음 오셨네요! 게임에서 쓸 닉네임을 정해 주세요</p>
    ${idIn('닉네임 (한글·영어·숫자 2~16자)')}
    <div class="err"></div><button data-ok>시작하기</button><button class="sub" data-back>뒤로</button>
    <small>닉네임은 랭킹에 보이고, 나중에 바꿀 수 없어요.<br>지금까지 하던 기록은 이 계정으로 그대로 옮겨져요.</small>`;
  else if (page === 'account') h = `<h2>👤 ${escH(auth.login)}</h2><p>로그인 중 · 기록이 계정에 자동 저장돼요</p>
    ${!GOOGLE_CLIENT_ID ? '' : auth.google ? '<p class="gok">✅ 구글 계정 연결됨 · 구글로도 로그인돼요</p>' : '<div id="gbtn"></div><div class="err"></div><small>구글 계정을 연결하면 다음부터 비밀번호 없이 구글로 로그인돼요</small>'}
    <button class="sub" data-go="tfa">🔐 2단계 인증 설정</button>
    <button data-logout>🚪 로그아웃</button><button class="sub" data-back>닫기</button>
    <small>로그아웃하면 이 기기의 기록은 지워지고 게스트로 바뀌어요. (계정 기록은 서버에 남아 있어요)</small>`;
  else if (page === '2fa') h = `<h2>🔐 2단계 인증</h2><p>인증 앱(구글 OTP 등)에 보이는 6자리 숫자를 넣어 주세요</p>
    <input id="a_code" inputmode="numeric" autocomplete="one-time-code" placeholder="6자리 숫자" maxlength="6">
    <div class="err"></div><button data-ok>확인</button><button class="sub" data-back>뒤로</button>
    <small>폰을 잃어버렸으면 관리자에게 2단계 인증을 꺼 달라고 하세요.</small>`;
  else if (page === 'tfa') { h = `<h2>🔐 2단계 인증</h2><div class="err">불러오는 중...</div><div id="tfa"></div><button class="sub" data-back>뒤로</button>`; setTimeout(tfaLoad); }
  // 처음 선택 화면이 아니면 닫을 수 있게
  if (page === 'choose' && auth) h += '<button class="sub" data-back>닫기</button>';
  authEl.innerHTML = `<div class="box">${h}</div>`;
  const f = authEl.querySelector('#a_id') || authEl.querySelector('#a_code');
  if (f && page === 'gname') f.value = String(gSuggest || '').normalize('NFC').toLowerCase().replace(/[^a-z0-9_가-힣]/g, '').slice(0, 16);   // 구글 이름을 닉네임 후보로
  if (f && !TOUCH) f.focus();
  if (GOOGLE_CLIENT_ID && !AUTH_TEST) renderGoogle();
}
function authBusy(on, msg) { authEl.querySelectorAll('button').forEach(b => b.disabled = on); const e = authEl.querySelector('.err'); if (e) e.textContent = msg || ''; }
function authSubmit() {
  if (authPage === '2fa') {   // 2단계 인증 숫자 넣고 다시 로그인
    const code = authEl.querySelector('#a_code').value.replace(/\D/g, '');
    if (code.length !== 6) return authBusy(false, '6자리 숫자를 넣어 주세요');
    if (!pend2fa) return openAuth('choose');
    authBusy(true, '확인 중...');
    return authFetch(pend2fa.credential ? '/google' : '/login', 'POST', { ...pend2fa, code }).then(d => authDone(d, 'login')).catch(authFail);
  }
  if (authPage === 'tfa') { const b = authEl.querySelector('[data-tfa]'); if (b) b.click(); return; }
  const page = authPage, id = authEl.querySelector('#a_id').value.trim().normalize('NFC').toLowerCase();
  if (!/^[a-z0-9_가-힣]{2,16}$/.test(id)) return authBusy(false, /[ㄱ-ㅎㅏ-ㅣ]/.test(id) ? '아이디에 낱자(ㄱ, ㅏ 등)는 못 써요' : '아이디는 한글·영어·숫자 2~16자예요 (띄어쓰기·특수문자 안 돼요)');
  if (page === 'glink') {   // 이미 있는 아이디에 구글 연결
    const pw = authEl.querySelector('#a_pw').value;
    if (!pw) return authBusy(false, '비밀번호를 넣어 주세요');
    pend2fa = { credential: gCred, login: id, pw }; authBusy(true, '연결 중...');
    return authFetch('/google', 'POST', pend2fa).then(d => authDone(d, 'login')).catch(authFail);
  }
  if (page === 'gname') {   // 구글로 처음 가입: 닉네임만 정하면 끝
    authBusy(true, '잠시만요...');
    return authFetch('/google', 'POST', { credential: gCred, login: id, save: collectSave() }).then(d => authDone(d, 'signup')).catch(authFail);
  }
  const pw = authEl.querySelector('#a_pw').value;
  if (!/^[!-~]{4,64}$/.test(pw)) return authBusy(false, /[^\x00-\x7f]/.test(pw) ? '비밀번호는 영어로 써 주세요 (한글 자판이 켜져 있어요)' : /\s/.test(pw) ? '비밀번호에 띄어쓰기는 못 써요' : '비밀번호는 4자 이상이에요');
  if (page === 'signup' && pw !== authEl.querySelector('#a_pw2').value) return authBusy(false, '비밀번호 확인이 달라요');
  authBusy(true, '잠시만요...');
  if (page === 'login') pend2fa = { login: id, pw };
  const req = page === 'signup' ? authFetch('/signup', 'POST', { login: id, pw, save: collectSave() }) :authFetch('/login', 'POST', { login: id, pw });
  req.then(d => authDone(d, page)).catch(authFail);
}
function authFail(e) { authBusy(false, e.status ? e.message : '서버에 연결하지 못했어요 (인터넷 확인)'); }
// 로그인·가입 성공 (아이디/비밀번호와 구글 둘 다 여기로)
function authDone(d, page) {
  if (d.need2fa) { openAuth('2fa'); return; }   // 2단계 인증 켠 계정 → 인증 앱 숫자 입력
  if (d.need === 'name') { gSuggest = d.suggest || ''; openAuth('gpick'); return; }   // 처음 온 구글 계정 → 새 계정 또는 기존 아이디 연결 고르기
  pend2fa = null;
  playerName = d.login;   // 회원 닉네임 = 아이디
  setAuth({ uid: d.uid, login: d.login, token: d.token, syncT: d.saved || 0, google: !!d.google });
  dropLegacyRank();
  if (page === 'login' && d.save) {   // 계정에 저장된 기록으로 바꾸고 다시 시작
    applySave(d.save);
    try { sessionStorage.setItem('sgf_msg', d.linked ? `🔗 구글 연결 완료! ${d.login}님 기록을 불러왔어요` : `🔑 ${d.login}님 로그인! 계정 기록을 불러왔어요`); } catch (e) {}
    location.reload(); return;
  }
  if (page === 'login') cloudPush();   // 계정에 저장된 기록이 없으면 지금 기록을 올림
  closeAuth(); uploadRank(); SFX.confirm();
  toast(page === 'signup' ? `✨ 가입 완료! ${d.login}님 환영해요` : `🔑 ${d.login}님 로그인!`);
}
function authLogout() {
  authBusy(true, '저장하고 로그아웃 중...');
  const done = () => {
    applySave({}); localStorage.setItem('sgf_story_seen', 'true');   // 이 기기의 기록 지움 (계정에는 남아 있음), 오프닝은 다시 안 봄
    setAuth({ guest: true });
    try { sessionStorage.setItem('sgf_msg', '🚪 로그아웃했어요. 지금은 게스트예요'); } catch (e) {}
    location.reload();
  };
  cloudPush().then(() => authFetch('/logout', 'POST')).catch(() => {}).finally(done);
}
// ---- 2단계 인증 설정 (내 계정 → 🔐) ----
let qrP = null;
const loadQr = () => qrP || (qrP = new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'; s.onload = ok; s.onerror = () => { qrP = null; no(); }; document.head.appendChild(s); }));
const tfaBox = html => { const el = authEl.querySelector('#tfa'); if (el) el.innerHTML = html; authBusy(false, ''); };
const codeIn = '<input id="a_code" inputmode="numeric" autocomplete="one-time-code" placeholder="인증 앱의 6자리 숫자" maxlength="6">';
function tfaLoad() {
  authFetch('/2fa').then(d => tfaBox(d.on
    ? `<p class="gok">✅ 2단계 인증이 켜져 있어요</p><small>로그인할 때 비밀번호(또는 구글) 다음에 인증 앱 숫자를 한 번 더 넣어요.</small>${codeIn}<button data-tfa="off">2단계 인증 끄기</button>`
    : `<p>로그인할 때 <b>폰 인증 앱의 숫자</b>까지 확인해서, 비밀번호가 새어 나가도 계정을 지켜 줘요.</p><button data-tfa="setup">🔐 2단계 인증 켜기</button>`))
    .catch(authFail);
}
function tfaAct(a) {
  const code = (authEl.querySelector('#a_code') || {}).value || '';
  if (a === 'setup') {
    authBusy(true, '준비 중...');
    authFetch('/2fa/setup', 'POST', {}).then(d => {
      tfaBox(`<small>① 폰에 <b>Google OTP</b>(Google Authenticator) 같은 인증 앱을 깔아요<br>② 앱에서 아래 QR을 찍어요 (이 폰이면 '앱에 바로 추가')<br>③ 앱에 나온 6자리 숫자를 넣어요</small>
        <div id="qr" style="display:flex;justify-content:center;margin:8px 0;background:#fff;padding:8px;border-radius:10px"></div>
        <a href="${escH(d.uri)}" style="display:block;color:#80d8ff;margin:4px 0">📲 인증 앱에 바로 추가</a>
        <small>직접 입력할 키: <b style="user-select:all;letter-spacing:1px">${d.secret.replace(/(.{4})/g, '$1 ').trim()}</b></small>${codeIn}<button data-tfa="on">확인하고 켜기</button>`);
      loadQr().then(() => { const q = authEl.querySelector('#qr'); if (q) new QRCode(q, { text: d.uri, width: 168, height: 168 }); }).catch(() => { const q = authEl.querySelector('#qr'); if (q) q.outerHTML = '<small>QR을 못 불러왔어요. 위 키를 앱에 직접 넣어 주세요</small>'; });
    }).catch(authFail);
  } else if (a === 'on' || a === 'off') {
    if (code.replace(/\D/g, '').length !== 6) return authBusy(false, '인증 앱의 6자리 숫자를 넣어 주세요');
    authBusy(true, '확인 중...');
    authFetch('/2fa/' + a, 'POST', { code }).then(() => { SFX.confirm(); toast(a === 'on' ? '🔐 2단계 인증을 켰어요! 다음 로그인부터 숫자를 물어봐요' : '2단계 인증을 껐어요'); openAuth('tfa'); }).catch(authFail);
  }
}
authEl.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  if (b.dataset.go) openAuth(b.dataset.go);
  else if ('guest' in b.dataset) { if (!auth) setAuth({ guest: true }); dropLegacyRank(); closeAuth(); toast('👤 게스트로 시작! 랭킹에는 오르지 않아요'); }
  else if ('ok' in b.dataset) authSubmit();
  else if ('logout' in b.dataset) authLogout();
  else if ('tfa' in b.dataset) tfaAct(b.dataset.tfa);
  else if ('back' in b.dataset) ['gname', 'glink'].includes(authPage) ? openAuth('gpick') : ['login', 'signup', 'gpick', '2fa'].includes(authPage) ? openAuth('choose') : authPage === 'tfa' ? openAuth('account') : closeAuth();
});
authEl.addEventListener('keydown', e => {   // 입력칸에서 친 키는 게임으로 안 넘어가게
  e.stopPropagation();
  if (e.key === 'Enter') { const b = authEl.querySelector('[data-ok]'); if (b && !b.disabled) authSubmit(); }
  else if (e.key === 'Escape') { const b = authEl.querySelector('[data-back]'); if (b) b.click(); }
});

const VIEW = new URLSearchParams(location.search).get('view');   // 스크린샷 확인용
if (VIEW === 'fight') { mode = 0; p1.setChar(withCos(CHARS[0], { hat: 'crown', fx: 'fxfire' })); p2.setChar(CHARS[6]); startMatch(); }
else if (VIEW === 'betpick') openBet();
else if (VIEW === 'market') { if (!fridge.length) { addDish(makeDish(MEATS[5].opts[0]), '갈비', 5); addDish(makeDish(MEATS[2].opts[0]), '등심', 4); addDish(makeDish(MEATS[4].opts[0]), '족', 3); } openMarket(); }
else if (VIEW === 'shop') { openMarket(); mk.tab = 1; }
else if (VIEW === 'reward') { RW.att = 3; RW.day = dayKey(); openReward(); rwMissions()[0].n = 1; RW.bonus = 2; RW.days = 3; for (let i = 0; i < 30; i++) step(); }
else if (VIEW === 'cyber') { mode = 0; p1.setChar(CHARS.find(c => c.name === '볼트돈')); p2.setChar(CHARS[1]); startMatch(); for (let i = 0; i < 125; i++) step(); p1.cyberT = 900; p1.x = 330; p2.x = 640; p1.state = 'idle'; lastGrp = 'fight'; fadeA = 0; step = () => {}; }
else if (VIEW === 'dv') { mode = 0; p1.setChar(CHARS.find(c => c.name === '볼트돈')); p2.setChar(CHARS.find(c => c.name === '볼트돈')); startMatch(); for (let i = 0; i < 125; i++) step(); p1.x = 380; p2.x = 580; p1.state = p2.state = 'idle'; lastGrp = 'fight'; fadeA = 0; step = () => {}; }
else if (VIEW && VIEW.startsWith('nrt')) { startNrTrailer(); const to = +VIEW.slice(3) || 250; for (let i = 0; i < to; i++) step(); step = () => {}; }
else if (VIEW === 'pigs') { coins = 3e9; lsSet('sgf_piglv', { '분홍이': 4, '깜돌이': 10 }); openPigs(); { const q = new URLSearchParams(location.search).get('sel'); if (q) PG.sel = CHARS.findIndex(c => c.name === q); } PG.sel = 1; for (let i = 0; i < 30; i++) step(); step = () => {}; lastGrp = 'pigs'; fadeA = 0; }
else if (VIEW === 'shop2') { openMarket(); mk.tab = 1; mk.sel = 22; for (let i = 0; i < 30; i++) step(); step = () => {}; lastGrp = 'market'; fadeA = 0; }
else if (VIEW === 'hudlong') { mode = 1; ranked = false; inv.eq.title = 'ttSpace'; inv.own.ttSpace = true; p1.setChar(CHARS.find(c => c.name === '금한돈')); p2.setChar(CHARS.find(c => c.name === '캡틴베이컨')); startMatch(); for (let i = 0; i < 125; i++) step(); lastGrp = 'fight'; fadeA = 0; step = () => {}; }
else if (VIEW === 'curse') { mode = 0; p1.setChar(CHARS.find(c => c.name === '이타돼리')); p2.setChar(CHARS.find(c => c.name === '돼루토')); startMatch(); for (let i = 0; i < 125; i++) step(); p1.x = 380; p2.x = 600; p1.curseT = 600; p2.foxT = 600; p1.state = 'crouch'; p2.state = 'idle'; for (let i = 0; i < 4; i++) step(); lastGrp = 'fight'; fadeA = 0; step = () => {}; }
else if (VIEW === 'qty') { coins = 5e6; openMarket(); mk.tab = 1; mk.sel = SHOP.findIndex(x => x.id === 'skinBox'); qm = { i: mk.sel, n: 3 }; for (let i = 0; i < 20; i++) draw(); step = () => {}; lastGrp = 'market'; fadeA = 0; }
else if (VIEW === 'suk') { mode = 1; ranked = false; lsSet('sgf_awake', { '이타돼리': { done: true } }); p1.setChar(CHARS.find(c => c.name === '이타돼리')); p2.setChar(CHARS[0]); startMatch(); for (let i = 0; i < 125; i++) step(); p1.x = 380; p2.x = 600; p1.state = 'idle'; lastGrp = 'fight'; fadeA = 0; step = () => {}; }
else if (VIEW && VIEW.startsWith('tour')) { startTour(); const to = +VIEW.slice(4) || 0; for (let i = 0; i < to; i++) { tut.t = 20; tourNext(); } for (let i = 0; i < 20; i++) { tut.t = 1; step(); } step = () => {}; fadeA = 0; lastGrp = scene; }
else if (VIEW === 'offer') { tutOffer = true; for (let i = 0; i < 10; i++) draw(); step = () => {}; }
else if (VIEW && VIEW.startsWith('tut')) { startTutorial(); for (let i = 0; i < 130; i++) step(); tut.i = +VIEW.slice(3) || 0; tut.t = 40; lastGrp = 'fight'; fadeA = 0; step = () => {}; }
else if (VIEW === 'blood') { mode = 0; p1.setChar(CHARS.find(c => c.name === '이타돼리')); p2.setChar(CHARS[0]); startMatch(); for (let i = 0; i < 125; i++) step(); p1.x = 200; p2.x = 760; p2.y = GROUND - 120; p1.state = 'idle'; p1.inp = { right: true }; p1.facing = 1; startSkill(p1, false); for (let i = 0; i < 24; i++) step(); lastGrp = 'fight'; fadeA = 0; step = () => {}; }
else if (VIEW === 'haecut') { mode = 0; p1.setChar(CHARS.find(c => c.name === '이타돼리')); p2.setChar(CHARS[0]); startMatch(); for (let i = 0; i < 125; i++) step(); p1.meter = 100; p1.state = 'idle'; startUlt(p1); for (let i = 0; i < IT_CUT + 18; i++) step(); lastGrp = 'fight'; fadeA = 0; step = () => {}; }
else if (VIEW === 'itcut2') { mode = 0; p1.setChar(CHARS.find(c => c.name === '이타돼리')); p2.setChar(CHARS[1]); startMatch(); for (let i = 0; i < 125; i++) step(); p1.meter = 100; p1.state = 'idle'; startUlt(p1); for (let i = 0; i < 70; i++) step(); lastGrp = 'fight'; fadeA = 0; step = () => {}; }
else if (VIEW === 'pigit') { coins = 1e9; lsSet('sgf_itmodulo', true); lsSet('sgf_itform', 'modulo'); openPigs(); PG.sel = CHARS.findIndex(c => c.name === '이타돼리'); for (let i = 0; i < 20; i++) step(); step = () => {}; lastGrp = 'pigs'; fadeA = 0; }
else if (VIEW === 'cutlist') { lsSet('sgf_trailer2', true); lsSet('sgf_nrtrailer', true); openCutList(); for (let i = 0; i < 10; i++) draw(); step = () => {}; }
else if (VIEW === 'pigskin') { inv.own['ps:분홍이:sig'] = true; inv.own['ps:분홍이:hue'] = true; inv.pskin = { '분홍이': 'sig' }; openPigs(); PG.sel = 0; for (let i = 0; i < 20; i++) step(); step = () => {}; lastGrp = 'pigs'; fadeA = 0; }
else if (VIEW === 'b2') { mode = 0; p1.setChar(CHARS.find(c => c.name === '캡틴베이컨')); p2.setChar(CHARS.find(c => c.name === '꿀린')); startMatch(); for (let i = 0; i < 125; i++) step(); p1.x = 330; p2.x = 630; p1.state = p2.state = 'idle'; lastGrp = 'fight'; fadeA = 0; step = () => {}; }
else if (VIEW === 'oldcut') { mode = 0; p1.setChar(CHARS[0]); p2.setChar(CHARS[1]); startMatch(); for (let i = 0; i < 125; i++) step(); p1.meter = 100; startUlt(p1); for (let i = 0; i < 50; i++) step(); lastGrp = 'fight'; fadeA = 0; step = () => {}; }
else if (VIEW === 'big') { mode = 0; p1.setChar(CHARS.find(c => c.name === '훈제돈')); p2.setChar(CHARS.find(c => c.name === '우주꿀돈')); startMatch(); for (let i = 0; i < 125; i++) step(); p1.x = 300; p2.x = 660; p1.state = p2.state = 'idle'; lastGrp = 'fight'; fadeA = 0; step = () => {}; }
else if (VIEW === 'big2') { mode = 0; p1.setChar(CHARS.find(c => c.name === '핑크하트')); p2.setChar(CHARS.find(c => c.name === '훈제돈')); startMatch(); for (let i = 0; i < 125; i++) step(); p1.x = 380; p2.x = 600; p1.state = p2.state = 'idle'; p1.meter = 100; startUlt(p1); for (let i = 0; i < BIG_CUT + 40; i++) step(); lastGrp = 'fight'; fadeA = 0; step = () => {}; }
else if (VIEW && VIEW.startsWith('bigcut')) { const nm = BIG_CHARS[+VIEW.slice(6) || 0]; mode = 0; p1.setChar(CHARS.find(c => c.name === nm)); p2.setChar(CHARS[1]); startMatch(); for (let i = 0; i < 125; i++) step(); p1.meter = 100; startUlt(p1); for (let i = 0; i < 60; i++) step(); lastGrp = 'fight'; fadeA = 0; step = () => {}; }
else if (VIEW === 'it') { mode = 0; p1.setChar(CHARS.find(c => c.name === '이타돼리')); p2.setChar(CHARS.find(c => c.name === '이타돼리')); startMatch(); for (let i = 0; i < 125; i++) step(); p1.x = 380; p2.x = 580; p1.state = p2.state = 'idle'; p2.curseT = 600; lastGrp = 'fight'; fadeA = 0; step = () => {}; }
else if (VIEW === 'itcut') { mode = 0; p1.setChar(CHARS.find(c => c.name === '이타돼리')); p2.setChar(CHARS[1]); startMatch(); for (let i = 0; i < 125; i++) step(); p1.meter = 100; startUlt(p1); for (let i = 0; i < 80; i++) step(); lastGrp = 'fight'; fadeA = 0; step = () => {}; }
else if (VIEW && VIEW.startsWith('itt')) { startItTrailer(); const to = +VIEW.slice(3) || 250; for (let i = 0; i < to; i++) step(); step = () => {}; }
else if (VIEW === 'nr') { mode = 0; p1.setChar(CHARS.find(c => c.name === '돼루토')); p2.setChar(CHARS.find(c => c.name === '돼루토')); startMatch(); for (let i = 0; i < 125; i++) step(); p1.x = 380; p2.x = 580; p1.state = p2.state = 'idle'; lastGrp = 'fight'; fadeA = 0; step = () => {}; }
else if (VIEW === 'rasencut') { mode = 0; p1.setChar(CHARS.find(c => c.name === '돼루토')); p2.setChar(CHARS[1]); startMatch(); for (let i = 0; i < 125; i++) step(); p1.inp = { down: true }; p1.state = 'idle'; startSkill(p1, false); for (let i = 0; i < 45; i++) step(); lastGrp = 'fight'; fadeA = 0; step = () => {}; }
else if (VIEW === 'cybercut') { mode = 0; p1.setChar(CHARS.find(c => c.name === '볼트돈')); p2.setChar(CHARS[1]); startMatch(); for (let i = 0; i < 125; i++) step(); p1.meter = 100; startUlt(p1); for (let i = 0; i < 45; i++) step(); lastGrp = 'fight'; fadeA = 0; step = () => {}; }
else if (VIEW === 'popup') { popup({ icon: '🎁', title: '관리자 선물 도착!', lines: ['🪙 +50,000 코인', '🎡 무료 룰렛 +3번', '주말 특별 선물!'], big: true }); for (let i = 0; i < 30; i++) step(); }
else if (VIEW === 'bank') { scene = 'bank'; }
else if (VIEW === 'tycoon' || VIEW === 'tylobby') {   // 장사 화면 확인용
  tyU = { ...TYU0(), side: 4, grill: 3, menu: 1, staff: 3, deco: 2, chain: 2, chains: ['강남', '홍대'], rating: 4.2, shifts: 5, hist: [1200, -300, 2500] }; openTycoon();
  if (VIEW === 'tycoon') { tyStart(); TY.ev = TY_EV[0]; for (let i = 0; i < 700; i++) step(); TY.banner = 0; }
}
else if (VIEW === 'select') { mode = 1; selFor = 'run'; scene = 'select'; sel.c1 = CHARS.findIndex(c => c.unlock != null); }
else if (VIEW === 'selstat') { lsSet('sgf_unlock_돼타로', true); mode = 1; selFor = 'run'; scene = 'select'; sel.c1 = CHARS.findIndex(c => c.name === '돼타로'); }
else if (VIEW === 'jo') { mode = 0; p1.setChar(CHARS.find(c => c.spirit)); p2.setChar(CHARS[6]); startMatch(); scene = 'fight'; p1.x = 330; p2.x = 640; if (/stand/.test(location.search)) { standToggle(p1); p1.x = 200; p2.x = 700; for (let i = 0; i < 30; i++) { p1.x = 200; step(); } }
  if (/punch/.test(location.search)) { startAtk(p1, 'rp'); for (let i = 0; i < 8; i++) step(); } step = () => {}; }   // 돼타로 모습 확인용
else if (VIEW === 'spirit' || VIEW === 'timestop' || VIEW === 'tscut') {   // 돼타로 수호령 확인용
  mode = 0; p1.setChar(CHARS.find(c => c.spirit)); p2.setChar(CHARS[6]); startMatch(); scene = 'fight'; p1.x = 330; p2.x = 560;
  if (VIEW === 'spirit') { startSkill(p1); for (let i = 0; i < 16; i++) step(); }
  else if (VIEW === 'tscut') { startUlt(p1); const n = +(new URLSearchParams(location.search).get('t') || 60); for (let i = 0; i < n; i++) step(); }
  else { startUlt(p1); for (let i = 0; i < TS_CUT + 70; i++) step(); }
  step = () => {};   // 이 장면에서 멈춰서 찍기
}
else if (VIEW === 'fx') { mode = 0; p1.setChar(CHARS[0]); p2.setChar(CHARS[6]); startMatch(); scene = 'fight'; p1.slowT = 600; p2.drunkT = 600; p2.flash = 999; }
else if (VIEW && VIEW.startsWith('story')) { startStory('intro'); story.i = +(VIEW.slice(5) || 0); story.t = 400; }
if (NETTEST) { sel.c1 = NETTEST === 'host' ? 3 : 7; playerName = NETTEST; NET.code = new URLSearchParams(location.search).get('code') || '4321'; scene = 'online'; if (NETTEST === 'host') netHost(); else setTimeout(netJoin, 6000); setInterval(() => console.log('NETSTATUS ' + NET.status + ' | ' + NET.err + ' | f=' + NET.f), 5000); }
setTimeout(() => { if (!AUTH_TEST) refundOldSkins(); }, 0);   // 예전 공용 스킨 → 환급
if (!location.search && !lsGet('sgf_story_seen', false)) startStory('intro');
else if (!auth && !AUTH_TEST) openAuth('choose');   // 오프닝은 봤지만 아직 게스트/회원을 고르지 않은 사람 (기존 플레이어)
cloudPull();   // 회원: 다른 기기에서 더 최근에 한 기록이 있으면 받아 옴
fetchConfig();   // 공지 · 랭킹 시즌
setTimeout(tyOffline, 3500);   // 무인 영업: 자리 비운 동안 영업한 만큼 받기 (계정 기록을 먼저 받아 온 뒤에)
try { const m = sessionStorage.getItem('sgf_msg'); if (m) { sessionStorage.removeItem('sgf_msg'); toast(m); } } catch (e) {}
if (!/autotest|view=|shot=|nettest/i.test(location.search)) rankedForfeit();   // 지난번 랭크전 판을 끝내지 않고 창을 닫았으면 패배 처리
let last = performance.now(), acc = 0;
function frame(now) {
  // 화면 갱신 간격의 미세한 흔들림(16.4ms, 16.9ms…)을 정확히 1프레임(16.67ms)으로 맞춤.
  // 안 맞추면 어떤 화면은 게임이 0번, 어떤 화면은 2번 진행돼서 움직임이 툭툭 끊겨 보임. 120Hz 화면은 2번에 1번 진행.
  let dt = Math.min(100, now - last); last = now;
  const STEP = 1000 / 60;
  if (Math.abs(dt - STEP) < 2) dt = STEP;
  else if (Math.abs(dt - STEP / 2) < 1.2) dt = STEP / 2;
  acc += dt;
  if (acc > STEP * 0.98 && acc < STEP) acc = STEP;   // 소수점 오차 때문에 한 프레임 밀리지 않게
  if (pressed.KeyM) { toggleMute(); delete pressed.KeyM; }
  if (pressed.KeyF && mode === 4) { bet4.fast = !bet4.fast; delete pressed.KeyF; }
  while (acc >= 1000 / 60) {
    if (mode === 3 && NET.ready) netTick();
    else { const ff = mode === 4 && bet4.fast && ['intro', 'fight', 'roundEnd'].includes(scene) ? 3 : 1; for (let r = 0; r < ff; r++) step(); }
    acc -= 1000 / 60;
  }

  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
if (new URLSearchParams(location.search).get('view') === 'perf') perfRun();
if (new URLSearchParams(location.search).get('view') === 'fuzz') fuzzRun();
// 밸런스 측정 (?view=balsim&n=2&newchars): CPU끼리 모든 짝을 한 라운드씩 붙여서 돼지마다 승률을 셈 (양쪽 자리 바꿔서 n번씩)
function balSim() {
  const P = new URLSearchParams(location.search), N = +P.get('n') || 2, realStep = step, CN = CHARS.length;
  step = () => {};
  const jobs = []; for (let i = 0; i < CN; i++) for (let j = 0; j < CN; j++) if (i !== j) for (let r = 0; r < N; r++) jobs.push([i, j]);
  const win = Array(CN).fill(0), game = Array(CN).fill(0), vs = CHARS.map(() => Array(CN).fill(0)), len = []; let q = 0;
  const out = document.createElement('pre'); out.id = 'balsim'; document.body.appendChild(out);
  const chunk = () => { try { chunk0(); } catch (e) { out.textContent += ' ERROR ' + e.message + ' ' + e.stack; console.log('SIMERR', e.message, e.stack); } };
  const chunk0 = () => {
    const t0 = performance.now();
    while (q < jobs.length && performance.now() - t0 < 200) {
      const [i, j] = jobs[q++]; mode = 0; p1.setChar(CHARS[i]); p2.setChar(CHARS[j]); startMatch();
      let fr = 0; const ts0 = performance.now(); while (scene !== 'roundEnd' && fr < 15000) { realStep(); fr++; } window.__st = (window.__st || 0) + performance.now() - ts0;
      len.push(fr); game[i]++; game[j]++;
      if (roundWinner === p1) { win[i]++; vs[i][j]++; } else if (roundWinner === p2) { win[j]++; vs[j][i]++; } else { win[i] += 0.5; win[j] += 0.5; }
      scene = 'title'; objs = [];
    }
    if (q < jobs.length) { out.textContent = `progress ${q}/${jobs.length} last=${len[len.length-1]} stepms=${Math.round(window.__st)} pop=${!!POP} scene=${scene} ${CHARS[jobs[q-1][0]].name}-${CHARS[jobs[q-1][1]].name}`; return setTimeout(chunk, 0); }
    const rows = CHARS.map((c, i) => [c.name, win[i] / game[i]]).sort((a, b) => b[1] - a[1]);
    out.textContent = 'BALSIM DONE avgFrames ' + Math.round(len.reduce((a, b) => a + b, 0) / len.length) + '\n' + rows.map(r => `${r[0]}\t${(r[1] * 100).toFixed(1)}%`).join('\n') + '\nVS\n' + CHARS.map((c, i) => c.name + '\t' + vs[i].join(',')).join('\n');
    console.log(out.textContent);
  };
  setTimeout(chunk, 0);
}
if (new URLSearchParams(location.search).get('view') === 'balsim') balSim();
if (VIEW === 'ultdmg') { const q = new URLSearchParams(location.search), me = CHARS.find(c => c.name === q.get('a')); const log = []; mode = 0; p1.setChar(me); p2.setChar(CHARS[0]); startMatch(); for (let n = 0; n < 130 && scene !== 'fight'; n++) step(); p1.x = 380; p2.x = 560; p1.facing = 1; p2.facing = -1; p1.state = 'idle'; p2.state = 'idle'; p1.meter = 100; startUlt(p1); const h0 = p2.hp; for (let n = 0; n < 120; n++) { p2.inp = {}; step(); if (n % 6 === 0) log.push(n + ':' + p1.state + '/' + p2.state + '/' + (h0 - p2.hp).toFixed(1) + '/' + (p1.ultHit ? 'H' : '-') + '/' + (p1.x | 0) + ',' + (p2.x | 0)); } const pre = document.createElement('pre'); pre.id = 'ud'; pre.textContent = log.join(' '); document.body.appendChild(pre); step = () => {}; }
else if (VIEW === 'promo') { step = () => { gT++; promoFxInput(); }; startPromoFx(+new URLSearchParams(location.search).get('i') || 3); for (let n = 0; n < (+new URLSearchParams(location.search).get('f') || 120); n++) promoFxInput(); }
else if (VIEW === 'poses') { step = () => {}; const pg = +new URLSearchParams(location.search).get('page') || 0, PO = [null, 'jab', 'punch', 'uppercut', 'throw', 'dash', 'spin', 'counter']; draw = () => {   // 무기 든 돼지 자세 확인용 (?view=poses&page=0|1|2)
  ctx.fillStyle = '#37474f'; ctx.fillRect(0, 0, W, H); const L = CHARS.filter(c => c.costume).slice(pg * 6, pg * 6 + 6);
  PO.forEach((m, j) => txt(m || 'idle', 60 + j * 115, 12, 11, '#fff', null));
  if (new URLSearchParams(location.search).get('ys')) { ctx.fillStyle = '#37474f'; ctx.fillRect(0, 0, W, H); const c = CHARS.find(x => x.name === '야구돈'); const L = [null, ...pigSkins(c)]; L.forEach((x, i) => drawPig(70 + (i % 5) * 190, 230 + (i / 5 | 0) * 260, 1, x ? skinLook(c.look, x) : c.look, { scale: 0.85, t: 40, move: i === 0 ? 'punch' : undefined, k: 0.5, wpnOut: i === 0 })); return; }
  if (new URLSearchParams(location.search).get('big')) { const B = new URLSearchParams(location.search).get('big').split(',').map(n => CHARS.find(c => c.name === n)).filter(Boolean); ctx.fillStyle = '#37474f'; ctx.fillRect(0, 0, W, H); B.forEach((c, i) => { drawPig(120 + i * 240, 250, 1, c.look, { scale: 1, t: 40 }); drawPig(120 + i * 240, 520, 1, c.look, { scale: 1, t: 40, move: 'punch', k: 1, wpnOut: true }); }); return; }
  L.forEach((c, i) => PO.forEach((m, j) => drawPig(50 + j * 115, 100 + i * 88, 1, c.look, { scale: 0.42, t: 40, move: m || undefined, k: 1, wpnOut: !!m }))); }; }
else if (VIEW === 'fightc') { const q = new URLSearchParams(location.search), fc = n => CHARS.find(c => c.name === n) || CHARS[0]; mode = +(q.get('mode') || 1); p1.setChar(fc(q.get('a'))); p2.setChar(fc(q.get('b'))); startMatch(); for (let n = 0; n < 160 && scene !== 'fight'; n++) step(); for (let n = 0; n < 30; n++) step(); if (q.get('atk')) { p1.x = 380; p2.x = 600; p1.facing = 1; p2.facing = -1; p1.state = 'idle'; p2.state = 'idle'; startAtk(p1, q.get('atk')); for (let n = 0; n < (+q.get('f') || 6); n++) { p2.inp = {}; p1.inp = {}; step(); } }
    if (q.get('ult')) { p1.x = 330; p2.x = 560; p1.facing = 1; p1.state = 'idle'; p1.meter = 100; startUlt(p1); for (let n = 0; n < +q.get('ult'); n++) step(); } step = () => {}; }   // 아무 돼지 싸움 화면 확인용 (&ult=프레임: 필살기) (?view=fightc&a=이름&b=이름)
else if (VIEW === 'selc') { mode = 1; selFor = 'run'; scene = 'select'; const i = CHARS.findIndex(c => c.name === new URLSearchParams(location.search).get('a')); if (i >= 0) sel.c1 = i; }
if (VIEW === 'skins') { step = () => {}; const pg = +new URLSearchParams(location.search).get('page') || 0; draw = () => {   // 스킨 모양 확인용 (?view=skins&page=0|1): 돼지마다 기본 · 리컬러 · 섀도우 · 대표 스킨
  ctx.fillStyle = '#263238'; ctx.fillRect(0, 0, W, H); gT++; const L = CHARS.slice(pg * 12, pg * 12 + 12), cw = W / 12;
  L.forEach((c, i) => { const sk = pigSkins(c); [null, ...sk].forEach((x, r) => drawPig(cw * i + cw / 2 - 10, 160 + r * 175, 1, x ? skinLook(c.look, x) : c.look, { scale: 0.62, t: gT })); txt(c.name, cw * i + cw / 2, 14, 13, '#fff', '#000', 3); }); }; }
