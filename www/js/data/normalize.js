/* Checks data loaded from the phone or from a backup, and fills in anything missing. */
(function () {
  'use strict';
  const MA = window.MA;
  const { isObj, str } = MA;
  const pos = (v) => { const n = MA.num(v); return n > 0 ? MA.round2(n) : 0; };
  const rate = (v, d) => { const n = MA.num(v); return n > 0 && n <= 100 ? n : d; };
  const ts = (v) => (isFinite(+v) && +v > 0 ? +v : Date.now());
  const id = (v) => (v ? String(v).slice(0, 40) : MA.uid());

  function income(x, defRate) {
    if (!isObj(x) || !(pos(x.amount) > 0)) return null;
    return { id: id(x.id), ts: ts(x.ts), amount: pos(x.amount), expenses: pos(x.expenses), rate: rate(x.rate, defRate), source: str(x.source, 40), note: str(x.note, 300), recId: x.recId ? String(x.recId) : '' };
  }
  function gift(x) {
    if (!isObj(x) || !(pos(x.amount) > 0)) return null;
    return {
      id: id(x.id), ts: ts(x.ts), amount: pos(x.amount), targetId: x.targetId ? String(x.targetId) : '', to: str(x.to, 60),
      status: x.status === 'pledged' ? 'pledged' : 'paid', fromFund: !!x.fromFund, sec46: !!x.sec46,
      receiptNo: str(x.receiptNo, 40), receipt: typeof x.receipt === 'string' ? x.receipt.slice(0, 80) : '', note: str(x.note, 300)
    };
  }
  function deposit(x) {
    if (!isObj(x) || !(pos(x.amount) > 0)) return null;
    return { id: id(x.id), ts: ts(x.ts), amount: pos(x.amount), note: str(x.note, 200) };
  }
  function recurring(x, defRate) {
    if (!isObj(x) || !(pos(x.amount) > 0)) return null;
    const done = {};
    if (isObj(x.done)) Object.keys(x.done).forEach((k) => { if (/^\d{4}-\d{2}$/.test(k) && (x.done[k] === 'in' || x.done[k] === 'skip')) done[k] = x.done[k]; });
    return {
      id: id(x.id), name: str(x.name, 40) || 'הכנסה קבועה', amount: pos(x.amount), expenses: pos(x.expenses), rate: rate(x.rate, defRate),
      day: MA.clamp(Math.round(+x.day) || 1, 1, 31), active: x.active !== false, startKey: /^\d{4}-\d{2}$/.test(x.startKey) ? x.startKey : MA.monthKey(Date.now()), done
    };
  }
  function target(x) {
    if (!isObj(x) || !String(x.name || '').trim()) return null;
    const p = MA.num(x.pct);
    return { id: id(x.id), name: str(x.name, 50).trim(), pct: p > 0 ? Math.min(100, Math.round(p)) : 0, sec46: !!x.sec46 };
  }
  const list = (arr, fn, a) => (Array.isArray(arr) ? arr.map((x) => fn(x, a)).filter(Boolean) : []);

  MA.normalize = (raw) => {
    const d = MA.defaults();
    if (!isObj(raw)) return d;
    d.createdAt = +raw.createdAt || d.createdAt;
    d.onboarded = !!raw.onboarded;
    const s = isObj(raw.settings) ? raw.settings : {}, ds = d.settings;
    if (['light', 'dark', 'system'].includes(s.theme)) ds.theme = s.theme;
    ds.rate = rate(s.rate, 10);
    ['credit', 'hebrew', 'weeklyOn', 'salaryRemind', 'backupRemind'].forEach((k) => { if (typeof s[k] === 'boolean') ds[k] = s[k]; });
    const o = MA.num(s.opening); ds.opening = isFinite(o) ? MA.round2(o) : 0;
    if (s.weekday >= 0 && s.weekday <= 6) ds.weekday = Math.round(s.weekday);
    if (s.hour >= 0 && s.hour <= 23) ds.hour = Math.round(s.hour);
    if (s.minute >= 0 && s.minute <= 59) ds.minute = Math.round(s.minute);
    ds.lastBackup = +s.lastBackup || 0; ds.backupSnooze = +s.backupSnooze || 0;
    d.incomes = list(raw.incomes, income, ds.rate);
    d.gifts = list(raw.gifts, gift);
    d.fund = list(raw.fund, deposit);
    d.recurring = list(raw.recurring, recurring, ds.rate);
    d.targets = list(raw.targets, target);
    const tIds = new Set(d.targets.map((t) => t.id));
    d.gifts.forEach((g) => { if (g.targetId && !tIds.has(g.targetId)) g.targetId = ''; });
    if (Array.isArray(raw.outbox)) d.outbox = raw.outbox.filter(isObj).slice(-30);
    if (isObj(raw.profile)) d.profile = { name: str(raw.profile.name, 60), email: str(raw.profile.email, 100) };
    d.updateSeen = +raw.updateSeen || 0;
    return d;
  };
})();
