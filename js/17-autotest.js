// ================= autotest (?autotest) =================
// 성능 측정 (?view=perf): 화면마다 그리기·진행에 걸리는 시간 (getImageData로 실제로 다 그릴 때까지 기다림)
// 막누르기 테스트 (?view=fuzz&seed=N): 무작위로 키를 누르며 여러 화면을 돌아다님 → 오류가 나면 기록
function fuzzRun() {
  const qs = new URLSearchParams(location.search); let sd = +(qs.get('seed') || 1);
  const rnd = () => (sd = (sd * 1103515245 + 12345) % 2147483648) / 2147483648;
  const KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyI', 'KeyO', 'KeyK', 'KeyL', 'KeyJ', 'KeyU', 'KeyY', 'Enter', 'Space', 'Escape', 'KeyR', 'KeyQ', 'KeyE', 'KeyZ', 'KeyX', 'KeyC', 'KeyF', 'KeyN', 'KeyM', 'KeyT', 'KeyB', 'KeyG', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9'];
  const out = [], seen = {}; let errs = 0;
  window.prompt = () => null; window.confirm = () => false; window.alert = () => {};   // 창이 뜨면 멈추니까 막음
  coins = 1e13; tyU.auto = true;
  const JUMPS = [() => openCutList(), () => startTutorial(), () => openPigs(), () => { coins = 1e8; openSkinBox(3); }, () => openTycoon(), () => openReward(), () => { GIFT = { id: Date.now(), coins: 100, spins: 1, items: 0, msg: '', until: 0 }; claimGift(); }, () => openMarket(), () => { scene = 'bank'; }, () => openBet(), () => { mode = 1; ranked = true; selFor = 'run'; scene = 'select'; }, () => { mode = 1; ranked = false; selFor = 'run'; scene = 'select'; },
    () => openRanking(false), () => { scene = 'endings'; }, () => { mode = 0; p1.setChar(CHARS[rnd() * CHARS.length | 0]); p2.setChar(CHARS[rnd() * CHARS.length | 0]); startMatch(); }, () => { tyU.auto = !tyU.auto; }, () => toTitle(),
    () => { mode = 1; ranked = true; p1.setChar(CHARS[rnd() * CHARS.length | 0]); p2.setChar(CHARS[rnd() * CHARS.length | 0]); p1.meter = p2.meter = 100; startMatch(); }];
  for (let f = 0; f < 60 * 60 * 6; f++) {
    for (const k in keys) if (rnd() < 0.08) keys[k] = false;
    if (rnd() < 0.5) press(KEYS[rnd() * KEYS.length | 0]);
    if (authShown) closeAuth();
    if (scene === 'online' || f % 900 === 0) { try { JUMPS[rnd() * JUMPS.length | 0](); } catch (e) { out.push('ERR jump ' + e.message); } }
    try { step(); if (f % 7 === 0) draw(); } catch (e) {
      errs++; const key = e.message + ' in ' + scene;
      if (!seen[key]) { seen[key] = 1; out.push('ERR ' + key + ' | ' + String(e.stack || '').split(String.fromCharCode(10)).slice(1, 3).join(' / ')); }
    }
    for (const k in pressed) delete pressed[k];
    seen['scene:' + scene] = (seen['scene:' + scene] || 0) + 1;
  }
  out.push('errors ' + errs + ' · scenes ' + Object.keys(seen).filter(k => k.startsWith('scene:')).map(k => k.slice(6) + '=' + seen[k]).join(' '));
  const pre = document.createElement('pre'); pre.id = 'r'; pre.textContent = out.join(String.fromCharCode(10)); document.body.appendChild(pre);
}
function perfRun() {
  const out = [], fl = () => ctx.getImageData(0, 0, 1, 1), time = (name, setup) => {
    setup(); for (let i = 0; i < 20; i++) { step(); draw(); }
    let s = 0, d = 0;
    for (let i = 0; i < 150; i++) { const a = performance.now(); step(); const b = performance.now(); draw(); fl(); d += performance.now() - b; s += b - a; }
    out.push(`${name}: draw ${(d / 150).toFixed(2)}ms · step ${(s / 150).toFixed(2)}ms`);
  };
  time('title', () => { scene = 'title'; });
  time('fight', () => { mode = 0; p1.setChar(CHARS[0]); p2.setChar(CHARS[6]); startMatch(); scene = 'fight'; });
  time('fight+효과', () => { p1.slowT = 9999; p2.drunkT = 9999; p2.flash = 9999; });
  time('tycoon', () => { tyU = { ...TYU0(), side: 4, grill: 3, menu: 1, staff: 3 }; openTycoon(); tyStart(); });
  time('market', () => { openMarket(); });
  time('select', () => { mode = 1; selFor = 'run'; scene = 'select'; });
  time('bank', () => { scene = 'bank'; });
  const pre = document.createElement('pre'); pre.id = 'r'; pre.textContent = out.join('\n'); document.body.appendChild(pre);
}
if (/autotest/.test(location.search)) {
  const out = [];
  const qs = new URLSearchParams(location.search), from = +(qs.get('from') || 0), cnt = +(qs.get('n') || CHARS.length), every = +(qs.get('draw') || 30);
  try {
    for (let i = from; i < Math.min(CHARS.length, from + cnt); i++) {
      mode = 0; p1.setChar(CHARS[i]); p2.setChar(CHARS[(i + 3) % CHARS.length]); startMatch();
      let n = 0;
      while (scene !== 'cutscene' && n < 60 * 60 * 10) {
        if (scene === 'intro') { p1.meter = Math.max(p1.meter, 100); p2.meter = Math.max(p2.meter, 100); }
        step(); if (n % every === 0) draw(); n++;
      }
      const ok = scene === 'cutscene';
      let m = 0;
      while (scene === 'cutscene' && cut.t < T_GRL + 2 && m < 2000) { step(); if (m % every === 0) draw(); m++; }
      console.log('AT ' + i + ' ' + (ok ? 'ok' : 'noend') + ' frames=' + n);
      out.push(`${p1.ch.name} vs ${p2.ch.name}: ${ok ? 'cutscene OK' : 'NO END'} frames=${n} wins=${p1.wins}-${p2.wins} grade=${ok ? cut.grade.t : '-'} maxCombo=${Math.max(p1.stats.maxCombo, p2.stats.maxCombo)} parries=${p1.stats.parries + p2.stats.parries} parts=${p1.stats.parts + p2.stats.parts}`);
    }
    // 연승 모드 흐름: 플레이어 무입력 → 패배 → 랭킹 기록 → 랭킹 화면
    mode = 1; sel.c1 = 2; startRun(); out.push('run start: ' + scene);
    for (let n = 0; n < 700 && scene === 'opening'; n++) { step(); if (n % 40 === 0) draw(); }
    out.push('after opening: ' + scene); betSel = 2; draw();
    for (let n = 0; n < 50 && scene === 'vs'; n++) { if (n === 30) pressed.Enter = true; step(); }
    out.push('after vs: ' + scene + ' bet=' + bet + ' coins=' + coins);
    let n2 = 0; while (scene !== 'cutscene' && n2 < 60 * 60 * 6) { step(); n2++; }
    out.push(`streak-run: scene=${scene} runOver=${runOver} rankPos=${rankPos} meat=${cut && cut.meat.name}`);
    for (let n = 0; n < 3000 && scene === 'cutscene' && cut.t < T_GRL + 1; n++) { if (cut.waiting) { draw(); pressed.Digit3 = true; } step(); if (n % 60 === 0) draw(); }
    out.push(`chosen: ${cut.meat.name} -> ${cut.dish && cut.dish.name} stars=${cut.stars} earn=${JSON.stringify(cut.earn)}`);
    pressed.Enter = true; step(); out.push('after Enter: ' + scene); draw();
    cut.chosen = true; cut.waiting = false;
    for (const m of MEATS) for (const o of m.opts) { cut.meat = m; cut.dish = makeDish(o); for (let t = 0; t < 12; t += 0.5) { cut.t = t; drawCutscene(); } }
    out.push('dishes drawn: ' + MEATS.length * 3);
    scene = 'opening'; for (sceneT = 0; sceneT < OPEN_T; sceneT += 20) draw();
    scene = 'fight'; blackoutT = 100; draw(); blackoutT = 0;
    for (const sc of ['title', 'select', 'ranking']) { scene = sc; draw(); }
    scene = 'vs'; sceneT = 30; draw();
    scene = 'online'; draw(); scene = 'title'; draw();
    // 온라인 락스텝 결정성: 같은 시드 + 같은 입력이면 두 번 돌려도 결과가 같아야 한다
    const hsh = (k) => { let x = Math.imul(k ^ 0x9e3779b9, 2654435761) >>> 0; x ^= x >>> 15; return Math.imul(x, 0x85ebca6b) >>> 0; };
    const genIn = (n, side) => {
      const h = hsh(Math.floor(n / 10) * 7 + side), o = { ...EMPTY }, ev = n % 10 === 0;
      o.left = (h & 3) === 1; o.right = (h & 3) === 2; o.down = (h >> 2 & 7) === 0;
      o.leftP = ev && o.left; o.rightP = ev && o.right; o.up = ev && (h >> 5 & 7) === 0;
      if (ev) { const b = ['lp', 'rp', 'lk', 'rk', 'grab', 'skill', 'lp', 'rk'][h >> 8 & 7]; o[b] = true; o.mash = true; }
      if (ev && (h >> 12 & 7) === 0) { o.adCmd = true; o.ult = true; }
      o.ok = n % 240 === 0; o.n1 = n % 50 === 0;
      return o;
    };
    const simRun = seed => {
      mode = 3; NET.me = p1; NET.names = ['A', 'B']; NET.code = '0000';
      p1.setChar(CHARS[3]); p2.setChar(CHARS[8]);
      sseed(seed); startMatch(); let r = '';
      for (let n = 0; n < 12000; n++) {
        netIn = { p1: genIn(n, 1), p2: genIn(n, 2) }; step();
        if (n % 400 === 0) r += [scene, p1.hp.toFixed(4), p2.hp.toFixed(4), p1.x.toFixed(3), p2.x.toFixed(3), p1.wins, p2.wins].join(',') + '|';
      }
      return r;
    };
    const r1 = simRun(12345), r2 = simRun(12345), r3 = simRun(999);
    out.push('lockstep determinism: ' + (r1 === r2 ? 'OK' : 'MISMATCH') + ' (다른 시드와 다름: ' + (r1 !== r3) + ')');
    out.push('sim tail: ' + r1.split('|').slice(-4).join(' / '));
    // 사운드 합성 코드 실행 (헤드리스에서도 AudioContext 생성 가능)
    initAudio();
    if (AC) { for (const nm in TRACKS) { const tr = TRACKS[nm]; for (let s = 0; s < 32; s++) scheduleStep(tr, s, AC.currentTime + s * 0.05, 0.05); } for (const k in SFX) SFX[k](); setMusic('fight'); musicTick(); out.push('audio: OK'); }
    else out.push('audio: no AudioContext');
    // AI 베팅 한 판
    coins = 200; openBet(); bet4.side = 0; bet4.amt = 2; draw(); pressed.Enter = true; step();
    out.push('bet: scene=' + scene + ' stake=' + bet4.stake);
    let nb = 0; bet4.fast = true; while (scene !== 'cutscene' && nb < 60 * 60 * 8) { step(); if (nb % 90 === 0) draw(); nb++; }
    let nc = 0; while (scene === 'cutscene' && cut.t < T_GRL + 1 && nc < 3000) { step(); if (nc % 90 === 0) draw(); nc++; }
    out.push(`bet result: winner=${cut.w.base} side=${bet4.side} earn=${JSON.stringify(cut.earn)} coins=${coins}`);
    pressed.Enter = true; step(); out.push('after bet Enter: ' + scene);
    // 시장 · 상점
    fridge = []; addDish(makeDish(MEATS[5].opts[0]), '갈비', 5); addDish(makeDish(MEATS[0].opts[2]), '삼겹살', 2);
    openMarket(); draw(); const c0 = coins; sellDish(0); out.push(`market: sold +${coins - c0}, fridge=${fridge.length}`); mk.tab = 1; draw();
    coins = 2000; for (let i = 0; i < SHOP.length; i++) shopAct(i);
    // 포장마차 장사: 영업 한 판 (불판·서빙·알바·업그레이드)
    { const c0 = coins; openTycoon(); draw(); tyU.staff = 2; tyStart(); for (let n = 0; n < TY_SHIFT + 5 && TY.phase === 'play'; n++) { if (n % 60 === 0) { tySlot(0); tySlot(1); } step(); if (n % 120 === 0) draw(); } draw(); out.push(`tycoon: phase=${TY.phase} served=${TY.served} missed=${TY.missed} earned=${TY.earned} coins+${coins - c0}`); tyU.staff = 0; tyU.side = 4; tyU.deco = 2; tyU.auto = false; TY.phase = 'lobby'; tyToggleAuto(); TY.ev = TY_EV[1]; const aph = TY.phase; for (let n = 0; n < TY_SHIFT + 5 && TY.phase === 'play'; n++) step(); const asv = TY.served; for (let n = 0; n < 400 && TY.phase === 'result'; n++) step(); out.push(`tycoon auto: start=${aph} served=${asv} next=${TY.phase} rating=${tyU.rating} sides=${JSON.stringify(TY.sideStock)}`); if (!isFinite(tyU.total) || !isFinite(tyU.rating)) throw new Error('장사 숫자 오류'); if (!(aph === 'play' && asv > 0 && TY.phase === 'play')) throw new Error('자동 영업 실패'); { const s0 = tyU.shifts, c0 = coins; tyU.auto = true; TY.phase = 'lobby'; TY.autoT = 1; scene = 'title'; for (let n = 0; n < TY_SHIFT + 400; n++) step(); out.push(`tycoon bg: shifts ${s0}->${tyU.shifts} coins+${coins - c0} scene=${scene}`); if (tyU.shifts <= s0 || scene !== 'title') throw new Error('다른 화면 자동 영업 실패'); } { const s0 = tyU.shifts, c0 = coins; tyU.idle = 1; tyU.auto = false; tyU.hist = [1000]; tyU.lastT = 0; tyU.awayCarry = 0; localStorage.setItem(SEEN_K, String(Date.now() - 10.5 * (TY_SHIFT + 240) / 60 * 1000)); tyOffline(); out.push(`tycoon idle: shifts +${tyU.shifts - s0} coins+${coins - c0}`); if (tyU.shifts - s0 !== 10 || coins - c0 !== 10000) throw new Error('무인 영업 계산 실패'); tyU.idle = 0; } tyU.auto = false; coins = 1e6; TY.phase = 'lobby'; for (const u of TY_UP) tyBuy(u); coins = 3e8; tyBuy(TY_UP.find(u => u.id === 'chain')); draw(); if (tyU.chain !== 1 || tyU.chains.length !== 1) throw new Error('체인점 실패'); out.push('tycoon up: ' + JSON.stringify(tyU)); tyU = TYU0(); saveTyU(); }
    out.push('shop: own=' + Object.keys(inv.own).join(',') + ' use=' + JSON.stringify(inv.use) + ' coins=' + coins);
    scene = 'title'; draw(); p1.setChar(withCos(CHARS[0])); scene = 'fight'; draw(); scene = 'betpick'; draw();
    // 스토리 · 은행 · 티어 · 랭킹
    for (const k in STORY) { startStory(k); for (let i = 0; i < STORY[k].length; i++) { story.i = i; for (story.t = 1; story.t < 200; story.t += 40) { draw(); } } }
    coins = 5000; debt = 10000; bankDebt = 0; chapSeen = []; scene = 'bank'; draw(); repay('debt', 3000);
    out.push(`repay: debt=${debt} coins=${coins} scene=${scene} chap=${chapSeen.join(',')}`);
    scene = 'bank'; coins = 0; borrow(100); out.push(`loan: bankDebt=${bankDebt} coins=${coins} limit=${loanLimit()}`);
    { const L = [0, 300, 999, 1000, 3599, 3600, 16999, 17000, 25000].map(v => tierLabel(v)); out.push('tiers: ' + L.join(',')); if (L[0] !== '아이언 4' || L[2] !== '아이언 1' || L[3] !== '브론즈 4' || L[5] !== '골드 4' || L[7] !== '그렌드피아노' || nextStep(0).need !== 250) throw new Error('티어 단계 실패'); const t0 = tp, p0 = promo; tp = 400; promo = null; const m = rankedResult(true, false); out.push('ranked msg: ' + m); if (!/까지 [0-9]+점/.test(m)) throw new Error('남은 점수 표시 실패'); tp = t0; promo = p0; lsSet('sgf_tp', tp); lsSet('sgf_promo', promo); }
    tp = 720; out.push('tier 720 = ' + tierLabel(tp)); draw(); openRanking(false); draw(); rk.tab = 1; draw(); scene = 'title'; draw();
    mode = 1;
    out.push('ults used: ' + JSON.stringify(ultCount));
    // 🆕 신캐릭터: 스킬 3개 · 분신 · 오버클럭 · 필살기 · 예고편 · 강제 승리 · 퀘스트 · 룰렛 칸
    { const DV = CHARS.find(c => c.name === '볼트돈'), NR = CHARS.find(c => c.name === '돼루토'), IT = CHARS.find(c => c.name === '이타돼리'), BB = BIG_CHARS.map(n => CHARS.find(c => c.name === n));
      for (const [me, sk] of [[NR, 0], [NR, 1], [NR, 2], [DV, 0], [DV, 1], [DV, 2], [IT, 0], [IT, 1], [IT, 2], ...BB.flatMap(c => [[c, 0], [c, 1], [c, 2]]), ...BIG2_CHARS.map(n => CHARS.find(c => c.name === n)).flatMap(c => [[c, 0], [c, 1], [c, 2]])]) {
        mode = 0; p1.setChar(me); p2.setChar(CHARS[0]); startMatch(); for (let n = 0; n < 130 && scene !== 'fight'; n++) step();
        p1.x = 380; p2.x = 520; p1.facing = 1; p1.state = 'idle'; p1.inp = { down: sk === 1, right: sk === 2 }; startSkill(p1, false);
        const hp0 = p2.hp; let clones = 0, slowSeen = false; for (let n = 0; n < 120 && scene === 'fight'; n++) { step(); if (n % 20 === 0) draw(); clones = Math.max(clones, objs.filter(o => o.kind === 'pclone').length); if (p1.sandT > 0) slowSeen = true; }
        out.push(`${me.name} skill${sk + 1}(${me.skills[sk].name}): dmg=${(hp0 - p2.hp).toFixed(1)} clones=${clones} slow=${slowSeen}`);
        if (sk === 0 && me === IT && !(hp0 - p2.hp > 5)) throw new Error('늦게 터지는 주먹 실패');
        if (sk === 0 && me === NR && clones !== 2) throw new Error('분신술 실패'); if (sk === 0 && me === DV && !slowSeen) throw new Error('오버클럭 실패');
        const uh0 = p2.hp;
        if (scene === 'fight') { p1.meter = 100; p1.state = 'idle'; startUlt(p1); for (let n = 0; n < NEW_ULT_CUT + (BIG_THEME[me.ult.type] ? 200 : 60) && scene === 'fight'; n++) { step(); if (n % 25 === 0) draw(); } if (BIG_THEME[me.ult.type] && scene === 'fight' && !(p2.hp < uh0)) throw new Error(me.ult.name + ' 필살기 피해 없음'); out.push(`  ult ${me.ult.name}: cyber=${p1.cyberT} fox=${p1.foxT} curse=${p1.curseT} state=${p1.state}`); if (scene === 'fight' && !BIG_THEME[me.ult.type] && !['dismantle', 'boltRush'].includes(me.ult.type) && !(p1.cyberT > 0 || p1.foxT > 0 || p1.curseT > 0)) throw new Error('신캐 필살기 실패'); }
      }
      for (const me of CHARS.filter(c => c.costume)) {   // 대규모 업데이트 3~20 돼지: 새 스킨 3개 · 새 필살기
        let sum = 0; const row = [];
        for (let sk = 0; sk < 3; sk++) {
          mode = 0; p1.setChar(withCos(me)); p2.setChar(CHARS[0]); startMatch(); for (let n = 0; n < 130 && scene !== 'fight'; n++) step();
          p1.x = 380; p2.x = 520; p1.facing = 1; p2.facing = -1; p1.state = 'idle'; p1.inp = { down: sk === 1, right: sk === 2 }; startSkill(p1, false);
          const h0 = p2.hp, m0 = p1.hp; for (let n = 0; n < 130 && scene === 'fight'; n++) { p2.inp = {}; step(); if (n % 15 === 0) draw(); }
          sum += h0 - p2.hp; row.push(`${me.skills[sk].name}=${(h0 - p2.hp).toFixed(1)}`);
        }
        let u0 = 0; for (let tr = 0; tr < 3; tr++) {   // 필살기는 피할 수 있어서 상대 CPU가 피하면 다시 (3번 중 한 번은 맞아야 함)
        mode = 0; p1.setChar(withCos(me)); p2.setChar(CHARS[0]); startMatch(); for (let n = 0; n < 130 && scene !== 'fight'; n++) step();
        p1.x = 380; p2.x = 560; p1.facing = 1; p2.facing = -1; p1.state = 'idle'; p1.meter = 100; startUlt(p1); u0 = p2.hp; for (let n = 0; n < 260 && scene === 'fight'; n++) { step(); if (n % 20 === 0) draw(); }
        if (u0 - p2.hp > 0 || scene !== 'fight') break; }
        out.push(`${me.name}: ${row.join(' ')} · 필살 ${me.ult.name}=${(u0 - p2.hp).toFixed(1)} state=${p1.state}`);
        if (!(sum > 0)) throw new Error(me.name + ' 새 스킬 피해 없음');
        if (!(u0 - p2.hp > 0) && scene === 'fight') throw new Error(me.name + ' 새 필살기 피해 없음');
        if (p1.state === 'ult') throw new Error(me.name + ' 필살기가 안 끝남');
      }
      { mode = 0; p1.setChar(CHARS[0]); p2.setChar(CHARS[1]); startMatch(); for (let n = 0; n < 130 && scene !== 'fight'; n++) step(); p1.x = 400; p2.x = 520; p1.facing = 1; p2.facing = -1; p2.state = 'block'; const r1 = dealHit(p1, p2, { dmg: 10, kind: 'ult', src: p1.x, height: 'mid', stun: 20 }); p2.state = 'block'; p2.stun = 0; const r2 = dealHit(p1, p2, { dmg: 10, kind: 'punch', src: p1.x, height: 'mid', stun: 20 }); out.push(`ult vs block: ${r1} · punch vs block: ${r2}`); if (r1 !== 'hit' || r2 !== 'block') throw new Error('필살기 방어 무시 실패'); }
      { mode = 0; p1.setChar(NR); p2.setChar(CHARS[0]); startMatch(); for (let n = 0; n < 130 && scene !== 'fight'; n++) step(); p1.x = 150; p2.x = 760; p2.state = 'idle'; p1.state = 'idle'; p1.inp = { down: true }; startSkill(p1, false); const h0 = p2.hp; let hitAt = -1; for (let n = 0; n < RASEN_CUT + 80 && scene === 'fight'; n++) { p2.x = Math.max(p2.x, 700); step(); if (hitAt < 0 && p2.hp < h0) hitAt = n; } out.push(`rasen dash: hit=${hitAt >= 0} dmg=${(h0 - p2.hp).toFixed(1)} p1.x=${p1.x | 0}`); if (hitAt < 0) throw new Error('회오리 구슬 달려가서 맞히기 실패'); }
      mode = 1; ranked = false; p1.setChar(CHARS[0]); p2.setChar(CHARS[1]); startMatch(); for (let n = 0; n < 130 && scene !== 'fight'; n++) step();
      const s0 = streak; forceWon = false; forceWin(); for (let n = 0; n < 400 && scene !== 'cutscene'; n++) step(); out.push(`forceWin: scene=${scene} streak ${s0}->${streak}`); if (scene !== 'cutscene' || streak !== s0 + 1) throw new Error('강제 승리 실패');
      startBig2Trailer(); for (let n = 0; n < BIG2T_T + 5 && scene === 'big2trailer'; n++) { step(); if (n % 25 === 0) draw(); } if (scene !== 'title') throw new Error('대규모 2 예고편 실패'); POPQ.length = 0; POP = null;
      { let cnt = 0; for (const c of CHARS) { if (!c.skills) continue; for (let sk = 1; sk < 3; sk++) { mode = 0; p1.setChar(c); p2.setChar(CHARS[0]); startMatch(); for (let n = 0; n < 125 && scene !== 'fight'; n++) step(); p1.x = 400; p2.x = 540; p1.facing = 1; p1.state = 'idle'; p1.inp = { down: sk === 1, right: sk === 2 }; startSkill(p1, false); for (let n = 0; n < 90 && scene === 'fight'; n++) { step(); if (n % 30 === 0) draw(); } cnt++; } } out.push(`all extra skills: ${cnt}`); if (cnt < 36) throw new Error('스킬 수가 이상해요'); }
      for (const ty of Object.keys(BIG_THEME)) { const c = CHARS.find(x => x.ult.type === ty); if (!c) throw new Error('컷신 테마만 있고 돼지가 없음: ' + ty); }
      startBigTrailer(); for (let n = 0; n < BIGT_T + 5 && scene === 'bigtrailer'; n++) { step(); if (n % 25 === 0) draw(); } out.push(`big trailer: end scene=${scene}`); if (scene !== 'title') throw new Error('대규모 예고편 실패'); POPQ.length = 0; POP = null;
      startItTrailer(); for (let n = 0; n < ITT_T + 5 && scene === 'ittrailer'; n++) { step(); if (n % 25 === 0) draw(); } out.push(`it trailer: end scene=${scene}`); if (scene !== 'title') throw new Error('이타돼리 예고편 실패'); POPQ.length = 0; POP = null;
      startNrTrailer(); for (let n = 0; n < NRT_T + 5 && scene === 'nrtrailer'; n++) { step(); if (n % 25 === 0) draw(); } out.push(`nr trailer: end scene=${scene}`); if (scene !== 'title') throw new Error('돼루토 예고편 실패'); POPQ.length = 0; POP = null;
      scene = 'title'; startTrailer(); for (let n = 0; n < TRAILER_T + 5 && scene === 'trailer'; n++) { step(); if (n % 30 === 0) draw(); } out.push(`trailer: end scene=${scene} pop=${POPQ.length + (POP ? 1 : 0)}`); if (scene !== 'title') throw new Error('예고편 실패'); POPQ.length = 0; POP = null;
      localStorage.removeItem('sgf_unlock_돼루토'); lsSet('sgf_nq', {}); nqAdd('ranked', 1); nqAdd('shift', 1); if (nqState().ranked !== 1 || nqState().shift !== 1) throw new Error('퀘스트 동시 진행 실패'); for (const st of NQ) for (let k = 0; k < st.goal; k++) nqAdd(st.id, st.id === 'streak' ? k + 1 : 1, st.id === 'streak');
      out.push(`quest: step=${nqStep()} unlocked=${isUnlocked(NR)}`); if (!isUnlocked(NR)) throw new Error('돼루토 퀘스트 실패'); localStorage.removeItem('sgf_unlock_돼루토'); POPQ.length = 0;
      for (const Q of QUESTS.slice(1)) { if (!qOpen(Q)) { out.push(`quest ${Q.ch}: 기간 끝 (건너뜀)`); continue; } const c = CHARS.find(x => x.name === Q.ch), uk = Q.unlockKey || 'sgf_unlock_' + Q.ch; localStorage.removeItem(uk); lsSet(Q.key, {}); const before = Q.unlockKey ? lsGet(uk, false) : isUnlocked(c); for (const st of Q.steps) for (let k = 0; k < st.goal; k++) nqAdd(st.id, st.id === 'streak' ? k + 1 : 1, st.id === 'streak'); const after = Q.unlockKey ? lsGet(uk, false) : isUnlocked(c); out.push(`quest ${Q.ch}: before=${before} after=${after}`); if (before || !after) throw new Error(Q.ch + ' 퀘스트 실패'); localStorage.removeItem(uk); POPQ.length = 0; POP = null; }
      if (!isUnlocked(CHARS.find(x => x.name === '훈제돈')) || !isUnlocked(CHARS.find(x => x.name === '핑크하트'))) throw new Error('무료 돼지 해금 실패');
      { const DR = CHARS.find(x => x.name === '드래곤돈'); mode = 0; p1.setChar(DR); p2.setChar(CHARS[0]); startMatch(); for (let n = 0; n < 130 && scene !== 'fight'; n++) step(); p1.x = 420; p2.x = 520; nySkillStart(p1, { type: 'yDrScale' }); p1.invT = 0; p1.state = 'idle'; const hp0 = p1.hp, r1 = dealHit(p2, p1, { dmg: 10, kind: 'punch', src: p2.x, height: 'mid', stun: 10 }); out.push(`scale shield: r=${r1} hp=${hp0}->${p1.hp} left=${p1.scaleSh}`); if (p1.hp < hp0 || p1.scaleSh) throw new Error('비늘 방패 실패'); nySkillStart(p1, { type: 'yDrScale' }); p1.invT = 0; p1.state = 'idle'; const hp1 = p1.hp; dealHit(p2, p1, { dmg: 10, kind: 'ult', src: p2.x, height: 'mid', stun: 10 }); out.push(`scale vs ult: hp=${hp1}->${p1.hp}`); if (!(p1.hp < hp1) || p1.scaleSh) throw new Error('필살기가 비늘 방패를 못 뚫음'); scene = 'title'; }
      { // 🌍 월드 · 💎 다이아 · 선물 받기 · 포장마차 · 주식 · 크리스마스 퀘스트 · 빚 10배
        if (DEBT_START !== 1e8 || EARN !== 0.5) throw new Error('빚·수입 설정 실패');
        const w2s = lsGet('sgf_w2', 0); lsSet('sgf_dia', 3); openWorlds(); POPQ.length = 0; POP = null; draw(); WD.shop = true; draw(); buyDia(0); if (diaGet() !== 0) throw new Error('다이아 상점 실패'); WD.shop = false;
        startCatch(); for (let n = 0; n < 900; n++) { if (CG.items.length) CG.x = CG.items[0].x; updateCatch(); if (n % 90 === 0) draw(); }
        CG.t = CG.dur - 1; updateCatch(); draw(); out.push(`world gift: score=${CG.score} dia=${diaGet()} done=${CG.done}`); if (!CG.done || !(CG.score > 0)) throw new Error('선물 받기 실패'); catchExit(); if (scene !== 'worlds') throw new Error('선물 받기 뒤 월드로 안 감');
        const w2m = lsGet('sgf_w2meat', null); lsSet('sgf_w2', 0); lsSet('sgf_w2meat', { sam: 0, mok: 0, hang: 0 }); localStorage.removeItem('sgf_w2story');
        openLobby(2); POPQ.length = 0; POP = null; draw(); if (scene !== 'lobby' || LB.w !== 2) throw new Error('월드2 로비 실패');
        LB.x = 330; keys.KeyD = true; for (let n = 0; n < 10; n++) updateLobby(); keys.KeyD = false; LB.x = 330; updateLobby(); draw(); if (LB.near !== 1) throw new Error('로비 건물 앞 인식 실패');
        pressed.KeyW = true; updateLobby(); delete pressed.KeyW; if (mode !== 8 || scene !== 'intro') throw new Error('사냥터 싸움 시작 실패'); for (let n = 0; n < 140; n++) step(); draw();
        p1.wins = 1; afterRound(); out.push('hunt fight (1판) -> ' + scene); if (scene !== 'butcher') throw new Error('싸움 이기고 해체로 안 감');
        for (let i = 0; i < 3; i++) { BT.pos = BT.zone; pressed.Space = true; updateButcher(); delete pressed.Space; draw(); }
        let mm = w2Meat(); out.push('butcher meat: ' + JSON.stringify(mm)); if (!BT.done || mm.mok !== 4 || mm.hang !== 4 || mm.sam !== 4) throw new Error('해체 고기 실패'); for (let n = 0; n < 40; n++) updateButcher(); pressed.Enter = true; updateButcher(); delete pressed.Enter; if (scene !== 'intro' || mode !== 8) throw new Error('해체 뒤 바로 다음 사냥 실패'); quitRun(); if (scene !== 'lobby') throw new Error('사냥 그만두고 로비로 안 감');
        worldFight(2); p2.wins = 2; afterRound(); if (scene !== 'lobby') throw new Error('사냥 지면 로비로 안 감'); worldFight(2); quitRun(); if (scene !== 'lobby' || mode === 8) throw new Error('싸움 그만두기 실패');
        startSnipe(); for (let n = 0; n < 30; n++) updateSnipe(); draw(); const tg = SN.tg.find(t => !t.dead); SN.cx = tg.x - Math.sin(SN.t * 0.05) * 7; SN.cy = tg.y - 60 * tg.s - Math.cos(SN.t * 0.07) * 5; snipeFire(); out.push('snipe hit=' + !!SN.hit);
        if (!SN.hit) throw new Error('저격 명중 실패'); SN.hit.angry = false; SN.hit.tg.dead = true; SN.hit.tg.angry = false; for (let n = 0; n < 80 && scene === 'snipe'; n++) { updateSnipe(); if (n % 20 === 0) draw(); } if (scene !== 'butcher') throw new Error('저격 뒤 해체로 안 감'); BT = null; lobbyBack();
        startSnipe(); for (let n = 0; n < 5; n++) updateSnipe(); { const t2 = SN.tg.find(t => !t.dead), r = cv.getBoundingClientRect(); cv.dispatchEvent(new PointerEvent('pointerdown', { clientX: r.left + t2.x * r.width / W, clientY: r.top + (t2.y - 60 * t2.s) * r.height / H, pointerType: 'mouse', bubbles: true })); out.push('mouse aim hit=' + !!SN.hit); if (!SN.hit) throw new Error('마우스 조준 저격 실패'); } SN = null; scene = 'lobby';
        worldFight(2, { angry: CHARS[2] }); out.push(`angry: hp=${Math.round(p2.hp)}/${p2.maxHp} bleed=${p2.wBleed} wpn=${p2.C.wpn}`); if (!p2.wBleed || Math.abs(p2.hp - p2.maxHp * 0.75) > 1 || p2.C.wpn !== 'katana' || p2.condDmg <= 1) throw new Error('화난 돼지 싸움 실패');
        { const h0 = p2.hp; scene = 'fight'; for (let n = 0; n < 60; n++) worldFightTick(); if (!(p2.hp < h0)) throw new Error('출혈 실패'); draw(); p1.wins = 1; afterRound(); if (scene !== 'butcher') throw new Error('화난 돼지 잡고 해체 실패'); BT.done = true; BT.endT = 40; pressed.Enter = true; updateButcher(); delete pressed.Enter; if (scene !== 'snipe') throw new Error('화난 돼지 뒤 저격장으로 안 돌아감'); SN = null; scene = 'lobby'; }
        startSnipe(); for (let i = 0; i < 3; i++) { SN.cx = 30; SN.cy = 170; snipeFire(); } if (!SN.done || SN.hit) throw new Error('저격 3발 다 빗나감 처리 실패'); SN = null; lobbyBack();
        lsSet('sgf_w2meat', { sam: 20, mok: 20, hang: 20 }); openStall(); if (scene !== 'wstory') throw new Error('포장마차 이야기 실패'); for (let n = 0; n < 6 && scene === 'wstory'; n++) { pressed.Enter = true; updateWStory(); delete pressed.Enter; } draw();
        if (scene !== 'stall') throw new Error('포장마차 화면 실패'); stallAct(); POPQ.length = 0; POP = null; out.push(`stall: stage=${w2Stage()} meat=${JSON.stringify(w2Meat())}`); if (w2Stage() !== 1 || w2Meat().sam !== 16) throw new Error('납품 실패'); draw();
        lsSet('sgf_w2', 5); openStall(); draw(); const c0 = coins; stallAct(); if (!(coins > c0) || w2Meat().sam !== 0) throw new Error('클리어 뒤 고기 팔기 실패');
        { const K3 = ['sgf_coin_w3', 'sgf_debt_w3', 'sgf_bank_w3', 'sgf_debtbase_w3', 'sgf_fridge_w3', 'sgf_w3intro', 'sgf_w3chap', 'sgf_w3clear', 'sgf_tp_w3', 'sgf_rbest_w3', 'sgf_ranked_w3', 'sgf_rank_w3', 'sgf_promo_w3', 'sgf_tycoon_w3']; const hist1 = tyU.hist; tyU.hist = [4e12, 4e12]; saveTyU(); K3.forEach(k => localStorage.removeItem(k)); const c1 = coins, d1 = debt, tp1 = tp; tp = 777; lsSet('sgf_tp', 777);
          setWorld(3); out.push(`w3: coins=${coins} debt=${debt} menu=${MENU.includes(W3_MENU)}`); if (WORLD !== 3 || coins !== 1000 || debt !== W3_DEBT || !MENU.includes(W3_MENU)) throw new Error('월드3 지갑 시작 실패');
          if (tp !== 0 || !rankMine('w3uabc') || rankMine('uabc')) throw new Error('월드3 랭크 분리 실패');
          out.push(`w3 reward base: ${rwBase()} hist=${(tyU.hist || []).length}`); if (rwBase() > 1000 || (tyU.hist || []).length) throw new Error('월드3에 월드1 장사 기록이 섞여 보상이 큼'); tp = 300; lsSet('sgf_tp', 300); scene = 'ranking'; draw(); scene = 'title';
          addCoins(500); if (lsGet('sgf_coin', 0) !== 1500 || JSON.parse(localStorage.getItem('sgf_coin')) !== c1) throw new Error('월드3 돈이 월드1과 섞임');
          if (w3Txt('🪙 100 코인 · 돼지코인 · 사채') !== '💵 100 달러 · 돼지코인 · 증권사 빚') throw new Error('월드3 화폐 표시 실패');
          scene = 'title'; draw(); startStory('w3intro', 'title'); for (let n = 0; n < 4; n++) draw(); openStock(); draw(); scene = 'title';
          debt = 0; bankDebt = 0; w3Chapters(); if (!lsGet('sgf_w3chap', []).includes('w3ch1')) throw new Error('월드3 이야기 실패'); scene = 'title';
          coins = 0; debt = 5; lsSet('sgf_w3chap', ['w3ch1', 'w3ch2', 'w3ch3']); w3Chapters(); if (coins !== 1000 || debt !== W3_DEBT) throw new Error('월드3 파산 처음부터 실패'); scene = 'title';
          worldGo(0); if ((tyU.hist || [])[0] !== 4e12) throw new Error('월드1 장사 기록이 사라짐'); tyU.hist = hist1; saveTyU(); if (tp !== 777 || rankMine('w3uabc') || lsGet('sgf_tp', 0) !== 777) throw new Error('월드1 랭크가 월드3에 섞임'); tp = tp1; lsSet('sgf_tp', tp1); if (WORLD !== 1 || coins !== c1 || debt !== d1 || MENU.includes(W3_MENU)) throw new Error('월드1로 돌아가기 실패'); out.push('w3 -> w1 OK coins=' + coins);
          K3.forEach(k => localStorage.removeItem(k)); scene = 'title'; }
        lsSet('sgf_w2', w2s); if (w2m) lsSet('sgf_w2meat', w2m); else localStorage.removeItem('sgf_w2meat'); mode = 1;
        const cnt = {}; for (let i = 0; i < 10000; i++) { const k = stockRoll(i / 10000).k; cnt[k] = (cnt[k] || 0) + 1; } out.push('stock odds: ' + JSON.stringify(cnt));
        if (cnt.jackpot !== 100 || cnt.up !== 1000 || cnt.meh !== 2000 || cnt.down !== 2900 || cnt.delist !== 4000) throw new Error('주식 확률 실패');
        coins = 1000; openStock(); draw(); SK.amt = 1; stockBuy(); if (coins !== 750) throw new Error('주식 투자 실패'); for (let n = 0; n < 160; n++) { updateStock(); if (n % 50 === 0) draw(); } draw(); out.push(`stock: ${SK.res.k} pay=${SK.pay} coins=${coins}`); if (SK.phase !== 'result' || coins !== 750 + SK.pay) throw new Error('주식 결과 실패');
        const XQ = QUESTS.find(q => q.key === 'sgf_q_xmas'); if (!XQ || XQ.steps.length !== 4) throw new Error('크리스마스 퀘스트 없음');
        const sa = CHARS.find(c => c.name === '산타돈'), nu = CHARS.find(c => c.name === '눈꽃돈'); if (sa.buy || nu.buy || sa.relId !== 'xmas') throw new Error('크리스마스 돼지가 아직 코인으로 팔림');
        ['sgf_unlock_산타돈', 'sgf_unlock_눈꽃돈', 'sgf_xmas_got'].forEach(k => localStorage.removeItem(k)); if (isUnlocked(sa) && !xmasOpen()) throw new Error('크리스마스 돼지가 그냥 열림');
        qGrant(XQ, ''); POPQ.length = 0; POP = null; if (!isUnlocked(sa) || !isUnlocked(nu)) throw new Error('크리스마스 퀘스트 보상(둘 다) 실패'); out.push('xmas reward: 산타돈+눈꽃돈 OK');
        ['sgf_unlock_산타돈', 'sgf_unlock_눈꽃돈', 'sgf_xmas_got'].forEach(k => localStorage.removeItem(k)); scene = 'title'; draw(); }
      { mode = 0; p1.setChar(IT); p2.setChar(CHARS[0]); startMatch(); for (let n = 0; n < 130 && scene !== 'fight'; n++) step(); applyItForm(p1, 'modulo'); p1.facing = -1; p1.curseT = 600; p1.inp = { right: true }; const cs = pickSkill(p1).type; p1.inp = { left: true }; if (pickSkill(p1).type !== 'bloodShot') throw new Error('왼쪽+U 세 번째 스킬 실패'); out.push(`it skill3: ${cs}`); if (cs !== 'bloodShot') throw new Error('피의 관통탄 실패');
        p1.x = 420; p2.x = 540; p2.state = 'idle'; const h0 = p2.hp; dealHit(p1, p2, { dmg: 5, kind: 'punch', src: p1.x, height: 'mid', stun: 20 }); for (let n = 0; n < 10; n++) step(); out.push(`arm extra: ${(h0 - p2.hp).toFixed(1)}`); if (!(h0 - p2.hp > 5.5)) throw new Error('팔 한 번 더 실패');
        p2.hp = p2.maxHp; p2.state = 'idle'; p1.state = 'idle'; p1.meter = 100; const h1 = p2.hp; startUlt(p1); for (let n = 0; n < IT_CUT + 120 && scene === 'fight'; n++) { step(); if (n % 30 === 0) draw(); } out.push(`dismantle: type=${p1.ch.ult.type} dmg=${(h1 - p2.hp).toFixed(1)}`); if (p1.ch.ult.type !== 'dismantle' || !(h1 - p2.hp > 20 || scene !== 'fight')) throw new Error('베어 가르기 실패'); }
      { mode = 0; p1.setChar(CHARS.find(c => c.name === '돼타로')); p2.setChar(CHARS[0]); startMatch(); for (let n = 0; n < 130 && scene !== 'fight'; n++) step(); p1.meter = 100; p1.state = 'idle'; startUlt(p1); step(); step(); const sf0 = superFreeze; pressed.Enter = true; step(); out.push(`cut skip: ${sf0} -> ${superFreeze}`); if (!(sf0 > 10) || superFreeze > 1) throw new Error('컷신 건너뛰기 실패'); for (let n = 0; n < 30; n++) step(); out.push(`stand auto: ${p1.standOn}`); if (!p1.standOn) throw new Error('필살기 스탠드 자동 소환 실패'); }
      { const t0 = IS_TESTER; IS_TESTER = true; lsSet('sgf_trailer2', true); openCutList(); playCut(0); const sc1 = scene; for (let n = 0; n < TRAILER_T + 10 && scene === 'trailer'; n++) step(); out.push(`cutlist trailer: ${sc1} -> ${scene}`); if (sc1 !== 'trailer' || scene !== 'cutlist') throw new Error('예고편 다시 보기 실패');
        for (const i of [5, 6, 7, 8, 9, 10]) { playCut(i); let fr = 0; while (CL.playing && fr < 400) { step(); if (fr % 20 === 0) draw(); fr++; } if (CL.playing) throw new Error('컷신 다시 보기 안 끝남: ' + CUTS[i].name); } out.push('cut replays OK'); IS_TESTER = t0; scene = 'title'; POPQ.length = 0; POP = null; }
      { lsSet('sgf_tut_done', false); const c0 = coins; startTutorial(); for (let n = 0; n < 200 && scene !== 'fight'; n++) step(); for (let n = 0; n < 30; n++) step(); pressed.Enter = true; step(); const i1 = tut.i; keys[MAP1.right] = true; for (let n = 0; n < 120 && tut.i === i1; n++) { step(); if (n % 30 === 0) draw(); } keys[MAP1.right] = false; out.push(`tutorial: move step ${i1} -> ${tut.i}`); if (tut.i <= i1) throw new Error('튜토리얼 움직이기 실패');
        for (let k = 0; k < 40 && mode === 5; k++) { for (let n = 0; n < 30; n++) step(); draw(); if (TUT[tut.i] && TUT[tut.i].tap) pressed.Enter = true; else pressed.Tab = true; step(); }
        for (let k = 0; k < 30 && tut.tour >= 0; k++) { for (let n = 0; n < 15; n++) step(); draw(); pressed.Enter = true; step(); }   // 2부: 화면 둘러보기
        out.push(`tutorial end: scene=${scene} mode=${mode} coins+${coins - c0} done=${lsGet('sgf_tut_done', false)}`); if (mode === 5 || !lsGet('sgf_tut_done', false) || coins - c0 < 5000) throw new Error('튜토리얼 끝내기 실패'); POPQ.length = 0; POP = null; }
      { lsSet('sgf_awake', { '이타돼리': { done: true } }); localStorage.removeItem('sgf_itsuk'); lsSet('sgf_itform', 'base'); if (itForm() !== 'sukuna') throw new Error('각성 뒤 스쿠나 자동 전환 실패'); lsSet('sgf_itform', 'base'); mode = 1; ranked = false; p1.setChar(IT); p2.setChar(CHARS[0]); startMatch(); out.push(`form base: awk=${p1.awk} form=${p1.itForm}`); if (p1.awk || p1.itForm !== 'base') throw new Error('기본 모습 실패'); lsSet('sgf_itform', 'sukuna'); startMatch(); out.push(`form sukuna: awk=${p1.awk} sukuna=${p1.sukuna} ult=${p1.ch.ult.type} skill=${p1.ch.skills[0].type}`); if (!p1.awk || !p1.sukuna || p1.ch.ult.type !== 'curseKing') throw new Error('스쿠나 모습 실패'); lsSet('sgf_itform', 'modulo'); lsSet('sgf_itmodulo', true); startMatch(); out.push('modulo removed: form=' + p1.itForm); if (p1.itForm === 'modulo') throw new Error('모듈로 모습이 남아 있음'); lsSet('sgf_itform', 'base'); localStorage.removeItem('sgf_itmodulo'); lsSet('sgf_awake', {}); }
      { lsSet('sgf_awake', {}); const A = AWAKE['이타돼리']; for (const st of A.steps) for (let k = 0; k < st.goal; k++) awkAdd('이타돼리', st.id, st.id === 'streak' ? k + 1 : 1, st.id === 'streak'); out.push(`awake: ${isAwake('이타돼리')}`); if (!isAwake('이타돼리')) throw new Error('각성 실패');
        mode = 0; p1.setChar(IT); p2.setChar(CHARS[0]); startMatch(); const d0 = p1.dmgMul('punch'); p1.awk = true; const d1 = p1.dmgMul('punch'); out.push(`awake dmg ${d0.toFixed(2)} -> ${d1.toFixed(2)}`); if (!(d1 > d0)) throw new Error('각성 공격력 실패'); for (let n = 0; n < 130; n++) step(); draw(); lsSet('sgf_awake', {}); POPQ.length = 0; POP = null; showAwake(); POPQ.length = 0; }
      { const CB = CHARS.find(c => c.name === '캡틴베이컨'); mode = 0; p1.setChar(CB); p2.setChar(CHARS[0]); startMatch(); for (let n = 0; n < 130 && scene !== 'fight'; n++) step(); p1.x = 300; p2.x = 560; p1.facing = 1; p2.facing = -1; p1.state = 'idle'; p2.state = 'idle'; p1.inp = { down: true }; startSkill(p1, false); const d0 = p2.x - p1.x; for (let n = 0; n < 40; n++) { p2.inp = {}; step(); } const d1 = p2.x - p1.x; out.push('pull: ' + (d0 | 0) + ' -> ' + (d1 | 0)); if (!(d1 < 170)) throw new Error('갈고리 끌어오기 실패'); }
      { mode = 6; ranked = false; p1.setChar(CHARS[0]); p2.setChar(CHARS[1]); startMatch(); for (let n = 0; n < 160 && scene !== 'fight'; n++) step(); const tm = timer, x2 = p2.x; p2.hp = 3; const r = dealHit(p1, p2, { dmg: 10, kind: 'punch', src: p1.x, height: 'mid', stun: 16 }); for (let n = 0; n < 200; n++) step(); out.push('practice: scene=' + scene + ' hp=' + p2.hp.toFixed(0) + ' timer=' + tm + '->' + timer + ' moved=' + Math.abs(p2.x - x2).toFixed(0) + ' meter=' + p1.meter); if (scene !== 'fight' || timer !== tm || !(p2.hp > 50) || p1.meter < 100) throw new Error('연습 모드 실패'); pressed.Escape = true; step(); out.push('practice exit: ' + scene); if (scene !== 'title') throw new Error('연습 모드 나가기 실패'); mode = 1; }
      { lsSet('sgf_awake', { '이타돼리': { win: 99, bolt: 99, ultko: 99, lose: 99, streak: 99, perfect: 99 } }); POPQ.length = 0; questCheckAll(); out.push('awake recheck: ' + isAwake('이타돼리')); if (!isAwake('이타돼리')) throw new Error('이미 채운 각성 조건 실패'); lsSet('sgf_awake', {}); POPQ.length = 0; POP = null; }
      { const IQd = QUESTS.find(q => q.key === 'sgf_q_it'); localStorage.removeItem('sgf_unlock_이타돼리'); lsSet(IQd.key, { ranked: 9, ultko: 4, streak: 5, clear: 2 }); POPQ.length = 0; questCheckAll(); out.push('quest recheck: itadori=' + lsGet('sgf_unlock_이타돼리', false)); if (!lsGet('sgf_unlock_이타돼리', false)) throw new Error('이미 채운 퀘스트 해금 실패'); POPQ.length = 0; POP = null; }
      { const HK = CHARS.find(c => c.name === '합기돈'); mode = 0; p1.setChar(HK); p2.setChar(CHARS[0]); startMatch(); for (let n = 0; n < 130 && scene !== 'fight'; n++) step(); p1.x = 400; p2.x = 520; p1.facing = 1; p2.facing = -1; p1.state = 'idle'; p2.state = 'idle'; p1.parryT = 45; const h1 = p1.hp, h2 = p2.hp, r = dealHit(p2, p1, { dmg: 6, kind: 'punch', src: p2.x, height: 'mid', stun: 16 }); out.push('parry: ' + r + ' me=' + (h1 - p1.hp).toFixed(1) + ' opp=' + (h2 - p2.hp).toFixed(1) + ' side=' + (p2.x < p1.x)); if (r !== 'block' || p1.hp !== h1 || !(p2.hp < h2) || !(p2.x < p1.x)) throw new Error('흘려 받기 실패'); }
      { coins = 1e9; openMarket(); mk.tab = 1; mk.sel = SHOP.findIndex(x => x.id === 'meter'); openQty(mk.sel); hot = []; draw(); const tap = (x, y) => { const r = cv.getBoundingClientRect(); cv.dispatchEvent(new PointerEvent('pointerdown', { clientX: r.left + x * r.width / W, clientY: r.top + y * r.height / H, bubbles: true })); }; const m0 = inv.use.meter || 0; tap(W / 2 - 230 + 22 + 3 * 86 + 30, 130 + 158); if (qm.n !== 11) throw new Error('터치 +10 실패 n=' + qm.n); tap(W / 2 - 230 + 150, 130 + 238); out.push('touch qty: ' + m0 + ' -> ' + inv.use.meter); if (inv.use.meter !== m0 + 11 || qm) throw new Error('터치 사기 실패'); }
      { POPQ.length = 0; POP = null; openPigs(); PG.sel = 0; PG.free = 0; draw(); cv.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, cancelable: true })); step(); draw(); const f1 = PG.free; cv.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, cancelable: true })); step(); draw(); out.push(`wheel pigs: scroll 0 -> ${f1.toFixed(2)} -> ${PG.free.toFixed(2)} · sel ${PG.sel}`); if (!(f1 > 0) || PG.free > 0.01 || PG.sel !== 0) throw new Error('휠 스크롤 실패'); toTitle(); }
      { coins = 1e7; openMarket(); mk.tab = 1; mk.sel = SHOP.findIndex(x => x.id === 'meter'); const m0 = inv.use.meter || 0; pressed.Enter = true; step(); if (!qm) throw new Error('수량 창이 안 열림'); pressed.ArrowUp = true; step(); pressed.ArrowRight = true; step(); draw(); pressed.Enter = true; step(); out.push(`qty buy: meter ${m0} -> ${inv.use.meter} qm=${!!qm}`); if (inv.use.meter !== m0 + 12 || qm) throw new Error('수량 사기 실패'); scene = 'title'; }
      { coins = 1e10; const c0 = CHARS[0], l0 = pigLv(c0.name); upgradePig(c0); upgradePig(c0); out.push(`pig lv: ${l0} -> ${pigLv(c0.name)} coins=${fmtN(coins)}`); if (pigLv(c0.name) !== l0 + 2) throw new Error('돼지 강화 실패'); mode = 1; ranked = false; p1.setChar(c0); p2.setChar(CHARS[1]); startMatch(); out.push(`lvMul=${p1.lvMul}`); if (!(p1.lvMul > 1)) throw new Error('강화 적용 실패'); lsSet('sgf_piglv', {}); openPigs(); for (let n = 0; n < 5; n++) { pressed.KeyD = true; step(); draw(); } scene = 'title';
        for (const k in inv.own) if (k.startsWith('ps:')) delete inv.own[k]; const own0 = 0; coins = 1e18; shopAct(SHOP.findIndex(x => x.id === 'skinBox10')); const own1 = Object.keys(inv.own).filter(k => k.startsWith('ps:')).length; out.push(`skin box: skins ${own0} -> ${own1}`); if (own1 <= own0 && own0 < 10) throw new Error('스킨 상자 실패'); POPQ.length = 0; POP = null;
        delete inv.own.ttRich; if (inv.eq) inv.eq.title = null; coins = 1e10;
        shopAct(SHOP.findIndex(x => x.id === 'ttRich')); out.push(`title: ${titleName()}`); if (titleName() !== '💰 졸부') throw new Error('칭호 실패'); draw(); scene = 'title'; draw(); shopAct(SHOP.findIndex(x => x.id === 'ttRich')); }
      { const c = CHARS.find(x => x.name === '돼타로'), sk = pigSkins(c), yg = pigSkins(CHARS.find(x => x.name === '야구돈')); out.push(`skins: 돼타로 ${sk.length} · 야구돈 ${yg.map(x => x.name).join(', ')}`); if (sk.length || yg.length !== 4 || !yg.every(x => x.team)) throw new Error('스킨 정리(야구돈 유니폼 4개만) 실패');
        { const sh = CHARS.find(x => x.name === '그림자돈'); mode = 0; p1.setChar(sh); p2.setChar(CHARS[0]); startMatch(); for (let n = 0; n < 130 && scene !== 'fight'; n++) step(); p1.state = 'idle';
          const tryS = t => { p1.state = 'idle'; p1.skillCD = 0; startAtk(p1, 'skill', { ...SKILLDEF[t], skill: true, skType: t }); const r = wpnShown(p1); draw(); p1.state = 'idle'; p1.atk = null; return r; };
          const star = tryS('xShStar'), iai = tryS('xShIai'), chain = (p1.setChar(CHARS.find(x => x.name === '악마돈')), tryS('xDvChain')); out.push(`wpn shown: 수리검 ${star} · 발도술 ${iai} · 사슬 ${chain}`); if (star || !iai || chain) throw new Error('무기 안 쓰는 스킬에 무기가 나옴');
          openPigs(); const s0 = PG.sel; draw(); FREE_SCROLL.pigs(300); draw(); out.push('free scroll pigs: ' + PG.free.toFixed(2)); if (!(PG.free > 0) || PG.sel !== s0) throw new Error('도감 자유 스크롤 실패'); scene = 'title'; }
        { const yc = CHARS.find(x => x.name === '야구돈'); for (const k in inv.own) if (k.startsWith('ps:야구돈')) delete inv.own[k]; inv.own['ps:야구돈:tigers'] = true; inv.pskin = {}; cyclePigSkin(yc); out.push(`skin eq: ${pigSkinEq(yc) && pigSkinEq(yc).name}`); if (!pigSkinEq(yc) || pigSkinEq(yc).key !== 'tigers') throw new Error('야구돈 유니폼 장착 실패'); withCos(yc); } if (withCos(CHARS[0]).look.body !== CHARS[0].look.body) throw new Error('다른 돼지에 스킨이 묻음');
        mode = 0; p1.setChar(withCos(c)); p2.setChar(CHARS[1]); startMatch(); for (let n = 0; n < 130 && scene !== 'fight'; n++) step(); p1.x = 420; p2.x = 520; dealHit(p1, p2, { dmg: 10, kind: 'punch', src: p1.x, height: 'mid', stun: 10 }); draw(); openPigs(); PG.sel = CHARS.indexOf(c); draw(); inv.own.skHell = true; inv.skinRefund = false; const cc = coins; refundOldSkins(); if (coins - cc !== 1e6 || inv.own.skHell) throw new Error('공용 스킨 환급 실패'); inv.pskin = {}; scene = 'title'; }
      localStorage.removeItem('sgf_unlock_볼트돈'); RWS.slots = wheelSlots(); RWS.res = RWS.slots.findIndex(x => x.k === 'char'); wheelDone(); out.push(`wheel char: slot=${RWS.res} unlocked=${isUnlocked(DV)}`); if (RWS.res < 0 || !isUnlocked(DV)) throw new Error('룰렛 볼트돈 실패'); localStorage.removeItem('sgf_unlock_볼트돈'); POPQ.length = 0; POP = null;
      localStorage.removeItem('sgf_unlock_볼트돈'); RW.pity = PITY_N - 1; RW.bonus = 5; RWS.t = -1; spinWheel(); const pk = RWS.slots[RWS.res].k; for (let n = 0; n < RWS.T + 2; n++) updateReward(); out.push(`pity: res=${pk} pity=${RW.pity} unlocked=${isUnlocked(DV)}`); if (pk !== 'char' || !isUnlocked(DV)) throw new Error('200번 확정 실패'); localStorage.removeItem('sgf_unlock_볼트돈');
      inv.use.fastSpin = 1; spinWheel(); out.push(`fast spin T=${RWS.T}`); if (RWS.T !== 45) throw new Error('빠른 룰렛 실패'); for (let n = 0; n < 50; n++) updateReward(); inv.use.fastSpin = 0; POPQ.length = 0; showOdds(); out.push(`odds: ${POPQ[0].lines.length} lines`); POPQ.length = 0; POP = null;
      RW.bonus = 0; RW.spinDay = dayKey(); RW.spins = 9; coins = 1e6; const c1 = coins; spinWheel(); out.push(`ticket buy: tix=${RW.bonus} coins-${c1 - coins}`); if (RW.bonus !== 1) throw new Error('티켓 사기 실패');
      mode = 1; scene = 'title'; }
    // 🛒 비싼 물건 · 🏙️ 체인점별 강화 · ⚖️ 밸런스 · ⌨️ 키 설정 · 🎁 돼지/아이템 선물
    { coins = 1e9; for (const id of ['bigRevive', 'rankShield', 'fullMeter', 'luckyCharm', 'tix10']) shopAct(SHOP.findIndex(s => s.id === id));
      out.push(`shop2: use=${JSON.stringify(inv.use)} tix=${RW.bonus}`); if (!inv.use.bigRevive || !inv.use.luckyCharm) throw new Error('비싼 물건 구매 실패');
      openMarket(); mk.tab = 1; draw();
      mode = 1; ranked = true; tp = 500; bet = 100; coins = 1000; p1.setChar(CHARS[0]); p2.setChar(CHARS[1]); startMatch(); for (let n = 0; n < 130 && scene !== 'fight'; n++) step();
      runOver = false; const tp0 = tp, br0 = inv.use.bigRevive, c0 = coins; RV.choice = 'big'; startCutscene(p2, p1); RV.choice = 'none'; out.push(`bigRevive: tp ${tp0}->${tp} coins+${coins - c0} left=${inv.use.bigRevive} runOver=${runOver}`);
      if (tp !== tp0 || inv.use.bigRevive !== br0 - 1 || runOver || coins - c0 !== 100) throw new Error('대형 부활권 실패'); ranked = false; lsSet('sgf_rkpending', false);
      for (const pickN of [1, 2]) { inv.use.bigRevive = 0; inv.use.revive = 1; runOver = false; ranked = false; mode = 1; p1.setChar(CHARS[0]); p2.setChar(CHARS[1]); startMatch(); for (let n = 0; n < 130 && scene !== 'fight'; n++) step(); p2.wins = 2; afterRound(); const sc0 = scene; draw(); for (let n = 0; n < 25; n++) step(); pressed['Digit' + pickN] = true; step(); out.push(`revive pick${pickN}: ${sc0}->${scene} revived=${!!cut.revived} left=${inv.use.revive} runOver=${runOver}`); if (sc0 !== 'revive' || scene !== 'cutscene' || (pickN === 1) !== !!cut.revived) throw new Error('부활권 고르기 실패'); }
      tyU = TYU0(); tyU.chain = 3; tyU.chains = ['강남', '홍대', '판교']; coins = 1e12; openTycoon(); TY.sel = TY_UP.findIndex(u => u.id === 'branch') + 1; pressed.Enter = true; step(); out.push(`branch: phase=${TY.phase}`); if (TY.phase !== 'branch') throw new Error('체인점별 강화 화면 실패');
      for (let k = 0; k < 3; k++) { TY.bsel = k; pressed.Enter = true; step(); } draw(); pressed.Escape = true; step(); draw();
      out.push(`branch lv: ${JSON.stringify(tyU.br)} income=${brIncome().toFixed(2)} vip=${brSum('vip')} wage=${brSum('wage')} tip=${brSum('tip')}`); if (brSum('vip') !== 1 || brSum('wage') !== 1 || TY.phase !== 'lobby') throw new Error('체인점별 강화 실패');
      for (const u of TY_UP) tyBuy(u); out.push(`ty up2: sauce=${tyU.sauce} neon=${tyU.neon} brand=${tyU.brand}`); tyU = TYU0(); saveTyU(); scene = 'title';
      const hp0 = CHARS[0].hp; applyBal({ v: 5, c: { [CHARS[0].name]: { hp: 150, cd: 50 } } }); out.push(`bal: hp ${hp0}->${CHARS[0].hp} cd=${CHARS[0].skill.cd}`); if (CHARS[0].hp !== Math.round(hp0 * 1.5)) throw new Error('밸런스 패치 실패'); applyBal({ v: 6, c: {} }); if (CHARS[0].hp !== hp0) throw new Error('밸런스 되돌리기 실패');
      openKeys(); KS.sel = 9; pressed.Enter = true; step(); pressed.KeyQ = true; step(); out.push(`keys: skill=${MAP1.skill}`); if (MAP1.skill !== 'KeyQ') throw new Error('키 설정 실패'); draw(); pressed.Backspace = true; step(); if (MAP1.skill !== 'KeyU') throw new Error('키 되돌리기 실패'); pressed.Escape = true; step();
      localStorage.removeItem('sgf_unlock_돼루토'); const rv = inv.use.rankShield || 0; GIFT = { id: Date.now() + 5, coins: 0, spins: 0, items: 0, item: 'rankShield', itemN: 2, char: '돼루토', until: 0 }; claimGift();
      out.push(`gift2: shield ${rv}->${inv.use.rankShield} naruto=${isUnlocked(CHARS.find(c => c.name === '돼루토'))}`); if (inv.use.rankShield !== rv + 2 || !lsGet('sgf_unlock_돼루토', false)) throw new Error('돼지·아이템 선물 실패'); localStorage.removeItem('sgf_unlock_돼루토'); POPQ.length = 0; POP = null; scene = 'title'; mode = 1; }
    // 🔄 새로고침 없이 계정 기록 반영 (관리자 수정 흉내)
    { const s = collectSave(); s.sgf_coin = '777777'; s.sgf_tp = '1234'; s.sgf_reward = JSON.stringify({ bonus: 3 }); scene = 'fight';
      remoteSave({ save: s, saved: Date.now() }); out.push(`live apply: coins=${coins} tp=${tp} bonus=${RW.bonus} pending=${!!pendingSave}`);
      if (coins !== 777777 || tp !== 1234 || RW.bonus !== 3 || pendingSave) throw new Error('새로고침 없이 반영 실패'); scene = 'title'; }
    // 🎁 보상 센터: 출석 · 룰렛 · 미션 · 선물 · 잭팟 · 팝업
    { RW = RW0(); rwSave(); coins = 1000; const c0 = coins; openReward(); out.push(`attend: day=${RW.day} att=${RW.att} coins+${coins - c0} popq=${POPQ.length}`);
      if (RW.att !== 1 || coins - c0 !== rwBase()) throw new Error('출석 실패');
      for (let n = 0; n < 40; n++) { step(); draw(); } pressed.Enter = true; step(); draw(); if (POP) throw new Error('팝업이 안 닫힘');
      RW.day = dayKey(Date.now() - 86400000); RW.att = 6; claimAttendance(); if (RW.att !== 7) throw new Error('7일 출석 실패'); POPQ.length = 0; POP = null;
      const f0 = spinFree(); let got = {}; for (let k = 0; k < 60; k++) { coins = 1e6; RW.bonus = Math.max(RW.bonus, 1); if (!spinWheel()) throw new Error('룰렛 실패'); for (let n = 0; n < RWS.T + 2; n++) { updateReward(); } got[RWS.slots[RWS.res].t] = (got[RWS.slots[RWS.res].t] || 0) + 1; POPQ.length = 0; }
      draw(); out.push(`wheel: free0=${f0} free=${spinFree()} res=${JSON.stringify(got)}`);
      const ms = rwMissions(); for (const m of ms) rwProgress(m.id, 9); const b0 = coins; for (let i = 0; i < 3; i++) claimMission(i);
      out.push(`missions: ${ms.map(m => m.id + m.n + '/' + m.goal + (m.got ? '✔' : '')).join(',')} all=${RW.mAll} coins+${coins - b0}`);
      if (!RW.mAll || !ms.every(m => m.got)) throw new Error('미션 실패');
      GIFT = { id: Date.now(), coins: 5000, spins: 2, items: 1, msg: '테스트 선물', until: Date.now() + 3600000 }; const g0 = coins; claimGift(); claimGift();
      out.push(`gift: coins+${coins - g0} rev=${inv.use.revive}`); if (coins - g0 !== 5000) throw new Error('선물 실패 (두 번 받거나 못 받음)');
      EVT = { coin: 3, tp: 2, ty: 5, jackpot: 50, spins: 2, luck: true, daily: true, msg: '테스트', until: Date.now() + 3600000, id: 1 };
      let jp = 0; for (let k = 0; k < 200; k++) jp += jackpotRoll(100) ? 1 : 0;
      out.push(`event: ${evText()} coinMul=${evMul('coin')} jackpot=${jp}/200`); if (evMul('coin') !== 3 || evMul('ty') !== 5 || jp < 60 || jp > 140) throw new Error('이벤트 배수/잭팟 실패');
      EVT = { coin2x: true, until: 0 }; if (evMul('coin') !== 2 || !evOn('coin2x')) throw new Error('옛 이벤트 모양 실패'); EVT = null;
      POPQ.length = 0; POP = null; scene = 'title'; MENU.forEach((m, i) => { titleSel = i; }); draw(); }



    out.push('AUTOTEST PASS');
  } catch (e) { out.push('ERROR: ' + e.message + '\n' + e.stack); }
  console.log('ATRESULT ' + out.join(' | '));
  const pre = document.createElement('pre'); pre.id = 'r'; pre.textContent = out.join('\n'); document.body.appendChild(pre);
  toTitle();
}

