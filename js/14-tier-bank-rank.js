// ================= 티어 =================
// 티어: 티어마다 4단계 (예: 골드 4 → 골드 1 → 플레티넘 4) · 맨 위 그렌드피아노(1700점)는 단계 없음
const TIERS = [['아이언', 0, '#9e9e9e'], ['브론즈', 1000, '#cd7f32'], ['실버', 2200, '#cfd8dc'], ['골드', 3600, '#ffd54f'],
  ['플레티넘', 5200, '#80cbc4'], ['에메랄드스플레시', 7000, '#2ecc71'], ['다이아', 9000, '#81d4fa'], ['울트라', 10800, '#ff8a65'],
  ['마스터', 12500, '#ce93d8'], ['스타플래티나', 14100, '#b388ff'], ['그렌드마더', 15600, '#ff5252'], ['그렌드피아노', 17000, '#ffd700']];
const TIER_DIVS = 4, OLD_TIER_T = [0, 100, 250, 450, 700, 1000, 1400, 1850, 2350, 2900, 3500, 4200];
// 예전 점수(최고 4200) → 새 점수(최고 1700): 같은 티어 안의 같은 위치로 (한 번만)
const TP_V2 = [0, 100, 220, 360, 520, 700, 900, 1080, 1250, 1410, 1560, 1700];
// 예전 기준 점수 → 지금 기준 (같은 티어의 같은 위치)
function tpMap(o, src) { let i = 0; src.forEach((v, k) => { if (o >= v) i = k; }); const last = src.length - 1; return Math.round(i >= last ? TIERS[last][1] + (o - src[last]) * (TIERS[last][1] / src[last]) : TIERS[i][1] + (o - src[i]) / (src[i + 1] - src[i]) * (TIERS[i + 1][1] - TIERS[i][1])); }
const tierIn = (v, src) => { let i = 0; src.forEach((x, k) => { if (v >= x) i = k; }); return i; };
// 랭킹 기록: v3면 그대로 · 아니면 같이 올린 티어 번호로 어느 기준인지 알아내서 옮김
function rankTP(e) { const t = +e.tp || 0; if (e.v === 3) return t; if (e.tier != null) { if (tierIn(t, OLD_TIER_T) === e.tier) return tpMap(t, OLD_TIER_T); if (tierIn(t, TP_V2) === e.tier) return tpMap(t, TP_V2); if (tierOf(t) === e.tier) return t; } return tpMap(t, OLD_TIER_T); }
function migrateTP() {
  if (lsGet('sgf_tpv3', false)) return;
  const o = +lsGet('sgf_tp', 0) || 0, src = lsGet('sgf_tpv2', false) ? [0, 100, 220, 360, 520, 700, 900, 1080, 1250, 1410, 1560, 1700] : OLD_TIER_T;   // 지난번에 1700 기준으로 옮긴 사람 / 아직 예전 4200 기준인 사람
  let i = 0; src.forEach((v, k) => { if (o >= v) i = k; });
  const last = src.length - 1, n = i >= last ? TIERS[last][1] + (o - src[last]) * (TIERS[last][1] / src[last]) : TIERS[i][1] + (o - src[i]) / (src[i + 1] - src[i]) * (TIERS[i + 1][1] - TIERS[i][1]);
  lsSet('sgf_tp', Math.round(n)); lsSet('sgf_tpv3', true);
}
migrateTP();
let tp = lsGet('sgf_tp', 0);
// 단계 (4 = 낮음 … 1 = 높음 · 맨 위 티어는 0) · "골드 2" 같은 이름 · 다음 단계까지
function tierDiv(v) { const i = tierOf(v), nx = TIERS[i + 1]; if (!nx) return 0; const span = (nx[1] - TIERS[i][1]) / TIER_DIVS; return TIER_DIVS - Math.min(TIER_DIVS - 1, Math.floor((v - TIERS[i][1]) / span)); }
const tierLabel = v => { const d = tierDiv(v); return TIERS[tierOf(v)][0] + (d ? ' ' + d : ''); };
function nextStep(v) {
  const i = tierOf(v), nx = TIERS[i + 1]; if (!nx) return null;
  const span = (nx[1] - TIERS[i][1]) / TIER_DIVS, k = Math.min(TIER_DIVS - 1, Math.floor((v - TIERS[i][1]) / span)), last = k >= TIER_DIVS - 1;
  return { need: Math.max(1, Math.ceil((last ? nx[1] : TIERS[i][1] + (k + 1) * span) - v)), label: last ? nx[0] + ' 승급전' : TIERS[i][0] + ' ' + (TIER_DIVS - k - 1) };
}
// ---- 티어 해금 캐릭터 (금한돈 = 골드). 한 번 오르면 티어가 떨어지거나 파산해도 계속 쓸 수 있음 ----
const isUnlocked = c => {
  if (!c || c.unlock == null) return true;
  if (IS_TESTER && isMember()) return true;   // 테스트 계정은 모든 돼지를 씀
  if (c.relId) { if (!isRel(c.relId)) return false; if (!c.quest && !c.buy) return true; }   // buy: 공개된 뒤 도감에서 코인으로 사야 함   // 공개된 업데이트 돼지: 퀘스트 돼지가 아니면 모두 무료
  const k = 'sgf_unlock_' + c.name;
  if (lsGet(k, false)) return true;
  if (c.unlock === 'admin') return !!(c.legacy && lsGet('sgf_unlock_' + c.legacy, false));   // 관리자 선물 돼지: 관리자가 켜 줘야만 해금 (예전 이름으로 받은 것도 인정)
  if (tierOf(tp) >= c.unlock) { lsSet(k, true); return true; }
  return false;
};
// 티어가 올라 새로 해금된 캐릭터 안내
function checkUnlocks() {
  const got = CHARS.filter(c => c.unlock != null && !lsGet('sgf_unlock_' + c.name, false) && isUnlocked(c));
  return got.length ? ` · 🔓 ${got.map(c => c.name).join(', ')} 해금!` : '';
}
const tierOf = v => { let i = 0; TIERS.forEach((t, k) => { if (v >= t[1]) i = k; }); return i; };
// 돈 표시: 1,000 → 1K · 1,500,000 → 1.5M · 1,000,000,000 → 1B (숫자가 길어져 화면이 밀리지 않게)
// 돈 단위: K · M · B · T · Qa · Qi · Sx · Sp · Oc · No · Dc · UDc · DDc … Vg(1e63) … Ce(1e303) · UCe(1e306) — 숫자가 표현할 수 있는 끝까지
const MONEY_U = (() => { const o = ['', 'U', 'D', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'], t = ['', 'Dc', 'Vg', 'Tg', 'Qag', 'Qig', 'Sxg', 'Spg', 'Ocg', 'Nog', 'Ce'], L = [[1e3, 'K'], [1e6, 'M'], [1e9, 'B'], [1e12, 'T']];
  for (let n = 4; n <= 101; n++) L.push([Number('1e' + (3 * n + 3)), n < 10 ? ['', '', '', '', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'][n] : o[n % 10] + t[Math.floor(n / 10)]]);
  return L.reverse(); })();
const fmtN = n => {
  if (!isFinite(n)) return n < 0 ? '-∞' : '∞';
  n = Math.round(n); const a = Math.abs(n), s = n < 0 ? '-' : '';
  if (a < 1000) return s + a;
  const [d, u] = MONEY_U.find(x => a >= x[0]), v = a / d;
  return s + (v < 10 ? Math.floor(v * 100) / 100 : v < 100 ? Math.floor(v * 10) / 10 : Math.floor(v)) + u;
};
function drawTierBadge(x, y, v, size = 14, align = 'center') {
  const t = TIERS[tierOf(v)], label = `🏅 ${tierLabel(v)}`;
  ctx.font = `900 ${size}px ${FONT}`; const w = ctx.measureText(label).width + 16, h = size + 10;
  const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  ctx.fillStyle = t[2]; rr(x0, y - h / 2, w, h, h / 2); ctx.fill();
  txt(label, x0 + w / 2, y + 1, size, '#1a1a1a', null);
  return w;
}

// ================= 빚 · 은행 =================
const DEBT_START = 100000000;   // 사채 1억 (예전 1000만 → 10배)
let debt = lsGet('sgf_debt', DEBT_START), bankDebt = lsGet('sgf_bank', 0);
// 상환 목표: 처음엔 사채 1000만. 빚을 다 갚은 뒤 다시 빌리면 그 금액이 새 목표가 됨
let debtBase = lsGet('sgf_debtbase', DEBT_START);
// 사채 1000만으로 바뀌기 전 저장 정리 (한 번만)
// · 빚 청산 엔딩을 이미 본 사람: 아무것도 안 바꾸고 그대로
// · 아직 못 본 사람: 남은 사채를 갚은 비율 그대로 1000만 기준으로 늘림 (예: 1만 중 7천 남음 → 700만)
if (!lsGet('sgf_debt1e7', false)) {
  if (!lsGet('sgf_end', []).includes('ending') && debt > 0 && debt < 1000000) {
    const nd = Math.round(debt * 1000); debtBase = Math.max(DEBT_START, debtBase + nd - debt); debt = nd;
    lsSet('sgf_debt', debt); lsSet('sgf_debtbase', debtBase);
  }
  lsSet('sgf_debt1e7', true);
}
// 빚 10배 (1000만 → 1억): 빚 청산 엔딩을 아직 못 본 사람만 남은 빚·목표를 10배로 (한 번만)
if (!lsGet('sgf_debt1e8', false)) {
  if (!lsGet('sgf_end', []).includes('ending') && debt > 0) { debt = Math.round(debt * 10); debtBase = Math.max(DEBT_START, Math.round(debtBase * 10)); lsSet('sgf_debt', debt); lsSet('sgf_debtbase', debtBase); }
  lsSet('sgf_debt1e8', true);
}
const totalDebt = () => Math.max(0, debt) + Math.max(0, bankDebt);
const repaidRatio = () => clamp(1 - totalDebt() / Math.max(1, debtBase));
const saveDebt = () => { lsSet('sgf_debt', debt); lsSet('sgf_bank', bankDebt); lsSet('sgf_debtbase', debtBase); };
const netWorth = () => coins - debt - bankDebt;
const loanLimit = () => Math.max(0, 200 * (tierOf(tp) + 1) - bankDebt);   // 티어가 오를수록 한도↑
function repay(which, amt) {
  const owe = which === 'debt' ? debt : bankDebt;
  amt = Math.floor(Math.min(amt, coins - 1, owe));   // 어떤 상환이든 1코인은 남김 (0이면 배드 엔딩)
  if (amt <= 0) { SFX.block(); toast(owe <= 0 ? '갚을 빚이 없어요' : '코인이 없어요'); return; }
  addCoins(-amt);
  if (which === 'debt') debt -= amt; else bankDebt -= amt;
  saveDebt(); SFX.coin(); popText(680, 470, `${fmtN(amt)}코인 상환!`, '#69f0ae', 30);
  uploadRank(); checkChapters();
}
function borrow(amt) {
  amt = Math.floor(Math.min(amt, loanLimit()));
  if (amt <= 0) { SFX.block(); toast('대출 한도 초과! 티어를 올리면 한도가 늘어요'); return; }
  const owe = Math.round(amt * 1.3), fresh = totalDebt() <= 0;
  addCoins(amt); bankDebt += owe;
  if (fresh) debtBase = owe;   // 빚 0에서 새로 빌림 → 이 대출이 새 상환 목표 (은행빚은 사채 스토리·엔딩과 상관없음)
  else debtBase += owe;   // 갚는 중에 더 빌리면 목표에 더함
  saveDebt(); SFX.coin();
  toast(`${fmtN(amt)}코인 대출! 갚을 돈 ${fmtN(owe)} (수수료 30%)`); uploadRank();
}
// ---- 랭크 점수 (다른 대전 게임처럼) ----
// · 티어가 높을수록 이기면 덜 오르고, 지면 더 많이 깎임
// · 다음 티어 문턱에 닿으면 바로 못 올라가고 '승급전'(3판 2선승)을 이겨야 승급. 지면 문턱 아래로 밀려남
let promo = lsGet('sgf_promo', null);   // { w, l } 승급전 진행 중일 때만
const winTP = (i, online) => ((online ? Math.max(8, 20 - i) : Math.max(6, 16 - i)) + (online ? 0 : Math.min(2, Math.floor(streak / 4)))) * 10;   // 최고 17000점 기준 (10배)
const loseTP = (i, online) => ((online ? 12 : 10) + i) * 10;
function rankedResult(win, online, revived = false) { const lb0 = tierLabel(tp), t0 = tierOf(tp), msg = rankedResult0(win, online, revived), lb1 = tierLabel(tp), t1 = tierOf(tp), ns = nextStep(tp);
  if (t1 > t0) startPromoFx(t1); else if (lb1 !== lb0) toast(win ? `⬆ ${lb0} → ${lb1}` : `⬇ ${lb0} → ${lb1}`);
  const left = promo ? '' : ns ? ` · ${ns.label}까지 ${ns.need}점` : ' · 최고 티어!';   // 판 끝나면 다음 단계까지 남은 점수
  return (msg ? msg + left : `${lb1} ${tp}점${left}`);
}
function rankedResult0(win, online, revived = false) {
  const i = tierOf(tp), next = TIERS[i + 1];
  if (promo && next) {   // 승급전 진행 중
    if (win) promo.w++; else promo.l++;
    let msg;
    if (promo.w >= 2) { tp = next[1]; promo = null; msg = `🎉 승급전 통과! ${next[0]} 승급` + checkUnlocks(); }
    else if (promo.l >= 2) { tp = Math.max(0, next[1] - 400); promo = null; msg = '💥 승급전 실패... 다시 도전하세요'; }
    else msg = `승급전 ${promo.w}승 ${promo.l}패 (3판 2선승)`;
    lsSet('sgf_promo', promo); lsSet('sgf_tp', tp); return msg;
  }
  promo = null;
  if (win) {
    tp += winTP(i, online) * evMul('tp');   // 이벤트: 티어 점수 N배
    if (next && tp >= next[1]) { tp = next[1] - 1; promo = { w: 0, l: 0 }; lsSet('sgf_promo', promo); lsSet('sgf_tp', tp); return `🔥 ${next[0]} 승급전 시작! (3판 2선승)`; }
  } else tp = Math.max(0, tp - Math.round(loseTP(i, online) * (revived ? 0.5 : 1)));
  lsSet('sgf_promo', promo); lsSet('sgf_tp', tp); return '';
}
// ---- 🏆 티어 문장 · 승급 연출 ----
// 문장: 방패 모양 + 티어 색 · 티어가 높을수록 날개·보석·왕관이 붙음
function drawTierEmblem(x, y, sz, i, t = 0) {
  const T = TIERS[i], c = T[2], k = sz / 100;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.lineJoin = 'round';
  if (i >= 3) for (const sg of [-1, 1]) { ctx.save(); ctx.scale(sg, 1); const n = Math.min(5, 1 + (i >> 1)); for (let j = 0; j < n; j++) { ctx.fillStyle = j % 2 ? c : '#fff8e1'; ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(30, -20 + j * 10); ctx.quadraticCurveTo(70 + j * 6, -70 + j * 22 + Math.sin(t * 0.08) * 3, 96 - j * 4, -40 + j * 26); ctx.quadraticCurveTo(70, -14 + j * 12, 30, 0 + j * 10); ctx.fill(); ctx.stroke(); } ctx.restore(); }   // 날개
  const g = ctx.createLinearGradient(0, -70, 0, 70); g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, c); g.addColorStop(1, '#263238');
  ctx.fillStyle = g; ctx.strokeStyle = '#212121'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(52, -48); ctx.lineTo(46, 18); ctx.quadraticCurveTo(30, 54, 0, 74); ctx.quadraticCurveTo(-30, 54, -46, 18); ctx.lineTo(-52, -48); ctx.closePath(); ctx.fill(); ctx.stroke();   // 방패
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -56); ctx.lineTo(38, -40); ctx.lineTo(34, 12); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.shadowColor = c; ctx.shadowBlur = 24; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(20, 0); ctx.lineTo(0, 34); ctx.lineTo(-20, 0); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;   // 가운데 보석
  ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(12, 0); ctx.lineTo(0, 22); ctx.lineTo(-12, 0); ctx.closePath(); ctx.fill();
  if (i >= 8) { ctx.fillStyle = '#ffd740'; ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 3; poly([[-34, -74], [-40, -104], [-18, -86], [0, -112], [18, -86], [40, -104], [34, -74]]); ctx.fill(); ctx.stroke(); }   // 왕관
  ctx.restore();
}
let promoFx = null;   // { i: 새 티어, t }
function startPromoFx(i) { promoFx = { i, t: 0 }; SFX.gong(); }
function promoFxInput() {   // 연출 중엔 다른 입력 막음 · Enter/Space/탭으로 넘기기
  if (!promoFx) return false; promoFx.t++;
  if (promoFx.t === 46) { SFX.bell(); burst(W / 2, H / 2 - 30, 60, [TIERS[promoFx.i][2], '#ffffff', '#ffd740'], 14); }
  if ((promoFx.t > 60 && (pressed.Enter || pressed.Space || pressed.Escape)) || promoFx.t > 300) promoFx = null;
  for (const kk in pressed) delete pressed[kk]; return true;
}
function drawPromoFx() {
  if (!promoFx) return; const P = promoFx, T = P.t, i = P.i, c = TIERS[i][2];
  ctx.save(); ctx.fillStyle = `rgba(5,5,15,${Math.min(0.88, T / 20)})`; ctx.fillRect(0, 0, W, H);
  if (T < 46) {   // 예전 문장: 흔들리다 금이 감
    const sh = T > 20 ? (T - 20) * 0.3 : 0; drawTierEmblem(W / 2 + rand(-sh, sh), H / 2 - 30, 120, Math.max(0, i - 1), T);
    if (T > 26) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W / 2 - 10, H / 2 - 90); for (let j = 1; j < 6; j++) ctx.lineTo(W / 2 + (j % 2 ? 14 : -14), H / 2 - 90 + j * 22 * Math.min(1, (T - 26) / 12)); ctx.stroke(); }
  } else {
    const k = Math.min(1, (T - 46) / 24), bounce = 1 + Math.sin(Math.min(1, (T - 46) / 30) * Math.PI) * 0.15;
    ctx.save(); ctx.translate(W / 2, H / 2 - 30); ctx.rotate(T * 0.01); for (let j = 0; j < 16; j++) { ctx.rotate(Math.PI / 8); ctx.fillStyle = j % 2 ? `rgba(255,255,255,${0.08 * k})` : c + '22'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-30, -520); ctx.lineTo(30, -520); ctx.closePath(); ctx.fill(); } ctx.restore();   // 빛줄기
    if (T < 56) { ctx.fillStyle = `rgba(255,255,255,${1 - (T - 46) / 10})`; ctx.fillRect(0, 0, W, H); }   // 번쩍
    drawTierEmblem(W / 2, H / 2 - 4, 140 * k * bounce, i, T);
    if (T > 64) { const a = Math.min(1, (T - 64) / 14); ctx.globalAlpha = a; txt('승급!', W / 2, 42, 40, '#fff', '#000', 8); txt(`${TIERS[i][0]} 4`, W / 2, H - 100, 46, c, '#000', 9); txt('새 티어에 도착했어요', W / 2, H - 56, 16, '#ddd', '#000', 4); }
    if (T > 90 && T % 20 === 0) burst(W / 2 + rand(-200, 200), rand(80, 300), 12, [c, '#fff'], 8);
  }
  if (T > 60) txt(TOUCH ? '탭하면 넘어가기' : 'Enter 넘어가기', W - 16, H - 16, 12, '#aaa', null, 0, 'right');
  ctx.restore(); addHot(0, 0, W, H, () => { if (promoFx && promoFx.t > 60) promoFx = null; });
}
// 매 판 끝: 티어 점수 · 사채 이자 · 랭킹 업로드
function afterMatchEconomy(w) {
  cut.tp = null; cut.interest = 0;
  if (mode !== 1 && mode !== 3) return;
  const me = mode === 1 ? p1 : NET.me, win = w === me, before = tp;
  if (mode === 1 && win) lsSet("sgf_best", Math.max(lsGet("sgf_best", 0), streak));
  if (mode === 1 && ranked) {   // 티어 점수·랭킹 기록은 랭크전에서만
    const keep = !win && (cut.bigRev || (inv.use.rankShield > 0 && (inv.use.rankShield--, saveInv(), true)));   // 대형 부활권 · 랭크 보호권: 티어 점수 그대로
    const res = keep ? '🛡️ 티어 점수 보호!' : rankedResult(win, false, cut.revived); lsSet("sgf_rkpending", false);   // 판이 정상으로 끝남
    cut.tp = { before, after: tp, d: tp - before, msg: res };
    if (win) lsSet("sgf_rbest", Math.max(lsGet("sgf_rbest", 0), streak));   // 랭크전 최고 연승
    lsSet('sgf_ranked', true);   // 랭크전을 한 판이라도 함 → 랭킹에 올림
  }
  if (debt > 0) { cut.interest = Math.max(1, Math.min(300, Math.ceil(debt * 0.001)));  debt += cut.interest; saveDebt(); }   // 이자: 판마다 0.1% (최대 300)
  uploadRank();
}
const bk = { sel: 0 };
const BANK_ACTS = [
  ['💸 사채 1만 갚기', () => repay('debt', 10000)], ['💸 사채 10만 갚기', () => repay('debt', 100000)],
  ['💸 사채 가진 만큼 갚기', () => repay('debt', coins)], ['🏦 은행빚 전부 갚기', () => repay('bank', coins)],
  ['💰 대출 100 받기', () => borrow(100)], ['💰 대출 한도까지 받기', () => borrow(loanLimit())],
  ['📖 스토리 다시 보기', () => startStory(WORLD === 3 ? 'w3intro' : 'intro', 'bank')], ['🗑️ 데이터 전체 초기화', () => resetAll()],
  ['← 나가기', () => toTitle()],
  ['🎬 엔딩 수집', () => replayNextEnding()]   // 오른쪽 아래 엔딩 수집 칸 (따로 그림)
];
// 엔딩 수집: 이미 본 엔딩만 여기서 다시 볼 수 있음 (Enter를 누를 때마다 다음 엔딩)
function replayEnding(k) { startStory(k, 'bank'); story.replay = true; }
function replayNextEnding() {
  const seen = ENDINGS.filter(e => endSeen.includes(e[0]));
  if (!seen.length) { SFX.block(); toast('아직 본 엔딩이 없어요'); return; }
  bk.endI = ((bk.endI ?? -1) + 1) % seen.length; replayEnding(seen[bk.endI][0]);
}
// 모든 기록(코인·빚·티어·냉장고·스토리 등) 삭제. 실수 방지로 3초 안에 두 번 눌러야 실행
let resetAsk = -999;
function resetAll() {
  if (gT - resetAsk > 180) { resetAsk = gT; SFX.block(); toast('⚠️ 한 번 더 누르면 모든 기록이 지워져요!'); return; }
  // 이 플레이어의 기록만 지움: 서버의 rank/내ID 하나 + 이 브라우저 저장값 (+ 회원이면 계정에 저장된 진행 상황). 다른 사람 기록은 그대로.
  // 로그인 상태(게스트/회원 선택)는 그대로 둠
  const myId = isMember() ? auth.uid : pid, keepAuth = auth;
  try { Object.keys(localStorage).filter(k => k.startsWith('sgf_')).forEach(k => localStorage.removeItem(k)); } catch (e) {}
  if (keepAuth) setAuth(keepAuth);
  toast('🗑️ 서버 기록 삭제 중...');
  let done = false; const reload = () => { if (!done) { done = true; location.reload(); } };
  const jobs = [];
  if (RANK_DBS.length && myId) rankAll(`/rank/w3${myId}.json`, { method: 'DELETE', keepalive: true }).catch(() => {});   // 월드3 랭킹 기록도 지움
  if (RANK_DBS.length) jobs.push(rankAll(`/rank/${myId}.json`, { method: 'DELETE', keepalive: true })   // 연결된 모든 랭킹 서버에서 내 기록 삭제
    .then(rs => { if (rs.some(r => r.status === 'rejected')) toast('⚠️ 일부 서버의 랭킹 기록은 지우지 못했어요. 기기 기록은 지워졌어요'); }));
  if (isMember()) jobs.push(cloudPush());   // 계정에 저장된 진행 상황도 빈 기록으로 덮어씀
  if (!jobs.length) return reload();
  Promise.allSettled(jobs).finally(reload);
  setTimeout(reload, 5000);   // 서버가 응답 없으면 5초 뒤 그냥 새로고침
}
function updateBank() {
  const n = BANK_ACTS.length;
  if ((pressed.KeyW || pressed.ArrowUp) && bk.sel - 2 >= 0) { bk.sel -= 2; SFX.select(); }
  if ((pressed.KeyS || pressed.ArrowDown) && bk.sel + 2 < n) { bk.sel += 2; SFX.select(); }
  if (pressed.KeyA || pressed.ArrowLeft || pressed.KeyD || pressed.ArrowRight) { if ((bk.sel ^ 1) < n) bk.sel ^= 1; SFX.select(); }
  if (pressed.Enter || pressed.Space || pressed.KeyI) BANK_ACTS[bk.sel][1]();
  if (pressed.Escape) toTitle();
}
function drawBank() {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1b2a3a'); g.addColorStop(1, '#0d1520');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  txt('🏦 꿀꿀 은행 · 빚 상환 창구', W / 2, 34, 30, '#e3f2fd', '#000', 6);
  // 왼쪽: 내 재무 상태
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; rr(30, 64, 420, 436, 16); ctx.fill();
  const repaid = repaidRatio(), cleared = totalDebt() <= 0;
  const rows = [['🪙 보유 코인', fmtN(coins), '#ffd740'], ['💸 사채 (멧돼지 실장)', debt > 0 ? fmtN(debt) : '청산 완료!', debt > 0 ? '#ff8a80' : '#69f0ae'],
    ['🏦 은행 대출', fmtN(bankDebt), bankDebt > 0 ? '#ffab91' : '#fff'], ['📊 순자산', fmtN(netWorth()), netWorth() >= 0 ? '#69f0ae' : '#ff8a80'],
    ['💰 대출 가능', fmtN(loanLimit()), '#80d8ff']];
  rows.forEach(([a, b, c], i) => { txt(a, 54, 98 + i * 40, 17, '#ddd', null, 0, 'left'); txt(b, 428, 98 + i * 40, 20, c, null, 0, 'right'); });
  txt(cleared ? '빚 상환률' : `빚 상환률 (목표 ${fmtN(debtBase)})`, 54, 306, 15, '#bbb', null, 0, 'left'); txt(`${Math.round(repaid * 100)}%`, 428, 306, 15, '#fff', null, 0, 'right');
  ctx.fillStyle = '#333'; rr(54, 320, 374, 16, 8); ctx.fill();
  ctx.fillStyle = '#66bb6a'; rr(54, 320, Math.max(16, 374 * repaid), 16, 8); ctx.fill();
  drawTierBadge(54, 362, tp, 15, 'left'); txt(`${tp} TP`, 428, 362, 16, '#fff', null, 0, 'right');
  const nt = TIERS[tierOf(tp) + 1]; txt(promo && nt ? `🔥 ${nt[0]} 승급전 ${promo.w}승 ${promo.l}패 (3판 2선승)` : nt ? `${tierLabel(tp)} · ${nextStep(tp).label}까지 ${nextStep(tp).need}점` : '최고 티어!', 54, 390, 13, '#aaa', null, 0, 'left');
  // 엔딩 수집 (오른쪽 아래 빈 칸)
  // 본 엔딩 이름을 누르면 그 엔딩을 다시 봄 (이미 본 엔딩은 여기서만 나옴)
  const eOn = bk.sel === 9;
  ctx.fillStyle = eOn ? 'rgba(30,136,229,0.55)' : 'rgba(255,224,130,0.08)'; rr(704, 368, 218, 66, 14); ctx.fill();
  if (eOn) { ctx.strokeStyle = '#90caf9'; ctx.lineWidth = 2; rr(704, 368, 218, 66, 14); ctx.stroke(); }
  addHot(704, 368, 218, 22, () => { bk.sel = 9; pressed.Enter = true; });
  txt(`🎬 엔딩 수집 ${endSeen.length}/${ENDINGS.length} · 눌러서 다시 보기`, 813, 384, fitSize(`🎬 엔딩 수집 ${endSeen.length}/${ENDINGS.length} · 눌러서 다시 보기`, 13, 206), '#ffe082', null);
  ENDINGS.forEach(([k, nm], i) => {
    const ex = 704 + 109 + ((i % 2) - 0.5) * 104, ey = 406 + (i >> 1) * 18, got = endSeen.includes(k);
    txt(got ? `▶ ${nm}` : '???', ex, ey, 12, got ? '#fff' : '#777', null);
    if (got) addHot(ex - 52, ey - 9, 104, 18, () => { bk.sel = 9; replayEnding(k); });
  });
  // 멧돼지 실장 한마디
  const boss = { ...CHARS[2].look, body: '#6d4c41', dark: '#2b1a14', hat: 'sunglass' };
  drawPig(110, 494, 1, boss, { scale: 0.7, t: gT });
  const sr = clamp(1 - Math.max(0, debt) / DEBT_START);   // 멧돼지 실장은 사채만 신경 씀 (은행빚은 상관없음)
  const say = debt <= 0 ? '"...다 갚았군. 인정한다."' : sr >= 0.75 ? '"거의 다 왔군. 도망칠 생각 마라."' : sr >= 0.5 ? '"절반이라... 이자는 계속 붙는다."' : sr >= 0.25 ? '"오호, 제법인데?"' : '"갚을 돈은 언제 가져오나? 삼겹살이 되고 싶나?"';
  txt('멧돼지 실장', 168, 430, 13, '#ffab91', null, 0, 'left'); txt(say, 168, 456, fitSize(say, 14, 440 - 168), '#fff', null, 0, 'left');   // 왼쪽 패널(오른쪽 끝 450) 안에 들어가게
  // 오른쪽: 행동
  BANK_ACTS.forEach(([label], i) => {
    if (i === 9) return;   // 엔딩 수집 칸은 위에서 따로 그림
    const x = 474 + (i % 2) * 230, y = 64 + (i >> 1) * 76, on = bk.sel === i;
    ctx.fillStyle = on ? '#1e88e5' : 'rgba(255,255,255,0.08)'; rr(x, y, 218, 66, 14); ctx.fill();
    if (on) { ctx.strokeStyle = '#90caf9'; ctx.lineWidth = 2; rr(x, y, 218, 66, 14); ctx.stroke(); }
    txt(label, x + 109, y + 34, 16, i === 7 ? '#ff8a80' : '#fff', null);
    addHot(x, y, 218, 66, () => { bk.sel = i; pressed.Enter = true; });   // 한 번 탭하면 바로 실행
  });
  txt('대출 수수료 30% · 사채는 판마다 이자 0.1% (최대 300) · W/A/S/D 이동, Enter 실행', 690, 470, 12, '#90a4ae', null);
  drawParts();
}

// ================= 랭킹 서버 (Firebase Realtime Database 여러 개) =================
// 첫 번째가 원래 서버(주소 그대로). 아래 RANK_EXTRA에 Firebase 주소를 넣으면 같은 기록을 모든 서버에 함께 저장하고,
// 불러올 때는 모든 서버를 합쳐서(같은 사람은 가장 최근 기록) 보여 줌 → 서버 하나가 죽어도 랭킹이 유지됨
const RANK_MAIN = 'https://samgyeopsal-fighter-default-rtdb.asia-southeast1.firebasedatabase.app';
const RANK_EXTRA = [
  'https://samgyeopsal-fighter-2-default-rtdb.asia-southeast1.firebasedatabase.app',   // 2번째 Firebase
  'https://samgyeopsal-fighter-3-default-rtdb.asia-southeast1.firebasedatabase.app',   // 3번째 Firebase
  'https://samgyeopsal-rank.123eet7-1fe.workers.dev'                                   // 4번째: Cloudflare Workers + D1
];
// 테스트(내 컴퓨터 파일로 열기 · ?autotest 등 주소 옵션)에서는 실제 랭킹 서버에 올리지 않음
const RANK_TEST = location.protocol === 'file:' || /autotest|view=|shot=|nettest/i.test(location.search);
const RANK_DBS = RANK_TEST ? [] : [RANK_MAIN, ...RANK_EXTRA].map(s => s.trim().replace(/\/+$/, '')).filter(Boolean);
const rankAll = (path, opt) => Promise.allSettled(RANK_DBS.map(db => fetch(`${db}${path}`, opt).then(r => { if (!r.ok) throw r.status; return r; })));
let pid = lsGet('sgf_pid', null);
if (!pid) { pid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); lsSet('sgf_pid', pid); }
// tab 0 = 티어 랭킹, 1 = 연승 랭킹, 2 = 내 기기 기록. 한 쪽에 10명, 최대 100위
const rk = { tab: 0, all: [], list: null, err: '', loading: false, page: 0 };
function rankSort() {
  const a = rk.all.map(e => ({ ...e, tp: rankTP(e) }));   // 예전 기준 점수도 같은 티어로
  if (rk.tab === 1) a.sort((x, y) => (y.streak || 0) - (x.streak || 0) || y.tp - x.tp);
  else a.sort((x, y) => y.tp - x.tp || (y.streak || 0) - (x.streak || 0));
  rk.list = a.slice(0, 100); rk.page = 0;
}
const rankId = (w = WORLD) => (w === 3 ? 'w3' : '') + auth.uid;   // 🌍 월드3 랭킹은 같은 서버에 'w3' + 계정 번호로 따로
const rankMine = id => id.startsWith('w3u') === (WORLD === 3);   // 지금 월드의 랭킹 줄만
function uploadRank() {
  if (IS_TESTER) return Promise.resolve();   // 테스트 계정은 랭킹에 안 올림
  // 티어는 지금 티어(떨어지면 순위도 내려감), 연승은 랭크전 최고 연승(오르기만 함). 랭크전을 안 해 봤으면 올리지 않음
  // 게스트는 랭킹에 올리지 않음. 회원은 계정 번호(uid)로 올림 → 어느 기기에서 해도 같은 줄
  if (!RANK_DBS.length || !isMember() || !lsGet('sgf_ranked', false)) return Promise.resolve();
  const body = { name: playerName.slice(0, 16), tier: tierOf(tp), tp, v: 3, streak: lsGet('sgf_rbest', 0), t: Date.now() };   // v: 3 = 최고 17000 기준 점수
  return rankAll(`/rank/${rankId()}.json`, { method: 'PUT', body: JSON.stringify(body) });
}
// 계정 기능 전에 이 기기 번호(pid)로 올라가 있던 옛 랭킹 기록은 한 번 지움 (게스트 선택 또는 로그인 때)
function dropLegacyRank() {
  try { if (localStorage.getItem('sgf_pidDropped')) return; localStorage.setItem('sgf_pidDropped', '1'); } catch (e) { return; }
  if (RANK_DBS.length) rankAll(`/rank/${pid}.json`, { method: 'DELETE' });
}
// 랭킹 불러오기는 서버 하나에서만 함(저장은 모든 서버에). 시작 서버를 무작위로 골라 부담을 나누고, 실패하면 다음 서버로.
// 서버에서는 티어 상위·연승 상위 RANK_TOP명씩만 받음 → 플레이어가 늘어도 내려받는 양이 그대로.
// 서버에 색인(.indexOn)이 없어 상위만 받기가 실패하면 그 서버에서 전체를 받음.
const RANK_TOP = 150;
function rankGet(db) {
  const opt = typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? { signal: AbortSignal.timeout(6000) } : {};   // 응답 없는 서버는 6초 뒤 포기
  const get = q => fetch(`${db}/rank.json${q}`, opt).then(r => { if (!r.ok) throw r.status; return r.json(); });
  const top = k => get(`?orderBy=%22${k}%22&limitToLast=${RANK_TOP}`);
  return Promise.all([top('tp'), top('streak')]).then(([a, b]) => ({ ...(a || {}), ...(b || {}) }), () => get(''));
}
function fetchRank() {
  if (!RANK_DBS.length) { rk.loading = false; rk.err = '온라인 랭킹 서버가 아직 연결되지 않았어요'; return; }
  rk.loading = true; rk.err = '';
  const s = Math.floor(Math.random() * RANK_DBS.length);
  const tryAt = i => i >= RANK_DBS.length ? Promise.reject(0) : rankGet(RANK_DBS[(s + i) % RANK_DBS.length]).catch(() => tryAt(i + 1));
  tryAt(0).then(d => {   // 빈 랭킹은 null이라 정상
    rk.all = Object.entries(d || {}).filter(([id, v]) => rankMine(id) && v && typeof v.tp === 'number' && (v.tp > 0 || v.streak > 0))   // 랭크전 기록이 없는 돼지는 숨김
      .map(([id, v]) => ({ ...v, id }));
    rankSort(); rk.loading = false;
  }).catch(() => { rk.loading = false; rk.err = '랭킹을 불러오지 못했어요 (인터넷 확인)'; });
}
function openRanking(local) { rk.tab = local ? 2 : 0; if (!local) rankPos = -1; scene = 'ranking'; rk.loading = true; uploadRank().finally(fetchRank); }   // 내 기록을 올린 뒤에 불러와야 최신 순위가 보임
function updateRanking() {
  for (let t = 0; t < 3; t++) if ((pressed["Digit" + (t + 1)] || pressed["Numpad" + (t + 1)]) && rk.tab !== t) { rk.tab = t; if (t < 2) rankSort(); SFX.select(); }
  if (pressed.KeyR) fetchRank();
  const pages = Math.max(1, Math.ceil((rk.list || []).length / 10));
  if (rk.tab < 2 && (pressed.KeyA || pressed.ArrowLeft) && rk.page > 0) { rk.page--; SFX.select(); }
  if (rk.tab < 2 && (pressed.KeyD || pressed.ArrowRight) && rk.page < pages - 1) { rk.page++; SFX.select(); }
  if (pressed.Enter || pressed.Escape || pressed.Space) toTitle();
}
function drawRanking() {
  drawStage(); ctx.fillStyle = 'rgba(10,5,20,0.85)'; ctx.fillRect(0, 0, W, H);
  txt(WORLD === 3 ? '🏆 월드3 랭킹 (증권가)' : '🏆 랭킹', W / 2, 32, 32, '#ffd54f', '#000', 6);
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(14, 16, 80, 32, 8); ctx.fill(); txt('← 나가기', 54, 32, 13, '#fff', null);
  addHot(14, 16, 80, 32, () => { pressed.Escape = true; });
  addHot(0, 100, W, H - 100, () => { pressed.Enter = true; });   // 빈 곳 탭 = 나가기 (쪽 넘김 버튼보다 먼저 등록해야 버튼이 우선)
  ['🏅 티어 랭킹', '🔥 연승 랭킹', '📱 내 기기 기록'].forEach((s, i) => {
    const x = W / 2 - 300 + i * 205, on = rk.tab === i;
    ctx.fillStyle = on ? '#ff7043' : 'rgba(255,255,255,0.12)'; rr(x, 56, 190, 34, 10); ctx.fill();
    txt(`[${i + 1}] ${s}`, x + 95, 73, 15, '#fff', null);
    addHot(x, 56, 190, 34, () => { pressed['Digit' + (i + 1)] = true; });
  });
  if (rk.tab < 2) {
    // 티어 랭킹: 지금 티어 순 / 연승 랭킹: 랭크전 최고 연승 순 (정렬 기준 칸은 노랗게)
    const cols = [[120, '순위', 0], [320, '닉네임', 0], [560, '티어', rk.tab === 0], [780, '최고 연승', rk.tab === 1]];
    cols.forEach(([x, s, on]) => txt(s + (on ? ' ▼' : ''), x, 110, 13, on ? '#ffd54f' : '#999', null));
    const list = rk.list || [], pages = Math.max(1, Math.ceil(list.length / 10));
    rk.page = Math.min(rk.page, pages - 1);
    if (rk.loading) txt('불러오는 중...', W / 2, 260, 20, '#fff', null);
    else if (rk.err) { txt(rk.err, W / 2, 250, 18, '#ff8a80', null); txt('R: 다시 시도', W / 2, 284, 14, '#aaa', null); }
    else if (!list.length) txt('아직 아무도 없어요. 랭크전에서 첫 1등이 되어 보세요!', W / 2, 260, 20, '#fff', null);
    else {
      list.slice(rk.page * 10, rk.page * 10 + 10).forEach((v, r) => {
        const i = rk.page * 10 + r, y = 140 + r * 32, me = isMember() && v.id === rankId();
        if (me) { ctx.fillStyle = 'rgba(255,213,79,0.25)'; rr(60, y - 14, 840, 28, 8); ctx.fill(); }
        const col = i === 0 ? '#ffd700' : i === 1 ? '#e0e0e0' : i === 2 ? '#ffab91' : '#fff';
        txt(`${i + 1}`, 120, y, 18, col, '#000', 4); txt(String(v.name || '?').slice(0, 16) + (me ? ' (나)' : ''), 320, y, fitSize(String(v.name || '?').slice(0, 16) + (me ? ' (나)' : ''), 17, 300), col, '#000', 3);
        drawTierBadge(560, y, v.tp, 12);
        txt(`${v.streak || 0}연승`, 780, y, 16, '#fff', null);
      });
      // 쪽 넘김
      const pb = (x, label, ok, fn) => { ctx.globalAlpha = ok ? 1 : 0.3; ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(x, 466, 90, 30, 8); ctx.fill(); txt(label, x + 45, 481, 14, '#fff', null); ctx.globalAlpha = 1; if (ok) addHot(x, 466, 90, 30, fn); };
      pb(W / 2 - 170, '◀ 이전', rk.page > 0, () => { pressed.ArrowLeft = true; });
      txt(`${rk.page * 10 + 1}~${Math.min(list.length, rk.page * 10 + 10)}위 / ${list.length}명`, W / 2, 481, 14, '#ccc', null);
      pb(W / 2 + 80, '다음 ▶', rk.page < pages - 1, () => { pressed.ArrowRight = true; });
    }
    const meIdx = isMember() ? list.findIndex(v => v.id === rankId()) : -1;
    if (!isMember()) txt('👤 게스트는 랭킹에 오르지 않아요 · 타이틀의 🔑 로그인·가입에서 회원이 되면 올라가요', W / 2, 522, 13, '#ffe082', null);
    else txt(`나: ${playerName} · ${tierLabel(tp)} ${tp}점 · 최고 ${lsGet('sgf_rbest', 0)}연승 · ${meIdx >= 0 ? `${meIdx + 1}위` : '순위 밖'}`, W / 2, 522, 13, '#ffe082', null);
  } else {
    const r = getRank();
    if (!r.length) txt('아직 기록이 없어요. 연승 모드에 도전해 보세요!', W / 2, 260, 20, '#fff', null);
    r.forEach((e, i) => {
      const y = 130 + i * 36;
      if (i === rankPos) { ctx.fillStyle = gT % 30 < 15 ? 'rgba(255,213,79,0.35)' : 'rgba(255,213,79,0.2)'; rr(150, y - 16, 660, 32, 8); ctx.fill(); }
      const col = i === 0 ? '#ffd700' : i === 1 ? '#e0e0e0' : i === 2 ? '#ffab91' : '#fff';
      txt(`${i + 1}`, 190, y, 20, col, '#000', 4); txt(e.name + (e.rk ? ' 🏆랭크전' : ' 🔥연승 모드'), 340, y, fitSize(e.name + ' 🔥연승 모드', 20, 260), col, '#000', 4);
      txt(e.char, 540, y, 18, '#ddd', '#000', 3); txt(`${e.streak}연승`, 700, y, 20, col, '#000', 4);
    });
  }
}

// ================= 스토리 =================
const STORY = {
  intro: [
    { sp: '내레이션', tx: '골목 끝 "꿀꿀 포차". 이곳엔 장사 잘하기로 소문난 돼지 사장 {name}님이 살았어요.', art: 'stall' },
    { sp: '친구 멧돌이', tx: '"야, 돼지코인 알지? 지금 사면 무조건 100배야. 나만 믿어!"', art: 'whisper' },
    { sp: '{name}', tx: '"100배...? 가게 보증금에... 대출까지 탈탈 털어서... 레버리지 100배 몰빵!!"', art: 'pump' },
    { sp: '내레이션', tx: '...그리고 다음 날 아침. 돼지코인은 상장폐지되었습니다.', art: 'crash' },
    { sp: '사채업자 멧돼지 실장', tx: '"빌려 간 돈 1억 코인. 이자는 판마다 붙는다. 못 갚으면... 네가 삼겹살이다."', art: 'boss' },
    { sp: '내레이션', tx: '살 길은 하나뿐. 철판 대난투에서 이기고, 포장마차에서 고기를 구워 팔아 빚을 갚는 것!', art: 'fight' },
    { sp: 'TIP', tx: '🏦 은행 메뉴에서 빚을 갚아요. 돈이 바닥나면 대출도 가능! 이길수록 티어가 오르고 대출 한도도 늘어요.', art: 'bank' }
  ],
  ch1: [{ sp: '사채업자 멧돼지 실장', tx: '"오호... 벌써 4분의 1을 갚았다고? 제법인데. 그래도 이자는 계속 붙는다~"', art: 'boss' }],
  ch2: [
    { sp: '친구 멧돌이', tx: '"미안해... 사실 나도 돼지코인 사기를 당했어. 이거라도 받아 줘." 멧돌이가 꼬깃꼬깃한 쪽지를 건넸다.', art: 'whisper' },
    { sp: '내레이션', tx: '쪽지에는 "힘내라 {name}!"라고 적혀 있었다. 돈은 들어 있지 않았다.', art: 'stall' }
  ],
  ch3: [{ sp: '포차 단골들', tx: '"사장님 힘내세요!! 빚 청산까지 얼마 안 남았어요!" 단골들이 응원 현수막을 걸었다.', art: 'fans' }],
  ending: [
    { sp: '사채업자 멧돼지 실장', tx: '"...다 갚았군. 이자까지 전부. 인정하지."', art: 'boss' },
    { sp: '{name}', tx: '"다시는... 레버리지 100배는 안 해..."', art: 'stall' },
    { sp: '내레이션', tx: '꿀꿀 포차가 다시 문을 열었습니다! 오늘의 메뉴는 대난투 우승 기념 삼겹살. 🎉 THE END', art: 'ending' }
  ],
  // 배드 엔딩: 코인 0
  bad: [
    { sp: '사채업자 멧돼지 실장', tx: '"코인이 한 푼도 없다고? ...약속대로다."', art: 'boss' },
    { sp: '{name}', tx: '"자, 잠깐만요! 한 판만... 딱 한 판만 더...!"', art: 'bankrupt' },
    { sp: '내레이션', tx: '그날 밤, 멧돼지 실장의 철판 위에서 아주 맛있는 냄새가 났다고 합니다... 💀 삼겹살 엔딩 (돈·빚은 처음부터, 티어·랭킹은 그대로)', art: 'bankrupt' }
  ],
  // 최고 티어 달성
  master: [
    { sp: '내레이션', tx: '🏆 마블링 마스터 달성! 최고 티어 그렌드피아노! {name}님은 철판 대난투 역사상 최고의 돼지가 되었습니다.', art: 'master' },
    { sp: '사채업자 멧돼지 실장', tx: '"...전설의 돼지라니. 사인 한 장만 해 주겠나? 우리 애가 팬이라서."', art: 'boss' },
    { sp: '내레이션', tx: '이제 골목의 아기 돼지들은 모두 {name}님처럼 되고 싶어 합니다. 🏆 마블링 마스터 엔딩', art: 'master' }
  ],
  // 빚 다 갚고 큰돈 모으기
  rich: [
    { sp: '내레이션', tx: '빚을 다 갚고도 코인이 계속 쌓였다. 통장에 찍힌 숫자를 몇 번이고 다시 세어 보았다.', art: 'rich' },
    { sp: '친구 멧돌이', tx: '"야, 이번엔 진짜야. 돼지코인 2탄 나왔는데—" "꺼져."', art: 'whisper' },
    { sp: '내레이션', tx: '꿀꿀 포차는 전국 100호점을 돌파했습니다. 레버리지 없이, 삼겹살 한 점 한 점으로. 💰 재벌 엔딩', art: 'rich' }
  ]
};
const ENDINGS = [['ending', '빚 청산'], ['rich', '재벌'], ['master', '마블링 마스터'], ['bad', '삼겹살']];
const RICH_GOAL = 30000000;   // 재벌 엔딩: 빚 없이 3000만
let endSeen = lsGet('sgf_end', []);
const isBroke = () => coins <= 0 && debt + bankDebt > 0;   // 코인이 0이 되면 배드 엔딩
let chapSeen = lsGet('sgf_chap', []);
// 사채 스토리(ch1~3)·빚 청산 엔딩은 사채(멧돼지 실장)만 기준. 은행빚을 갚아도 사채 이야기는 안 나옴
// 이미 본 엔딩은 다시 자동으로 안 나옴 → 은행의 '엔딩 수집'에서만 다시 볼 수 있음
function checkChapters() {
  if (WORLD === 3) return w3Chapters();   // 🌍 월드3는 자기 이야기·엔딩
  const r = Math.max(0, debt) / DEBT_START;
  for (const [k, th] of [['ch1', 0.75], ['ch2', 0.5], ['ch3', 0.25], ['ending', 0]]) {
    if (chapSeen.includes(k) || endSeen.includes(k)) continue;
    if (k === 'ending' ? debt <= 0 : r <= th) { chapSeen.push(k); lsSet('sgf_chap', chapSeen); startStory(k, scene); return true; }
  }
  const once = (k, ok) => { if (ok && !chapSeen.includes(k) && !endSeen.includes(k)) { chapSeen.push(k); lsSet('sgf_chap', chapSeen); startStory(k, scene); return true; } return false; };
  if (once('master', tierOf(tp) === TIERS.length - 1)) return true;
  if (once('rich', debt <= 0 && bankDebt <= 0 && coins >= RICH_GOAL)) return true;
  if (isBroke()) {
    if (!endSeen.includes('bad')) { startStory('bad', 'title'); return true; }
    restartLife(); toast('💀 파산! 돈·빚이 처음으로 돌아갔어요 (티어·랭킹은 그대로)');   // 이미 본 배드 엔딩은 다시 안 보여 줌
  }
  return false;
}
// 배드 엔딩(파산) 뒤: 돈·빚·스토리 진행만 처음으로 (티어·랭킹·닉네임·캐릭터·엔딩 수집 기록은 그대로)
function restartLife() {
  coins = 100; lsSet('sgf_coin', coins); debt = DEBT_START; bankDebt = 0; debtBase = DEBT_START; saveDebt();
  chapSeen = chapSeen.includes('master') ? ['intro', 'master'] : ['intro']; lsSet('sgf_chap', chapSeen);   // 마스터 티어 엔딩은 이미 봤으면 다시 안 띄움
}
const story = { key: 'intro', i: 0, t: 0, back: 'title' };
const storyText = pg => pg.tx.replace(/\{name\}/g, playerName);
function startStory(key, back = 'title') { Object.assign(story, { key, i: 0, t: 0, back, replay: false }); scene = 'story'; parts = []; texts = []; }
function endStory() {
  if (story.key === 'intro') lsSet('sgf_story_seen', true);
  if (ENDINGS.some(e => e[0] === story.key) && !endSeen.includes(story.key)) { endSeen.push(story.key); lsSet('sgf_end', endSeen); }
  if (story.key === 'bad' && !story.replay) restartLife();   // 엔딩 수집에서 다시 볼 때는 초기화 안 함
  try { speechSynthesis.cancel(); } catch (e) {} scene = story.back;
  if (story.key === 'intro' && !auth && !AUTH_TEST) openAuth('choose');   // 처음 들어온 사람: 컷신 끝나면 로그인/회원가입/게스트 선택
}
function updateStory() {
  const pages = STORY[story.key], pg = pages[story.i];
  story.t++;
  if (story.t === 2) speak(storyText(pg).replace(/["…]/g, ''), pg.sp.includes('실장') ? 0.7 : pg.sp.includes('멧돌이') ? 0.9 : 1.2, 1.05);
  if (pg.art === 'bankrupt' && story.t % 6 === 0) { smoke(rand(380, 580), 300); flame(rand(380, 580), 330); }
  if (['ending', 'master', 'rich'].includes(pg.art) && story.t % 14 === 0) burst(rand(100, W - 100), rand(40, 240), 26, [pick(['#ff5252', '#ffd740', '#69f0ae', '#40c4ff']), '#fff'], 8);
  if (pg.art === 'crash' && story.t % 10 === 0) parts.push({ x: rand(0, W), y: -10, vx: rand(-1, 1), vy: rand(2, 4), life: 120, max: 120, c: '#ffd740', s: rand(4, 8), g: 0.05, type: 'dot' });
  if (pressed.Enter || pressed.Space || pressed.KeyI) {
    if (story.t * 0.8 < storyText(pg).length) story.t = 1000;
    else { story.i++; story.t = 0; SFX.select(); parts = []; if (story.i >= pages.length) endStory(); }
  }
  if (pressed.Escape) endStory();
}
function wrapText(s, x, y, maxW, lh, size, col) {
  ctx.font = `700 ${size}px ${FONT}`; let ln = '', yy = y;
  for (const ch of s) {
    if (ctx.measureText(ln + ch).width > maxW) { txt(ln, x, yy, size, col, null, 0, 'left'); ln = ''; yy += lh; }
    ln += ch;
  }
  if (ln) txt(ln, x, yy, size, col, null, 0, 'left');
}
function drawStoryArt(art, t) {
  const me = withCos(getChar(sel.c1) || CHARS[0]).look, boar = CHARS[2].look;
  const boss = { ...boar, body: '#6d4c41', dark: '#2b1a14', hat: 'sunglass' };
  const sky = (a, b) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
  const stall = () => {
    sky('#ff9e6b', '#5b3f8c');
    ctx.fillStyle = '#c62828'; ctx.fillRect(150, 60, 660, 70); for (let x = 150; x < 810; x += 66) { ctx.fillStyle = '#ef5350'; ctx.fillRect(x, 60, 33, 70); }
    txt('꿀꿀 포차', 480, 95, 34, '#fff', '#7f0000', 6);
    for (let i = 0; i < 6; i++) { const lx = 190 + i * 116; ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 0.1 + i); ctx.drawImage(glowC, lx - 32, 118); ctx.globalAlpha = 1; }
  };
  switch (art) {
    case 'stall':
      stall();
      drawPig(480, 330, 1, me, { scale: 1.3, t, victory: t % 120 < 60 });
      ctx.fillStyle = '#6d4c41'; ctx.fillRect(220, 300, 520, 90); ctx.fillStyle = '#8d6e63'; ctx.fillRect(220, 300, 520, 10);
      drawStrip(300, 280, 90, 22, 1, 1); drawStrip(570, 280, 90, 22, 0.6, 1);
      drawPig(130, 390, 1, CHARS[3].look, { scale: 0.8, t: t + 20 }); drawPig(830, 390, -1, CHARS[4].look, { scale: 0.8, t: t + 40 });
      if (t % 8 === 0) smoke(rand(300, 660), 270);
      break;
    case 'whisper': {
      sky('#2b2340', '#120c1e');
      drawPig(360, 390, 1, boar, { scale: 1.3, t, move: 'jab', k: 0.4 });
      drawPig(640, 390, -1, me, { scale: 1.3, t, scared: t % 90 < 30 });
      const cy = 140 + Math.sin(t * 0.08) * 10;
      ctx.save(); ctx.shadowColor = '#ffd740'; ctx.shadowBlur = 30; ctx.fillStyle = '#ffca28'; ell(480, cy, 56, 56); ctx.fill(); ctx.restore();
      ctx.strokeStyle = '#ff8f00'; ctx.lineWidth = 5; ell(480, cy, 46, 46); ctx.stroke();
      txt('🐷', 480, cy, 40, '#000', null); txt('PIGCOIN', 480, cy + 76, 22, '#ffd740', '#000', 5);
      txt('x100?!', 600, cy - 40, 30, '#69f0ae', '#000', 6);
      break;
    }
    case 'pump': case 'crash': {
      const crash = art === 'crash';
      sky(crash ? '#3a0d0d' : '#0d1b2a', '#000');
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1;
      for (let x = 60; x < W; x += 60) line(x, 40, x, 390); for (let y = 40; y < 390; y += 50) line(40, y, W - 40, y);
      const pts = []; for (let i = 0; i <= 40; i++) { const k = i / 40; let y = 370 - k * 300 + Math.sin(i * 1.7) * 18; if (crash && k > 0.6) y = 70 + (k - 0.6) / 0.4 * 340 + Math.sin(i * 3) * 10; pts.push([60 + k * 840, y]); }
      const n = Math.min(pts.length, Math.floor(t / 2) + 2);
      ctx.strokeStyle = crash ? '#ff1744' : '#00e676'; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath(); pts.slice(0, n).forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
      if (!crash) { txt('▲ +9,900%', 760, 80, 34, '#00e676', '#000', 6); drawPig(200, 400 - Math.abs(Math.sin(t * 0.15)) * 40, 1, me, { scale: 1.1, t, victory: true }); }
      else {
        if (t > 50) { ctx.save(); ctx.translate(480, 200); ctx.rotate(-0.15); const sk = t < 60 ? 3 - (t - 50) / 5 : 1; ctx.scale(sk, sk); ctx.strokeStyle = '#ff1744'; ctx.lineWidth = 8; rr(-190, -50, 380, 100, 16); ctx.stroke(); txt('상장폐지', 0, 0, 64, '#ff1744', null); ctx.restore(); }
        drawPig(760, 420, -1, me, { scale: 1.2, t, scared: true });
        ctx.fillStyle = `rgba(255,0,0,${0.15 * (1 + Math.sin(t * 0.3))})`; ctx.fillRect(0, 0, W, H);
      }
      break;
    }
    case 'boss': {
      sky('#1a1a1a', '#000');
      ctx.fillStyle = 'rgba(255,240,180,0.12)'; poly([[440, 0], [520, 0], [760, 400], [200, 400]]); ctx.fill();
      drawPig(500, 340, -1, boss, { scale: 1.7, t });
      ctx.fillStyle = '#ffd700'; ctx.lineWidth = 4; ctx.strokeStyle = '#ffd700'; ctx.beginPath(); ctx.arc(455, 225, 34, 0.3, Math.PI - 0.3); ctx.stroke();
      ctx.fillStyle = '#4e342e'; ctx.fillRect(170, 300, 620, 100); ctx.fillStyle = '#6d4c41'; ctx.fillRect(170, 300, 620, 12);
      ctx.save(); ctx.translate(560, 300); ctx.rotate(-0.1); ctx.fillStyle = '#fffde7'; ctx.fillRect(-70, -40, 140, 50);
      txt('차 용 증', 0, -28, 14, '#333', null); txt('1억 코인', 0, -8, 16, '#c62828', null); ctx.restore();
      ctx.save(); ctx.translate(320, 300); ctx.scale(0.45, 0.45); drawCleaver(0, 0, t % 60 < 10); ctx.restore();
      drawPig(110, 400, 1, me, { scale: 0.9, t, scared: true });
      break;
    }
    case 'fight':
      drawStage();
      drawPig(330, GROUND, 1, me, { scale: 1.15, t, move: t % 30 < 15 ? 'punch' : 'jab', k: 1 });
      drawPig(630, GROUND, -1, CHARS[6].look, { scale: 1.3, t, hurt: t % 30 < 15 });
      for (let i = 0; i < 6; i++) { const k = ((t * 0.02) + i / 6) % 1; ctx.fillStyle = '#ffd740'; ell(480 + Math.sin(i * 2) * 200 * k, 300 - k * 260, 10, 10); ctx.fill(); }
      txt('상금 💰', 480, 70, 40, '#ffd740', '#000', 7);
      break;
    case 'bank':
      sky('#90caf9', '#e3f2fd');
      ctx.fillStyle = '#eceff1'; ctx.fillRect(300, 150, 360, 230);
      ctx.fillStyle = '#cfd8dc'; poly([[280, 155], [480, 70], [680, 155]]); ctx.fill();
      for (let i = 0; i < 5; i++) { ctx.fillStyle = '#b0bec5'; ctx.fillRect(325 + i * 70, 180, 22, 190); }
      txt('🏦 꿀꿀 은행', 480, 125, 26, '#37474f', null);
      drawPig(180, 400, 1, me, { scale: 1.1, t, victory: true });
      for (let i = 0; i < 3; i++) { ctx.fillStyle = '#a1887f'; ell(720 + i * 60, 370, 26, 30); ctx.fill(); txt('₩', 720 + i * 60, 372, 22, '#ffd740', null); }
      break;
    case 'fans':
      stall();
      ctx.fillStyle = '#fff59d'; ctx.fillRect(140, 150, 680, 54); txt('사장님 힘내세요!! 🔥 빚 청산 가즈아!', 480, 177, 26, '#c62828', null);
      for (let i = 0; i < 8; i++) drawPig(110 + i * 105, 400 - Math.abs(Math.sin(t * 0.12 + i)) * 24, i < 4 ? 1 : -1, CHARS[i].look, { scale: 0.7, t: t + i * 9, victory: true });
      break;
    case 'ending':
      sky('#0d1b2a', '#3d2352');
      stall(); ctx.fillStyle = 'rgba(13,27,42,0.5)'; ctx.fillRect(0, 0, W, H);
      txt('OPEN', 480, 200, 48, '#69f0ae', '#000', 8);
      drawPig(480, 400, 1, { ...me, hat: 'crown' }, { scale: 1.5, t, victory: true });
      txt('🎉 빚 청산 엔딩 🎉', 480, 260, 30, '#ffd740', '#000', 6);
      break;
    case 'bankrupt': {   // 철판 위의 나
      sky('#3a0d0d', '#0a0000');
      ctx.fillStyle = 'rgba(255,120,40,0.15)'; ell(480, 340, 300, 60); ctx.fill();
      drawPig(480, 330, 1, me, { scale: 1.1, t, scared: true, hurt: t % 40 < 20 });
      ctx.fillStyle = '#212121'; rr(250, 330, 460, 26, 8); ctx.fill();   // 철판
      ctx.strokeStyle = '#616161'; ctx.lineWidth = 3; for (let x = 270; x < 700; x += 30) line(x, 334, x, 352);
      ctx.fillStyle = '#4e342e'; ctx.fillRect(290, 356, 20, 40); ctx.fillRect(650, 356, 20, 40);
      drawPig(820, 390, -1, boss, { scale: 1.2, t });
      ctx.save(); ctx.translate(700, 330); ctx.scale(0.5, 0.5); drawCleaver(0, 0, t % 50 < 8); ctx.restore();
      txt('💀 삼겹살 엔딩', 480, 80, 44, '#ff5252', '#000', 8);
      break;
    }
    case 'master': {   // 시상대 위 챔피언
      sky('#1a0033', '#000');
      for (let i = 0; i < 3; i++) { ctx.fillStyle = `rgba(255,240,180,${0.08 + 0.04 * Math.sin(t * 0.05 + i)})`; poly([[300 + i * 180, 0], [340 + i * 180, 0], [560, 400], [400, 400]]); ctx.fill(); }
      ctx.fillStyle = '#ffd54f'; ctx.fillRect(380, 330, 200, 70); ctx.fillStyle = '#b0bec5'; ctx.fillRect(220, 360, 160, 40); ctx.fillStyle = '#a1887f'; ctx.fillRect(580, 370, 160, 30);
      txt('1', 480, 365, 34, '#7f6000', null);
      drawPig(300, 362, 1, CHARS[3].look, { scale: 0.75, t: t + 20 }); drawPig(660, 372, -1, CHARS[6].look, { scale: 0.75, t: t + 40 });
      drawPig(480, 332, 1, { ...me, hat: 'crown' }, { scale: 1.2, t, victory: true });
      const ty = 120 + Math.sin(t * 0.08) * 8;   // 트로피
      ctx.fillStyle = '#ffd700'; poly([[440, ty - 40], [520, ty - 40], [505, ty + 10], [455, ty + 10]]); ctx.fill(); ctx.fillRect(472, ty + 10, 16, 20); ctx.fillRect(455, ty + 30, 50, 10);
      txt('🏆 마블링 마스터 엔딩', 480, 50, 36, '#ffd740', '#000', 7);
      break;
    }
    case 'rich': {   // 포차 체인 + 코인 비
      sky('#0d1b2a', '#1b3a4b');
      for (let i = 0; i < 7; i++) {
        const x = 40 + i * 132, h = 120 + (i * 37) % 90;
        ctx.fillStyle = '#263238'; ctx.fillRect(x, 330 - h, 110, h);
        ctx.fillStyle = i % 2 ? '#c62828' : '#ef6c00'; ctx.fillRect(x, 330 - h, 110, 24);
        txt(`꿀꿀 포차 ${i * 15 + 1}호`, x + 55, 342 - h, 12, '#fff', null);
        for (let r = 0; r < 3; r++) { ctx.fillStyle = (t + i + r) % 40 < 30 ? '#ffe082' : '#795548'; ctx.fillRect(x + 12 + r * 32, 350 - h + 26, 20, 18); }
      }
      for (let i = 0; i < 14; i++) { const y = (t * 3 + i * 53) % 420 - 20, x = (i * 71) % W; ctx.fillStyle = '#ffd740'; ell(x, y, 10, 10); ctx.fill(); txt('₩', x, y + 1, 11, '#8d6e00', null); }
      drawPig(480, 400, 1, { ...me, hat: 'sunglass' }, { scale: 1.3, t, victory: true });
      txt('💰 재벌 엔딩 · 100호점 돌파!', 480, 50, 34, '#ffd740', '#000', 7);
      break;
    }
  }
}
function drawStory() {
  const pages = STORY[story.key], pg = pages[story.i];
  if (!pg) return;
  drawStoryArt(pg.art, story.t);
  drawParts();
  const s = storyText(pg), n = Math.min(s.length, Math.floor(story.t * 0.8));
  ctx.fillStyle = 'rgba(0,0,0,0.85)'; rr(30, 408, 900, 118, 14); ctx.fill();
  ctx.strokeStyle = '#ffcc80'; ctx.lineWidth = 2; rr(30, 408, 900, 118, 14); ctx.stroke();
  const sp = pg.sp.replace(/\{name\}/g, playerName);
  ctx.font = `900 16px ${FONT}`; const sw = ctx.measureText(sp).width + 28;
  ctx.fillStyle = '#ff7043'; rr(50, 392, sw, 30, 10); ctx.fill(); txt(sp, 50 + sw / 2, 407, 16, '#fff', null);
  wrapText(s.slice(0, n), 60, 446, 840, 30, 20, '#fff');
  if (n >= s.length && gT % 50 < 32) txt('▶ Enter / 탭', 912, 510, 13, '#ffcc80', null, 0, 'right');
  txt(`${story.i + 1} / ${pages.length}`, 912, 392, 12, '#aaa', null, 0, 'right');
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(W - 120, 10, 110, 30, 8); ctx.fill(); txt('건너뛰기 (Esc)', W - 65, 25, 12, '#fff', null);
  addHot(0, 0, W, H, () => { pressed.Enter = true; });
  addHot(W - 120, 10, 110, 30, () => { pressed.Escape = true; });
}

