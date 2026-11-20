/* Fixed incomes: the list, adding / editing one, and the "more" choices on a waiting one (other amount, not this month). */
(function () {
  'use strict';
  const MA = window.MA;
  const { esc, icon, money, money0 } = MA;
  const F = MA.F;
  const ui = MA.ui;

  MA.SHEETS.recList = {
    full: true,
    title: () => 'הכנסות קבועות',
    render: () => {
      const R = MA.state.recurring;
      let h = '<p class="fine" style="font-size:14px">משכורת, קצבה או כל הכנסה שנכנסת כל חודש. ביום שלה תקבל תזכורת, ובמסך הבית יופיע "נכנסה?" – לחיצה אחת והמעשר מחושב.</p>';
      if (R.length) {
        h += '<div class="card list">' + R.map((r) => '<button type="button" class="row" data-action="edit-rec" data-id="' + r.id + '"><span class="tile in">' + icon('repeat') + '</span>' +
          '<span class="grow"><span class="t">' + esc(r.name) + (r.active ? '' : ' <span class="tag">מושהית</span>') + '</span><span class="s">כל חודש ב-' + r.day + ' · ' + esc(MA.rateName(r.rate)) + (r.expenses ? ' · ניכוי ' + money0(r.expenses) : '') + '</span></span>' +
          '<span class="v">' + money0(r.amount) + '</span><span class="chev">' + icon('chevL', 'sm') + '</span></button>').join('') + '</div>';
      }
      h += '<button type="button" class="dashed-btn" data-action="edit-rec" data-id="">' + icon('plus') + 'הכנסה קבועה חדשה</button>';
      return h;
    }
  };

  MA.SHEETS.recEdit = {
    full: true,
    title: (d) => (d.id ? 'עריכת הכנסה קבועה' : 'הכנסה קבועה חדשה'),
    init: (d) => {
      const r = d.id ? MA.recById(d.id) : null;
      ui.form = r ? { id: r.id, name: r.name, amount: String(r.amount), expenses: r.expenses ? String(r.expenses) : '', rate: String(r.rate), day: String(r.day), active: r.active }
        : { id: '', name: 'משכורת', amount: '', expenses: '', rate: String(MA.state.settings.rate), day: String(new Date().getDate()), active: true };
      ui.form.confirm = false;
    },
    render: () => {
      const f = ui.form;
      let h = F.text('rname', 'name', 'שם', f.name, 'למשל: משכורת', 40);
      h += F.money('ramt', 'amount', 'הסכום הרגיל (נטו)', f.amount, { hint: 'אם בחודש מסוים נכנס סכום אחר, מעדכנים כשמאשרים.' });
      h += F.money('rexp', 'expenses', 'הוצאות לניכוי כל חודש (לא חובה)', f.expenses);
      h += F.rate(f);
      h += '<div class="field"><label for="rday">באיזה יום בחודש נכנסת?</label><select id="rday" class="input" data-f="day">' +
        Array.from({ length: 31 }, (_, i) => '<option value="' + (i + 1) + '"' + (+f.day === i + 1 ? ' selected' : '') + '>' + (i + 1) + (i === 30 ? ' (או היום האחרון בחודש)' : '') + '</option>').join('') + '</select></div>';
      if (f.id) h += '<div class="card list">' + F.switchRow('active', 'פעילה', 'כבויה = בלי תזכורות ובלי "נכנסה?"', f.active) + '</div>';
      h += '<button type="button" class="btn" data-action="save-rec">' + icon('check') + 'שמירה</button>';
      if (f.id) h += F.del('delete-rec', f.confirm, 'מחיקת ההכנסה הקבועה');
      if (f.id) h += '<p class="fine">מחיקה לא מוחקת הכנסות שכבר נרשמו.</p>';
      return h;
    }
  };

  MA.SHEETS.recMore = {
    title: (d) => { const r = MA.recById(d.id); return r ? r.name + ' · ' + MA.monthLabel(d.key) : ''; },
    render: (d) => {
      const r = MA.recById(d.id);
      if (!r) return '';
      return '<button type="button" class="btn" data-action="rec-yes" data-id="' + r.id + '" data-k="' + d.key + '">' + icon('check') + 'נכנסה, ' + money(r.amount) + '</button>' +
        '<button type="button" class="btn secondary" data-action="rec-other" data-id="' + r.id + '" data-k="' + d.key + '">' + icon('edit') + 'נכנס סכום אחר</button>' +
        '<button type="button" class="btn secondary" data-action="rec-skip" data-id="' + r.id + '" data-k="' + d.key + '">' + icon('close') + 'לא נכנסה החודש</button>' +
        '<button type="button" class="btn ghost" data-action="edit-rec" data-id="' + r.id + '">עריכת ההכנסה הקבועה</button>';
    }
  };
})();
