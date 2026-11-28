/* Settings actions: rate, switches, reminders, opening balance, theme, backup / restore / Excel / section 46,
   sharing the app, updates, and the first-start sheet. */
(function () {
  'use strict';
  const MA = window.MA;
  const A = MA.A;
  const ui = MA.ui;
  const st = () => MA.state.settings;

  A['set-rate'] = (el) => {
    const v = el.dataset.v;
    st().rate = v === 'custom' ? (st().rate === 10 || st().rate === 20 ? 15 : st().rate) : +v;
    MA.save(); MA.render(true);
  };
  A['set-theme'] = (el) => { st().theme = el.dataset.v; MA.save(); MA.applyTheme(); MA.render(true); };
  A['toggle-setting'] = (el) => {
    const k = el.dataset.k;
    st()[k] = !st()[k];
    MA.save(); MA.render(true);
    if (k === 'credit') MA.toast(st().credit ? 'נתינה מראש תקוזז מההכנסות הבאות' : 'נתינה מעבר לחוב לא תיחשב מראש');
  };
  A['weekly-day'] = (el) => { ui.form.weekday = +el.dataset.v; MA.renderSheet(); };
  A['save-weekly'] = () => {
    const m = /^(\d{1,2}):(\d{2})/.exec(ui.form.time || '');
    if (!m) { MA.toast('בחר שעה'); return; }
    Object.assign(st(), { weekday: ui.form.weekday, hour: +m[1], minute: +m[2], weeklyOn: true });
    MA.save(); MA.closeSheet(); MA.toast('התזכורת נקבעה ל' + MA.dayName(st().weekday) + ' ב-' + ui.form.time); MA.render(true);
  };
  A['opening-kind'] = (el) => { ui.form.kind = el.dataset.v; MA.renderSheet(); };
  A['save-opening'] = () => {
    const n = MA.num(ui.form.amount);
    st().opening = n > 0 ? MA.round2(ui.form.kind === 'credit' ? -n : n) : 0;
    MA.save(); MA.closeSheet(); MA.toast('יתרת הפתיחה נשמרה'); MA.render(true);
  };

  A['export-backup'] = () => MA.exportBackup();
  A['import-backup'] = () => { const i = MA.$('#import-file'); i.value = ''; i.click(); };
  A['confirm-import'] = () => MA.importBackup(ui.sheet.data.doc);
  A['export-csv'] = () => MA.exportCsv();
  A['sec46-year'] = (el) => { ui.form.year = +el.dataset.v; MA.renderSheet(); };
  A['export-sec46'] = () => MA.exportSec46(ui.form.year);

  A['share-app'] = () => MA.openSheet('shareApp');
  A['share-app-link'] = () => { MA.closeSheet(); MA.shareApp.link(); };
  A['share-app-apk'] = () => { MA.closeSheet(); MA.shareApp.apk(); };
  A['share-app-copy'] = async () => { MA.closeSheet(); if (await MA.writeClipboard(MA.SITE_URL)) MA.toast('הקישור לאתר הועתק'); };
  A['check-update'] = async () => {
    const i = await MA.update.check(true);
    if (i) MA.openSheet('update'); else MA.toast(MA.update.error || 'יש לך את הגרסה האחרונה');
    MA.render(true);
  };
  A['update-now'] = () => MA.update.apply();
  A['update-later'] = () => { if (MA.update.info) MA.state.updateSeen = MA.update.info.build; MA.save(); MA.closeSheet(); };

  A['finish-welcome'] = () => {
    const f = ui.form, r = MA.num(f.rate), o = MA.num(f.opening);
    if (!(r > 0 && r <= 100)) { MA.toast('בדוק את האחוז להפרשה'); return; }
    Object.assign(st(), { rate: r, opening: o > 0 ? MA.round2(o) : 0, weeklyOn: !!f.weeklyOn });
    MA.state.onboarded = true;
    MA.save(true); ui.sheet = null; MA.renderSheet(); MA.render();
    MA.toast('הכל מוכן. מוסיפים את ההכנסה הראשונה?');
  };
})();
