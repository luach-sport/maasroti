/* A place I give to: name, share in percent, and whether it's an institution with section 46. */
(function () {
  'use strict';
  const MA = window.MA;
  const { icon } = MA;
  const F = MA.F;
  const ui = MA.ui;

  MA.SHEETS.target = {
    title: (d) => (d.id ? 'עריכת מקום' : 'מקום חדש'),
    init: (d) => {
      const t = MA.targetById(d.id);
      ui.form = t ? { id: t.id, name: t.name, pct: t.pct ? String(t.pct) : '', sec46: t.sec46 } : { id: '', name: '', pct: '', sec46: false };
      ui.form.confirm = false;
    },
    render: () => {
      const f = ui.form;
      let h = F.text('tname', 'name', 'שם המקום או האדם', f.name, 'למשל: ישיבת אור התורה', 50);
      h += '<div class="field"><label for="tpct">אחוז מהחלוקה (לא חובה)</label><div class="input-wrap"><input id="tpct" class="input" inputmode="numeric" data-f="pct" value="' + MA.esc(f.pct) + '" placeholder="למשל 40"><span class="suffix">%</span></div>' +
        '<span class="hint">לפי האחוזים האפליקציה מציעה איך לחלק את מה שנשאר לתת.</span></div>';
      h += '<div class="card list">' + F.switchRow('sec46', 'מוסד מוכר לסעיף 46', 'נתינות לכאן ייכנסו לדוח השנתי לזיכוי ממס', f.sec46) + '</div>';
      h += '<button type="button" class="btn" data-action="save-target">' + icon('check') + 'שמירה</button>';
      if (f.id) h += F.del('delete-target', f.confirm) + '<p class="fine">נתינות שכבר נרשמו לכאן יישארו, עם השם שלהן.</p>';
      return h;
    }
  };
})();
