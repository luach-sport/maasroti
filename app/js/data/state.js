/* The app's data (MA.state) and what is on screen (MA.ui), with small lookups used everywhere. */
(function () {
  'use strict';
  const MA = window.MA;

  const changed = [];
  MA.onChange = (cb) => changed.push(cb);
  // Every change goes through here: saved, and the reminders are brought up to date.
  MA.save = (now) => { changed.forEach((cb) => { try { cb(); } catch (e) { console.warn(e); } }); return MA.saveState(MA.state, now); };

  MA.targetById = (id) => (id ? MA.state.targets.find((t) => t.id === id) || null : null);
  MA.giftName = (g) => { const t = MA.targetById(g.targetId); return t ? t.name : g.to || 'נתינה'; };
  MA.recById = (id) => MA.state.recurring.find((r) => r.id === id) || null;

  // A weekly backup reminder, once there is something worth keeping.
  MA.backupDue = () => {
    const S = MA.state, s = S.settings;
    if (!s.backupRemind || S.incomes.length + S.gifts.length < 6) return false;
    const now = Date.now(), week = 7 * 864e5;
    if (s.backupSnooze > now) return false;
    return now - Math.max(s.lastBackup || 0, S.createdAt || 0) > week;
  };

  MA.ui = { tab: 'home', stack: [], scroll: {}, sheet: null, form: {}, year: new Date().getFullYear() };
  // The page shown on top of the tabs (a month), if any.
  MA.view = () => MA.ui.stack[MA.ui.stack.length - 1] || null;
})();
