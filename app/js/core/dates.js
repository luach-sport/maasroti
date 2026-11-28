/* Dates in Hebrew: "היום", "אתמול", "4 בספטמבר", months ("נובמבר 2026") and date inputs. */
(function () {
  'use strict';
  const MA = window.MA;

  const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
  const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  MA.MONTHS = MONTHS; MA.DAYS = DAYS;
  const p2 = (n) => String(n).padStart(2, '0');
  MA.dayStart = (d) => { d = new Date(d); d.setHours(0, 0, 0, 0); return d.getTime(); };
  MA.dateFull = (ts) => { const d = new Date(ts); return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear(); };
  MA.dateInput = (ts) => { const d = new Date(ts); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); };
  // "2026-11-19" → noon of that day (noon keeps the date right in every time zone).
  MA.fromInput = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '')); return m ? new Date(+m[1], +m[2] - 1, +m[3], 12).getTime() : NaN; };
  MA.time = (ts) => { const d = new Date(ts); return p2(d.getHours()) + ':' + p2(d.getMinutes()); };
  MA.dayName = (i) => (i === 6 ? 'שבת' : 'יום ' + DAYS[i]);
  MA.dateLong = (ts) => { const d = new Date(ts); return MA.dayName(d.getDay()) + ', ' + d.getDate() + ' ב' + MONTHS[d.getMonth()]; };
  MA.dayLabel = (ts) => {
    const t = MA.dayStart(ts), today = MA.dayStart(Date.now());
    if (t === today) return 'היום';
    if (t === today - 864e5) return 'אתמול';
    const d = new Date(ts);
    return d.getDate() + ' ב' + MONTHS[d.getMonth()] + (d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : '');
  };

  // Months as keys "2026-11".
  MA.monthKey = (ts) => { const d = new Date(ts); return d.getFullYear() + '-' + p2(d.getMonth() + 1); };
  MA.monthLabel = (key) => { const [y, m] = key.split('-').map(Number); return MONTHS[m - 1] + ' ' + y; };
  MA.monthStart = (key) => { const [y, m] = key.split('-').map(Number); return new Date(y, m - 1, 1).getTime(); };
  MA.addMonths = (key, n) => { const [y, m] = key.split('-').map(Number); return MA.monthKey(new Date(y, m - 1 + n, 1)); };
  MA.daysInMonth = (key) => { const [y, m] = key.split('-').map(Number); return new Date(y, m, 0).getDate(); };
  // The date in a month for "every month on day N" (31 → the last day of a short month).
  MA.dayInMonth = (key, day) => { const [y, m] = key.split('-').map(Number); return new Date(y, m - 1, Math.min(day, MA.daysInMonth(key)), 12).getTime(); };
})();
