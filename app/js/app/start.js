/* Start-up: load the data, draw the first screen, and listen to the phone (back button, coming back to the app,
   internet, a tapped reminder). Background work: waiting feedback, new versions, reminders. */
(function () {
  'use strict';
  const MA = window.MA;
  const ui = MA.ui;

  // Looks for a new version when the app opens; shows it once per version.
  async function autoUpdateCheck() {
    const info = await MA.update.check(false);
    if (info && info.build > (MA.state.updateSeen || 0) && !ui.sheet && !MA.view() && MA.state.onboarded) MA.openSheet('update');
  }
  function background() { MA.flushOutbox(); autoUpdateCheck(); }

  function listenToPhone() {
    if (!MA.isNative()) return;
    MA.listen('App', 'backButton', MA.onBack);
    MA.listen('App', 'appStateChange', (st) => {
      if (st && st.isActive) { if (!ui.sheet) MA.render(true); background(); MA.scheduleReminders(); } else MA.flushSave();
    });
    MA.listen('App', 'pause', () => MA.flushSave());
    // A tapped reminder opens the home screen (where the waiting fixed incomes are).
    MA.listen('LocalNotifications', 'localNotificationActionPerformed', () => { MA.closeSheet(); ui.stack = []; ui.tab = 'home'; MA.render(); });
  }

  async function init() {
    MA.bindEvents();
    await MA.initNetwork();
    MA.state = MA.normalize(await MA.loadState());
    MA.applyTheme();
    MA.watchSystemTheme();
    MA.render();
    listenToPhone();
    if (!MA.state.onboarded) MA.openSheet(MA.firstSheet ? MA.firstSheet() : 'welcome');
    MA.onUpdate(() => {
      if (MA.sheetIs('update')) MA.renderSheet();
      else if (!ui.sheet && ui.tab === 'settings' && !MA.view()) MA.render(true);
    });
    MA.onNetwork((on) => { if (MA.sheetIs('feedback')) MA.renderSheet(); if (on) background(); });
    // A new day (the app left open overnight): waiting incomes and dates change.
    let day = MA.dayStart(Date.now());
    setInterval(() => { const d = MA.dayStart(Date.now()); if (d !== day) { day = d; if (!ui.sheet) MA.render(true); } }, 60000);
    background();
    MA.scheduleReminders();
  }

  // Small test surface for automated checks.
  window.__maasroti = {
    get ui() { return ui; }, A: MA.A,
    normalize: MA.normalize, render: MA.render, openSheet: MA.openSheet, closeSheet: MA.closeSheet, importBackup: MA.importBackup, flushOutbox: MA.flushOutbox
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
