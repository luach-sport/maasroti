/* The empty data of a new install, and the suggested income sources. */
(function () {
  'use strict';
  const MA = window.MA;

  MA.SOURCES = ['משכורת', 'עבודה נוספת', 'עסק', 'מתנה', 'קצבה', 'שכר דירה', 'החזר מס', 'אחר'];

  MA.defaults = () => ({
    v: 1, createdAt: Date.now(), onboarded: false,
    settings: {
      theme: 'system', rate: 10, credit: true, hebrew: true, opening: 0,
      weeklyOn: true, weekday: 4, hour: 20, minute: 0, salaryRemind: true,
      backupRemind: true, lastBackup: 0, backupSnooze: 0
    },
    incomes: [], gifts: [], fund: [], recurring: [], targets: [],
    outbox: [], profile: { name: '', email: '' }, updateSeen: 0
  });
})();
