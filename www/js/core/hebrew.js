/* Hebrew dates: "כ״ח בחשוון תשפ״ז" from the phone's own calendar (Intl), with numbers in Hebrew letters. */
(function () {
  'use strict';
  const MA = window.MA;

  const ONES = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  const TENS = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  const HUNDREDS = ['', 'ק', 'ר', 'ש', 'ת', 'תק', 'תר', 'תש', 'תת', 'תתק'];
  // 5787 → תשפ״ז, 15 → ט״ו, 28 → כ״ח
  MA.gematria = (n) => {
    n = n % 1000;
    let s = HUNDREDS[Math.floor(n / 100)];
    const r = n % 100;
    if (r === 15) s += 'טו';
    else if (r === 16) s += 'טז';
    else s += TENS[Math.floor(r / 10)] + ONES[r % 10];
    return s.length > 1 ? s.slice(0, -1) + '״' + s.slice(-1) : s + '׳';
  };

  let fmt = null, ok = true;
  function parts(ts) {
    if (!ok) return null;
    try {
      if (!fmt) fmt = new Intl.DateTimeFormat('he-u-ca-hebrew', { day: 'numeric', month: 'long', year: 'numeric' });
      const p = {};
      fmt.formatToParts(new Date(ts)).forEach((x) => { p[x.type] = x.value; });
      const day = parseInt(String(p.day).replace(/\D/g, ''), 10), year = parseInt(String(p.year).replace(/\D/g, ''), 10);
      if (!day || !year || !p.month || /\d/.test(p.month)) { ok = false; return null; }
      return { day, month: p.month.replace(/^ב/, ''), year };
    } catch (e) { ok = false; return null; }
  }
  // Empty when the phone has no Hebrew calendar (then only the regular date is shown).
  MA.hebDate = (ts, noYear) => {
    const p = parts(ts);
    if (!p) return '';
    return MA.gematria(p.day) + ' ב' + p.month + (noYear ? '' : ' ' + MA.gematria(p.year));
  };
  // Hebrew month(s) a regular month falls in: "חשוון–כסלו תשפ״ז".
  MA.hebMonths = (key) => {
    const a = parts(MA.monthStart(key) + 864e5 / 2), b = parts(MA.dayInMonth(key, 31));
    if (!a || !b) return '';
    if (a.month === b.month) return a.month + ' ' + MA.gematria(a.year);
    return a.month + (a.year !== b.year ? ' ' + MA.gematria(a.year) : '') + '–' + b.month + ' ' + MA.gematria(b.year);
  };
  // Shown only when turned on in the settings.
  MA.hebOn = () => !!(MA.state && MA.state.settings.hebrew);
  MA.dateBoth = (ts) => MA.dayLabel(ts) + (MA.hebOn() && MA.hebDate(ts, true) ? ' · ' + MA.hebDate(ts, true) : '');
})();
