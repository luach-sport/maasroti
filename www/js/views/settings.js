/* Settings: how to calculate (maaser / chomesh), credit, opening balance, fixed incomes, reminders, Hebrew dates,
   look, backup, Excel, feedback, updates, sharing and the credit. */
(function () {
  'use strict';
  const MA = window.MA;
  const { esc, icon } = MA;
  const V = MA.views;

  const sw = (key, label, sub, on, ic) => '<div class="row">' + (ic ? '<span class="lead">' + icon(ic) + '</span>' : '') + '<span class="grow"><span class="t">' + esc(label) + '</span>' + (sub ? '<span class="s">' + esc(sub) + '</span>' : '') + '</span>' +
    '<button type="button" class="switch-hit" role="switch" aria-checked="' + !!on + '" data-action="toggle-setting" data-k="' + key + '" aria-label="' + esc(label) + '"><span class="switch"></span></button></div>';
  const navRow = (action, ic, label, sub, value, extra) => '<button type="button" class="row" data-action="' + action + '"' + (extra || '') + '>' + (ic ? '<span class="lead">' + icon(ic) + '</span>' : '') + '<span class="grow"><span class="t">' + esc(label) + '</span>' + (sub ? '<span class="s">' + esc(sub) + '</span>' : '') + '</span>' + (value ? '<span class="v">' + esc(value) + '</span>' : '') + '<span class="chev">' + icon('chevL', 'sm') + '</span></button>';
  V.navRow = navRow;

  V.settings = () => {
    const S = MA.state, st = S.settings;
    const custom = st.rate !== 10 && st.rate !== 20;
    const themes = [{ v: 'light', l: 'בהיר' }, { v: 'dark', l: 'כהה' }, { v: 'system', l: 'לפי הטלפון' }];
    const op = st.opening;
    let h = '<header class="top"><h1 class="h1">הגדרות</h1></header>';
    h += '<span class="section-label">חישוב</span><div class="card pad stack">' +
      '<div class="field"><span class="label">כמה להפריש מכל הכנסה (ברירת מחדל)</span><div class="seg" role="group" aria-label="אחוז ברירת מחדל">' +
      '<button type="button" data-action="set-rate" data-v="10" aria-pressed="' + (st.rate === 10) + '">מעשר 10%</button>' +
      '<button type="button" data-action="set-rate" data-v="20" aria-pressed="' + (st.rate === 20) + '">חומש 20%</button>' +
      '<button type="button" data-action="set-rate" data-v="custom" aria-pressed="' + custom + '">אחר' + (custom ? ' ' + MA.pct(st.rate) : '') + '</button></div>' +
      (custom ? '<div class="input-wrap"><input class="input" inputmode="decimal" data-setting="rate" value="' + esc(st.rate) + '" aria-label="אחוז"><span class="suffix">%</span></div>' : '') +
      '<span class="hint">בכל הכנסה אפשר לבחור אחרת. החישוב הוא לפי הסכום שנכנס (נטו), אחרי ניכוי הוצאות שרושמים בהכנסה.</span></div></div>';
    h += '<div class="card list">' +
      sw('credit', 'נתינה מראש נחשבת', 'אם נתת יותר מהחוב, ההפרש נשמר כזכות ומקוזז מההכנסות הבאות', st.credit, 'coin') +
      navRow('open-sheet', 'wallet', 'יתרת פתיחה', 'חוב מעשרות מלפני האפליקציה, או זכות', op > 0 ? 'חוב ' + MA.money0(op) : op < 0 ? 'זכות ' + MA.money0(-op) : 'אין', ' data-sheet="opening"') +
      navRow('open-sheet', 'repeat', 'הכנסות קבועות', 'משכורת וכל הכנסה שחוזרת כל חודש', S.recurring.length ? String(S.recurring.length) : 'אין', ' data-sheet="recList"') +
      '</div>';
    h += '<span class="section-label">תזכורות</span><div class="card list">' +
      sw('weeklyOn', 'תזכורת שבועית', 'מה נשאר לתת, ואם נכנסו הכנסות', st.weeklyOn, 'bell') +
      (st.weeklyOn ? navRow('open-sheet', '', 'מתי', '', MA.dayName(st.weekday) + ' ' + String(st.hour).padStart(2, '0') + ':' + String(st.minute).padStart(2, '0'), ' data-sheet="weekly"') : '') +
      sw('salaryRemind', 'תזכורת ביום המשכורת', 'ביום שבו הכנסה קבועה אמורה להיכנס', st.salaryRemind, 'calendar') +
      '</div>' + (MA.isNative() ? '' : '<p class="fine">באייפון ובדפדפן התזכורות מופיעות במסך הבית של האפליקציה ולא כהתראה.</p>');
    h += '<span class="section-label">תצוגה</span><div class="card list">' + sw('hebrew', 'תאריכים עבריים', 'ליד כל תאריך ובחודשים בהיסטוריה', st.hebrew, 'calendar') + '</div>' +
      '<div class="seg" role="group" aria-label="מראה">' + themes.map((t) => '<button type="button" data-action="set-theme" data-v="' + t.v + '" aria-pressed="' + (st.theme === t.v) + '">' + t.l + '</button>').join('') + '</div>';
    h += '<span class="section-label">גיבוי ודוחות</span><div class="card list">' +
      navRow('export-backup', 'upload', 'גיבוי לקובץ', 'כל הנתונים וצילומי הקבלות. לשמור בדרייב, בוואטסאפ או במחשב' + (st.lastBackup ? ' · גיבוי אחרון: ' + MA.dayLabel(st.lastBackup) : '')) +
      navRow('import-backup', 'download', 'שחזור מגיבוי', 'בטלפון חדש, או כדי להחזיר נתונים') +
      sw('backupRemind', 'תזכורת לגבות כל שבוע', 'הודעה קטנה במסך הבית אם עבר שבוע בלי גיבוי', st.backupRemind, 'clock') +
      navRow('export-csv', 'table', 'ייצוא לאקסל', 'הכנסות, נתינות וסיכום לפי חודשים') +
      navRow('open-sheet', 'receipt', 'דוח לסעיף 46', 'תרומות למוסדות מוכרים, לזיכוי ממס', '', ' data-sheet="sec46"') +
      '</div>';
    h += '<span class="section-label">כללי</span><div class="card list">' +
      navRow('open-sheet', 'message', 'פנייה / הצעת ייעול', 'מה להוסיף? מה לשפר? הפנייה מגיעה ישירות למפתח', '', ' data-sheet="feedback"') +
      V.updateRow() +
      navRow('share-app', 'share', 'שיתוף האפליקציה', 'קישור לאתר, או הקובץ עצמו בבלוטות\' ובוואטסאפ') +
      navRow('open-site', 'external', 'אתר האפליקציה', 'הסבר על כל המסכים, והתקנה באייפון') +
      '</div>';
    h += '<div class="credit">' + MA.logo(44) + '<span class="n">מעשרותי · גרסה ' + esc(MA.VERSION.version) + (MA.VERSION.build && MA.VERSION.build !== 'dev' ? ' (בנייה ' + esc(MA.VERSION.build) + ')' : '') + '</span>' +
      '<span class="slogan">עשר תעשר – בשביל שתתעשר</span><span class="by">פותח על ידי <b>Itzko</b></span><span class="by" dir="ltr">Developed by Itzko</span></div>' +
      '<p class="fine" style="text-align:center">האפליקציה עוזרת לחשבון בלבד. בשאלות הלכתיות על מעשרות כדאי להתייעץ עם רב.</p>';
    return h;
  };
  V.updateRow = () => {
    const U = MA.update;
    if (!MA.canSelfUpdate()) return '';
    if (U.info) return navRow('open-sheet', 'sparkle', 'יש גרסה חדשה: ' + U.info.version + ' (בנייה ' + U.info.build + ')', 'לחיצה לעדכון', '', ' data-sheet="update"');
    return navRow('check-update', 'refresh', U.state === 'checking' ? 'בודק…' : 'בדיקת עדכונים', 'אצלך גרסה ' + MA.VERSION.version + ' (בנייה ' + MA.VERSION.build + ')');
  };
})();
