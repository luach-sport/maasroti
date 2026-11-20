// Every screen of מעשרותי in a real browser: first start, income with deductions, places with percents, a gift from
// the suggested split, a deposit, a fixed income confirmed from the home screen, history, a month, section 46,
// credit (giving more than owed), and restore from a backup. Checks the numbers and that nothing throws.
// Run: python3 -m http.server 8765 -d www   then   node tests/app.test.mjs
import { createRequire } from 'node:module';
const require = createRequire(process.env.PW_FROM || '/opt/npm-tools/node_modules/');
const { chromium } = require('playwright');

const URL = process.env.APP_URL || 'http://127.0.0.1:8765/index.html';
const errors = [];
const check = (cond, msg) => { if (!cond) errors.push('FAIL: ' + msg); else console.log('ok -', msg); };
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'he-IL' });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
const tap = async (sel) => { await page.click(sel); await page.waitForTimeout(150); };
const sum = () => page.evaluate(() => window.MA.summary());

await page.goto(URL);
await page.waitForTimeout(500);
check(await page.isVisible('[data-action="finish-welcome"]'), 'first start shows the welcome sheet');
await tap('[data-action="finish-welcome"]');

await tap('.hero [data-action="new-income"]');
await page.fill('#inamt', '9500');
await tap('[data-action="form-show-exp"]');
await page.fill('#inexp', '500');
check((await page.textContent('#inc-live')).includes('900'), 'live calculation: 10% of 9,000 is 900');
await tap('[data-action="save-income"]');
check((await sum()).owed === 900, 'owed 900 after the income');

await tap('#tabs [data-tab="targets"]');
for (const [name, pct] of [['ישיבה', '60'], ['קופת העיר', '40']]) {
  await tap('.top [data-action="edit-target"]');
  await page.fill('#tname', name); await page.fill('#tpct', pct);
  if (name === 'ישיבה') await tap('[data-action="form-toggle"][data-k="sec46"]');
  await tap('[data-action="save-target"]');
}
await tap('#tabs [data-tab="home"]');
check((await page.textContent('.split')).includes('540'), 'suggested split: 540 to the 60% place');
await tap('.split [data-action="give-to"]');
await page.fill('#grno', '777');
await tap('[data-action="save-gift"]');
check((await sum()).owed === 360, 'owed 360 after giving 540');

await tap('#tabs [data-tab="fund"]');
await tap('[data-action="deposit-all"]');
await tap('[data-action="save-deposit"]');
let s = await sum();
check(s.owed === 0 && s.fund === 360, 'deposit of everything left: owed 0, fund 360');
await tap('[data-action="new-gift"][data-fund="1"]');
await page.fill('#gamt', '100'); await page.fill('#gto', 'משפחה');
await tap('[data-action="save-gift"]');
s = await sum();
check(s.owed === 0 && s.fund === 260, 'gift from the fund comes out of the fund only');

await tap('#tabs [data-tab="settings"]');
await tap('[data-sheet="recList"]');
await tap('[data-action="edit-rec"][data-id=""]');
await page.fill('#ramt', '8000');
await page.selectOption('#rday', '1');
await tap('[data-action="save-rec"]');
await tap('.sheet-head [data-action="close-sheet"]');
await tap('#tabs [data-tab="home"]');
check(await page.isVisible('[data-action="rec-yes"]'), 'fixed income waits on the home screen');
await tap('[data-action="rec-yes"]');
check((await sum()).owed === 800, 'confirming the salary adds 800');
check(!(await page.isVisible('[data-action="rec-yes"]')), 'and it no longer waits');

await tap('.hero [data-action="new-gift"]');
await page.fill('#gamt', '1000'); await page.fill('#gto', 'צדקה');
await tap('[data-action="save-gift"]');
s = await sum();
check(s.credit === 200, 'giving more than owed leaves a credit of 200');

await tap('#tabs [data-tab="history"]');
check(await page.isVisible('[data-action="open-month"]'), 'history lists the month');
await tap('[data-action="open-month"]');
check((await page.textContent('#screen')).includes('הכנסות'), 'month page opens');
await tap('[data-action="back"]');
await tap('[data-sheet="sec46"]');
check((await page.textContent('.sheet')).includes('777'), 'section 46 report has the receipt number');
await tap('.sheet-head [data-action="close-sheet"]');

for (const t of ['home', 'history', 'fund', 'targets', 'settings']) { await tap('#tabs [data-tab="' + t + '"]'); }
await page.evaluate(() => { document.documentElement.setAttribute('data-theme', 'dark'); });
await tap('#tabs [data-tab="home"]');

const backup = await page.evaluate(() => ({ app: 'maasroti', v: 1, state: JSON.parse(JSON.stringify(window.MA.state)), receipts: {} }));
await page.evaluate(() => { window.MA.state.incomes = []; window.MA.render(); });
await page.evaluate((d) => window.__maasroti.importBackup(d), backup);
check((await sum()).credit === 200, 'restore from backup brings everything back');

await browser.close();
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('all good');
