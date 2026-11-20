/* The tithe fund: deposits (add, edit, delete) and "deposit everything that's left". */
(function () {
  'use strict';
  const MA = window.MA;
  const A = MA.A;
  const ui = MA.ui;

  A['new-deposit'] = () => MA.openSheet('deposit', {});
  A['deposit-all'] = () => MA.openSheet('deposit', { amount: MA.round2(MA.summary().owed) });
  A['edit-deposit'] = (el) => MA.openSheet('deposit', { id: el.dataset.id });
  A['deposit-fill'] = (el) => { ui.form.amount = el.dataset.v; const i = MA.$('#damt'); if (i) i.value = el.dataset.v; };
  A['save-deposit'] = () => {
    const f = ui.form, amount = MA.num(f.amount), ts = MA.fromInput(f.date);
    if (!(amount > 0)) { MA.toast('כמה מפרישים?'); return; }
    if (!isFinite(ts)) { MA.toast('בחר תאריך'); return; }
    const entry = { id: f.id || MA.uid(), ts, amount: MA.round2(amount), note: MA.clip(f.note, 200) };
    const old = f.id ? MA.state.fund.find((d) => d.id === f.id) : null;
    if (old) Object.assign(old, entry); else MA.state.fund.push(entry);
    MA.save(); MA.haptic(); MA.closeSheet();
    MA.toast('הופרש לקופה · בקופה ' + MA.money(MA.fundBalance()));
    MA.render(true);
  };
  A['delete-deposit'] = () => {
    if (!ui.form.confirm) { ui.form.confirm = true; MA.renderSheet(); return; }
    MA.state.fund = MA.state.fund.filter((d) => d.id !== ui.form.id);
    MA.save(); MA.closeSheet(); MA.toast('ההפקדה נמחקה'); MA.render(true);
  };
})();
