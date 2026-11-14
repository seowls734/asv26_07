// ================= 🐷 돼지 도감 · 강화 (돈 쓰는 곳) =================
// 돼지마다 Lv.0~10: 한 단계마다 체력·공격력 +3% (연승 모드·랭크전 등 혼자 하는 판에서만, 온라인 1:1은 공평하게 그대로)
// 비용: 50만 × 2.3^레벨 (Lv.10까지 돼지 하나에 약 13억)
const PIG_MAX = 30, PIG_TR = 10, PIG_TR2 = 20;   // Lv.11~20은 초월 (단계마다 +2%)
const pigMul = lv => 1 + 0.03 * Math.min(lv, PIG_TR) + 0.02 * Math.max(0, Math.min(lv, PIG_TR2) - PIG_TR) + 0.01 * Math.max(0, lv - PIG_TR2);
const pigLvAll = () => lsGet('sgf_piglv', {});
const pigLv = name => +(pigLvAll()[name] || 0);
const pigCost = lv => Math.round(500000 * 2.3 ** lv * 4 ** Math.max(0, lv - 19) / 1000) * 1000;   // Lv.20부터는 단계마다 4배 더 비쌈
function upgradePig(c) {
  if (!isUnlocked(c)) { SFX.block(); toast(`🔒 ${c.name}: 먼저 얻어야 강화할 수 있어요`); return; }
  const lv = pigLv(c.name); if (lv >= PIG_MAX) { SFX.block(); toast('이미 최고 레벨이에요'); return; }
  const cost = pigCost(lv); if (coins < cost) { SFX.block(); toast(`코인이 부족해요 (${fmtN(cost)} 필요)`); return; }
  addCoins(-cost); const all = pigLvAll(); all[c.name] = lv + 1; lsSet('sgf_piglv', all); cloudDirty();
  SFX.coin(); burst(760, 200, 30, ['#ffd740', '#fff'], 10);
  if (lv + 1 === PIG_MAX) popup({ icon: '🌌', title: `${c.name} 초월 완료!!`, lines: [`Lv.${PIG_MAX} · 체력·공격력 +${Math.round((pigMul(PIG_MAX) - 1) * 100)}%`], big: true });
  else if (lv + 1 === PIG_TR) popup({ icon: '🌟', title: `${c.name} Lv.10!`, lines: ['체력·공격력 +30%', `이제 Lv.${PIG_MAX}까지 초월 강화를 할 수 있어요`], big: true });
  else toast(`🐷 ${c.name} Lv.${lv + 1}! 체력·공격력 +${Math.round((pigMul(lv + 1) - 1) * 100)}%`);
}
// 🪙 업데이트 돼지 사기 · 🎨 스킨 직접 사기 (돈 쓸 곳)
const SKIN_BUY = [1e15, 1e16, 1e17, 1e18];   // 일반 · 희귀 · 영웅 · 전설 스킨 1개 값
function buyPig(c) {
  if (isUnlocked(c) || !c.buy || !isRel(c.relId)) return;
  if (coins < c.buy) { SFX.block(); toast(`코인이 부족해요 (${fmtN(c.buy)} 필요)`); return; }
  addCoins(-c.buy); lsSet('sgf_unlock_' + c.name, true); cloudDirty(); SFX.gong();
  popup({ icon: '🐷', title: `${c.name} 획득!!`, lines: [c.title, '캐릭터 선택에서 고를 수 있어요'], big: true });
}
const nextSkin = c => pigSkins(c).filter(x => skinOn(c, x) && !ownsPigSkin(c, x)).sort((a, b) => a.rare - b.rare)[0];
function buySkin(c) {
  const sk = nextSkin(c); if (!sk) { SFX.block(); toast(`🎨 ${c.name} 스킨을 다 모았어요`); return; }
  const p = SKIN_BUY[sk.rare]; if (coins < p) { SFX.block(); toast(`코인이 부족해요 (${fmtN(p)} 필요)`); return; }
  addCoins(-p); inv.own['ps:' + c.name + ':' + sk.key] = true; inv.pskin = { ...(inv.pskin || {}), [c.name]: sk.key }; saveInv(); cloudDirty(); SFX.coin();
  toast(`🎨 ${sk.name} 구매 · 장착!`);
}
const pigList = () => CHARS.filter(c => (IS_TESTER && isMember()) || !c.relId || isRel(c.relId));   // 도감: 공개된 돼지만 (테스트 계정은 전부)   // 도감: 공개된 돼지만
const PG = { sel: 0 };
function openPigs() { PG.sel = 0; scene = 'pigs'; }
function updatePigs() {
  const PL = pigList(), n = PL.length, cols = 7; PG.sel = Math.min(PG.sel, n - 1);
  if (pressed.KeyA || pressed.ArrowLeft) { PG.sel = (PG.sel + n - 1) % n; SFX.select(); }
  if (pressed.KeyD || pressed.ArrowRight) { PG.sel = (PG.sel + 1) % n; SFX.select(); }
  if (pressed.KeyW || pressed.ArrowUp) { PG.sel = (PG.sel + n - cols) % n; SFX.select(); }
  if (pressed.KeyS || pressed.ArrowDown) { PG.sel = (PG.sel + cols) % n; SFX.select(); }
  if (pressed.Enter || pressed.Space || pressed.KeyI) { const c = PL[PG.sel]; if (!isUnlocked(c) && c.buy && isRel(c.relId)) buyPig(c); else upgradePig(c); }
  if (pressed.KeyE && isUnlocked(PL[PG.sel])) cyclePigSkin(PL[PG.sel]);   // 전용 스킨 바꾸기
  if (pressed.KeyQ && PL[PG.sel].name === '이타돼리' && isUnlocked(PL[PG.sel])) cycleItForm();
  else if (pressed.KeyQ && isAwake(PL[PG.sel].name)) toggleAwake(PL[PG.sel].name);   // 각성 켜기·끄기
  if (pressed.Escape) toTitle();
}
function drawPigs() {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1b1030'); g.addColorStop(1, '#3a1525'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  drawParts();
  txt('🐷 돼지 도감 · 강화', W / 2, 28, 26, '#ffe082', '#000', 7);
  txt(`🪙 ${fmtN(coins)}`, W - 20, 28, 15, '#fff59d', '#000', 4, 'right');
  const PL = pigList(), owned = PL.filter(c => isUnlocked(c)).length;
  txt(`모은 돼지 ${owned}/${PL.length}`, 20, 58, 13, '#ccc', null, 0, 'left');
  // 왼쪽: 돼지 칸 (7 × 3)
  const pgRows = Math.ceil(PL.length / 7), pgMax = Math.max(0, pgRows - 4), selRow = PG.sel / 7 | 0;   // 4줄씩 보임 · 손가락·휠로 자유롭게 밀고, 키보드로 고르면 고른 줄이 보이게
  if (PG.free == null) PG.free = clamp(selRow - 2, 0, pgMax);
  if (PG.lastSel !== PG.sel) { PG.lastSel = PG.sel; if (selRow < PG.free) PG.free = selRow; if (selRow > PG.free + 3) PG.free = selRow - 3; }
  PG.free = clamp(PG.free, 0, pgMax); const pgOff = PG.free;
  PG.offS = PG.offS == null ? pgOff : PG.offS + (pgOff - PG.offS) * 0.22; if (Math.abs(PG.offS - pgOff) < 0.01) PG.offS = pgOff;   // 화면이 고른 줄로 부드럽게 미끄러짐
  if (pgOff > 0) txt('▲', 604, 76, 14, '#ffcc80', '#000', 3); if (pgOff + 4 < pgRows) txt('▼', 604, 512, 14, '#ffcc80', '#000', 3);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 66, 612, 454); ctx.clip();
  PL.forEach((c, i) => {
    const row = (i / 7 | 0) - PG.offS; if (row <= -1 || row >= 4) return;
    const x = 20 + (i % 7) * 84, y = 72 + row * 112, on = PG.sel === i, got = isUnlocked(c), lv = pigLv(c.name);
    const hidden = !shownChar(c) && !got;
    ctx.fillStyle = on ? 'rgba(255,145,0,0.45)' : 'rgba(0,0,0,0.4)'; rr(x, y, 78, 104, 9); ctx.fill();
    if (on) { ctx.strokeStyle = '#ffcc80'; ctx.lineWidth = 2; rr(x, y, 78, 104, 9); ctx.stroke(); }
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, 78, 84); ctx.clip();
    if (hidden) txt('❓', x + 39, y + 44, 30, '#888', null);
    else { if (!got) ctx.filter = 'brightness(0.15)'; drawPig(x + 36, y + 80, 1, (pigSkinEq(c) ? skinLook(c.look, pigSkinEq(c)) : c.look), { scale: 0.42, t: gT + i * 7 }); ctx.filter = 'none'; }
    ctx.restore();
    const nm = hidden ? '???' : c.name;
    txt(nm, x + 39, y + 90, fitSize(nm, 12, 72), got ? '#fff' : '#888', null);
    if (got && lv) txt(`Lv.${lv}`, x + 72, y + 12, 11, lv >= PIG_MAX ? '#ffd740' : '#80d8ff', '#000', 3, 'right');
    if (isAwake(c.name)) txt('⚡', x + 8, y + 12, 12, '#ff1744', null, 0, 'left');
    if (row > -0.5 && row < 3.5) addHot(x, y, 78, 104, () => { if (PG.sel === i) pressed.Enter = true; else PG.sel = i; });
  });
  ctx.restore();
  // 오른쪽: 고른 돼지 자세히
  const c = PL[PG.sel], got = isUnlocked(c), hidden = !shownChar(c) && !got, lv = pigLv(c.name), x0 = 616;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(x0, 60, 330, 440, 12); ctx.fill();
  if (hidden) { txt('???', x0 + 165, 120, 28, '#888', null); txt('아직 비밀인 돼지예요', x0 + 165, 160, 14, '#aaa', null); }
  else {
    txt(c.name, x0 + 165, 84, fitSize(c.name, 24, 300), '#fff', '#000', 5);
    txt(`${c.title} · ${c.type}`, x0 + 165, 110, fitSize(`${c.title} · ${c.type}`, 13, 310), '#ffcc80', null);
    txt(got ? '✅ 보유' : `🔒 ${c.how || (c.unlock != null ? `랭크전 ${TIERS[c.unlock] ? TIERS[c.unlock][0] : ''} 티어 달성` : '')}`, x0 + 165, 132, fitSize(got ? '보유' : (c.how || '잠김'), 12, 310), got ? '#69f0ae' : '#ff8a80', null);
    const sk = c.skills || [c.skill], lines = sk.map((s, i) => `${['U', '↓+U', '←→+U'][i]} ${s.name}`).concat([`필살 ${c.ult.name}`]);
    lines.forEach((l, i) => txt(l, x0 + 16, 160 + i * 22, fitSize(l, 13, 300), i === lines.length - 1 ? '#ffe082' : '#e0e0e0', null, 0, 'left'));
    const hp = Math.round(c.hp * pigMul(lv)), pw = Math.round(c.power * 100 * pigMul(lv));
    txt(`❤️ 체력 ${hp} · 👊 공격력 ${pw}% · 💨 속도 ${Math.round(c.speed * 100)}%`, x0 + 165, 268, fitSize('가'.repeat(26), 13, 310), '#fff', null);
    // 레벨 칸 10개
    for (let k = 0; k < PIG_MAX; k++) { ctx.fillStyle = k < lv ? (lv >= PIG_MAX ? '#ffd740' : k >= PIG_TR2 ? '#ff1744' : k >= PIG_TR ? '#e040fb' : '#29b6f6') : 'rgba(255,255,255,0.12)'; rr(x0 + 20 + k * 9.7, 290, 8, 14, 3); ctx.fill(); }
    txt(`Lv.${lv} / ${PIG_MAX}  (1~10 +3% · 11~20 +2% · 21~30 +1%)`, x0 + 165, 320, 12, '#bbb', null);
    const can = got && lv < PIG_MAX, cost = pigCost(lv), canBuy = !got && c.buy && isRel(c.relId);
    ctx.fillStyle = canBuy ? (coins >= c.buy ? '#f57f17' : '#7f1d1d') : !got ? '#555' : lv >= PIG_MAX ? '#8d6e00' : coins >= cost ? '#2e7d32' : '#7f1d1d'; rr(x0 + 30, 340, 270, 46, 12); ctx.fill();
    const bl = canBuy ? `🪙 ${fmtN(c.buy)}에 사기` : !got ? '🔒 얻어야 강화할 수 있어요' : lv >= PIG_MAX ? '🌌 초월 완료!' : `${lv >= PIG_TR ? '🌌 초월' : '⬆ 강화'}하기 · 🪙 ${fmtN(cost)}`;
    txt(bl, x0 + 165, 363, fitSize(bl, 17, 250), '#fff', '#000', 3);
    if (can) addHot(x0 + 30, 340, 270, 46, () => upgradePig(c)); else if (canBuy) addHot(x0 + 30, 340, 270, 46, () => buyPig(c));
    if (AWAKE[c.name] && c.name !== '이타돼리') { const A = AWAKE[c.name], q = awkOf(c.name), d = A.steps.filter(s => (q[s.id] || 0) >= s.goal).length; txt(isAwake(c.name) ? `⚡ ${A.title}` : `⚡ 각성 조건 ${d}/${A.steps.length} (보상 센터에서 확인)`, x0 + 165, 406, fitSize(A.title + '가가가가', 13, 300), '#ff8a80', null); }
    if (c.name === '이타돼리' && got) { const k = itForm(); ctx.fillStyle = k === 'sukuna' ? '#b71c1c' : k === 'modulo' ? '#455a64' : '#1565c0'; rr(x0 + 40, 418, 250, 32, 9); ctx.fill(); const lb = `👊 모습: ${IT_FORMS[k].name} ▶ (눌러서 바꾸기) [Q]`; txt(lb, x0 + 165, 434, fitSize(lb, 13, 240), '#fff', null); addHot(x0 + 40, 418, 250, 32, () => cycleItForm()); }
    else if (isAwake(c.name)) { const on = !awkOff(c.name); ctx.fillStyle = on ? '#b71c1c' : '#455a64'; rr(x0 + 60, 418, 210, 32, 9); ctx.fill(); txt(on ? '⚡ 각성 ON (눌러서 끄기) [Q]' : '각성 OFF (눌러서 켜기) [Q]', x0 + 165, 434, fitSize('⚡ 각성 ON (눌러서 끄기) [Q]', 13, 200), '#fff', null); addHot(x0 + 60, 418, 210, 32, () => toggleAwake(c.name)); }
    { const sk = pigSkins(c), own = sk.filter(x => ownsPigSkin(c, x)), eq = pigSkinEq(c), nx = null; if (nx) { ctx.fillStyle = coins >= SKIN_BUY[nx.rare] ? '#f57f17' : '#5d4037'; rr(x0 + 214, 454, 96, 26, 8); ctx.fill(); const bt = `🛒 ${fmtN(SKIN_BUY[nx.rare])} [B]`; txt(bt, x0 + 262, 467, fitSize(bt, 12, 90), '#fff', null); addHot(x0 + 214, 454, 96, 26, () => buySkin(c)); } ctx.fillStyle = own.length ? '#6a1b9a' : 'rgba(255,255,255,0.12)'; rr(x0 + 20, 454, nx ? 188 : 290, 26, 8); ctx.fill(); const lb = `🎨 ${eq ? eq.name : '기본'} ▶ (${own.length}/${sk.filter(x => skinOn(c, x)).length}) [E]`; txt(lb, x0 + (nx ? 114 : 165), 467, fitSize(lb, 12, nx ? 180 : 280), '#fff', null); if (got) addHot(x0 + 20, 454, nx ? 188 : 290, 26, () => cyclePigSkin(c)); }   // 돼지 전용 스킨
    txt('강화는 혼자 하는 판(연승·랭크전·CPU)에서만 적용 · 온라인 1:1은 공평하게', x0 + 165, 490, fitSize('가'.repeat(36), 11, 310), '#999', null);
  }
  txt(TOUCH ? '탭해서 고르기 · 한 번 더 탭하면 강화' : 'WASD/방향키 고르기 · Enter 강화 · Esc 나가기', W / 2, 520, 12, '#80d8ff', null);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(14, 8, 90, 30, 8); ctx.fill(); txt('← 나가기', 59, 23, 13, '#fff', null); addHot(14, 8, 90, 30, () => { pressed.Escape = true; });
}
// ================= 🎨 스킨 상자 (뽑기) =================
// 일반 60% · 희귀 24% · 영웅 10% · 전설 6%. 이미 있는 스킨이 나오면 상자 값의 30%를 코인으로 돌려받음
const SKIN_BOX_PRICE = 1e15;   // 스킨 상자 1개 1Qa
// ================= 🎨 돼지마다 다른 스킨 (돼지 하나에 3개씩) =================
// 리컬러(일반): 그 돼지 색을 다른 색조로 · 섀도우(희귀): 그 돼지를 어둡게 · 테마(영웅/전설): 돼지마다 다른 테마
// 가진 스킨: inv.own['ps:돼지:종류'] · 장착: inv.pskin[돼지] = 종류 (예전 공용 스킨을 가졌으면 그 테마는 모든 돼지에서 씀)
const hex2rgb = h => { h = String(h || '#888').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h.slice(0, 6), 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const rgb2hex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
function hueShift(h, deg, sat = 1, lig = 1) {
  let [r, g, b] = hex2rgb(h).map(v => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let hh = 0, s = 0, l = (mx + mn) / 2;
  if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh /= 6; }
  hh = (hh + deg / 360 + 1) % 1; s = Math.min(1, s * sat + (sat > 1 ? 0.15 : 0)); l = Math.min(0.95, l * lig);
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q, f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return s === 0 ? rgb2hex(l * 255, l * 255, l * 255) : rgb2hex(f(hh + 1 / 3) * 255, f(hh) * 255, f(hh - 1 / 3) * 255);
}
const PAL_KEYS = ['body', 'dark', 'belly', 'snout', 'hoof', 'brow'];
// 돼지마다 하나뿐인 대표(전용) 스킨: [이름, 몸 색, 포인트 색, 때릴 때 효과, 등급(2 영웅 · 3 전설)]
const SIG_SKIN = {
  '분홍이': ['딸기 우유 분홍이', '#ff8fb1', '#ff1744', 'petal', 2], '깜돌이': ['현무암 깜돌이', '#37474f', '#ff6d00', 'lava', 2], '멧돌이': ['설산 멧돌이', '#eceff1', '#4fc3f7', 'ice', 2],
  '꼬미': ['솜사탕 꼬미', '#b39ddb', '#f48fb1', 'star', 2], '얼음이': ['오로라 얼음이', '#80cbc4', '#b388ff', 'rainbow', 3], '족발왕': ['검은 띠 족발왕', '#303030', '#ffd600', 'bolt', 2],
  '오겹장군': ['요코즈나 오겹장군', '#fff3e0', '#d50000', 'coin', 2], '양념이': ['불닭 양념이', '#d84315', '#ffab00', 'fire', 2], '항정': ['달빛 닌자 항정', '#283593', '#c5cae9', 'shadow', 2],
  '목살': ['챔피언 벨트 목살', '#c62828', '#ffd740', 'coin', 2], '갈비': ['참숯 갈비', '#4e342e', '#ff3d00', 'fire', 2], '감자탕': ['얼큰 감자탕', '#bf360c', '#ffcc80', 'lava', 2],
  '냉삼': ['북극 냉삼', '#e1f5fe', '#0277bd', 'ice', 2], '금한돈': ['백금 금한돈', '#e0e0e0', '#ffd740', 'coin', 3], '돼타로': ['스타 뚱타로', '#311b92', '#ffd740', 'star', 3],
  '볼트돈': ['네온 볼트돈', '#00e5ff', '#ff4081', 'bolt', 3], '돼루토': ['선인 모드 돼루토', '#ff6d00', '#b71c1c', 'fire', 3], '이타돼리': ['검은 번개 이타돼리', '#262626', '#ff1744', 'bolt', 3],
  '훈제돈': ['마스터 셰프 훈제돈', '#fafafa', '#ff6f00', 'fire', 2], '우주꿀돈': ['블랙홀 우주꿀돈', '#1a237e', '#e040fb', 'star', 3], '핑크하트': ['월드 투어 핑크하트', '#e040fb', '#ffeb3b', 'rainbow', 2],
  '기사돈': ['성기사 기사돈', '#fff8e1', '#ffd740', 'coin', 3], '산타돈': ['얼음 궁전 산타돈', '#e1f5fe', '#40c4ff', 'ice', 2], '카우돈': ['네온 무법자 카우돈', '#212121', '#00e5ff', 'bolt', 2],
  '펑크돈': ['지옥 투어 펑크돈', '#311b92', '#ff1744', 'fire', 2], '바캉스돈': ['열대 꽃 바캉스돈', '#ffccbc', '#ff4081', 'petal', 2], '야구돈': ['우주 리그 야구돈', '#1a237e', '#ffd740', 'star', 2],
  '네온돈': ['유령 서버 네온돈', '#263238', '#69f0ae', 'poison', 2], '용암돈': ['빙하 골렘 용암돈', '#b3e5fc', '#0288d1', 'ice', 3], '눈꽃돈': ['불사조 눈꽃돈', '#ff7043', '#ffd740', 'fire', 3],
  '황제돈': ['그림자 황제돈', '#1a1a2e', '#ffd740', 'shadow', 3], '은하돈': ['무지개 은하돈', '#e1bee7', '#ff4081', 'rainbow', 3], '유니돈': ['밤하늘 유니돈', '#1a237e', '#b388ff', 'star', 2],
  '벚꽃돈': ['번개 요정 벚꽃돈', '#fff59d', '#00e5ff', 'bolt', 2], '유령돈': ['황금 유령돈', '#fff8e1', '#ffd740', 'coin', 2], '그림자돈': ['용암 닌자 그림자돈', '#3e2723', '#ff6d00', 'lava', 3],
  '악마돈': ['천사 악마돈', '#fafafa', '#ffd740', 'rainbow', 3], '불꽃돈': ['얼음불꽃 불꽃돈', '#e3f2fd', '#40c4ff', 'ice', 2], '펀치돈': ['황금 벨트 펀치돈', '#ffd740', '#d50000', 'coin', 3],
  '드래곤돈': ['얼음 드래곤돈', '#b3e5fc', '#0288d1', 'ice', 3], '메카돈': ['황금 메카돈', '#ffd740', '#d50000', 'coin', 3], '마녀돈': ['벚꽃 마녀돈', '#f8bbd0', '#c2185b', 'petal', 2], '호박돈': ['유령 호박돈', '#b2dfdb', '#00695c', 'poison', 2],
  '어부돈': ['심해 어부돈', '#0d47a1', '#40c4ff', 'star', 2], '궁수돈': ['불꽃 궁수돈', '#ff7043', '#ffd740', 'fire', 2], '마술돈': ['은하 마술돈', '#311b92', '#ffd740', 'star', 3], '태권돈': ['번개 태권돈', '#212121', '#00e5ff', 'bolt', 2],
  '번개신돈': ['어둠의 번개신돈', '#212121', '#d500f9', 'dark', 3], '꿀벌돈': ['무지개 꿀벌돈', '#fff59d', '#ff4081', 'rainbow', 2],
  '합기돈': ['불꽃 합기돈', '#bf360c', '#ffd740', 'fire', 3],
  '캡틴베이컨': ['유령선 캡틴베이컨', '#455a64', '#69f0ae', 'poison', 2], '꿀린': ['대마법사 꿀린', '#4a148c', '#ffd740', 'star', 3]
};
// ⚾ 야구단 유니폼 (야구돈 전설 스킨 · 스킨 상자에서 아주 드물게): [키, 이름, 바탕, 포인트, 가슴 그림, 모자, 챙]
const TEAM_SKINS = [['tigers', '호랑이 유니폼', '#c8102e', '#111111', '🐯', '#111111', '#c8102e'], ['lions', '사자 유니폼', '#ffffff', '#074ca1', '🦁', '#074ca1', '#074ca1'], ['wiz', '마법사 유니폼', '#111111', '#e4002b', '🧙', '#111111', '#e4002b'], ['eagles', '독수리 유니폼', '#ff6600', '#0a1e3f', '🦅', '#0a1e3f', '#ff6600']];
const hueOfHex = h => { const [r, g, b] = hex2rgb(h).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d2 = mx - mn; if (!d2) return 0; const hh = mx === r ? (g - b) / d2 + (g < b ? 6 : 0) : mx === g ? (b - r) / d2 + 2 : (r - g) / d2 + 4; return Math.round(hh * 60); };
// 돼지마다 어울리는 스킨 조합: [일반 머리, 일반 무늬, 희귀 머리, 희귀 무늬, 희귀 등, 영웅·전설 테마]
const SKIN_FIT = {"분홍이":["bow","hearts","tiara","dots","wings","jester"],
  "깜돌이":["bandana","zigzag","goggles","stripeH","backpack","vampire"],
  "멧돌이":["cap","stripeV","bandana","checks","flag","viking"],
  "꼬미":["beanie","dots","antenna","stars","balloon","sailor"],
  "얼음이":["beanie","stars","goggles","dots","scarf","snowman"],
  "족발왕":["bandana","sash","tiara","stripeV","minicape","pharaoh"],
  "오겹장군":["minihat","checks","tiara","sash","flag","viking"],
  "양념이":["bandana","zigzag","phones","hearts","minicape","vampire"],
  "항정":["bandana","stripeV","goggles","checks","scarf","detective"],
  "목살":["cap","sash","bandana","stars","minicape","viking"],
  "갈비":["beret","checks","minihat","stripeH","backpack","detective"],
  "감자탕":["beanie","dots","flowers","checks","bubble","mummy"],
  "냉삼":["beanie","stripeH","goggles","stars","scarf","sailor"],
  "금한돈":["minihat","stars","tiara","sash","minicape","pharaoh"],
  "돼타로":["cap","stripeV","minihat","stars","scarf","detective"],
  "볼트돈":["antenna","zigzag","goggles","checks","backpack","diver"],
  "돼루토":["bandana","stripeH","goggles","zigzag","scarf","jester"],
  "이타돼리":["cap","stripeV","phones","zigzag","scarf","vampire"],
  "훈제돈":["beret","checks","bandana","dots","backpack","detective"],
  "우주꿀돈":["antenna","stars","goggles","dots","backpack","diver"],
  "핑크하트":["bow","hearts","phones","stars","wings","jester"],
  "캡틴베이컨":["bandana","stripeH","minihat","sash","flag","sailor"],
  "꿀린":["minihat","stars","halo","dots","minicape","jester"],
  "기사돈":["beret","sash","tiara","checks","flag","viking"],
  "산타돈":["beanie","dots","bow","stripeH","backpack","snowman"],
  "카우돈":["cap","checks","bandana","stripeV","flag","detective"],
  "펑크돈":["phones","zigzag","goggles","stars","backpack","jester"],
  "바캉스돈":["cap","dots","goggles","stripeH","balloon","sailor"],
  "야구돈":["cap","stripeV","phones","sash","backpack","sailor"],
  "네온돈":["phones","zigzag","antenna","checks","backpack","detective"],
  "용암돈":["bandana","zigzag","goggles","dots","shell","viking"],
  "눈꽃돈":["beanie","stars","tiara","dots","scarf","snowman"],
  "황제돈":["tiara","sash","minihat","stars","minicape","pharaoh"],
  "은하돈":["antenna","stars","halo","dots","balloon","diver"],
  "유니돈":["bow","hearts","halo","stars","wings","jester"],
  "벚꽃돈":["flowers","dots","bow","hearts","wings","sailor"],
  "유령돈":["beanie","stripeH","halo","dots","bubble","mummy"],
  "그림자돈":["bandana","stripeV","goggles","zigzag","scarf","vampire"],
  "악마돈":["antenna","zigzag","minihat","hearts","minicape","vampire"],
  "불꽃돈":["bandana","zigzag","goggles","stars","flag","vampire"],
  "펀치돈":["cap","sash","bandana","stripeV","minicape","viking"],
  "드래곤돈":["antenna","zigzag","tiara","checks","wings","viking"],
  "메카돈":["goggles","checks","antenna","zigzag","backpack","diver"],
  "마녀돈":["minihat","stars","flowers","dots","minicape","mummy"],
  "호박돈":["beanie","checks","minihat","zigzag","bubble","mummy"],
  "어부돈":["cap","stripeH","beanie","dots","shell","sailor"],
  "궁수돈":["beret","stripeV","bandana","stars","flag","detective"],
  "마술돈":["minihat","stars","bow","checks","balloon","jester"],
  "태권돈":["bandana","sash","phones","stripeH","flag","viking"],
  "번개신돈":["goggles","zigzag","tiara","stars","minicape","viking"],
  "꿀벌돈":["antenna","stripeH","flowers","dots","wings","jester"],
  "합기돈":["bandana","sash","beret","checks","scarf","detective"]};
const cbName = (L, k) => (L.find(x => x[0] === k) || [k, k])[1];
function pigSkins(c) {
  const base = CHARS.find(x => x.name === c.name) || c, i = Math.max(0, CHARS.indexOf(base)), L = base.look;   // 꾸미기가 붙은 복사본이 와도 원래 돼지 기준
  const deg = 110 + (i * 47) % 140;
  const recolor = Object.fromEntries(PAL_KEYS.map(k => [k, hueShift(L[k], deg, 1.15, 1)]));
  const shadow = Object.fromEntries(PAL_KEYS.map(k => [k, hueShift(L[k], 0, 0.6, k === 'belly' || k === 'snout' ? 0.5 : 0.35)]));
  const FT = SKIN_FIT[base.name] || [CB_HEAD[(i * 5) % 12][0], CB_BODY[(i * 3) % 8][0], CB_HEAD[(i * 7 + 3) % 12][0], CB_BODY[(i * 5 + 1) % 8][0], CB_BACK[(i * 3 + 2) % 8][0], FANCY_K[i % FANCY_K.length]];   // 어울리는 조합
  const MC = [L.band || L.brow || '#e91e63', '#ffffff'], RC = [L.brow || '#212121', L.band || '#ffd740'];   // 그 돼지의 포인트 색
  const G = SIG_SKIN[base.name] || [`스페셜 ${base.name}`, hueShift(L.body, 180, 1.2, 1), '#ffd740', 'star', 2];
  const sig = { body: G[1], dark: hueShift(G[1], 0, 1, 0.45), belly: hueShift(G[1], 0, 0.8, 1.35), snout: hueShift(G[1], 0, 1, 0.85), hoof: hueShift(G[1], 0, 1, 0.3), brow: G[2] };
  const all = [
    { key: 'hue', deco: 'combo', combo: { head: FT[0], body: FT[1], col: MC }, name: `${cbName(CB_HEAD, FT[0])} ${cbName(CB_BODY, FT[1])} ${base.name}`, rare: 0, pal: {}, whue: (i * 53) % 360, fx: [recolor.body, '#ffffff', recolor.dark], kind: 'star', aura: recolor.body },
    { key: 'shadow', deco: 'combo', combo: { head: FT[2], body: FT[3], back: FT[4], col: RC }, name: `${cbName(CB_BACK, FT[4])} ${cbName(CB_HEAD, FT[2])} ${base.name}`, rare: 1, pal: {}, whue: (i * 71 + 90) % 360, fxTint: true, fx: ['#212121', '#9e9e9e', '#000000'], kind: 'shadow', aura: '#616161' },
    { key: 'sig', deco: FT[5], combo: { back: FT[4] === 'scarf' ? 'minicape' : 'scarf', col: [G[2], G[1]] }, name: `${FANCY[FT[5]]} ${base.name}`, rare: G[4], c2: G[1], whue: (hueOfHex(G[2]) + 300) % 360, fxTint: true, pal: sig, fx: [G[1], G[2], '#ffffff'], kind: G[3], aura: G[2] },
    ...(base.name === '야구돈' ? TEAM_SKINS.map(([key, nm, main, sub, em, cap, brim]) => ({ key, deco: 'uniform', team: { main, sub, em, cap, brim }, name: `${nm} 야구돈`, rare: 3, w: 0.15, pal: {}, fx: [main, sub, '#ffffff'], kind: 'star', aura: sub })) : []),
    ...UPDATES.filter(u => u.skins.includes(base.name)).map(u => ({ key: 'u_' + u.id, deco: FANCY_K[(UPDATES.indexOf(u) + 4) % FANCY_K.length], combo: { back: CB_BACK[(UPDATES.indexOf(u) * 3 + i) % 8][0], col: [u.col, '#ffffff'] }, name: `${u.icon} ${FANCY[FANCY_K[(UPDATES.indexOf(u) + 4) % FANCY_K.length]]} ${base.name}`, rare: 2, pal: {}, c2: u.col, whue: (hueOfHex(u.col) + 300) % 360, fxTint: true, fx: [u.col, '#ffffff', u.col], kind: 'star', aura: u.col, rel: u.id }))   // 🎉 업데이트 스킨
  ];
  return base.name === '야구돈' ? all.filter(s => s.team) : [];   // 스킨은 야구돈 야구단 유니폼 4개만 (나머지 돼지 스킨은 뺐음)
}
const SKIN_RANK = [['일반', '#b0bec5', 62], ['희귀', '#40c4ff', 28], ['영웅', '#e040fb', 9], ['전설', '#ffd740', 1]];   // 전설 1%
const skinOn = (c, s) => (IS_TESTER && isMember()) || ((!c.relId || isRel(c.relId)) && (!s.rel || isRel(s.rel)));   // 테스트 계정은 공개 전 돼지·스킨도 다 보임   // 테스트 계정은 공개 전 돼지·스킨도 다 보임   // 공개 안 된 업데이트의 돼지·스킨은 안 나옴
const ownsPigSkin = (c, s) => !!(inv.own['ps:' + c.name + ':' + s.key] || IS_TESTER);   // 공용 스킨은 없음 · 돼지마다 따로
// 예전 공용 스킨(지옥불 등)은 없앴음 → 가진 개수만큼 스킨 상자 값(100만)씩 한 번 돌려줌
function refundOldSkins() {
  if (!inv || !inv.own || inv.skinRefund) return;
  const old = Object.keys(SKIN_DEF).filter(k => inv.own[k]); inv.skinRefund = true;
  if (inv.eq) inv.eq.skin = null;
  if (old.length) { for (const k of old) delete inv.own[k]; addCoins(old.length * 1e6); toast(`🎨 공용 스킨이 돼지 전용 스킨으로 바뀌었어요 · 가진 공용 스킨 ${old.length}개 → 🪙 ${fmtN(old.length * 1e6)} 돌려받음`); }
  saveInv();
}
const pigSkinEq = c => { const k = (inv.pskin || {})[c.name]; const s = k && pigSkins(c).find(x => x.key === k); return s && ownsPigSkin(c, s) ? s : null; };
function cyclePigSkin(c) {
  const L = [null, ...pigSkins(c).filter(s => ownsPigSkin(c, s))];
  if (L.length < 2) { SFX.block(); toast(`🎨 ${c.name} 스킨이 아직 없어요 · 상점의 스킨 상자에서 나와요`); return; }
  const cur = pigSkinEq(c), i = L.findIndex(s => (s && s.key) === (cur && cur.key)), nx = L[(i + 1) % L.length];
  inv.pskin = { ...(inv.pskin || {}), [c.name]: nx ? nx.key : null }; saveInv(); cloudDirty(); SFX.select();
  toast(nx ? `🎨 ${c.name}: ${nx.name} 장착!` : `🎨 ${c.name}: 기본 모습`);
}
function openSkinBox(n = 1, minRk = 0) {   // minRk 2: 프리미엄 상자 (영웅 이상)
  const res = [];
  for (let k = 0; k < n; k++) {
    let r = Math.random() * 100, rk = 0; for (let j = 0; j < SKIN_RANK.length; j++) { if (r < SKIN_RANK[j][2]) { rk = j; break; } r -= SKIN_RANK[j][2]; rk = j; }
    if (rk < minRk) rk = Math.random() < 0.1 ? 3 : 2;   // 프리미엄 상자: 전설 10%
    const pool = []; for (const c of CHARS) for (const s of pigSkins(c)) if (s.rare === rk && skinOn(c, s)) pool.push([c, s]);
    const anyP = pool.length ? pool : CHARS.flatMap(c => pigSkins(c).filter(s => skinOn(c, s)).map(s => [c, s]));   // 그 등급 스킨이 없으면 남은 스킨 중에서
    if (!anyP.length) { addCoins(SKIN_BOX_PRICE); continue; }   // 받을 스킨이 하나도 없으면 돈 돌려줌
    const [c, s] = (() => { const P = anyP, tot = P.reduce((a, x) => a + (x[1].w || 1), 0); let r = Math.random() * tot; for (const x of P) { r -= x[1].w || 1; if (r <= 0) return x; } return P[P.length - 1]; })(), id = 'ps:' + c.name + ':' + s.key, dup = !!inv.own[id];
    if (dup) addCoins(Math.round(SKIN_BOX_PRICE * 0.3)); else inv.own[id] = true;
    res.push({ c, s, rk: s.rare, dup });
  }
  saveInv(); cloudDirty();
  if (!res.length) { toast('🎨 아직 받을 수 있는 스킨이 없어요 · 코인을 돌려 드렸어요'); return res; }
  const best = res.reduce((b, x) => x.rk > b.rk ? x : b, res[0]);
  const lines = res.map(x => `[${SKIN_RANK[x.rk][0]}] ${x.s.name}${x.dup ? ` (중복 → 🪙 ${fmtN(SKIN_BOX_PRICE * 0.3)})` : ' 🆕'}`);
  popup({ icon: '🎨', title: best.rk === 3 ? '✨ 전설 스킨!!! ✨' : best.rk === 2 ? '영웅 스킨!' : '스킨 상자 열기', lines: lines.length > 6 ? [...lines.slice(0, 6), `외 ${lines.length - 6}개 · 🐷 돼지 도감에서 장착`] : [...lines, '🐷 돼지 도감에서 그 돼지를 골라 장착'], big: best.rk >= 2 });
  return res;
}
// ================= 🛒 수량 골라 사기 (게임 안 창) =================
// 소모품을 고르면 개수 창이 뜸: −10 · −1 · +1 · +10 · 최대 · 사기 / 취소 (키보드: ←→ ±1 · ↑↓ ±10 · Enter 사기 · Esc 취소)
let qm = null;   // { i: 상점 칸, n: 개수 }
const qtyMax = it => it.id === 'honor' ? 1 : Math.max(1, Math.min(999, Math.floor(coins / Math.max(1, itPrice(it)))));
function openQty(i) { qm = { i, n: 1 }; SFX.select(); }
function buyQty() {
  const it = SHOP[qm.i], n = it.id === "honor" ? 1 : qm.n, total = itPrice(it) * n;
  if (coins < total) { SFX.block(); toast(`코인이 부족해요 (${fmtN(total)} 필요)`); return; }
  addCoins(-total);
  if (it.id === 'skinBox' || it.id === 'skinBox10') openSkinBox(n * (it.id === 'skinBox10' ? 10 : 1));
  else if (it.id === 'skinBoxP') openSkinBox(n, 2);
  else if (it.id === 'honor') { for (let i = 0; i < n; i++) inv.honor = honorLv() + 1; toast(`🏅 명예 등급 Lv.${honorLv()}!`); }
  else if (it.id === 'tix10') { RW.bonus += 10 * n; rwSave(); toast(`🎟️ 룰렛 티켓 ${10 * n}장! (보유 ${RW.bonus}장)`); }
  else { inv.use[it.id] = (inv.use[it.id] || 0) + n; toast(`${it.name} ${n}개 구매! (보유 ${inv.use[it.id]}개)`); }
  saveInv(); cloudDirty(); SFX.coin(); qm = null;
}
function updateQty() {
  const it = SHOP[qm.i], mx = qtyMax(it), add = d => { qm.n = clamp(qm.n + d, 1, 999); SFX.select(); };
  if (pressed.KeyA || pressed.ArrowLeft) add(-1);
  if (pressed.KeyD || pressed.ArrowRight) add(1);
  if (pressed.KeyW || pressed.ArrowUp) add(10);
  if (pressed.KeyS || pressed.ArrowDown) add(-10);
  if (pressed.KeyM) { qm.n = mx; SFX.select(); }
  if (pressed.Enter || pressed.Space || pressed.KeyI) buyQty();
  else if (pressed.Escape) { qm = null; SFX.select(); }
}
function drawQty() {
  const it = SHOP[qm.i], total = itPrice(it) * qm.n, ok = coins >= total;
  ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, W, H);
  addHot(0, 0, W, H, () => {});   // 창 밖을 눌러도 뒤의 물건이 눌리지 않게 (터치는 나중에 넣은 칸부터 보므로 버튼보다 먼저 넣어야 버튼이 눌림)
  const x = W / 2 - 230, y = 130;
  ctx.fillStyle = '#2a1530'; rr(x, y, 460, 270, 18); ctx.fill(); ctx.strokeStyle = '#ffcc80'; ctx.lineWidth = 3; rr(x, y, 460, 270, 18); ctx.stroke();
  txt(`${it.name.startsWith(USE_ICON[it.id] || '@') ? '' : (USE_ICON[it.id] || '🎁') + ' '}${it.name}`, W / 2, y + 34, fitSize(it.name + '가가', 22, 420), '#fff', '#000', 5);
  txt(`1개 🪙 ${fmtN(itPrice(it))} · 지금 보유 ${it.id === 'tix10' ? RW.bonus + '장' : (inv.use[it.id] || 0) + '개'}`, W / 2, y + 64, 13, '#ccc', null);
  txt(`${qm.n}개`, W / 2, y + 112, 44, '#ffd740', '#000', 7);
  const B = [['−10', -10], ['−1', -1], ['+1', 1], ['+10', 10], ['최대', 0]];
  B.forEach(([l, d], k) => { const bx = x + 22 + k * 86; ctx.fillStyle = 'rgba(255,255,255,0.14)'; rr(bx, y + 140, 76, 36, 9); ctx.fill(); txt(l, bx + 38, y + 158, 16, '#fff', null); addHot(bx, y + 140, 76, 36, () => { qm.n = d ? clamp(qm.n + d, 1, 999) : qtyMax(it); SFX.select(); }); });
  txt(`합계 🪙 ${fmtN(total)}${ok ? '' : ' (코인 부족)'}`, W / 2, y + 198, 17, ok ? '#69f0ae' : '#ff8a80', '#000', 4);
  ctx.fillStyle = ok ? '#2e7d32' : '#555'; rr(x + 40, y + 218, 220, 40, 10); ctx.fill(); txt('🛒 사기', x + 150, y + 238, 18, '#fff', null); addHot(x + 40, y + 218, 220, 40, () => buyQty());
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; rr(x + 280, y + 218, 140, 40, 10); ctx.fill(); txt('취소', x + 350, y + 238, 16, '#fff', null); addHot(x + 280, y + 218, 140, 40, () => { qm = null; });
  if (!TOUCH) txt('←→ 1개 · ↑↓ 10개 · M 최대 · Enter 사기 · Esc 취소', W / 2, y + 290, 12, '#80d8ff', '#000', 3);
}
// ================= ⌨️ 게임 안 글자 입력 창 (브라우저 창 대신) =================
function gameInput(title, def, max, cb) {
  if (AUTH_TEST) return cb(null);   // 자동 테스트에서는 창을 안 띄움
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(10,5,20,.72);z-index:60;font-family:"Malgun Gothic","Apple SD Gothic Neo",sans-serif';
  box.innerHTML = `<div style="background:#2a1530;border:3px solid #ffcc80;border-radius:18px;padding:22px 24px;width:min(360px,86vw);color:#fff;text-align:center;box-shadow:0 10px 40px #000">
    <div style="font-size:20px;font-weight:900;margin-bottom:12px"></div>
    <input maxlength="${max}" style="width:100%;box-sizing:border-box;font-size:20px;font-weight:700;padding:10px 12px;border-radius:10px;border:2px solid #ff9100;background:#120a18;color:#fff;outline:none;text-align:center">
    <div style="display:flex;gap:10px;margin-top:14px"><button data-ok style="flex:1;font-size:17px;font-weight:900;padding:10px;border:0;border-radius:10px;background:#2e7d32;color:#fff">확인</button><button data-no style="flex:1;font-size:17px;font-weight:900;padding:10px;border:0;border-radius:10px;background:#555;color:#fff">취소</button></div></div>`;
  box.querySelector('div > div').textContent = title;
  const inp = box.querySelector('input'); inp.value = def || '';
  const done = v => { ginOpen = false; box.remove(); for (const k in keys) keys[k] = false; cb(v); };
  box.querySelector('[data-ok]').onclick = () => done(inp.value);
  box.querySelector('[data-no]').onclick = () => done(null);
  inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') done(inp.value); if (e.key === 'Escape') done(null); });
  ginOpen = true; document.body.appendChild(box); setTimeout(() => { inp.focus(); inp.select(); }, 30);
}
