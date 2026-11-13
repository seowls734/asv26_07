// 문법 검사: node tools/check.js → js/ 파일마다 · 이어 붙인 전체 · admin.html
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
let bad = 0, all = '';
for (const f of fs.readdirSync(path.join(root, 'js')).sort()) { const c = fs.readFileSync(path.join(root, 'js', f), 'utf8'); all += c + '\n'; try { new Function(c); } catch (e) { bad++; console.log('ERR', f, e.message); } }
try { new Function(all); } catch (e) { bad++; console.log('ERR (전체)', e.message); }
const ad = fs.readFileSync(path.join(root, 'admin.html'), 'utf8'); for (const x of ad.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) { try { new Function(x[1]); } catch (e) { bad++; console.log('ERR admin.html', e.message); } }
console.log(bad ? `문법 오류 ${bad}개` : '문법 OK'); process.exit(bad ? 1 : 0);
