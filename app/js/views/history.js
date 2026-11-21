/* History: by year and month – incomes, what to set aside, what was given, and whether the month is done.
   Export to Excel and the section 46 report. */
(function () {
  'use strict';
  const MA = window.MA;
  const { esc, icon, money0 } = MA;
  const V = MA.views;
  const ui = MA.ui;

  function bars(months) {
    const list = months.slice().reverse().slice(-12);
    if (list.length < 2) return '';
    const max = Math.max(1, Math.max.apply(null, list.map((m) => Math.max(m.due, m.given))));
    const h = (v) => (v > 0 ? Math.max(4, (v / max) * 96) : 2).toFixed(0);
    return '<div class="card pad"><div class="sec-head"><h2>להפריש מול נתתי</h2><span class="legend"><i class="due"></i>להפריש <i class="giv"></i>נתתי</span></div>' +
      '<div class="bars" role="img" aria-label="' + esc(list.map((m) => MA.monthLabel(m.key) + ': להפריש ' + Math.round(m.due) + ', נתתי ' + Math.round(m.given)).join('; ')) + '">' +
      list.map((m) => '<div class="b"><span class="pair"><i class="due" style="height:' + h(m.due) + 'px"></i><i class="giv" style="height:' + h(m.given) + 'px"></i></span><span>' + esc(MA.MONTHS[+m.key.slice(5) - 1].slice(0, 3)) + '</span></div>').join('') +
      '</div></div>';
  }

  V.history = () => {
    const keys = MA.activeMonths();
    const years = Array.from(new Set(keys.map((k) => +k.slice(0, 4))));
    if (!years.includes(ui.year)) ui.year = years[0] || new Date().getFullYear();
    let h = '<header class="top"><h1 class="h1">היסטוריה</h1>' + (keys.length ? '<button type="button" class="chip sm" data-action="export-csv">' + icon('table', 'sm') + 'ייצוא לאקסל</button>' : '') + '</header>';
    if (!keys.length) {
      return h + '<div class="empty"><span class="tile big">' + icon('calendar', 'lg') + '</span><b>עוד אין היסטוריה</b><span>כל הכנסה, נתינה והפקדה לקופה יופיעו כאן לפי חודשים, עם כמה היה להפריש וכמה ניתן.</span></div>';
    }
    if (years.length > 1) h += '<div class="chips scroll">' + years.map((y) => '<button type="button" class="chip" data-action="hist-year" data-v="' + y + '" aria-pressed="' + (y === ui.year) + '">' + y + '</button>').join('') + '</div>';
    const months = keys.filter((k) => +k.slice(0, 4) === ui.year).map(MA.monthSummary);
    const inc = MA.sum(months, (m) => m.income), due = MA.sum(months, (m) => m.due), giv = MA.sum(months, (m) => m.given);
    h += '<div class="summary"><div><b>' + money0(inc) + '</b><span>הכנסות ' + ui.year + '</span></div><div><b>' + money0(due) + '</b><span>להפריש</span></div><div><b>' + money0(giv) + '</b><span>נתתי והפרשתי</span></div></div>';
    h += bars(months);
    h += '<div class="card list">' + months.map((m) => '<button type="button" class="row" data-action="open-month" data-id="' + m.key + '">' +
      '<span class="grow"><span class="t b">' + esc(MA.monthLabel(m.key)) + '</span>' + (MA.hebOn() && MA.hebMonths(m.key) ? '<span class="s heb-line">' + esc(MA.hebMonths(m.key)) + '</span>' : '') +
      '<span class="s">הכנסות ' + money0(m.income) + ' · להפריש ' + money0(m.due) + ' · נתתי ' + money0(m.given) + '</span></span>' +
      V.statusTag(m.balanceEnd) + '<span class="chev">' + icon('chevL', 'sm') + '</span></button>').join('') + '</div>';
    h += '<button type="button" class="btn secondary" data-action="open-sheet" data-sheet="sec46">' + icon('receipt') + 'דוח שנתי לסעיף 46 (זיכוי מס)</button>';
    return h;
  };

  V.month = (key) => {
    const m = MA.monthSummary(key);
    let h = '<div class="bar-top"><button type="button" class="icon-btn" aria-label="חזרה" data-action="back">' + icon('back') + '</button>' +
      '<div class="grow"><h1>' + esc(MA.monthLabel(key)) + '</h1>' + (MA.hebOn() && MA.hebMonths(key) ? '<span class="kicker">' + esc(MA.hebMonths(key)) + '</span>' : '') + '</div>' + V.statusTag(m.balanceEnd) + '</div>';
    h += '<div class="grid2"><div class="mini"><span class="l">הכנסות</span><span class="b">' + money0(m.income) + '</span>' + (m.expenses ? '<span class="s">ניכוי הוצאות ' + money0(m.expenses) + '</span>' : '') + '</div>' +
      '<div class="mini"><span class="l">להפריש</span><span class="b">' + money0(m.due) + '</span></div>' +
      '<div class="mini"><span class="l">נתתי והפרשתי</span><span class="b">' + money0(m.given) + '</span>' + (m.fromFund ? '<span class="s">ועוד ' + money0(m.fromFund) + ' מהקופה</span>' : '') + '</div>' +
      '<div class="mini"><span class="l">' + (m.balanceEnd < -0.5 ? 'זכות בסוף החודש' : 'נשאר בסוף החודש') + '</span><span class="b">' + money0(Math.abs(m.balanceEnd)) + '</span></div></div>';
    h += V.secHead('הכנסות', '<button type="button" class="text-btn" data-action="new-income" data-month="' + key + '">+ הוספה</button>');
    h += m.incomes.length ? '<div class="card list">' + m.incomes.slice().sort((a, b) => b.ts - a.ts).map(V.incomeRow).join('') + '</div>' : '<p class="fine">אין הכנסות בחודש הזה.</p>';
    h += V.secHead('נתינות', '<button type="button" class="text-btn" data-action="new-gift" data-month="' + key + '">+ הוספה</button>');
    h += m.gifts.length ? '<div class="card list">' + m.gifts.slice().sort((a, b) => b.ts - a.ts).map(V.giftRow).join('') + '</div>' : '<p class="fine">אין נתינות בחודש הזה.</p>';
    if (m.deposits.length) h += V.secHead('הפקדות לקופה') + '<div class="card list">' + m.deposits.map(V.depositRow).join('') + '</div>';
    return h;
  };
})();
