/* Fixed incomes: add, edit, pause, delete. */
(function () {
  'use strict';
  const MA = window.MA;
  const A = MA.A;
  const ui = MA.ui;

  A['edit-rec'] = (el) => MA.openSheet('recEdit', { id: el.dataset.id || '' });
  A['save-rec'] = () => {
    const f = ui.form, amount = MA.num(f.amount), exp = MA.num(f.expenses), rate = MA.num(f.rate), day = +f.day;
    const name = MA.clip(f.name, 40);
    if (!name) { MA.toast('מה השם?'); return; }
    if (!(amount > 0)) { MA.toast('מה הסכום הרגיל?'); return; }
    if (!(rate > 0 && rate <= 100)) { MA.toast('בדוק את האחוז להפרשה'); return; }
    const vals = { name, amount: MA.round2(amount), expenses: exp > 0 ? MA.round2(exp) : 0, rate, day: MA.clamp(day || 1, 1, 31) };
    const old = MA.recById(f.id);
    if (old) Object.assign(old, vals, { active: !!f.active });
    else {
      // Added after this month's day: this month is up to the user (it shows as waiting, can be confirmed or skipped).
      MA.state.recurring.push(MA.newRecurring(vals));
    }
    MA.save(); MA.toast('נשמר'); MA.openSheet('recList'); MA.render(true);
  };
  A['delete-rec'] = () => {
    if (!ui.form.confirm) { ui.form.confirm = true; MA.renderSheet(); return; }
    MA.state.recurring = MA.state.recurring.filter((r) => r.id !== ui.form.id);
    MA.save(); MA.toast('ההכנסה הקבועה נמחקה'); MA.openSheet('recList'); MA.render(true);
  };
})();
