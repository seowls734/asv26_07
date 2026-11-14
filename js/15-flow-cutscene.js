// ================= game flow =================
// mode 1 = 연승 모드(vs CPU), mode 0 = 자동 테스트(CPU vs CPU)
let scene = 'title', mode = 1, round = 1, timer = 0, sceneT = 0, hitstop = 0, shake = 0, gT = 0;
let roundMsg = '', roundWinner = null, cut = null;
let superFreeze = 0, superOwner = null, superKind = 'ult';
const sel = { c1: 0 };
let streak = 0, runOver = false, rankPos = -1, lastOpp = -1, toastMsg = '', toastT = 0;
// 랭크전: 연승 모드와 같은 흐름이지만 CPU 실력이 내 티어에 맞춰짐. 티어 점수(TP)는 랭크전에서만 오르내림
let ranked = false;
// ---- 돼타로 시간 정지: 상대만 멈추고(흑백) 돼타로는 마음대로 · 끝나면 쌓인 피해와 함께 날아감 ----
let TSTOP = null;   // { owner, left, max, dmg }
const TIER_SP = 9;   // 스타플래티나 티어 (이상이면 최대 7초)
function tsTick() {
  const f = TSTOP.owner, o = f.opp;
  if (--TSTOP.left <= 0 || o.state !== 'locked' || f.state === 'ko') {
    const hit = TSTOP.dmg; TSTOP = null;
    if (o.state === 'locked') { o.state = 'hit'; o.stun = 30; o.launched = hit > 0; o.vy = hit > 0 ? -9 : 0; o.vx = f.facing * Math.min(14, hit * 0.4); }
    popText(f.x, f.y - 200 * f.sc / 1.15, '시간은 다시 흐른다!', '#fff', 30); shake = 12; SFX.bell();
    return;
  }
  if (TSTOP.left % 60 === 0) SFX.tick();
}
const oppLv = () => mode === 0 ? 3 : ranked ? Math.round(tierOf(tp) * 1.4) + Math.min(4, Math.floor(streak / 2)) : streak;

function startRun() { streak = 0; runOver = false; rankPos = -1; lastOpp = -1; betSel = 0; p1.setChar(withCos(getChar(sel.c1))); sceneT = 0;
  // 오프닝 컷신은 처음 한 번만. 그 뒤로는 바로 상대 소개로
  if (lsGet('sgf_open_seen', false)) nextOpponent(); else { lsSet('sgf_open_seen', true); scene = 'opening'; } parts = []; texts = []; }
function nextOpponent() {
  let i; do { i = pickShown(); } while (i === sel.c1 || i === lastOpp);
  lastOpp = i; p2.setChar(CHARS[i]); scene = 'vs'; sceneT = 0;
}
// 중간에 그만두면 지금까지의 연승을 기록
// 랭크전 싸움 도중 나가면 패배 처리 (지는 중에 나가서 점수 지키기 방지)
function rankedForfeit() { if (!lsGet("sgf_rkpending", false)) return; lsSet("sgf_rkpending", false); rankedResult(false, false); lsSet("sgf_ranked", true); uploadRank(); toast("⚠️ 랭크전 도중 나가서 패배로 처리됐어요"); }
function quitRun() {
  if (mode === 8) return worldFightQuit();
  if (mode === 1 && ranked && ["intro", "fight", "roundEnd"].includes(scene)) rankedForfeit(); if (mode === 1 && !runOver && streak > 0) { rankPos = saveRank({ name: playerName, streak, char: p1.base, time: Date.now(), rk: !!ranked }); runOver = true; } toTitle(); }
function startMatch() {
  if (mode !== 3) sseed(Math.random() * 4294967296 >>> 0);
  p1.cpuLv = mode === 0 ? 3 : 0; p2.cpuLv = oppLv();
  p1.newMatch(); p2.newMatch();
  if (mode === 1 && ranked) lsSet('sgf_rkpending', true);   // 랭크전 판 시작 표시 (끝나기 전에 창을 닫으면 다음 접속 때 패배 처리)
  p1.name = mode === 0 ? p1.base + ' (CPU)' : playerName;
  p2.name = mode === 0 ? p2.base + ' (CPU)' : `${p2.base} Lv.${oppLv() + 1}`;
  if (mode === 5) p2.name = '연습용 허수아비';
  if (mode === 6) { p1.name = playerName; p2.name = p2.base + ' (연습 · 가만히)'; }
  if (mode === 1) p2.meter = Math.min(40, (ranked ? tierOf(tp) : streak) * 4);
  if (mode === 3) { p1.cpuLv = p2.cpuLv = 0; p1.name = NET.names[0]; p2.name = NET.names[1]; }
  p1.hpMul = p2.hpMul = 1; p1.awk = p2.awk = false; p1.sukuna = p2.sukuna = false; p1.lvMul = p2.lvMul = 1; p1.condDmg = p2.condDmg = 1; p1.cond = p2.cond = -1;
  if (mode === 4) {   // AI 베팅: 컨디션이 실제 체력·공격력에 반영됨
    p1.cond = bet4.ca; p2.cond = bet4.cb;
    p1.hpMul = COND_HP[bet4.ca]; p2.hpMul = COND_HP[bet4.cb]; p1.condDmg = COND_DMG[bet4.ca]; p2.condDmg = COND_DMG[bet4.cb];
  }
  if (mode === 4) { p1.cpuLv = COND_LV[bet4.ca]; p2.cpuLv = COND_LV[bet4.cb]; p1.name = `${p1.base} ×${bet4.oa.toFixed(2)}`; p2.name = `${p2.base} ×${bet4.ob.toFixed(2)}`; }
  if (mode === 1) {
    if (inv.use.hpup > 0) { inv.use.hpup--; p1.hpMul = 1.15; toast('🛡️ 강철 체력! 체력 +15%'); }
    if (inv.use.meter > 0) { inv.use.meter--; p1.meter = 50; toast('⚡ 필살 게이지 50%로 시작!'); }
    if (inv.use.fullMeter > 0) { inv.use.fullMeter--; p1.meter = 100; toast('🔥 필살 게이지 100%로 시작!'); }
    p1.lucky = false; if (inv.use.luckyCharm > 0) { inv.use.luckyCharm--; p1.lucky = true; toast('🍀 황금 행운 부적! 이기면 승리 코인 5배'); }
    { const lv = pigLv(p1.ch.name); if (lv) { p1.lvMul = pigMul(lv); p1.hpMul = (p1.hpMul || 1) * p1.lvMul; } }   // 🐷 돼지 강화
    if (p1.ch.name === '이타돼리') applyItForm(p1, itForm());   // 기본 · 모듈로 · 스쿠나
    if (awkOn(p1.ch.name) && (p1.ch.name !== '이타돼리' || p1.itForm === 'sukuna')) { p1.awk = true; p1.hpMul = (p1.hpMul || 1) * AWAKE[p1.ch.name].hp; toast(`⚡ ${AWAKE[p1.ch.name].title}`); }   // 각성한 돼지
    saveInv();
  }
  if (mode === 6 && p1.ch.name === '이타돼리') applyItForm(p1, itForm());   // 연습에서도 고른 모습으로

  round = 1; sizzleOff(); startRound();
}
function startRound() {
  p1.reset(); p2.reset(); timer = ROUND_T; scene = 'intro'; sceneT = 0;
  p1.standOn = p2.standOn = false; p1.spX = p2.spX = null;   // 라운드마다 스탠드는 넣고 시작
  parts = []; texts = []; objs = []; hitGroups.clear(); hitstop = 0; superFreeze = 0; TSTOP = null;
  temps.fill(0); flareI = -1; flareT = 0; flareNext = 0;
  evT = 60 * 8; blackoutT = 0; saltT = 0; evBannerT = 0; firstHit = false;
}
function toTitle() {
  scene = 'title'; sizzleOff(); parts = []; texts = []; objs = []; xmasTick();   // 🎄 골드 티어면 크리스마스 퀘스트 칸 채움
  if (!/autotest/.test(location.search)) checkChapters();   // 엔딩 조건(재벌·마스터·파산) 확인
}
let firstHit = false;
function endRound(winner, msg) {
  if (winner && msg === 'K.O.!!' && winner.hp >= winner.maxHp - 0.01) msg = 'PERFECT!!';
  scene = 'roundEnd'; sceneT = 0; roundMsg = msg; roundWinner = winner; if (winner) winner.wins++; objs = []; blackoutT = 0; saltT = 0;
  speak(msg === 'PERFECT!!' ? '퍼펙트!' : msg === 'K.O.!!' ? '케이오!' : msg === 'DRAW' ? '무승부' : '타임 오버');
}
function timeOver() {
  const r1 = p1.hp / p1.maxHp, r2 = p2.hp / p2.maxHp;
  if (Math.abs(r1 - r2) < 0.001) endRound(null, 'DRAW');
  else endRound(r1 > r2 ? p1 : p2, 'TIME OVER');
}
function afterRound() {
  const champ = p1.wins >= 2 ? p1 : p2.wins >= 2 ? p2 : null;
  if (champ === p2 && mode === 1 && ((inv.use.bigRevive || 0) > 0 || (inv.use.revive || 0) > 0)) { RV.t = 0; RV.sel = 0; scene = 'revive'; return; }   // 졌을 때 부활권: 쓸지 물어봄
  if (champ && mode === 8) return worldFightEnd(champ === p1);   // 🌍 월드 싸움: 해체·보상 뒤 로비로
  if (champ) startCutscene(champ, champ.opp);
  else { round++; startRound(); }
}
// ---- 💖 부활권 쓸까요? (졌을 때마다 고르기 · 15초 안 고르면 안 씀) ----
const RV = { t: 0, sel: 0, choice: 'none' };
const rvOpts = () => [(inv.use.bigRevive || 0) > 0 && ['big', `💎 대형 부활권 쓰기 (${inv.use.bigRevive}개)`, '이어하기 + 건 돈·티어 점수 안 잃음'], (inv.use.revive || 0) > 0 && ['normal', `💖 부활권 쓰기 (${inv.use.revive}개)`, '이어하기 (건 돈은 잃어요)'], ['none', '❌ 안 쓰고 끝내기', '부활권은 아껴 둬요']].filter(Boolean);
function reviveGo(c) { RV.choice = c; SFX.confirm(); startCutscene(p2, p1); RV.choice = 'none'; }
function updateRevive() {
  const L = rvOpts(); RV.t++;
  if (pressed.KeyW || pressed.ArrowUp) { RV.sel = (RV.sel + L.length - 1) % L.length; SFX.select(); }
  if (pressed.KeyS || pressed.ArrowDown) { RV.sel = (RV.sel + 1) % L.length; SFX.select(); }
  for (let i = 0; i < L.length; i++) if (pressed['Digit' + (i + 1)]) return reviveGo(L[i][0]);
  if (RV.t > 20 && (pressed.Enter || pressed.Space || pressed.KeyI)) return reviveGo(L[RV.sel][0]);
  if (pressed.Escape || RV.t >= 900) return reviveGo('none');
}
function drawRevive() {
  drawFight(); ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, W, H);
  const L = rvOpts();
  txt('💀 졌어요! 부활권을 쓸까요?', W / 2, 120, 34, '#ffcdd2', '#000', 8);
  txt(`${streak}연승 중 · ${Math.ceil((900 - RV.t) / 60)}초 안에 안 고르면 안 써요`, W / 2, 162, 15, '#ccc', '#000', 4);
  L.forEach(([k, a, b], i) => {
    const y = 200 + i * 78, on = RV.sel === i;
    ctx.fillStyle = on ? (k === 'big' ? 'rgba(0,176,255,0.6)' : k === 'normal' ? 'rgba(255,64,129,0.55)' : 'rgba(120,120,120,0.6)') : 'rgba(25,12,40,0.9)'; rr(W / 2 - 260, y, 520, 66, 14); ctx.fill();
    if (on) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; rr(W / 2 - 260, y, 520, 66, 14); ctx.stroke(); }
    txt(`${i + 1}. ${a}`, W / 2, y + 24, 22, '#fff', '#000', 4); txt(b, W / 2, y + 50, 13, '#eee', null);
    addHot(W / 2 - 260, y, 520, 66, () => { RV.sel = i; pressed.Enter = true; });
  });
}
// 돼타로 스탠드: I+O로 꺼내면 뚱타플레티나가 계속 나와서 상대를 따라감 (돼타로에게서 380px까지)
function standToggle(f) {
  f.standOn = !f.standOn; f.vx = 0; f.state = f.y >= GROUND ? 'idle' : 'jump';
  const k = f.sc / 1.15;
  if (f.standOn) { f.spX = f.x + f.facing * 62 * k; if (!smp((f.ch.standSnd || {}).summon || 'ttSummon', { v: 1.2 })) SFX.special(); popText(f.x, f.y - 200 * k, `${f.ch.standName}!`, '#d1c4e9', 26); burst(f.spX, f.y - 100 * k, 16, ['#b388ff', '#e1bee7'], 7); }
  else { popText(f.x, f.y - 200 * k, '들어가.', '#b39ddb', 22); SFX.whiff(); }
}
function standMove(f) {
  if (!f.ch.spirit || !f.standOn) return;
  const k = f.sc / 1.15, tgt = clamp(f.opp.x - f.facing * 95 * k, f.x - 380, f.x + 380);
  if (f.spX == null) f.spX = f.x;
  f.spX += clamp(tgt - f.spX, -9, 9);
}
function updateFighters(frozen) {
  if (TSTOP && (scene !== 'fight' || TSTOP.owner.opp.state !== 'locked')) TSTOP = null;   // 라운드가 끝났거나(KO) 상대가 풀렸으면 시간 정지도 끝
  let i1 = EMPTY, i2 = EMPTY;
  if (!frozen) {
    if (mode === 3) { i1 = netIn.p1; i2 = netIn.p2; }
    else {
      if (mode === 0 || mode === 4) i1 = { ...cpuInput(p1, p2), bot: true };
      else i1 = orInput(readInput(MAP1), readInput(MAP2));
      i2 = mode === 5 || mode === 6 ? EMPTY : { ...cpuInput(p2, p1), bot: true };   // 튜토리얼: 허수아비는 가만히   // bot: CPU 입력은 커맨드 해석 안 함
    }
  }
  const slowed = f => f.opp.sandT > 0 && gT % 3 !== 0;   // 볼트돈 오버클럭: 상대가 아주 느려짐
  if ((!TSTOP || TSTOP.owner === p1) && !slowed(p1)) p1.update(i1, p2);   // 시간 정지: 멈춘 쪽은 아예 안 움직임
  if ((!TSTOP || TSTOP.owner === p2) && !slowed(p2)) p2.update(i2, p1);
  standMove(p1); standMove(p2);
  separate(p1, p2);
  if (scene === 'fight') {
    checkHit(p1, p2); checkHit(p2, p1);
    for (const f of [p1, p2]) if (f.hp > 0) f.stats.minHpRatio = Math.min(f.stats.minHpRatio, f.hp / f.maxHp);
  }
}

function updateSelect() {
  const sh = shownIdx(), cols = selCols(), N = sh.length; let pos = Math.max(0, sh.indexOf(sel.c1));   // 칸 위치 ↔ 돼지 번호
  if (pressed.KeyA || pressed.ArrowLeft) pos = (pos + N - 1) % N;
  if (pressed.KeyD || pressed.ArrowRight) pos = (pos + 1) % N;
  if (pressed.KeyW || pressed.KeyS || pressed.ArrowUp || pressed.ArrowDown) pos = (pos + cols) % N;
  const i = sh[pos];
  if (i !== sel.c1) { sel.c1 = i; SFX.select(); }
  if (pressed.KeyI || pressed.KeyJ || pressed.Space || pressed.Enter) {
    const lc = getChar(sel.c1);
    if (!isUnlocked(lc)) { SFX.block(); toast(lc.unlock === 'admin' ? `🔒 ${lc.name}: ${lc.how || '관리자가 선물로 주는 돼지예요'}` : `🔒 ${lc.name}: 랭크전 ${TIERS[lc.unlock][0]} 티어를 달성하면 해금돼요`); return; }
    SFX.confirm();
    if (selFor === 'online') { scene = 'online'; NET.err = ''; } else startRun();
  }
  if (pressed.Escape && !isUnlocked(getChar(sel.c1))) sel.c1 = 0;   // 잠긴 돼지에 커서를 둔 채 나가면 기본 돼지로
  if (pressed.Escape) { if (selFor === 'online') scene = 'online'; else toTitle(); }
}
function toast(s) { toastMsg = s; toastT = 150; }

function step() {
  gT++;
  if (toastT > 0) toastT--;
  if (scene !== 'tycoon' && (tyU.auto || tyU.idle)) tyBackground();   // 자동 영업: 다른 화면에서도 계속
  if (pendingSave && safeToReload()) applyRemoteSave();   // 싸움이 끝나면 바뀐 계정 기록 받기
  releaseTick(); updateTick();   // 🆕 공개 시각 · 새 버전 자동 받기
  if (promoFxInput()) return;   // 🏆 승급 연출 중
  if (updatePopup()) return;   // 축하 팝업이 떠 있으면 화면 입력은 막음
  if (tutInput()) return;   // 튜토리얼 넘기기 · 그만
  if (tourInput()) return;   // 튜토리얼 2부 (화면 둘러보기)
  tutTick();
  if (scene === 'title') updateTitle();
  else if (scene === 'select') updateSelect();
  else if (scene === 'market') updateMarket();
  else if (scene === 'betpick') updateBetPick();
  else if (scene === 'online') updateOnline();
  else if (scene === 'ranking') updateRanking();
  else if (scene === 'story') updateStory();
  else if (scene === 'bank') updateBank();
  else if (scene === 'worlds') updateWorlds();
  else if (scene === 'wplay') updateCatch();
  else if (scene === 'wstory') updateWStory();
  else if (scene === 'stock') updateStock();
  else if (scene === 'lobby') updateLobby();
  else if (scene === 'snipe') updateSnipe();
  else if (scene === 'butcher') updateButcher();
  else if (scene === 'stall') updateStall();
  else if (scene === 'endings') updateEndings();
  else if (scene === 'reward') updateReward();
  else if (scene === 'trailer') updateTrailer();
  else if (scene === 'nrtrailer') updateNrTrailer();
  else if (scene === 'ittrailer') updateItTrailer();
  else if (scene === 'bigtrailer') updateBigTrailer();
  else if (scene === 'big2trailer') updateBig2Trailer();
  else if (scene === 'keys') updateKeys();
  else if (scene === 'pigs') updatePigs();
  else if (scene === 'cutlist') updateCutList();
  else if (scene === 'revive') { updateRevive(); if (pressed.Escape) pressed.Escape = false; }
  else if (scene === 'tycoon') updateTycoon();
  else if (scene === 'opening') {
    sceneT++; updateOpening();
    if (sceneT >= OPEN_T || pressed.Space || pressed.Enter) { try { speechSynthesis.cancel(); } catch (e) {} nextOpponent(); }
    if (pressed.Escape) toTitle();
  } else if (scene === 'vs' && (mode === 3 || mode === 4)) { if (++sceneT >= (mode === 4 ? 110 : 150)) startMatch(); }
  else if (scene === 'vs') {
    sceneT++;
    const canBet = mode === 1 && coins > 0;
    if (canBet) {
      const old = betSel;
      if (pressed.Digit1 || pressed.Numpad1) betSel = 0; if (pressed.Digit2 || pressed.Numpad2) betSel = 1; if (pressed.Digit3 || pressed.Numpad3) betSel = 2;
      if (pressed.KeyA || pressed.ArrowLeft) betSel = (betSel + 2) % 3; if (pressed.KeyD || pressed.ArrowRight) betSel = (betSel + 1) % 3;
      if (old !== betSel) SFX.select();
    }
    if (sceneT >= (canBet ? 600 : 120) || (sceneT > 20 && (pressed.Space || pressed.Enter || pressed.KeyI))) {
      bet = canBet ? [0, Math.floor(coins / 2), coins][betSel] : 0;
      if (bet > 0) { addCoins(-bet); SFX.stamp(); }
      startMatch();
    }
    if (pressed.Escape) quitRun();
  } else if (scene === 'intro') {
    sceneT++; updateFighters(true);
    if (sceneT === 2) speak(p1.wins === 1 && p2.wins === 1 ? '파이널 라운드!' : `라운드 ${round}!`);
    if (sceneT === 75) { SFX.bell(); speak('파이트!', 1.4); }
    if (sceneT >= 120) scene = 'fight';
  } else if (scene === 'fight') {
    if (superFreeze > 2 && mode !== 3 && superKind !== 'tf' && (pressed.Enter || pressed.Space)) skipCut();   // 컷신 건너뛰기
    if (superFreeze > 0) { superFreeze--; if (superKind === 'rasen' && superFreeze === 1) SFX.special(); if (superKind === 'ult' && superOwner && superOwner.ch.ult.type === 'timeStop') tsCutSfx(TS_CUT - superFreeze); }
    else if (hitstop > 0) hitstop--;
    else {
      updateFighters(false);
      if (scene === 'fight') {
        if (TSTOP) { tsTick(); updateObjs(true); }   // 시간 정지 중엔 날아가던 것·바닥·사건·라운드 시간도 멈춤
        else { updateObjs(); updateFloor(); updateEvents(); }
        if (scene === 'fight' && !TSTOP) {
          if (mode !== 6) timer--;   // 연습 모드: 시간 무한
          if (timer % 60 === 0 && timer <= 600 && timer > 0) SFX.tick();
          if (timer <= 0) timeOver();
        }
      }
    }
    if (pressed.Escape) quitRun();
  } else if (scene === 'roundEnd') {
    sceneT++;
    if (hitstop > 0) hitstop--;
    else if (sceneT > 70 || sceneT % 3 === 0) updateFighters(true);
    if (sceneT === 110 && roundWinner) SFX.stamp();
    if (sceneT >= 230) afterRound();
  } else if (scene === 'cutscene') {
    const on3 = mode === 3, ci = on3 ? (cut.w === p1 ? netIn.p1 : netIn.p2) : null;
    const anyOk = on3 ? netIn.p1.ok || netIn.p2.ok : false;
    if (!cut.chosen && cut.t >= CHOICE_T) { cut.t = CHOICE_T; cut.waiting = true; }
    if (cut.waiting) {
      for (let i = 0; i < 3; i++) if (on3 ? ci['n' + (i + 1)] : (pressed['Digit' + (i + 1)] || pressed['Numpad' + (i + 1)])) { chooseDish(i); break; }
      if (cut.waiting) {
        if (on3 ? ci.leftP : (pressed.KeyA || pressed.ArrowLeft)) { cut.sel = (cut.sel + 2) % 3; SFX.select(); }
        if (on3 ? ci.rightP : (pressed.KeyD || pressed.ArrowRight)) { cut.sel = (cut.sel + 1) % 3; SFX.select(); }
        if (on3 ? ci.ok : (pressed.Enter || pressed.Space || pressed.KeyI)) chooseDish(cut.sel);
        else if ((mode === 0 || mode === 4) && ++cut.waitN > (mode === 4 ? 80 : 20)) chooseDish(Math.random() * 3 | 0);
      }
    } else {
      cut.t += 1 / 60;
      const skip = on3 ? anyOk : pressed.Space, next = on3 ? anyOk : pressed.Enter;
      if (cut.t > T_GRL + 0.6 && next) {
        sizzleOff();
        if (on3) { scene = 'vs'; sceneT = 0; }
        else if (mode === 4) openBet();
        else if (mode !== 1) toTitle();
        else if (runOver) openRanking(true);
        else nextOpponent();
      } else if (skip) {
        if (!cut.chosen) { cut.prev = Math.min(cut.prev, 1.99); cut.t = CHOICE_T; }
        else if (cut.t < T_GRL) { cut.prev = T_GRL - 0.001; cut.t = T_GRL; parts = []; texts = []; }
      }
      if (scene === 'cutscene') updateCutscene();
    }
    if (!on3 && pressed.Escape) quitRun();
  }

  updParts();
  shake = shake > 0.5 ? shake * 0.88 : 0;
  for (const k in pressed) delete pressed[k];
}

// ================= grade =================
function computeGrade(w) {
  const s = w.stats;
  if (s.minHpRatio < 0.15) return { t: '냉동 대패삼겹살', d: '아슬아슬한 대역전승!', stars: 4 };
  if (s.maxCombo >= 6) return { t: '벌집 삼겹살', d: `최대 ${s.maxCombo}콤보의 화려한 칼집`, stars: 5 };
  if (w.hp / w.maxHp >= 0.8 && s.minHpRatio >= 0.5) return { t: '최고급 오겹살', d: '정교하고 깔끔한 승리', stars: 5 };
  if (s.ultFinish) return { t: '직화 불맛 삼겹살', d: '필살기로 마무리!', stars: 5 };
  if (s.parries >= 3) return { t: '드라이에이징 숙성 삼겹', d: `숙성 패링 ${s.parries}회`, stars: 4 };
  if (s.hits >= 25) return { t: '정육 마스터 모둠구이', d: `${s.hits}번 두들긴 연타`, stars: 4 };
  return { t: '1등급 생삼겹살', d: '든든한 승리', stars: 3 };
}
function drawStamp(x, y, l1, l2, sc, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= 0.92;
  ctx.fillStyle = 'rgba(255,248,240,0.96)'; rr(-140, -56, 280, 112, 18); ctx.fill();   // 뒤 배경 글씨(간판 등)가 비쳐서 겹쳐 보이지 않게 불투명하게
  ctx.strokeStyle = '#d32f2f'; ctx.lineWidth = 7; rr(-140, -56, 280, 112, 18); ctx.stroke();
  ctx.lineWidth = 3; rr(-128, -44, 256, 88, 10); ctx.stroke();
  txt(l1, 0, l2 ? -12 : 0, l1.length > 8 ? 26 : 34, '#d32f2f', null);
  if (l2) txt(l2, 0, 24, 15, '#d32f2f', null);
  ctx.restore();
}

// ================= cutscene =================
const T_KIT = 3.8, T_GRL = 9.4, BY = 445;
const CUTX = [0, 1, 2, 3].map(i => 340 + (i + 1) * 56 + 6 * i);
const CHOICE_T = 2.2;
function startCutscene(w, l) {
  const meat = spick(MEATS);
  scene = 'cutscene'; parts = []; texts = []; shake = 0; TSTOP = null;
  if (w.ch.winSnd) smp(w.ch.winSnd, { v: 1, at: 0.4 });   // 이기면 그 돼지 전용 한마디 (돼타로만 있음)
  cut = { w, l, t: 0, prev: 0, grade: computeGrade(w), meat, options: meat.opts.map(o => [srnd(), o]).sort((a, b) => a[0] - b[0]).map(x => x[1]),
    dish: null, chosen: false, waiting: false, sel: 0, waitN: 0, stars: 3, earn: { win: 0, bet: 0, dish: 0 } };
  if (mode === 1) {
    if (w === p1) {
      streak++;
      cut.earn.win = Math.round((50 + streak * 10) * (p1.ch.name === '금한돈' ? 3 : 1) * evMul('coin') * EARN); if (p1.lucky) { cut.earn.win *= 5; p1.lucky = false; }   // 황금 행운 부적   // 금한돈: 승리 코인 3배
      cut.earn.win += jackpotRoll(cut.earn.win); rwProgress('win'); if (ranked) rwProgress('ranked');   // 잭팟 이벤트 · 일일 미션
      if (ranked) nqAdd('ranked', 1); else nqAdd('streak', streak, true);   // 돼루토 퀘스트
      if (p1.ch.name === '이타돼리') { nqAdd('itwin', 1); if (!ranked) nqAdd('itstreak', streak, true); }   // 모듈로 각성 퀘스트
      { const nm = p1.ch.name; awkAdd(nm, 'win'); if (ranked) awkAdd(nm, 'ranked'); else awkAdd(nm, 'streak', streak, true); if (p1.stats.minHpRatio >= 0.999) awkAdd(nm, 'perfect'); }   // ⚡ 각성 조건
      if (bet > 0) cut.earn.bet = bet * (betSel === 2 ? 3 : 2);
      addCoins(cut.earn.win + cut.earn.bet);
    } else {
      if (bet > 0) cut.earn.bet = -bet;
      awkAdd(p1.ch.name, 'lose');   // ⚡ 각성 조건: 그 돼지로 지기
      if (RV.choice === 'big' && inv.use.bigRevive > 0) { inv.use.bigRevive--; saveInv(); cut.revived = true; cut.bigRev = true; if (bet > 0) { addCoins(bet); cut.earn.bet = 0; } toast('💎 대형 부활권! 건 돈·티어 점수 그대로 이어서'); }   // 대형 부활권: 돈·랭크 안 잃음
      else if (RV.choice === 'normal' && inv.use.revive > 0) { inv.use.revive--; saveInv(); cut.revived = true; }   // 고른 부활권만 씀
      else { runOver = true; rankPos = saveRank({ name: playerName, streak, char: p1.base, time: Date.now(), rk: !!ranked }); }
    }
    bet = 0;
  }
  if (mode === 4) {
    const win = (w === p1) === (bet4.side === 0);
    if (bet4.stake > 0) { const pay = win ? Math.round(bet4.stake * (bet4.side === 0 ? bet4.oa : bet4.ob)) : 0; cut.earn.bet = win ? pay : -bet4.stake; if (pay) addCoins(pay); }
  }
  if (mode === 3) {
    const meWin = w === NET.me;
    cut.earn.win = meWin ? Math.round(80 * (NET.me.ch.name === '금한돈' ? 3 : 1) * evMul('coin') * EARN) : 0; if (meWin) { cut.earn.win += jackpotRoll(cut.earn.win); rwProgress('win'); addCoins(cut.earn.win); }   // 금한돈: 3배
    const r = lsGet('sgf_online', { w: 0, l: 0 }); r[meWin ? 'w' : 'l']++; lsSet('sgf_online', r);
  }
  afterMatchEconomy(w);
}
// 요리 선택: 찰떡 궁합은 안정적, 모험 요리는 별점이 들쭉날쭉하지만 코인 2배
function chooseDish(i) {
  const o = cut.options[i]; cut.dish = makeDish(o); cut.chosen = true; cut.waiting = false; SFX.confirm();
  const fit = o[2];
  cut.stars = fit === 3 ? 4 + (srnd() * 2 | 0) : fit === 2 ? 3 + (srnd() * 3 | 0) : 1 + (srnd() * 5 | 0);
  cut.earn.dish = 0;
  if ((mode === 1 && cut.w === p1) || (mode === 3 && cut.w === NET.me)) { addDish(cut.dish, cut.meat.name, cut.stars); cut.fridged = true; }
  popText(480, 200, `${cut.dish.name}!`, '#ffeb3b', 44); speak(cut.dish.name + '!');
}
function drawChoice() {
  ctx.fillStyle = 'rgba(0,0,0,0.62)'; ctx.fillRect(0, 0, W, H);
  txt(`오늘의 부위: ${cut.meat.name}!`, W / 2, 96, 42, '#ffccbc', '#000', 8);
  txt(`어떤 요리로 만들까? (1·2·3 / ←→ + Enter${TOUCH ? ' / 탭' : ''})`, W / 2, 146, 18, '#fff', '#000', 5);
  cut.options.forEach((o, i) => {
    const x = W / 2 - 300 + i * 205, y = 180, w = 190, h = 230, on = cut.sel === i;
    ctx.fillStyle = on ? 'rgba(255,224,130,0.95)' : 'rgba(255,255,255,0.88)'; rr(x, y, w, h, 16); ctx.fill();
    ctx.strokeStyle = on ? '#ff6f00' : '#888'; ctx.lineWidth = on ? 5 : 2; rr(x, y, w, h, 16); ctx.stroke();
    txt(`${i + 1}`, x + 22, y + 22, 20, '#fff', '#5d4037', 5);
    const cx = x + w / 2, cy = y + 80;
    drawDishArt(o[0], o[1], cx, cy, 0.7);   // 요리마다 다른 그림
    txt(o[0], cx, y + 146, o[0].length > 6 ? 19 : 23, '#3e2723', null);
    txt(METHODS[o[1]].label, cx, y + 176, 15, '#6d4c41', null);
    txt(FIT[o[2]], cx, y + 206, 13, FITCOL[o[2]], '#3e2723', 4);
    addHot(x, y, w, h, () => { pressed['Digit' + (i + 1)] = true; });
  });
  if (mode === 3) txt(cut.w === NET.me ? '승자인 내가 고른다!' : `승자 ${cut.w.name}님이 고르는 중... (구경만 가능)`, W / 2, 474, 17, '#80d8ff', '#000', 4);
  if (mode === 1 || mode === 3) txt('찰떡 궁합 = 별점 안정 · 모험 요리 = 별점 랜덤, 대신 시장에서 1.5배! (이긴 쪽 냉장고로)', W / 2, 446, 15, '#fff59d', '#000', 4);
}
const crossed = x => cut.prev < x && cut.t >= x;
const stripY = i => 150 + i * 60;
function updateCutscene() {
  const t = cut.t, m = cut.dish ? cut.dish.method : 'grill';
  if (crossed(0.3)) SFX.oink();
  if (crossed(1.05)) SFX.squeal();
  if (crossed(2.0)) { SFX.chop(); shake = 16; popText(480, 250, '탁!!', '#fff', 90); }
  for (let i = 0; i < 4; i++) if (crossed(2.5 + i * 0.25)) { SFX.chop(); shake = 6; popText(CUTX[i], 320, '탁', '#fff', 40); }
  if (t > T_KIT && t < T_GRL) {
    const g = t - T_KIT;
    if (crossed(T_KIT + 0.2)) sizzleOn();
    if (m === 'grill') {
      for (let i = 0; i < 5; i++) if (crossed(T_KIT + 0.5 + i * 0.18)) {
        popText(rand(320, 640), stripY(i) - 10, '치익!', '#ffcc80', 30);
        burst(rand(380, 580), stripY(i) + 20, 10, ['#fff3c4', '#ffe082'], 6);
      }
      if (crossed(T_KIT + 4.35)) popText(480, 95, '싹둑싹둑!', '#fff', 40);
    } else {
      if (crossed(T_KIT + 0.6)) {
        popText(480, 200, m === 'fry' ? '촤악!' : m === 'wok' ? '투하!' : '풍덩!', '#fff', 48); SFX.chop();
        burst(480, 280, 24, m === 'fry' || m === 'wok' ? ['#fff59d', '#ffe082'] : ['#e1f5fe', '#ffffff'], 9);
      }
      if (crossed(T_KIT + 4.35)) popText(480, 95, '먹기 좋게 썰기!', '#fff', 40);
    }
    if (crossed(T_KIT + 3.0)) popText(480, 95, cut.dish.mid, '#fff', 40);
    for (let i = 0; i < 5; i++) if (crossed(T_KIT + 4.4 + i * 0.12)) (m === 'grill' ? SFX.snip : SFX.chop)();
    const wet = m === 'braise' || m === 'boil';
    sizzleSet(g < 0.5 ? 0 : g > 5.2 ? 0.02 : wet ? 0.03 : 0.1 + Math.random() * 0.12);
    if (wet && gT % 12 === 0 && g < 5.2) tone(110 + Math.random() * 60, 0.08, 'sine', 0.1, 220);
    if (g > 0.6 && Math.random() < (wet ? 0.7 : 0.5)) smoke(rand(330, 630), wet ? rand(200, 260) : rand(150, 420), wet ? '255,255,255' : '220,220,220');
    if (m === 'wok' && Math.random() < 0.3) flame(rand(320, 640), rand(420, 460));
    if ((m === 'grill' || m === 'fry') && g > 0.6 && Math.random() < 0.4)
      parts.push({ x: rand(320, 640), y: rand(150, 430), vx: rand(-2, 2), vy: rand(-5, -2), life: 20, max: 20, c: '#fff59d', s: rand(1.5, 3), g: 0.3, type: 'dot' });
  }
  if (crossed(T_GRL)) { SFX.bell(); sizzleOn(); sizzleSet(0.03); }
  if (crossed(T_GRL + 1.3)) { SFX.stamp(); shake = 10; }
  if (cut.tp && crossed(T_GRL + 1.9) && tierOf(cut.tp.after) > tierOf(cut.tp.before)) { SFX.bell(); speak('티어 승급!'); }
  if (t > T_GRL && Math.random() < 0.15) smoke(rand(470, 730), 390);
  if (t > T_GRL && cut.w === p1 && mode === 1 && gT % 18 === 0) burst(rand(80, W - 80), rand(40, 200), 24, [pick(['#ff5252', '#ffd740', '#69f0ae', '#40c4ff']), '#fff'], 8);
  cut.prev = t;
}
function knifeTip(t) {
  if (t < 1.7) return { x: 480, y: lerp(-60, 170, ease((t - 0.9) / 0.5)) };
  if (t < 2.0) return { x: 480, y: lerp(170, BY, ((t - 1.7) / 0.3) ** 2) };
  if (t < 2.4) return { x: 480, y: lerp(BY, 280, ease((t - 2.1) / 0.3)) };
  const f = (t - 2.4) / 0.25;
  if (f >= 4) return { x: CUTX[3], y: lerp(280, -100, ease((t - 3.4) / 0.25)) };
  const i = Math.floor(f), ph = f - i;
  return { x: CUTX[i], y: ph < 0.4 ? lerp(280, BY, (ph / 0.4) ** 2) : ph < 0.6 ? BY : lerp(BY, 280, (ph - 0.6) / 0.4) };
}
function drawCleaver(x, y, glint) {
  ctx.fillStyle = '#4e342e'; rr(x + 52, y - 120, 98, 26, 10); ctx.fill();
  ctx.fillStyle = '#d7ccc8'; for (const k of [80, 105, 130]) { ell(x + k, y - 107, 3, 3); ctx.fill(); }
  const g = ctx.createLinearGradient(x - 65, 0, x + 62, 0);
  g.addColorStop(0, '#b0bec5'); g.addColorStop(0.5, '#fafafa'); g.addColorStop(1, '#90a4ae');
  ctx.fillStyle = g; ctx.strokeStyle = '#607d8b'; ctx.lineWidth = 3;
  poly([[x - 65, y - 128], [x + 58, y - 128], [x + 62, y], [x - 65, y - 4]]); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; line(x - 62, y - 7, x + 59, y - 3);
  ctx.fillStyle = '#555'; ell(x + 36, y - 108, 8, 8); ctx.fill();
  if (glint) {
    ctx.fillStyle = '#fff';
    poly([[x - 40, y - 140], [x - 35, y - 115], [x - 10, y - 110], [x - 35, y - 105], [x - 40, y - 80], [x - 45, y - 105], [x - 70, y - 110], [x - 45, y - 115]]);
    ctx.fill();
  }
}
function drawHalo(x, y) { ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 4; ell(x, y, 15, 4); ctx.stroke(); }
function drawKitchen(t) {
  const L = cut.l;
  ctx.fillStyle = '#efe7d4'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#d8ccb0'; ctx.lineWidth = 2;
  for (let x = 0; x < W; x += 48) line(x, 0, x, 340);
  for (let y = 0; y < 340; y += 48) line(0, y, W, y);
  ctx.fillStyle = '#6d4c2f'; rr(60, 70, 240, 130, 8); ctx.fill();
  ctx.fillStyle = '#2f4f3a'; rr(70, 80, 220, 110, 6); ctx.fill();
  txt('오늘의 메뉴', 180, 110, 22, '#fff', null);
  txt(cut.dish ? `${cut.dish.name} 1인분 ♥` : `${cut.meat.name} 특가!`, 180, 152, 22, '#ffeb3b', null);
  ctx.fillStyle = 'rgba(255,240,180,0.18)'; poly([[670, 120], [730, 120], [830, 470], [570, 470]]); ctx.fill();
  ctx.strokeStyle = '#333'; ctx.lineWidth = 3; line(700, 0, 700, 90);
  ctx.fillStyle = '#444'; poly([[668, 120], [732, 120], [715, 90], [685, 90]]); ctx.fill();
  ctx.fillStyle = '#8b5a2b'; ctx.fillRect(0, 340, W, H - 340);
  ctx.fillStyle = '#a8703a'; ctx.fillRect(0, 340, W, 12);
  ctx.fillStyle = '#b07a40'; rr(190, 468, 580, 22, 8); ctx.fill();
  ctx.fillStyle = '#e0aa70'; rr(190, 380, 580, 98, 18); ctx.fill();
  ctx.strokeStyle = '#b07a40'; ctx.lineWidth = 4; ctx.stroke();
  ctx.strokeStyle = 'rgba(150,95,45,0.45)'; ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(215, 398 + i * 20); ctx.bezierCurveTo(400, 392 + i * 20, 600, 406 + i * 20, 745, 398 + i * 20); ctx.stroke(); }
  if (t < 2.0) {
    const sh = t > 1.0 ? Math.sin(t * 90) * 3 : Math.sin(t * 20) * 0.8;
    drawPig(480 + sh, BY, -1, L.C, { scale: 1.3, scared: true, t: t * 60 });
    for (let i = 0; i < 3; i++) {
      const k = (t * 1.5 + i / 3) % 1;
      ctx.fillStyle = `rgba(110,180,255,${1 - k})`; ell(395 + i * 30, 290 + k * 45, 4, 6); ctx.fill();
    }
    if (t > 0.3 && t < 1.0) bubble(330, 220, '꿀...?');
    else if (t >= 1.0) bubble(330, 220, '꾸에에엑!!', 30);
  } else {
    const sx = 340, w5 = 56, sh = 80, sy = BY - sh;
    const groups = [[0]];
    for (let j = 1; j < 5; j++) { if (t >= 2.5 + (j - 1) * 0.25) groups.push([j]); else groups[groups.length - 1].push(j); }
    const center = 12 * (groups.length - 1) / 2;
    groups.forEach((gp, gi) => drawStrip(sx + gp[0] * w5 + gi * 12 - center, sy, w5 * gp.length, sh, 0, 0));
    ctx.strokeStyle = L.C.band; ctx.lineWidth = 6;
    ell(690, 458, 26, 6); ctx.stroke(); line(664, 458, 640, 468); line(664, 458, 642, 452);
    if (t > 2.2) {
      const k = t - 2.2, gy = BY - 100 - k * 70;
      ctx.save(); ctx.globalAlpha = clamp(0.8 - k * 0.2);
      drawPig(480, gy, -1, GHOST, { scale: 0.55, t: t * 60, victory: true });
      drawHalo(480 - 36 * 0.55, gy - 90 * 0.55 - 26);
      ctx.restore();
    }
  }
  if (t > 0.9 && t < 3.7) { const k = knifeTip(t); drawCleaver(k.x, k.y, t > 1.25 && t < 1.7); }
}
function drawTable() {
  ctx.fillStyle = '#3b2416'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3;
  for (let y = 0; y < H; y += 70) line(0, y, W, y);
  const leaf = (x, y, r, rot) => {
    ctx.fillStyle = '#7cb342'; ell(x, y, r, r * 0.7, rot); ctx.fill();
    ctx.fillStyle = '#9ccc65'; ell(x, y, r * 0.75, r * 0.5, rot); ctx.fill();
    ctx.strokeStyle = '#558b2f'; ctx.lineWidth = 2; line(x - Math.cos(rot) * r * 0.8, y - Math.sin(rot) * r * 0.8, x + Math.cos(rot) * r * 0.8, y + Math.sin(rot) * r * 0.8);
  };
  leaf(110, 140, 60, 0.4); leaf(130, 175, 55, -0.3); leaf(95, 200, 50, 0.9);
  ctx.fillStyle = '#eee'; ell(110, 400, 60, 60); ctx.fill();
  ctx.fillStyle = '#fff8e1'; for (let i = 0; i < 7; i++) { ell(110 + Math.cos(i) * 28, 400 + Math.sin(i * 1.7) * 26, 10, 7, i); ctx.fill(); }
  txt('마늘', 110, 470, 16, '#ddd', null);
  ctx.fillStyle = '#eee'; ell(850, 150, 50, 50); ctx.fill();
  ctx.fillStyle = '#8d4f2a'; ell(850, 150, 36, 36); ctx.fill();
  txt('쌈장', 850, 215, 16, '#ddd', null);
  ctx.fillStyle = '#eee'; ell(850, 400, 60, 60); ctx.fill();
  for (let i = 0; i < 9; i++) { ctx.fillStyle = i % 2 ? '#e64a19' : '#ff7043'; ell(850 + Math.cos(i * 2.3) * 25, 400 + Math.sin(i * 1.9) * 25, 16, 9, i); ctx.fill(); }
  txt('김치', 850, 475, 16, '#ddd', null);
}
function drawGrill(g) {
  const cx = 480, cy = 295, R = 230;
  ctx.fillStyle = '#8d8d8d'; ell(cx, cy, R + 14, R + 14); ctx.fill();
  const rg = ctx.createRadialGradient(cx - 60, cy - 60, 20, cx, cy, R);
  rg.addColorStop(0, '#4a4a4a'); rg.addColorStop(1, '#151515');
  ctx.fillStyle = rg; ell(cx, cy, R, R); ctx.fill();
  ctx.save(); ell(cx, cy, R, R); ctx.clip();
  for (let y = cy - R; y < cy + R; y += 22) {
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 4; line(cx - R, y, cx + R, y);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 2; line(cx - R, y + 4, cx + R, y + 4);
  }
  ctx.restore();
  for (let i = 0; i < 5; i++) {
    const land = 0.5 + i * 0.18;
    if (g < land - 0.3) continue;
    const y = lerp(-80, stripY(i), ease((g - (land - 0.3)) / 0.3));
    const cook = clamp((g - land) / 4.2);
    const fi = 3.0 + i * 0.1, fp = clamp((g - fi) / 0.35);
    const sy = Math.abs(Math.cos(fp * Math.PI)), lift = Math.sin(fp * Math.PI) * 30;
    const shown = fp < 0.5 ? cook * 0.45 : Math.min(1, cook * 1.1), marks = fp >= 0.5 ? 1 : 0;
    const pieces = g >= 4.4 + i * 0.12 ? 4 : 1;
    ctx.save(); ctx.translate(cx, y + 21 - lift); ctx.scale(1, Math.max(0.05, sy));
    if (pieces === 1) drawStrip(-165, -21, 330, 42, shown, marks);
    else for (let q = 0; q < 4; q++) drawStrip(-165 - 9 + q * 88.5, -21, 82.5, 42, shown, marks);
    ctx.restore();
    if (fp > 0 && fp < 1) {
      ctx.strokeStyle = '#cfd8dc'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      line(cx + 130, y - lift + 10, cx + 330, y - 120); line(cx + 140, y - lift + 25, cx + 335, y - 110);
    }
  }
  if (g > 4.25 && g < 5.2) {
    const sy = lerp(110, 470, clamp((g - 4.3) / 0.8)), a = 0.35 * Math.abs(Math.sin(g * 30));
    ctx.save(); ctx.translate(cx - 1, sy); ctx.rotate(Math.PI / 2);
    for (const s of [-1, 1]) {
      ctx.save(); ctx.rotate(s * a);
      ctx.strokeStyle = '#cfd8dc'; ctx.lineWidth = 6; line(-30, 0, 70, 0);
      ctx.strokeStyle = '#e53935'; ctx.lineWidth = 6; ell(-50, s * 8, 16, 11); ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = '#555'; ell(0, 0, 4, 4); ctx.fill();
    ctx.restore();
  }
}

// ---- 요리별 조리 장면 ----
const mixA = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
function drawCutlet(x, y, cook, sliced, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.fillStyle = mixC([240, 222, 180], [214, 137, 28], cook); ctx.strokeStyle = mixC([200, 180, 140], [150, 80, 10], cook); ctx.lineWidth = 3;
  ell(0, 0, 85, 48, -0.1); ctx.fill(); ctx.stroke();
  ctx.fillStyle = mixC([250, 235, 200], [240, 170, 60], cook);
  for (let j = 0; j < 26; j++) { ell(Math.cos(j * 2.1) * 70 * ((j % 5) / 5 + 0.2), Math.sin(j * 1.7) * 38 * ((j % 4) / 4 + 0.2), 3, 2); ctx.fill(); }
  if (sliced) {
    ctx.strokeStyle = 'rgba(90,40,10,0.8)'; ctx.lineWidth = 3;
    for (const s of [-45, -15, 15, 45]) line(s, -46, s - 6, 46);
    ctx.strokeStyle = '#5d2a12'; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath();
    for (let j = 0; j <= 8; j++) ctx.lineTo(-70 + j * 17.5, -10 + (j % 2 ? 14 : -14));
    ctx.stroke();
  }
  ctx.restore();
}
function drawChunk(x, y, rot, cook, sauce) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = mixC(mixA(RAW.meat, COOK.meat, cook), [165, 40, 27], sauce); rr(-14, -8, 28, 16, 5); ctx.fill();
  ctx.fillStyle = mixC(mixA(RAW.fat, COOK.fat, cook), [214, 90, 50], sauce); ctx.fillRect(-14, -3, 28, 4);
  ctx.restore();
}
// 족발·보쌈 썬 고기를 부채꼴로
function drawSliceFan(cx, cy, n, sc, skin, inner, shown = n) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
  for (let j = 0; j < Math.min(n, shown); j++) {
    ctx.save(); ctx.rotate(-0.7 + j * (1.4 / Math.max(1, n - 1)));
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; rr(-13, -147, 32, 112, 10); ctx.fill();   // 그림자
    ctx.fillStyle = skin; rr(-16, -150, 32, 112, 10); ctx.fill(); ctx.strokeStyle = shadeHex(skin, 0.6); ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = inner; rr(-12, -144, 24, 98, 8); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-12, -120, 24, 6);
    ctx.restore();
  }
  ctx.restore();
}
function drawKimchi(x, y, sc = 1) {
  for (let i = 0; i < 9; i++) { ctx.fillStyle = i % 2 ? '#e64a19' : '#ff7043'; ell(x + Math.cos(i * 2.3) * 24 * sc, y + Math.sin(i * 1.9) * 14 * sc, 14 * sc, 8 * sc, i); ctx.fill(); }
}
function drawFry(g) {
  const cx = 480, cy = 300;
  ctx.fillStyle = '#455a64'; ell(cx, cy + 20, 285, 172); ctx.fill();
  ctx.fillStyle = '#263238'; ell(cx, cy, 265, 152); ctx.fill();
  const og = ctx.createRadialGradient(cx, cy - 30, 20, cx, cy, 250);
  og.addColorStop(0, '#ffca28'); og.addColorStop(1, '#e65100');
  ctx.fillStyle = og; ell(cx, cy, 248, 140); ctx.fill();
  for (let i = 0; i < 40; i++) {
    const a = i * 2.39, r = 40 + ((i * 53) % 200), ph = (g * 3 + i * 0.37) % 1;
    ctx.strokeStyle = `rgba(255,249,196,${0.8 * (1 - ph)})`; ctx.lineWidth = 2;
    ell(cx + Math.cos(a) * r * 0.95, cy + Math.sin(a) * r * 0.5, 2 + ph * 6, 2 + ph * 6); ctx.stroke();
  }
  for (let i = 0; i < 3; i++) {
    const land = 0.5 + i * 0.2;
    if (g < land - 0.3) continue;
    const lift = g > 3 ? ease((g - 3) / 0.4) * 50 : 0;
    const y = lerp(-80, cy - 10 + (i % 2) * 24, ease((g - (land - 0.3)) / 0.3)) - lift;
    drawCutlet(cx - 150 + i * 150, y, clamp((g - land) / 2.6), g > 4.4 + i * 0.12, 0.85);
  }
}
function drawWok(g) {
  const cx = 480, cy = 320;
  for (let i = 0; i < 9; i++) {
    const h = 50 + Math.sin(g * 20 + i * 1.3) * 18, x = cx - 200 + i * 50;
    ctx.fillStyle = i % 2 ? '#ff9800' : '#ff5722'; poly([[x - 22, 480], [x, 480 - h], [x + 22, 480]]); ctx.fill();
    ctx.fillStyle = '#ffeb3b'; poly([[x - 10, 480], [x, 480 - h * 0.5], [x + 10, 480]]); ctx.fill();
  }
  ctx.fillStyle = '#5d4037'; rr(cx + 270, cy - 12, 160, 24, 10); ctx.fill();
  ctx.fillStyle = '#212121'; ctx.beginPath(); ctx.ellipse(cx, cy, 280, 140, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#383838'; ell(cx, cy, 276, 40); ctx.fill();
  ctx.strokeStyle = '#616161'; ctx.lineWidth = 8; ell(cx, cy, 280, 42); ctx.stroke();
  const cook = clamp((g - 0.5) / 2.5), sauce = clamp((g - 3.0) / 0.6);
  const ph = (g * 0.9) % 1, tossing = g > 1 && ph < 0.35;
  if (tossing && ph < 0.12) { ctx.fillStyle = 'rgba(255,152,0,0.35)'; ell(cx, cy - 80, 220, 90); ctx.fill(); }
  for (let i = 0; i < 18; i++) {
    const bx = cx + Math.sin(i * 1.7) * 200 * ((i % 4) / 4 * 0.5 + 0.5), by = cy + Math.cos(i * 2.3) * 14;
    const drop = ease((g - i * 0.03) / 0.5);
    let y = lerp(-50, by, drop);
    if (tossing) y -= Math.sin(ph / 0.35 * Math.PI) * (80 + (i % 5) * 20);
    drawChunk(bx, y, i + (tossing ? g * 6 : 0), cook, sauce);
  }
  if (sauce > 0) for (let i = 0; i < 10; i++) { ctx.fillStyle = '#7cb342'; ctx.fillRect(cx - 180 + i * 38, cy - 6 + Math.sin(i) * 10 - (tossing ? Math.sin(ph / 0.35 * Math.PI) * 60 : 0), 14, 5); }
  if (g > 3.0 && g < 3.6) { ctx.strokeStyle = '#c62828'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(cx - 120, 60); ctx.quadraticCurveTo(cx - 60, 180, cx - 40, cy); ctx.stroke(); }
}
function drawPot(g, braise) {
  const cx = 480, cy = 300, liq = braise ? '#3e2723' : '#b3e5fc';
  if (g < 3.6) {
    ctx.fillStyle = '#78909c'; rr(cx - 235, cy - 70, 470, 230, 30); ctx.fill();
    ctx.fillStyle = '#546e7a'; rr(cx - 270, cy - 40, 40, 24, 8); ctx.fill(); rr(cx + 230, cy - 40, 40, 24, 8); ctx.fill();
    ctx.fillStyle = '#90a4ae'; ell(cx, cy - 70, 235, 62); ctx.fill();
    ctx.fillStyle = liq; ell(cx, cy - 66, 220, 54); ctx.fill();
    for (let i = 0; i < 24; i++) {
      const a = i * 2.39, r = 30 + ((i * 53) % 180), ph = (g * 2 + i * 0.37) % 1;
      ctx.strokeStyle = `rgba(255,255,255,${0.6 * (1 - ph)})`; ctx.lineWidth = 2;
      ell(cx + Math.cos(a) * r, cy - 66 + Math.sin(a) * r * 0.25, 2 + ph * 6, 1 + ph * 3); ctx.stroke();
    }
    if (braise) for (let i = 0; i < 4; i++) {
      ctx.save(); ctx.translate(cx - 150 + i * 100, cy - 60 + Math.sin(g * 2 + i) * 6); ctx.rotate(g + i);
      ctx.fillStyle = '#6d4c41'; poly([...Array(16)].map((_, j) => [Math.cos(j * Math.PI / 8) * (j % 2 ? 4 : 12), Math.sin(j * Math.PI / 8) * (j % 2 ? 4 : 12)])); ctx.fill();
      ctx.restore();
    }
    const drop = ease((g - 0.2) / 0.4), lift = g > 3 ? ease((g - 3) / 0.5) * 140 : 0;
    const x = cx + Math.sin(g * 1.3) * 30, y = lerp(-80, cy - 70, drop) + Math.sin(g * 3) * 6 - lift;
    const cook = clamp((g - 0.6) / 2.4);
    ctx.fillStyle = braise ? mixC(RAW.meat, [78, 35, 16], cook) : mixC(RAW.meat, [236, 217, 204], cook);
    rr(x - 80, y - 40, 160, 80, 30); ctx.fill();
    if (braise) { ctx.fillStyle = mixC(RAW.skin, [60, 25, 10], cook); ell(x + 70, y + 20, 26, 30); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ell(x - 30, y - 22, 40, 8); ctx.fill();
    if (lift < 40) { ctx.fillStyle = liq; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.ellipse(cx, cy - 66, 220, 54, 0, 0, Math.PI); ctx.fill(); ctx.globalAlpha = 1; }
  } else {
    ctx.fillStyle = '#d7a86e'; rr(cx - 260, cy - 40, 520, 240, 24); ctx.fill();
    ctx.strokeStyle = '#a1764a'; ctx.lineWidth = 4; ctx.stroke();
    const shown = g < 4.2 ? 0 : Math.floor((g - 4.2) / 0.08) + 1;
    const skin = braise ? '#4e2310' : '#d9b8a0', inner = braise ? '#8d5a3a' : '#f3e3d8';
    if (shown === 0) { ctx.fillStyle = braise ? '#4e2310' : '#ecd9cc'; rr(cx - 80, cy + 40, 160, 80, 30); ctx.fill(); }
    else drawSliceFan(cx, cy + 170, 8, 1, skin, inner, shown);
    if (!braise && g > 4.7) drawKimchi(cx + 190, cy + 60, 1.2);
  }
}
// ================= 요리 장면도 요리마다 다르게 =================
// 조리법(굽기·튀기기·볶기·끓이기) 흐름은 같고, 올라가는 재료·곁들임·마무리 동작이 요리마다 다름.
// 삼겹살 구이·돈까스·제육볶음·족발·보쌈은 원래 장면 그대로(이미 그 요리에 맞음).
const hx2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function lerpHex(a, b, k) { const A = hx2rgb(a), B = hx2rgb(b); k = clamp(k); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); }
const DISH_CAP = {
  '삼겹살 구이': '두툼한 삼겹을 노릇노릇~ 가위로 싹둑!', '목살 스테이크': '큼직한 목살 한 덩이, 겉바속촉으로!', '등심 구이': '담백한 등심을 버섯이랑 같이 구워요',
  '돼지갈비': '양념 발라 가며 뼈째 굽는 갈비!', '항정살 구이': '얇은 항정살을 센 불에 후다닥, 소금 톡톡', '돈까스': '빵가루 입혀 바삭하게!',
  '삼겹 튀김': '길쭉하게 썬 삼겹을 바삭바삭', '목살 탕수육': '튀긴 목살에 새콤달콤 소스 촤악!', '앞다리 돈까스': '왕 돈까스 한 장 통째로!',
  '족발 튀김': '족발을 튀겨서 겉바속촉', '갈비 튀김': '뼈 붙은 갈비를 통째로 튀김', '제육볶음': '고추장 양념에 불맛 가득 웍질!',
  '불족발 볶음': '매운 양념에 족발을 달달 볶아요', '항정 볶음': '간장 양념에 숙주랑 휘리릭', '족발': '한약재 넣고 뭉근하게 졸여요',
  '등심 장조림': '간장에 메추리알이랑 졸졸 졸여요', '갈비찜': '당근·밤 넣고 푹 쪄 낸 갈비', '보쌈': '푹 삶아서 김치랑 쌈 싸 먹기',
  '수육': '부들부들 삶아서 새우젓 콕', '항정 수육': '얇게 돌돌 말아 겨자에 콕'
};
function grillPan() {
  const cx = 480, cy = 295, R = 230;
  ctx.fillStyle = '#8d8d8d'; ell(cx, cy, R + 14, R + 14); ctx.fill();
  const rg = ctx.createRadialGradient(cx - 60, cy - 60, 20, cx, cy, R); rg.addColorStop(0, '#4a4a4a'); rg.addColorStop(1, '#151515');
  ctx.fillStyle = rg; ell(cx, cy, R, R); ctx.fill();
  ctx.save(); ell(cx, cy, R, R); ctx.clip();
  for (let y = cy - R; y < cy + R; y += 22) { ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 4; line(cx - R, y, cx + R, y); ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 2; line(cx - R, y + 4, cx + R, y + 4); }
  ctx.restore();
}
const GRILL_STYLE = {
  '목살 스테이크': { items: [{ x: 0, y: 290, w: 320, h: 130, raw: '#e9888f', done: '#9c4e26', opt: { marble: true } }], knife: true, herb: true },
  '등심 구이': { items: [[-115, 225], [115, 225], [-115, 335], [115, 335]].map(([x, y]) => ({ x, y, w: 190, h: 82, raw: '#ec9a9a', done: '#b9734a', opt: { rim: '#f3d9a8' } })), mush: true },
  '돼지갈비': { items: [205, 290, 375].map(y => ({ x: 25, y, w: 290, h: 58, raw: '#e07a80', done: '#7b3214', opt: {}, bone: true })), glaze: true },
  '항정살 구이': { items: [...Array(8)].map((_, i) => ({ x: -195 + (i % 4) * 130, y: i < 4 ? 240 : 345, w: 112, h: 50, raw: '#f6c9c4', done: '#d8a07a', opt: {} })), salt: true },
};
function drawGrillDish(g, st) {
  const cx = 480; grillPan();
  st.items.forEach((it, i) => {
    const land = 0.5 + i * 0.12; if (g < land - 0.3) return;
    const y = lerp(-80, it.y, ease((g - (land - 0.3)) / 0.3)), cook = clamp((g - land) / 3.6);
    const fp = clamp((g - (2.6 + i * 0.1)) / 0.35), sy = Math.abs(Math.cos(fp * Math.PI)), lift = Math.sin(fp * Math.PI) * 30;
    const shown = fp < 0.5 ? cook * 0.45 : Math.min(1, cook * 1.1);
    let col = lerpHex(it.raw, it.done, shown);
    const glazed = st.glaze && g > 3.4; if (glazed) col = lerpHex(col, '#5a1e08', clamp((g - 3.4) / 0.8) * 0.6);
    ctx.save(); ctx.translate(cx + it.x, y - lift); ctx.scale(1, Math.max(0.05, sy));
    if (it.bone) boneStick(-it.w / 2 - 30, 0, -it.w / 2 + 6, 0, 13);
    slab(0, 0, it.w, it.h, 0, col, { ...it.opt, marks: fp >= 0.5, gloss: glazed });
    ctx.restore();
  });
  if (st.mush && g > 1.2) for (const [mx, my] of [[-230, 280], [230, 280], [0, 175], [0, 400]]) { ctx.fillStyle = lerpHex('#bcaaa4', '#6d4c41', clamp((g - 1.2) / 3)); ell(cx + mx, my, 26, 18); ctx.fill(); ctx.fillStyle = '#efebe9'; ctx.fillRect(cx + mx - 6, my, 12, 18); }
  if (st.glaze && g > 3.2 && g < 4.6) {   // 양념 붓으로 바르기
    const k = (g - 3.2) / 1.4, by = 200 + (k * 3 % 1) * 180, bx = cx - 100 + Math.sin(g * 10) * 120;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(-0.5); ctx.fillStyle = '#8d6e63'; ctx.fillRect(0, -6, 110, 12); ctx.fillStyle = '#5a1e08'; rr(-30, -12, 34, 24, 8); ctx.fill(); ctx.restore();
  }
  if (st.salt && g > 3.9) for (let i = 0; i < 40; i++) { const k = ((g - 3.9) * 1.5 + i * 0.07) % 1; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ell(cx - 200 + (i * 37) % 400, 120 + k * 260, 2, 2); ctx.fill(); }
  if (st.herb && g > 3.6) { ctx.strokeStyle = '#558b2f'; ctx.lineWidth = 4; line(cx + 60, 250, cx + 150, 210); for (let i = 0; i < 8; i++) { ctx.fillStyle = '#689f38'; ell(cx + 70 + i * 10, 244 - i * 4.5, 8, 3, -0.4); ctx.fill(); } }
  if (st.knife && g > 4.3) {   // 칼로 비스듬히 썰기
    const n = Math.min(6, Math.floor((g - 4.3) / 0.12)); ctx.strokeStyle = 'rgba(60,20,5,0.9)'; ctx.lineWidth = 4;
    for (let i = 0; i < n; i++) line(cx - 120 + i * 48, 230, cx - 140 + i * 48, 350);
    if (n < 6) { const kx = cx - 120 + n * 48; ctx.fillStyle = '#cfd8dc'; poly([[kx, 140], [kx + 14, 140], [kx, 300]]); ctx.fill(); ctx.fillStyle = '#4e342e'; ctx.fillRect(kx - 4, 90, 20, 50); }
  }
}
function fryPot(g) {
  const cx = 480, cy = 300;
  ctx.fillStyle = '#455a64'; ell(cx, cy + 20, 285, 172); ctx.fill();
  ctx.fillStyle = '#263238'; ell(cx, cy, 265, 152); ctx.fill();
  const og = ctx.createRadialGradient(cx, cy - 30, 20, cx, cy, 250); og.addColorStop(0, '#ffca28'); og.addColorStop(1, '#e65100');
  ctx.fillStyle = og; ell(cx, cy, 248, 140); ctx.fill();
  for (let i = 0; i < 40; i++) {
    const a = i * 2.39, r = 40 + ((i * 53) % 200), ph = (g * 3 + i * 0.37) % 1;
    ctx.strokeStyle = 'rgba(255,249,196,' + (0.8 * (1 - ph)) + ')'; ctx.lineWidth = 2;
    ell(cx + Math.cos(a) * r * 0.95, cy + Math.sin(a) * r * 0.5, 2 + ph * 6, 2 + ph * 6); ctx.stroke();
  }
}
const FRY_STYLE = {
  '삼겹 튀김': { n: 6, at: i => [-250 + i * 100, 285 + (i % 2) * 24], draw: (x, y, k) => slab(x, y, 42, 120, 0.3, lerpHex('#f1e3c4', DC.golden, k), { crumb: k > 0.3, gloss: k > 0.7 }) },
  '목살 탕수육': { n: 10, at: i => [-200 + (i % 5) * 100, 250 + (i < 5 ? 0 : 70)], draw: (x, y, k) => blob(x, y, 38, 28, 0.2, lerpHex('#f3e2bf', DC.golden, k), DC.goldenHi), sauce: '#ff7043' },
  '앞다리 돈까스': { n: 1, at: () => [0, 290], draw: (x, y, k) => { ctx.save(); ctx.translate(x, y); ctx.scale(1.9, 1.7); drawCutlet(0, 0, k, false, 1); ctx.restore(); }, ketchup: true },
  '족발 튀김': { n: 4, at: i => [-210 + i * 140, 290 + (i % 2) * 30], draw: (x, y, k) => { blob(x, y, 52, 42, 0, lerpHex('#ead2b0', DC.golden, k), DC.goldenHi); boneStick(x + 26, y - 26, x + 56, y - 66, 12); } },
  '갈비 튀김': { n: 4, at: i => [-40, 215 + i * 58], draw: (x, y, k) => { slab(x, y, 260, 40, 0.04, lerpHex('#efd9b0', DC.golden, k), { crumb: k > 0.3, gloss: k > 0.7 }); boneStick(x + 130, y, x + 180, y, 12); } },
};
function drawFryDish(g, st) {
  const cx = 480; fryPot(g);
  for (let i = 0; i < st.n; i++) {
    const land = 0.5 + i * 0.12; if (g < land - 0.3) continue;
    const [px, py] = st.at(i), lift = g > 3 ? ease((g - 3) / 0.4) * 50 : 0;
    st.draw(cx + px, lerp(-80, py, ease((g - (land - 0.3)) / 0.3)) - lift, clamp((g - land) / 2.4), i);
  }
  if (st.sauce && g > 3.8) {   // 소스 붓기
    const k = clamp((g - 3.8) / 0.8); ctx.strokeStyle = st.sauce; ctx.lineWidth = 14; ctx.lineCap = 'round';
    if (k < 1) { ctx.beginPath(); ctx.moveTo(cx + 260, 60); ctx.quadraticCurveTo(cx + 180, 150, cx + 120, 240); ctx.stroke(); }
    drizzle([...Array(9)].map((_, j) => [cx - 220 + j * 55 * k, 230 + (j % 2 ? 60 : 0)]), 'rgba(255,112,67,0.9)', 12);
  }
  if (st.ketchup && g > 4.1) { const k = clamp((g - 4.1) / 0.6); drizzle([...Array(9)].map((_, j) => [cx - 160 + j * 40 * k, 270 + (j % 2 ? 36 : -10)]), '#c62828', 10); }
}
const WOK_STYLE = {
  '불족발 볶음': { n: 12, piece: (x, y, r, k, s) => slab(x, y, 46, 32, r, lerpHex(lerpHex('#e7b8a0', '#6d3a1f', k), '#b3281b', s), { rim: '#3e1a0a', gloss: s > 0.5 }), veg: ['#d32f2f', '#43a047'], pour: '#c62828' },
  '항정 볶음': { n: 14, piece: (x, y, r, k, s) => slab(x, y, 52, 18, r, lerpHex(lerpHex('#f6c9c4', '#d8a07a', k), '#8a5530', s), { gloss: s > 0.5 }), veg: ['#fff9c4', '#f0f4c3'], pour: '#4e2c12', sprout: true },
};
function drawWokDish(g, st) {
  const cx = 480, cy = 320;
  for (let i = 0; i < 9; i++) {
    const h = 50 + Math.sin(g * 20 + i * 1.3) * 18, x = cx - 200 + i * 50;
    ctx.fillStyle = i % 2 ? '#ff9800' : '#ff5722'; poly([[x - 22, 480], [x, 480 - h], [x + 22, 480]]); ctx.fill();
    ctx.fillStyle = '#ffeb3b'; poly([[x - 10, 480], [x, 480 - h * 0.5], [x + 10, 480]]); ctx.fill();
  }
  ctx.fillStyle = '#5d4037'; rr(cx + 270, cy - 12, 160, 24, 10); ctx.fill();
  ctx.fillStyle = '#212121'; ctx.beginPath(); ctx.ellipse(cx, cy, 280, 140, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#383838'; ell(cx, cy, 276, 40); ctx.fill();
  ctx.strokeStyle = '#616161'; ctx.lineWidth = 8; ell(cx, cy, 280, 42); ctx.stroke();
  const cook = clamp((g - 0.5) / 2.5), sauce = clamp((g - 3.0) / 0.6), ph = (g * 0.9) % 1, tossing = g > 1 && ph < 0.35;
  const up = i => tossing ? Math.sin(ph / 0.35 * Math.PI) * (80 + (i % 5) * 20) : 0;
  for (let i = 0; i < st.n; i++) {
    const bx = cx + Math.sin(i * 1.7) * 200 * ((i % 4) / 4 * 0.5 + 0.5), by = cy + Math.cos(i * 2.3) * 14;
    st.piece(bx, lerp(-50, by, ease((g - i * 0.03) / 0.5)) - up(i), i + (tossing ? g * 6 : 0), cook, sauce);
  }
  if (g > 2.2) for (let i = 0; i < 12; i++) {   // 채소(고추 / 숙주)
    ctx.save(); ctx.translate(cx - 200 + i * 36, cy - 8 + Math.sin(i * 2) * 10 - up(i) * 0.7); ctx.rotate(i + (tossing ? g * 5 : 0));
    ctx.fillStyle = st.veg[i % 2];
    if (st.sprout) { ctx.fillRect(-14, -2, 28, 4); ctx.fillStyle = '#fbc02d'; ell(14, 0, 4, 3); ctx.fill(); } else { rr(-9, -4, 18, 8, 4); ctx.fill(); }
    ctx.restore();
  }
  if (g > 3.0 && g < 3.6) { ctx.strokeStyle = st.pour; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(cx - 120, 60); ctx.quadraticCurveTo(cx - 60, 180, cx - 40, cy); ctx.stroke(); }
}
const POT_STYLE = {
  '등심 장조림': { liq: '#4e2c12', items: (g, cx, y, k) => { for (let i = 0; i < 8; i++) slab(cx - 150 + i * 42, y + Math.sin(g * 3 + i) * 5, 30, 22, i, lerpHex('#e98c8c', '#6d3a1a', k)); for (let i = 0; i < 3; i++) { ctx.fillStyle = lerpHex('#ffffff', '#7a4a22', k); ell(cx - 90 + i * 90, y - 20 + Math.sin(g * 2 + i) * 4, 22, 17); ctx.fill(); } } },
  '갈비찜': { liq: '#4a2410', items: (g, cx, y, k) => {
    for (let i = 0; i < 5; i++) { const x = cx - 160 + i * 80, yy = y + Math.sin(g * 3 + i) * 5; blob(x, yy, 30, 24, i, lerpHex('#e07a80', '#5d2810', k), lerpHex('#f0a0a0', '#8a4a24', k)); boneStick(x - 6, yy - 18, x + 8, yy - 40, 8); }
    ctx.fillStyle = '#ef6c00'; ell(cx - 120, y - 30, 18, 12); ctx.fill(); ell(cx + 140, y - 26, 16, 11); ctx.fill(); ctx.fillStyle = '#ffe0b2'; ell(cx + 40, y - 34, 15, 13); ctx.fill();
  } },
  '수육': { liq: '#b3e5fc', items: (g, cx, y, k) => { slab(cx, y, 220, 90, 0, lerpHex('#f2a0a8', '#ecd9cc', k), { rim: lerpHex('#f6d0c8', '#c99a7c', k) }); ctx.strokeStyle = '#7cb342'; ctx.lineWidth = 8; line(cx - 160, y - 50, cx - 60, y - 30); line(cx + 70, y - 40, cx + 170, y - 56); } },
  '항정 수육': { liq: '#b3e5fc', items: (g, cx, y, k) => { for (let i = 0; i < 3; i++) slab(cx - 120 + i * 120, y + Math.sin(g * 2 + i) * 6, 100, 40, 0.1 * (i - 1), lerpHex('#f6c9c4', '#f3e3d8', k)); } },
};
function drawPotDish(g, st, name) {
  const cx = 480, cy = 300;
  if (g < 3.6) {
    ctx.fillStyle = '#78909c'; rr(cx - 235, cy - 70, 470, 230, 30); ctx.fill();
    ctx.fillStyle = '#546e7a'; rr(cx - 270, cy - 40, 40, 24, 8); ctx.fill(); rr(cx + 230, cy - 40, 40, 24, 8); ctx.fill();
    ctx.fillStyle = '#90a4ae'; ell(cx, cy - 70, 235, 62); ctx.fill();
    ctx.fillStyle = st.liq; ell(cx, cy - 66, 220, 54); ctx.fill();
    for (let i = 0; i < 24; i++) {
      const a = i * 2.39, r = 30 + ((i * 53) % 180), ph = (g * 2 + i * 0.37) % 1;
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.6 * (1 - ph)) + ')'; ctx.lineWidth = 2; ell(cx + Math.cos(a) * r, cy - 66 + Math.sin(a) * r * 0.25, 2 + ph * 6, 1 + ph * 3); ctx.stroke();
    }
    const drop = ease((g - 0.2) / 0.4), lift = g > 3 ? ease((g - 3) / 0.5) * 140 : 0;
    st.items(g, cx, lerp(-80, cy - 70, drop) - lift, clamp((g - 0.6) / 2.4));
    if (lift < 40) { ctx.fillStyle = st.liq; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.ellipse(cx, cy - 66, 220, 54, 0, 0, Math.PI); ctx.fill(); ctx.globalAlpha = 1; }
  } else {   // 도마 위에 완성된 요리를 크게 (요리마다 다른 그림)
    ctx.fillStyle = '#d7a86e'; rr(cx - 260, cy - 40, 520, 240, 24); ctx.fill(); ctx.strokeStyle = '#a1764a'; ctx.lineWidth = 4; ctx.stroke();
    const k = ease(clamp((g - 3.7) / 0.5));
    drawDishArt(name, '', cx, cy + 80, 1.6 + 0.6 * k);
  }
}
function drawCook(g) {
  drawTable();
  const m = cut.dish.method, nm = cut.dish.name;   // 요리마다 다른 장면이 있으면 그것, 없으면 조리법 기본 장면
  if (m === 'grill') GRILL_STYLE[nm] ? drawGrillDish(g, GRILL_STYLE[nm]) : drawGrill(g);
  else if (m === 'fry') FRY_STYLE[nm] ? drawFryDish(g, FRY_STYLE[nm]) : drawFry(g);
  else if (m === 'wok') WOK_STYLE[nm] ? drawWokDish(g, WOK_STYLE[nm]) : drawWok(g);
  else POT_STYLE[nm] ? drawPotDish(g, POT_STYLE[nm], nm) : drawPot(g, m === 'braise');
  if (g > 0.6 && g < 5.2) {
    ctx.save(); ctx.translate(480, 75); ctx.rotate(Math.sin(g * 8) * 0.05);
    txt(cut.dish.sfx, 0, 0, 44 + Math.sin(g * 20) * 3, '#ffb74d', '#4e2600', 8);
    ctx.restore();
  }
}
function drawDishPlate(cx, cy) {
  drawDishArt(cut.dish.name, cut.dish.method, cx, cy - 6, 1.15);   // 요리마다 다른 그림
}
function drawFinal(f) {
  const Wn = cut.w, L = cut.l, gr = cut.grade;
  const bg = ctx.createRadialGradient(W / 2, H * 0.55, 30, W / 2, H * 0.55, 600);
  bg.addColorStop(0, '#fff3e0'); bg.addColorStop(1, '#ff8a65');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(W / 2, H * 0.55); ctx.rotate(f * 0.2);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); poly([[0, 0], [700, -60], [700, 60]]); ctx.fill(); }
  ctx.restore();
  ctx.fillStyle = '#6d4c41'; ctx.fillRect(0, 420, W, 120);
  ctx.fillStyle = '#8d6e63'; ctx.fillRect(0, 420, W, 10);
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ell(600, 432, 175, 42); ctx.fill();
  ctx.fillStyle = '#fafafa'; ell(600, 422, 170, 42); ctx.fill();
  ctx.fillStyle = '#7cb342'; ell(490, 410, 50, 18, -0.2); ctx.fill();
  drawDishPlate(600, 410);
  ctx.fillStyle = 'rgba(46,125,50,0.9)'; rr(800, 300, 60, 125, 14); ctx.fill(); rr(818, 252, 24, 60, 6); ctx.fill();
  ctx.fillStyle = '#43a047'; rr(816, 244, 28, 14, 4); ctx.fill();
  ctx.fillStyle = '#e8f5e9'; rr(806, 342, 48, 48, 6); ctx.fill();
  txt('꿀꿀', 830, 358, 14, '#1b5e20', null); txt('이슬', 830, 376, 14, '#1b5e20', null);
  ctx.fillStyle = 'rgba(220,240,255,0.8)'; poly([[748, 395], [778, 395], [774, 425], [752, 425]]); ctx.fill();
  drawPig(230, 452, 1, Wn.C, { scale: 1.5, victory: true, t: f * 60 });
  const crx = 230 + 36 * (Wn.C.bw || 1) * 1.5, cry = 452 - 90 * 1.5 - 50 + Math.sin(f * 60 * 0.07) * 3;
  ctx.fillStyle = '#ffd700'; ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 3;
  poly([[crx - 26, cry + 12], [crx - 28, cry - 14], [crx - 12, cry], [crx, cry - 20], [crx + 12, cry], [crx + 28, cry - 14], [crx + 26, cry + 12]]); ctx.fill(); ctx.stroke();
  const gx = 470 + Math.sin(f) * 25, gy = 300 + Math.sin(f * 2) * 10;
  ctx.save(); ctx.globalAlpha = 0.6;
  drawPig(gx, gy, -1, GHOST, { scale: 0.6, victory: true, t: f * 60 });
  drawHalo(gx - 36 * 0.6, gy - 90 * 0.6 - 26);
  ctx.restore();
  const k = ease(f / 0.4);
  ctx.save(); ctx.translate(W / 2, 70); ctx.scale(0.5 + k * 0.5, 0.5 + k * 0.5);
  txt(`${Wn.base} 승리!`, 0, 0, 60, '#ffd700', '#6d2b00', 12);
  ctx.restore();
  if (f > 0.4) {
    const dn = josa(cut.dish.name, '이', '가');
    const meLost = (mode === 1 && L === p1) || (mode === 3 && L === NET.me);
    const sub = meLost ? `당신은 맛있는 ${dn} 되었습니다...` : `${josa(L.base, '은', '는')} 맛있는 ${dn} 되었습니다...`;
    txt(sub, W / 2, 128, 26, '#fff', '#4e342e', 7);
  }
  if (f > 1) txt(`맛 평가 ${'★'.repeat(cut.stars)}${'☆'.repeat(5 - cut.stars)}  (${cut.meat.name} · ${cut.dish.label})`, W / 2, 170, 22, '#fff59d', '#4e342e', 5);
  if (f > 1.3) {
    const sk = f < 1.45 ? lerp(2.6, 1, (f - 1.3) / 0.15) : 1;
    drawStamp(770, 305, gr.t, gr.d, sk, -0.18);
  }
  if (mode === 1 && f > 0.8) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; rr(W / 2 - 230, 196, 460, 44, 12); ctx.fill();
    if (cut.revived) txt(`💖 부활권 사용! ${streak}연승 유지`, W / 2, 218, 22, '#ff80ab', '#000', 5);
    else if (!runOver) txt(`🔥 ${streak}연승 달성! 다음 상대 Lv.${oppLv() + 1}`, W / 2, 218, 24, '#ffeb3b', '#000', 5);
    else txt(`연승 종료 — 최종 ${streak}연승${rankPos >= 0 ? ` · 랭킹 ${rankPos + 1}위!` : ''}`, W / 2, 218, 24, '#ff8a80', '#000', 5);
  }
  if ((mode === 1 || mode === 3 || mode === 4) && f > 1.6) {
    const e = cut.earn, tot = e.win + Math.max(0, e.bet) + e.dish;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; rr(24, 238, 300, 112, 12); ctx.fill();
    txt(`🪙 +${fmtN(tot)} 코인`, 174, 262, 26, '#ffd740', '#000', 5);
    const parts2 = [];
    if (e.win) parts2.push(`승리 +${fmtN(e.win)}`); if (e.bet > 0) parts2.push(`베팅 적중 +${fmtN(e.bet)}`); if (e.bet < 0) parts2.push(`베팅 꽝 ${fmtN(e.bet)}`); if (cut.fridged) parts2.push(`🧊 ${cut.dish.name} 냉장고행`); if (mode === 4 && !e.bet) parts2.push('구경만 했어요');
    txt(parts2.join(' · '), 174, 296, 13, '#fff', null);
    txt(`보유 ${fmtN(coins)} 코인`, 174, 326, 16, '#ffe082', null);
  }
  if ((mode === 1 || mode === 3) && f > 1.9) {   // 티어(랭크전만) · 사채 이자 안내
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; rr(24, 356, 300, 62, 12); ctx.fill();
    if (cut.tp) {
      const up = tierOf(cut.tp.after) > tierOf(cut.tp.before), down = tierOf(cut.tp.after) < tierOf(cut.tp.before);
      const bw2 = drawTierBadge(36, 376, cut.tp.after, 12, 'left');
      txt(`${cut.tp.d >= 0 ? '+' : ''}${cut.tp.d} TP (${cut.tp.after})${up ? ' ⬆ 승급!' : down ? ' ⬇ 강등' : ''}`, 44 + bw2, 376, 14, up ? '#69f0ae' : down ? '#ff8a80' : '#fff', null, 0, 'left');
    } else txt('티어 점수는 랭크전에서만 바뀌어요', 174, 376, 13, '#aaa', null);
    if (cut.tp && cut.tp.msg) txt(cut.tp.msg, 174, 402, 13, '#ffd740', null);   // 승급전 소식이 있으면 우선 표시
    else txt(cut.interest ? `💸 사채 이자 +${fmtN(cut.interest)} · 남은 빚 ${fmtN(debt)}` : '👑 빚 없음!', 174, 402, 13, '#ffab91', null);
  }
  addHot(0, 60, W, H - 60, () => { pressed.Enter = true; });

  if (mode === 1 && !runOver) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(W - 130, 8, 120, 34, 8); ctx.fill(); txt('그만하기', W - 70, 25, 15, '#fff', null); addHot(W - 130, 8, 120, 34, () => { pressed.Escape = true; }); }
  if (mode === 3) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(W - 130, 8, 120, 34, 8); ctx.fill(); txt('나가기', W - 70, 25, 15, '#fff', null); addHot(W - 130, 8, 120, 34, () => { pressed.Escape = true; }); }
  if (mode === 4 && f > 0.8) { ctx.fillStyle = 'rgba(0,0,0,0.55)'; rr(W / 2 - 230, 196, 460, 44, 12); ctx.fill(); { const bm = bet4.stake ?(cut.earn.bet > 0 ? `🎉 베팅 적중! +${fmtN(cut.earn.bet)} 코인 (건 돈 빼고 +${fmtN(cut.earn.bet - bet4.stake)})` : `💸 베팅 실패... -${fmtN(bet4.stake)} 코인`) : '👀 구경 끝!'; txt(bm, W / 2, 218, fitSize(bm, 24, 440), cut.earn.bet > 0 ? '#ffd740' : '#fff', '#000', 5); } }
  const hint = mode === 4 ? '[Enter] 다음 경기 베팅      [Esc] 타이틀' : mode === 3 ? '[Enter] 재대결 (둘 중 한 명)      [Esc] 방 나가기' : mode !== 1 ? '[Enter] 타이틀' : runOver ? '[Enter] 랭킹 보기      [Esc] 타이틀' : '[Enter] 다음 상대      [Esc] 그만하기(기록 저장)';
  if (f > 0.6 && gT % 60 < 42) txt(hint, W / 2, H - 28, 22, '#fff', '#000', 5);
}
function drawCutscene() {
  const t = cut.t;
  ctx.save();
  if (shake > 0.5) ctx.translate(rand(-shake, shake), rand(-shake, shake));
  if (t < T_KIT) drawKitchen(t); else if (t < T_GRL) drawCook(t - T_KIT); else drawFinal(t - T_GRL);
  drawParts();
  ctx.restore();
  let fade = 0;
  for (const b of [T_KIT, T_GRL]) { if (t > b - 0.3 && t < b) fade = (t - (b - 0.3)) / 0.3; else if (t >= b && t < b + 0.3) fade = 1 - (t - b) / 0.3; }
  if (t < 0.3) fade = 1 - t / 0.3;
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
  if (t >= 2.0 && t < 2.12) { ctx.fillStyle = `rgba(255,255,255,${1 - (t - 2) / 0.12})`; ctx.fillRect(0, 0, W, H); }
  if (cut.waiting) { drawChoice(); return; }
  if (!cut.chosen) addHot(0, 0, W, H, () => { pressed.Space = true; });
  else if (t > T_GRL + 0.6) addHot(0, 0, W, H, () => { pressed.Enter = true; });
  else if (t < T_GRL) addHot(0, 0, W, H, () => { pressed.Space = true; });
  if (t < T_GRL) {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 40); ctx.fillRect(0, H - 40, W, 40);
    const L = cut.l;
    const cap = t < 2.0 ? `패배한 ${L.base}의 운명은...?` : t < T_KIT ? (cut.dish ? `...그렇게 ${josa(cut.dish.name, '이', '가')} 되기로 했다.` : `오늘의 부위는... ${cut.meat.name}!`)
      : t < T_KIT + 3.0 ? cut.dish.cap : '거의 다 됐다...!';
    txt(cap, W / 2, H - 20, 18, '#fff', null);
    txt('SPACE: 스킵', W - 16, 20, 14, '#888', null, 0, 'right');
  }
}

