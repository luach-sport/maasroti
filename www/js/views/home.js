/* Home: what's left to give (or the credit), quick add, fixed incomes waiting for a tap, pledges, a suggested
   split between the places you give to, and the latest actions. */
(function () {
  'use strict';
  const MA = window.MA;
  const { esc, icon, money, money0 } = MA;
  const V = MA.views;

  function hero(s) {
    const lbl = s.owed > 0.5 ? 'נשאר לתת' : s.credit > 0.5 ? 'יש לך זכות (נתת מראש)' : 'הכל מסודר';
    const amt = s.owed > 0.5 ? s.owed : s.credit;
    const sub = s.owed > 0.5 ? (s.pledged > 0 ? 'מתוך זה כבר התחייבת ל-' + money0(Math.min(s.pledged, s.owed)) : 'מעשרות שעוד לא ניתנו ולא הופרשו לקופה')
      : s.credit > 0.5 ? 'יקוזז מהמעשרות של ההכנסות הבאות' : 'אין חוב מעשרות. תזכו למצוות!';
    return '<section class="hero' + (s.owed > 0.5 ? '' : ' done') + '"><span class="lbl">' + lbl + '</span>' +
      '<span class="amount">' + (s.owed > 0.5 || s.credit > 0.5 ? money(amt) : icon('check', 'lg')) + '</span>' +
      '<span class="sub">' + esc(sub) + '</span>' +
      '<div class="hero-btns"><button type="button" class="hbtn" data-action="new-income">' + icon('plus') + 'הכנסה</button>' +
      '<button type="button" class="hbtn gold" data-action="new-gift">' + icon('hand') + 'נתינה</button></div></section>';
  }

  function expected() {
    return MA.expectedIncomes().slice(0, 4).map((e) => '<div class="banner"><span class="ic">' + icon('bell') + '</span><span class="txt"><span class="t">' + esc(e.rec.name) + ' – נכנסה?</span>' +
      '<span class="s">אמורה הייתה להיכנס ' + esc(MA.dayLabel(e.at)) + ' · ' + money0(e.rec.amount) + '</span></span>' +
      '<button type="button" class="go" data-action="rec-yes" data-id="' + e.rec.id + '" data-k="' + e.key + '">כן</button>' +
      '<button type="button" class="x" aria-label="אפשרויות נוספות" data-action="rec-more" data-id="' + e.rec.id + '" data-k="' + e.key + '">' + icon('chevD', 'sm') + '</button></div>').join('');
  }

  function pledges() {
    const pl = MA.pledges();
    if (!pl.length) return '';
    return V.secHead('התחייבויות פתוחות', '<span>' + money0(MA.sum(pl, (g) => g.amount)) + '</span>') + '<div class="card list">' +
      pl.slice(0, 4).map((g) => '<div class="row"><span class="tile gold">' + icon('clock') + '</span><span class="grow"><span class="t">' + esc(MA.giftName(g)) + '</span><span class="s">התחייבת ' + esc(MA.dayLabel(g.ts)) + '</span></span>' +
        '<span class="v">' + money(g.amount) + '</span><button type="button" class="mini-btn" data-action="pledge-paid" data-id="' + g.id + '">שילמתי</button></div>').join('') + '</div>';
  }

  function split(s) {
    const sp = MA.suggestSplit(s.owed);
    if (!sp.length) return '';
    return '<div class="card pad split"><div class="sec-head"><h2>הצעת חלוקה ל-' + money0(s.owed) + '</h2><button type="button" class="text-btn" data-action="tab" data-tab="targets">עריכה</button></div>' +
      '<div class="chips">' + sp.map((x) => '<button type="button" class="chip" data-action="give-to" data-id="' + x.target.id + '" data-v="' + x.amount + '">' + esc(x.target.name) + ' <b>' + money0(x.amount) + '</b></button>').join('') + '</div>' +
      '<p class="fine">לחיצה על מקום פותחת נתינה עם הסכום המוצע.</p></div>';
  }

  function welcomeEmpty() {
    return '<div class="empty"><span class="tile big">' + icon('coin', 'lg') + '</span><b>מתחילים לחשב מעשרות</b>' +
      '<span>מוסיפים כל הכנסה שנכנסת, ומעשרותי מחשבת כמה להפריש. כל נתינה מורידה מהחוב. משכורת קבועה אפשר להגדיר פעם אחת, והאפליקציה תזכיר כל חודש.</span>' +
      '<button type="button" class="btn small" data-action="open-sheet" data-sheet="recList">' + icon('repeat') + 'הגדרת משכורת קבועה</button></div>';
  }

  V.home = () => {
    const S = MA.state, s = MA.summary();
    const cur = MA.monthSummary(MA.monthKey(Date.now()));
    const heb = MA.hebOn() ? MA.hebDate(Date.now()) : '';
    let h = '<header class="top"><div class="brand">' + MA.logo(40) + '<div class="titles"><h1 class="h1">מעשרותי</h1><span class="kicker">' + esc(MA.dateLong(Date.now())) + (heb ? ' · ' + esc(heb) : '') + '</span></div></div></header>';
    if (MA.installNotice) h += MA.installNotice();
    h += expected();
    h += hero(s);
    h += '<div class="grid2"><div class="mini"><span class="l">הכנסות החודש</span><span class="b">' + money0(cur.income) + '</span><span class="s">להפריש ' + money0(cur.due) + '</span></div>' +
      '<div class="mini"><span class="l">נתתי והפרשתי החודש</span><span class="b">' + money0(cur.given) + '</span><span class="s">' + (cur.fromFund ? 'ועוד ' + money0(cur.fromFund) + ' מהקופה' : MA.monthLabel(cur.key)) + '</span></div></div>';
    h += '<button type="button" class="card fund-row" data-action="tab" data-tab="fund"><span class="tile fund">' + icon('piggy') + '</span><span class="grow"><span class="t">קופת מעשרות</span><span class="s">כסף שהפרשת בצד ועוד לא חילקת</span></span><span class="v">' + money(s.fund) + '</span><span class="chev">' + icon('chevL', 'sm') + '</span></button>';
    h += pledges();
    if (s.owed > 0.5) h += split(s);
    if (MA.backupDue()) {
      h += '<div class="banner gray"><span class="ic">' + icon('upload') + '</span><span class="txt"><span class="t">הגיע הזמן לגבות</span><span class="s">הנתונים שמורים רק בטלפון הזה</span></span>' +
        '<button type="button" class="go" data-action="export-backup">גיבוי</button><button type="button" class="x" aria-label="אחר כך" data-action="snooze-backup">' + icon('close', 'sm') + '</button></div>';
    }
    const act = V.activity(6);
    if (!act.length) return h + welcomeEmpty();
    h += V.secHead('פעולות אחרונות', '<button type="button" class="text-btn" data-action="tab" data-tab="history">הכל</button>');
    h += '<div class="card list">' + act.map(V.anyRow).join('') + '</div>';
    return h;
  };
})();
