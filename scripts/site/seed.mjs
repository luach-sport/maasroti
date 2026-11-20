// Example data for the screenshots, dated relative to today so the pictures always look current.
// seedApp runs inside the app page (sent to the browser as is) and writes the example data to the browser storage.
export function seedApp() {
  const now = new Date(), day = 864e5;
  const y = now.getFullYear(), m = now.getMonth();
  const at = (mo, d) => new Date(y, m + mo, d, 12).getTime();
  const key = (mo) => { const t = new Date(y, m + mo, 1); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0'); };
  const incomes = [], gifts = [], fund = [];
  let n = 0;
  const inc = (mo, d, amount, source, o) => incomes.push(Object.assign({ id: 'i' + (++n), ts: at(mo, d), amount, expenses: 0, rate: 10, source, note: '', recId: '' }, o || {}));
  const gift = (mo, d, amount, o) => gifts.push(Object.assign({ id: 'g' + (++n), ts: at(mo, d), amount, targetId: '', to: '', status: 'paid', fromFund: false, sec46: false, receiptNo: '', receipt: '', note: '' }, o || {}));
  for (let k = -5; k <= -1; k++) {
    inc(k, 1, 9200, 'משכורת', { recId: 'r1' });
    if (k % 2 === 0) inc(k, 14, 1800, 'שיעורים פרטיים', { expenses: 300 });
    gift(k, 5, 420, { targetId: 't1', receiptNo: String(48120 + k * 7) });
    gift(k, 9, 280, { targetId: 't2' });
    fund.push({ id: 'f' + (++n), ts: at(k, 2), amount: 300, note: '' });
    gift(k, 20, 250, { targetId: 't3', fromFund: true });
  }
  inc(0, 1, 9200, 'משכורת', { recId: 'r1' });
  inc(0, Math.max(1, now.getDate() - 2), 2500, 'עבודה נוספת', { expenses: 400 });
  gift(0, Math.max(1, now.getDate() - 1), 360, { targetId: 't1', receiptNo: '48211' });
  gift(0, Math.max(1, now.getDate() - 1), 200, { targetId: 't4', status: 'pledged' });
  const done = {};
  for (let k = -5; k <= 0; k++) done[key(k)] = 'in';
  const state = {
    v: 1, createdAt: Date.now() - 200 * day, onboarded: true,
    settings: { theme: 'light', rate: 10, credit: true, hebrew: true, opening: 0, weeklyOn: true, weekday: 4, hour: 20, minute: 0, salaryRemind: true, backupRemind: true, lastBackup: Date.now() - 2 * day, backupSnooze: 0 },
    incomes, gifts, fund,
    recurring: [
      { id: 'r1', name: 'משכורת', amount: 9200, expenses: 0, rate: 10, day: 1, active: true, startKey: key(-5), done },
      { id: 'r2', name: 'שכר דירה', amount: 3800, expenses: 0, rate: 10, day: 10, active: true, startKey: key(0), done: {} }
    ],
    targets: [
      { id: 't1', name: 'ישיבת אור התורה', pct: 40, sec46: true },
      { id: 't2', name: 'קופת צדקה של העיר', pct: 30, sec46: true },
      { id: 't3', name: 'משפחות נזקקות', pct: 20, sec46: false },
      { id: 't4', name: 'בית הכנסת', pct: 10, sec46: false }
    ],
    outbox: [], profile: { name: '', email: '' }, updateSeen: 0
  };
  localStorage.setItem('maasroti.state.v1', JSON.stringify(state));
  localStorage.setItem('maasroti.theme', 'light');
}
