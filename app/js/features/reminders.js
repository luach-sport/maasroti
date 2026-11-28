/* Phone notifications (Android): the weekly reminder (what's left to give, and did incomes come in), and a
   reminder on the day each fixed income should come in. Scheduled again after every change, so the weekly text
   always has the current amount. On iPhone there are no scheduled notifications; the home screen shows the same. */
(function () {
  'use strict';
  const MA = window.MA;
  const WEEKLY = 1, SALARY = 100;
  let asked = false;

  function weeklyBody() {
    const s = MA.summary();
    const a = s.owed > 0.5 ? 'נשאר לך לתת ' + MA.money0(s.owed) + '.' : s.credit > 0.5 ? 'יש לך זכות של ' + MA.money0(s.credit) + '.' : 'הכל מסודר, אין חוב מעשרות.';
    return a + ' היו הכנסות השבוע? כדאי לעדכן.';
  }

  async function schedule() {
    if (!MA.isNative() || !MA.state || !MA.state.onboarded) return;
    const st = MA.state.settings;
    const pending = await MA.call('LocalNotifications', 'getPending');
    const old = ((pending && pending.notifications) || []).map((n) => ({ id: n.id }));
    if (old.length) await MA.call('LocalNotifications', 'cancel', { notifications: old });
    const list = [];
    const base = { smallIcon: 'ic_stat_maasroti', iconColor: '#173A7A' };
    if (st.weeklyOn) {
      list.push(Object.assign({ id: WEEKLY, title: 'מעשרותי · תזכורת שבועית', body: weeklyBody(),
        schedule: { on: { weekday: st.weekday + 1, hour: st.hour, minute: st.minute }, allowWhileIdle: true } }, base));
    }
    if (st.salaryRemind) {
      MA.state.recurring.filter((r) => r.active).slice(0, 40).forEach((r, i) => {
        list.push(Object.assign({ id: SALARY + i, title: 'מעשרותי · ' + r.name, body: 'היום אמורה להיכנס ' + r.name + ' (' + MA.money0(r.amount) + '). נכנסה? לחיצה כדי לאשר ולחשב מעשר.',
          schedule: { on: { day: Math.min(r.day, 28), hour: 10, minute: 0 }, allowWhileIdle: true } }, base));
      });
    }
    if (!list.length) return;
    if (!asked) {
      asked = true;
      const perm = await MA.call('LocalNotifications', 'requestPermissions');
      if (perm && perm.display && perm.display !== 'granted') { MA.toast('כדי לקבל תזכורות צריך לאשר התראות בהגדרות הטלפון', 4000); return; }
    }
    await MA.call('LocalNotifications', 'schedule', { notifications: list });
  }
  MA.scheduleReminders = MA.debounce(() => { schedule().catch((e) => console.warn('reminders', e && e.message)); }, 1500);
  MA.onChange(() => MA.scheduleReminders());
})();
