/* Small settings sheets: when the weekly reminder comes, and the opening balance. */
(function () {
  'use strict';
  const MA = window.MA;
  const { esc, icon } = MA;
  const F = MA.F;
  const ui = MA.ui;

  MA.SHEETS.weekly = {
    title: () => 'מתי להזכיר?',
    init: () => { const s = MA.state.settings; ui.form = { weekday: s.weekday, time: String(s.hour).padStart(2, '0') + ':' + String(s.minute).padStart(2, '0') }; },
    render: () => {
      const f = ui.form;
      return '<div class="field"><span class="label">יום</span><div class="chips">' + [0, 1, 2, 3, 4, 5, 6].map((d) => '<button type="button" class="chip sm" data-action="weekly-day" data-v="' + d + '" aria-pressed="' + (f.weekday === d) + '">' + (d === 6 ? 'מוצ״ש' : MA.DAYS[d]) + '</button>').join('') + '</div></div>' +
        '<div class="field"><label for="wtime">שעה</label><input id="wtime" class="input" type="time" data-f="time" value="' + esc(f.time) + '"></div>' +
        (f.weekday === 6 ? '<p class="fine">במוצאי שבת כדאי לבחור שעה אחרי צאת השבת.</p>' : '') +
        '<button type="button" class="btn" data-action="save-weekly">' + icon('check') + 'שמירה</button>';
    }
  };

  MA.SHEETS.opening = {
    title: () => 'יתרת פתיחה',
    init: () => { const o = MA.state.settings.opening; ui.form = { kind: o < 0 ? 'credit' : 'owed', amount: o ? String(Math.abs(o)) : '' }; },
    render: () => {
      const f = ui.form;
      return '<p class="fine" style="font-size:14px">אם עוד לפני שהתחלת להשתמש באפליקציה נשאר לך חוב מעשרות, או שנתת מראש, רושמים את זה כאן והחישוב מתחיל ממנו.</p>' +
        '<div class="seg" role="group" aria-label="סוג היתרה"><button type="button" data-action="opening-kind" data-v="owed" aria-pressed="' + (f.kind === 'owed') + '">חוב (צריך עוד לתת)</button>' +
        '<button type="button" data-action="opening-kind" data-v="credit" aria-pressed="' + (f.kind === 'credit') + '">זכות (נתתי מראש)</button></div>' +
        F.money('oamt', 'amount', 'סכום', f.amount, { autofocus: true }) +
        '<button type="button" class="btn" data-action="save-opening">' + icon('check') + 'שמירה</button>';
    }
  };
})();
