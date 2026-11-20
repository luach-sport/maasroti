/* Yearly report for the section 46 tax credit: paid gifts to recognised institutions, with receipt numbers. */
(function () {
  'use strict';
  const MA = window.MA;
  const { esc, icon, money } = MA;
  const ui = MA.ui;

  MA.SHEETS.sec46 = {
    full: true,
    title: () => 'דוח לסעיף 46',
    init: () => { ui.form = { year: new Date().getFullYear() }; },
    render: () => {
      const y = ui.form.year, list = MA.sec46(y), total = MA.sum(list, (g) => g.amount);
      const years = Array.from(new Set(MA.state.gifts.map((g) => new Date(g.ts).getFullYear()).concat([new Date().getFullYear()]))).sort().reverse();
      let h = '<div class="chips">' + years.map((x) => '<button type="button" class="chip sm" data-action="sec46-year" data-v="' + x + '" aria-pressed="' + (x === y) + '">' + x + '</button>').join('') + '</div>';
      h += '<div class="summary two"><div><b>' + money(total) + '</b><span>תרומות למוסדות מוכרים ב-' + y + '</span></div><div><b>' + list.length + '</b><span>קבלות</span></div></div>';
      if (!list.length) {
        h += '<div class="notice gray">' + icon('info', 'sm') + '<span class="grow">אין עדיין נתינות מסומנות לסעיף 46 בשנה הזו. מסמנים מוסד כ"מוכר לסעיף 46" ברשימת המקומות, או בכל נתינה.</span></div>';
      } else {
        h += '<div class="card list">' + list.map((g) => '<button type="button" class="row" data-action="edit-gift" data-id="' + g.id + '"><span class="grow"><span class="t">' + esc(MA.giftName(g)) + '</span><span class="s">' + esc(MA.dateFull(g.ts)) + (g.receiptNo ? ' · קבלה ' + esc(g.receiptNo) : ' · <span class="warn-text">חסר מספר קבלה</span>') + (g.receipt ? ' · יש צילום' : '') + '</span></span><span class="v">' + money(g.amount) + '</span></button>').join('') + '</div>';
        h += '<button type="button" class="btn" data-action="export-sec46">' + icon('table') + 'ייצוא הדוח לאקסל</button>';
      }
      h += '<p class="fine">על תרומות למוסד ציבורי שמוכר לפי סעיף 46 לפקודת מס הכנסה מקבלים זיכוי במס (35% מהסכום, מעל סכום מינימום ועד תקרה שמתעדכנים כל שנה). את הקבלות מגישים לרשות המסים, או מבקשים החזר מס. הדוח כאן הוא עזר לסיכום בלבד.</p>';
      return h;
    }
  };
})();
