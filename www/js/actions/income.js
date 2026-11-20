/* Incomes: add, edit, delete, and the fixed incomes waiting on the home screen. */
(function () {
  'use strict';
  const MA = window.MA;
  const A = MA.A;
  const ui = MA.ui;

  A['new-income'] = (el) => MA.openSheet('income', { month: el && el.dataset && el.dataset.month });
  A['edit-income'] = (el) => MA.openSheet('income', { id: el.dataset.id });
  A['form-show-exp'] = () => { ui.form.showExp = true; MA.renderSheet(); setTimeout(() => { const i = MA.$('#inexp'); if (i) i.focus(); }, 50); };
  A['form-source'] = (el) => { ui.form.source = el.dataset.v; MA.renderSheet(); if (el.dataset.v === 'אחר') setTimeout(() => { const i = MA.$('#insrc'); if (i) i.focus(); }, 50); };

  A['save-income'] = () => {
    const f = ui.form, x = MA.incomeCalc();
    if (!(x.amount > 0)) { MA.toast('כמה נכנס?'); return; }
    if (!(x.rate > 0 && x.rate <= 100)) { MA.toast('בדוק את האחוז להפרשה'); return; }
    if (x.expenses > x.amount) { MA.toast('ההוצאות גדולות מההכנסה'); return; }
    const ts = MA.fromInput(f.date);
    if (!isFinite(ts)) { MA.toast('בחר תאריך'); return; }
    const source = MA.clip(f.source === 'אחר' ? '' : f.source, 40) || 'הכנסה';
    const old = f.id ? MA.state.incomes.find((i) => i.id === f.id) : null;
    const entry = { id: f.id || MA.uid(), ts, amount: MA.round2(x.amount), expenses: MA.round2(x.expenses), rate: x.rate, source, note: MA.clip(f.note, 300), recId: old ? old.recId : '' };
    if (f.pendingRec) { const r = MA.recById(f.pendingRec.id); if (r) { r.done[f.pendingRec.key] = 'in'; entry.recId = r.id; } }
    if (old) Object.assign(old, entry); else MA.state.incomes.push(entry);
    if (!f.id && f.monthly && !f.pendingRec) {
      const day = new Date(ts).getDate();
      const r = MA.newRecurring({ name: source, amount: entry.amount, expenses: entry.expenses, rate: entry.rate, day, handledNow: MA.monthKey(ts) === MA.monthKey(Date.now()) });
      MA.state.recurring.push(r);
      entry.recId = r.id;
    }
    MA.save(); MA.haptic(); MA.closeSheet();
    MA.toast((f.id ? 'נשמר' : 'נוספה הכנסה') + ' · להפריש ' + MA.money(MA.incomeDue(entry)));
    MA.render(true);
  };
  A['delete-income'] = () => {
    if (!ui.form.confirm) { ui.form.confirm = true; MA.renderSheet(); return; }
    MA.state.incomes = MA.state.incomes.filter((i) => i.id !== ui.form.id);
    MA.save(); MA.closeSheet(); MA.toast('ההכנסה נמחקה'); MA.render(true);
  };

  // A fixed income waiting on the home screen.
  A['rec-yes'] = (el) => {
    const inc = MA.confirmIncome(el.dataset.id, el.dataset.k);
    if (!inc) return;
    MA.save(); MA.haptic(); MA.closeSheet();
    MA.toast('נרשם · להפריש ' + MA.money(MA.incomeDue(inc)));
    MA.render(true);
  };
  A['rec-more'] = (el) => MA.openSheet('recMore', { id: el.dataset.id, key: el.dataset.k });
  A['rec-skip'] = (el) => { MA.skipIncome(el.dataset.id, el.dataset.k); MA.save(); MA.closeSheet(); MA.toast('בסדר, לא נרשם החודש'); MA.render(true); };
  A['rec-other'] = (el) => {
    const r = MA.recById(el.dataset.id), key = el.dataset.k;
    if (!r) return;
    MA.openSheet('income', {});
    Object.assign(ui.form, { amount: '', expenses: r.expenses ? String(r.expenses) : '', showExp: !!r.expenses, rate: String(r.rate), source: r.name, date: MA.dateInput(MA.dayInMonth(key, r.day)), pendingRec: { id: r.id, key } });
    MA.renderSheet();
  };
})();
