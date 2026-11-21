/* Restore from a backup file: replaces what's in the app (after asking). */
(function () {
  'use strict';
  const MA = window.MA;
  const { esc, icon } = MA;

  MA.SHEETS.importConfirm = {
    title: () => 'שחזור מגיבוי',
    render: (d) => '<div class="notice gray">' + icon('info', 'sm') + '<span class="grow">בגיבוי: ' + MA.plural(d.incomes, 'הכנסה אחת', 'הכנסות') + ' ו' + MA.plural(d.gifts, 'נתינה אחת', 'נתינות') + (d.at ? ', מ-' + esc(MA.dayLabel(d.at)) : '') + '.</span></div>' +
      '<div class="notice accent">' + icon('alert', 'sm') + '<span class="grow">השחזור מחליף את כל מה שיש כרגע באפליקציה (' + MA.plural(MA.state.incomes.length, 'הכנסה אחת', 'הכנסות') + ', ' + MA.plural(MA.state.gifts.length, 'נתינה אחת', 'נתינות') + ') במה שבגיבוי.</span></div>' +
      '<button type="button" class="btn" data-action="confirm-import">' + icon('refresh') + 'כן, לשחזר מהגיבוי</button>' +
      '<button type="button" class="btn ghost" data-action="close-sheet">ביטול</button>'
  };
})();
