/* The tithe calculation.
   Every income adds what has to be set aside: (amount − deductible expenses) × rate.
   What was given straight away (a paid gift not from the fund) and every deposit into the fund take it off.
   Pledged gifts (promised, not paid yet) don't take anything off until marked paid.
   Gifts paid from the fund take money out of the fund (it was already set aside).
   Giving more than owed is a credit for the next incomes, unless turned off in the settings. */
(function () {
  'use strict';
  const MA = window.MA;
  const S = () => MA.state;

  MA.incomeNet = (i) => Math.max(0, i.amount - (i.expenses || 0));
  MA.incomeDue = (i) => MA.round2(MA.incomeNet(i) * i.rate / 100);
  const direct = (g) => g.status === 'paid' && !g.fromFund;

  // All the steps that change the balance, oldest first.
  function steps(upTo) {
    const st = S(), list = [];
    st.incomes.forEach((i) => list.push({ ts: i.ts, v: MA.incomeDue(i) }));
    st.gifts.forEach((g) => { if (direct(g)) list.push({ ts: g.ts, v: -g.amount }); });
    st.fund.forEach((d) => list.push({ ts: d.ts, v: -d.amount }));
    return list.filter((x) => upTo == null || x.ts < upTo).sort((a, b) => a.ts - b.ts);
  }
  // The running balance: positive = still to set aside, negative = credit.
  MA.balanceAt = (upTo) => {
    const credit = S().settings.credit;
    let b = S().settings.opening || 0;
    steps(upTo).forEach((x) => { b += x.v; if (!credit && b < 0) b = 0; });
    return MA.round2(b);
  };

  MA.fundBalance = () => MA.round2(MA.sum(S().fund, (d) => d.amount) - MA.sum(S().gifts.filter((g) => g.fromFund && g.status === 'paid'), (g) => g.amount));
  MA.pledges = () => S().gifts.filter((g) => g.status === 'pledged').sort((a, b) => a.ts - b.ts);

  MA.summary = () => {
    const b = MA.balanceAt();
    const pl = MA.pledges();
    return {
      balance: b, owed: Math.max(0, b), credit: Math.max(0, -b),
      fund: MA.fundBalance(), pledged: MA.round2(MA.sum(pl, (g) => g.amount)), pledgeCount: pl.length
    };
  };

  // One month: incomes, what had to be set aside, what was given / set aside, and the balance at its end.
  MA.monthSummary = (key) => {
    const st = S(), inM = (x) => MA.monthKey(x.ts) === key;
    const inc = st.incomes.filter(inM), gifts = st.gifts.filter(inM), deps = st.fund.filter(inM);
    const end = MA.monthStart(MA.addMonths(key, 1));
    return {
      key, incomes: inc, gifts, deposits: deps,
      income: MA.round2(MA.sum(inc, (i) => i.amount)), expenses: MA.round2(MA.sum(inc, (i) => i.expenses || 0)),
      due: MA.round2(MA.sum(inc, MA.incomeDue)),
      given: MA.round2(MA.sum(gifts.filter(direct), (g) => g.amount) + MA.sum(deps, (d) => d.amount)),
      fromFund: MA.round2(MA.sum(gifts.filter((g) => g.fromFund && g.status === 'paid'), (g) => g.amount)),
      pledged: MA.round2(MA.sum(gifts.filter((g) => g.status === 'pledged'), (g) => g.amount)),
      balanceEnd: MA.balanceAt(end)
    };
  };
  // Months that have anything in them, newest first.
  MA.activeMonths = () => {
    const st = S(), set = new Set();
    st.incomes.concat(st.gifts, st.fund).forEach((x) => set.add(MA.monthKey(x.ts)));
    return Array.from(set).sort().reverse();
  };

  // How much was given (paid) to each target in a year.
  MA.givenByTarget = (year) => {
    const m = {};
    S().gifts.forEach((g) => { if (g.status === 'paid' && new Date(g.ts).getFullYear() === year) m[g.targetId || ''] = (m[g.targetId || ''] || 0) + g.amount; });
    return m;
  };
  // Splitting an amount between the targets by their percentages (only targets with a percentage).
  MA.suggestSplit = (amount) => {
    const ts = S().targets.filter((t) => t.pct > 0);
    const total = MA.sum(ts, (t) => t.pct);
    if (!ts.length || !(amount > 0)) return [];
    let left = Math.round(amount);
    return ts.map((t, i) => {
      const v = i === ts.length - 1 ? left : Math.round(amount * t.pct / total);
      left -= v;
      return { target: t, amount: v };
    });
  };

  // Gifts for the section 46 tax credit in a year (paid, marked as an approved institution).
  MA.sec46 = (year) => S().gifts.filter((g) => g.status === 'paid' && new Date(g.ts).getFullYear() === year && (g.sec46 || (MA.targetById(g.targetId) || {}).sec46)).sort((a, b) => a.ts - b.ts);
})();
