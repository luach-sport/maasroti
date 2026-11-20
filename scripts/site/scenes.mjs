// The screenshots on מעשרותי's site, taken by the Itzko site kit (kit/lib/shots.mjs in luach-sport/itzko).
// prepare() fills the app with example data; every scene's `set` then runs inside the app page (sent as is)
// with { info }. `fill` types into a field afterwards, `scroll` is a selector to bring into view (or 'bottom').
import { seedApp } from './seed.mjs';

export async function prepare(page, { info }) {
  await page.evaluate(seedApp);
  await page.reload();
  await page.waitForTimeout(1200);
  return { info };
}
export const reset = () => { const MA = window.MA; MA.ui.sheet = null; MA.renderSheet(); window.scrollTo(0, 0); };

const at = (tab) => `const MA = window.MA, ui = MA.ui; ui.stack = []; ui.tab = '${tab}';`;
const scene = (name, body, extra) => Object.assign({ name, set: new Function('arg', body) }, extra || {});
// The second fixed income (rent on the 10th) waits for a tap only after the 10th; the "expected" shot always shows it.
const waiting = `const r = MA.recById('r2'); r.startKey = MA.addMonths(MA.monthKey(Date.now()), -1); r.day = 1;`;

export const SCENES = [
  scene('home', at('home') + 'MA.render();'),
  scene('expected', at('home') + waiting + 'MA.render();'),
  scene('income', at('home') + `MA.render(); MA.openSheet('income', {});
    Object.assign(ui.form, { amount: '2500', expenses: '400', showExp: true, source: 'עבודה נוספת' }); MA.renderSheet();`, { wait: 800 }),
  scene('gift', at('home') + `MA.render(); MA.openSheet('gift', { targetId: 't1', amount: 336 });
    Object.assign(ui.form, { receiptNo: '48230', sec46: true }); MA.renderSheet();`, { wait: 800 }),
  scene('history', at('history') + 'MA.render();'),
  scene('month', at('history') + "ui.stack = [{ name: 'month', id: MA.addMonths(MA.monthKey(Date.now()), -1) }]; MA.render();"),
  scene('fund', at('fund') + 'MA.render();'),
  scene('targets', at('targets') + 'MA.render();'),
  scene('fixed', at('settings') + "MA.render(); MA.openSheet('recList');", { wait: 800 }),
  scene('settings', at('settings') + 'MA.render();'),
  scene('settings-end', at('settings') + 'MA.render();', { scroll: 'bottom' }),
  scene('sec46', at('history') + "MA.render(); MA.openSheet('sec46');", { wait: 800 }),
  scene('feedback', at('settings') + "MA.render(); MA.state.profile = { name: 'דני כהן', email: 'dani@example.com' }; MA.openSheet('feedback');",
    { fill: ['#fbm', 'הייתי רוצה לראות גרף של הנתינות לאורך השנים'], wait: 600 }),
  scene('share-app', at('settings') + "MA.render(); MA.openSheet('shareApp');", { wait: 800 }),
  scene('update', at('settings') + `MA.render();
    const b = parseInt(arg.info.build, 10) || 2;
    MA.VERSION.build = String(b > 1 ? b - 1 : b);
    MA.update.info = { version: arg.info.version, build: b, notes: arg.info.notes.slice(0, 5), inApp: true };
    MA.openSheet('update');`, { wait: 800 })
];
