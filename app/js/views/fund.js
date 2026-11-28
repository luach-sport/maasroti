/* The tithe fund: money already set aside but not given yet. Deposits take it off what's owed; giving from the fund
   takes it out of the fund. */
(function () {
  'use strict';
  const MA = window.MA;
  const { esc, icon, money, money0 } = MA;
  const V = MA.views;

  V.fund = () => {
    const S = MA.state, s = MA.summary();
    let h = '<header class="top"><h1 class="h1">קופת מעשרות</h1></header>';
    h += '<section class="hero fund"><span class="lbl">בקופה עכשיו</span><span class="amount">' + money(s.fund) + '</span>' +
      '<span class="sub">כסף שהפרשת בצד (למשל לחשבון נפרד או לקופה בבית) ועוד לא חילקת</span>' +
      '<div class="hero-btns"><button type="button" class="hbtn" data-action="new-deposit">' + icon('arrowDown') + 'הפקדה לקופה</button>' +
      '<button type="button" class="hbtn gold" data-action="new-gift" data-fund="1">' + icon('hand') + 'נתינה מהקופה</button></div></section>';
    if (s.owed > 0.5) {
      h += '<div class="notice accent">' + icon('info', 'sm') + '<span class="grow">נשאר להפריש ' + money0(s.owed) + '. הפקדה לקופה מורידה את זה מהחוב, ואת הנתינה עצמה עושים אחר כך מהקופה.</span>' +
        '<button type="button" class="link" data-action="deposit-all">להפקיד הכל</button></div>';
    }
    const moves = S.fund.map((x) => ({ kind: 'deposit', x })).concat(S.gifts.filter((g) => g.fromFund).map((x) => ({ kind: 'gift', x }))).sort((a, b) => b.x.ts - a.x.ts);
    if (!moves.length) {
      h += '<div class="empty"><span class="tile big">' + icon('piggy', 'lg') + '</span><b>הקופה עוד ריקה</b><span>נוח למי שמפריש מעשרות בכל משכורת לחשבון או לקופה, ומחלק לאט לאט. כל הפקדה נחשבת כאילו כבר נתת, וכל נתינה מהקופה מורידה מהיתרה בה.</span></div>';
      return h;
    }
    h += V.secHead('תנועות בקופה') + '<div class="card list">' + moves.map(V.anyRow).join('') + '</div>';
    return h;
  };
})();
