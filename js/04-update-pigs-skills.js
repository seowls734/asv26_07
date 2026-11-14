// ================= 🎉 대규모 업데이트 돼지 18마리: 돼지마다 새 스킬 3개 · 새 필살기 · 손에 든 무기 =================
// 스킬: SKILLDEF의 x로 시작하는 type (때리는 스킬은 SKILLDEF 값으로, 던지는·소환 스킬은 NXS 훅에서 물체를 만듦)
// 필살기: nx로 시작하는 type → nxUlt · 물체 그림: drawNxObj · 물체 움직임: nxObjTick · 무기 그림: drawWeapon
const NX_SKILL = {
  // 때리는 스킬 (SKILLDEF와 같은 모양)
  // 무기로 때리는 스킬 (무기 든 돼지는 무기 스킬이 1개 이상)
  xSaCane: { sfx: 'heavy', startup: 10, active: 8, recovery: 18, dmg: 12, range: 200, height: 'mid', kb: 8, stun: 28, launch: 9, dash: 4, pose: 'punch', hitstop: 8, shake: 6, txt: ['딱!', '사탕 지팡이!'] },
  xNeLaser: { startup: 8, active: 10, recovery: 16, dmg: 6, hits: 2, hitEvery: 5, range: 330, height: 'mid', kb: 4, stun: 18, slow: 60, pose: 'punch', hitstop: 5, txt: ['지잉!', '레이저!'] },
  xFrSword: { sfx: 'heavy', startup: 11, active: 8, recovery: 20, dmg: 13, range: 210, height: 'mid', kb: 9, stun: 26, burn: 90, dash: 3, pose: 'punch', hitstop: 9, shake: 7, txt: ['화르륵!', '불꽃 베기!'] },
  xMgCane: { startup: 9, active: 7, recovery: 18, dmg: 10, range: 190, height: 'mid', kb: 6, stun: 40, dash: 3, pose: 'punch', hitstop: 8, txt: ['탁!', '짠!'] },
  xKnSlash: { sfx: 'heavy', startup: 11, active: 8, recovery: 20, dmg: 12, range: 215, height: 'mid', kb: 9, stun: 28, dash: 3, pose: 'punch', hitstop: 9, shake: 7, txt: ['챙!', '베기!'] },
  xKnBash: { sfx: 'heavy', startup: 10, active: 12, recovery: 22, dmg: 10, range: 140, height: 'mid', kb: 18, stun: 30, dash: 9, armor: true, pose: 'dash', hitstop: 10, shake: 10, txt: ['방패 밀치기!'] },
  xPkSmash: { sfx: 'heavy', startup: 16, active: 8, recovery: 22, dmg: 14, range: 175, height: 'mid', kb: 10, stun: 34, knockdown: true, guardBreak: true, pose: 'punch', hitstop: 12, shake: 14, txt: ['쾅!!', '기타 박살!'] },
  xPkMosh: { startup: 8, active: 16, recovery: 20, dmg: 11, range: 140, height: 'mid', kb: 10, stun: 30, launch: -10, dash: 12, pose: 'dash', hitstop: 9, shake: 9, txt: ['모싱!', '와아아!'] },
  xBcSurf: { startup: 8, active: 20, recovery: 18, dmg: 10, range: 150, height: 'mid', kb: 12, stun: 28, launch: -6, dash: 13, invuln: true, invulnF: 12, pose: 'dash', txt: ['서핑!', '촤아악!'] },
  xBbSwing: { sfx: 'heavy', startup: 14, active: 8, recovery: 22, dmg: 13, range: 200, height: 'mid', kb: 16, stun: 36, launch: -12, pose: 'punch', hitstop: 12, shake: 12, txt: ['딱!!', '풀스윙!'] },
  xBbSlide: { startup: 6, active: 18, recovery: 16, dmg: 9, range: 140, height: 'low', kb: 6, stun: 24, dash: 12, knockdown: true, pose: 'roll', txt: ['세이프!', '슬라이딩!'] },
  xNeGlitch: { startup: 14, active: 5, recovery: 14, dmg: 10, range: 150, height: 'mid', kb: 8, stun: 26, teleport: true, invuln: true, invulnF: 12, pose: 'punch', txt: ['지지직!', '접속!'] },
  xIcSpear: { startup: 12, active: 8, recovery: 20, dmg: 11, range: 235, height: 'mid', kb: 8, stun: 28, slow: 90, dash: 4, pose: 'punch', hitstop: 8, txt: ['찌르기!', '얼어라!'] },
  xGaWarp: { startup: 16, active: 5, recovery: 16, dmg: 9, range: 150, height: 'mid', kb: 6, stun: 30, launch: -8, teleport: true, invuln: true, invulnF: 14, pose: 'uppercut', txt: ['워프!'] },
  xUnDash: { sfx: 'heavy', startup: 10, active: 18, recovery: 18, dmg: 13, range: 150, height: 'mid', kb: 14, stun: 32, launch: -8, dash: 16, pose: 'dash', hitstop: 10, shake: 10, txt: ['무지개 돌진!'] },
  xShIai: { sfx: 'heavy', startup: 9, active: 8, recovery: 20, dmg: 13, range: 170, height: 'mid', kb: 6, stun: 30, dash: 22, invuln: true, invulnF: 10, pose: 'dash', hitstop: 14, shake: 8, txt: ['발도!!', '슥—'] },
  xShAmbush: { startup: 18, active: 5, recovery: 16, dmg: 11, range: 150, height: 'mid', kb: 6, stun: 30, launch: -11, teleport: true, invuln: true, invulnF: 16, pose: 'uppercut', txt: ['뒤다!'] },
  xDvTrident: { startup: 11, active: 18, recovery: 20, dmg: 7, hits: 2, hitEvery: 9, range: 225, height: 'mid', kb: 5, stun: 22, dash: 3, pose: 'punch', txt: ['푹!', '푹푹!'] },
  xFrKick: { startup: 8, active: 22, recovery: 16, dmg: 5, hits: 3, hitEvery: 7, range: 165, height: 'mid', kb: 3, stun: 18, burn: 90, dash: 4, pose: 'spin', kind: 'kick', txt: ['화르륵!', '팍!'] },
  xBxOneTwo: { startup: 6, active: 16, recovery: 14, dmg: 6, hits: 2, hitEvery: 8, range: 150, height: 'mid', kb: 5, stun: 20, dash: 4, pose: 'punch', kind: 'punch', txt: ['원!', '투!'] },
  xBxWeave: { startup: 5, active: 10, recovery: 18, dmg: 11, range: 150, height: 'mid', kb: 10, stun: 30, launch: -7, dash: 12, invuln: true, invulnF: 10, pose: 'uppercut', txt: ['더킹!', '카운터!'] },
  xBxScrew: { sfx: 'heavy', startup: 15, active: 8, recovery: 24, dmg: 15, range: 165, height: 'mid', kb: 18, stun: 36, guardBreak: true, dash: 5, pose: 'punch', hitstop: 14, shake: 14, txt: ['스크류!!'] }
};
// 던지기·소환·몸에 거는 스킬: 시간(startup)만 SKILLDEF로, 물체는 NXS 훅에서 (delay = startup이라 손을 뻗을 때 나감)
const NX_CAST = { xKnWave: 14, xSaGift: 13, xSaSnow: 10, xSaCookie: 6, xCwShot: 8, xCwLasso: 12, xCwRoll: 4, xPkRiff: 12, xBcWater: 8, xBcTube: 12, xBbPitch: 12, xNeDrone: 12, xNeEmp: 10, xLvRock: 15, xLvPool: 12, xLvQuake: 14,
  xIcFlake: 10, xIcWall: 12, xEmBeam: 12, xEmCoins: 12, xEmGuard: 12, xGaWell: 14, xGaComet: 14, xUnSparkle: 10, xUnHeal: 6, xSkPetal: 10, xSkTrap: 12, xSkBreeze: 3, xGhPhase: 4, xGhSkull: 12, xGhHand: 12, xShStar: 8,
  xDvOrb: 14, xDvChain: 12, xFrBall: 10, xFrPillar: 12 };
for (const [k, v] of Object.entries(NX_SKILL)) SKILLDEF[k] = v;
for (const [k, st] of Object.entries(NX_CAST)) SKILLDEF[k] = { startup: st, active: 1, recovery: k === 'xCwRoll' ? 26 : k === 'xSkBreeze' ? 18 : 20, pose: ['xSaCookie', 'xUnHeal', 'xGhPhase'].includes(k) ? 'counter' : k === 'xCwRoll' ? 'roll' : 'throw', buff: true,
  ...(k === 'xCwRoll' ? { dash: 10, invuln: true, invulnF: 16, active: 16 } : {}) };
const nxPart = (x, y, n, cols, sp = 4, life = 26) => { for (let i = 0; i < n; i++) parts.push({ x, y, vx: rand(-sp, sp), vy: rand(-sp, sp * 0.6), life, max: life, c: pick(cols), s: rand(2, 5), g: 0.05, type: 'dot', glow: true }); };
const nxFx = (f, fx, x, y, life = 14, extra = {}) => addObj({ owner: f, kind: 'nxFx', fx, x, y, w: 1, h: 1, dmg: 0, life, face: f.facing, ...extra });
const nxHeal = (f, n, cols) => { const h = Math.min(n, f.maxHp - f.hp); f.hp += h; nxPart(f.x, f.y - 90 * f.sc / 1.15, 22, cols, 3, 40); popText(f.x, f.y - 200 * f.sc / 1.15, `+${Math.round(h)} 회복`, '#69f0ae', 24); };
function nxSkillStart(f, s) {
  const t = s.type; if (t[0] !== 'x' || !SKILLDEF[t]) return;
  const k = f.sc / 1.15, F = f.facing, d = f.opp, D = SKILLDEF[t].startup, gm = GUNS.includes(f.ch.wpn) ? gunMuzzle(f, SKILLDEF[t].pose) : null, hx = gm ? gm[0] : f.x + F * 70 * k, hy = gm ? gm[1] : f.y - 95 * k;   // 총 든 돼지는 총구에서 나감
  const P = o => addObj({ owner: f, x: hx, y: hy, vx: F * 10, delay: D, dir: F, clash: true, height: 'mid', ...o });
  switch (t) {
    case 'xKnSlash': nxFx(f, 'slash', f.x + F * 110 * k, hy, 14, { delay: D, col: '#eceff1' }); break;
    case 'xSaCane': nxFx(f, 'slash', f.x + F * 100 * k, hy, 14, { delay: D, col: '#ff8a80' }); break;
    case 'xFrSword': nxFx(f, 'slash', f.x + F * 110 * k, hy, 14, { delay: D, col: '#ff9100' }); nxFx(f, 'fireRing', f.x + F * 120 * k, hy, 20, { delay: D }); break;
    case 'xMgCane': nxFx(f, 'slash', f.x + F * 95 * k, hy, 12, { delay: D, col: '#fff59d' }); break;
    case 'xNeLaser': for (let i = 0; i < 2; i++) { nxFx(f, 'muzzle', hx, hy, 6, { delay: D + i * 5 }); nxFx(f, 'tracer', hx + F * 160 * k, hy, 6, { delay: D + i * 5, len: 300 }); } break;
    case 'xKnBash': nxFx(f, 'shield', f.x + F * 60 * k, hy, 26, { delay: 2 }); break;
    case 'xKnWave': P({ kind: 'xSwordWave', vx: F * 11, w: 46, h: 100, dmg: 10, kb: 8, stun: 26, life: 90 }); break;
    case 'xSaGift': P({ kind: 'xGift', vx: F * 6, vy: -9, g: 0.42, boom: 90, dmg: 12, kb: 9, stun: 28, life: 140, clash: false }); break;
    case 'xSaSnow': for (let i = 0; i < 3; i++) P({ kind: 'xSnow', vx: F * (8 + i * 1.2), vy: (i - 1) * 1.6, w: 24, h: 24, dmg: 4, slow: 70, kb: 3, stun: 14, life: 90, delay: D + i * 3 }); break;
    case 'xSaCookie': nxHeal(f, 12, ['#d7a86e', '#fff8e1', '#8d6e63']); nxFx(f, 'cookie', f.x + F * 30 * k, f.y - 130 * k, 30); break;
    case 'xCwShot': for (let i = 0; i < 2; i++) P({ kind: 'xBullet', vx: F * 19, w: 22, h: 10, dmg: 5, kb: 4, stun: 16, life: 60, delay: D + i * 8 }); nxFx(f, 'muzzle', hx, hy, 6, { delay: D }); break;
    case 'xCwLasso': P({ kind: 'xLasso', vx: F * 11, w: 50, h: 50, dmg: 4, stun: 62, kb: 0, life: 42, clash: false, txt: ['묶었다!'] }); break;
    case 'xCwRoll': addObj({ owner: f, kind: 'xBullet', x: f.x + F * 230 * k, y: f.y - 80 * f.sc, vx: F * 19, w: 22, h: 10, dmg: 6, kb: 5, stun: 18, life: 50, delay: 18, dir: F, clash: true }); break;
    case 'xPkRiff': for (let i = 0; i < 2; i++) P({ kind: 'xRiff', vx: F * 8, w: 44, h: 120, dmg: 5, multi: 10, maxHits: 2, kb: 4, stun: 16, life: 80, delay: D + i * 10, clash: false }); break;
    case 'xPkSmash': nxFx(f, 'sparks', f.x + F * 120 * k, f.y - 30, 18, { delay: D + 2 }); break;
    case 'xPkMosh': nxFx(f, 'hands', f.x, f.y, 30); break;
    case 'xBcWater': for (let i = 0; i < 5; i++) P({ kind: 'xWater', vx: F * 12, vy: rand(-0.6, 0.6), w: 20, h: 16, dmg: 2, slow: 40, kb: 2, stun: 10, life: 50, delay: D + i * 3, clash: false }); break;
    case 'xBcTube': P({ kind: 'xTube', vx: F * 7, w: 56, h: 56, dmg: 6, stun: 56, kb: 0, life: 110, txt: ['쏙!'] }); break;
    case 'xBcSurf': nxFx(f, 'wave', f.x, f.y, 28, { follow2: true }); break;
    case 'xBbPitch': P({ kind: 'xBall', vx: F * 16, w: 20, h: 20, dmg: 9, kb: 7, stun: 24, life: 80, txt: ['스트라이크!'] }); break;
    case 'xBbSwing': nxFx(f, 'swing', f.x + F * 70 * k, hy, 14, { delay: D, col: '#d7a86e' }); break;
    case 'xBbSlide': nxFx(f, 'dust', f.x, f.y, 24); break;
    case 'xNeDrone': P({ kind: 'xDrone', vx: F * 5, w: 34, h: 26, dmg: 7, kb: 5, stun: 22, life: 180, clash: true }); break;
    case 'xNeGlitch': nxFx(f, 'glitch', f.x, hy, 18); break;
    case 'xNeEmp': addObj({ owner: f, kind: 'xEmp', x: f.x, y: f.y - 80 * k, w: 280, h: 170, dmg: 8, slow: 160, kb: 6, stun: 24, life: 14, delay: D, txt: ['EMP!'] }); break;
    case 'xLvRock': P({ kind: 'xBoulder', vx: F * 5.5, vy: -10, g: 0.42, boom: 110, w: 46, h: 46, dmg: 14, kb: 10, stun: 30, life: 150, clash: false }); break;
    case 'xLvPool': addObj({ owner: f, kind: 'xLavaPool', x: clamp(d.x, 60, W - 60), y: GROUND - 14, w: 130, h: 30, dmg: 4, burn: 120, multi: 16, maxHits: 3, height: 'low', kb: 2, stun: 12, life: 160, delay: 26 }); break;
    case 'xLvQuake': P({ kind: 'xQuake', y: GROUND - 20, vx: F * 9, w: 60, h: 40, dmg: 11, height: 'low', knockdown: true, kb: 6, stun: 30, life: 70, clash: false }); break;
    case 'xIcSpear': nxFx(f, 'thrust', f.x + F * 140 * k, hy, 12, { delay: D, col: '#b3e5fc' }); break;
    case 'xIcFlake': for (let i = 0; i < 2; i++) P({ kind: 'xFlake', vx: F * 10, vy: (i ? 1 : -1) * 1.4, w: 28, h: 28, dmg: 5, slow: 80, kb: 3, stun: 16, life: 80, delay: D + i * 4 }); break;
    case 'xIcWall': addObj({ owner: f, kind: 'xIceWall', x: clamp(f.x + F * 120 * k, 40, W - 40), y: GROUND - 75, w: 40, h: 150, dmg: 6, kb: 8, stun: 20, launch: -6, life: 200, delay: D, clash: true }); break;
    case 'xEmBeam': P({ kind: 'xGoldBeam', vx: F * 14, w: 90, h: 26, dmg: 10, kb: 8, stun: 26, life: 60 }); break;
    case 'xEmCoins': for (let i = 0; i < 5; i++) addObj({ owner: f, kind: 'xCoin2', x: clamp(d.x + (i - 2) * 46, 30, W - 30), y: -30 - i * 30, vy: 9, g: 0.25, w: 30, h: 30, dmg: 3, kb: 3, stun: 14, life: 90, delay: D + i * 5 }); break;
    case 'xEmGuard': addObj({ owner: f, kind: 'xGuard', x: f.x + F * 60 * k, y: GROUND - 45, vx: F * 3.5, w: 50, h: 90, dmg: 6, multi: 14, maxHits: 2, kb: 7, stun: 22, life: 150, delay: D, dir: F }); break;
    case 'xGaWell': addObj({ owner: f, kind: 'xWell', x: clamp(f.x + F * 230 * k, 60, W - 60), y: f.y - 90 * k, w: 90, h: 90, dmg: 2, multi: 20, maxHits: 4, kb: 0, stun: 14, life: 110, delay: D }); break;
    case 'xGaComet': addObj({ owner: f, kind: 'xComet', x: d.x - F * 260, y: -60, vx: F * 7, vy: 9, boom: 1, g: 0.0001, w: 50, h: 50, dmg: 13, kb: 10, stun: 30, life: 120, delay: D }); break;
    case 'xGaWarp': nxFx(f, 'stars', f.x, hy, 22); break;
    case 'xUnDash': nxFx(f, 'rainbow', f.x, f.y, 34, { follow2: true }); break;
    case 'xUnSparkle': P({ kind: 'xSparkle', vx: F * 8, w: 36, h: 36, dmg: 3, stun: 72, kb: 0, life: 100, txt: ['반짝!'] }); break;
    case 'xUnHeal': nxHeal(f, 10, ['#ff80ab', '#80d8ff', '#fff59d', '#b9f6ca']); f.invT = Math.max(f.invT || 0, 20); break;
    case 'xSkPetal': for (let i = 0; i < 3; i++) P({ kind: 'xPetal', vx: F * 10, vy: (i - 1) * 1.3, w: 26, h: 20, dmg: 4, kb: 3, stun: 16, life: 80, delay: D + i * 2 }); break;
    case 'xSkTrap': addObj({ owner: f, kind: 'xFlower', x: clamp(d.x, 40, W - 40), y: GROUND - 30, w: 80, h: 60, dmg: 5, stun: 70, kb: 0, height: 'low', life: 16, delay: 34, txt: ['뿌리에 묶였다!'] }); break;
    case 'xSkBreeze': f.vx = -F * 14; f.invT = Math.max(f.invT || 0, 18); nxPart(f.x, f.y - 80 * k, 18, ['#f8bbd0', '#fff', '#f48fb1'], 4, 30); for (let i = 0; i < 2; i++) P({ kind: 'xPetal', vx: F * 9, vy: (i ? 1 : -1), w: 26, h: 20, dmg: 3, kb: 3, stun: 14, life: 70, delay: 6 + i * 3 }); break;
    case 'xGhPhase': f.invT = Math.max(f.invT || 0, 60); f.ghostT = 60; nxPart(f.x, f.y - 80 * k, 16, ['#69f0ae', '#b2dfdb'], 3, 30); break;
    case 'xGhSkull': P({ kind: 'xSkull', vx: F * 4.5, w: 36, h: 36, dmg: 9, kb: 6, stun: 26, life: 170 }); break;
    case 'xGhHand': addObj({ owner: f, kind: 'xHand', x: clamp(d.x, 40, W - 40), y: GROUND - 60, w: 70, h: 120, dmg: 10, launch: -12, kb: 4, stun: 30, life: 26, delay: 30, txt: ['저승의 손!'] }); break;
    case 'xShIai': nxFx(f, 'line', f.x, hy, 16, { delay: D + 4, len: 260 }); break;
    case 'xShStar': for (let i = 0; i < 3; i++) P({ kind: 'xShuriken', vx: F * 15, w: 22, h: 22, dmg: 4, kb: 2, stun: 12, life: 60, delay: D + i * 5, y: hy + (i - 1) * 14 }); break;
    case 'xShAmbush': nxFx(f, 'smoke', f.x, f.y - 70 * k, 20); break;
    case 'xDvTrident': nxFx(f, 'thrust', f.x + F * 140 * k, hy, 18, { delay: D, col: '#d500f9' }); break;
    case 'xDvOrb': P({ kind: 'xHellOrb', vx: F * 4, w: 60, h: 60, dmg: 4, burn: 90, multi: 12, maxHits: 3, kb: 3, stun: 16, life: 150, clash: false }); break;
    case 'xDvChain': P({ kind: 'xChain', vx: F * 14, w: 40, h: 30, dmg: 6, kb: 0, pull: true, stun: 30, life: 30, clash: false, txt: ['끌려온다!'] }); break;
    case 'xFrBall': for (let i = 0; i < 2; i++) P({ kind: 'xFireball', vx: F * 10, w: 34, h: 30, dmg: 6, burn: 90, kb: 5, stun: 18, life: 80, delay: D + i * 9 }); break;
    case 'xFrPillar': for (let i = 0; i < 3; i++) addObj({ owner: f, kind: 'xPillar2', x: clamp(f.x + F * (120 + i * 100) * k, 30, W - 30), y: GROUND - 90, w: 60, h: 180, dmg: 6, burn: 100, launch: -7, kb: 4, stun: 20, life: 22, delay: D + 6 + i * 9 }); break;
    case 'xFrKick': nxFx(f, 'fireRing', f.x, hy, 26, { follow2: true }); break;
    case 'xBxScrew': nxFx(f, 'punch', f.x + F * 120 * k, hy, 16, { delay: D }); break;
    case 'xBxWeave': nxFx(f, 'smoke', f.x, f.y - 60 * k, 14); break;
  }
}
function nxObjTick(o) {
  const f = o.owner, d = f.opp, k = d.sc / 1.15;
  if (o.kind === 'nxFx') { if (o.follow2) { o.x = f.x; o.y = f.y; } return true; }
  if (o.kind === 'xDrone' || o.kind === 'xSkull') {   // 따라가는 드론 · 해골
    const ty = d.y - 95 * k, sp = o.kind === 'xDrone' ? 6 : 4.5, ang = Math.atan2(ty - o.y, d.x - o.x), cur = Math.atan2(o.vy, o.vx); let da = ang - cur; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
    const na = cur + clamp(da, -0.08, 0.08); o.vx = Math.cos(na) * sp; o.vy = Math.sin(na) * sp;
    if (o.t % 3 === 0) parts.push({ x: o.x, y: o.y, vx: 0, vy: 0, life: 14, max: 14, c: o.kind === 'xDrone' ? '#00e5ff' : '#69f0ae', s: 3, g: 0, type: 'dot', glow: true });
  }
  if (o.kind === 'xWell' && Math.abs(d.x - o.x) < 260 && d.state !== 'ko' && d.state !== 'locked') d.x += Math.sign(o.x - d.x) * 1.8;   // 중력 우물: 끌어당김
  if (o.kind === 'xComet' && o.y >= GROUND - 30 && !o.exploded) boomObj(o);
  if (o.kind === 'xComet' && o.t % 2 === 0) parts.push({ x: o.x, y: o.y, vx: -o.vx * 0.2, vy: -2, life: 20, max: 20, c: pick(['#b388ff', '#fff', '#80d8ff']), s: 4, g: 0, type: 'dot', glow: true });
  if (o.kind === 'xCoin2' && o.y > GROUND - 14) { o.life = 0; nxPart(o.x, GROUND - 10, 5, ['#ffd740', '#fff8e1'], 3, 16); }
  if (o.kind === 'xFireball' && o.t % 2 === 0) flame(o.x - Math.sign(o.vx) * 14, o.y);
  if (o.kind === 'xHellOrb' && o.t % 3 === 0) parts.push({ x: o.x + rand(-20, 20), y: o.y + rand(-20, 20), vx: 0, vy: -1.5, life: 18, max: 18, c: pick(['#d500f9', '#ff1744']), s: 3, g: 0, type: 'dot', glow: true });
  if (o.kind === 'xQuake' && o.t % 3 === 0) burst(o.x, GROUND - 6, 3, ['#8d6e63', '#ff6d00'], 5);
  if (o.kind === 'xGuard' && Math.abs(o.x - d.x) < 60) o.vx *= 0.9;
  // 필살기 물체
  if (o.kind === 'xGiantSword' && o.t === 1) o.x = clamp(d.x, 40, W - 40);
  if ((o.kind === 'xHellPillar' || o.kind === 'xNova') && o.t === 1) o.x = clamp(d.x, 40, W - 40);   // 터지는 순간 상대 자리로
  if ((o.kind === 'xPortal' && o.t < 30) || (o.kind === 'xNovaCore')) o.x = clamp(d.x, 40, W - 40);   // 열리는 동안 상대를 따라감   // 떨어지기 시작할 때 상대 위로
  if (o.kind === 'xGiantSword' && o.y >= GROUND - 130 && !o.landed) { o.landed = true; o.vy = 0; o.y = GROUND - 130; o.life = Math.min(o.life, 30); shake = Math.max(shake, 22); SFX.slam(); nxPart(o.x, GROUND - 20, 40, ['#fff59d', '#ffffff', '#ffd740'], 9, 30); }
  if (o.kind === 'xSleigh' && o.t % 11 === 0 && o.x > 40 && o.x < W - 40) addObj({ owner: f, kind: 'xGift', x: o.x, y: o.y + 30, vx: 0, vy: 2, g: 0.5, boom: 80, w: 34, h: 34, dmg: 7, kb: 6, stun: 20, life: 100, ult: true });
  if (o.kind === 'xRing') o.w += 16;
  if (o.kind === 'xDrone2' && o.t >= 30 && o.t <= 90 && (o.t + o.k * 4) % 14 === 0) { const ty = d.y - 95 * k, a = Math.atan2(ty - o.y, d.x - o.x); addObj({ owner: f, kind: 'xLaser', x: o.x, y: o.y, vx: Math.cos(a) * 16, vy: Math.sin(a) * 16, w: 26, h: 26, dmg: 3, kb: 3, stun: 16, life: 50, ult: true, maxHits: 1 }); SFX.whiff(); }
  if (o.kind === 'xLavaRock' && o.y >= GROUND - 20 && !o.exploded) boomObj(o);
  if (o.kind === 'xBigCoin') o.spin = (o.spin || 0) + o.vx * 0.03;
  if (o.kind === 'xTornado') { o.vx = Math.sign(d.x - o.x) * 1.4; if (o.t % 2 === 0) parts.push({ x: o.x + rand(-60, 60), y: o.y + rand(-120, 120), vx: rand(-3, 3), vy: -2, life: 20, max: 20, c: pick(['#f8bbd0', '#fff', '#f48fb1']), s: 4, g: 0, type: 'dot' }); }
  if (o.kind === 'xPhoenix' && o.t % 2 === 0) for (let i = 0; i < 2; i++) flame(o.x - Math.sign(o.vx) * rand(40, 100), o.y + rand(-30, 30));
  if (o.kind === 'xHellPillar' && o.t % 2 === 0) flame(o.x + rand(-50, 50), GROUND - rand(10, 260));
  return false;
}
// ---- 필살기 ----
const NX_SUMMON = new Set(['nyMegaLaser', 'nyCauldron', 'nyParade', 'nyWhale', 'nyArrowStorm', 'nyMagicBox', 'nyStorm', 'nyQueen', 'nxExcalibur', 'nxSleigh', 'nxAmp', 'nxTsunami', 'nxHack', 'nxVolcano', 'nxIcePath', 'nxGoldWheel', 'nxSupernova', 'nxSakura', 'nxGhostShip', 'nxHellGate', 'nxPhoenix']);
function nxRunTick(f) {   // 소환형 필살기: 돼지는 움직이고 소환은 계속
  if (f.parryT > 0) f.parryT--;   // 흘려 받기 시간
  if (mode === 6 && f === p1) { if (f.state !== 'ult') f.meter = 100; f.skillCD = Math.min(f.skillCD, 20); if (f.hp < f.maxHp) f.hp = f.maxHp; }   // 연습 모드: 필살 게이지 가득 · 스킬 금방 · 내 체력도 가득
  if (f.swingT > 0) f.swingT--;   // 홈런 필살기 스윙 자세
  if (f.pullT > 0) { f.pullT--; f.x += (f.pullX - f.x) * 0.3; if (f.t % 2 === 0) parts.push({ x: f.x, y: f.y - 90 * f.sc / 1.15, vx: 0, vy: 0, life: 10, max: 10, c: '#fff', s: 3, g: 0, type: 'dot' }); }   // 끌려오는 중
  if (!f.nxRun) return; if (scene !== 'fight' || f.state === 'ko') { f.nxRun = null; return; }
  nxUlt(f, f.opp, ++f.nxRun.t, true);
}
function nxUlt(f, o, T, bg) {
  const type = f.ch.ult.type;
  if (!bg && NX_SUMMON.has(type)) { if (T === 1) { f.nxRun = { t: 0, F: f.facing, x: f.x }; f.vx = 0; } if (T >= 20) ultEnd(f, o); return; }   // 시전 자세만 잠깐
  const s = f.sc / 1.15, F = bg && f.nxRun ? f.nxRun.F : f.facing, X0 = bg && f.nxRun ? f.nxRun.x : f.x;   // X0: 필살기를 쓴 자리
  const U = h => dealHit(f, o, Object.assign({ src: f.x, kind: 'ult', height: 'mid', noPart: true, force: o.state === 'locked' }, h));   // 붙잡은(묶은) 상대에게도 맞게
  const lock = () => { if (o.state !== 'ko') { o.state = 'locked'; o.vx = 0; o.vy = 0; } };
  const A = ob => addObj({ owner: f, ult: true, clash: false, ...ob });
  const end = n => { if (T >= n) { if (bg) f.nxRun = null; else ultEnd(f, o); } };
  const behind = F > 0 ? -150 : W + 150;
  // 붙잡는 필살기: 달려가서 닿으면 붙잡고 연타 → 마지막 한 방
  const grabCombo = (hits, every, fin, fx) => {
    if (!f.ultHit) { if (T > 30) return ultEnd(f, o); f.vx = F * 16; if (T % 2 === 0) burst(f.x - F * 40, GROUND - 5, 2, ['#a07850', '#c8a070'], 4);
      const dx = (o.x - f.x) * F; if (dx > -20 && dx < 150 * s && Math.abs(o.y - f.y) < 120) { const r = U({ dmg: 3, stun: 40, kb: 0, hitstop: 6 }); if (r === 'hit' || r === 'armor') { f.ultHit = true; f.uT = 0; f.vx = 0; lock(); } else if (r !== 'miss') ultEnd(f, o); }
      return; }
    f.vx = 0; lock();
    if (T <= hits * every && T % every === 0) { U({ dmg: 2.4, stun: 40, kb: 0, hitstop: 3 }); fx(T / every); }
    if (T === hits * every + 14) { U({ dmg: fin.dmg, launch: fin.launch, kb: fin.kb, stun: 50, hitstop: 18, shake: 18 }); fin.fx(); o.state = o.state === 'locked' ? 'hit' : o.state; }
    if (T >= hits * every + 30) ultEnd(f, o);
  };
  switch (type) {
    case 'nxExcalibur': if (T === 8) { A({ kind: 'xGiantSword', x: o.x, y: -260, vy: 30, w: 100, h: 260, dmg: 24, launch: -10, kb: 14, stun: 50, life: 70, delay: 30, txt: ['성검!!'] }); popText(f.x, f.y - 250 * s, '하늘이여, 검을!!', '#fff59d', 28); } end(100); break;
    case 'nxSleigh': if (T === 6) A({ kind: 'xSleigh', x: behind, y: 110, vx: F * 8, w: 10, h: 10, dmg: 0, life: 200 }); end(150); break;
    case 'nxHighNoon': if (T === 1) nxTint = { c: 'rgba(255,152,0,0.22)', t: 100 }; if (T >= 24 && T <= 74 && (T - 24) % 10 === 0) { const [mx, my] = gunMuzzle(f, 'punch'); addObj({ owner: f, kind: 'xBullet', x: mx, y: my, vx: F * 24, w: 26, h: 12, dmg: 5, kb: 3, stun: 22, life: 50, ult: true, dir: F }); nxFx(f, 'muzzle', mx, my, 6); SFX.whiff(); shake = Math.max(shake, 5); } end(96); break;
    case 'nxAmp': if (T === 4) A({ kind: 'xAmp', x: X0 - F * 90 * s, y: GROUND - 70, w: 10, h: 10, dmg: 0, life: 100 }); if ([20, 44, 68].includes(T)) { A({ kind: 'xRing', x: X0 - F * 90 * s, y: f.y - 90 * s, w: 60, h: 220, dmg: 8, kb: 10, stun: 28, launch: -5, life: 34 }); SFX.boom(); shake = Math.max(shake, 12); } end(104); break;
    case 'nxTsunami': if (T === 6) A({ kind: 'xBigWave', x: behind, y: GROUND - 120, vx: F * 10, w: 170, h: 260, dmg: 5, multi: 12, maxHits: 4, kb: 8, stun: 26, launch: -4, life: 220 }); end(140); break;
    case 'nxHomeRun': if (f.ultHit && T % 10 === 0) f.swingT = 10; if (f.ultHit && T === 44) f.swingT = 12; grabCombo(3, 10, { dmg: 18, launch: -22, kb: 26, fx: () => { popText(o.x, o.y - 220, '홈런!!!', '#ffd740', 44); nxPart(o.x, o.y - 100, 40, ['#fff', '#ffd740', '#d7a86e'], 10, 30); SFX.slam(); } }, i => nxFx(f, 'swing', o.x - F * 30, o.y - 90, 10, { col: '#d7a86e' })); break;
    case 'nxHack': if (T === 1) nxTint = { c: 'rgba(0,229,255,0.12)', t: 110, grid: true }; if (T === 10) for (let i = 0; i < 4; i++) A({ kind: 'xDrone2', k: i, x: [80, W - 80, 160, W - 160][i], y: [70, 70, 200, 200][i], w: 10, h: 10, dmg: 0, life: 100 }); end(112); break;
    case 'nxVolcano': if (T >= 10 && T <= 100 && T % 7 === 0) A({ kind: 'xLavaRock', x: clamp(o.x + rand(-200, 200), 30, W - 30), y: -40, vx: rand(-1, 1), vy: 6, g: 0.35, boom: 1, w: 44, h: 44, dmg: 6, kb: 6, stun: 22, life: 120, maxHits: 1 }); if (T === 10) nxTint = { c: 'rgba(255,61,0,0.16)', t: 110 }; end(124); break;
    case 'nxIcePath': if (T >= 10 && T <= 66 && (T - 10) % 7 === 0) { const i = (T - 10) / 7; A({ kind: 'xIceSpike', x: clamp(X0 + F * (90 + i * 75) * s, 20, W - 20), y: GROUND - 70, w: 60, h: 140, dmg: 6, launch: -8, kb: 4, stun: 26, life: 26, maxHits: 1 }); SFX.ice(); } end(90); break;
    case 'nxGoldWheel': if (T === 8) A({ kind: 'xBigCoin', x: X0 + F * 40 * s, y: GROUND - 75, vx: F * 9, w: 150, h: 150, dmg: 6, multi: 10, maxHits: 4, kb: 9, stun: 26, life: 160 }); end(120); break;
    case 'nxSupernova': if (T === 6) { A({ kind: 'xNovaCore', x: o.x, y: o.y - 90 * s, w: 10, h: 10, dmg: 0, life: 52 }); A({ kind: 'xNova', x: o.x, y: o.y - 90 * s, w: 320, h: 320, dmg: 22, launch: -14, kb: 16, stun: 50, life: 16, delay: 50, maxHits: 1, txt: ['초신성!!'] }); } if (T === 56) { shake = 26; SFX.boom(); nxTint = { c: 'rgba(255,255,255,0.5)', t: 10 }; } end(90); break;
    case 'nxRainbow': if (T === 8) A({ kind: 'xRainbowBeam', follow: true, x: f.x, y: f.y - 95 * s, w: 620, h: 80, dmg: 4, multi: 7, maxHits: 6, kb: 6, stun: 24, life: 70 }); end(84); break;
    case 'nxSakura': if (T === 6) A({ kind: 'xTornado', x: o.x, y: GROUND - 130, w: 150, h: 260, dmg: 4, multi: 8, maxHits: 6, kb: 2, stun: 26, launch: -3, life: 76, delay: 8 }); end(96); break;
    case 'nxGhostShip': if (T === 6) A({ kind: 'xGhostShip', x: behind, y: GROUND - 120, vx: F * 8, w: 260, h: 210, dmg: 6, multi: 10, maxHits: 4, kb: 8, stun: 28, life: 240 }); if (T === 6) nxTint = { c: 'rgba(0,77,64,0.25)', t: 140 }; end(160); break;
    case 'nxMoonSlash': if (T === 1) nxTint = { c: 'rgba(10,10,40,0.55)', t: 80, moon: true };
      if (!f.ultHit) { if (T === 10) { f.x = clamp(o.x - F * 110, 40, W - 40); const r = U({ dmg: 3, stun: 50, kb: 0 }); if (r === 'hit' || r === 'armor') { f.ultHit = true; lock(); } else return ultEnd(f, o); } else if (T > 12) return ultEnd(f, o); break; }
      lock(); if (T > 12 && T <= 56 && T % 5 === 0) { U({ dmg: 2.2, stun: 40, kb: 0, hitstop: 2 }); nxFx(f, 'line', o.x, o.y - 100, 8, { len: 220, ang: rand(-1.2, 1.2) }); SFX.whiff(); }
      if (T === 66) { U({ dmg: 10, launch: -12, kb: 14, stun: 40, hitstop: 16, shake: 16 }); popText(o.x, o.y - 220, '월광!!', '#c5cae9', 40); } if (T >= 80) ultEnd(f, o); break;
    case 'nxHellGate': if (T === 6) { A({ kind: 'xPortal', x: o.x, y: GROUND - 6, w: 10, h: 10, dmg: 0, life: 90 }); A({ kind: 'xHellPillar', x: o.x, y: GROUND - 150, w: 140, h: 300, dmg: 5, burn: 120, multi: 8, maxHits: 5, launch: -4, kb: 3, stun: 28, life: 56, delay: 30 }); nxTint = { c: 'rgba(80,0,40,0.3)', t: 96 }; } end(100); break;
    case 'nxPhoenix': if (T === 8) A({ kind: 'xPhoenix', x: behind, y: GROUND - 140, vx: F * 13, w: 220, h: 170, dmg: 8, burn: 140, multi: 8, maxHits: 3, kb: 10, stun: 28, launch: -6, life: 160 }); end(120); break;
    case 'nxKO': grabCombo(6, 6, { dmg: 16, launch: -20, kb: 22, fx: () => { popText(o.x, o.y - 220, 'K.O. 펀치!!', '#ff1744', 44); nxFx(f, 'punch', o.x, o.y - 110, 18, { big: true }); SFX.slam(); } }, i => nxFx(f, 'punch', o.x + rand(-20, 20), o.y - 100 + rand(-30, 30), 8)); break;
    // 대규모 업데이트 21~30
    case 'nyDragon': if (T === 6) A({ kind: 'yDragon', x: f.x - F * 40 * s, y: f.y - 230 * s, w: 10, h: 10, dmg: 0, life: 80, dir: F }); if (T === 24) { A({ kind: 'yFireBeam', x: f.x + F * 390 * s, y: GROUND - 50, w: 660, h: 90, dmg: 4, burn: 140, multi: 7, maxHits: 6, kb: 4, stun: 26, life: 50, dir: F }); shake = Math.max(shake, 14); SFX.fire && SFX.fire(); } end(84); break;
    case 'nyMegaLaser': if (T === 4) nxTint = { c: 'rgba(0,229,255,0.12)', t: 100, grid: true }; if (T === 10) A({ kind: 'yOrbital', x: o.x, y: H / 2, w: 110, h: H, dmg: 5, multi: 8, maxHits: 5, kb: 3, stun: 26, life: 70, delay: 26 }); end(110); break;
    case 'nyCauldron': if (T === 6) { A({ kind: 'yCauldron', x: o.x, y: GROUND - 40, w: 10, h: 10, dmg: 0, life: 70 }); A({ kind: 'yBrew', x: o.x, y: GROUND - 140, w: 160, h: 280, dmg: 5, multi: 8, maxHits: 5, launch: -5, kb: 3, stun: 28, life: 40, delay: 34, txt: ['보글보글 펑!'] }); } end(90); break;
    case 'nyParade': if ([10, 22, 34, 46, 58].includes(T)) A({ kind: 'yJack', x: behind, y: GROUND - 60, vx: F * 7, vy: -6, g: 0.4, w: 50, h: 50, dmg: 5, kb: 6, stun: 22, launch: -5, life: 220, maxHits: 1 }); end(150); break;
    case 'nyWhale': if (T === 6) A({ kind: 'yWhale', x: o.x, y: GROUND - 110, w: 200, h: 220, dmg: 20, launch: -16, kb: 10, stun: 50, life: 40, delay: 40, maxHits: 1, txt: ['고래다!!'] }); end(100); break;
    case 'nyArrowStorm': if (T === 4) nxTint = { c: 'rgba(20,30,10,0.35)', t: 90 }; if (T >= 10 && T <= 70 && T % 3 === 0) A({ kind: 'yArrowDown', x: clamp(o.x + rand(-180, 180), 20, W - 20), y: -40, vy: 16, w: 14, h: 40, dmg: 2, kb: 1, stun: 18, life: 60, maxHits: 1 }); end(96); break;
    case 'nyMagicBox': if (T === 6) A({ kind: 'yBox', x: o.x, y: GROUND - 90, w: 120, h: 180, dmg: 3, multi: 8, maxHits: 6, kb: 0, stun: 40, life: 60, delay: 12, txt: ['쓱싹!'] }); if (T === 78) nxFx(f, 'stars', o.x, o.y - 90, 22); end(100); break;
    case 'nyTkCombo': grabCombo(5, 7, { dmg: 15, launch: -18, kb: 20, fx: () => { popText(o.x, o.y - 220, '격파!!!', '#ff1744', 44); nxFx(f, 'sparks', o.x, o.y - 60, 18); SFX.slam(); } }, i => nxFx(f, 'slash', o.x, o.y - 100 + (i % 2 ? -20 : 20), 8, { col: '#fff', up: i % 2 })); break;
    case 'nyStorm': if (T === 4) nxTint = { c: 'rgba(10,10,30,0.4)', t: 110 }; if (T >= 14 && T <= 84 && (T - 14) % 14 === 0) { A({ kind: 'yBolt', x: clamp(o.x + rand(-90, 90), 30, W - 30), y: GROUND - 270, w: 60, h: 540, dmg: 6, kb: 3, stun: 26, launch: -4, life: 12, delay: 16, maxHits: 1 }); } end(110); break;
    case 'nyQueen': if (T === 6) { A({ kind: 'yQueen', x: behind, y: 120, vx: F * 6, w: 10, h: 10, dmg: 0, life: 140 }); A({ kind: 'ySwarm', x: o.x, y: o.y - 90 * s, w: 130, h: 160, dmg: 2.5, multi: 8, maxHits: 8, kb: 0, stun: 22, slow: 60, life: 80, delay: 24 }); } end(110); break;
    case 'nyHapkido': grabCombo(3, 12, { dmg: 13, launch: -20, kb: 18, fx: () => { popText(o.x, o.y - 220, '합기!!!', '#90caf9', 44); nxFx(f, 'stars', o.x, o.y - 100, 20); SFX.slam(); } }, i => { o.x = clamp(f.x + (i % 2 ? -F : F) * 90 * s, 40, W - 40); shake = Math.max(shake, 12); burst(o.x, GROUND - 6, 10, ['#d7ccc8', '#a1887f'], 6); popText(o.x, o.y - 170, '메치기!', '#fff', 26); SFX.slam(); }); break;
    default: end(30);
  }
}
let nxTint = null;   // 필살기 화면 색 (석양 · 해킹 · 달밤 등)
function drawNxTint() {
  if (!nxTint) return; if (--nxTint.t <= 0) { nxTint = null; return; }
  ctx.save(); ctx.fillStyle = nxTint.c; ctx.fillRect(0, 0, W, H);
  if (nxTint.grid) { ctx.strokeStyle = 'rgba(0,229,255,0.25)'; ctx.lineWidth = 1; for (let x = (gT * 2) % 40; x < W; x += 40) line(x, 0, x, H); for (let y = 0; y < H; y += 40) line(0, y, W, y); }
  if (nxTint.moon) { ctx.fillStyle = 'rgba(255,253,231,0.9)'; ctx.beginPath(); ctx.arc(W - 160, 110, 54, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
// ---- 물체 그림 ----
function drawNxObj(o) {
  const K = o.kind; if (K !== 'nxFx' && K[0] !== 'x') return false;
  const dir = o.dir || Math.sign(o.vx) || o.owner.facing, t = o.t;
  if (o.delay > 0) {   // 떨어질·솟을 자리 경고
    if (['xLavaPool', 'xFlower', 'xHand', 'xHellPillar', 'xPillar2', 'xNova', 'xGiantSword', 'xTornado'].includes(K)) { ctx.save(); ctx.strokeStyle = `rgba(255,82,82,${0.4 + 0.4 * Math.sin(gT * 0.6)})`; ctx.lineWidth = 3; ell(o.x, GROUND - 6, Math.max(40, Math.min(o.w, 160) / 2), 12); ctx.stroke(); ctx.restore(); }
    return true;
  }
  ctx.save(); ctx.translate(o.x, o.y);
  const glowC = (c, b = 16) => { ctx.shadowColor = c; ctx.shadowBlur = b; };
  switch (K) {
    case 'nxFx': {
      const a = Math.max(0, o.life / 14); ctx.globalAlpha = Math.min(1, a); const F = o.face;
      if (o.fx === 'slash') { ctx.scale(F, 1); ctx.strokeStyle = o.col || '#fff'; ctx.lineWidth = 10; glowC(o.col || '#fff', 20); ctx.beginPath(); ctx.arc(-40, 0, 90, o.up ? 0.6 : -1.2, o.up ? -1.2 : 0.9, o.up); ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke(); }
      else if (o.fx === 'swing') { ctx.scale(F, 0.42); ctx.strokeStyle = o.col || '#fff'; ctx.lineWidth = 12; glowC(o.col || '#fff', 18); ctx.beginPath(); ctx.arc(0, 0, 110, Math.PI * 0.9, Math.PI * 2.15); ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.stroke(); }   // 옆으로 휘두른 배트 궤적
      else if (o.fx === 'thrust') { ctx.scale(F, 1); ctx.strokeStyle = o.col; ctx.lineWidth = 8; glowC(o.col, 18); line(-90, 0, 60, 0); ctx.fillStyle = '#fff'; poly([[60, -10], [90, 0], [60, 10]]); ctx.fill(); }
      else if (o.fx === 'shield') { ctx.scale(F, 1); ctx.fillStyle = '#90a4ae'; ctx.strokeStyle = '#ffd740'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -46); ctx.lineTo(28, -36); ctx.lineTo(24, 20); ctx.lineTo(0, 46); ctx.lineTo(-24, 20); ctx.lineTo(-28, -36); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#d32f2f'; ctx.fillRect(-4, -30, 8, 50); ctx.fillRect(-18, -12, 36, 8); }
      else if (o.fx === 'sparks') { for (let i = 0; i < 10; i++) { const a2 = -Math.PI * (i / 9), r = 30 + (14 - o.life) * 6; ctx.strokeStyle = i % 2 ? '#ffd740' : '#e040fb'; ctx.lineWidth = 4; line(Math.cos(a2) * r * 0.5, Math.sin(a2) * r * 0.5, Math.cos(a2) * r, Math.sin(a2) * r); } }
      else if (o.fx === 'hands') { ctx.fillStyle = '#ffccbc'; for (let i = 0; i < 6; i++) { const x = -100 + i * 40, y = -20 - Math.abs(Math.sin(gT * 0.3 + i)) * 26; ctx.fillRect(x - 4, y, 8, 30); ell(x, y, 7, 7); ctx.fill(); } }
      else if (o.fx === 'wave') { ctx.scale(F, 1); ctx.fillStyle = 'rgba(41,182,246,0.75)'; ctx.beginPath(); ctx.moveTo(-90, 0); ctx.quadraticCurveTo(-60, -90, 10, -70); ctx.quadraticCurveTo(-30, -50, -10, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff'; for (let i = 0; i < 6; i++) ell(-70 + i * 14, -60 + Math.sin(gT * 0.4 + i) * 6, 5, 4), ctx.fill(); ctx.fillStyle = '#ffeb3b'; rr(-50, -6, 90, 10, 5); ctx.fill(); }
      else if (o.fx === 'dust') { ctx.fillStyle = 'rgba(161,136,127,0.6)'; for (let i = 0; i < 5; i++) ell(-o.face * (30 + i * 20), -10 - i * 3, 16 + i * 4, 10 + i * 2), ctx.fill(); }
      else if (o.fx === 'glitch') { for (let i = 0; i < 8; i++) { ctx.fillStyle = ['#00e5ff', '#ff4081', '#76ff03'][i % 3]; ctx.globalAlpha = 0.6 * a; ctx.fillRect(rand(-60, 40), rand(-80, 80), rand(20, 70), rand(4, 10)); } }
      else if (o.fx === 'stars' || o.fx === 'smoke') { for (let i = 0; i < 9; i++) { const a2 = i / 9 * Math.PI * 2 + gT * 0.1, r = 30 + (20 - o.life) * 3; if (o.fx === 'stars') { ctx.fillStyle = i % 2 ? '#fff59d' : '#b388ff'; star(Math.cos(a2) * r, Math.sin(a2) * r, 7, 3); ctx.fill(); } else { ctx.fillStyle = 'rgba(60,60,80,0.6)'; ell(Math.cos(a2) * r, Math.sin(a2) * r, 18, 14); ctx.fill(); } } }
      else if (o.fx === 'rainbow') { for (let i = 0; i < 6; i++) { ctx.strokeStyle = `hsl(${i * 55},90%,62%)`; ctx.lineWidth = 6; line(-o.face * 160, -60 + i * 7, -o.face * 20, -60 + i * 7); } }
      else if (o.fx === 'line') { ctx.rotate(o.ang || 0); ctx.strokeStyle = '#e8eaf6'; ctx.lineWidth = 5; glowC('#c5cae9', 20); line(-(o.len || 200) / 2, 0, (o.len || 200) / 2, 0); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; line(-(o.len || 200) / 2, 0, (o.len || 200) / 2, 0); }
      else if (o.fx === 'fireRing') { ctx.strokeStyle = '#ff6d00'; ctx.lineWidth = 6; glowC('#ff3d00', 20); ctx.beginPath(); ctx.ellipse(0, 0, 90, 30, 0, 0, Math.PI * 2); ctx.stroke(); }
      else if (o.fx === 'punch') { const sc2 = o.big ? 2.2 : 1; ctx.scale(F * sc2, sc2); ctx.fillStyle = '#d50000'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3; rr(-22, -18, 40, 36, 14); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fafafa'; ctx.fillRect(-30, -12, 10, 24); ctx.strokeStyle = '#ffd740'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { const a2 = i / 6 * Math.PI * 2; line(Math.cos(a2) * 34, Math.sin(a2) * 34, Math.cos(a2) * 46, Math.sin(a2) * 46); } }
      else if (o.fx === 'tracer') { ctx.scale(F, 1); ctx.strokeStyle = 'rgba(255,236,179,0.9)'; ctx.lineWidth = 3; glowC('#ffab00', 12); line(-(o.len || 200) / 2, 0, (o.len || 200) / 2, 0); }
      else if (o.fx === 'muzzle') { ctx.scale(F, 1); ctx.fillStyle = '#fff59d'; glowC('#ffab00', 20); poly([[0, -12], [30, 0], [0, 12], [8, 0]]); ctx.fill(); }
      else if (o.fx === 'cookie') { ctx.fillStyle = '#d7a86e'; ell(0, 0, 18, 18); ctx.fill(); ctx.fillStyle = '#4e342e'; for (const [x, y] of [[-6, -5], [5, -2], [-2, 7], [8, 8]]) { ell(x, y, 3, 3); ctx.fill(); } }
      break; }
    case 'xSwordWave': ctx.scale(dir, 1); glowC('#e3f2fd', 24); ctx.fillStyle = 'rgba(227,242,253,0.85)'; ctx.beginPath(); ctx.arc(-20, 0, 52, -1.3, 1.3); ctx.arc(-34, 0, 44, 1.2, -1.2, true); ctx.fill(); break;
    case 'xGift': if (o.exploded) { ctx.fillStyle = 'rgba(255,82,82,0.6)'; ell(0, 0, 80, 50); ctx.fill(); break; } ctx.rotate(t * 0.15); ctx.fillStyle = '#e53935'; rr(-17, -17, 34, 34, 4); ctx.fill(); ctx.fillStyle = '#ffd740'; ctx.fillRect(-4, -17, 8, 34); ctx.fillRect(-17, -4, 34, 8); ell(-6, -20, 7, 5); ctx.fill(); ell(6, -20, 7, 5); ctx.fill(); break;
    case 'xSnow': ctx.fillStyle = '#fafafa'; ctx.strokeStyle = '#90caf9'; ctx.lineWidth = 2; ell(0, 0, 12, 12); ctx.fill(); ctx.stroke(); break;
    case 'xBullet': ctx.scale(dir, 1); glowC('#ffab00', 14); ctx.fillStyle = '#ffd54f'; rr(-10, -4, 22, 8, 4); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; line(-40, 0, -12, 0); break;
    case 'xLasso': ctx.strokeStyle = '#d7a86e'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 0, 24, 18, t * 0.3, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-dir * 20, 0); ctx.quadraticCurveTo(-dir * 80, 30, -dir * (o.x - o.owner.x) * dir, 10); ctx.stroke(); break;
    case 'xRiff': ctx.scale(dir, 1); ctx.strokeStyle = '#e040fb'; glowC('#e040fb', 16); for (let i = 0; i < 3; i++) { ctx.lineWidth = 5 - i; ctx.beginPath(); ctx.arc(-i * 14, 0, 40 + i * 10, -0.9, 0.9); ctx.stroke(); } txt('♪', 0, -50, 24, '#fff', '#000', 3); break;
    case 'xWater': ctx.fillStyle = 'rgba(79,195,247,0.9)'; ell(0, 0, 10, 7); ctx.fill(); ctx.fillStyle = '#fff'; ell(-3, -2, 3, 2); ctx.fill(); break;
    case 'xTube': ctx.rotate(t * 0.2); ctx.lineWidth = 12; ctx.setLineDash([12, 10]); ctx.strokeStyle = '#ff5252'; ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.stroke(); ctx.lineDashOffset = 12; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.setLineDash([]); break;
    case 'xBall': ctx.rotate(t * 0.4); ctx.fillStyle = '#fafafa'; ell(0, 0, 11, 11); ctx.fill(); ctx.strokeStyle = '#e53935'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-14, 0, 10, -0.8, 0.8); ctx.stroke(); ctx.beginPath(); ctx.arc(14, 0, 10, Math.PI - 0.8, Math.PI + 0.8); ctx.stroke(); break;
    case 'xDrone': case 'xDrone2': ctx.fillStyle = '#263238'; rr(-16, -8, 32, 14, 5); ctx.fill(); ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 2; for (const x of [-14, 14]) { line(x, -8, x, -14); ctx.beginPath(); ctx.ellipse(x, -15, 12, 3, 0, 0, Math.PI * 2); ctx.stroke(); } glowC('#00e5ff', 16); ctx.fillStyle = '#00e5ff'; ell(0, -1, 5, 4); ctx.fill(); break;
    case 'xLaser': glowC('#00e5ff', 20); ctx.rotate(Math.atan2(o.vy, o.vx)); ctx.fillStyle = '#e0f7fa'; rr(-20, -4, 40, 8, 4); ctx.fill(); break;
    case 'xEmp': { const a = o.life / 14; ctx.strokeStyle = `rgba(0,229,255,${a})`; ctx.lineWidth = 6; glowC('#00e5ff', 24); ctx.beginPath(); ctx.ellipse(0, 0, 140 * (1.2 - a * 0.4), 80 * (1.2 - a * 0.4), 0, 0, Math.PI * 2); ctx.stroke(); break; }
    case 'xBoulder': case 'xLavaRock': if (o.exploded) { ctx.fillStyle = 'rgba(255,109,0,0.6)'; ell(0, 0, 80, 50); ctx.fill(); break; } ctx.rotate(t * 0.1); ctx.fillStyle = '#4e342e'; ctx.strokeStyle = '#ff6d00'; ctx.lineWidth = 3; poly([[-22, -8], [-10, -22], [14, -20], [24, 0], [12, 20], [-14, 20]]); ctx.fill(); ctx.stroke(); break;
    case 'xLavaPool': glowC('#ff3d00', 20); ctx.fillStyle = `rgba(255,${90 + Math.sin(gT * 0.3) * 30},0,0.85)`; ell(0, 6, 66, 14); ctx.fill(); ctx.fillStyle = '#ffab00'; for (let i = 0; i < 3; i++) ell(-30 + i * 30, 2 - Math.abs(Math.sin(gT * 0.2 + i)) * 10, 5, 5), ctx.fill(); break;
    case 'xQuake': ctx.fillStyle = '#5d4037'; for (let i = 0; i < 4; i++) poly([[-30 + i * 16, 20], [-24 + i * 16, -10 - (i % 2) * 14], [-16 + i * 16, 20]]), ctx.fill(); break;
    case 'xFlake': ctx.rotate(t * 0.3); ctx.strokeStyle = '#e1f5fe'; ctx.lineWidth = 3; glowC('#40c4ff', 14); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; line(0, 0, Math.cos(a) * 14, Math.sin(a) * 14); } break;
    case 'xIceWall': ctx.fillStyle = 'rgba(179,229,252,0.85)'; ctx.strokeStyle = '#0288d1'; ctx.lineWidth = 3; poly([[-20, 75], [-22, -40], [0, -78], [22, -44], [20, 75]]); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; line(-8, 60, -4, -40); break;
    case 'xGoldBeam': ctx.scale(dir, 1); glowC('#ffd740', 24); const g = ctx.createLinearGradient(-45, 0, 45, 0); g.addColorStop(0, 'rgba(255,215,64,0)'); g.addColorStop(1, '#fff59d'); ctx.fillStyle = g; rr(-45, -12, 90, 24, 12); ctx.fill(); break;
    case 'xCoin2': ctx.scale(Math.cos(t * 0.3), 1); ctx.fillStyle = '#ffd740'; ctx.strokeStyle = '#ff8f00'; ctx.lineWidth = 3; ell(0, 0, 14, 14); ctx.fill(); ctx.stroke(); break;
    case 'xGuard': { ctx.scale(dir, 1); const st = Math.sin(t * 0.4) * 6; ctx.fillStyle = '#c62828'; rr(-16, -30, 32, 40, 6); ctx.fill(); ctx.fillStyle = '#ffccbc'; ell(4, -40, 14, 13); ctx.fill(); ctx.fillStyle = '#212121'; rr(-10, -70, 24, 22, 4); ctx.fill(); ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 3; line(-10, 10, -10 + st, 40); line(10, 10, 10 - st, 40); ctx.strokeStyle = '#bdbdbd'; line(18, -20, 30, -70); break; }
    case 'xWell': ctx.rotate(t * 0.15); for (let i = 0; i < 4; i++) { ctx.strokeStyle = `rgba(179,136,255,${0.8 - i * 0.18})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 14 + i * 12, i, i + 4); ctx.stroke(); } ctx.fillStyle = '#000'; ell(0, 0, 12, 12); ctx.fill(); break;
    case 'xComet': if (o.exploded) { ctx.fillStyle = 'rgba(179,136,255,0.6)'; ell(0, 0, 80, 50); ctx.fill(); break; } glowC('#b388ff', 26); ctx.fillStyle = '#ede7f6'; ell(0, 0, 18, 18); ctx.fill(); break;
    case 'xSparkle': ctx.rotate(t * 0.2); glowC('#ff80ab', 20); ctx.fillStyle = `hsl(${(t * 8) % 360},90%,70%)`; star(0, 0, 18, 7); ctx.fill(); break;
    case 'xPetal': ctx.rotate(t * 0.3); ctx.fillStyle = '#f8bbd0'; ctx.strokeStyle = '#f06292'; ctx.lineWidth = 1.5; ell(0, 0, 12, 7); ctx.fill(); ctx.stroke(); break;
    case 'xFlower': ctx.fillStyle = '#66bb6a'; for (let i = 0; i < 5; i++) ctx.fillRect(-30 + i * 14, -10 - (i % 2) * 14, 4, 40); ctx.fillStyle = '#f48fb1'; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; ell(Math.cos(a) * 10, -24 + Math.sin(a) * 10, 8, 8); ctx.fill(); } ctx.fillStyle = '#ffd740'; ell(0, -24, 6, 6); ctx.fill(); break;
    case 'xSkull': glowC('#69f0ae', 20); ctx.fillStyle = 'rgba(224,242,241,0.9)'; ell(0, 0, 16, 15); ctx.fill(); ctx.fillRect(-9, 8, 18, 10); ctx.fillStyle = '#004d40'; ell(-6, -2, 4, 5); ctx.fill(); ell(6, -2, 4, 5); ctx.fill(); break;
    case 'xHand': { const up = Math.min(1, t / 8); ctx.translate(0, 60 * (1 - up)); ctx.fillStyle = 'rgba(105,240,174,0.85)'; rr(-14, -20, 28, 90, 10); ctx.fill(); for (let i = 0; i < 4; i++) rr(-14 + i * 8, -52, 6, 34, 3), ctx.fill(); break; }
    case 'xShuriken': ctx.rotate(t * 0.6); ctx.fillStyle = '#b0bec5'; for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); poly([[0, -4], [14, 0], [0, 4]]); ctx.fill(); } ctx.fillStyle = '#263238'; ell(0, 0, 3, 3); ctx.fill(); break;
    case 'xHellOrb': glowC('#d500f9', 30); { const g2 = ctx.createRadialGradient(0, 0, 4, 0, 0, 30); g2.addColorStop(0, '#fff'); g2.addColorStop(0.4, '#d500f9'); g2.addColorStop(1, 'rgba(80,0,40,0)'); ctx.fillStyle = g2; ell(0, 0, 30, 30); ctx.fill(); } break;
    case 'xChain': ctx.scale(dir, 1); ctx.strokeStyle = '#9e9e9e'; ctx.lineWidth = 3; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.ellipse(-i * 14, 0, 7, 4, 0, 0, Math.PI * 2); ctx.stroke(); } ctx.fillStyle = '#616161'; poly([[0, -10], [16, 0], [0, 10]]); ctx.fill(); break;
    case 'xFireball': glowC('#ff3d00', 24); ctx.fillStyle = '#ff6d00'; ell(0, 0, 16, 14); ctx.fill(); ctx.fillStyle = '#ffe082'; ell(dir * 4, 0, 8, 7); ctx.fill(); break;
    case 'xPillar2': case 'xHellPillar': { const hh = o.h, a = Math.min(1, t / 5); glowC(K === 'xHellPillar' ? '#d500f9' : '#ff3d00', 30); const g3 = ctx.createLinearGradient(0, hh / 2, 0, -hh / 2); g3.addColorStop(0, K === 'xHellPillar' ? '#6a1b9a' : '#ff3d00'); g3.addColorStop(1, 'rgba(255,214,0,0)'); ctx.fillStyle = g3; ctx.globalAlpha = a; rr(-o.w / 2, -hh / 2, o.w, hh, o.w / 2); ctx.fill(); break; }
    case 'xGiantSword': ctx.fillStyle = '#eceff1'; ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 4; glowC('#fff59d', 30); poly([[-20, -110], [20, -110], [22, 100], [0, 130], [-22, 100]]); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffd740'; rr(-50, -126, 100, 18, 6); ctx.fill(); ctx.fillStyle = '#5d4037'; rr(-9, -176, 18, 52, 5); ctx.fill(); ctx.fillStyle = '#ffd740'; ell(0, -180, 12, 12); ctx.fill(); break;
    case 'xSleigh': { ctx.scale(o.vx > 0 ? 1 : -1, 1); ctx.fillStyle = '#c62828'; ctx.strokeStyle = '#ffd740'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-60, -10); ctx.lineTo(40, -10); ctx.quadraticCurveTo(60, -10, 60, 10); ctx.lineTo(-60, 10); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#ffd740'; line(-70, 22, 70, 22); ctx.fillStyle = '#8d6e63'; for (let i = 0; i < 2; i++) { const x = 100 + i * 60, y = Math.sin(gT * 0.3 + i) * 5; ell(x, y, 22, 12); ctx.fill(); ctx.fillRect(x + 14, y - 26, 4, 18); } ctx.fillStyle = '#ff1744'; ell(178, Math.sin(gT * 0.3 + 1) * 5 - 2, 5, 5); ctx.fill(); ctx.fillStyle = '#a1887f'; ell(-30, -24, 26, 20); ctx.fill(); break; }
    case 'xAmp': ctx.fillStyle = '#212121'; ctx.strokeStyle = '#757575'; ctx.lineWidth = 4; rr(-60, -70, 120, 140, 10); ctx.fill(); ctx.stroke(); for (const y of [-30, 30]) { ctx.fillStyle = '#424242'; ell(0, y, 30 + Math.sin(gT * 0.8) * 3, 30 + Math.sin(gT * 0.8) * 3); ctx.fill(); ctx.fillStyle = '#111'; ell(0, y, 12, 12); ctx.fill(); } break;
    case 'xRing': { const a = o.life / 34; ctx.strokeStyle = `rgba(224,64,251,${a})`; ctx.lineWidth = 10; glowC('#e040fb', 26); ctx.beginPath(); ctx.ellipse(0, 0, o.w / 2, 110, 0, 0, Math.PI * 2); ctx.stroke(); break; }
    case 'xBigWave': { ctx.scale(o.vx > 0 ? 1 : -1, 1); const g4 = ctx.createLinearGradient(0, -130, 0, 130); g4.addColorStop(0, '#e1f5fe'); g4.addColorStop(0.4, '#29b6f6'); g4.addColorStop(1, '#01579b'); ctx.fillStyle = g4; ctx.beginPath(); ctx.moveTo(-90, 130); ctx.quadraticCurveTo(-80, -40, 30, -130); ctx.quadraticCurveTo(110, -110, 80, -60); ctx.quadraticCurveTo(40, -80, 20, -40); ctx.quadraticCurveTo(60, 40, 90, 130); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff'; for (let i = 0; i < 6; i++) ell(30 + i * 10, -124 + Math.sin(gT * 0.5 + i) * 4, 8, 6), ctx.fill(); break; }
    case 'xIceSpike': { const up = Math.min(1, t / 5); ctx.translate(0, 70 * (1 - up)); ctx.fillStyle = 'rgba(179,229,252,0.95)'; ctx.strokeStyle = '#0288d1'; ctx.lineWidth = 3; poly([[-26, 70], [-6, -70], [8, -40], [26, 70]]); ctx.fill(); ctx.stroke(); break; }
    case 'xBigCoin': ctx.rotate(o.spin || 0); glowC('#ffd740', 26); ctx.fillStyle = '#ffd740'; ctx.strokeStyle = '#e65100'; ctx.lineWidth = 6; ell(0, 0, 72, 72); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#ff8f00'; ctx.lineWidth = 4; ell(0, 0, 52, 52); ctx.stroke(); txt('🐷', 0, 0, 50, '#fff', null); break;
    case 'xNovaCore': { const k2 = 1 - o.life / 52; glowC('#fff59d', 40); ctx.fillStyle = '#fff'; star(0, 0, 10 + k2 * 50, 4 + k2 * 20); ctx.fill(); ctx.strokeStyle = 'rgba(179,136,255,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 160 * (1 - k2), 0, Math.PI * 2); ctx.stroke(); break; }
    case 'xNova': { const a = o.life / 16; ctx.globalAlpha = a; const g5 = ctx.createRadialGradient(0, 0, 10, 0, 0, 170); g5.addColorStop(0, '#fff'); g5.addColorStop(0.4, '#b388ff'); g5.addColorStop(1, 'rgba(26,35,126,0)'); ctx.fillStyle = g5; ell(0, 0, 170, 170); ctx.fill(); break; }
    case 'xRainbowBeam': { ctx.scale(o.owner.facing, 1); for (let i = 0; i < 6; i++) { ctx.fillStyle = `hsla(${i * 55 + gT * 6},95%,62%,0.85)`; ctx.fillRect(-o.w / 2, -36 + i * 12, o.w, 12); } ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-o.w / 2, -6, o.w, 12); break; }
    case 'xTornado': for (let i = 0; i < 7; i++) { const y = 120 - i * 38, r = 20 + i * 12; ctx.strokeStyle = `rgba(248,187,208,${0.9 - i * 0.08})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(Math.sin(gT * 0.3 + i) * 10, y, r, 10, 0, 0, Math.PI * 2); ctx.stroke(); } break;
    case 'xGhostShip': { ctx.scale(o.vx > 0 ? 1 : -1, 1); ctx.globalAlpha = 0.75; glowC('#69f0ae', 30); ctx.fillStyle = '#263238'; ctx.beginPath(); ctx.moveTo(-120, 30); ctx.lineTo(120, 30); ctx.lineTo(90, 90); ctx.lineTo(-100, 90); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#37474f'; ctx.fillRect(-6, -110, 10, 140); ctx.fillStyle = 'rgba(178,223,219,0.6)'; ctx.beginPath(); ctx.moveTo(4, -100); ctx.lineTo(80, -40 + Math.sin(gT * 0.2) * 8); ctx.lineTo(70, 0); ctx.lineTo(10, 10); ctx.lineTo(30, -40); ctx.closePath(); ctx.fill(); txt('☠', -50, 0, 34, '#69f0ae', null); break; }
    case 'xPortal': { ctx.scale(1, 0.25); glowC('#d500f9', 30); for (let i = 0; i < 3; i++) { ctx.strokeStyle = ['#d500f9', '#ff1744', '#4a148c'][i]; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 80 - i * 20, gT * 0.1 * (i + 1), gT * 0.1 * (i + 1) + 5); ctx.stroke(); } break; }
    case 'xPhoenix': { ctx.scale(o.vx > 0 ? 1 : -1, 1); glowC('#ff3d00', 40); const fl = Math.sin(gT * 0.5) * 30; ctx.fillStyle = '#ff6d00'; ctx.beginPath(); ctx.moveTo(-20, 0); ctx.quadraticCurveTo(-60, -80 - fl, -140, -60 - fl); ctx.quadraticCurveTo(-80, -20, -40, 10); ctx.fill(); ctx.fillStyle = '#ffab00'; ell(0, 0, 50, 22); ctx.fill(); ctx.fillStyle = '#ffe082'; ell(48, -12, 18, 14); ctx.fill(); ctx.fillStyle = '#ff3d00'; poly([[62, -14], [86, -8], [62, -4]]); ctx.fill(); ctx.fillStyle = '#ff6d00'; poly([[-44, 6], [-130, 40], [-110, 10], [-150, 20], [-50, -6]]); ctx.fill(); break; }
    default: ctx.restore(); return false;
  }
  ctx.restore(); return true;
}
// ---- 무기 돼지 기본 공격 ----
const WPN_COL = { sword: '#eceff1', katana: '#e8eaf6', flamesword: '#ff9100', bat: '#d7a86e', candycane: '#ff8a80', guitar: '#e040fb', scepter: '#ffd740', wand: '#fff59d', fan: '#f8bbd0', lantern: '#69f0ae', spear: '#b3e5fc', trident: '#d500f9', rockfist: '#ff6d00' };
const MUZ_FA = { jab: [88, -82], punch: [104, -72], throw: [98, -92], counter: [60, -104] };   // 공격이 다 뻗었을 때 앞손 자리 (drawPig의 fa)
function gunMuzzle(f, pose) {   // 총구 위치 (세상 좌표)
  const fa = MUZ_FA[pose] || MUZ_FA.punch, ang = Math.atan2(fa[1] + 64, fa[0] - 20), L = f.ch.wpn === 'watergun' ? 40 : f.ch.wpn === 'laser' ? 40 : 40;
  return [f.x + f.facing * (fa[0] + Math.cos(ang) * L) * f.sc, f.y + (fa[1] + Math.sin(ang) * L - 4) * f.sc];
}
function wpnAttack(f) {   // 공격 시작: 사거리·외침만 (이펙트는 실제로 휘두르는 순간 wpnFx)
  const a = f.atk, w = f.ch.wpn, gun = GUNS.includes(w), pole = POLES.includes(w);
  a.range = (a.range || 150) + (gun ? 45 : pole ? 35 : FIST_W.includes(w) ? 0 : 20);   // 무기만큼 멀리 닿음
  a.wpn = true; a.txt = gun ? ['탕!', '빵!'] : pole ? ['푹!', '찌르기!'] : FIST_W.includes(w) ? a.txt : ['챙!', '베기!'];
}
function wpnFx(f) {   // 무기 평타 이펙트: 휘두르는(쏘는) 그 순간, 그 자리에서 (공격이 끊기면 안 나옴)
  const a = f.atk, w = f.ch.wpn, k = f.sc / 1.15, F = f.facing, crouch = f.crouching && f.crouching() ? 0.72 : 1;
  const y = f.y - (a.height === 'high' ? 110 : a.height === 'low' ? 70 : 95) * k * crouch;
  if (GUNS.includes(w)) { const [mx, my0] = gunMuzzle(f, a.pose), my = f.y - (f.y - my0) * crouch; nxFx(f, 'muzzle', mx, my, 6); nxFx(f, 'tracer', mx + F * a.range * 0.4, my, 6, { len: a.range * 0.8 }); }
  else if (POLES.includes(w)) nxFx(f, 'thrust', f.x + F * (60 + a.range * 0.5) * k, y, 10, { col: WPN_COL[w] });
  else if (!FIST_W.includes(w)) nxFx(f, 'slash', f.x + F * 100 * k, y, 10, { col: WPN_COL[w] || '#fff' });
}
// ---- 손에 든 무기 (자세마다 각도) ----
const GUNS = ['revolver', 'watergun', 'laser'], POLES = ['spear', 'trident'];
// 앞손 자리 (drawPig의 fa와 같은 식) — 창을 양손으로 쥘 때 뒷손 위치 계산용
const handAt = (mv, k, by) => mv === 'jab' ? [38 + 50 * k, -82 + by] : mv === 'punch' ? [38 + 66 * k, -72 + by] : mv === 'uppercut' ? [lerp(40, 60, k), lerp(-46, -150, k) + by] : mv === 'throw' ? [38 + 60 * k, -92 + by] : mv === 'counter' ? [60, -104 + by] : mv === 'dash' ? [-26, -50 + by] : [50, -84 + by];
const WPN_BACK = ['spear', 'trident', 'bat', 'guitar', 'candycane', 'scepter'];   // 등에 메는 긴 무기 (나머지는 허리에)
function drawWeapon(w, hx, hy, ang, t, sheath) {
  if (WPN_TINT) { ctx.save(); ctx.filter = WPN_TINT; drawWeapon0(w, hx, hy, ang, t, sheath); ctx.restore(); return; }   // 스킨 색 무기
  drawWeapon0(w, hx, hy, ang, t, sheath);
}
function drawWeapon0(w, hx, hy, ang, t, sheath) {
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(ang); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2 * LWM;
  const blade = (len, c1, c2, wd = 5) => { if (sheath) { ctx.fillStyle = '#3e2723'; rr(10, -wd - 1, len + 4, wd * 2 + 2, wd); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffd740'; ctx.fillRect(len + 4, -wd, 4, wd * 2); return; } const g = ctx.createLinearGradient(0, -wd, 0, wd); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; poly([[10, -wd], [len, -wd + 1], [len + 12, 0], [len, wd - 1], [10, wd]]); ctx.fill(); ctx.stroke(); };   // sheath: 칼집
  if (sheath && HOLSTER_W.includes(w)) {   // 권총집: 손잡이만 위로 보임
    ctx.save(); ctx.scale(0.85, 0.85);
  }
  switch (w) {
    case 'sword': ctx.fillStyle = '#5d4037'; rr(-12, -3.5, 18, 7, 3); ctx.fill(); ctx.stroke(); blade(64, '#ffffff', '#90a4ae'); ctx.fillStyle = '#ffd740'; rr(4, -11, 6, 22, 2); ctx.fill(); ctx.stroke(); break;
    case 'katana': if (sheath) { ctx.fillStyle = '#212121'; rr(-16, -3, 22, 6, 2); ctx.fill(); ctx.fillStyle = '#1a237e'; rr(8, -4, 80, 8, 4); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffd740'; ell(7, 0, 4, 8); ctx.fill(); break; }
      ctx.fillStyle = '#212121'; rr(-16, -3, 22, 6, 2); ctx.fill(); ctx.fillStyle = '#c5cae9'; for (let i = 0; i < 3; i++) ctx.fillRect(-13 + i * 7, -3, 3, 6); ctx.fillStyle = '#ffd740'; ell(7, 0, 4, 8); ctx.fill(); ctx.fillStyle = '#eceff1'; ctx.beginPath(); ctx.moveTo(10, -3); ctx.quadraticCurveTo(50, -8, 88, -10); ctx.lineTo(80, -4); ctx.quadraticCurveTo(48, 1, 10, 3); ctx.closePath(); ctx.fill(); ctx.stroke(); break;
    case 'flamesword': ctx.fillStyle = '#3e2723'; rr(-12, -3.5, 18, 7, 3); ctx.fill(); blade(62, '#ffe082', '#ff3d00', 6); ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { ctx.fillStyle = `rgba(255,${120 + i * 20},0,0.6)`; ell(20 + i * 12, -8 - Math.abs(Math.sin(t * 0.4 + i)) * 8, 5, 9); ctx.fill(); } ctx.restore(); break;
    case 'revolver': ctx.fillStyle = '#5d4037'; poly([[-4, 0], [6, 0], [2, 14], [-8, 14]]); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#78909c'; rr(-4, -9, 26, 10, 3); ctx.fill(); ctx.stroke(); rr(18, -8, 20, 5, 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#546e7a'; ell(10, -4, 6, 6); ctx.fill(); break;
    case 'watergun': ctx.fillStyle = '#ff9100'; rr(-6, -10, 34, 12, 5); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#29b6f6'; ell(8, -16, 9, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffeb3b'; rr(26, -7, 12, 6, 3); ctx.fill(); ctx.fillStyle = '#ff9100'; rr(-6, 0, 9, 14, 3); ctx.fill(); ctx.stroke(); break;
    case 'laser': ctx.fillStyle = '#eceff1'; rr(-6, -10, 36, 12, 4); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#263238'; rr(-4, 0, 9, 13, 3); ctx.fill(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#00e5ff'; ctx.fillRect(2, -7, 22, 3); ell(34, -4, 5, 5); ctx.fill(); ctx.restore(); break;
    case 'bat': { const g = ctx.createLinearGradient(0, 0, 66, 0); g.addColorStop(0, '#a1887f'); g.addColorStop(1, '#d7a86e'); ctx.fillStyle = g; poly([[-10, -3], [62, -7], [68, 0], [62, 7], [-10, 3]]); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#212121'; ctx.fillRect(-10, -3, 10, 6); break; }
    case 'spear': ctx.strokeStyle = '#4fc3f7'; ctx.lineWidth = 5; line(-56, 0, 70, 0); ctx.fillStyle = '#e1f5fe'; ctx.strokeStyle = '#0288d1'; ctx.lineWidth = 2; poly([[68, -9], [98, 0], [68, 9], [74, 0]]); ctx.fill(); ctx.stroke(); break;
    case 'trident': ctx.strokeStyle = '#4a148c'; ctx.lineWidth = 5; line(-56, 0, 66, 0); ctx.strokeStyle = '#d500f9'; ctx.lineWidth = 4; line(66, -12, 66, 12); for (const y of [-12, 0, 12]) { line(66, y, 86 + (y ? 0 : 6), y); ctx.fillStyle = '#d500f9'; poly([[84 + (y ? 0 : 6), y - 4], [94 + (y ? 0 : 6), y], [84 + (y ? 0 : 6), y + 4]]); ctx.fill(); } break;
    case 'scepter': ctx.strokeStyle = '#ffb300'; ctx.lineWidth = 5; line(-14, 0, 50, 0); ctx.fillStyle = '#ffd740'; ctx.strokeStyle = '#e65100'; ctx.lineWidth = 2; ell(56, 0, 9, 9); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#d50000'; ell(56, 0, 4, 4); ctx.fill(); ctx.fillStyle = '#ffd740'; poly([[62, -8], [72, -12], [68, 0], [72, 12], [62, 8]]); ctx.fill(); break;
    case 'wand': ctx.strokeStyle = '#4527a0'; ctx.lineWidth = 4; line(-8, 0, 42, 0); ctx.fillStyle = '#fff59d'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; star(50, 0, 11, 5); ctx.fill(); ctx.stroke(); break;
    case 'candycane': ctx.lineWidth = 7; ctx.strokeStyle = '#fafafa'; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(44, 0); ctx.arc(44, -10, 10, Math.PI / 2, -Math.PI / 2, true); ctx.stroke(); ctx.strokeStyle = '#e53935'; ctx.lineWidth = 7; ctx.setLineDash([5, 7]); ctx.stroke(); ctx.setLineDash([]); break;
    case 'fan': ctx.fillStyle = '#f8bbd0'; ctx.strokeStyle = '#c2185b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 40, -0.7, 0.7); ctx.closePath(); ctx.fill(); ctx.stroke(); for (let i = -2; i <= 2; i++) line(0, 0, Math.cos(i * 0.3) * 40, Math.sin(i * 0.3) * 40); ctx.fillStyle = '#fff'; ell(28, -4, 5, 5); ctx.fill(); break;
    case 'lantern': ctx.strokeStyle = '#424242'; ctx.lineWidth = 3; line(0, 0, 30, 0); line(30, 0, 30, 10); ctx.fillStyle = '#37474f'; rr(20, 10, 20, 26, 4); ctx.fill(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(105,240,174,${0.7 + 0.3 * Math.sin(t * 0.2)})`; ell(30, 23, 7, 9); ctx.fill(); ctx.restore(); break;
    case 'guitar': ctx.fillStyle = '#e040fb'; poly([[-22, -7], [-12, -4], [-12, 4], [-22, 7]]); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#212121'; ctx.fillRect(-12, -3, 56, 6); ctx.fillStyle = '#e040fb'; ctx.beginPath(); ctx.ellipse(60, 0, 22, 16, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#212121'; ell(56, 0, 5, 5); ctx.fill(); ctx.fillRect(68, -7, 4, 14); ctx.strokeStyle = '#eee'; ctx.lineWidth = 1; line(-12, 0, 70, 0); break;   // 넥을 잡고 몸통이 앞쪽
    case 'broom': ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 4; line(-20, 0, 58, 0); ctx.fillStyle = '#ffca28'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; poly([[56, -7], [86, -13], [90, 0], [86, 13], [56, 7]]); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#d32f2f'; ctx.fillRect(54, -7, 5, 14); break;
    case 'scythe': ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 4; line(-30, 0, 72, 0); ctx.fillStyle = '#b0bec5'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(70, -2); ctx.quadraticCurveTo(84, -42, 30, -50); ctx.quadraticCurveTo(64, -32, 66, 2); ctx.closePath(); ctx.fill(); ctx.stroke(); break;
    case 'fishingrod': ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 3; line(-10, 0, 92, -4); ctx.fillStyle = '#90a4ae'; ell(6, 6, 5, 5); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1; line(92, -4, 92, 26); ctx.strokeStyle = '#b0bec5'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(89, 26, 3, 0, Math.PI); ctx.stroke(); break;
    case 'bow': ctx.strokeStyle = '#6d4c41'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(-34, 0, 34, -1.1, 1.1); ctx.stroke(); ctx.strokeStyle = '#eceff1'; ctx.lineWidth = 1; line(-34 + 34 * Math.cos(1.1), -34 * Math.sin(1.1), -34 + 34 * Math.cos(1.1), 34 * Math.sin(1.1)); if (!sheath) { ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 2; line(-16, 0, 22, 0); ctx.fillStyle = '#b0bec5'; poly([[22, -4], [30, 0], [22, 4]]); ctx.fill(); } break;
    case 'cane': ctx.strokeStyle = '#212121'; ctx.lineWidth = 4; line(-4, 0, 64, 0); ctx.beginPath(); ctx.arc(-4, -8, 8, Math.PI / 2, Math.PI * 1.5, false); ctx.stroke(); ctx.fillStyle = '#fafafa'; rr(60, -3, 9, 6, 2); ctx.fill(); break;
    case 'hammer': ctx.fillStyle = '#6d4c41'; rr(-14, -3, 52, 6, 2); ctx.fill(); ctx.stroke(); { const g = ctx.createLinearGradient(36, -16, 36, 16); g.addColorStop(0, '#eceff1'); g.addColorStop(1, '#78909c'); ctx.fillStyle = g; } rr(34, -16, 30, 32, 4); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffee58'; poly([[48, -12], [54, -2], [50, -2], [54, 10], [44, -2], [48, -2]]); ctx.fill(); break;
    case 'stinger': ctx.fillStyle = '#ffd740'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; poly([[-10, -5], [74, -2], [92, 0], [74, 2], [-10, 5]]); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#212121'; for (let i = 0; i < 4; i++) ctx.fillRect(4 + i * 16, -4, 6, 8); break;
    case 'mechafist': ctx.rotate(-ang); ctx.fillStyle = '#90a4ae'; ctx.strokeStyle = '#263238'; ctx.lineWidth = 2; rr(-15, -14, 30, 28, 7); ctx.fill(); ctx.stroke(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#00e5ff'; for (let i = 0; i < 3; i++) { ell(9, -8 + i * 8, 2.5, 2.5); ctx.fill(); } ctx.restore(); break;
    case 'rockfist': ctx.rotate(-ang); ctx.fillStyle = '#4e342e'; ctx.strokeStyle = '#ff6d00'; ctx.lineWidth = 2.5; poly([[-14, -10], [-4, -18], [12, -14], [16, 2], [6, 14], [-12, 10]]); ctx.fill(); ctx.stroke(); break;   // 돌주먹은 손에 씌움 (기울이지 않음)
  }
  if (sheath && HOLSTER_W.includes(w)) { ctx.restore(); ctx.fillStyle = '#6d4c41'; ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 2 * LWM; rr(-2, -12, 40, 14, 4); ctx.fill(); ctx.stroke(); }   // 권총집
  ctx.restore();
}
// ================= 🎉 대규모 업데이트 21~30 돼지 10마리: 새 스킬 30개 · 새 필살기 10개 · 새 무기 · 새 의상 =================
// type은 y로 시작 (필살기는 ny) · 물체 그림 drawNyObj · 움직임 nyObjTick · 의상 skinDeco2
const FIST_W = ['rockfist', 'mechafist'], HOLSTER_W = ['revolver', 'watergun', 'laser'];
GUNS.push('bow'); POLES.push('stinger'); WPN_BACK.push('scythe', 'fishingrod', 'broom', 'hammer', 'bow');
Object.assign(WPN_COL, { broom: '#ffca28', scythe: '#b0bec5', fishingrod: '#90caf9', bow: '#a1887f', cane: '#fafafa', hammer: '#ffee58', stinger: '#ffd740', mechafist: '#00e5ff' });
const NY_SKILL = {
  yDrTail: { startup: 10, active: 10, recovery: 20, dmg: 10, range: 195, height: 'low', kb: 7, stun: 26, knockdown: true, pose: 'spin', txt: ['꼬리!', '휘익!'] },
  yMcBoost: { sfx: 'heavy', startup: 8, active: 16, recovery: 20, dmg: 11, range: 150, height: 'mid', kb: 14, stun: 28, dash: 18, armor: true, pose: 'dash', hitstop: 10, shake: 10, txt: ['부스터!', '쾅!'] },
  yWtBroom: { startup: 8, active: 20, recovery: 18, dmg: 10, range: 150, height: 'mid', kb: 10, stun: 28, launch: -7, dash: 15, pose: 'dash', txt: ['슝!', '빗자루 돌진!'] },
  yPkScythe: { sfx: 'heavy', startup: 12, active: 16, recovery: 22, dmg: 7, hits: 2, hitEvery: 8, range: 235, height: 'mid', kb: 6, stun: 24, pose: 'punch', txt: ['서걱!', '낫!'] },
  yMgVanish: { startup: 16, active: 5, recovery: 16, dmg: 9, range: 150, height: 'mid', kb: 8, stun: 26, teleport: true, invuln: true, invulnF: 14, pose: 'punch', txt: ['짠!', '여기야!'] },
  yTkBack: { sfx: 'heavy', startup: 11, active: 6, recovery: 20, dmg: 13, range: 180, height: 'high', kb: 12, stun: 32, launch: -9, pose: 'highkick', kind: 'kick', hitstop: 12, shake: 10, txt: ['뒤돌려차기!'] },
  yTkFlurry: { startup: 6, active: 22, recovery: 16, dmg: 3.5, hits: 4, hitEvery: 5, range: 170, height: 'mid', kb: 2, stun: 16, dash: 5, pose: 'highkick', kind: 'kick', txt: ['얍!', '얍얍!'] },
  yTkBreak: { sfx: 'heavy', startup: 16, active: 6, recovery: 22, dmg: 14, range: 150, height: 'mid', kb: 14, stun: 34, guardBreak: true, pose: 'punch', hitstop: 14, shake: 14, txt: ['격파!!'] },
  yThSlam: { sfx: 'heavy', startup: 14, active: 6, recovery: 22, dmg: 12, range: 170, height: 'mid', kb: 8, stun: 30, knockdown: true, pose: 'uppercut', hitstop: 12, shake: 16, txt: ['쾅!!'] },
  yBeSting: { startup: 7, active: 8, recovery: 16, dmg: 9, range: 205, height: 'mid', kb: 6, stun: 22, burn: 80, dash: 6, pose: 'punch', txt: ['따끔!', '벌침!'] }
};
Object.assign(NY_SKILL, {
  yHkThrow: { sfx: 'heavy', startup: 7, active: 6, recovery: 22, dmg: 11, range: 155, dash: 5, height: 'mid', kb: 6, stun: 40, launch: -8, throwBehind: true, pose: 'punch', hitstop: 12, shake: 12, txt: ['꺾고!', '넘기기!'] },
  yHkPalm: { sfx: 'heavy', startup: 12, active: 6, recovery: 20, dmg: 9, range: 160, height: 'mid', kb: 22, stun: 30, pose: 'punch', hitstop: 10, shake: 10, txt: ['하앗!', '장타!'] }
});
const NY_CAST = { yHkParry: 3, yDrBreath: 10, yDrScale: 4, yMcRocket: 12, yMcMissile: 12, yWtPotion: 13, yWtBats: 10, yPkBomb: 12, yPkCandy: 10, yFsHook: 12, yFsFish: 12, yFsNet: 14, yArShot: 9, yArRain: 12, yArTrap: 10, yMgCard: 9, yMgDove: 12, yThHammer: 12, yThBolt: 12, yBeHoney: 12, yBeSwarm: 12 };
for (const [k, v] of Object.entries(NY_SKILL)) SKILLDEF[k] = v;
for (const [k, st] of Object.entries(NY_CAST)) SKILLDEF[k] = { startup: st, active: 1, recovery: 20, pose: k === 'yDrScale' || k === 'yHkParry' ? 'counter' : ['yArShot', 'yArRain', 'yMcRocket'].includes(k) ? 'punch' : 'throw', buff: true };
function nySkillStart(f, s) {
  const t = s.type; if (t[0] !== 'y' || !SKILLDEF[t]) return;
  const k = f.sc / 1.15, F = f.facing, d = f.opp, D = SKILLDEF[t].startup, gm = GUNS.includes(f.ch.wpn) ? gunMuzzle(f, SKILLDEF[t].pose) : null, hx = gm ? gm[0] : f.x + F * 70 * k, hy = gm ? gm[1] : f.y - 95 * k;
  const P = o => addObj({ owner: f, x: hx, y: hy, vx: F * 10, delay: D, dir: F, clash: true, height: 'mid', ...o });
  switch (t) {
    case 'yDrBreath': addObj({ owner: f, kind: 'yBreath', x: f.x + F * 130 * k, y: hy, w: 200, h: 90, dmg: 3, burn: 100, multi: 6, maxHits: 4, kb: 2, stun: 16, life: 40, delay: D, dir: F }); break;
    case 'yDrTail': nxFx(f, 'slash', f.x + F * 60 * k, f.y - 40 * k, 12, { delay: D, col: '#7e57c2' }); break;
    case 'yDrScale': f.invT = Math.max(f.invT || 0, 20); f.scaleSh = true; nxHeal(f, 6, ['#69f0ae', '#b9f6ca']); for (let i = objs.length - 1; i >= 0; i--) if (objs[i].kind === 'yScaleFx' && objs[i].owner === f) objs.splice(i, 1); addObj({ owner: f, kind: 'yScaleFx', x: f.x, y: f.y - 90 * k, w: 1, h: 1, dmg: 0, life: 42 }); break;
    case 'yMcRocket': P({ kind: 'yFist', vx: F * 13, back: 0.45, w: 40, h: 30, dmg: 9, kb: 8, stun: 24, life: 90 }); break;
    case 'yMcMissile': for (let i = 0; i < 3; i++) P({ kind: 'yMissile', vx: F * 6, vy: -3 + i * 3, w: 24, h: 16, dmg: 4, kb: 3, stun: 16, life: 120, delay: D + i * 5 }); break;
    case 'yMcBoost': nxFx(f, 'dust', f.x, f.y, 24); break;
    case 'yWtPotion': P({ kind: 'yPotion', vx: F * 6, vy: -9, g: 0.42, boom: 80, w: 28, h: 28, dmg: 7, kb: 6, stun: 20, life: 140, clash: false }); break;
    case 'yWtBats': for (let i = 0; i < 4; i++) P({ kind: 'yBat', vx: F * 7, w: 28, h: 22, dmg: 3, kb: 2, stun: 14, life: 100, delay: D + i * 4, y: hy + (i % 2 ? -22 : 18), ph: i, clash: false }); break;
    case 'yPkScythe': nxFx(f, 'slash', f.x + F * 110 * k, hy, 14, { delay: D, col: '#b0bec5' }); break;
    case 'yPkBomb': addObj({ owner: f, kind: 'yPumpkin', x: f.x + F * 60 * k, y: GROUND - 24, vx: F * 6, w: 44, h: 44, dmg: 11, kb: 9, stun: 28, launch: -6, life: 70, delay: D, height: 'low', dir: F }); break;
    case 'yPkCandy': P({ kind: 'yCandy', vx: F * 9, w: 26, h: 22, dmg: 4, stun: 64, kb: 0, life: 90, txt: ['어질어질~'] }); break;
    case 'yFsHook': P({ kind: 'yHook', vx: F * 15, w: 36, h: 30, dmg: 5, kb: 0, pull: true, stun: 34, life: 32, clash: false, txt: ['낚았다!'] }); break;
    case 'yFsFish': P({ kind: 'yFish', vx: F * 8, vy: -5, g: 0.22, w: 40, h: 24, dmg: 8, kb: 7, stun: 22, life: 110 }); break;
    case 'yFsNet': P({ kind: 'yNet', vx: F * 6, w: 70, h: 70, dmg: 3, stun: 72, kb: 0, life: 90, clash: false, txt: ['그물에 걸렸다!'] }); break;
    case 'yArShot': for (let i = 0; i < 3; i++) P({ kind: 'yArrow', vx: F * 17, w: 34, h: 10, dmg: 4, kb: 3, stun: 14, life: 60, delay: D + i * 6 }); break;
    case 'yArRain': for (let i = 0; i < 6; i++) addObj({ owner: f, kind: 'yArrowDown', x: clamp(d.x + (i - 2.5) * 36, 20, W - 20), y: -40 - i * 20, vy: 14, w: 14, h: 40, dmg: 3, kb: 2, stun: 14, life: 60, delay: D + 8 + i * 3 }); break;
    case 'yArTrap': addObj({ owner: f, kind: 'yTrap', x: clamp(f.x + F * 150 * k, 30, W - 30), y: GROUND - 12, w: 60, h: 24, dmg: 6, stun: 60, kb: 0, height: 'low', life: 360, delay: D, txt: ['덫!'] }); break;
    case 'yMgCard': for (let i = 0; i < 3; i++) P({ kind: 'yCard', vx: F * 12, vy: (i - 1) * 1.8, w: 24, h: 18, dmg: 4, kb: 3, stun: 14, life: 70, delay: D + i * 2 }); break;
    case 'yMgDove': for (let i = 0; i < 2; i++) P({ kind: 'yDove', vx: F * 6, w: 34, h: 26, dmg: 3, multi: 10, maxHits: 2, kb: 3, stun: 14, life: 110, delay: D + i * 8, ph: i, clash: false }); break;
    case 'yMgVanish': nxFx(f, 'smoke', f.x, f.y - 70 * k, 20); break;
    case 'yTkBreak': nxFx(f, 'sparks', f.x + F * 120 * k, hy, 16, { delay: D + 2 }); break;
    case 'yThHammer': P({ kind: 'yHammer', vx: F * 12, back: 0.4, w: 40, h: 40, dmg: 9, kb: 8, stun: 26, life: 100, multi: 20, maxHits: 2 }); break;
    case 'yThBolt': addObj({ owner: f, kind: 'yBolt', x: clamp(d.x, 30, W - 30), y: GROUND - 270, w: 60, h: 540, dmg: 11, kb: 4, stun: 30, launch: -6, life: 14, delay: D + 22, txt: ['번쩍!'] }); break;
    case 'yThSlam': for (const side of [F, -F]) addObj({ owner: f, kind: 'yShock', x: f.x + side * 60 * k, y: GROUND - 18, vx: side * 8, w: 50, h: 36, dmg: 6, height: 'low', knockdown: true, kb: 5, stun: 24, life: 45, delay: D, dir: side }); break;
    case 'yBeSting': nxFx(f, 'thrust', f.x + F * 130 * k, hy, 12, { delay: D, col: '#ffd740' }); break;
    case 'yBeHoney': addObj({ owner: f, kind: 'yHoney', x: clamp(d.x, 60, W - 60), y: GROUND - 12, w: 140, h: 26, dmg: 2, slow: 170, multi: 20, maxHits: 2, height: 'low', kb: 0, stun: 10, life: 200, delay: D + 10 }); break;
    case 'yHkParry': f.parryT = 45; addObj({ owner: f, kind: 'yParryFx', x: f.x, y: f.y - 90 * k, w: 1, h: 1, dmg: 0, life: 45 }); break;
    case 'yHkPalm': addObj({ owner: f, kind: 'yKi', x: f.x + F * 110 * k, y: hy, vx: F * 11, w: 50, h: 90, dmg: 5, kb: 16, stun: 22, life: 22, delay: D, dir: F, clash: false }); break;
    case 'yBeSwarm': for (let i = 0; i < 5; i++) P({ kind: 'yBee', vx: F * 5, vy: rand(-2, 2), w: 18, h: 18, dmg: 2, kb: 1, stun: 10, life: 140, delay: D + i * 4, clash: false }); break;
  }
}
function nyObjTick(o) {
  const K = o.kind; if (K[0] !== 'y') return false;
  const f = o.owner, d = f.opp, fs = f.sc / 1.15, k = d.sc / 1.15;
  if (K === 'yBreath') { o.x = f.x + o.dir * 130 * fs; o.y = f.y - 95 * fs; if (o.t % 2 === 0) flame(o.x + o.dir * rand(-80, 90), o.y + rand(-30, 30)); }
  if (K === 'yParryFx') { o.x = f.x; o.y = f.y - 90 * fs; if (!(f.parryT > 0)) o.life = 0; return true; }
  if (K === 'yScaleFx') { o.x = f.x; o.y = f.y - 90 * fs; o.life = f.scaleSh ? Math.max(o.life, 13) : Math.min(o.life, 12); return true; }   // 방패가 남아 있는 동안 계속 보임
  if (K === 'yMissile' || K === 'yBee') {   // 따라가는 미사일 · 벌
    const sp = K === 'yMissile' ? 7 : 5, ang = Math.atan2(d.y - 95 * k - o.y, d.x - o.x), cur = Math.atan2(o.vy, o.vx); let da = ang - cur; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
    const na = cur + clamp(da, K === 'yMissile' ? -0.07 : -0.12, K === 'yMissile' ? 0.07 : 0.12); o.vx = Math.cos(na) * sp; o.vy = Math.sin(na) * sp;
    if (K === 'yMissile' && o.t % 2 === 0) smoke(o.x - o.vx * 2, o.y - o.vy * 2, '160,160,160');
  }
  if (K === 'yPotion' && o.exploded && !o.pooled) { o.pooled = true; addObj({ owner: f, kind: 'yPoison', x: o.x, y: GROUND - 14, w: 130, h: 30, dmg: 3, burn: 120, multi: 18, maxHits: 3, height: 'low', kb: 1, stun: 12, life: 150 }); }
  if (K === 'yBat' || K === 'yDove') o.y += Math.sin(o.t * 0.35 + (o.ph || 0) * 2) * 2.5;
  if (K === 'yArrowDown' && o.y > GROUND - 20) { o.life = 0; burst(o.x, GROUND - 6, 3, ['#a1887f', '#d7ccc8'], 3); }
  if (K === 'yPumpkin' && o.life === 1) burst(o.x, o.y, 18, ['#ff9100', '#ffd740', '#4e342e'], 8);
  if (K === 'yOrbital') o.x += Math.sign(d.x - o.x) * Math.min(2.4, Math.abs(d.x - o.x));
  if ((K === 'yCauldron' && o.t < 34) || ((K === 'yBrew' || K === 'yWhale' || K === 'yBox') && o.t === 1)) o.x = clamp(d.x, 40, W - 40);   // 상대 자리로
  if (K === 'yJack' && o.y >= GROUND - 30 && o.vy > 0) { o.vy = -9; burst(o.x, GROUND - 6, 4, ['#ff9100', '#4e342e'], 4); }
  if (K === 'ySwarm') { o.x = d.x; o.y = d.y - 90 * k; }
  if (K === 'yQueen') o.y = 120 + Math.sin(o.t * 0.2) * 14;
  return false;
}
// ---- 필살기 (nxUlt 안에서 부름 · A·U·grabCombo·end·behind는 nxUlt의 것) ----
// ---- 물체 그림 ----
function drawNyObj(o) {
  const K = o.kind; if (K[0] !== 'y') return false;
  const dir = o.dir || Math.sign(o.vx) || o.owner.facing, t = o.t;
  if (o.delay > 0) {
    if (['yOrbital', 'yBrew', 'yWhale', 'yBox', 'yBolt', 'yHoney'].includes(K)) { ctx.save(); ctx.strokeStyle = `rgba(255,82,82,${0.4 + 0.4 * Math.sin(gT * 0.6)})`; ctx.lineWidth = 3; ell(o.x, GROUND - 6, Math.max(40, Math.min(o.w, 160) / 2), 12); ctx.stroke(); if (K === 'yOrbital' || K === 'yBolt') { ctx.strokeStyle = 'rgba(0,229,255,0.35)'; ctx.setLineDash([8, 8]); line(o.x, 0, o.x, GROUND); ctx.setLineDash([]); } ctx.restore(); }
    return true;
  }
  ctx.save(); ctx.translate(o.x, o.y);
  const glowC = (c, b = 16) => { ctx.shadowColor = c; ctx.shadowBlur = b; };
  switch (K) {
    case 'yBreath': ctx.scale(dir, 1); for (let i = 0; i < 6; i++) { const x = -90 + i * 34, r = 22 + i * 6 + Math.sin(gT * 0.5 + i) * 4; ctx.fillStyle = `rgba(255,${200 - i * 25},0,${0.7 - i * 0.07})`; ell(x, Math.sin(gT * 0.3 + i) * 6, r, r * 0.7); ctx.fill(); } break;
    case 'yParryFx': { ctx.globalAlpha = 0.5 + 0.3 * Math.sin(gT * 0.5); ctx.strokeStyle = '#90caf9'; ctx.lineWidth = 4; ctx.shadowColor = '#e3f2fd'; ctx.shadowBlur = 18; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, 50 + i * 10, gT * 0.2 + i * 2, gT * 0.2 + i * 2 + 2.4); ctx.stroke(); } break; }
    case 'yKi': { ctx.scale(dir, 1); ctx.globalAlpha = Math.min(1, o.life / 10); ctx.shadowColor = '#80d8ff'; ctx.shadowBlur = 24; ctx.strokeStyle = '#e1f5fe'; ctx.lineWidth = 6; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-i * 14, 0, 30 + i * 10, -1.0, 1.0); ctx.stroke(); } ctx.fillStyle = 'rgba(225,245,254,0.6)'; ell(8, 0, 16, 30); ctx.fill(); break; }
    case 'yScaleFx': { ctx.globalAlpha = Math.min(1, o.life / 12); ctx.strokeStyle = '#69f0ae'; ctx.lineWidth = 3; glowC('#69f0ae', 18); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + gT * 0.05; ctx.beginPath(); for (let j = 0; j < 6; j++) { const b = j / 6 * Math.PI * 2; ctx.lineTo(Math.cos(a) * 60 + Math.cos(b) * 16, Math.sin(a) * 80 + Math.sin(b) * 16); } ctx.closePath(); ctx.stroke(); } break; }
    case 'yFist': ctx.scale(o.vx > 0 ? 1 : -1, 1); ctx.fillStyle = '#90a4ae'; ctx.strokeStyle = '#263238'; ctx.lineWidth = 2; rr(-16, -14, 32, 28, 8); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#00e5ff'; for (let i = 0; i < 3; i++) ell(10, -8 + i * 8, 2.5, 2.5), ctx.fill(); ctx.fillStyle = '#ff9100'; poly([[-16, -8], [-34 - Math.random() * 10, 0], [-16, 8]]); ctx.fill(); break;
    case 'yMissile': ctx.rotate(Math.atan2(o.vy, o.vx)); ctx.fillStyle = '#eceff1'; rr(-12, -5, 22, 10, 4); ctx.fill(); ctx.fillStyle = '#e53935'; poly([[10, -5], [18, 0], [10, 5]]); ctx.fill(); ctx.fillStyle = '#ff9100'; poly([[-12, -4], [-20, 0], [-12, 4]]); ctx.fill(); break;
    case 'yPotion': if (o.exploded) { ctx.fillStyle = 'rgba(118,255,3,0.5)'; ell(0, 0, 75, 45); ctx.fill(); break; } ctx.rotate(t * 0.2); ctx.fillStyle = '#76ff03'; ctx.strokeStyle = '#1b5e20'; ctx.lineWidth = 2; ell(0, 4, 11, 11); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#bdbdbd'; ctx.fillRect(-4, -14, 8, 8); break;
    case 'yPoison': glowC('#76ff03', 16); ctx.fillStyle = 'rgba(100,221,23,0.75)'; ell(0, 6, 64, 13); ctx.fill(); ctx.fillStyle = '#ccff90'; for (let i = 0; i < 4; i++) ell(-36 + i * 24, 2 - Math.abs(Math.sin(gT * 0.25 + i)) * 12, 4, 4), ctx.fill(); break;
    case 'yBat': { ctx.scale(dir, 1); const fl = Math.sin(t * 0.9) * 10; ctx.fillStyle = '#212121'; ell(0, 0, 8, 7); ctx.fill(); poly([[-2, 0], [-18, -8 - fl], [-12, 4]]); ctx.fill(); poly([[2, 0], [18, -8 - fl], [12, 4]]); ctx.fill(); ctx.fillStyle = '#ff1744'; ell(3, -2, 1.5, 1.5); ctx.fill(); break; }
    case 'yPumpkin': ctx.rotate(t * 0.18 * dir); ctx.fillStyle = '#ff9100'; ctx.strokeStyle = '#e65100'; ctx.lineWidth = 2; ell(0, 0, 22, 20); ctx.fill(); ctx.stroke(); line(0, -20, 0, 20); ctx.fillStyle = '#3e2723'; poly([[-10, -6], [-4, -6], [-7, -12]]); ctx.fill(); poly([[4, -6], [10, -6], [7, -12]]); ctx.fill(); ctx.fillRect(-10, 4, 20, 4); break;
    case 'yCandy': ctx.rotate(t * 0.3); ctx.fillStyle = '#ff4081'; ell(0, 0, 9, 9); ctx.fill(); ctx.fillStyle = '#fff59d'; poly([[-9, 0], [-18, -7], [-18, 7]]); ctx.fill(); poly([[9, 0], [18, -7], [18, 7]]); ctx.fill(); break;
    case 'yHook': { ctx.strokeStyle = '#eceff1'; ctx.lineWidth = 1.5; const ox = o.owner.x + o.owner.facing * 100 * o.owner.sc / 1.15 - o.x, oy = o.owner.y - 110 * o.owner.sc / 1.15 - o.y; line(0, 0, ox, oy); ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-dir * 4, 4, 8, -0.3, Math.PI + 0.3); ctx.stroke(); break; }
    case 'yFish': ctx.rotate(t * 0.25); ctx.fillStyle = '#4fc3f7'; ctx.strokeStyle = '#01579b'; ctx.lineWidth = 2; ell(0, 0, 18, 9); ctx.fill(); ctx.stroke(); poly([[-16, 0], [-28, -9], [-28, 9]]); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#000'; ell(10, -2, 2, 2); ctx.fill(); break;
    case 'yNet': ctx.rotate(t * 0.1); ctx.strokeStyle = '#d7ccc8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI * 2); ctx.stroke(); for (let i = -2; i <= 2; i++) { line(i * 12, -30, i * 12, 30); line(-30, i * 12, 30, i * 12); } break;
    case 'yArrow': case 'yArrowDown': ctx.rotate(K === 'yArrowDown' ? Math.PI / 2 : (dir > 0 ? 0 : Math.PI)); ctx.strokeStyle = '#6d4c41'; ctx.lineWidth = 3; line(-18, 0, 14, 0); ctx.fillStyle = '#b0bec5'; poly([[14, -5], [24, 0], [14, 5]]); ctx.fill(); ctx.fillStyle = '#e53935'; poly([[-18, 0], [-24, -6], [-12, 0]]); ctx.fill(); poly([[-18, 0], [-24, 6], [-12, 0]]); ctx.fill(); break;
    case 'yTrap': ctx.fillStyle = '#616161'; ctx.strokeStyle = '#212121'; ctx.lineWidth = 2; ell(0, 6, 28, 6); ctx.fill(); ctx.stroke(); for (let i = -3; i <= 3; i++) { poly([[i * 8 - 4, 2], [i * 8, -8], [i * 8 + 4, 2]]); ctx.fill(); } break;
    case 'yCard': ctx.rotate(t * 0.4); ctx.fillStyle = '#fafafa'; ctx.strokeStyle = '#212121'; ctx.lineWidth = 1.5; rr(-9, -12, 18, 24, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e53935'; txt('♥', 0, 1, 12, '#e53935', null); break;
    case 'yDove': { ctx.scale(dir, 1); const fl = Math.sin(t * 0.8) * 9; ctx.fillStyle = '#fafafa'; ctx.strokeStyle = '#9e9e9e'; ctx.lineWidth = 1.5; ell(0, 0, 14, 9); ctx.fill(); ctx.stroke(); poly([[-4, -2], [-16, -14 - fl], [6, -4]]); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffb300'; poly([[13, -2], [19, 0], [13, 2]]); ctx.fill(); break; }
    case 'yHammer': ctx.rotate(t * 0.4); ctx.fillStyle = '#6d4c41'; ctx.fillRect(-3, -2, 6, 26); ctx.fillStyle = '#b0bec5'; ctx.strokeStyle = '#37474f'; ctx.lineWidth = 2; rr(-18, -16, 36, 18, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffee58'; poly([[-2, -14], [4, -8], [0, -8], [3, -2], [-4, -9], [0, -9]]); ctx.fill(); break;
    case 'yBolt': { const a = Math.min(1, o.life / 6); ctx.globalAlpha = a; glowC('#80d8ff', 30); ctx.strokeStyle = '#e1f5fe'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, -270); for (let i = 1; i <= 9; i++) ctx.lineTo((i % 2 ? 1 : -1) * rand(10, 26), -270 + i * 60); ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke(); break; }
    case 'yShock': ctx.scale(dir, 1); ctx.strokeStyle = '#ffee58'; ctx.lineWidth = 4; glowC('#ffee58', 12); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-i * 12, 18, 18 + i * 8, -1.2, 0); ctx.stroke(); } break;
    case 'yHoney': glowC('#ffb300', 14); ctx.fillStyle = 'rgba(255,179,0,0.85)'; ell(0, 6, 70, 13); ctx.fill(); ctx.fillStyle = '#fff8e1'; ell(-20, 2, 12, 3); ctx.fill(); break;
    case 'yBee': { ctx.scale(Math.sign(o.vx) || 1, 1); ctx.fillStyle = '#ffd740'; ell(0, 0, 8, 6); ctx.fill(); ctx.fillStyle = '#212121'; ctx.fillRect(-3, -6, 2, 12); ctx.fillRect(2, -6, 2, 12); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ell(-2, -8 - Math.abs(Math.sin(t)) * 3, 5, 4); ctx.fill(); break; }
    case 'yDragon': { ctx.scale(dir, 1); glowC('#7e57c2', 30); const fl = Math.sin(gT * 0.3) * 20; ctx.fillStyle = '#4527a0'; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.quadraticCurveTo(-120, -90 - fl, -200, -40 - fl); ctx.quadraticCurveTo(-130, -20, -60, 30); ctx.fill(); ctx.fillStyle = '#5e35b1'; ell(0, 20, 70, 34); ctx.fill(); ell(80, -10, 40, 26); ctx.fill(); ctx.fillStyle = '#ffd740'; ell(96, -18, 6, 6); ctx.fill(); ctx.fillStyle = '#311b92'; poly([[70, -30], [56, -70], [86, -36]]); ctx.fill(); ctx.fillStyle = '#ff6d00'; poly([[118, -6], [150, 0], [118, 8]]); ctx.fill(); break; }
    case 'yFireBeam': { ctx.scale(dir, 1); const g = ctx.createLinearGradient(-o.w / 2, 0, o.w / 2, 0); g.addColorStop(0, '#ff3d00'); g.addColorStop(0.5, '#ff9100'); g.addColorStop(1, 'rgba(255,214,0,0.3)'); ctx.fillStyle = g; glowC('#ff3d00', 30); rr(-o.w / 2, -o.h / 2 + Math.sin(gT * 0.5) * 4, o.w, o.h, o.h / 2); ctx.fill(); break; }
    case 'yOrbital': { glowC('#00e5ff', 40); const g = ctx.createLinearGradient(-55, 0, 55, 0); g.addColorStop(0, 'rgba(0,229,255,0)'); g.addColorStop(0.5, '#e0f7fa'); g.addColorStop(1, 'rgba(0,229,255,0)'); ctx.fillStyle = g; ctx.fillRect(-55, -H / 2, 110, H); break; }
    case 'yCauldron': ctx.fillStyle = '#212121'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ell(0, 6, 50, 32); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#76ff03'; ell(0, -20, 44, 10); ctx.fill(); for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(204,255,144,0.8)'; ell(-24 + i * 16, -28 - ((gT * 1.5 + i * 13) % 30), 6, 6); ctx.fill(); } break;
    case 'yBrew': { const a = Math.min(1, o.life / 10); ctx.globalAlpha = a; glowC('#76ff03', 30); const g = ctx.createLinearGradient(0, 140, 0, -140); g.addColorStop(0, '#33691e'); g.addColorStop(1, 'rgba(204,255,144,0)'); ctx.fillStyle = g; rr(-80, -140, 160, 280, 60); ctx.fill(); break; }
    case 'yJack': ctx.rotate(t * 0.15); ctx.fillStyle = '#ff9100'; ctx.strokeStyle = '#e65100'; ctx.lineWidth = 3; ell(0, 0, 26, 23); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffeb3b'; glowC('#ffeb3b', 14); poly([[-12, -6], [-4, -6], [-8, -14]]); ctx.fill(); poly([[4, -6], [12, -6], [8, -14]]); ctx.fill(); poly([[-12, 6], [12, 6], [6, 12], [0, 8], [-6, 12]]); ctx.fill(); break;
    case 'yWhale': { const up = Math.min(1, t / 10); ctx.translate(0, 120 * (1 - up)); ctx.fillStyle = '#1565c0'; ctx.strokeStyle = '#0d47a1'; ctx.lineWidth = 4; ell(0, 0, 90, 70); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e3f2fd'; ell(10, 30, 60, 34); ctx.fill(); ctx.fillStyle = '#000'; ell(40, -20, 6, 6); ctx.fill(); ctx.fillStyle = '#90caf9'; for (let i = 0; i < 5; i++) ell(-10 + i * 6, -80 - i * 6, 6, 10), ctx.fill(); break; }
    case 'yBox': { ctx.fillStyle = '#4a148c'; ctx.strokeStyle = '#ffd740'; ctx.lineWidth = 4; rr(-60, -90, 120, 180, 8); ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke(); txt('★', -30, -50, 22, '#ffd740', null); txt('?', 26, 30, 30, '#ffd740', null); ctx.save(); ctx.translate(Math.sin(gT * 0.6) * 60, 0); ctx.fillStyle = '#b0bec5'; rr(-4, -110, 8, 220, 3); ctx.fill(); ctx.restore(); break; }
    case 'yQueen': { ctx.scale(o.vx > 0 ? 1 : -1, 1); ctx.fillStyle = '#ffd740'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ell(0, 0, 40, 26); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#212121'; for (const x of [-16, 0, 16]) ctx.fillRect(x - 3, -24, 6, 48); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ell(-6, -34 - Math.abs(Math.sin(gT * 0.8)) * 10, 22, 14); ctx.fill(); ctx.fillStyle = '#ffd740'; poly([[30, -26], [36, -40], [42, -26]]); ctx.fill(); break; }
    case 'ySwarm': for (let i = 0; i < 12; i++) { const a = gT * 0.15 + i * 0.52, r = 50 + (i % 3) * 14; ctx.fillStyle = '#ffd740'; ell(Math.cos(a) * r, Math.sin(a) * r * 0.8, 6, 5); ctx.fill(); ctx.fillStyle = '#212121'; ctx.fillRect(Math.cos(a) * r - 1, Math.sin(a) * r * 0.8 - 5, 2, 10); } break;
    default: ctx.restore(); return false;
  }
  ctx.restore(); return true;
}
// ---- 의상 (업데이트 21~30 돼지 · 같은 테마 업데이트 스킨) ----
const THEME2 = { hapkido: 1, dragon: 1, mecha: 1, witch: 1, pumpkin: 1, fisher: 1, archer: 1, magician: 1, dobok: 1, thunder: 1, bee: 1 };
function skinDeco2(L, C, d, k) {
  if (!THEME2[k]) return false;
  const { bw = 1, by = 0, hx = 0, hy = 0, ex = 0, ey = 0, t = 0 } = d, A = (C.skinFx && C.skinFx.aura) || '#ffffff';
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 2 * LWM; ctx.strokeStyle = '#000';
  const pad = (fill, edge, spike) => { const x = 18 * bw, y = -72 + by; ctx.fillStyle = fill; ctx.strokeStyle = edge; ctx.beginPath(); ctx.ellipse(x, y, 17, 12, -0.2, Math.PI * 0.95, Math.PI * 2.05); ctx.closePath(); ctx.fill(); ctx.stroke(); if (spike) { ctx.fillStyle = spike; for (const dx of [-6, 6]) { poly([[x + dx - 4, y - 8], [x + dx, y - 20], [x + dx + 4, y - 8]]); ctx.fill(); ctx.stroke(); } } };
  const cape = (fill, edge, torn) => { const w = Math.sin(t * 0.15) * 6; ctx.fillStyle = fill; ctx.strokeStyle = edge; ctx.lineWidth = 3 * LWM; ctx.beginPath(); ctx.moveTo(10 * bw, -92 + by); ctx.quadraticCurveTo(-40 * bw, -100 + by, -64 * bw - w, -30 + by); if (torn) for (let i = 0; i < 4; i++) ctx.lineTo(-58 * bw - w + i * 11 * bw, -22 + by + (i % 2 ? -12 : 0)); else ctx.lineTo(-20 * bw, -24 + by); ctx.quadraticCurveTo(-10 * bw, -70 + by, 10 * bw, -92 + by); ctx.fill(); ctx.stroke(); };
  if (L === 'head') {
    if (k === 'dragon') { ctx.fillStyle = '#4527a0'; for (const dx of [-14, 2]) { ctx.beginPath(); ctx.moveTo(hx + dx - 5, hy - 22); ctx.quadraticCurveTo(hx + dx - 20, hy - 42, hx + dx - 34, hy - 46); ctx.quadraticCurveTo(hx + dx - 14, hy - 34, hx + dx + 5, hy - 24); ctx.fill(); ctx.stroke(); } ctx.fillStyle = A; for (let i = 0; i < 3; i++) { poly([[hx - 24 - i * 8, hy - 12 + i * 6], [hx - 34 - i * 8, hy - 18 + i * 6], [hx - 28 - i * 8, hy - 4 + i * 6]]); ctx.fill(); } }
    else if (k === 'mecha') { ctx.save(); ell(hx, hy, 31, 30); ctx.clip(); const g = ctx.createLinearGradient(hx - 30, hy - 30, hx + 30, hy); g.addColorStop(0, '#eceff1'); g.addColorStop(1, '#607d8b'); ctx.fillStyle = g; ctx.fillRect(hx - 32, hy - 32, 64, 20); ctx.restore(); ctx.fillStyle = '#263238'; rr(hx - 4, ey - 8, 38, 13, 6); ctx.fill(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = A; rr(hx - 1, ey - 5, 32, 7, 3); ctx.fill(); ctx.restore(); ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 3 * LWM; line(hx - 12, hy - 26, hx - 18, hy - 52); ctx.fillStyle = ((t >> 4) & 1) ? '#ff1744' : A; ell(hx - 18, hy - 54, 4, 4); ctx.fill(); }
    else if (k === 'witch') { ctx.fillStyle = '#311b92'; ell(hx - 2, hy - 24, 40, 8, -0.05); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(hx - 22, hy - 26); ctx.quadraticCurveTo(hx - 14, hy - 60, hx - 30, hy - 88 + Math.sin(t * 0.1) * 3); ctx.quadraticCurveTo(hx + 2, hy - 64, hx + 18, hy - 26); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = A; ctx.fillRect(hx - 20, hy - 36, 36, 6); ctx.fillStyle = '#ffd740'; ctx.fillRect(hx - 6, hy - 37, 8, 8); }
    else if (k === 'pumpkin') { ctx.fillStyle = '#ff9100'; ctx.strokeStyle = '#e65100'; ell(hx - 2, hy - 30, 28, 16); ctx.fill(); ctx.stroke(); for (const dx of [-10, 6]) line(hx + dx, hy - 44, hx + dx, hy - 16); ctx.strokeStyle = '#33691e'; ctx.lineWidth = 4 * LWM; line(hx - 2, hy - 44, hx + 4, hy - 56); ctx.fillStyle = '#558b2f'; ell(hx + 10, hy - 52, 7, 4, 0.5); ctx.fill(); }
    else if (k === 'fisher') { ctx.fillStyle = '#fdd835'; ctx.strokeStyle = '#f57f17'; ctx.beginPath(); ctx.ellipse(hx - 2, hy - 26, 26, 16, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(hx - 30, hy - 26); ctx.quadraticCurveTo(hx - 46, hy - 18, hx - 50, hy - 6); ctx.lineTo(hx - 24, hy - 22); ctx.closePath(); ctx.fill(); ctx.stroke(); ell(hx + 8, hy - 26, 22, 5); ctx.fill(); ctx.stroke(); }
    else if (k === 'archer') { ctx.fillStyle = '#2e7d32'; ctx.strokeStyle = '#1b5e20'; poly([[hx - 26, hy - 22], [hx + 22, hy - 24], [hx - 34, hy - 50]]); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#e53935'; ctx.lineWidth = 4 * LWM; ctx.beginPath(); ctx.moveTo(hx - 16, hy - 32); ctx.quadraticCurveTo(hx - 34, hy - 48, hx - 48, hy - 62); ctx.stroke(); }
    else if (k === 'magician') { ctx.fillStyle = '#212121'; ell(hx - 2, hy - 26, 30, 6); ctx.fill(); rr(hx - 18, hy - 72, 32, 46, 3); ctx.fill(); ctx.fillStyle = '#d50000'; ctx.fillRect(hx - 18, hy - 38, 32, 7); ctx.fillStyle = '#fff'; ctx.fillRect(hx - 18, hy - 72, 32, 3); }
    else if (k === 'dobok') { ctx.save(); ell(hx, hy, 30, 29); ctx.clip(); ctx.fillStyle = '#d50000'; ctx.fillRect(hx - 32, hy - 24, 64, 8); ctx.restore(); ctx.strokeStyle = '#d50000'; ctx.lineWidth = 4 * LWM; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(hx - 28, hy - 20); ctx.quadraticCurveTo(hx - 44, hy - 22 + Math.sin(t * 0.3 + i) * 5, hx - 56, hy - 12 + i * 8); ctx.stroke(); } }
    else if (k === 'thunder') { ctx.save(); ell(hx, hy, 31, 30); ctx.clip(); ctx.fillStyle = '#cfd8dc'; ctx.fillRect(hx - 32, hy - 32, 64, 18); ctx.restore(); ctx.fillStyle = '#fafafa'; for (const dx of [-26]) { poly([[hx + dx, hy - 20], [hx + dx - 26, hy - 44], [hx + dx - 18, hy - 30], [hx + dx - 30, hy - 32], [hx + dx - 6, hy - 14]]); ctx.fill(); ctx.stroke(); } ctx.fillStyle = '#ffee58'; poly([[hx - 2, hy - 46], [hx + 6, hy - 34], [hx, hy - 34], [hx + 6, hy - 22], [hx - 8, hy - 36], [hx - 2, hy - 36]]); ctx.fill(); }
    else if (k === 'bee') { ctx.strokeStyle = '#212121'; ctx.lineWidth = 2.5 * LWM; for (const dx of [-10, 8]) { ctx.beginPath(); ctx.moveTo(hx + dx, hy - 26); ctx.quadraticCurveTo(hx + dx - 6, hy - 46, hx + dx + 4, hy - 56); ctx.stroke(); ctx.fillStyle = '#ffd740'; ell(hx + dx + 4, hy - 58, 5, 5); ctx.fill(); ctx.stroke(); } }
  } else if (L === 'body') {
    ctx.save(); ell(0, -60 + by, 46 * bw, 34); ctx.clip();
    if (k === 'dragon') { ctx.strokeStyle = A; ctx.lineWidth = 2; ctx.globalAlpha *= 0.7; for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc((-40 + i * 14 + (r % 2) * 7) * bw, -86 + r * 12 + by, 6, 0, Math.PI); ctx.stroke(); } }
    else if (k === 'mecha') { const g = ctx.createLinearGradient(-40 * bw, -96 + by, 40 * bw, -30 + by); g.addColorStop(0, '#eceff1'); g.addColorStop(1, '#546e7a'); ctx.fillStyle = g; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 76); ctx.fillStyle = '#37474f'; for (const [x, y] of [[-34, -84], [-34, -40], [24, -84], [24, -40]]) ell(x * bw, y + by, 3, 3), ctx.fill(); ctx.fillStyle = '#263238'; ell(-4 * bw, -64 + by, 11, 11); ctx.fill(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = A; ell(-4 * bw, -64 + by, 6 + Math.sin(t * 0.2) * 1.5, 6); ctx.fill(); ctx.restore(); }
    else if (k === 'witch') { ctx.fillStyle = '#311b4f'; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 76); ctx.fillStyle = '#6d4c41'; ctx.fillRect(-50 * bw, -52 + by, 100 * bw, 7); for (const [x, c] of [[-24, '#76ff03'], [-8, '#ff4081'], [8, '#40c4ff']]) { ctx.fillStyle = c; ell(x * bw, -42 + by, 5, 6); ctx.fill(); } }
    else if (k === 'pumpkin') { ctx.fillStyle = '#212121'; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 76); ctx.fillStyle = '#ff9100'; for (let i = 0; i < 3; i++) ell(16 * bw, -82 + i * 14 + by, 3.5, 3.5), ctx.fill(); }
    else if (k === 'fisher') { ctx.fillStyle = '#fdd835'; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 76); ctx.strokeStyle = '#f57f17'; ctx.lineWidth = 2; line(12 * bw, -96 + by, 12 * bw, -20 + by); ctx.fillStyle = '#5d4037'; for (let i = 0; i < 3; i++) ell(18 * bw, -82 + i * 14 + by, 3, 3), ctx.fill(); }
    else if (k === 'archer') { ctx.fillStyle = '#2e7d32'; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 76); ctx.fillStyle = '#6d4c41'; ctx.fillRect(-50 * bw, -50 + by, 100 * bw, 7); ctx.fillStyle = '#ffd740'; ctx.fillRect(4 * bw, -51 + by, 8, 9); ctx.strokeStyle = '#4e342e'; ctx.lineWidth = 4; line(-30 * bw, -96 + by, 24 * bw, -50 + by); }
    else if (k === 'magician') { ctx.fillStyle = '#212121'; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 76); ctx.fillStyle = '#fafafa'; poly([[4 * bw, -96 + by], [40 * bw, -96 + by], [40 * bw, -40 + by], [20 * bw, -56 + by]]); ctx.fill(); ctx.fillStyle = '#d50000'; poly([[16 * bw, -92 + by], [26 * bw, -86 + by], [16 * bw, -80 + by]]); ctx.fill(); poly([[36 * bw, -92 + by], [26 * bw, -86 + by], [36 * bw, -80 + by]]); ctx.fill(); }
    else if (k === 'dobok') { ctx.fillStyle = '#fafafa'; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 76); ctx.strokeStyle = '#bdbdbd'; ctx.lineWidth = 3; line(30 * bw, -96 + by, 10 * bw, -58 + by); line(-6 * bw, -96 + by, 10 * bw, -58 + by); ctx.fillStyle = '#212121'; ctx.fillRect(-50 * bw, -52 + by, 100 * bw, 8); ctx.fillRect(8 * bw, -52 + by, 6, 20); }
    else if (k === 'thunder') { const g = ctx.createLinearGradient(-40 * bw, -96 + by, 40 * bw, -30 + by); g.addColorStop(0, '#eceff1'); g.addColorStop(1, '#78909c'); ctx.fillStyle = g; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 50); ctx.fillStyle = '#ffee58'; poly([[0, -88 + by], [12 * bw, -70 + by], [4 * bw, -70 + by], [14 * bw, -52 + by], [-6 * bw, -72 + by], [2 * bw, -72 + by]]); ctx.fill(); }
    else if (k === 'hapkido') { ctx.fillStyle = '#283593'; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 76); ctx.strokeStyle = '#d50000'; ctx.lineWidth = 4; line(30 * bw, -96 + by, 10 * bw, -58 + by); line(-6 * bw, -96 + by, 10 * bw, -58 + by); ctx.fillStyle = '#212121'; ctx.fillRect(-50 * bw, -52 + by, 100 * bw, 8); ctx.fillStyle = '#d50000'; ctx.fillRect(-50 * bw, -49 + by, 100 * bw, 2); ctx.fillStyle = '#212121'; ctx.fillRect(8 * bw, -52 + by, 6, 20); }
    else if (k === 'bee') { ctx.fillStyle = '#ffd740'; ctx.fillRect(-50 * bw, -96 + by, 100 * bw, 76); ctx.fillStyle = '#212121'; for (const x of [-30, -12, 6]) ctx.fillRect(x * bw, -96 + by, 9 * bw, 76); }
    ctx.restore();
  } else if (L === 'back') {
    if (k === 'dragon') { const fl = Math.sin(t * 0.2) * 0.2; ctx.save(); ctx.translate(-14 * bw, -88 + by); ctx.rotate(-0.4 + fl); ctx.fillStyle = '#4527a0'; ctx.strokeStyle = '#1a0f3d'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-30, -56); ctx.lineTo(-44, -30); ctx.lineTo(-60, -40); ctx.lineTo(-56, -8); ctx.lineTo(-70, -6); ctx.lineTo(-30, 4); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); ctx.fillStyle = '#311b92'; for (let i = 0; i < 4; i++) { const x = -36 * bw + i * 14 * bw; poly([[x - 6, -88 + by], [x, -104 + by], [x + 6, -88 + by]]); ctx.fill(); } }
    else if (k === 'mecha') { ctx.fillStyle = '#455a64'; rr(-62 * bw, -100 + by, 18, 40, 5); ctx.fill(); ctx.stroke(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = A; poly([[-60 * bw, -60 + by], [-53 * bw, -44 + by + Math.sin(t * 0.8) * 4], [-46 * bw, -60 + by]]); ctx.fill(); ctx.restore(); }
    else if (k === 'witch') cape('#4a148c', '#1a0033', true);
    else if (k === 'pumpkin') cape('#212121', '#000', true);
    else if (k === 'magician') { cape('#212121', '#000', false); ctx.save(); ctx.globalAlpha *= 0.9; cape('#b71c1c', '#7f0000', false); ctx.restore(); }
    else if (k === 'thunder') cape('#c62828', '#7f0000', false);
    else if (k === 'fisher') { ctx.fillStyle = '#a1887f'; ctx.strokeStyle = '#5d4037'; rr(-62 * bw, -96 + by, 26, 30, 5); ctx.fill(); ctx.stroke(); for (let i = 0; i < 3; i++) line(-62 * bw, -88 + by + i * 8, -36 * bw, -88 + by + i * 8); ctx.fillStyle = '#4fc3f7'; poly([[-52 * bw, -96 + by], [-58 * bw, -110 + by], [-46 * bw, -110 + by]]); ctx.fill(); }
    else if (k === 'archer') { ctx.save(); ctx.translate(-40 * bw, -92 + by); ctx.rotate(-0.5); ctx.fillStyle = '#6d4c41'; ctx.strokeStyle = '#3e2723'; rr(-8, -10, 16, 46, 4); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e53935'; for (let i = 0; i < 3; i++) poly([[-6 + i * 6, -10], [-8 + i * 6, -24], [-2 + i * 6, -10]]), ctx.fill(); ctx.restore(); }
    else if (k === 'bee') { ctx.save(); ctx.globalAlpha *= 0.65; ctx.fillStyle = '#e3f2fd'; ctx.strokeStyle = '#90caf9'; const fl = Math.abs(Math.sin(t * 0.9)) * 10; ell(-20 * bw, -110 + by - fl, 22, 14, -0.5); ctx.fill(); ctx.stroke(); ell(-34 * bw, -100 + by - fl * 0.6, 16, 10, -0.3); ctx.fill(); ctx.stroke(); ctx.restore(); }
  } else if (L === 'front') {
    if (k === 'mecha') pad('#90a4ae', '#263238', null);
    else if (k === 'thunder') pad('#cfd8dc', '#455a64', null);
    else if (k === 'dragon') pad('#4527a0', '#1a0f3d', '#7e57c2');
  } else if (L === 'aura') {
    if (k === 'thunder' && (t >> 2) % 6 === 0) { ctx.strokeStyle = '#ffee58'; ctx.lineWidth = 2; const a = (t * 1.7) % 6.28; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 60, -70 + Math.sin(a) * 70); for (let j = 1; j < 4; j++) ctx.lineTo(Math.cos(a) * (60 + j * 8) + (j % 2 ? 6 : -6), -70 + Math.sin(a) * (70 + j * 8)); ctx.stroke(); }
    else if (k === 'witch') for (let i = 0; i < 4; i++) { const u = ((t * 0.6 + i * 25) % 100) / 100; ctx.fillStyle = `rgba(118,255,3,${0.5 * (1 - u)})`; ell(-40 + i * 26, -20 - u * 150, 4 + u * 4, 4 + u * 4); ctx.fill(); }
    else if (k === 'dragon') for (let i = 0; i < 6; i++) { const u = ((t * 0.6 + i * 17) % 100) / 100; ctx.fillStyle = `rgba(179,136,255,${1 - u})`; ell(((i * 53) % 120) - 60, -10 - u * 150, 2.5, 2.5); ctx.fill(); }
  }
  ctx.restore(); return true;
}
