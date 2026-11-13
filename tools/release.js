// 배포 준비: node tools/release.js
// · js/ 안의 BUILD 번호를 올림 (같은 날이면 -N+1, 날짜가 바뀌면 오늘-1) · version.txt 같게
// · index.html의 <script src="js/…?v=BUILD"> 버전 바꿈 (브라우저가 예전 파일을 쓰지 않게)
// · samgyeopsal-fighter.html = index.html 복사
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), js = path.join(root, 'js');
const file = fs.readdirSync(js).map(f => path.join(js, f)).find(f => /const BUILD = '/.test(fs.readFileSync(f, 'utf8')));
let s = fs.readFileSync(file, 'utf8');
const old = s.match(/const BUILD = '([^']+)'/)[1], d = new Date(Date.now() + 9 * 3600e3), today = d.toISOString().slice(0, 10).replace(/-/g, '');
const [od, on] = old.split('-'), nb = od === today ? `${today}-${+on + 1}` : `${today}-1`;
s = s.replace(`const BUILD = '${old}'`, `const BUILD = '${nb}'`); fs.writeFileSync(file, s);
fs.writeFileSync(path.join(root, 'version.txt'), nb);
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(/(src="js\/[^"?]+\.js)(\?v=[^"]*)?"/g, `$1?v=${nb}"`);
fs.writeFileSync(path.join(root, 'index.html'), html); fs.writeFileSync(path.join(root, 'samgyeopsal-fighter.html'), html);
console.log(old, '->', nb);
