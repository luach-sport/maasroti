/* Pieces several screens use: a row for an income / gift / deposit, a status tag, a section title. */
(function () {
  'use strict';
  const MA = window.MA;
  const { esc, icon, money } = MA;
  const V = MA.views;

  V.secHead = (title, extra) => '<div class="sec-head"><h2>' + esc(title) + '</h2>' + (extra || '') + '</div>';

  V.incomeRow = (i) => '<button type="button" class="row" data-action="edit-income" data-id="' + i.id + '">' +
    '<span class="tile in">' + icon(i.recId ? 'repeat' : 'arrowDown') + '</span>' +
    '<span class="grow"><span class="t">' + esc(i.source || 'הכנסה') + '</span><span class="s">' + esc(MA.dateBoth(i.ts)) + ' · ' + esc(MA.rateName(i.rate)) + (i.expenses ? ' · אחרי ניכוי ' + money(i.expenses) : '') + '</span></span>' +
    '<span class="end"><span class="amt">' + money(i.amount) + '</span><span class="sub">להפריש ' + money(MA.incomeDue(i)) + '</span></span></button>';

  V.giftRow = (g) => {
    const tags = (g.status === 'pledged' ? '<span class="tag gold">התחייבתי</span>' : '') + (g.fromFund ? '<span class="tag">מהקופה</span>' : '') + (g.receipt ? '<span class="tag">' + icon('camera', 'xs') + 'קבלה</span>' : '');
    return '<button type="button" class="row" data-action="edit-gift" data-id="' + g.id + '">' +
      '<span class="tile out">' + icon('hand') + '</span>' +
      '<span class="grow"><span class="t">' + esc(MA.giftName(g)) + '</span><span class="s">' + esc(MA.dateBoth(g.ts)) + (g.receiptNo ? ' · קבלה ' + esc(g.receiptNo) : '') + '</span>' + (tags ? '<span class="tags">' + tags + '</span>' : '') + '</span>' +
      '<span class="end"><span class="amt">' + money(g.amount) + '</span></span></button>';
  };

  V.depositRow = (d) => '<button type="button" class="row" data-action="edit-deposit" data-id="' + d.id + '">' +
    '<span class="tile fund">' + icon('piggy') + '</span>' +
    '<span class="grow"><span class="t">הפקדה לקופה</span><span class="s">' + esc(MA.dateBoth(d.ts)) + (d.note ? ' · ' + esc(d.note) : '') + '</span></span>' +
    '<span class="end"><span class="amt">' + money(d.amount) + '</span></span></button>';

  // Everything that happened, newest first: [{ kind, x }]
  V.activity = (limit) => {
    const S = MA.state;
    const all = S.incomes.map((x) => ({ kind: 'income', x })).concat(S.gifts.map((x) => ({ kind: 'gift', x })), S.fund.map((x) => ({ kind: 'deposit', x })));
    return all.sort((a, b) => b.x.ts - a.x.ts).slice(0, limit || 1e9);
  };
  V.anyRow = (e) => (e.kind === 'income' ? V.incomeRow(e.x) : e.kind === 'gift' ? V.giftRow(e.x) : V.depositRow(e.x));

  // "הושלם" / "חסר ₪120" / "זכות ₪50" for the balance at the end of a month.
  V.statusTag = (b) => (b > 0.5 ? '<span class="tag warn">חסר ' + MA.money0(b) + '</span>' : b < -0.5 ? '<span class="tag ok">זכות ' + MA.money0(-b) + '</span>' : '<span class="tag ok">' + icon('check', 'xs') + 'הושלם</span>');
})();
