/* Export to tables that open in Excel / Google Sheets: incomes, gifts, a summary by month, and the section 46 report. */
(function () {
  'use strict';
  const MA = window.MA;
  const cell = (v) => { const s = String(v == null ? '' : v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const csv = (rows) => '﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n');
  const n2 = (v) => (+v || 0).toFixed(2);
  const heb = (ts) => MA.hebDate(ts) || '';
  const stamp = () => MA.dateInput(Date.now());

  function incomesFile() {
    const rows = [['תאריך', 'תאריך עברי', 'מקור', 'סכום שנכנס ₪', 'הוצאות שנוכו ₪', 'סכום לחישוב ₪', 'אחוז', 'להפריש ₪', 'הערה']];
    MA.state.incomes.slice().sort((a, b) => a.ts - b.ts).forEach((i) => rows.push([MA.dateFull(i.ts), heb(i.ts), i.source, n2(i.amount), n2(i.expenses), n2(MA.incomeNet(i)), i.rate + '%', n2(MA.incomeDue(i)), i.note]));
    return { name: 'מעשרותי-הכנסות-' + stamp() + '.csv', content: csv(rows), mime: 'text/csv' };
  }
  function giftsFile() {
    const rows = [['תאריך', 'תאריך עברי', 'למי', 'סכום ₪', 'מצב', 'מהקופה', 'סעיף 46', 'מספר קבלה', 'הערה']];
    MA.state.gifts.slice().sort((a, b) => a.ts - b.ts).forEach((g) => rows.push([MA.dateFull(g.ts), heb(g.ts), MA.giftName(g), n2(g.amount), g.status === 'paid' ? 'נתתי' : 'התחייבתי', g.fromFund ? 'כן' : '', (g.sec46 || (MA.targetById(g.targetId) || {}).sec46) ? 'כן' : '', g.receiptNo, g.note]));
    MA.state.fund.slice().sort((a, b) => a.ts - b.ts).forEach((d) => rows.push([MA.dateFull(d.ts), heb(d.ts), 'הפקדה לקופת המעשרות', n2(d.amount), 'הופרש', '', '', '', d.note]));
    return { name: 'מעשרותי-נתינות-' + stamp() + '.csv', content: csv(rows), mime: 'text/csv' };
  }
  function monthsFile() {
    const rows = [['חודש', 'חודש עברי', 'הכנסות ₪', 'הוצאות שנוכו ₪', 'להפריש ₪', 'נתתי והפרשתי ₪', 'נתתי מהקופה ₪', 'יתרה בסוף החודש ₪']];
    MA.activeMonths().slice().reverse().forEach((k) => {
      const m = MA.monthSummary(k);
      rows.push([MA.monthLabel(k), MA.hebMonths(k), n2(m.income), n2(m.expenses), n2(m.due), n2(m.given), n2(m.fromFund), n2(m.balanceEnd)]);
    });
    return { name: 'מעשרותי-לפי-חודשים-' + stamp() + '.csv', content: csv(rows), mime: 'text/csv' };
  }

  MA.exportCsv = async () => {
    const S = MA.state;
    if (!S.incomes.length && !S.gifts.length && !S.fund.length) { MA.toast('עוד אין נתונים לייצוא'); return; }
    await MA.shareFiles([incomesFile(), giftsFile(), monthsFile()], 'ייצוא מעשרותי לאקסל');
  };

  MA.exportSec46 = async (year) => {
    const list = MA.sec46(year);
    const rows = [['תאריך', 'מוסד', 'מספר קבלה', 'סכום ₪']];
    list.forEach((g) => rows.push([MA.dateFull(g.ts), MA.giftName(g), g.receiptNo, n2(g.amount)]));
    rows.push(['', 'סה״כ', '', n2(MA.sum(list, (g) => g.amount))]);
    await MA.shareFiles([{ name: 'מעשרותי-סעיף46-' + year + '.csv', content: csv(rows), mime: 'text/csv' }], 'דוח סעיף 46 לשנת ' + year);
  };
})();
