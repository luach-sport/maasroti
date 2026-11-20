/* Places I give to: add, edit, delete. */
(function () {
  'use strict';
  const MA = window.MA;
  const A = MA.A;
  const ui = MA.ui;

  A['edit-target'] = (el) => MA.openSheet('target', { id: el.dataset.id || '' });
  A['save-target'] = () => {
    const f = ui.form, name = MA.clip(f.name, 50);
    if (!name) { MA.toast('מה השם?'); return; }
    const p = MA.num(f.pct);
    if (f.pct !== '' && !(p >= 0 && p <= 100)) { MA.toast('האחוז צריך להיות בין 0 ל-100'); return; }
    const entry = { id: f.id || MA.uid(), name, pct: p > 0 ? Math.round(p) : 0, sec46: !!f.sec46 };
    const old = MA.targetById(f.id);
    if (old) Object.assign(old, entry); else MA.state.targets.push(entry);
    MA.save(); MA.closeSheet(); MA.toast('נשמר'); MA.render(true);
  };
  A['delete-target'] = () => {
    if (!ui.form.confirm) { ui.form.confirm = true; MA.renderSheet(); return; }
    const t = MA.targetById(ui.form.id);
    if (!t) return;
    MA.state.gifts.forEach((g) => { if (g.targetId === t.id) { g.targetId = ''; g.to = t.name; if (t.sec46) g.sec46 = true; } });
    MA.state.targets = MA.state.targets.filter((x) => x.id !== t.id);
    MA.save(); MA.closeSheet(); MA.toast('המקום נמחק'); MA.render(true);
  };
})();
