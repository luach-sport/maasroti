/* A deposit into the tithe fund (money set aside), with "everything that's left" as a quick choice. */
(function () {
  'use strict';
  const MA = window.MA;
  const { icon, money } = MA;
  const F = MA.F;
  const ui = MA.ui;

  MA.SHEETS.deposit = {
    title: (d) => (d.id ? 'עריכת הפקדה' : 'הפקדה לקופה'),
    init: (d) => {
      const x = d.id ? MA.state.fund.find((y) => y.id === d.id) : null;
      ui.form = x ? { id: x.id, amount: String(x.amount), date: MA.dateInput(x.ts), note: x.note } : { id: '', amount: d.amount ? String(d.amount) : '', date: MA.dateInput(Date.now()), note: '' };
      ui.form.confirm = false;
    },
    render: () => {
      const f = ui.form, owed = MA.summary().owed;
      let h = F.money('damt', 'amount', 'כמה מפרישים לקופה?', f.amount, { big: true, autofocus: !f.id });
      if (!f.id && owed > 0.5) h += '<button type="button" class="chip sm" style="align-self:flex-start" data-action="deposit-fill" data-v="' + MA.round2(owed) + '">כל מה שנשאר: ' + money(owed) + '</button>';
      h += '<p class="fine">הפקדה לקופה מורידה מהחוב כאילו כבר נתת. אחר כך מחלקים מהקופה ("נתינה מהקופה").</p>';
      h += F.date('ddate', 'date', 'תאריך', f.date) + F.note('dnote', f.note);
      h += '<button type="button" class="btn" data-action="save-deposit">' + icon('check') + (f.id ? 'שמירה' : 'הפקדה') + '</button>';
      if (f.id) h += F.del('delete-deposit', f.confirm);
      return h;
    }
  };
})();
