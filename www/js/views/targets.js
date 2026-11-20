/* Where I give: places / people with a share in percent, what was given to each this year, and a suggested split
   of what's left. Open pledges can be marked paid here too. */
(function () {
  'use strict';
  const MA = window.MA;
  const { esc, icon, money, money0 } = MA;
  const V = MA.views;

  V.targets = () => {
    const S = MA.state, s = MA.summary(), year = new Date().getFullYear();
    const given = MA.givenByTarget(year);
    const total = MA.sum(S.targets, (t) => t.pct);
    let h = '<header class="top"><h1 class="h1">לאן אני נותן</h1><button type="button" class="chip sm" data-action="edit-target" data-id="">' + icon('plus', 'sm') + 'מקום חדש</button></header>';
    if (!S.targets.length) {
      return h + '<div class="empty"><span class="tile big">' + icon('target', 'lg') + '</span><b>לאן נותנים את המעשרות?</b><span>מוסיפים את המקומות הקבועים (ישיבה, בית כנסת, קופת צדקה, משפחה נזקקת), אפשר עם אחוז לכל אחד. האפליקציה תציע איך לחלק את מה שנשאר, ותראה כמה נתת לכל מקום השנה.</span>' +
        '<button type="button" class="btn small" data-action="edit-target" data-id="">' + icon('plus') + 'הוספת מקום</button></div>';
    }
    if (total > 0 && total !== 100) h += '<div class="notice accent">' + icon('percent', 'sm') + '<span class="grow">סך האחוזים הוא ' + total + '%. ההצעה מחלקת לפי היחס ביניהם.</span></div>';
    h += '<div class="card list">' + S.targets.map((t) => '<div class="row"><button type="button" class="row-main" data-action="edit-target" data-id="' + t.id + '">' +
      '<span class="tile gold">' + icon('target') + '</span><span class="grow"><span class="t">' + esc(t.name) + (t.sec46 ? ' <span class="tag">סעיף 46</span>' : '') + '</span>' +
      '<span class="s">' + (t.pct ? t.pct + '% מהחלוקה · ' : '') + 'השנה: ' + money0(given[t.id] || 0) + '</span></span></button>' +
      '<button type="button" class="mini-btn" data-action="give-to" data-id="' + t.id + '">' + icon('plus', 'sm') + 'נתינה</button></div>').join('') + '</div>';
    if (given['']) h += '<p class="fine">ועוד ' + money0(given['']) + ' השנה למקומות שלא ברשימה.</p>';
    const sp = MA.suggestSplit(s.owed);
    if (sp.length) {
      h += V.secHead('הצעת חלוקה ל-' + money0(s.owed) + ' שנשארו') + '<div class="card list">' +
        sp.map((x) => '<button type="button" class="row" data-action="give-to" data-id="' + x.target.id + '" data-v="' + x.amount + '"><span class="grow"><span class="t">' + esc(x.target.name) + '</span><span class="s">' + x.target.pct + '%</span></span><span class="v">' + money0(x.amount) + '</span><span class="chev">' + icon('chevL', 'sm') + '</span></button>').join('') + '</div>';
    }
    const pl = MA.pledges();
    if (pl.length) {
      h += V.secHead('התחייבויות פתוחות') + '<div class="card list">' + pl.map((g) => '<div class="row"><span class="grow"><span class="t">' + esc(MA.giftName(g)) + '</span><span class="s">' + esc(MA.dayLabel(g.ts)) + '</span></span><span class="v">' + money(g.amount) + '</span>' +
        '<button type="button" class="mini-btn" data-action="pledge-paid" data-id="' + g.id + '">שילמתי</button></div>').join('') + '</div>';
    }
    return h;
  };
})();
