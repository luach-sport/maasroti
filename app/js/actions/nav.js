/* Moving around: tabs, back, months, sheets, home banners, and the form controls every sheet uses. */
(function () {
  'use strict';
  const MA = window.MA;
  const A = MA.A;
  const ui = MA.ui;

  A.tab = (el) => { MA.closeSheet(); ui.stack = []; ui.tab = el.dataset.tab; MA.render(); };
  A.back = () => MA.onBack();
  A['open-sheet'] = (el) => MA.openSheet(el.dataset.sheet);
  A['close-sheet'] = () => MA.closeSheet();
  A['open-month'] = (el) => MA.pushView({ name: 'month', id: el.dataset.id });
  A['hist-year'] = (el) => { ui.year = +el.dataset.v; MA.render(true); };
  A['snooze-backup'] = () => { MA.state.settings.backupSnooze = Date.now() + 3 * 864e5; MA.save(); MA.render(true); };
  A['open-site'] = () => { try { window.open(MA.SITE_URL, '_blank', 'noopener'); } catch (e) { /* ignore */ } };

  // Form controls shared by the sheets.
  A['form-toggle'] = (el) => {
    const k = el.dataset.k;
    if (k === 'sec46' && MA.sheetIs('gift')) { const t = MA.targetById(ui.form.targetId); if (t && t.sec46) { MA.toast('המקום הזה מסומן לסעיף 46 ברשימת המקומות'); return; } }
    ui.form[k] = !ui.form[k];
    el.setAttribute('aria-checked', ui.form[k] ? 'true' : 'false');
    if (k === 'monthly' || k === 'fromFund') MA.renderSheet();
  };
  A['form-rate'] = (el) => {
    const v = el.dataset.v;
    if (v === 'custom') { ui.form.rateCustom = true; if (ui.form.rate === '10' || ui.form.rate === '20') ui.form.rate = ''; }
    else { ui.form.rateCustom = false; ui.form.rate = v; }
    MA.renderSheet();
  };

  // Android back button / the back arrow.
  MA.onBack = () => {
    if (ui.sheet) { if (!(MA.SHEETS[ui.sheet.name].noClose && MA.SHEETS[ui.sheet.name].noClose())) MA.closeSheet(); return; }
    if (ui.stack.length) { MA.popView(); return; }
    if (ui.tab !== 'home') { ui.tab = 'home'; MA.render(); return; }
    MA.call('App', 'exitApp');
  };
})();
