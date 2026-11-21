/* Fixed incomes (a salary every month on day N): which ones should have come in and weren't confirmed yet. */
(function () {
  'use strict';
  const MA = window.MA;

  // Up to 2 months back, from the month the fixed income was added.
  MA.expectedIncomes = () => {
    const now = Date.now(), cur = MA.monthKey(now), out = [];
    MA.state.recurring.forEach((r) => {
      if (!r.active) return;
      for (let k = MA.addMonths(cur, -2); k <= cur; k = MA.addMonths(k, 1)) {
        if (k < r.startKey || r.done[k]) continue;
        const at = MA.dayInMonth(k, r.day);
        if (MA.dayStart(at) <= now) out.push({ rec: r, key: k, at });
      }
    });
    return out.sort((a, b) => a.at - b.at);
  };

  // It came in: adds the income on its day (amount can be different from the usual).
  MA.confirmIncome = (recId, key, amount) => {
    const r = MA.recById(recId);
    if (!r) return null;
    const inc = { id: MA.uid(), ts: MA.dayInMonth(key, r.day), amount: MA.round2(amount > 0 ? amount : r.amount), expenses: r.expenses, rate: r.rate, source: r.name, note: '', recId: r.id };
    MA.state.incomes.push(inc);
    r.done[key] = 'in';
    return inc;
  };
  MA.skipIncome = (recId, key) => { const r = MA.recById(recId); if (r) r.done[key] = 'skip'; };
  // When a fixed income is added in the middle of a month after its day, this month counts as already handled.
  MA.newRecurring = (o) => {
    const key = MA.monthKey(Date.now());
    const r = Object.assign({ id: MA.uid(), active: true, startKey: key, done: {} }, o);
    if (o.handledNow) { r.done[key] = 'in'; delete r.handledNow; }
    return r;
  };
})();
