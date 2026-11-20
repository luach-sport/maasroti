/* Adding or editing an income: amount, deductible expenses, maaser / chomesh / other, date, source, and
   "this comes every month" (makes it a fixed income with a reminder). */
(function () {
  'use strict';
  const MA = window.MA;
  const { esc, icon, money } = MA;
  const F = MA.F;
  const ui = MA.ui;

  MA.incomeCalc = () => {
    const f = ui.form;
    const a = MA.num(f.amount), e = MA.num(f.expenses), r = MA.num(f.rate);
    const net = Math.max(0, (a > 0 ? a : 0) - (e > 0 ? e : 0));
    return { amount: a, expenses: e > 0 ? e : 0, rate: r, net, due: r > 0 ? MA.round2(net * r / 100) : 0 };
  };
  MA.incomeLive = () => {
    const x = MA.incomeCalc();
    return x.amount > 0 ? 'להפריש <b>' + money(x.due) + '</b>' + (x.expenses ? ' (' + MA.pct(x.rate) + ' מ-' + money(x.net) + ')' : '') : 'מקלידים סכום, והחישוב מופיע כאן';
  };

  MA.SHEETS.income = {
    full: true,
    title: (d) => (d.id ? 'עריכת הכנסה' : 'הכנסה חדשה'),
    init: (d) => {
      const i = d.id ? MA.state.incomes.find((x) => x.id === d.id) : null;
      const ts = i ? i.ts : d.month && d.month !== MA.monthKey(Date.now()) ? MA.dayInMonth(d.month, 1) : Date.now();
      ui.form = i ? { id: i.id, amount: String(i.amount), expenses: i.expenses ? String(i.expenses) : '', rate: String(i.rate), date: MA.dateInput(i.ts), source: i.source, note: i.note, showExp: !!i.expenses, recId: i.recId }
        : { id: '', amount: d.amount ? String(d.amount) : '', expenses: '', rate: String(MA.state.settings.rate), date: MA.dateInput(ts), source: d.source || 'משכורת', note: '', showExp: false, monthly: false };
      ui.form.confirm = false;
    },
    render: () => {
      const f = ui.form;
      const srcs = MA.SOURCES.slice();
      if (f.source && !srcs.includes(f.source)) srcs.unshift(f.source);
      let h = F.money('inamt', 'amount', 'כמה נכנס? (נטו, מה שנכנס בפועל)', f.amount, { big: true, autofocus: !f.id });
      h += f.showExp ? F.money('inexp', 'expenses', 'הוצאות לניכוי', f.expenses, { hint: 'הוצאות שמותר לנכות לפני החישוב (למשל נסיעות או הוצאות עבודה). יורדות מהסכום לפני שמחשבים.' })
        : '<button type="button" class="text-btn start" data-action="form-show-exp">' + icon('minus', 'sm') + 'ניכוי הוצאות מהסכום</button>';
      h += F.rate(f);
      h += '<div class="live" id="inc-live">' + MA.incomeLive() + '</div>';
      h += '<div class="field"><span class="label">מקור</span>' + F.chips('form-source', srcs.map((s) => ({ v: s, l: s })), f.source) + '</div>';
      if (f.source === 'אחר' || !MA.SOURCES.includes(f.source)) h += F.text('insrc', 'source', 'שם המקור', f.source === 'אחר' ? '' : f.source, 'למשל: שיעורים פרטיים', 40);
      h += F.date('indate', 'date', 'תאריך', f.date);
      h += F.note('innote', f.note);
      if (!f.id && !f.pendingRec) h += '<div class="card list">' + F.switchRow('monthly', 'נכנסת כל חודש', 'תישמר כהכנסה קבועה, עם תזכורת ביום ' + (new Date(MA.fromInput(f.date) || Date.now()).getDate()) + ' בכל חודש', f.monthly) + '</div>';
      else if (f.recId && MA.recById(f.recId)) h += '<p class="fine">' + icon('repeat', 'xs') + ' נוספה מההכנסה הקבועה "' + esc(MA.recById(f.recId).name) + '".</p>';
      h += '<button type="button" class="btn" data-action="save-income">' + icon('check') + (f.id ? 'שמירה' : 'הוספת ההכנסה') + '</button>';
      if (f.id) h += F.del('delete-income', f.confirm);
      return h;
    }
  };
})();
