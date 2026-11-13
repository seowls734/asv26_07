// ================= 📖 튜토리얼: 꿀선생이 하나하나 알려 줌 (mode 5 = 연습 싸움, 허수아비는 가만히 있고 체력이 안 닳음) =================
// 단계마다 실제로 해 보면 "잘했어!" 하고 다음으로. 싸움을 다 배우면 메뉴 소개 → 졸업 선물
const K = c => keyName(MAP1[c]);
const TUT = [
  { t: () => '안녕! 나는 꿀선생이야 🐷📚\n삼겹살 파이터를 처음부터 끝까지 알려 줄게.\n앞에 있는 건 연습용 허수아비 돼지야. 안 때리니까 걱정 마!', tap: true },
  { t: () => TOUCH ? '왼쪽 조이스틱을 좌우로 밀어서\n앞뒤로 움직여 봐!' : `${K('left')} · ${K('right')} 키로\n앞뒤로 움직여 봐!`, ok: T => T.moved > 160 },
  { t: () => TOUCH ? '조이스틱을 위로 밀면 점프!' : `${K('up')} 키로 점프!`, ok: () => p1.y < GROUND - 60 },
  { t: () => (TOUCH ? '조이스틱을 아래로 당기면 앉기!' : `${K('down')} 키로 앉기!`) + '\n앉으면 높은 공격(약펀치·강킥)을 피할 수 있어.', ok: T => T.crouch > 20 },
  { t: () => (TOUCH ? '조이스틱을 상대 반대쪽(뒤)으로 당기고 있어 봐.' : '상대 반대쪽(뒤) 방향키를 누르고 있어 봐.') + '\n그게 막기야! 1초 동안 막아 보자.\n(앉아서 뒤 = 낮은 공격 막기)', ok: T => T.block > 60 },
  { t: () => (TOUCH ? '펀치 버튼' : `${K('lp')}(약펀치) · ${K('rp')}(강펀치)`) + '로 허수아비를 3번 때려 봐!\n약한 건 빠르고, 강한 건 아파.', ok: T => T.punch >= 3 },
  { t: () => (TOUCH ? '킥 버튼' : `${K('lk')}(약킥) · ${K('rk')}(강킥)`) + '으로 3번 차 봐!\n킥은 펀치보다 멀리 닿아.', ok: T => T.kick >= 3 },
  { t: () => '이번엔 콤보! 붙어서 빠르게 이어 때리면\n상대가 휘청이는 동안 계속 맞아.\n3콤보를 만들어 봐!', ok: () => p1.combo >= 3 },
  { t: () => (TOUCH ? '업어치기 버튼' : `${K('grab')} 키`) + '로 업어치기!\n가까이 붙어야 잡혀. 막고 있는 상대도 잡을 수 있어.', ok: T => T.grab >= 1 },
  { t: () => (TOUCH ? '스킬 버튼' : `${K('skill')} 키`) + '로 스킬!\n돼지마다 스킬이 다 달라. 쓰고 나면 잠깐 기다려야 해.', ok: T => T.skill.has(0) },
  { t: () => (TOUCH ? '조이스틱을 아래로 당긴 채 스킬 버튼!' : `${K('down')}를 누른 채 ${K('skill')}!`) + '\n두 번째 스킬이 나와.', ok: T => T.skill.has(1), prep: () => { p1.skillCD = 0; } },
  { t: () => (TOUCH ? '조이스틱을 왼쪽이나 오른쪽으로 민 채 스킬 버튼!' : `왼쪽이나 오른쪽 방향키를 누른 채 ${K('skill')}!`) + '\n세 번째 스킬이야. 돼지마다 스킬이 3개씩!', ok: T => T.skill.has(2), prep: () => { p1.skillCD = 0; } },
  { t: () => '때리고 맞으면 아래 노란 필살 게이지가 차.\n꽉 차면 ' + (TOUCH ? '필살기 버튼' : `${K('ultD')} 키`) + '로 필살기! (지금 채워 줄게)\n필살기는 막을 수 없어!', ok: T => T.ult, prep: () => { p1.meter = 100; } },
  { t: () => '싸움은 다 배웠어! 정말 잘했어 👏\n이제 밖으로 나가서 메뉴를 하나씩 직접 보여 줄게.\n어디를 누르면 뭐가 되는지 다 알려 줄 테니 따라와!', tap: true, tour: true }
];
const tut = { tour: -1, i: 0, t: 0, ok: 0, moved: 0, lastX: 0, crouch: 0, block: 0, punch: 0, kick: 0, grab: 0, skill: new Set(), ult: false, prevAtk: null };
function startTutorial() {
  Object.assign(tut, { tour: -1, i: 0, t: 0, ok: 0, moved: 0, crouch: 0, block: 0, punch: 0, kick: 0, grab: 0, skill: new Set(), ult: false, prevAtk: null });
  mode = 5; ranked = false; streak = 0; bet = 0;
  p1.setChar(withCos(CHARS[0])); p2.setChar(CHARS[1]); startMatch();
  tut.lastX = p1.x;
}
function tutNext() {
  if (TUT[tut.i].tour) { startTour(); return; }   // 2부: 실제 화면 둘러보기
  if (TUT[tut.i].last) mode = 1;
  if (TUT[tut.i].last) { if (!lsGet('sgf_tut_done', false)) { lsSet('sgf_tut_done', true); addCoins(5000); cloudDirty(); } toTitle(); popup({ icon: '🎓', title: '튜토리얼 졸업!', lines: ['🪙 5,000 코인 받았어요 (처음 한 번만)', '이제 랭크전이나 연승 모드에 도전해 보세요!'], big: true }); return; }
  tut.i++; tut.t = 0; tut.ok = 0; SFX.bell(); if (TUT[tut.i].prep) TUT[tut.i].prep();
}
// 연습 싸움 매 프레임: 허수아비 체력·시간은 그대로, 내가 한 행동 세기
function tutTick() {
  if (mode !== 5) return;
  timer = ROUND_T; p2.hp = p2.maxHp; p1.hp = Math.max(p1.hp, p1.maxHp * 0.5);
  if (scene !== 'fight') return;
  const S = TUT[tut.i]; tut.t++;
  tut.moved += Math.abs(p1.x - tut.lastX); tut.lastX = p1.x;
  if (p1.state === 'crouch') tut.crouch++;
  if (p1.state === 'block' || p1.state === 'cblock') tut.block++;
  const a = p1.state === 'attack' && p1.atk;
  if (a && a !== tut.prevAtk) {
    const nm = a.name;
    if (['lp', 'rp', 'c_lp', 'c_rp', 'j_p'].includes(nm)) tut.punch++;
    if (['lk', 'rk', 'c_lk', 'c_rk', 'j_k'].includes(nm)) tut.kick++;
    if (nm === 'grab') tut.grab++;
    if (a.skill) tut.skill.add(p1.inp && p1.inp.down ? 1 : (p1.inp && (p1.inp.right || p1.inp.left)) ? 2 : 0);   // U · ↓+U · →+U
  }
  tut.prevAtk = a || null;
  if (p1.state === 'ult') tut.ult = true;
  if (p1.state === 'grabbing') tut.grab = Math.max(tut.grab, 1);
  if (!S.tap && S.ok && S.ok(tut) && !tut.ok) { tut.ok = 50; SFX.coin(); popText(p1.x, p1.y - 220, pick(['잘했어!', '완벽해!', '좋아!', '최고야!']), '#69f0ae', 30); }
  if (tut.ok > 0 && --tut.ok === 0) tutNext();
}
function tutInput() {   // 설명 단계: Enter · 탭으로 다음 / Esc 그만
  if (mode !== 5) return false;
  if (pressed.Escape) { mode = 1; toTitle(); return true; }
  const S = TUT[tut.i];
  if (S.tap && tut.t > 25 && (pressed.Enter || pressed.Space)) { pressed.Enter = pressed.Space = false; tutNext(); return true; }
  if (!S.tap && pressed.Tab) { tutNext(); return true; }   // (막히면 Tab으로 건너뛰기)
  return false;
}
// 꿀선생: 안경 · 학사모 · 지시봉
function drawTeacher(x, y, sc, talk) {
  const L = look('#ffcad4', '#c97b8e', '#ffe3e9', '#f5a3b5', '#5d4037', '#4e342e', '#1565c0', ['bold'], 1.02);
  drawPig(x, y, 1, L, { t: gT, scale: sc, victory: talk && (gT >> 4) % 2 === 0 });
  const hx = x + 36 * sc, hy = y - 90 * sc;
  ctx.strokeStyle = '#212121'; ctx.lineWidth = 2.5; ctx.fillStyle = 'rgba(200,230,255,0.35)';
  for (const dx of [2, 18]) { ctx.beginPath(); ctx.arc(hx + dx * sc, hy - 4 * sc, 7 * sc, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  line(hx + 9 * sc, hy - 4 * sc, hx + 11 * sc, hy - 4 * sc);
  ctx.fillStyle = '#212121'; ctx.beginPath(); ctx.moveTo(hx - 34 * sc, hy - 30 * sc); ctx.lineTo(hx + 4 * sc, hy - 44 * sc); ctx.lineTo(hx + 36 * sc, hy - 30 * sc); ctx.lineTo(hx + 2 * sc, hy - 18 * sc); ctx.closePath(); ctx.fill();
  ctx.fillRect(hx - 12 * sc, hy - 30 * sc, 26 * sc, 10 * sc);
  ctx.strokeStyle = '#ffd740'; ctx.lineWidth = 2; line(hx + 4 * sc, hy - 38 * sc, hx + 30 * sc, hy - 22 * sc);
  ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 4; line(x + 60 * sc, y - 60 * sc, x + 110 * sc, y - 120 * sc - Math.sin(gT * 0.15) * 6);   // 지시봉
  ctx.fillStyle = '#ff5252'; ctx.beginPath(); ctx.arc(x + 110 * sc, y - 120 * sc - Math.sin(gT * 0.15) * 6, 4, 0, Math.PI * 2); ctx.fill();
}
function drawTutorial() {
  if (mode !== 5) return;
  const S = TUT[tut.i], lines = S.t().split('\n'), h = 34 + lines.length * 22;
  ctx.fillStyle = 'rgba(10,6,24,0.86)'; rr(150, 120, W - 170, h, 14); ctx.fill(); ctx.strokeStyle = '#ffcc80'; ctx.lineWidth = 2; rr(150, 120, W - 170, h, 14); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.rect(14, 96, 136, 160); ctx.clip(); drawTeacher(70, 250, 0.75, true); ctx.restore();
  txt('꿀선생', 82, 260, 13, '#ffcc80', '#000', 3);
  lines.forEach((l, k) => txt(l, 170, 140 + k * 22, fitSize(l, 16, W - 210), '#fff', '#000', 3, 'left'));
  txt(`${tut.i + 1} / ${TUT.length}`, W - 30, 132, 11, '#aaa', null, 0, 'right');
  if (S.tap) { if (tut.t > 25 && gT % 40 < 28) txt(TOUCH ? '▶ 탭해서 다음' : '▶ Enter로 다음', W - 40, 120 + h - 14, 13, '#ffd740', '#000', 3, 'right'); addHot(150, 120, W - 170, h, () => { if (tut.t > 25) pressed.Enter = true; }); }
  else if (!TOUCH) txt('막히면 Tab: 건너뛰기 · Esc: 그만', W - 40, 120 + h - 12, 11, '#888', null, 0, 'right');
}
// ================= 📖 튜토리얼 2부: 꿀선생이 실제 화면으로 데려가서 하나씩 짚어 줌 =================
// hl: 반짝이며 강조할 칸 [x, y, 가로, 세로] (나머지는 어둡게)
const TOUR = [
  { go: () => { mode = 1; scene = 'title'; titleSel = 0; }, hl: () => [W / 2 - 194, 146, 388, 70], t: '여기가 타이틀 메뉴야.\n🏆 랭크전: 이기면 티어 점수가 오르고 랭킹에 올라가!\n🔥 연승 모드: 몇 번 연속으로 이길 수 있는지 도전!' },
  { go: () => { scene = 'title'; titleSel = 4; }, hl: () => [W / 2 - 194, 146 + 4 * MENU_H(), 388, 34], t: '🎲 AI 경기 베팅: CPU끼리 싸우는데 누가 이길지 코인을 걸어.\n맞히면 건 돈의 몇 배를 받아!' },
  { go: () => { openMarket(); mk.tab = 0; }, hl: () => [100, 56, 250, 46], t: '🏮 포장마차 시장 → 🧊 냉장고 칸이야.\n싸움에서 이기면 진 돼지가 요리가 돼서 여기 들어와.\n요리를 누르면 팔아서 코인을 받아!' },
  { go: () => { openMarket(); mk.tab = 1; mk.sel = 0; }, hl: () => [350, 56, 250, 46], t: '🛒 상점 칸: 필살 게이지·부활권 같은 아이템은 개수를 골라 사.\n🎨 스킨 상자를 열면 돼지 색과 때리는 효과가 바뀌는 스킨이 나와.\n🏷️ 칭호를 사면 이름 앞에 붙어!' },
  { go: () => { openTycoon(); TY.phase = 'lobby'; TY.sel = 0; }, hl: () => [452, 70, 492, 46], t: '🏮 장사하기: 맨 위 "영업 시작"을 누르면 손님이 와.\n고기를 굽고 손님에게 줘서 돈을 벌어!\n아래 업그레이드로 가게를 키우고, 🤖 자동 영업을 켜면 알아서 장사해.' },
  { go: () => { scene = 'reward'; rwMissions(); RWS.sel = 0; }, hl: () => [70, 132, 382, 396], t: '🎁 보상 센터: 🎟️ 행운 룰렛!\n하루 한 번 무료 티켓이 생기고, 티켓으로 돌려.\n왼쪽 📊 확률 버튼으로 무엇이 나오는지 볼 수 있어.' },
  { go: () => { scene = 'reward'; }, hl: () => [494, 80, 452, 328], t: '📅 출석 체크: 매일 들어오면 보상! 7일째는 대박.\n🎯 오늘의 미션 3개를 다 하면 보너스.\n아래 칸은 특별한 돼지를 얻는 퀘스트야. 눌러서 자세히 봐!' },
  { go: () => { openPigs(); PG.sel = 0; }, hl: () => [612, 132, 338, 372], t: '🐷 돼지 도감: 모은 돼지와 얻는 방법이 다 있어.\n코인으로 돼지를 Lv.10까지 강화하면 체력·공격력이 올라가.\n⚡ 각성 조건을 다 채운 돼지는 각성 ON/OFF도 여기서!' },
  { go: () => { bk.sel = 0; scene = 'bank'; }, hl: () => [0, 0, 0, 0], t: '🏦 은행: 처음엔 사채 빚이 있어.\n장사·싸움으로 번 돈으로 빚을 갚으면 엔딩을 볼 수 있어!\n돈이 모자라면 대출도 받을 수 있지만 이자 조심!' },
  { go: () => { scene = 'title'; }, hl: () => [10, 8, 178, 52], t: '🔑 로그인·가입: 회원이 되면 기록이 저장되고\n다른 기기에서도 이어서 할 수 있어. 랭킹에도 올라가!' },
  { go: () => { scene = 'title'; }, hl: () => [W - 118, 32, 112, 64], t: '⌨️ 키 설정: 공격·이동 키를 마음대로 바꿔.\n📖 튜토리얼: 헷갈리면 언제든 다시 볼 수 있어.\n🔊 오른쪽 맨 위는 배경음 켜기·끄기!' },
  { go: () => { scene = 'title'; }, hl: () => [0, 0, 0, 0], t: '🎓 이걸로 끝! 이제 다 알았지?\n졸업 선물로 🪙 5,000 코인을 줄게. (처음 한 번만)\n랭크전에서 만나자! 꿀꿀~', last: true }
];
function startTour() { mode = 1; tut.tour = 0; tut.t = 0; TOUR[0].go(); SFX.bell(); }
function tourNext() {
  const S = TOUR[tut.tour];
  if (S.last) { tut.tour = -1; if (!lsGet('sgf_tut_done', false)) { lsSet('sgf_tut_done', true); addCoins(5000); cloudDirty(); } toTitle(); popup({ icon: '🎓', title: '튜토리얼 졸업!', lines: ['🪙 5,000 코인 받았어요 (처음 한 번만)', '이제 랭크전이나 연승 모드에 도전해 보세요!'], big: true }); return; }
  tut.tour++; tut.t = 0; TOUR[tut.tour].go(); SFX.select();
}
function tourInput() {   // 투어 중엔 뒤 화면을 못 누름
  if (!(tut.tour >= 0)) return false;
  tut.t++;
  if (pressed.Escape) { tut.tour = -1; toTitle(); toast('📖 튜토리얼은 타이틀 오른쪽 위에서 언제든 다시 볼 수 있어요'); }
  else if (tut.t > 12 && (pressed.Enter || pressed.Space || pressed.KeyI || pressed.ArrowRight)) tourNext();
  for (const k in pressed) delete pressed[k];
  return true;
}
function drawTour() {
  if (!(tut.tour >= 0)) return;
  const S = TOUR[tut.tour], [hx, hy, hw, hh] = S.hl(), has = hw > 0;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  if (has) { ctx.fillRect(0, 0, W, hy); ctx.fillRect(0, hy + hh, W, H - hy - hh); ctx.fillRect(0, hy, hx, hh); ctx.fillRect(hx + hw, hy, W - hx - hw, hh); ctx.save(); ctx.shadowColor = '#ffd740'; ctx.shadowBlur = 20; ctx.strokeStyle = gT % 30 < 15 ? '#ffd740' : '#fff59d'; ctx.lineWidth = 4; rr(hx - 2, hy - 2, hw + 4, hh + 4, 10); ctx.stroke(); ctx.restore(); }
  else ctx.fillRect(0, 0, W, H);
  const lines = S.t.split('\n'), ph = 46 + lines.length * 22, top = has && hy + hh / 2 > H / 2, py = top ? 14 : H - ph - 14, px = 150, pw = W - 164;
  ctx.fillStyle = 'rgba(16,10,32,0.95)'; rr(px, py, pw, ph, 14); ctx.fill(); ctx.strokeStyle = '#ffcc80'; ctx.lineWidth = 2; rr(px, py, pw, ph, 14); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.rect(4, py - 40, 146, ph + 40); ctx.clip(); drawTeacher(70, py + ph + 6, 0.72, true); ctx.restore();
  lines.forEach((l, k) => txt(l, px + 18, py + 22 + k * 22, fitSize(l, 15, pw - 40), '#fff', '#000', 3, 'left'));
  txt(`${tut.tour + 1} / ${TOUR.length}`, px + pw - 14, py + 14, 11, '#aaa', null, 0, 'right');
  const bl = S.last ? '🎓 졸업하기' : '다음 ▶';
  ctx.fillStyle = gT % 40 < 25 ? '#2e7d32' : '#388e3c'; rr(px + pw - 132, py + ph - 38, 118, 30, 9); ctx.fill(); txt(bl, px + pw - 73, py + ph - 23, 14, '#fff', null);
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(px + pw - 220, py + ph - 38, 80, 30, 9); ctx.fill(); txt('그만', px + pw - 180, py + ph - 23, 13, '#ddd', null);
  addHot(0, 0, W, H, () => { if (tut.t > 12) pressed.Enter = true; });   // 아무 데나 눌러도 다음 (뒤 화면 버튼은 안 눌림)
  addHot(px + pw - 220, py + ph - 38, 80, 30, () => { pressed.Escape = true; });
}
// ---- 처음 온 사람에게: 튜토리얼 할래요? [시작] [나중에] [다시 보지 않기] ----
let tutOffer = false, tutOffered = false;
function maybeOfferTut() {
  if (tutOffered || AUTH_TEST || !auth || gT < 60 || lsGet('sgf_tut_done', false) || lsGet('sgf_tut_never', false) || POP || POPQ.length) return;
  tutOffered = true; tutOffer = true;
}
function updateTutOffer() {
  if (pressed.Enter || pressed.Space) { tutOffer = false; startTutorial(); }
  else if (pressed.Escape) tutOffer = false;
  else if (pressed.KeyN) { tutOffer = false; lsSet('sgf_tut_never', true); toast('알겠어요! 튜토리얼은 오른쪽 위 📖에서 언제든 볼 수 있어요'); }
  for (const k in pressed) delete pressed[k];
}
function drawTutOffer() {
  ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, W, H);
  const x = W / 2 - 250, y = 120;
  ctx.fillStyle = '#2a1530'; rr(x, y, 500, 290, 18); ctx.fill(); ctx.strokeStyle = '#ffcc80'; ctx.lineWidth = 3; rr(x, y, 500, 290, 18); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, 150, 290); ctx.clip(); drawTeacher(x + 70, y + 250, 0.85, true); ctx.restore();
  txt('처음이야? 반가워!', x + 320, y + 40, 24, '#ffe082', '#000', 5);
  ['나는 꿀선생이야 🐷📚', '싸우는 법부터 메뉴 쓰는 법까지', '하나하나 친절하게 알려 줄게!', '다 배우면 졸업 선물 🪙 5,000'].forEach((l, k) => txt(l, x + 320, y + 80 + k * 26, 15, '#fff', null));
  addHot(0, 0, W, H, () => {});   // 창 밖은 눌러도 아무 일 없게 (버튼보다 먼저 넣어야 버튼이 눌림)
  const B = [['📖 튜토리얼 시작', '#2e7d32', () => { pressed.Enter = true; }], ['나중에', 'rgba(255,255,255,0.18)', () => { pressed.Escape = true; }], ['다시 보지 않기', 'rgba(255,255,255,0.1)', () => { pressed.KeyN = true; }]];
  B.forEach(([l, c, fn], k) => { const bx = k === 0 ? x + 170 : x + 170 + (k - 1) * 160, by = k === 0 ? y + 192 : y + 238, bw = k === 0 ? 310 : 150; ctx.fillStyle = c; rr(bx, by, bw, 38, 10); ctx.fill(); txt(l, bx + bw / 2, by + 19, k === 0 ? 18 : 14, '#fff', null); addHot(bx, by, bw, 38, fn); });
  if (!TOUCH) txt('Enter 시작 · Esc 나중에 · N 다시 보지 않기', W / 2, y + 306, 12, '#80d8ff', '#000', 3);
}
// ================= 🎬 컷신·예고편 다시 보기 (엔딩 수집에서) =================
// 예고편은 한 번 본 것만, 필살기 컷신은 그 돼지를 가진 것만 (테스트 계정은 다)
let cutBack = false;   // 예고편이 끝나면 이 목록으로 돌아옴
const CUTS = [
  { name: '🆕 볼트돈 · 돼루토 예고편', ok: () => lsGet('sgf_trailer2', false), play: () => startTrailer() },
  { name: '🍥 돼루토 예고편', ok: () => lsGet('sgf_nrtrailer', false), play: () => startNrTrailer() },
  { name: '👊 이타돼리 예고편', ok: () => lsGet('sgf_ittrailer', false), play: () => startItTrailer() },
  { name: '🎉 대규모 업데이트 예고편', ok: () => lsGet('sgf_bigtrailer', false), play: () => startBigTrailer() },
  { name: '🏴‍☠️ 대규모 업데이트 · 해적과 마법사 예고편', ok: () => lsGet('sgf_big2trailer', false), play: () => startBig2Trailer() },
  { name: '⏱️ 돼타로 · 시간 정지', ch: '돼타로', len: () => TS_CUT },
  { name: '🦊 돼루토 · 구미호 모드', ch: '돼루토', len: () => NEW_ULT_CUT },
  { name: '🌀 돼루토 · 회오리 구슬', ch: '돼루토', rasen: true, len: () => RASEN_CUT },
  { name: '👊 이타돼리 · 검은 번개 연타', ch: '이타돼리', form: 'base', len: () => IT_CUT },
  { name: '🩸 이타돼리(모듈로) · 베어 가르기', ch: '이타돼리', form: 'modulo', len: () => IT_CUT },
  { name: '👹 이타돼리(스쿠나) · 저주 결계', ch: '이타돼리', form: 'sukuna', len: () => IT_CUT }
];
const cutOk = c => c.ch ? (IS_TESTER || (isUnlocked(CHARS.find(x => x.name === c.ch)) && (!c.form || itFormOk(c.form)))) : (IS_TESTER || c.ok());
const CL = { sel: 0, playing: null };
function openCutList() { CL.sel = 0; CL.playing = null; scene = 'cutlist'; }
function playCut(i) {
  const c = CUTS[i]; if (!cutOk(c)) { SFX.block(); toast('🔒 아직 못 본 컷신이에요'); return; }
  SFX.confirm();
  if (c.play) { cutBack = true; c.play(); return; }
  mode = 0; p1.setChar(CHARS.find(x => x.name === c.ch)); p2.setChar(CHARS[0]); p1.newMatch(); p2.newMatch(); p1.x = 300; p2.x = 660; p1.y = p2.y = GROUND; p1.facing = 1; p2.facing = -1;
  if (c.form) applyItForm(p1, c.form);
  superOwner = p1; superKind = c.rasen ? 'rasen' : 'ult'; superFreeze = c.len(); CL.playing = c;
}
function updateCutList() {
  if (CL.playing) {
    if (superKind === 'ult' && CL.playing.ch === '돼타로') tsCutSfx(TS_CUT - superFreeze);
    if (pressed.Enter || pressed.Space) skipCut();
    if (--superFreeze <= 0 || pressed.Escape) { CL.playing = null; superFreeze = 0; superOwner = null; }
    return;
  }
  const n = CUTS.length;
  if (pressed.KeyW || pressed.ArrowUp) { CL.sel = (CL.sel + n - 1) % n; SFX.select(); }
  if (pressed.KeyS || pressed.ArrowDown) { CL.sel = (CL.sel + 1) % n; SFX.select(); }
  if (pressed.Enter || pressed.Space || pressed.KeyI) playCut(CL.sel);
  if (pressed.Escape) { scene = 'endings'; SFX.select(); }
}
function drawCutList() {
  if (CL.playing) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); drawSuperBanner(); txt(TOUCH ? '' : 'Esc 그만', W - 20, H - 10, 11, '#777', null, 0, 'right'); return; }
  drawStage(); ctx.fillStyle = 'rgba(10,5,25,0.85)'; ctx.fillRect(0, 0, W, H);
  txt('🎬 컷신 · 예고편 다시 보기', W / 2, 36, 28, '#ffe082', '#000', 7);
  CUTS.forEach((c, i) => {
    const ok = cutOk(c), on = CL.sel === i, col = i < 5 ? 0 : 1, row = i < 5 ? i : i - 5, x = 70 + col * 420, y = 74 + row * 66;
    ctx.fillStyle = on ? 'rgba(255,145,0,0.45)' : 'rgba(25,12,40,0.85)'; rr(x, y, 400, 56, 12); ctx.fill();
    if (on) { ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 2; rr(x, y, 400, 56, 12); ctx.stroke(); }
    txt(ok ? c.name : '🔒 ' + c.name.replace(/^\S+ /, ''), x + 18, y + 22, fitSize(c.name, 16, 300), ok ? '#fff' : '#777', null, 0, 'left');
    txt(ok ? '▶ 보기' : c.ch ? '그 돼지(모습)를 얻으면 볼 수 있어요' : '한 번 본 예고편만 볼 수 있어요', x + 18, y + 42, 11, ok ? '#69f0ae' : '#888', null, 0, 'left');
    addHot(x, y, 400, 56, () => { CL.sel = i; pressed.Enter = true; });
  });
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(14, 14, 80, 30, 8); ctx.fill(); txt('← 뒤로', 54, 29, 13, '#fff', null);
  addHot(14, 14, 80, 30, () => { pressed.Escape = true; });
}
// ================= 🎁 보상 센터: 출석 체크 · 행운 룰렛 · 일일 미션 =================
// 저장: sgf_reward = { day(마지막 출석 날짜), att(연속 출석 1~7), days(총 출석), spinDay, spins(오늘 쓴 무료), bonus(쌓인 무료 룰렛),
//                     mDay, mis[{ id, goal, n, got }], mAll(3개 다 받음), gift(받은 관리자 선물 id), jack(잭팟 횟수) }
const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const RW0 = () => ({ day: '', att: 0, days: 0, spinDay: '', spins: 0, bonus: 0, mDay: '', mis: [], mAll: false, gift: 0, jack: 0 });
const rwLoad = () => Object.assign(RW0(), lsGet('sgf_reward', {}));
let RW = rwLoad();
const rwSave = () => { lsSet('sgf_reward', RW); };
// 보상 기준 금액: 장사가 커질수록 보상도 커짐 (최근 영업 순이익 평균의 1/4, 최소 200)
function rwBase() {
  const hs = (tyU.hist || []).filter(v => v > 0);
  const avg = hs.length ? hs.reduce((a, b) => a + b, 0) / hs.length : 0;
  return Math.max(200, Math.round(avg * 0.25 / 10) * 10);
}
// ---- 출석 ----
const ATT_MUL = [1, 2, 3, 4, 6, 8, 20];   // 7일째는 대박 (+무료 룰렛 2번 · 부활권)
const attReady = () => RW.day !== dayKey();
function claimAttendance() {
  if (!attReady()) return false;
  const yest = dayKey(Date.now() - 86400000);
  RW.att = RW.day === yest ? RW.att % 7 + 1 : 1; RW.day = dayKey(); RW.days++;
  const dbl = evOn('daily') ? 2 : 1, gain = rwBase() * ATT_MUL[RW.att - 1] * dbl;
  addCoins(gain);
  const lines = [`+${fmtN(gain)} 코인${dbl > 1 ? ' (이벤트 2배!)' : ''}`];
  if (RW.att === 7) { RW.bonus += 2; inv.use.revive = (inv.use.revive || 0) + 1; saveInv(); lines.push('🎟️ 룰렛 티켓 +2장 · 🍀 부활권 +1'); }
  else lines.push(`내일 오면 ${fmtN(rwBase() * ATT_MUL[RW.att] * dbl)} 코인!`);
  rwSave(); cloudDirty();
  popup({ icon: '📅', title: `출석 ${RW.att}일째!`, lines, big: RW.att === 7 });
  return true;
}
// ---- 일일 미션 ----
const MIS_POOL = [
  { id: 'win', name: n => `싸움에서 ${n}번 이기기`, g: [3, 5] },
  { id: 'ranked', name: n => `랭크전 ${n}번 이기기`, g: [1, 2] },
  { id: 'shift', name: n => `장사 ${n}번 끝내기 (자동 포함)`, g: [2, 3] },
  { id: 'bet', name: n => `AI 경기 베팅 ${n}번 하기`, g: [1, 2] },
  { id: 'spin', name: n => `행운 룰렛 ${n}번 돌리기`, g: [1, 2] },
  { id: 'sell', name: n => `시장에서 요리 ${n}개 팔기`, g: [1, 3] }
];
function rwMissions() {
  const d = dayKey();
  if (RW.mDay !== d) {
    let h = hashStr('mis' + d + (RW.mReset || '')); const pool = MIS_POOL.slice(), mis = [];   // 관리자가 초기화하면 다른 미션이 나옴
    for (let i = 0; i < 3; i++) { const j = h % pool.length; h = Math.imul(h ^ (h >>> 13), 2654435761) >>> 0; const m = pool.splice(j, 1)[0]; mis.push({ id: m.id, goal: m.g[h % 2], n: 0, got: false }); }
    RW.mDay = d; RW.mis = mis; RW.mAll = false; rwSave();
  }
  return RW.mis;
}
const misDef = id => MIS_POOL.find(m => m.id === id) || MIS_POOL[0];
function rwProgress(id, k = 1) {
  const ms = rwMissions().filter(m => m.id === id && m.n < m.goal);
  if (!ms.length) return;
  for (const m of ms) { m.n = Math.min(m.goal, m.n + k); if (m.n >= m.goal) toast(`🎯 미션 완료: ${misDef(m.id).name(m.goal)} → 🎁 보상 센터에서 받기`); }
  rwSave();
}
const misReward = () => rwBase() * 3;
function claimMission(i) {
  const m = rwMissions()[i];
  if (!m || m.got || m.n < m.goal) { SFX.block(); return; }
  m.got = true; const g = misReward(); addCoins(g); SFX.coin(); burst(W - 240, 230 + i * 62, 24, ['#ffd740', '#fff59d', '#ff9100']);
  popText(W - 240, 220 + i * 62, `+${fmtN(g)}`, '#ffd740', 30);
  if (!RW.mAll && RW.mis.every(x => x.got)) {
    nqAdd('clear', 1);
    RW.mAll = true; RW.bonus++; const b = rwBase() * 5; addCoins(b);
    popup({ icon: '🏅', title: '오늘의 미션 올 클리어!', lines: [`보너스 +${fmtN(b)} 코인`, '🎟️ 룰렛 티켓 +1장'], big: true });
  }
  rwSave(); cloudDirty();
}
// ---- 행운 룰렛 ----
// 칸 크기 = 나올 확률 (보이는 그대로). 코인은 기준 금액 × 배수, 이벤트 '룰렛 보상 2배'면 코인 2배
const WHEEL = [
  { w: 20, k: 'coin', m: 0.5, c: '#5c6bc0', t: '×0.5' },
  { w: 17, k: 'coin', m: 1, c: '#26a69a', t: '×1' },
  { w: 12, k: 'meter', c: '#ffa726', t: '⚡필살' },
  { w: 13, k: 'coin', m: 2, c: '#ec407a', t: '×2' },
  { w: 10, k: 'hpup', c: '#78909c', t: '🛡️체력' },
  { w: 9, k: 'coin', m: 3, c: '#ab47bc', t: '×3' },
  { w: 6, k: 'again', c: '#42a5f5', t: '티켓+1' },
  { w: 4, k: 'revive', c: '#66bb6a', t: '🍀부활' },
  { w: 6, k: 'coin', m: 5, c: '#ef5350', t: '×5' },
  { w: 3, k: 'coin', m: 20, c: '#ffd600', t: '잭팟' }
];
const wheelSlots = () => { const c = CHARS.find(x => x.name === '볼트돈'); return isReleased() && c && !isUnlocked(c) ? [...WHEEL.slice(0, 9), { w: 3, k: 'char', c: '#00e5ff', t: '🤖 볼트돈' }, WHEEL[9]] : WHEEL; };
const curWheel = () => (RWS.t >= 0 || RWS.flash > 0) && RWS.slots ? RWS.slots : wheelSlots();
const wSum = L => L.reduce((a, s) => a + s.w, 0);
const PITY_N = 200;
// 📊 확률 보기: 칸마다 나올 확률 (칸 크기와 같음)
const slotName = s => s.k === 'coin' ? `🪙 코인 ${s.t}` : s.k === 'again' ? '🎟️ 티켓 +1' : s.k === 'char' ? '🤖 볼트돈' : { meter: '⚡ 필살 50%', hpup: '🛡️ 강철 체력', revive: '🍀 부활권' }[s.k] || s.t;
function showOdds() {
  const L = wheelSlots(), S = wSum(L), parts = L.map(s => `${slotName(s)} ${(s.w / S * 100).toFixed(1)}%`), lines = [];
  for (let i = 0; i < parts.length; i += 2) lines.push(parts.slice(i, i + 2).join('   ·   '));
  if (L.some(s => s.k === 'char')) lines.push(`🤖 볼트돈 확정까지 ${PITY_N - (RW.pity || 0)}번 남음 (${PITY_N}번째엔 무조건)`);
  popup({ icon: '📊', title: '행운 룰렛 확률', lines: ['(코인 = 보상 기준 금액 × 배수)', ...lines] });
}
const dayFree = () => { if (RW.spinDay !== dayKey()) { RW.spinDay = dayKey(); RW.spins = 0; } return Math.max(0, 1 + (evLive() ? +EVT.spins || 0 : 0) - RW.spins); };
const spinFree = () => dayFree() + RW.bonus;
const spinCost = () => rwBase() * 2;
const RWS = { sel: 0, ang: 0, from: 0, to: 0, t: -1, T: 230, res: -1, last: 0, flash: 0 };
function spinWheel() {
  if (RWS.t >= 0) return false;
  if (dayFree() > 0) RW.spins++;
  else if (RW.bonus > 0) RW.bonus--;
  else { buyTicket(); return false; }   // 🎟️ 티켓이 없으면: 코인으로 티켓 사기
  const L = wheelSlots(), SUM = wSum(L); RWS.slots = L;
  let r = Math.random() * SUM, i = 0; while (i < L.length - 1 && r >= L[i].w) { r -= L[i].w; i++; }
  const ci = L.findIndex(x => x.k === 'char');   // 볼트돈 확정: 200번째에는 무조건
  if (ci >= 0) { RW.pity = (RW.pity || 0) + 1; if (RW.pity >= PITY_N) i = ci; if (i === ci) RW.pity = 0; }
  let a0 = 0; for (let j = 0; j < i; j++) a0 += L[j].w;
  const mid = (a0 + L[i].w * rand(0.2, 0.8)) / SUM * Math.PI * 2;
   // 바늘(위쪽)에 그 칸이 오게
  const TAU = Math.PI * 2, base = ((RWS.ang % TAU) + TAU) % TAU;
  RWS.from = RWS.ang; const fast = (inv.use.fastSpin || 0) > 0; RWS.T = fast ? 45 : 230;   // 💨 룰렛 빨리 돌리기 (상점)
  RWS.to = RWS.ang - base + TAU * (fast ? 2 : 6) + (TAU - mid); RWS.t = 0; RWS.res = i;
  nqAdd('spin', 1);
  rwProgress('spin'); rwSave(); cloudDirty(); SFX.confirm();
  return true;
}
function buyTicket() {
  const c = spinCost(); if (coins < c) { SFX.block(); toast(`코인이 부족해요 (티켓 1장 ${fmtN(c)})`); return false; }
  addCoins(-c); RW.bonus++; rwSave(); cloudDirty(); SFX.coin(); popText(260, 100, '🎟️ 티켓 +1', '#fff59d', 26); return true;
}
function wheelDone() {
  const s = RWS.slots[RWS.res], luck = evOn('luck') ? 2 : 1; RWS.flash = 60;
  let msg = '';
  if (s.k === 'coin') { const g = Math.round(rwBase() * s.m * luck); addCoins(g); msg = `+${fmtN(g)} 코인${luck > 1 ? ' (이벤트 2배!)' : ''}`; }
  else if (s.k === 'again') { RW.bonus++; msg = '🎟️ 티켓 한 장 더!'; }
  else if (s.k === 'char') { lsSet('sgf_unlock_볼트돈', true); msg = '🤖 볼트돈 획득!!'; SFX.gong(); popup({ icon: '🤖', title: '볼트돈 획득!!!', lines: ['캐릭터 선택에서 고를 수 있어요', '오버클럭 · 레이저 채찍 · 로켓 대시 · 메가 강화 슈트'], big: true }); }
  else { inv.use[s.k] = (inv.use[s.k] || 0) + 1; saveInv(); msg = { meter: '⚡ 필살 게이지 50% 아이템 +1', hpup: '🛡️ 강철 체력 아이템 +1', revive: '🍀 부활권 +1' }[s.k]; }
  rwSave(); cloudDirty();
  burst(260, 290, s.m >= 5 ? 80 : 30, ['#ffd740', '#ff4081', '#69f0ae', '#40c4ff']);
  if (s.m >= 5) { SFX.bell(); popup({ icon: s.m >= 20 ? '💰' : '🎰', title: s.m >= 20 ? '잭팟!!! ×20' : '대박! ×5', lines: [msg], big: true }); }
  else { SFX.coin(); popText(260, 100, msg, '#fff59d', 26); }
}
function openReward() { rwMissions(); RWS.sel = 0; scene = 'reward'; if (attReady()) claimAttendance(); }
function updateReward() {
  if (RWS.t >= 0) {
    RWS.t++; const k = Math.min(1, RWS.t / RWS.T), e = 1 - (1 - k) ** 4;
    RWS.ang = RWS.from + (RWS.to - RWS.from) * e;
    const seg = Math.floor(RWS.ang / (Math.PI * 2) * 24); if (seg !== RWS.last) { RWS.last = seg; SFX.tick(); }
    if (k >= 1) { RWS.t = -1; wheelDone(); }
  }
  if (RWS.flash > 0) RWS.flash--;
  if (pressed.KeyW || pressed.ArrowUp) { RWS.sel = (RWS.sel + 3) % 4; SFX.select(); }
  if (pressed.KeyS || pressed.ArrowDown) { RWS.sel = (RWS.sel + 1) % 4; SFX.select(); }
  for (let i = 0; i < 3; i++) if (pressed['Digit' + (i + 1)] || pressed['Numpad' + (i + 1)]) claimMission(i);
  if (pressed.Enter || pressed.Space || pressed.KeyI) { if (RWS.sel === 0) spinWheel(); else claimMission(RWS.sel - 1); }
  if (pressed.KeyR) spinWheel();
  if (pressed.KeyP) showOdds();
  if (pressed.Escape && RWS.t < 0) toTitle();
  if (gT % 4 === 0) flame(rand(40, W - 40), H - 10);
}
function drawWheel(cx, cy, r) {
  ctx.save(); ctx.translate(cx, cy);
  ctx.shadowColor = '#ffd740'; ctx.shadowBlur = RWS.t >= 0 ? 30 : 14;
  ctx.fillStyle = '#3e2723'; ctx.beginPath(); ctx.arc(0, 0, r + 14, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  for (let i = 0; i < 24; i++) {   // 테두리 전구 (돌 때 빨리 깜빡)
    const a = i / 24 * Math.PI * 2, on = ((gT / (RWS.t >= 0 ? 3 : 10) | 0) + i) % 2;
    ctx.fillStyle = on ? '#fff59d' : '#8d6e63'; ctx.beginPath(); ctx.arc(Math.cos(a) * (r + 7), Math.sin(a) * (r + 7), 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.rotate(RWS.ang - Math.PI / 2);
  let a = 0;
  const L = curWheel(), SUM = wSum(L);
  L.forEach((s, i) => {
    const da = s.w / SUM * Math.PI * 2;
    ctx.fillStyle = RWS.flash > 0 && i === RWS.res && RWS.flash % 10 < 5 ? '#fff' : s.c;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, a, a + da); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.rotate(a + da / 2); ctx.translate(r * 0.64, 0); ctx.rotate(Math.sin(RWS.ang - Math.PI / 2 + a + da / 2) > 0 ? -Math.PI / 2 : Math.PI / 2);   // 아래쪽 칸 글씨도 똑바로
    txt(s.t, 0, 0, s.w >= 6 ? 15 : 12, '#fff', '#000', 4); ctx.restore();
    a += da;
  });
  ctx.restore();
  ctx.fillStyle = '#ffd740'; ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fill();
  txt('🐷', cx, cy + 1, 26, '#fff', null);
  ctx.fillStyle = '#ff1744'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;   // 바늘 (위)
  ctx.beginPath(); ctx.moveTo(cx - 16, cy - r - 24); ctx.lineTo(cx + 16, cy - r - 24); ctx.lineTo(cx, cy - r + 8); ctx.closePath(); ctx.fill(); ctx.stroke();
}
function drawReward() {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a0a3a'); g.addColorStop(1, '#4a1030');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) { const x = (i * 137 + gT * (0.3 + i % 3 * 0.2)) % W, y = (i * 71) % H; ctx.fillStyle = `rgba(255,215,64,${0.15 + 0.15 * Math.sin(gT * 0.05 + i)})`; ctx.fillRect(x, y, 3, 3); }
  drawParts();
  txt('🎁 보상 센터', W / 2, 30, 30, '#ffe082', '#5a1a2a', 8);
  txt(`🪙 ${fmtN(coins)}`, W - 20, 30, 16, '#fff59d', '#000', 4, 'right');
  const evT = evText(); if (evT) txt(evT, W / 2, 62, fitSize(evT, 13, W - 40), gT % 40 < 28 ? '#ffd740' : '#fff59d', '#000', 4);
  // 왼쪽: 룰렛
  drawWheel(260, 290, 165);
  const free = spinFree(), on = RWS.sel === 0;
  const lab = RWS.t >= 0 ? '두근두근...' : free ? `🎟️ 티켓으로 돌리기 (${free}장)` : `🎟️ 티켓 사기 · 🪙 ${fmtN(spinCost())}`;
  ctx.save(); if (on) { ctx.shadowColor = '#ff5252'; ctx.shadowBlur = 16; }
  const bg = ctx.createLinearGradient(110, 0, 410, 0); bg.addColorStop(0, free ? '#00c853' : '#ff5252'); bg.addColorStop(1, free ? '#64dd17' : '#ff9100');
  ctx.fillStyle = on ? bg : 'rgba(25,12,40,0.9)'; rr(110, 482, 300, 40, 12); ctx.fill(); ctx.restore();
  if (free && RWS.t < 0 && gT % 50 < 25) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; rr(110, 482, 300, 40, 12); ctx.stroke(); }
  txt(lab, 260, 502, fitSize(lab, 18, 280), '#fff', '#000', 4);
  addHot(110, 482, 300, 40, () => { RWS.sel = 0; spinWheel(); });
  ctx.fillStyle = 'rgba(120,0,0,0.6)'; rr(14, 124, 100, 30, 8); ctx.fill(); txt('⚡ 각성 조건', 64, 139, 12, '#ff8a80', null); addHot(14, 124, 100, 30, () => showAwake());
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(14, 88, 100, 30, 8); ctx.fill(); txt('🎬 돼루토 예고편', 64, 103, 11, '#ffcc80', null); addHot(14, 88, 100, 30, () => startNrTrailer());
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(14, 52, 100, 30, 8); ctx.fill(); txt(TOUCH ? '📊 확률' : '📊 확률 [P]', 64, 67, 13, '#fff59d', null); addHot(14, 52, 100, 30, () => showOdds());
  if (wheelSlots().some(s => s.k === 'char')) txt(`🤖 볼트돈 확정까지 ${PITY_N - (RW.pity || 0)}번`, 260, 468, 13, '#84ffff', '#000', 3);
  if ((inv.use.fastSpin || 0) > 0) txt('💨 빠른 룰렛', 400, 108, 12, '#69f0ae', '#000', 3);
  // 오른쪽 위: 출석 7일
  const x0 = 500;
  txt(`📅 출석 체크 · ${RW.att}일째 (총 ${RW.days}일)`, x0, 92, 16, '#fff', '#000', 4, 'left');
  for (let i = 0; i < 7; i++) {
    const x = x0 + i * 63, y = 106, got = i < RW.att, today = i === RW.att - 1 && !attReady();
    ctx.fillStyle = got ? (today ? '#ff9100' : '#6d4c41') : 'rgba(255,255,255,0.1)'; rr(x, y, 57, 62, 8); ctx.fill();
    if (i === 6) { ctx.strokeStyle = '#ffd740'; ctx.lineWidth = 2; rr(x, y, 57, 62, 8); ctx.stroke(); }
    txt(`${i + 1}일`, x + 28, y + 12, 11, '#fff', null);
    txt(i === 6 ? '🎁' : '🪙', x + 28, y + 32, 18, '#fff', null);
    txt('×' + ATT_MUL[i], x + 28, y + 52, 12, '#fff59d', null);
    if (got) txt('✔', x + 48, y + 12, 14, '#69f0ae', '#000', 3);
  }
  // 오른쪽 아래: 일일 미션
  txt('🎯 오늘의 미션 (자정에 바뀜)', x0, 192, 16, '#fff', '#000', 4, 'left');
  rwMissions().forEach((m, i) => {
    const y = 206 + i * 62, sel = RWS.sel === i + 1, ok = m.n >= m.goal;
    ctx.fillStyle = sel ? 'rgba(255,145,0,0.5)' : 'rgba(0,0,0,0.45)'; rr(x0, y, 440, 54, 10); ctx.fill();
    txt(`${i + 1}. ${misDef(m.id).name(m.goal)}`, x0 + 12, y + 17, fitSize(misDef(m.id).name(m.goal), 15, 300), m.got ? '#9e9e9e' : '#fff', null, 0, 'left');
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(x0 + 12, y + 33, 250, 10, 5); ctx.fill();
    if (m.n > 0) { ctx.fillStyle = ok ? '#69f0ae' : '#ffd740'; rr(x0 + 12, y + 33, Math.max(10, 250 * Math.min(1, m.n / m.goal)), 10, 5); ctx.fill(); }
    txt(`${Math.min(m.n, m.goal)}/${m.goal}`, x0 + 272, y + 38, 12, '#fff', null, 0, 'left');
    const bl = m.got ? '받음 ✔' : ok ? `받기 +${fmtN(misReward())}` : `🪙 ${fmtN(misReward())}`;
    ctx.fillStyle = m.got ? '#555' : ok ? (gT % 30 < 15 ? '#00c853' : '#64dd17') : 'rgba(255,255,255,0.12)'; rr(x0 + 318, y + 10, 112, 34, 8); ctx.fill();
    txt(bl, x0 + 374, y + 27, fitSize(bl, 13, 104), '#fff', null);
    addHot(x0, y, 440, 54, () => { RWS.sel = i + 1; claimMission(i); });
  });
  txt(RW.mAll ? '🏅 오늘 미션 올 클리어!' : '3개 다 받으면: 🪙 보너스 + 🎟️ 티켓 1장', x0 + 220, 404, 13, RW.mAll ? '#69f0ae' : '#ffcc80', '#000', 3);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(x0, 420, 440, 66, 10); ctx.fill();
  const oq = openQuests();
  if (oq.length) {
    const Q = oq[0], q = qState(Q), qi = Q.steps.findIndex(s => (q[s.id] || 0) < s.goal), st = Q.steps[Math.max(0, qi)];
    addHot(x0, 420, 440, 66, () => showQuests());   // 눌러서 퀘스트 전부 보기
    txt(`${Q.icon} ${Q.ch} 퀘스트 ${qDoneN(Q)}/4${Q.timed ? ` · ⏰ ${Math.max(0, Math.ceil((itWinEnd() - Date.now()) / 86400000))}일 남음` : ''}${oq.length > 1 ? ` · 외 ${oq.length - 1}개 (눌러서 보기)` : ''}`, x0 + 12, 436, fitSize('가'.repeat(30), 14, 420), '#ffab40', '#000', 3, 'left');
    txt(`${st.name}  (${Math.min(q[st.id] || 0, st.goal)}/${st.goal})`, x0 + 12, 462, fitSize(st.name, 14, 330), '#fff', null, 0, 'left');
    for (let k = 0; k < 4; k++) { ctx.fillStyle = (q[Q.steps[k].id] || 0) >= Q.steps[k].goal ? '#ff9100' : k === qi ? (gT % 40 < 20 ? '#ffd180' : '#ff9100') : 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.arc(x0 + 370 + k * 18, 450, 6, 0, Math.PI * 2); ctx.fill(); }
  } else {
  txt(`🎒 보유 아이템: ⚡필살 ${inv.use.meter || 0} · 🛡️체력 ${inv.use.hpup || 0} · 🍀부활 ${inv.use.revive || 0}`, x0 + 220, 440, 13, '#fff59d', null);
  txt(`💥 잭팟 ${RW.jack || 0}번 · 보상 기준 🪙 ${fmtN(rwBase())} (장사가 클수록 커져요)`, x0 + 220, 466, 12, '#ccc', null);
  }
  txt(TOUCH ? '탭해서 돌리기 · 미션 받기' : 'W/S 고르기 · Enter 돌리기/받기 · 1~3 미션 받기 · Esc 나가기', x0 + 220, 508, 12, '#80d8ff', null);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(14, 10, 100, 34, 8); ctx.fill(); txt('← 나가기', 64, 27, 14, '#fff', null);
  addHot(14, 10, 100, 34, () => { pressed.Escape = true; });
}
const rewardBadge = () => attReady() || spinFree() > 0 || rwMissions().some(m => !m.got && m.n >= m.goal);
// ---- 관리자 선물 받기 (선물마다 한 번) ----
function claimGift() {
  const gf = GIFT;
  if (!gf || !gf.id || (+RW.gift || 0) >= gf.id || (gf.until && Date.now() > gf.until)) return;
  RW.gift = gf.id;
  const lines = [];
  if (gf.coins > 0) { addCoins(gf.coins); lines.push(`🪙 +${fmtN(gf.coins)} 코인`); }
  if (gf.spins > 0) { RW.bonus += gf.spins; lines.push(`🎟️ 룰렛 티켓 +${gf.spins}장`); }
  if (gf.items > 0) { for (const k of ['meter', 'hpup', 'revive']) inv.use[k] = (inv.use[k] || 0) + gf.items; saveInv(); lines.push(`🎒 아이템 3종 각 +${gf.items}개`); }
  if (gf.item && gf.itemN > 0) { inv.use[gf.item] = (inv.use[gf.item] || 0) + gf.itemN; saveInv(); const it = SHOP.find(s => s.id === gf.item); lines.push(`${USE_ICON[gf.item] || '🎁'} ${it ? it.name : gf.item} +${gf.itemN}개`); }
  if (gf.char) { const c = CHARS.find(x => x.name === gf.char); if (c && !lsGet('sgf_unlock_' + c.name, false)) { lsSet('sgf_unlock_' + c.name, true); lines.push(`🐷 새 돼지 ${c.name} 해금!!`); } }
  if (gf.msg) lines.push(gf.msg);
  rwSave(); cloudDirty();
  popup({ icon: '🎁', title: '관리자 선물 도착!', lines, big: true });
}
// ---- 잭팟 (이벤트): 이기면 N% 확률로 승리 코인 10배 → 더 받을 몫(9배)을 돌려줌 ----
function jackpotRoll(base) {
  if (!base || !evLive() || !(EVT.jackpot > 0) || Math.random() * 100 >= EVT.jackpot) return 0;
  RW.jack = (RW.jack || 0) + 1; rwSave();
  popup({ icon: '💥', title: '잭팟!!! 승리 코인 10배', lines: [`+${fmtN(base * 10)} 코인`], big: true });
  return base * 9;
}
// ================= 축하 팝업 (빵빠레) =================
// 싸우는 중에는 기다렸다가 끝나면 띄움. 탭하거나 Enter로 닫음
const POPQ = []; let POP = null, popConf = [];
function popup(o) { POPQ.push({ lines: [], ...o, t: 0 }); }
const popBlocked = () => ['big2trailer', 'bigtrailer', 'ittrailer', 'nrtrailer', 'revive', 'intro', 'fight', 'roundEnd', 'cutscene', 'vs', 'opening', 'story', 'trailer'].includes(scene) || authOpen();
function updatePopup() {
  if (!POP && POPQ.length && !popBlocked()) {
    POP = POPQ.shift(); popConf = [];
    for (let i = 0; i < (POP.big ? 160 : 70); i++) popConf.push({ x: W / 2 + rand(-60, 60), y: H / 2 - 40, vx: rand(-9, 9), vy: rand(-14, -3), r: rand(0, 6), vr: rand(-0.3, 0.3), c: pick(['#ffd740', '#ff4081', '#69f0ae', '#40c4ff', '#fff', '#ff9100']), s: rand(5, 10) });
    if (POP.big) { SFX.bell(); setTimeout(() => SFX.coin(), 250); } else SFX.coin();
  }
  if (!POP) return false;
  POP.t++;
  for (const c of popConf) { c.x += c.vx; c.y += c.vy; c.vy += 0.3; c.vx *= 0.99; c.r += c.vr; }
  if (POP.big && POP.t % 25 === 0 && POP.t < 150) for (let i = 0; i < 30; i++) popConf.push({ x: rand(0, W), y: -10, vx: rand(-2, 2), vy: rand(0, 3), r: 0, vr: rand(-0.3, 0.3), c: pick(['#ffd740', '#ff4081', '#69f0ae', '#40c4ff']), s: rand(5, 9) });
  popConf = popConf.filter(c => c.y < H + 20);
  if (POP.auto && POP.t > POP.auto) { POP = null; return false; }   // 관리자 메시지 창은 14초 뒤 저절로 닫힘
  if (POP.t > 25 && (pressed.Enter || pressed.Space || pressed.KeyI || pressed.Escape)) { POP = null; SFX.select(); }
  for (const k in pressed) delete pressed[k];
  return true;
}
function drawPopup() {
  if (!POP) return;
  const k = Math.min(1, POP.t / 12), sc = 0.6 + 0.4 * (1 - (1 - k) ** 3) + (POP.t < 20 ? Math.sin(POP.t / 20 * Math.PI) * 0.08 : 0);
  ctx.fillStyle = `rgba(0,0,0,${0.6 * k})`; ctx.fillRect(0, 0, W, H);
  if (POP.big) { ctx.save(); ctx.translate(W / 2, H / 2 - 30); ctx.rotate(gT * 0.01); for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.fillStyle = 'rgba(255,215,64,0.12)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-60, -520); ctx.lineTo(60, -520); ctx.closePath(); ctx.fill(); } ctx.restore(); }
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(sc, sc);
  const h = 150 + POP.lines.length * 30;
  ctx.shadowColor = POP.big ? '#ffd740' : '#ff4081'; ctx.shadowBlur = 30;
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#4a148c'); g.addColorStop(1, '#880e4f');
  ctx.fillStyle = g; rr(-260, -h / 2, 520, h, 22); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffd740'; ctx.lineWidth = 4; rr(-260, -h / 2, 520, h, 22); ctx.stroke();
  txt(POP.icon, 0, -h / 2 + 42 + Math.sin(gT * 0.15) * 4, 50, '#fff', null);
  txt(POP.title, 0, -h / 2 + 96, fitSize(POP.title, 32, 480), '#ffe082', '#3e0a20', 7);
  POP.lines.forEach((l, i) => txt(l, 0, -h / 2 + 134 + i * 30, fitSize(l, i === 0 ? 22 : 16, 480), i === 0 ? '#fff59d' : '#fff', '#000', 4));
  ctx.restore();
  for (const c of popConf) { ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.r); ctx.fillStyle = c.c; ctx.fillRect(-c.s / 2, -c.s / 4, c.s, c.s / 2); ctx.restore(); }
  if (POP.t > 25) txt(TOUCH ? '탭해서 닫기' : 'Enter로 닫기', W / 2, H - 30, 14, gT % 40 < 25 ? '#fff' : '#aaa', '#000', 3);
  addHot(0, 0, W, H, () => { pressed.Enter = true; });
}
