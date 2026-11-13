// ================= 🎨 스킨 의상: 테마마다 머리·몸·등·어깨·주변 효과가 통째로 바뀜 (돼지 모양은 그대로라 알아볼 수 있음) =================
// L: 'aura'(돼지 뒤 빛·입자) · 'back'(날개·망토·칼·제트팩) · 'body'(갑옷·무늬) · 'head'(왕관·뿔·바이저·가면) · 'front'(어깨 갑옷·고리 앞쪽)
// deco: spots(일반 리컬러) · dark(희귀 섀도우 악마) · 대표 스킨: fire 불꽃 전사 · lava 용암 골렘 · ice 얼음 기사 · bolt 네온 사이버 · coin 황제
//       star 우주 스타 · rainbow 유니콘 천사 · petal 벚꽃 요정 · poison 유령 해적 · shadow 달빛 닌자
const CASUAL = { sport: '스포츠', cowboy: '카우보이', beach: '바캉스', santa: '산타', knight: '기사', punk: '펑크' }, CASUAL2 = { hanbok: '한복', school: '교복', pajama: '잠옷', police: '경찰', doctor: '의사', farmer: '농부' }, CASUAL_K = Object.keys(CASUAL);   // 일반 스킨 의상 (돼지마다 하나)
function skinDeco(L, C, d) {
  const S = C.skinFx; if (!S || !S.deco) return;
  const { bw = 1, by = 0, hx = 0, hy = 0, ex = 0, ey = 0, t = 0 } = d, k = S.deco, A = S.aura || '#ffffff', P = C.brow;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const glow = (c, x, y, r, a = 0.5) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); };
  const parts = (n, fn) => { for (let i = 0; i < n; i++) fn(i, ((t * 0.6 + i * 37) % 100) / 100); };   // 입자마다 0→1로 돌아가는 값
  const eyeGlow = c => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = c; ctx.globalAlpha *= 0.75; ell(ex + 2, ey, 9, 7); ctx.fill(); ctx.globalAlpha *= 0.5; ell(ex + 6, ey, 18, 6); ctx.fill(); ctx.restore(); };
  const pauldron = (fill, edge, spikes) => {   // 앞 어깨 갑옷
    const x = 18 * bw, y = -72 + by; ctx.fillStyle = fill; ctx.strokeStyle = edge; ctx.lineWidth = 2.5 * LWM;
    ctx.beginPath(); ctx.ellipse(x, y, 17, 12, -0.2, Math.PI * 0.95, Math.PI * 2.05); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (spikes) { ctx.fillStyle = spikes; for (const dx of [-8, 2, 11]) { poly([[x + dx - 4, y - 8], [x + dx - 1, y - 22 - (dx === 2 ? 5 : 0)], [x + dx + 4, y - 9]]); ctx.fill(); ctx.stroke(); } }
  };
  const flame = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x - w * 0.8, y - h * 0.6, x + w * 0.2, y - h); ctx.quadraticCurveTo(x + w * 0.4, y - h * 0.45, x + w, y); ctx.closePath(); ctx.fill(); };

  if (skinDeco2(L, C, d, k)) { ctx.restore(); return; }   // 업데이트 21~30 의상
  if (S.lite) {   // 대표 스킨: 옷·모자·날개는 안 입음 (색 + 몸 무늬 + 빛나는 눈 + 주변 빛만)
    if (L === 'back' || L === 'front' || (L === 'body' && ['coin', 'ice', 'shadow', 'dark'].includes(k))) { ctx.restore(); return; }
    if (L === 'head') { eyeGlow(A); ctx.restore(); return; }
  }
  if (k === 'shade') { if (L === 'aura') { glow('#7c4dff', 0, -60, 85, 0.3); parts(8, (i, u) => { ctx.fillStyle = `rgba(30,0,50,${0.5 * (1 - u)})`; ell(-40 + (i * 23) % 80, -30 - u * 130, 6 + u * 12, 6 + u * 12); ctx.fill(); }); } if (L === 'head') eyeGlow('#d500f9'); ctx.restore(); return; }   // 희귀: 그림자
  if (k === 'tint') { if (L === 'aura') { glow(A, 0, -70, 90, 0.45); parts(8, (i, u) => { const s2 = Math.sin(u * Math.PI); ctx.fillStyle = `rgba(255,255,255,${s2})`; star(((i * 61) % 160) - 80, -((i * 37) % 150) - 10, 1.5 + 3 * s2, 0.8); ctx.fill(); }); } ctx.restore(); return; }   // 업데이트 스킨
  if (k === 'uniform') {   // ⚾ 야구단 유니폼 (야구돈 전설 스킨)
    const U2 = S.team || { main: '#fff', sub: '#000', em: '⚾' };
    if (L === 'aura') glow(U2.sub === '#ffffff' ? U2.main : U2.sub, 0, -70, 90, 0.35);
    else if (L === 'head') { ctx.fillStyle = U2.cap || U2.sub; ctx.strokeStyle = '#000'; ctx.lineWidth = 2 * LWM; ctx.beginPath(); ctx.ellipse(hx - 2, hy - 20, 29, 16, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = U2.brim || U2.main; ell(hx + 26, hy - 21, 16, 5, -0.1); ctx.fill(); ctx.stroke(); txt(U2.em, hx - 2, hy - 28, 12, '#fff', null); }
    else if (L === 'body') { ctx.save(); ell(0, -60 + by, 46 * bw, 34); ctx.clip(); ctx.fillStyle = U2.main; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 76); ctx.strokeStyle = U2.sub; ctx.globalAlpha *= 0.35; ctx.lineWidth = 2; for (let i = 0; i < 8; i++) line(-46 * bw + i * 12 * bw, -96 + by, -46 * bw + i * 12 * bw, -20 + by); ctx.globalAlpha /= 0.35; ctx.fillStyle = U2.sub; ctx.fillRect(-50 * bw, -50 + by, 100 * bw, 6); ctx.fillStyle = '#fff'; ell(4 * bw, -76 + by, 11, 11); ctx.fill(); ctx.strokeStyle = U2.sub; ctx.lineWidth = 2.5; ctx.stroke(); txt(U2.em, 4 * bw, -75 + by, 13, '#fff', null); ctx.restore(); }
    ctx.restore(); return;
  }
  if (CASUAL[k]) {   // 일반 스킨: 평상복 테마 의상 (색은 원래 돼지 그대로)
    const T = S.aura || '#1e88e5';
    if (L === 'head') {
      if (k === 'sport') { ctx.fillStyle = T; ctx.strokeStyle = '#000'; ctx.lineWidth = 2 * LWM; ctx.beginPath(); ctx.ellipse(hx - 2, hy - 20, 29, 16, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ell(hx - 32, hy - 21, 14, 5, 0.15); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffffff'; ell(hx - 2, hy - 35, 4, 3); ctx.fill(); }
      else if (k === 'cowboy') { ctx.fillStyle = '#8d6e63'; ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 2 * LWM; ell(hx - 2, hy - 26, 42, 9, -0.05); ctx.fill(); ctx.stroke(); rr(hx - 19, hy - 56, 34, 30, 9); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#3e2723'; ctx.fillRect(hx - 19, hy - 36, 34, 6); ctx.strokeStyle = '#5d4037'; line(hx - 2, hy - 56, hx - 2, hy - 46); }
      else if (k === 'beach') { ctx.fillStyle = '#111'; ell(ex + 3, ey, 11, 8); ctx.fill(); ell(ex + 25, ey + 1, 7, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 3 * LWM; line(ex + 12, ey - 2, ex + 19, ey - 1); line(ex - 8, ey - 2, hx - 26, ey - 6); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ell(ex, ey - 3, 3, 2); ctx.fill(); ctx.fillStyle = '#ff4081'; for (let j = 0; j < 5; j++) { const a = j / 5 * Math.PI * 2; ell(hx - 18 + Math.cos(a) * 5, hy - 22 + Math.sin(a) * 5, 4, 4); ctx.fill(); } ctx.fillStyle = '#ffd740'; ell(hx - 18, hy - 22, 3, 3); ctx.fill(); }
      else if (k === 'santa') { ctx.fillStyle = '#d32f2f'; ctx.strokeStyle = '#7f0000'; ctx.lineWidth = 2 * LWM; ctx.beginPath(); ctx.moveTo(hx - 26, hy - 24); ctx.quadraticCurveTo(hx - 6, hy - 76, hx - 40, hy - 64 + Math.sin(t * 0.1) * 3); ctx.lineTo(hx - 30, hy - 56); ctx.quadraticCurveTo(hx - 4, hy - 56, hx + 24, hy - 24); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fafafa'; rr(hx - 30, hy - 30, 58, 11, 5); ctx.fill(); ell(hx - 42, hy - 64 + Math.sin(t * 0.1) * 3, 7, 7); ctx.fill(); }
      else if (k === 'knight') { ctx.save(); ell(hx, hy, 31, 30); ctx.clip(); const g = ctx.createLinearGradient(hx - 30, hy - 30, hx + 30, hy); g.addColorStop(0, '#eceff1'); g.addColorStop(1, '#78909c'); ctx.fillStyle = g; ctx.fillRect(hx - 32, hy - 32, 64, 26); ctx.fillStyle = '#263238'; ctx.fillRect(hx + 2, ey - 3, 30, 4); ctx.restore(); ctx.fillStyle = '#d32f2f'; for (let i = 0; i < 4; i++) { ell(hx - 6 - i * 7, hy - 36 + i * 2 + Math.sin(t * 0.2 + i) * 2, 6, 10, -0.6 - i * 0.2); ctx.fill(); } }
      else if (k === 'punk') { ctx.fillStyle = T; ctx.strokeStyle = '#000'; ctx.lineWidth = 2 * LWM; for (let i = 0; i < 5; i++) { const x = hx - 20 + i * 9; poly([[x - 5, hy - 24], [x - 2 - i, hy - 52 - (i === 2 ? 10 : 0)], [x + 5, hy - 26]]); ctx.fill(); ctx.stroke(); } ctx.fillStyle = '#cfd8dc'; ell(hx - 10, hy - 6, 3, 3); ctx.fill(); }
    } else if (L === 'body') {
      ctx.save(); ell(0, -60 + by, 46 * bw, 34); ctx.clip();
      if (k === 'sport') { ctx.fillStyle = T; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 48); ctx.fillStyle = '#ffffff'; ctx.fillRect(-50 * bw, -60 + by, 100 * bw, 5); ctx.fillRect(-50 * bw, -52 + by, 100 * bw, 3); ell(-12 * bw, -78 + by, 9, 9); ctx.fill(); ctx.fillStyle = T; ell(-12 * bw, -78 + by, 5, 5); ctx.fill(); }
      else if (k === 'cowboy') { ctx.fillStyle = '#795548'; ctx.fillRect(-50 * bw, -96 + by, 30 * bw, 76); ctx.fillStyle = '#ffd740'; star(-6 * bw, -72 + by, 8, 3.5); ctx.fill(); ctx.fillStyle = '#4e342e'; ctx.fillRect(-50 * bw, -44 + by, 100 * bw, 7); ctx.fillStyle = '#ffca28'; rr(10 * bw, -46 + by, 12, 11, 2); ctx.fill(); }
      else if (k === 'beach') { ctx.fillStyle = '#26a69a'; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 50); for (const [x, y] of [[-30, -80], [-6, -62], [-40, -56], [12, -86]]) { ctx.fillStyle = '#ffeb3b'; for (let j = 0; j < 5; j++) { const a = j / 5 * Math.PI * 2; ell(x * bw + Math.cos(a) * 4, y + by + Math.sin(a) * 4, 3.4, 3.4); ctx.fill(); } ctx.fillStyle = '#ff5722'; ell(x * bw, y + by, 2.4, 2.4); ctx.fill(); } }
      else if (k === 'santa') { ctx.fillStyle = '#d32f2f'; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 76); ctx.fillStyle = '#fafafa'; ctx.fillRect(-50 * bw, -36 + by, 100 * bw, 10); ctx.fillRect(14 * bw, -96 + by, 9, 64); ctx.fillStyle = '#212121'; ctx.fillRect(-50 * bw, -56 + by, 100 * bw, 8); ctx.strokeStyle = '#ffd740'; ctx.lineWidth = 2.5; ctx.strokeRect(-4 * bw, -57 + by, 12, 10); }
      else if (k === 'knight') { const g = ctx.createLinearGradient(-40 * bw, -96 + by, 40 * bw, -30 + by); g.addColorStop(0, '#eceff1'); g.addColorStop(1, '#607d8b'); ctx.fillStyle = g; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 76); ctx.strokeStyle = '#455a64'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) line(-50 * bw, -76 + by + i * 14, 50 * bw, -76 + by + i * 14); ctx.fillStyle = '#d32f2f'; poly([[10 * bw, -88 + by], [26 * bw, -88 + by], [26 * bw, -70 + by], [18 * bw, -62 + by], [10 * bw, -70 + by]]); ctx.fill(); }
      else if (k === 'punk') { ctx.fillStyle = '#212121'; ctx.fillRect(-50 * bw, -96 + by, 52 * bw, 76); ctx.fillRect(24 * bw, -96 + by, 30 * bw, 76); ctx.fillStyle = '#cfd8dc'; for (let i = 0; i < 6; i++) { ell(-4 * bw, -88 + by + i * 9, 2.2, 2.2); ctx.fill(); ell(26 * bw, -88 + by + i * 9, 2.2, 2.2); ctx.fill(); } ctx.strokeStyle = '#b0bec5'; ctx.lineWidth = 2.5; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(-30 * bw + i * 7, -42 + by + Math.sin(i) * 2, 4, 2.5, 0, 0, Math.PI * 2); ctx.stroke(); } }
      ctx.restore();
    } else if (L === 'back') {
      if (k === 'santa') { ctx.fillStyle = '#a1887f'; ctx.strokeStyle = '#4e342e'; ctx.lineWidth = 2.5 * LWM; ell(-52 * bw, -96 + by, 24, 28, -0.3); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#d32f2f'; ctx.lineWidth = 4 * LWM; line(-40 * bw, -118 + by, -32 * bw, -112 + by); }
      else if (k === 'cowboy') { ctx.strokeStyle = '#d7a86e'; ctx.lineWidth = 3 * LWM; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(-36 * bw, -48 + by, 13 - i * 2, 9 - i, 0.3, 0, Math.PI * 2); ctx.stroke(); } }
      else if (k === 'knight') { ctx.fillStyle = '#b71c1c'; const w = Math.sin(t * 0.15) * 6; ctx.beginPath(); ctx.moveTo(10 * bw, -92 + by); ctx.quadraticCurveTo(-40 * bw, -100 + by, -64 * bw - w, -30 + by); ctx.lineTo(-20 * bw, -24 + by); ctx.quadraticCurveTo(-10 * bw, -70 + by, 10 * bw, -92 + by); ctx.fill(); }
    } else if (L === 'front') {
      if (k === 'beach') { ctx.lineWidth = 11 * LWM; ctx.setLineDash([14, 10]); ctx.strokeStyle = '#ff5252'; ctx.beginPath(); ctx.ellipse(0, -40 + by, 52 * bw, 12, 0, 0, Math.PI); ctx.stroke(); ctx.lineDashOffset = 14; ctx.strokeStyle = '#fafafa'; ctx.stroke(); ctx.setLineDash([]); }
      else if (k === 'knight') pauldron('#b0bec5', '#455a64', null);
      else if (k === 'punk') pauldron('#212121', '#000', '#cfd8dc');
    }
    ctx.restore(); return;
  }
  if (CASUAL2[k]) {   // (안 씀) 평상복 2 (업데이트 돼지 의상과 안 겹침 · 색은 원래 돼지 그대로)
    const T = S.aura || '#e91e63';
    if (L === 'head') {
      if (k === 'hanbok') { ctx.fillStyle = '#e91e63'; for (let j = 0; j < 5; j++) { const a = j / 5 * Math.PI * 2; ell(hx - 20 + Math.cos(a) * 4, hy - 24 + Math.sin(a) * 4, 3.5, 3.5); ctx.fill(); } ctx.fillStyle = '#ffd740'; ell(hx - 20, hy - 24, 2.5, 2.5); ctx.fill(); ctx.strokeStyle = '#ffd740'; ctx.lineWidth = 3 * LWM; line(hx - 30, hy - 18, hx - 8, hy - 30); }
      else if (k === 'pajama') { ctx.fillStyle = '#90caf9'; ctx.strokeStyle = '#1565c0'; ctx.lineWidth = 2 * LWM; ctx.beginPath(); ctx.moveTo(hx - 26, hy - 22); ctx.quadraticCurveTo(hx - 4, hy - 62, hx - 44, hy - 46 + Math.sin(t * 0.1) * 3); ctx.lineTo(hx - 34, hy - 42); ctx.quadraticCurveTo(hx - 6, hy - 52, hx + 22, hy - 22); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ell(hx - 46, hy - 46 + Math.sin(t * 0.1) * 3, 6, 6); ctx.fill(); }
      else if (k === 'police') { ctx.fillStyle = '#1a237e'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2 * LWM; rr(hx - 24, hy - 46, 44, 18, 5); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#000'; ell(hx + 10, hy - 27, 18, 5, -0.1); ctx.fill(); ctx.fillStyle = '#ffd740'; star(hx - 2, hy - 38, 6, 2.6); ctx.fill(); }
      else if (k === 'doctor') { ctx.strokeStyle = '#9e9e9e'; ctx.lineWidth = 3 * LWM; ctx.beginPath(); ctx.arc(hx, hy - 6, 30, Math.PI * 1.05, Math.PI * 1.85); ctx.stroke(); ctx.fillStyle = '#e0e0e0'; ctx.strokeStyle = '#757575'; ctx.lineWidth = 2; ell(hx + 4, hy - 34, 9, 9); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ell(hx + 2, hy - 36, 3, 3); ctx.fill(); }
      else if (k === 'farmer') { ctx.fillStyle = '#fdd835'; ctx.strokeStyle = '#a1887f'; ctx.lineWidth = 2 * LWM; ell(hx - 2, hy - 26, 44, 9, -0.05); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(hx - 2, hy - 30, 22, 14, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e53935'; ctx.fillRect(hx - 24, hy - 34, 44, 4); }
    } else if (L === 'body') {
      ctx.save(); ell(0, -60 + by, 46 * bw, 34); ctx.clip();
      if (k === 'hanbok') { ctx.fillStyle = T; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 50); ctx.fillStyle = '#fff'; poly([[30 * bw, -96 + by], [8 * bw, -66 + by], [14 * bw, -64 + by], [36 * bw, -94 + by]]); ctx.fill(); ctx.fillStyle = '#d50000'; poly([[8 * bw, -66 + by], [2 * bw, -40 + by], [12 * bw, -42 + by]]); ctx.fill(); poly([[8 * bw, -66 + by], [18 * bw, -40 + by], [24 * bw, -46 + by]]); ctx.fill(); ctx.fillStyle = '#3949ab'; ctx.fillRect(-50 * bw, -46 + by, 100 * bw, 30); }
      else if (k === 'school') { ctx.fillStyle = '#1a237e'; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 76); ctx.fillStyle = '#fff'; poly([[30 * bw, -96 + by], [12 * bw, -60 + by], [-4 * bw, -96 + by]]); ctx.fill(); ctx.fillStyle = '#d32f2f'; poly([[12 * bw, -90 + by], [16 * bw, -62 + by], [12 * bw, -56 + by], [8 * bw, -62 + by]]); ctx.fill(); ctx.fillStyle = '#ffd740'; for (let i = 0; i < 2; i++) ell(-6 * bw, -70 + i * 14 + by, 2.5, 2.5), ctx.fill(); }
      else if (k === 'pajama') { ctx.fillStyle = '#bbdefb'; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 76); ctx.fillStyle = '#fff'; for (let i = 0; i < 12; i++) ell((-40 + (i * 17) % 80) * bw, -88 + ((i * 23) % 60) + by, 4, 4), ctx.fill(); ctx.fillStyle = '#1565c0'; for (let i = 0; i < 3; i++) ell(12 * bw, -82 + i * 14 + by, 2.5, 2.5), ctx.fill(); }
      else if (k === 'police') { ctx.fillStyle = '#1a237e'; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 76); ctx.fillStyle = '#ffd740'; star(-6 * bw, -76 + by, 7, 3); ctx.fill(); ctx.fillStyle = '#212121'; ctx.fillRect(-50 * bw, -50 + by, 100 * bw, 7); ctx.fillStyle = '#b0bec5'; ctx.fillRect(10 * bw, -52 + by, 10, 10); }
      else if (k === 'doctor') { ctx.fillStyle = '#fafafa'; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 76); ctx.strokeStyle = '#bdbdbd'; ctx.lineWidth = 2; line(12 * bw, -96 + by, 12 * bw, -20 + by); ctx.strokeStyle = '#616161'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(26 * bw, -94 + by); ctx.quadraticCurveTo(0, -60 + by, -10 * bw, -94 + by); ctx.stroke(); ctx.fillStyle = '#9e9e9e'; ell(4 * bw, -64 + by, 5, 5); ctx.fill(); ctx.fillStyle = '#e53935'; ctx.fillRect(-30 * bw, -80 + by, 10, 3); ctx.fillRect(-26.5 * bw, -84 + by, 3, 10); }
      else if (k === 'farmer') { ctx.fillStyle = '#e57373'; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 76); ctx.fillStyle = '#1e88e5'; ctx.fillRect(-50 * bw, -66 + by, 100 * bw, 50); ctx.fillRect(-10 * bw, -96 + by, 7, 34); ctx.fillRect(18 * bw, -96 + by, 7, 34); ctx.fillStyle = '#1565c0'; rr(-8 * bw, -60 + by, 20, 14, 3); ctx.fill(); ctx.fillStyle = '#ffd740'; ell(-6 * bw, -64 + by, 2.5, 2.5); ctx.fill(); ell(21 * bw, -64 + by, 2.5, 2.5); ctx.fill(); }
      ctx.restore();
    }
    ctx.restore(); return;
  }

  if (L === 'aura') {
    if (k === 'fire') { glow('#ff6d00', 0, -70, 95, 0.45); parts(12, (i, u) => { ctx.fillStyle = `rgba(255,${140 + (i * 23) % 110},0,${1 - u})`; ell(((i * 53) % 120) - 60 + Math.sin(t * 0.1 + i) * 6, -10 - u * 160, 1 + 3 * (1 - u), 1 + 3 * (1 - u)); ctx.fill(); }); }
    else if (k === 'lava') { glow('#ff3d00', 0, -50, 80, 0.35); parts(6, (i, u) => { ctx.fillStyle = `rgba(70,60,60,${0.45 * (1 - u)})`; ell(-30 + (i * 17) % 60, -100 - u * 90, 8 + u * 14, 8 + u * 14); ctx.fill(); }); }
    else if (k === 'ice') { glow('#81d4fa', 0, -70, 95, 0.4); parts(12, (i, u) => { ctx.fillStyle = `rgba(255,255,255,${1 - u * 0.6})`; star(((i * 61) % 170) - 85 + Math.sin(u * 6 + i) * 6, -180 + u * 180, 4, 1.4); ctx.fill(); }); }
    else if (k === 'bolt') { glow(A, 0, -70, 95, 0.4); ctx.strokeStyle = A; ctx.lineWidth = 2.5; for (let i = 0; i < 4; i++) { if ((((t / 4) | 0) + i * 3) % 5) continue; const a = i * 1.7 + ((t / 4) | 0), x = Math.cos(a) * 64, y = -70 + Math.sin(a) * 70; ctx.beginPath(); ctx.moveTo(x, y); for (let j = 1; j < 5; j++) ctx.lineTo(x + Math.cos(a) * j * 7 + (j % 2 ? 6 : -6), y + Math.sin(a) * j * 7 + (j % 2 ? -6 : 6)); ctx.stroke(); } }
    else if (k === 'coin') { glow('#ffd740', 0, -70, 100, 0.4); parts(7, (i, u) => { const a = i / 7 * Math.PI * 2 + t * 0.02, s = Math.sin(u * Math.PI); ctx.fillStyle = `rgba(255,236,130,${s})`; star(Math.cos(a) * 70, -70 + Math.sin(a) * 80, 2 + 5 * s, 1.2); ctx.fill(); }); }
    else if (k === 'star') { glow('#7c4dff', 0, -70, 105, 0.5); glow('#ff4081', 30, -100, 60, 0.25); parts(14, (i, u) => { const s = Math.sin(u * Math.PI); ctx.fillStyle = `rgba(255,255,255,${s})`; star(((i * 71) % 190) - 95, -((i * 43) % 170) - 10, 1.5 + 3.5 * s, 0.8); ctx.fill(); }); }
    else if (k === 'rainbow') { glow(`hsl(${(t * 3) % 360},100%,70%)`, 0, -70, 100, 0.4); parts(10, (i, u) => { ctx.fillStyle = `hsla(${i * 36 + t * 3},100%,70%,${1 - u})`; star(((i * 59) % 160) - 80, -20 - u * 150, 4, 1.6); ctx.fill(); }); }
    else if (k === 'petal') { glow('#f8bbd0', 0, -70, 90, 0.35); parts(10, (i, u) => { ctx.fillStyle = `rgba(255,${170 + (i * 13) % 60},${200 + (i * 7) % 40},${0.9 - u * 0.4})`; ell(((i * 47) % 180) - 90 + Math.sin(u * 6 + i) * 12, -190 + u * 200, 5, 3, u * 8 + i); ctx.fill(); }); }
    else if (k === 'poison') { glow('#69f0ae', 0, -70, 95, 0.45); parts(7, (i, u) => { ctx.fillStyle = `rgba(105,240,174,${0.55 * (1 - u)})`; ell(-50 + (i * 19) % 100 + Math.sin(u * 5 + i) * 8, -40 - u * 140, 7 * (1 - u) + 2, 11 * (1 - u) + 3); ctx.fill(); }); }
    else if (k === 'shadow') { ctx.fillStyle = 'rgba(255,245,157,0.55)'; ctx.beginPath(); ctx.arc(-34, -150, 30, 0, Math.PI * 2); ctx.fill(); ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(-22, -158, 27, 0, Math.PI * 2); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; glow('#3949ab', 0, -70, 90, 0.35); }
    else if (k === 'dark') { glow('#7c4dff', 0, -60, 85, 0.35); parts(8, (i, u) => { ctx.fillStyle = `rgba(30,0,50,${0.5 * (1 - u)})`; ell(-40 + (i * 23) % 80, -30 - u * 130, 6 + u * 12, 6 + u * 12); ctx.fill(); }); }
  } else if (L === 'back') {
    if (k === 'dark' || k === 'lava') {   // 등 가시 / 바위 가시
      ctx.fillStyle = k === 'lava' ? '#3e2723' : '#1a1a1a'; ctx.strokeStyle = k === 'lava' ? '#ff6d00' : '#7c4dff'; ctx.lineWidth = 2 * LWM;
      for (let i = 0; i < 4; i++) { const x = -38 * bw + i * 15 * bw, y = -86 + by + Math.abs(i - 1.5) * 3, h = (i === 1 || i === 2) ? 28 : 20; poly([[x - 8, y + 6], [x - 2, y - h], [x + 8, y + 6]]); ctx.fill(); ctx.stroke(); }
    } else if (k === 'ice') {   // 얼음 결정 등지느러미
      ctx.fillStyle = 'rgba(179,229,252,0.95)'; ctx.strokeStyle = '#0288d1'; ctx.lineWidth = 2 * LWM;
      for (let i = 0; i < 5; i++) { const x = -42 * bw + i * 13 * bw, y = -86 + by, h = 20 + (i % 2) * 14; poly([[x - 7, y + 6], [x - 1, y - h], [x + 7, y + 6]]); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.9)'; line(x - 1, y - h + 6, x - 3, y); ctx.strokeStyle = '#0288d1'; }
    } else if (k === 'fire') {   // 등 불꽃 갈기 + 불타는 꼬리
      for (let i = 0; i < 6; i++) { const x = -44 * bw + i * 12 * bw, f = Math.sin(t * 0.3 + i) * 6; flame(x, -82 + by, 9, 30 + (i % 2) * 12 + f, i % 2 ? '#ff3d00' : '#ff9100'); flame(x, -82 + by, 5, 18 + (i % 2) * 6 + f, '#ffe082'); }
      flame(-58 * bw, -64 + by, 8, 26 + Math.sin(t * 0.4) * 5, '#ff6d00'); flame(-58 * bw, -64 + by, 4, 14, '#ffe082');
    } else if (k === 'bolt') {   // 제트팩 + 분사 불꽃
      ctx.fillStyle = '#37474f'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2 * LWM; rr(-62 * bw, -100 + by, 18, 40, 5); ctx.fill(); ctx.stroke(); rr(-46 * bw, -104 + by, 14, 36, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = A; ctx.fillRect(-60 * bw, -92 + by, 14, 4); ctx.fillRect(-44 * bw, -96 + by, 10, 4);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const fl = 14 + Math.sin(t * 0.8) * 5; ctx.fillStyle = A; poly([[-60 * bw, -60 + by], [-53 * bw, -60 + by + fl], [-46 * bw, -60 + by]]); ctx.fill(); poly([[-45 * bw, -68 + by], [-39 * bw, -68 + by + fl * 0.8], [-33 * bw, -68 + by]]); ctx.fill(); ctx.restore();
    } else if (k === 'coin' || k === 'poison') {   // 망토: 황제(빨강·금테·흰 털깃) / 유령 해적(너덜너덜 초록 유령 천)
      const w = Math.sin(t * 0.15) * 7; ctx.fillStyle = k === 'coin' ? '#b71c1c' : 'rgba(105,240,174,0.5)'; ctx.strokeStyle = k === 'coin' ? '#ffd740' : '#1b5e20'; ctx.lineWidth = 3.5 * LWM;
      ctx.beginPath(); ctx.moveTo(12 * bw, -94 + by); ctx.quadraticCurveTo(-44 * bw, -104 + by, -70 * bw - w, -26 + by);
      if (k === 'poison') for (let i = 0; i < 5; i++) ctx.lineTo(-64 * bw - w + i * 11 * bw, -18 + by + (i % 2 ? -14 : 0)); else ctx.lineTo(-18 * bw, -20 + by);
      ctx.quadraticCurveTo(-10 * bw, -70 + by, 12 * bw, -94 + by); ctx.fill(); ctx.stroke();
      if (k === 'coin') { ctx.fillStyle = '#fafafa'; ctx.strokeStyle = '#bdbdbd'; ctx.lineWidth = 1.5 * LWM; ell(-2 * bw, -92 + by, 26 * bw, 9); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#212121'; for (let i = 0; i < 5; i++) { ell(-20 * bw + i * 9 * bw, -92 + by + (i % 2) * 3, 1.6, 2.6); ctx.fill(); } }
    } else if (k === 'star') {   // 몸을 두른 행성 고리 (뒤쪽 반)
      ctx.strokeStyle = A; ctx.lineWidth = 6 * LWM; ctx.globalAlpha *= 0.85; ctx.beginPath(); ctx.ellipse(0, -58 + by, 74 * bw, 17, -0.22, Math.PI, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, -58 + by, 66 * bw, 13, -0.22, Math.PI, Math.PI * 2); ctx.stroke();
    } else if (k === 'rainbow' || k === 'petal') {   // 날개: 깃털 천사 날개 / 반투명 요정 날개 (파닥파닥)
      const fl = Math.sin(t * 0.3) * 0.22;
      for (const [a0, sc, al] of [[-0.75, 1, 1], [-0.25, 0.75, 0.8]]) {
        ctx.save(); ctx.translate(-10 * bw, -86 + by); ctx.rotate(a0 + fl); ctx.scale(sc, sc); ctx.globalAlpha *= al;
        if (k === 'rainbow') {
          ctx.fillStyle = '#ffffff'; ctx.strokeStyle = `hsl(${(t * 4) % 360},90%,60%)`; ctx.lineWidth = 3 * LWM;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-20, -60, -78, -58); for (let j = 0; j < 4; j++) ctx.quadraticCurveTo(-70 + j * 14, -40 + j * 8, -62 + j * 16, -30 + j * 10); ctx.quadraticCurveTo(-14, 6, 0, 0); ctx.fill(); ctx.stroke();
        } else {
          ctx.fillStyle = 'rgba(248,187,208,0.6)'; ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 2 * LWM;
          ctx.beginPath(); ctx.ellipse(-30, -26, 34, 18, -0.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(-24, 2, 22, 11, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,255,255,0.6)'; line(0, 0, -52, -40); line(0, 0, -40, 6);
        }
        ctx.restore();
      }
    } else if (k === 'shadow') {   // 등에 멘 칼 + 길게 휘날리는 목도리
      ctx.strokeStyle = '#111'; ctx.lineWidth = 8 * LWM; line(-40 * bw, -36 + by, -6 * bw, -108 + by);
      ctx.strokeStyle = P; ctx.lineWidth = 6 * LWM; line(-6 * bw, -108 + by, 4 * bw, -130 + by); ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; for (let i = 0; i < 4; i++) { const u = i / 4; line(-6 * bw + 10 * bw * u - 3, -108 + by - 22 * u, -6 * bw + 10 * bw * u + 3, -108 + by - 22 * u - 2); }
      ctx.fillStyle = '#ffd740'; ell(-6 * bw, -108 + by, 6, 3, -1.1); ctx.fill();
      ctx.strokeStyle = P; ctx.lineWidth = 9 * LWM; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(12 * bw, -90 + by); ctx.quadraticCurveTo(-40 * bw, -98 + by + Math.sin(t * 0.3 + i) * 8, -92 * bw, -88 + by + i * 16 + Math.sin(t * 0.25 + i * 2) * 12); ctx.stroke(); }
    }
  } else if (L === 'body') {
    ctx.save(); ell(0, -60 + by, 46 * bw, 34); ctx.clip();
    if (k === 'spots') { ctx.fillStyle = C.dark; ctx.globalAlpha *= 0.45; for (const [x, y, r] of [[-28, -74, 9], [-8, -84, 6], [-34, -50, 6], [14, -76, 5], [-18, -60, 4]]) { ell(x * bw, y + by, r * bw, r * 0.85); ctx.fill(); } }
    else if (k === 'dark') { ctx.strokeStyle = '#b388ff'; ctx.lineWidth = 2.5 * LWM; ctx.globalAlpha *= 0.6 + Math.sin(t * 0.15) * 0.3; ctx.beginPath(); ctx.moveTo(-40 * bw, -70 + by); ctx.lineTo(-24 * bw, -62 + by); ctx.lineTo(-28 * bw, -48 + by); ctx.lineTo(-10 * bw, -40 + by); ctx.moveTo(-24 * bw, -62 + by); ctx.lineTo(-6 * bw, -74 + by); ctx.lineTo(8 * bw, -68 + by); ctx.stroke(); }
    else if (k === 'lava') {   // 바위 판 + 사이로 빛나는 용암
      ctx.fillStyle = 'rgba(255,109,0,0.9)'; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 76);
      ctx.fillStyle = '#4e342e'; ctx.strokeStyle = '#ffab00'; ctx.lineWidth = 1.5 * LWM;
      for (const pts of [[[-48, -96], [-14, -96], [-20, -70], [-48, -66]], [[-10, -96], [30, -96], [24, -72], [-16, -68]], [[-48, -62], [-22, -66], [-26, -34], [-48, -30]], [[-18, -64], [22, -68], [18, -40], [-22, -32]], [[26, -70], [50, -70], [50, -30], [22, -36]]]) { poly(pts.map(([x, y]) => [x * bw, y + by])); ctx.fill(); }
    }
    else if (k === 'fire') { ctx.fillStyle = 'rgba(255,171,0,0.85)'; for (let i = 0; i < 6; i++) { const x = -44 * bw + i * 14 * bw; ctx.beginPath(); ctx.moveTo(x - 8, -24 + by); ctx.quadraticCurveTo(x, -54 + by + Math.sin(t * 0.3 + i) * 5, x + 8, -24 + by); ctx.fill(); } ctx.fillStyle = '#212121'; ctx.fillRect(-50 * bw, -62 + by, 100 * bw, 9); ctx.fillStyle = '#ff6d00'; flame(14 * bw, -52 + by, 6, 16, '#ff6d00'); }
    else if (k === 'ice') {   // 다면 얼음 가슴 갑옷
      ctx.fillStyle = 'rgba(179,229,252,0.92)'; ctx.strokeStyle = '#0288d1'; ctx.lineWidth = 2 * LWM; poly([[-6 * bw, -96 + by], [40 * bw, -96 + by], [48 * bw, -60 + by], [30 * bw, -34 + by], [2 * bw, -40 + by], [-14 * bw, -70 + by]]); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.5 * LWM; line(-14 * bw, -70 + by, 20 * bw, -64 + by); line(20 * bw, -64 + by, 40 * bw, -96 + by); line(20 * bw, -64 + by, 30 * bw, -34 + by); line(20 * bw, -64 + by, 48 * bw, -60 + by);
    }
    else if (k === 'bolt') {   // 빛나는 회로 + 가슴 코어
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = A; ctx.lineWidth = 2.5 * LWM; ctx.lineCap = 'square';
      for (const pts of [[[-44, -80], [-26, -80], [-18, -70], [0, -70]], [[-44, -56], [-30, -56], [-22, -46], [6, -46]], [[-30, -92], [-30, -80]], [[0, -70], [10, -62]]]) { ctx.beginPath(); pts.forEach(([x, y], j) => j ? ctx.lineTo(x * bw, y + by) : ctx.moveTo(x * bw, y + by)); ctx.stroke(); ell(pts[pts.length - 1][0] * bw, pts[pts.length - 1][1] + by, 2.5, 2.5); ctx.fillStyle = A; ctx.fill(); }
      ctx.restore(); ctx.fillStyle = '#263238'; ell(20 * bw, -66 + by, 10, 10); ctx.fill(); glow(A, 20 * bw, -66 + by, 16, 0.9 + Math.sin(t * 0.2) * 0.1); ctx.fillStyle = '#ffffff'; ell(20 * bw, -66 + by, 4, 4); ctx.fill();
    }
    else if (k === 'coin') {   // 금 가슴 갑옷 + 보석 + 금 허리띠
      const g = ctx.createLinearGradient(0, -96 + by, 40 * bw, -40 + by); g.addColorStop(0, '#fff59d'); g.addColorStop(0.5, '#ffd740'); g.addColorStop(1, '#ff8f00');
      ctx.fillStyle = g; ctx.strokeStyle = '#e65100'; ctx.lineWidth = 2 * LWM; ell(22 * bw, -66 + by, 26 * bw, 28); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#d50000'; poly([[22 * bw, -78 + by], [29 * bw, -68 + by], [22 * bw, -58 + by], [15 * bw, -68 + by]]); ctx.fill();
      ctx.fillStyle = '#ffd740'; ctx.fillRect(-50 * bw, -46 + by, 100 * bw, 7);
    }
    else if (k === 'star') {   // 은하 무늬
      const g = ctx.createRadialGradient(-10 * bw, -66 + by, 4, -10 * bw, -66 + by, 50); g.addColorStop(0, 'rgba(255,64,129,0.55)'); g.addColorStop(0.5, 'rgba(124,77,255,0.45)'); g.addColorStop(1, 'rgba(26,35,126,0.2)'); ctx.fillStyle = g; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 76);
      for (let i = 0; i < 14; i++) { const s = 0.5 + 0.5 * Math.sin(t * 0.1 + i * 2); ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.6 * s})`; star(((i * 29) % 90 - 45) * bw, -92 + (i * 17) % 60 + by, 1 + 2.5 * s, 0.6); ctx.fill(); }
    }
    else if (k === 'rainbow') { ctx.lineWidth = 5; for (let i = 0; i < 6; i++) { ctx.strokeStyle = `hsl(${i * 55 + t * 3},90%,62%)`; ctx.beginPath(); ctx.arc(-6 * bw, -26 + by, 48 - i * 5, Math.PI * 1.05, Math.PI * 1.7); ctx.stroke(); } }
    else if (k === 'petal') { ctx.strokeStyle = '#66bb6a'; ctx.lineWidth = 6 * LWM; line(-30 * bw, -96 + by, 30 * bw, -30 + by); for (const [x, y] of [[-30, -74], [-12, -58], [-36, -50], [10, -84]]) { ctx.fillStyle = '#ffffff'; for (let j = 0; j < 5; j++) { const a = j / 5 * Math.PI * 2; ell(x * bw + Math.cos(a) * 4.5, y + by + Math.sin(a) * 4.5, 3.4, 3.4); ctx.fill(); } ctx.fillStyle = '#ffd740'; ell(x * bw, y + by, 2.4, 2.4); ctx.fill(); } }
    else if (k === 'poison') { ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3 * LWM; line(-40 * bw, -64 + by, 30 * bw, -64 + by); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-6 * bw, -64 + by, 14 + i * 7, -0.9 - i * 0.05, 0.9 + i * 0.05); ctx.stroke(); } }
    else if (k === 'shadow') { ctx.fillStyle = '#111'; ctx.globalAlpha *= 0.85; ctx.fillRect(-50 * bw, -58 + by, 100 * bw, 10); ctx.strokeStyle = '#111'; ctx.lineWidth = 6 * LWM; line(-30 * bw, -96 + by, 24 * bw, -50 + by); ctx.fillStyle = '#b0bec5'; star(10 * bw, -53 + by, 6, 2); ctx.fill(); }
    ctx.restore();
  } else if (L === 'head') {
    if (k === 'dark') {   // 휘어진 뿔 + 보라 눈
      ctx.fillStyle = '#212121'; ctx.strokeStyle = '#7c4dff'; ctx.lineWidth = 2 * LWM;
      for (const dx of [-10, 6]) { ctx.beginPath(); ctx.moveTo(hx + dx - 6, hy - 24); ctx.quadraticCurveTo(hx + dx - 10, hy - 50, hx + dx - 22, hy - 58); ctx.quadraticCurveTo(hx + dx + 2, hy - 46, hx + dx + 6, hy - 26); ctx.fill(); ctx.stroke(); }
      eyeGlow('#d500f9');
    } else if (k === 'spots') { ctx.fillStyle = C.dark; ctx.globalAlpha *= 0.45; ell(hx - 12, hy + 6, 7, 6); ctx.fill(); }
    else if (k === 'fire') {   // 불꽃 모히칸 + 주황 눈
      for (let i = 0; i < 5; i++) { const x = hx - 22 + i * 10, f = Math.sin(t * 0.35 + i * 2) * 5, h = 30 + (i === 2 ? 16 : i % 2 ? 8 : 0) + f; flame(x, hy - 22, 8, h, ['#d50000', '#ff3d00', '#ff9100', '#ff3d00', '#d50000'][i]); flame(x, hy - 22, 4, h * 0.55, '#ffe082'); }
      eyeGlow('#ff9100');
    } else if (k === 'lava') { ctx.fillStyle = '#3e2723'; ctx.strokeStyle = '#ff6d00'; ctx.lineWidth = 2 * LWM; for (const dx of [-14, 4]) { poly([[hx + dx - 6, hy - 22], [hx + dx - 4, hy - 50], [hx + dx + 6, hy - 22]]); ctx.fill(); ctx.stroke(); } ctx.strokeStyle = '#ff9100'; ctx.lineWidth = 2 * LWM; ctx.beginPath(); ctx.moveTo(hx - 20, hy - 10); ctx.lineTo(hx - 10, hy - 2); ctx.lineTo(hx - 14, hy + 10); ctx.stroke(); eyeGlow('#ff6d00'); }
    else if (k === 'ice') {   // 얼음 왕관 + 파란 눈
      ctx.fillStyle = 'rgba(225,245,254,0.97)'; ctx.strokeStyle = '#0288d1'; ctx.lineWidth = 2 * LWM; ctx.beginPath(); ctx.moveTo(hx - 24, hy - 20); for (let i = 0; i < 5; i++) { ctx.lineTo(hx - 20 + i * 10, hy - 44 - (i === 2 ? 16 : i % 2 ? 4 : 8)); ctx.lineTo(hx - 15 + i * 10, hy - 28); } ctx.lineTo(hx + 28, hy - 20); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#40c4ff'; ell(hx, hy - 30, 3.5, 4.5); ctx.fill(); eyeGlow('#40c4ff');
    } else if (k === 'bolt') {   // 빛나는 바이저 + 안테나
      ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 3 * LWM; line(hx - 10, hy - 24, hx - 16, hy - 58); ctx.fillStyle = ((t >> 4) & 1) ? '#ff1744' : A; ell(hx - 16, hy - 60, 5, 5); ctx.fill();
      ctx.fillStyle = '#263238'; rr(hx - 6, ey - 9, 40, 15, 7); ctx.fill(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = A; ctx.globalAlpha *= 0.85; rr(hx - 3, ey - 6, 34, 9, 4); ctx.fill(); ctx.fillStyle = '#ffffff'; const sx = hx - 3 + ((t * 1.2) % 40); ctx.fillRect(sx, ey - 6, 3, 9); ctx.restore();
    } else if (k === 'coin') {   // 보석 박힌 큰 왕관
      ctx.fillStyle = '#ffd740'; ctx.strokeStyle = '#e65100'; ctx.lineWidth = 2 * LWM; poly([[hx - 22, hy - 24], [hx - 26, hy - 54], [hx - 12, hy - 40], [hx, hy - 62], [hx + 12, hy - 40], [hx + 26, hy - 54], [hx + 22, hy - 24]]); ctx.fill(); ctx.stroke();
      for (const [x, y, c] of [[hx - 26, hy - 54, '#e53935'], [hx, hy - 62, '#2979ff'], [hx + 26, hy - 54, '#00c853']]) { ctx.fillStyle = c; ell(x, y, 4, 4); ctx.fill(); } ctx.fillStyle = '#d50000'; poly([[hx, hy - 38], [hx + 5, hy - 32], [hx, hy - 26], [hx - 5, hy - 32]]); ctx.fill();
    } else if (k === 'star') {   // 별 머리띠 + 도는 별
      ctx.fillStyle = A; ctx.strokeStyle = '#000'; ctx.lineWidth = 2 * LWM; star(hx - 2, hy - 44, 15, 6); ctx.fill(); ctx.stroke(); star(hx - 22, hy - 32, 7, 3); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 3; i++) { const a = t * 0.06 + i * 2.1; ctx.fillStyle = '#ffffff'; star(hx + Math.cos(a) * 42, hy - 20 + Math.sin(a) * 12, 4, 1.6); ctx.fill(); } eyeGlow(A);
    } else if (k === 'rainbow') {   // 유니콘 뿔 + 천사 고리 + 무지개 갈기
      for (let i = 0; i < 4; i++) { ctx.strokeStyle = `hsl(${i * 70 + t * 3},90%,62%)`; ctx.lineWidth = 6 * LWM; ctx.beginPath(); ctx.moveTo(hx - 8 + i * 3, hy - 26 + i * 2); ctx.quadraticCurveTo(hx - 34, hy - 30 + i * 8 + Math.sin(t * 0.2 + i) * 4, hx - 50 - i * 2, hy - 6 + i * 10); ctx.stroke(); }
      ctx.fillStyle = '#ffe082'; ctx.strokeStyle = '#ff8f00'; ctx.lineWidth = 2 * LWM; poly([[hx + 4, hy - 26], [hx + 22, hy - 72], [hx + 16, hy - 24]]); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#ff8f00'; for (let i = 1; i < 4; i++) line(hx + 4 + i * 4.5, hy - 26 - i * 11, hx + 16 - i * 1.5, hy - 26 - i * 11 + 4);
      ctx.lineWidth = 4 * LWM; ctx.strokeStyle = '#ffd740'; ctx.beginPath(); ctx.ellipse(hx - 4, hy - 62 + Math.sin(t * 0.1) * 2, 20, 6, 0, 0, Math.PI * 2); ctx.stroke(); glow('#fff59d', hx - 4, hy - 62, 26, 0.6);
    } else if (k === 'petal') { for (let i = 0; i < 6; i++) { const x = hx - 26 + i * 10.5, y = hy - 26 - Math.sin(i / 5 * Math.PI) * 9; ctx.fillStyle = ['#ff80ab', '#fff176', '#ffffff', '#f48fb1', '#ff80ab', '#ffffff'][i]; for (let j = 0; j < 5; j++) { const a = j / 5 * Math.PI * 2; ell(x + Math.cos(a) * 4.5, y + Math.sin(a) * 4.5, 3.6, 3.6); ctx.fill(); } ctx.fillStyle = '#ffd740'; ell(x, y, 2.6, 2.6); ctx.fill(); } }
    else if (k === 'poison') {   // 유령 불꽃 + 초록 눈 + 눈가 그림자
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ell(ex + 1, ey, 11, 10); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const u = (t * 0.8 + i * 20) % 50; ctx.fillStyle = `rgba(105,240,174,${0.6 - u / 100})`; flame(hx - 18 + i * 16, hy - 26 - u * 0.4, 7, 24 - u * 0.2, ctx.fillStyle); } ctx.restore(); eyeGlow('#69f0ae');
    } else if (k === 'shadow') {   // 닌자 복면 + 달 머리띠
      ctx.save(); ell(hx, hy, 30, 29); ctx.clip(); ctx.fillStyle = '#1a1a2e'; ctx.fillRect(hx - 34, ey + 6, 70, 40); ctx.fillRect(hx - 34, hy - 40, 26, 80); ctx.fillStyle = P; ctx.fillRect(hx - 34, hy - 26, 70, 9); ctx.restore();
      ctx.fillStyle = '#b0bec5'; rr(hx + 2, hy - 28, 18, 12, 3); ctx.fill(); ctx.fillStyle = '#fff59d'; ctx.beginPath(); ctx.arc(hx + 11, hy - 22, 4.5, 0.7, 5.6); ctx.fill();
      ctx.strokeStyle = P; ctx.lineWidth = 4 * LWM; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(hx - 26, hy - 22); ctx.quadraticCurveTo(hx - 44, hy - 24 + Math.sin(t * 0.3 + i) * 6, hx - 60, hy - 14 + i * 8 + Math.sin(t * 0.25 + i) * 6); ctx.stroke(); }
    }
  } else if (L === 'front') {
    if (k === 'fire') { pauldron('#263238', '#ff6d00', null); for (let i = 0; i < 3; i++) flame(10 * bw + i * 8, -80 + by, 5, 14 + Math.sin(t * 0.4 + i) * 4, '#ff9100'); }
    else if (k === 'lava') pauldron('#4e342e', '#ff6d00', '#3e2723');
    else if (k === 'ice') pauldron('rgba(179,229,252,0.97)', '#0288d1', 'rgba(225,245,254,0.97)');
    else if (k === 'coin') pauldron('#ffd740', '#e65100', null);
    else if (k === 'bolt') { pauldron('#37474f', A, null); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = A; ell(18 * bw, -76 + by, 6, 3); ctx.fill(); ctx.restore(); }
    else if (k === 'dark') pauldron('#1a1a1a', '#7c4dff', '#1a1a1a');
    else if (k === 'star') { ctx.strokeStyle = A; ctx.lineWidth = 6 * LWM; ctx.globalAlpha *= 0.9; ctx.beginPath(); ctx.ellipse(0, -58 + by, 74 * bw, 17, -0.22, 0, Math.PI); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, -58 + by, 66 * bw, 13, -0.22, 0, Math.PI); ctx.stroke(); }
  }
  ctx.restore();
}
function drawPig(x, y, face, C, p = {}) {
  if (C.pixel && !pxOn) { const s = (p.scale || 1); return pixelate(x - 150 * s, y - 300 * s, 300 * s, 340 * s, () => drawPig(x, y, face, C, p)); }   // 볼트돈: 도트 그림
  const fx = ((p.flash ? 'brightness(2.5) ' : '') + (p.filter || '')).trim();
  if (fx && ctx !== pigFxX) return drawPigFx(x, y, face, C, p, fx);
  const s = p.scale || 1, t = p.t || 0, acc = C.acc || [], mv = p.move, k = p.k || 0, bw = C.bw || 1;
  const LW0 = LWM; LWM = acc.includes('bold') ? 1.8 : 1;   // 굵은 만화 선 (돼타로·뚱타플레티나)
  ctx.save(); ctx.translate(x, y); ctx.scale(face * s, s);
  if (p.alpha !== undefined) ctx.globalAlpha *= p.alpha;
  if (p.aura) {
    ctx.save(); const fl = Math.sin(t * 0.4) * 5;
    ctx.globalAlpha *= 0.25; ctx.fillStyle = p.aura;
    ell(0, -75, 74 + fl, 94 - fl); ctx.fill(); ell(0, -72, 58 - fl, 76 + fl); ctx.fill();
    ctx.restore();
  }
  skinDeco('aura', C, { t });   // 🎨 스킨: 돼지 뒤 빛·입자
  const filt = ((p.flash ? 'brightness(2.5) ' : '') + (p.filter || '')).trim();
  if (filt) ctx.filter = filt;
  // crouchK·hurtK·blockK·walkK: 싸우는 돼지는 smoothPose가 0~1로 부드럽게 넣어 줌. 없으면(메뉴 그림 등) 예전처럼 켜짐/꺼짐
  const ck = p.crouchK ?? (p.crouch ? 1 : 0), hk = p.hurtK ?? (p.hurt ? 1 : 0), bk2 = p.blockK ?? (p.block ? 1 : 0), wk = p.walkK ?? (p.walk ? 1 : 0);
  if (ck > 0.005) ctx.scale(1, 1 - 0.28 * ck);
  if (p.foxTails) for (let i = 0; i < 9; i++) drawTail(-34, -62, Math.PI + (i - 4) * 0.22 - 0.5, 130, t, p.foxTails);   // 구미호 꼬리: 엉덩이에 붙어서 같이 움직임
  if (p.ko) { ctx.translate(0, -46 * p.ko); ctx.rotate(Math.PI / 2 * p.ko); }
  else if (mv === 'dash') ctx.rotate(0.38 * k - 0.22 * hk);
  else if (hk > 0.005) ctx.rotate(-0.22 * hk);
  if (p.tilt) ctx.rotate(p.tilt);
  if (p.roll !== undefined) { ctx.translate(0, -60); ctx.rotate(p.roll); ctx.translate(0, 60); }
  if (p.spin !== undefined && Math.cos(p.spin) < 0) ctx.scale(-1, 1);
  const bob = p.ko ? 0 : -Math.abs(Math.sin(t * 0.25)) * 5 * wk + Math.sin(t * 0.07) * 2 * (1 - wk);   // 걷기 ↔ 서 있기 흔들림을 섞어서 전환
  const by = bob + 6 * bk2, sw = Math.sin(t * 0.25) * 10 * wk;
  const air = p.air || p.roll !== undefined;
  const gl = acc.includes('gloves'), hc = gl ? '#e53935' : null, hr = gl ? 12 : null;

  // 손발 나눠 쓰기: I(오른손)·K(오른발) = 몸 앞쪽(보이는 쪽) 팔다리, O(왼손)·L(왼발) = 몸 뒤쪽 팔다리 (p.backLimb)
  const PUNCHES = { jab: 1, punch: 1, uppercut: 1 };
  const bArm = !!(p.backLimb && PUNCHES[mv]), bLeg = !!(p.backLimb && KICKS[mv]);
  const armAt = m => m === 'jab' ? [38 + 50 * k, -82 + by] : m === 'punch' ? [38 + 66 * k, -72 + by] : [lerp(40, 60, k), lerp(-46, -150, k) + by];
  const CB = shadeLook(C);   // 몸 뒤쪽 팔다리는 살짝 어둡게 (몸통보다 먼저 그려서 몸 뒤에 있음)

  // back leg & back arm (몸통보다 먼저 = 몸 뒤)
  let bl;
  // 뒤쪽 손발(O·L)로 공격할 때도 몸통보다 먼저 그려서 몸 뒤에 있음 → 몸 밖으로 뻗은 부분만 보임
  if (bLeg) { const a = lerp(Math.PI / 2, Math.max(-0.35, KICKS[mv][0]), k), L = 38 + (KICKS[mv][1] + 22) * k; bl = [10 * bw + Math.cos(a) * L, -34 + by + Math.sin(a) * L]; }   // 얼굴을 가로지르지 않게 조금 낮게
  if (bLeg) limb(10 * bw, -34 + by, bl[0], bl[1], 14, CB);
  else { bl = [-26 * bw + sw, air ? -14 : -7]; limb(-22 * bw, -38 + by, bl[0], bl[1], 14, CB); }
  let ba;
  if (bArm) { const q = armAt(mv); ba = [q[0] + 14, q[1]]; }   // 뒷팔은 어깨가 뒤에 있어서 조금 더 뻗어야 앞까지 닿음
  else if (mv === 'grab') ba = [74, -64 + by];
  else if (mv === 'counter') ba = [-52, -100 + by];
  else if (p.block) ba = [36, -92 + by];
  else if (p.scared) ba = [-8, -124];
  else if (p.victory) ba = [-16, -70 + by];
  else if (mv === 'dash' || p.roll !== undefined) ba = [-32, -58 + by];
  else ba = [70, -58 + by];   // 서 있을 때 뒷팔: 몸 뒤에서 턱 아래로 발굽만 살짝 나온 가드
  if (C.wpn && p.wpnOut && POLES.includes(C.wpn)) { const fh = handAt(mv, k, by), a = Math.atan2(fh[1] - (-64 + by), fh[0] - 20 * bw); ba = [fh[0] - Math.cos(a) * 42, fh[1] - Math.sin(a) * 42]; }   // 창은 양손으로: 뒷손이 앞손 뒤 자루를 잡음
  limb(-4, -64 + by, ba[0], ba[1], 12, CB, hc, hr);

  // tail
  ctx.strokeStyle = C.dark; ctx.lineWidth = 4 * LWM; ctx.lineCap = 'round'; ctx.beginPath();
  ctx.moveTo(-44 * bw, -62 + by);
  const tw = Math.sin(t * 0.2) * 0.6;
  for (let i = 0; i <= 18; i++) { const a = i * 0.55 + tw, r = 9 - i * 0.38; ctx.lineTo(-56 * bw + Math.cos(a) * r, -68 + by + Math.sin(a) * r); }
  ctx.stroke();
  skinDeco('back', C, { bw, by, t });
  if (C.wpn && !p.wpnOut && WPN_BACK.includes(C.wpn)) drawWeapon(C.wpn, C.wpn === 'guitar' ? -14 * bw : (POLES.includes(C.wpn) || C.wpn === 'bow' ? -30 : -36) * bw, (C.wpn === 'guitar' ? -132 : POLES.includes(C.wpn) || C.wpn === 'bow' ? -84 : -44) + by, C.wpn === 'guitar' ? 2.05 : -1.2, t, true);   // 기타는 등 위쪽에 비스듬히   // 무기를 등에 멤   // 🎨 스킨: 몸 뒤 (가시·날개·망토)

  if (C.fx) {
    ctx.save(); const tt = t * 0.15; ctx.globalCompositeOperation = 'lighter';
    if (C.fx === 'fxfire') for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + tt, r = 54 + Math.sin(tt * 3 + i) * 6; ctx.fillStyle = `rgba(255,${110 + i * 15},0,0.35)`; ell(Math.cos(a) * r * 0.95, -70 + Math.sin(a) * r * 1.1, 11, 18, a); ctx.fill(); }
    else if (C.fx === 'fxbolt') { ctx.strokeStyle = 'rgba(128,216,255,0.85)'; ctx.lineWidth = 3 * LWM; for (let i = 0; i < 3; i++) { if ((((t / 5) | 0) + i) % 3 === 0) continue; let x = -55 + i * 55, y = -160; ctx.beginPath(); ctx.moveTo(x, y); for (let j = 0; j < 5; j++) { x += (j % 2 ? -1 : 1) * 12; y += 28; ctx.lineTo(x, y); } ctx.stroke(); } }
    else if (C.fx === 'fxrainbow') { ctx.lineWidth = 4 * LWM; for (let i = 0; i < 6; i++) { ctx.strokeStyle = `hsla(${(t * 4 + i * 60) % 360},90%,60%,0.45)`; ell(0, -70, 62 + i * 4, 82 + i * 4); ctx.stroke(); } }
    ctx.restore();
  }
  if (p.curse) {   // 저주왕: 팔 한 쌍 더 (몸 뒤에서 앞으로 뻗음 · 평타 때 같이 뻗음)
    const ext = (mv === 'punch' || mv === 'jab' || mv === 'uppercut') ? 28 * k : 0;
    ctx.save(); ctx.globalAlpha *= p.curse; ctx.lineCap = 'round';
    for (const [oy, d] of [[-52, 1], [-38, 0.75]]) { const ex = 52 + ext * d, ey = oy + 10 + by; ctx.strokeStyle = C.dark; ctx.lineWidth = 13 * LWM; line(-6, oy + by, ex, ey); ctx.strokeStyle = C.body; ctx.lineWidth = 9 * LWM; line(-6, oy + by, ex, ey); ctx.fillStyle = C.hoof || C.dark; ctx.beginPath(); ctx.arc(ex + 3, ey, 7.5, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#120000'; ctx.lineWidth = 2 * LWM; line(16, oy + by + 2, 26, oy + by + 5); }
    ctx.restore();
  }
  // body
  ctx.fillStyle = shadeFill(C.body, -14 * bw, -80 + by, 50 * bw); ctx.strokeStyle = C.dark; ctx.lineWidth = 3 * LWM;

  ell(0, -60 + by, 46 * bw, 34); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.belly; ell(6, -46 + by, 28 * bw, 15); ctx.fill();
  skinDeco('body', C, { bw, by, t });   // 🎨 스킨: 몸 무늬
  if (acc.includes('muscle')) {   // 근육: 가슴·복근 선 + 빛나는 별 무늬
    ctx.strokeStyle = C.dark; ctx.lineWidth = 2.5 * LWM; ctx.globalAlpha *= 0.8;
    ctx.beginPath(); ctx.arc(-4 * bw, -74 + by, 15 * bw, 0.2, 2.4); ctx.stroke(); ctx.beginPath(); ctx.arc(22 * bw, -74 + by, 15 * bw, 0.7, 2.9); ctx.stroke();
    for (let i = 0; i < 3; i++) { line(2 * bw, -54 + by + i * 8, 12 * bw, -54 + by + i * 8); line(16 * bw, -54 + by + i * 8, 26 * bw, -54 + by + i * 8); }
    ctx.globalAlpha /= 0.8;
    ctx.fillStyle = '#ffe082'; star(-24 * bw, -72 + by, 7, 3); ctx.fill();
  }
  if (mv === 'counter') { ctx.fillStyle = `rgba(255,235,59,${0.45 + 0.3 * Math.sin(t * 0.6)})`; ell(6, -52 + by, 36 * bw, 24); ctx.fill(); }
  if (acc.includes('spots')) { ctx.fillStyle = 'rgba(160,90,70,0.35)'; ell(-20, -70 + by, 9, 7); ctx.fill(); ell(-4, -84 + by, 6, 5); ctx.fill(); ell(-30, -52 + by, 6, 5); ctx.fill(); }
  if (acc.includes('bristle')) {
    ctx.fillStyle = C.dark; ctx.beginPath(); ctx.moveTo(-40, -82 + by);
    for (let i = 0; i < 7; i++) { ctx.lineTo(-34 + i * 8, -106 + by + (i % 2) * 4); ctx.lineTo(-30 + i * 8, -92 + by); }
    ctx.lineTo(20, -90 + by); ctx.closePath(); ctx.fill();
  }
  if (acc.includes('pircoat')) {   // 빨간 해적 코트 + 금 테두리 + 허리띠 (캡틴베이컨)
    ctx.save(); ell(0, -60 + by, 46 * bw, 34); ctx.clip(); ctx.fillStyle = '#b71c1c'; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 74);
    ctx.fillStyle = '#fafafa'; poly([[4 * bw, -94 + by], [22 * bw, -94 + by], [14 * bw, -62 + by]]); ctx.fill();
    ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 3 * LWM; line(2 * bw, -94 + by, 6 * bw, -28 + by); ctx.fillStyle = '#3e2723'; ctx.fillRect(-50 * bw, -50 + by, 100 * bw, 8); ctx.fillStyle = '#ffd54f'; rr(6 * bw, -52 + by, 12, 12, 2); ctx.fill(); ctx.restore();
  }
  if (acc.includes('robe')) {   // 별 무늬 보라 마법사 로브 (꿀린)
    ctx.save(); ell(0, -60 + by, 46 * bw, 34); ctx.clip(); const rg = ctx.createLinearGradient(0, -96 + by, 0, -26 + by); rg.addColorStop(0, '#5e35b1'); rg.addColorStop(1, '#311b92');
    ctx.fillStyle = rg; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 74); ctx.fillStyle = '#ffd740'; for (const [x2, y2] of [[-30, -80], [-6, -54], [20, -84], [-24, -44]]) { star(x2 * bw, y2 + by, 5, 2.2); ctx.fill(); } ctx.restore();
  }
  if (acc.includes('apron')) {   // 흰 앞치마 (훈제돈)
    ctx.save(); ell(0, -60 + by, 46 * bw, 34); ctx.clip(); ctx.fillStyle = '#fafafa'; ctx.fillRect(-4 * bw, -88 + by, 40 * bw, 66); ctx.strokeStyle = '#bdbdbd'; ctx.lineWidth = 1.5 * LWM; ctx.strokeRect(-4 * bw, -88 + by, 40 * bw, 66);
    ctx.fillStyle = '#e65100'; ctx.fillRect(4 * bw, -64 + by, 20 * bw, 10); ctx.restore();
  }
  if (acc.includes('spacesuit')) {   // 흰 우주복 + 주황 줄 + 파란 가슴 패치 (우주꿀돈)
    ctx.save(); ell(0, -60 + by, 46 * bw, 34); ctx.clip(); const sg = ctx.createLinearGradient(0, -96 + by, 0, -26 + by); sg.addColorStop(0, '#fafafa'); sg.addColorStop(1, '#cfd8dc');
    ctx.fillStyle = sg; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 74); ctx.fillStyle = '#ff6d00'; ctx.fillRect(-50 * bw, -58 + by, 100 * bw, 6);
    ctx.fillStyle = '#1e88e5'; rr(6 * bw, -84 + by, 16, 12, 3); ctx.fill(); ctx.fillStyle = '#fff'; star(14 * bw, -78 + by, 4, 2); ctx.fill();
    ctx.restore(); ctx.fillStyle = '#90a4ae'; rr(-58 * bw, -92 + by, 14, 34, 4); ctx.fill();   // 등 산소통
  }
  if (acc.includes('idoldress')) {   // 분홍 프릴 무대 옷 + 리본 (핑크하트)
    ctx.save(); ell(0, -60 + by, 46 * bw, 34); ctx.clip(); ctx.fillStyle = '#ff80ab'; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 74);
    ctx.fillStyle = '#fff'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(-44 * bw + i * 11 * bw, -36 + by, 6, 0, Math.PI); ctx.fill(); }
    ctx.restore(); ctx.fillStyle = '#ff4081'; poly([[10 * bw, -86 + by], [2 * bw, -94 + by], [2 * bw, -78 + by]]); ctx.fill(); poly([[10 * bw, -86 + by], [18 * bw, -94 + by], [18 * bw, -78 + by]]); ctx.fill();
  }
  if (acc.includes('hoodie')) {   // 밝은 회색 지퍼 후드티 + 지퍼 · 주머니 (이타돼리)
    ctx.save(); ell(0, -60 + by, 46 * bw, 34); ctx.clip();
    const hg2 = ctx.createLinearGradient(-40 * bw, -96 + by, 30 * bw, -26 + by); hg2.addColorStop(0, '#f5f5f5'); hg2.addColorStop(1, '#bdbdbd');
    ctx.fillStyle = hg2; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 74);
    ctx.strokeStyle = '#616161'; ctx.lineWidth = 2 * LWM; line(14 * bw, -94 + by, 12 * bw, -28 + by);   // 지퍼
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.5 * LWM; ctx.beginPath(); ctx.moveTo(-8 * bw, -48 + by); ctx.quadraticCurveTo(6 * bw, -40 + by, 24 * bw, -48 + by); ctx.stroke();   // 주머니
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; for (let i = 0; i < 3; i++) line(-36 * bw + i * 10 * bw, -86 + by, -30 * bw + i * 10 * bw, -40 + by);   // 천 주름
    ctx.restore();
  }
  if (acc.includes('uniform')) {   // 남색 교복 (높은 깃 · 소용돌이 금단추) + 목 뒤 빨간 후드 (이타돼리)
    ctx.save(); ell(0, -60 + by, 46 * bw, 34); ctx.clip();
    const ug = ctx.createLinearGradient(0, -96 + by, 0, -26 + by); ug.addColorStop(0, '#22263a'); ug.addColorStop(1, '#0b0d17');
    ctx.fillStyle = ug; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 74);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2 * LWM; line(12 * bw, -92 + by, 10 * bw, -28 + by);   // 앞섶
    ctx.fillStyle = '#ffd54f'; ctx.strokeStyle = '#8d6e00'; ctx.lineWidth = 1 * LWM;
    for (let i = 0; i < 3; i++) { ell(16 * bw, -82 + by + i * 14, 3.4, 3.4); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(16 * bw, -82 + by + i * 14, 1.6, 0, 4.5); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ell(-16 * bw, -78 + by, 18 * bw, 8); ctx.fill();   // 천 광택
    ctx.restore();
    const hg = ctx.createLinearGradient(0, -104 + by, 0, -82 + by); hg.addColorStop(0, '#e53935'); hg.addColorStop(1, '#8e0000');   // 빨간 후드 (주름 두 줄)
    ctx.fillStyle = hg; ctx.strokeStyle = '#5d0000'; ctx.lineWidth = 1.5 * LWM;
    ctx.beginPath(); ctx.ellipse(-12 * bw, -93 + by, 34 * bw, 15, -0.12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(-10 * bw, -92 + by, 18 * bw, 6, -0.12, 0.2, 2.9); ctx.stroke();
    ctx.fillStyle = '#1c2340'; rr(8 * bw, -100 + by, 14 * bw, 12, 3); ctx.fill();   // 높은 깃
  }
  if (acc.includes('ninja')) {   // 주황·검정 닌자 옷 (돼루토): 몸은 주황, 어깨·윗등은 검정, 흰 깃
    ctx.save(); ell(0, -60 + by, 46 * bw, 34); ctx.clip();
    const ng = ctx.createLinearGradient(0, -96 + by, 0, -26 + by); ng.addColorStop(0, '#ff9100'); ng.addColorStop(1, '#e65100');
    ctx.fillStyle = ng; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 74);
    ctx.fillStyle = '#1c1c22'; ctx.beginPath(); ctx.ellipse(-6 * bw, -94 + by, 46 * bw, 16, 0, 0, Math.PI * 2); ctx.fill();   // 검은 어깨
    ctx.fillStyle = '#fafafa'; ctx.fillRect(10 * bw, -92 + by, 8 * bw, 10);   // 흰 깃
    ctx.strokeStyle = '#bf360c'; ctx.lineWidth = 2 * LWM; line(14 * bw, -82 + by, 12 * bw, -30 + by);   // 지퍼
    ctx.fillStyle = '#1c1c22'; ctx.fillRect(-50 * bw, -40 + by, 100 * bw, 6);   // 허리띠
    ctx.restore();
    ctx.strokeStyle = '#bf360c'; ctx.lineWidth = 2 * LWM; ctx.beginPath(); ctx.arc(-24 * bw, -66 + by, 8, 0.3, 5.6); ctx.stroke();   // 등의 소용돌이 무늬
  }
  if (acc.includes('robot')) {   // 로봇 몸: 금속 판 이음선 · 볼트 · 가슴 원자로 불빛 · 등 배기구 (볼트돈)
    ctx.save(); ell(0, -60 + by, 46 * bw, 34); ctx.clip();
    ctx.strokeStyle = 'rgba(38,50,56,0.7)'; ctx.lineWidth = 2 * LWM;
    line(-10 * bw, -94 + by, -14 * bw, -26 + by); line(-46 * bw, -64 + by, 46 * bw, -68 + by);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ell(-14 * bw, -80 + by, 20 * bw, 6); ctx.fill();   // 금속 광택
    ctx.restore();
    ctx.fillStyle = '#607d8b'; ctx.strokeStyle = '#263238'; ctx.lineWidth = 1 * LWM;
    for (const [bx2, by2] of [[-30, -78], [-30, -48], [6, -86], [-6, -40], [30, -56]]) { ell(bx2 * bw, by2 + by, 3, 3); ctx.fill(); ctx.stroke(); }   // 볼트
    ctx.save(); ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 12; ctx.fillStyle = `rgba(255,23,68,${0.7 + 0.3 * Math.sin(t * 0.25)})`; ell(18 * bw, -60 + by, 7, 7); ctx.fill(); ctx.restore();   // 가슴 원자로
    ctx.fillStyle = '#37474f'; rr(-50 * bw, -88 + by, 10, 22, 3); ctx.fill();   // 등 배기구
    if (((t / 8) | 0) % 3 === 0) { ctx.fillStyle = 'rgba(200,210,220,0.4)'; ell(-56 * bw, -96 + by - (t % 8), 6, 6); ctx.fill(); }
  }
  if (acc.includes('coat')) {   // 긴 검은 코트: 등을 덮고 앞은 열림 + 금단추·금줄, 뒤로 펄럭이는 자락
    const fl = Math.sin(t * 0.2) * 6, fl2 = Math.sin(t * 0.2 + 1.3) * 5;
    // 뒤로 펄럭이는 긴 자락 두 갈래 (몸 뒤에 먼저)
    ctx.fillStyle = '#141626'; ctx.strokeStyle = '#05060c'; ctx.lineWidth = 2 * LWM;
    poly([[-30 * bw, -52 + by], [-70 * bw + fl, -2 + by], [-48 * bw + fl * 0.5, 4 + by], [-14 * bw, -34 + by]]); ctx.fill(); ctx.stroke();
    poly([[-18 * bw, -40 + by], [-44 * bw + fl2, 10 + by], [-24 * bw + fl2 * 0.5, 12 + by], [-2 * bw, -30 + by]]); ctx.fill(); ctx.stroke();
    ctx.save(); ell(0, -60 + by, 46 * bw, 34); ctx.clip();
    const cg = ctx.createLinearGradient(0, -96 + by, 0, -24 + by); cg.addColorStop(0, '#2a2d45'); cg.addColorStop(1, '#12131f');
    ctx.fillStyle = cg; ctx.fillRect(-50 * bw, -96 + by, 64 * bw, 72);
    ctx.strokeStyle = '#3d4163'; ctx.lineWidth = 2 * LWM; ctx.beginPath(); ctx.moveTo(14 * bw, -92 + by); ctx.lineTo(4 * bw, -64 + by); ctx.lineTo(14 * bw, -30 + by); ctx.stroke();   // 앞섶 깃
    ctx.fillStyle = '#ffd54f'; ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 1 * LWM; for (let i = 0; i < 4; i++) { ell(8 * bw, -82 + by + i * 13, 3.2, 3.2); ctx.fill(); ctx.stroke(); }
    ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 2.5 * LWM; ctx.setLineDash([3, 2]);   // 금 사슬
    ctx.beginPath(); ctx.moveTo(14 * bw, -88 + by); ctx.quadraticCurveTo(30 * bw, -72 + by, 16 * bw, -54 + by); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    ctx.fillStyle = '#141626'; poly([[-44 * bw, -78 + by], [-30 * bw, -100 + by], [-12 * bw, -96 + by], [-24 * bw, -76 + by]]); ctx.fill();   // 세운 깃
  }
  if (acc.includes('belt') || acc.includes('mawashi')) {
    ctx.save(); ell(0, -60 + by, 46 * bw, 34); ctx.clip();
    if (acc.includes('belt')) { ctx.fillStyle = '#212121'; ctx.fillRect(-6, -96 + by, 14, 72); }
    else { ctx.fillStyle = C.band; ctx.fillRect(-38 * bw, -96 + by, 34 * bw, 72); ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(-38 * bw, -60 + by, 34 * bw, 6); }
    ctx.restore();
    if (acc.includes('belt')) { ctx.strokeStyle = '#212121'; ctx.lineWidth = 5 * LWM; line(4, -40 + by, 12, -20 + by); line(0, -40 + by, -6, -20 + by); }
  }

  // front leg
  let fl;
  if (KICKS[mv] && !bLeg) { const a = lerp(Math.PI / 2, KICKS[mv][0], k), L = 38 + KICKS[mv][1] * k; fl = [20 * bw + Math.cos(a) * L, -38 + by + Math.sin(a) * L]; }
  else fl = [22 * bw - sw, air ? -14 : -7];
  if (C.wpn && !p.weapon && !p.wpnOut && !FIST_W.includes(C.wpn) && !WPN_BACK.includes(C.wpn)) drawWeapon(C.wpn, (GUNS.includes(C.wpn) ? 2 : 14) * bw, (GUNS.includes(C.wpn) ? -52 : -56) + by, GUNS.includes(C.wpn) ? 1.5 : 2.78, t, true);   // 허리에 찬 무기: 몸 위 · 앞다리·앞팔보다 먼저 (다리를 가리지 않게)
  limb(20 * bw, -38 + by, fl[0], fl[1], 15, C);

  // head
  const hx = 36 * bw + (mv === 'dash' ? 10 * k : 0) + ((mv === 'punch' || mv === 'jab') ? 6 * k : 0), hy = -90 + by;
  if (acc.includes('mane')) {   // 뒤로 휘날리는 긴 머리 (머리보다 먼저 그려서 뒤에 보이게)
    ctx.fillStyle = '#2a1650'; ctx.strokeStyle = '#140a2e'; ctx.lineWidth = 2 * LWM;
    for (let i = 0; i < 5; i++) {
      const w = Math.sin(t * 0.15 + i * 0.9) * 8, y0 = hy - 26 + i * 9;
      ctx.beginPath(); ctx.moveTo(hx - 6, y0); ctx.quadraticCurveTo(hx - 40, y0 - 14 + w, hx - 74 - i * 6, y0 + 10 + w * 1.4);
      ctx.quadraticCurveTo(hx - 40, y0 + 8 + w * 0.5, hx - 4, y0 + 12); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }
  if (acc.includes('twintail')) {   // 핑크하트 양갈래: 머리 뒤쪽 위에서 묶어 아래로 늘어짐 (얼굴을 가리지 않게 머리보다 먼저)
    ctx.fillStyle = '#f06292'; ctx.strokeStyle = '#ad1457'; ctx.lineWidth = 1.5 * LWM;
    for (const [dx, a] of [[-30, 0.35], [-16, 0.12]]) { const w = Math.sin(t * 0.15 + dx) * 0.08; ctx.beginPath(); ctx.ellipse(hx + dx - 6, hy + 6, 10, 28, a + w, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = '#ff4081'; for (const dx of [-30, -16]) { ell(hx + dx, hy - 20, 6, 5); ctx.fill(); }
  }
  ctx.fillStyle = C.dark; poly([[hx - 20, hy - 18], [hx - 14, hy - 44], [hx - 2, hy - 26]]); ctx.fill();
  ctx.fillStyle = shadeFill(C.body, hx - 8, hy - 12, 32); ctx.strokeStyle = C.dark; ctx.lineWidth = 3 * LWM;
  ell(hx, hy, 30, 29); ctx.fill(); ctx.stroke();
  poly([[hx - 2, hy - 24], [hx + 12, hy - 48], [hx + 18, hy - 20]]); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.snout; poly([[hx + 4, hy - 26], [hx + 11, hy - 40], [hx + 14, hy - 24]]); ctx.fill();

  // head accessories
  if (acc.includes('mask')) {
    ctx.save(); ell(hx, hy, 30, 29); ctx.clip(); ctx.fillStyle = '#1a1028'; ctx.fillRect(hx - 32, hy - 17, 64, 19); ctx.restore();
    ctx.strokeStyle = '#1a1028'; ctx.lineWidth = 6 * LWM;
    for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(hx - 28, hy - 8); ctx.quadraticCurveTo(hx - 48, hy - 12 + Math.sin(t * 0.3 + i) * 6, hx - 66, hy - 2 + i * 10 + Math.sin(t * 0.25 + i * 2) * 8); ctx.stroke(); }
  }
  if (acc.includes('tricorn')) {   // 해적 삼각 모자 + 해골 (캡틴베이컨)
    ctx.fillStyle = '#212121'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5 * LWM;
    poly([[hx - 40, hy - 22], [hx + 34, hy - 24], [hx + 22, hy - 34], [hx, hy - 50], [hx - 26, hy - 36]]); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 2 * LWM; line(hx - 38, hy - 24, hx + 32, hy - 26); txt('☠', hx - 2, hy - 36, 14, '#fff', null);
  }
  if (acc.includes('eyepatch')) { ctx.fillStyle = '#111'; ell(hx + 10, hy - 4, 8, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 2 * LWM; line(hx - 20, hy - 14, hx + 26, hy - 10); }   // 안대
  if (acc.includes('wizhat')) {   // 별 달린 보라 고깔모자 (꿀린)
    ctx.fillStyle = '#4527a0'; ctx.strokeStyle = '#1a0f40'; ctx.lineWidth = 1.5 * LWM;
    poly([[hx - 34, hy - 20], [hx + 30, hy - 22], [hx - 10 + Math.sin(t * 0.1) * 4, hy - 82]]); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#311b92'; ell(hx - 2, hy - 21, 36, 6); ctx.fill(); ctx.fillStyle = '#ffd740'; star(hx - 4, hy - 46, 6, 2.6); ctx.fill(); star(hx + 8, hy - 30, 4, 1.8); ctx.fill();
  }
  if (acc.includes('beard')) { ctx.fillStyle = '#eeeeee'; ctx.strokeStyle = '#bdbdbd'; ctx.lineWidth = 1 * LWM; ctx.beginPath(); ctx.moveTo(hx + 4, hy + 14); ctx.quadraticCurveTo(hx + 18, hy + 54, hx + 30, hy + 16); ctx.closePath(); ctx.fill(); ctx.stroke(); }   // 흰 수염
  if (acc.includes('toque')) {   // 높은 흰 셰프 모자 (훈제돈)
    ctx.fillStyle = '#fafafa'; ctx.strokeStyle = '#9e9e9e'; ctx.lineWidth = 1.5 * LWM;
    rr(hx - 22, hy - 34, 40, 14, 3); ctx.fill(); ctx.stroke();
    for (const [dx, dy, r] of [[-14, -48, 13], [0, -56, 15], [14, -48, 13]]) { ctx.beginPath(); ctx.arc(hx + dx, hy + dy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  }
  if (acc.includes('mustache')) { ctx.fillStyle = '#4e342e'; for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.ellipse(hx + 24 + sgn * 7, hy + 12, 8, 3.5, sgn * 0.4, 0, Math.PI * 2); ctx.fill(); } }   // 콧수염
  if (acc.includes('twintail')) {   // 분홍 앞머리 + 별 핀 (핑크하트) · 양갈래 꼬리는 머리 뒤에 먼저 그림
    ctx.fillStyle = '#f06292'; ctx.strokeStyle = '#ad1457'; ctx.lineWidth = 1.5 * LWM;
    ctx.beginPath(); ctx.ellipse(hx - 2, hy - 24, 30, 12, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffd740'; star(hx + 14, hy - 26, 6, 3); ctx.fill();
  }
  if (acc.includes('helmet')) {   // 유리 우주 헬멧 (우주꿀돈)
    ctx.save(); ctx.fillStyle = 'rgba(179,229,252,0.22)'; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3 * LWM;
    ctx.beginPath(); ctx.arc(hx + 4, hy - 2, 44, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 4 * LWM; ctx.beginPath(); ctx.arc(hx + 4, hy - 2, 34, -2.4, -1.6); ctx.stroke();
    ctx.fillStyle = '#b0bec5'; rr(hx - 30, hy + 34, 66, 10, 4); ctx.fill(); ctx.restore();
  }
  if (acc.includes('hoodup')) {   // 뒤집어쓴 후드: 머리 뒤·위를 덮고 얼굴 위쪽은 그림자 · 앞머리 몇 가닥 · 후드 끈
    ctx.save();
    ctx.fillStyle = 'rgba(12,8,16,0.7)'; ctx.beginPath(); ctx.ellipse(hx + 8, hy - 16, 30, 16, 0.08, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(12,8,16,0.35)'; ctx.beginPath(); ctx.ellipse(hx + 6, hy - 2, 28, 12, 0.08, 0, Math.PI * 2); ctx.fill();   // 얼굴 위 그림자
    ctx.fillStyle = '#f06292'; for (const dx of [6, 14, 22]) { ctx.beginPath(); ctx.moveTo(hx + dx - 5, hy - 22); ctx.lineTo(hx + dx, hy - 10); ctx.lineTo(hx + dx + 4, hy - 22); ctx.closePath(); ctx.fill(); }   // 삐져나온 분홍 앞머리
    const hg3 = ctx.createLinearGradient(hx - 46, hy - 50, hx + 30, hy + 30); hg3.addColorStop(0, '#fafafa'); hg3.addColorStop(1, '#9e9e9e');
    ctx.fillStyle = hg3; ctx.strokeStyle = '#424242'; ctx.lineWidth = 2 * LWM;
    ctx.beginPath(); ctx.moveTo(hx + 24, hy - 50); ctx.quadraticCurveTo(hx - 30, hy - 72, hx - 54, hy - 18); ctx.quadraticCurveTo(hx - 58, hy + 26, hx - 18, hy + 40); ctx.lineTo(hx + 4, hy + 34); ctx.quadraticCurveTo(hx - 22, hy + 6, hx - 6, hy - 22); ctx.quadraticCurveTo(hx + 8, hy - 38, hx + 30, hy - 34); ctx.closePath(); ctx.fill(); ctx.stroke();   // 후드 (앞이 뚫린 초승달 모양)
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.5 * LWM; ctx.beginPath(); ctx.moveTo(hx - 40, hy - 30); ctx.quadraticCurveTo(hx - 20, hy - 50, hx + 10, hy - 46); ctx.stroke(); ctx.beginPath(); ctx.moveTo(hx - 46, hy); ctx.quadraticCurveTo(hx - 40, hy + 22, hx - 20, hy + 30); ctx.stroke();   // 후드 주름
    ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 2 * LWM; line(hx - 2, hy + 30, hx - 4, hy + 52); line(hx + 10, hy + 32, hx + 12, hy + 54);   // 후드 끈
    ctx.fillStyle = '#9e9e9e'; ctx.fillRect(hx - 6, hy + 50, 4, 7); ctx.fillRect(hx + 10, hy + 52, 4, 7);
    ctx.restore();
  }
  if (acc.includes('pinkhair')) {   // 분홍 삐죽 머리 (뿌리는 어둡게) + 옆은 짧게 깎은 검은 머리 (이타돼리)
    ctx.fillStyle = 'rgba(45,30,30,0.55)'; ell(hx - 12, hy - 4, 19, 14); ctx.fill();   // 짧게 깎은 옆머리
    ctx.strokeStyle = 'rgba(80,60,60,0.5)'; ctx.lineWidth = 1 * LWM; for (let i = 0; i < 4; i++) line(hx - 26 + i * 6, hy - 12, hx - 24 + i * 6, hy + 4);
    const hg = ctx.createLinearGradient(0, hy - 50, 0, hy - 18); hg.addColorStop(0, '#f8bbd0'); hg.addColorStop(0.7, '#f06292'); hg.addColorStop(1, '#4e2a35');
    ctx.fillStyle = hg; ctx.strokeStyle = '#880e4f'; ctx.lineWidth = 1.6 * LWM;
    poly([[hx + 28, hy - 14], [hx + 38, hy - 30], [hx + 22, hy - 32], [hx + 26, hy - 50], [hx + 8, hy - 42], [hx + 4, hy - 62], [hx - 8, hy - 44], [hx - 20, hy - 60], [hx - 24, hy - 40], [hx - 42, hy - 48], [hx - 36, hy - 28], [hx - 46, hy - 20], [hx - 26, hy - 18], [hx - 6, hy - 24]]); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5 * LWM; line(hx - 2, hy - 46, hx + 2, hy - 34); line(hx + 12, hy - 44, hx + 14, hy - 34);   // 머리 광택
  }
  if (acc.includes('spiky')) {   // 삐죽삐죽한 노란 머리 (돼루토)
    ctx.fillStyle = '#ffd600'; ctx.strokeStyle = '#c79100'; ctx.lineWidth = 1.5 * LWM;
    poly([[hx + 22, hy - 18], [hx + 30, hy - 36], [hx + 12, hy - 30], [hx + 10, hy - 50], [hx - 4, hy - 34], [hx - 14, hy - 54], [hx - 20, hy - 32], [hx - 38, hy - 44], [hx - 32, hy - 24], [hx - 48, hy - 22], [hx - 30, hy - 12], [hx - 4, hy - 22]]); ctx.fill(); ctx.stroke();
  }
  if (acc.includes('hitai')) {   // 이마 보호대: 남색 천 + 금속판 (판에는 돼지 코 무늬)
    ctx.strokeStyle = '#1a237e'; ctx.lineWidth = 6 * LWM; ctx.beginPath(); ctx.moveTo(hx - 30, hy - 12); ctx.quadraticCurveTo(hx, hy - 26, hx + 28, hy - 18); ctx.stroke();
    ctx.lineWidth = 4 * LWM; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(hx - 30, hy - 12); ctx.quadraticCurveTo(hx - 46, hy - 16 + Math.sin(t * 0.3 + i) * 6, hx - 60, hy - 6 + i * 9 + Math.sin(t * 0.25 + i * 2) * 5); ctx.stroke(); }
    ctx.fillStyle = '#b0bec5'; ctx.strokeStyle = '#546e7a'; ctx.lineWidth = 1.5 * LWM; rr(hx - 6, hy - 27, 26, 13, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#546e7a'; ell(hx + 7, hy - 20, 6, 4); ctx.fill(); ctx.fillStyle = '#b0bec5'; ell(hx + 5, hy - 20, 1.3, 1.6); ctx.fill(); ell(hx + 9, hy - 20, 1.3, 1.6); ctx.fill();
  }
  if (p.curse) {   // 저주왕: 문신 · 붉은 눈 두 쌍 · 팔 한 쌍 더 (돼지 그림 안이라 몸과 같이 움직임)
    ctx.save(); ctx.globalAlpha *= p.curse; ctx.strokeStyle = '#120000'; ctx.lineWidth = 3 * LWM; ctx.lineCap = 'round';
    for (let i = 0; i < 2; i++) line(hx + 6 + i * 7, hy + 6, hx + 4 + i * 7, hy + 18);
    line(hx - 8, hy - 18, hx + 16, hy - 22); line(hx - 4, hy - 26, hx + 10, hy - 28);
    ctx.beginPath(); ctx.arc(hx - 6, hy + 8, 8, 0.3, 2.2); ctx.stroke();
    ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 10; ctx.fillStyle = '#ff1744';
    for (const dy of [-6, 4]) { ctx.beginPath(); ctx.ellipse(hx + 12, hy + dy, 3.5, 2.2, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.shadowBlur = 0;
    ctx.restore();
  }
  if (acc.includes('whisker')) {   // 볼의 수염 자국 3줄
    ctx.strokeStyle = 'rgba(90,40,30,0.75)'; ctx.lineWidth = 1.8 * LWM;
    for (let i = 0; i < 3; i++) line(hx + 2, hy + 2 + i * 5, hx + 14, hy + 4 + i * 4);
  }
  if (acc.includes('antenna')) {   // 안테나 + 빨간 외눈 바이저 (볼트돈)
    ctx.strokeStyle = '#37474f'; ctx.lineWidth = 3 * LWM; line(hx - 6, hy - 26, hx - 14, hy - 52);
    ctx.save(); ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 10; ctx.fillStyle = t % 40 < 20 ? '#ff1744' : '#ff8a80'; ell(hx - 14, hy - 54, 5, 5); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#263238'; rr(hx - 6, hy - 14, 34, 11, 5); ctx.fill();
    ctx.save(); ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 12; ctx.fillStyle = '#ff1744'; rr(hx + 4 + Math.sin(t * 0.08) * 8, hy - 12, 10, 7, 3); ctx.fill(); ctx.restore();   // 좌우로 움직이는 외눈
    ctx.fillStyle = '#78909c'; ell(hx - 22, hy - 4, 6, 6); ctx.fill();   // 귀 옆 나사
  }
  if (acc.includes('band')) {
    ctx.strokeStyle = C.band; ctx.lineWidth = 7 * LWM;
    ctx.beginPath(); ctx.moveTo(hx - 29, hy - 8); ctx.quadraticCurveTo(hx, hy - 22, hx + 27, hy - 14); ctx.stroke();
    ctx.lineWidth = 5 * LWM;
    for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(hx - 28, hy - 8); ctx.quadraticCurveTo(hx - 46, hy - 14 + Math.sin(t * 0.3 + i) * 6, hx - 62, hy - 4 + i * 10 + Math.sin(t * 0.25 + i * 2) * 8); ctx.stroke(); }
  }
  if (acc.includes('scar')) { ctx.strokeStyle = '#bdbdbd'; ctx.lineWidth = 2 * LWM; line(hx - 8, hy + 2, hx + 2, hy + 16); line(hx - 9, hy + 10, hx + 3, hy + 7); }
  if (acc.includes('frost')) {
    ctx.fillStyle = '#b3e5fc'; ctx.strokeStyle = '#4fc3f7'; ctx.lineWidth = 2 * LWM;
    for (const i of [-14, 0, 14]) { poly([[hx + i - 7, hy - 24], [hx + i, hy - 48 - (i === 0 ? 8 : 0)], [hx + i + 7, hy - 24]]); ctx.fill(); ctx.stroke(); }
  }
  if (acc.includes('chili')) {
    ctx.fillStyle = '#d50000'; ctx.beginPath(); ctx.moveTo(hx - 22, hy - 22);
    ctx.quadraticCurveTo(hx, hy - 60, hx + 28, hy - 30); ctx.quadraticCurveTo(hx + 4, hy - 40, hx - 22, hy - 22); ctx.fill();
    ctx.fillStyle = '#2e7d32'; ell(hx - 22, hy - 24, 7, 5); ctx.fill();
  }
  if (acc.includes('cap')) {   // 학생모: 뒤쪽이 찢어져 머리와 이어진 검은 모자 + 금 모표 + 반짝이는 챙
    ctx.fillStyle = '#121219'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2 * LWM;
    poly([[hx - 30, hy - 22], [hx - 44, hy - 10], [hx - 34, hy - 14], [hx - 46, hy + 2], [hx - 30, hy - 6], [hx - 28, hy - 16]]); ctx.fill();   // 찢어진 뒷자락
    const capG = ctx.createLinearGradient(hx, hy - 40, hx, hy - 16); capG.addColorStop(0, '#2c2c3a'); capG.addColorStop(1, '#101016');
    ctx.fillStyle = capG; ctx.beginPath(); ctx.ellipse(hx - 2, hy - 20, 34, 19, -0.06, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0c0c12'; rr(hx - 36, hy - 25, 70, 10, 3); ctx.fill();
    ctx.fillStyle = '#1c1c26'; poly([[hx + 14, hy - 23], [hx + 50, hy - 15], [hx + 46, hy - 11], [hx + 14, hy - 13]]); ctx.fill(); ctx.stroke();   // 챙
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2 * LWM; line(hx + 20, hy - 20, hx + 44, hy - 15);
    ctx.beginPath(); ctx.ellipse(hx - 8, hy - 30, 16, 6, -0.2, Math.PI * 1.1, Math.PI * 1.7); ctx.stroke();   // 윗면 광택
    ctx.fillStyle = '#ffd54f'; ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 1.5 * LWM;   // 금 모표 (다이아 모양)
    poly([[hx + 4, hy - 34], [hx + 10, hy - 28], [hx + 4, hy - 22], [hx - 2, hy - 28]]); ctx.fill(); ctx.stroke();
    ctx.save(); ell(hx, hy, 30, 29); ctx.clip(); const sg = ctx.createLinearGradient(0, hy - 16, 0, hy + 4); sg.addColorStop(0, 'rgba(20,8,30,0.6)'); sg.addColorStop(1, 'rgba(20,8,30,0)'); ctx.fillStyle = sg; ctx.fillRect(hx - 32, hy - 16, 64, 20); ctx.restore();   // 모자 챙 아래 얼굴 그림자
  }
  if (acc.includes('topknot')) { ctx.fillStyle = '#212121'; ell(hx - 4, hy - 31, 10, 7); ctx.fill(); ctx.fillRect(hx - 7, hy - 28, 5, 7); }
  if (acc.includes('ribbon')) {
    ctx.fillStyle = C.band;
    poly([[hx - 6, hy - 30], [hx - 22, hy - 42], [hx - 22, hy - 20]]); ctx.fill();
    poly([[hx - 6, hy - 30], [hx + 10, hy - 44], [hx + 10, hy - 20]]); ctx.fill();
    ctx.fillStyle = '#fff'; ell(hx - 6, hy - 30, 4, 4); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,80,120,0.35)'; ell(hx + 6, hy + 10, 7, 4); ctx.fill();

  // eye
  const ex = hx + 12, ey = hy - 6;
  ctx.lineCap = 'round';
  if (p.ko && !p.lie) { ctx.strokeStyle = '#000'; ctx.lineWidth = 3 * LWM; line(ex - 5, ey - 5, ex + 5, ey + 5); line(ex + 5, ey - 5, ex - 5, ey + 5); }
  else if (p.hurt || p.lie) { ctx.strokeStyle = acc.includes('mask') ? '#fff' : '#000'; ctx.lineWidth = 3 * LWM; ctx.beginPath(); ctx.moveTo(ex - 5, ey - 5); ctx.lineTo(ex + 4, ey); ctx.lineTo(ex - 5, ey + 5); ctx.stroke(); }
  else {
    ctx.fillStyle = '#fff'; ell(ex, ey, p.scared ? 9 : 7, p.scared ? 10 : acc.includes('mask') ? 5 : 8); ctx.fill();
    ctx.fillStyle = '#000'; ell(ex + (p.scared ? 0 : 2), ey + 1, p.scared ? 2.2 : 3.6, p.scared ? 2.2 : 4); ctx.fill();
    ctx.strokeStyle = C.brow; ctx.lineWidth = 3 * LWM;
    if (p.scared) line(ex - 8, ey - 14, ex + 8, ey - 18);
    else if (!p.victory) line(ex - 9, ey - 12, ex + 9, ey - 6);
  }
  const eyeOpen = !(p.ko && !p.lie) && !p.hurt && !p.lie && !p.scared;
  if (acc.includes('stern') && eyeOpen) {   // 무뚝뚝한 눈: 눈꺼풀이 반쯤 덮고 굵은 눈썹
    ctx.save(); ell(ex, ey, 7.5, 8.5); ctx.clip(); ctx.fillStyle = shadeHex(C.body, 0.85); ctx.fillRect(ex - 9, ey - 10, 18, 8); ctx.restore();
    ctx.strokeStyle = '#1a0e0a'; ctx.lineWidth = 2 * LWM; line(ex - 7, ey - 2, ex + 7, ey - 2);
    ctx.lineWidth = 5.5 * LWM; line(ex - 11, ey - 12, ex + 10, ey - 5);
  }
  if (acc.includes('glow') && eyeOpen) {   // 수호령: 빛나는 흰 눈
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ell(ex, ey, 13, 11); ctx.fill();
    ctx.fillStyle = '#f3f8ff'; ell(ex, ey, 7.5, 6); ctx.fill(); ctx.fillStyle = '#80d8ff'; ell(ex + 2, ey, 2.5, 2.5); ctx.fill();
    ctx.strokeStyle = C.dark; ctx.lineWidth = 4.5 * LWM; line(ex - 11, ey - 11, ex + 10, ey - 5);
  }
  // snout & mouth
  ctx.fillStyle = C.snout; ctx.strokeStyle = C.dark; ctx.lineWidth = 3 * LWM;
  ell(hx + 28, hy + 6, 11, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.dark; ell(hx + 25, hy + 3, 2, 3.5); ctx.fill(); ell(hx + 31, hy + 3, 2, 3.5); ctx.fill();
  if (p.scared || p.hurt || p.ko) { ctx.fillStyle = '#5a1020'; ell(hx + 15, hy + 20, 5, p.scared ? 6 : 4); ctx.fill(); }
  else if (p.victory) { ctx.strokeStyle = '#5a1020'; ctx.lineWidth = 3 * LWM; ctx.beginPath(); ctx.arc(hx + 14, hy + 14, 7, 0.3, Math.PI - 0.3); ctx.stroke(); }
  else { ctx.strokeStyle = C.brow; ctx.lineWidth = 2.5 * LWM; line(hx + 9, hy + 21, hx + 19, hy + 19); }
  if (acc.includes('tusks')) {
    ctx.fillStyle = '#fffde7'; ctx.strokeStyle = '#bcaaa4'; ctx.lineWidth = 2 * LWM;
    ctx.beginPath(); ctx.moveTo(hx + 18, hy + 16); ctx.quadraticCurveTo(hx + 30, hy + 22, hx + 36, hy + 0); ctx.quadraticCurveTo(hx + 28, hy + 14, hx + 20, hy + 11); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  if (acc.includes('scarf')) {
    ctx.strokeStyle = '#29b6f6'; ctx.lineWidth = 8 * LWM;
    line(hx - 24, hy + 18, hx + 8, hy + 26); line(hx - 22, hy + 20, hx - 42, hy + 36 + Math.sin(t * 0.2) * 4);
  }

  if (C.hat) {
    const h2 = C.hat;
    if (h2 === 'sunglass') { ctx.fillStyle = '#111'; rr(ex - 11, ey - 7, 24, 13, 5); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 3 * LWM; line(ex - 11, ey - 3, hx - 26, ey - 6); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(ex - 6, ey - 5, 7, 3); }
    else if (h2 === 'chef') { ctx.fillStyle = '#fff'; ctx.strokeStyle = '#bbb'; ctx.lineWidth = 2 * LWM; ctx.fillRect(hx - 20, hy - 42, 40, 16); for (const dx of [-14, 0, 14]) { ell(hx + dx, hy - 48, 13, 13); ctx.fill(); ctx.stroke(); } }
    else if (h2 === 'flower') { for (let i = 0; i < 5; i++) { ctx.fillStyle = '#ff80ab'; ell(hx - 12 + Math.cos(i * 1.257) * 7, hy - 30 + Math.sin(i * 1.257) * 7, 6, 6); ctx.fill(); } ctx.fillStyle = '#ffeb3b'; ell(hx - 12, hy - 30, 4, 4); ctx.fill(); }
    else if (h2 === 'phones') { ctx.strokeStyle = '#263238'; ctx.lineWidth = 6 * LWM; ctx.beginPath(); ctx.arc(hx - 2, hy - 2, 33, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); ctx.fillStyle = '#e53935'; rr(hx - 40, hy - 14, 14, 24, 6); ctx.fill(); rr(hx + 26, hy - 20, 12, 20, 6); ctx.fill(); }
    else if (h2 === 'crown') { ctx.fillStyle = '#ffd700'; ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2 * LWM; poly([[hx - 18, hy - 22], [hx - 20, hy - 42], [hx - 9, hy - 32], [hx, hy - 48], [hx + 9, hy - 32], [hx + 20, hy - 42], [hx + 18, hy - 22]]); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e53935'; ell(hx, hy - 28, 3, 3); ctx.fill(); }
  }
  skinDeco('head', C, { bw, by, hx, hy, ex, ey, t });   // 🎨 스킨: 뿔·왕관·불꽃 머리
  // front arm
  let fa;
  if (bArm) fa = [48, -82 + by];   // 뒷팔로 칠 때 앞팔은 가슴 앞 가드
  else if (mv === 'jab') fa = [38 + 50 * k, -82 + by];
  else if (mv === 'punch') fa = [38 + 66 * k, -72 + by];
  else if (mv === 'uppercut') fa = [lerp(40, 60, k), lerp(-46, -150, k) + by];
  else if (mv === 'throw') fa = [38 + 60 * k, -92 + by];
  else if (mv === 'grab') fa = [88, -74 + by];
  else if (mv === 'counter') fa = [60, -104 + by];
  else if (p.capPose) fa = [hx + 8, hy - 22];   // 모자 챙 잡기
  else if (p.point) fa = [104, -118 + by];   // 손가락으로 상대 가리키기
  else if (p.block) fa = [52, -96 + by];
  else if (p.scared) fa = [44, -128];
  else if (p.victory) fa = [30, -152 + by];
  else if (mv === 'dash' || p.roll !== undefined) fa = [-26, -50 + by];
  else if (air) fa = [44, -80 + by];
  else fa = [50, -84 + by];
  if (C.wpn && !p.weapon) {   // 업데이트 돼지 무기: 공격할 때만 손에 (팔 방향 그대로 · 팔보다 먼저 그려서 발굽이 손잡이를 쥠), 아니면 허리에 참
    const arm = Math.atan2(fa[1] - (-64 + by), fa[0] - 20 * bw);
    const batSwing = C.wpn === 'bat' && p.wpnOut && (mv === 'punch' || mv === 'jab' || mv === 'uppercut');   // 배트: 뒤에서 앞으로 옆으로 휘두름 (타격)
    if (p.wpnOut || FIST_W.includes(C.wpn)) drawWeapon(C.wpn, fa[0], fa[1], batSwing ? lerp(-2.5, 0.35, clamp(k || 0, 0, 1)) : arm + (GUNS.includes(C.wpn) || POLES.includes(C.wpn) ? 0 : -0.3), t, false);
  }
  limb(20 * bw, -64 + by, fa[0], fa[1], 13, C, hc, hr);
  skinDeco('front', C, { bw, by, t });   // 🎨 스킨: 어깨 갑옷·고리 앞쪽
  if (p.weapon) {
    ctx.save(); ctx.translate(fa[0], fa[1]); ctx.rotate(-0.9);
    if (p.weapon === 'head') { ctx.fillStyle = '#f5f5f5'; rr(-4, -50, 8, 50, 4); ctx.fill(); ctx.fillStyle = '#e57373'; ell(0, -54, 14, 11); ctx.fill(); ctx.fillStyle = '#fff3e0'; ell(-4, -57, 5, 3); ctx.fill(); }
    else if (p.weapon === 'belly') { ctx.strokeStyle = '#f8bbd0'; ctx.lineWidth = 9 * LWM; ctx.beginPath(); ctx.moveTo(0, 0); for (let i = 1; i <= 6; i++) ctx.lineTo(Math.sin(i + t * 0.3) * 8, -i * 10); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3 * LWM; ctx.stroke(); }
    else { ctx.fillStyle = '#8d6e63'; rr(-3, -46, 6, 46, 3); ctx.fill(); ctx.fillStyle = '#d7a86e'; rr(-15, -62, 30, 18, 6); ctx.fill(); }
    ctx.restore();
  }
  if (k > 0.9 && (mv === 'punch' || mv === 'jab' || KICKS[mv]) && !(C.wpn && p.wpnOut && !KICKS[mv])) {   // 주먹·발 잔상 (무기로 칠 때는 없음 — 총으로 때리는 것처럼 보이던 것)
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3 * LWM;
    const pt = KICKS[mv] ? (bLeg ? bl : fl) : (bArm ? ba : fa), tx = pt[0], ty = pt[1];
    for (let i = -1; i <= 1; i++) line(tx - 50, ty + i * 9, tx - 20, ty + i * 9);
  }
  ctx.restore(); LWM = LW0;
}

