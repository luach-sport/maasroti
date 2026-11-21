/* Adding or editing a gift (נתינה): amount, to whom, given already or only pledged, from the fund, receipt photo and
   number, and section 46. */
(function () {
  'use strict';
  const MA = window.MA;
  const { esc, icon, money } = MA;
  const F = MA.F;
  const ui = MA.ui;

  function receiptBlock(f) {
    const has = f.newReceipt || (f.receipt && !f.removeReceipt);
    if (!has) return '<button type="button" class="dashed-btn" data-action="gift-photo">' + icon('camera') + 'צילום קבלה</button>';
    return '<div class="receipt-box"><img id="rcpt-img" alt="צילום הקבלה" ' + (f.newReceipt ? 'src="data:image/jpeg;base64,' + f.newReceipt + '"' : '') + ' data-action="view-receipt">' +
      '<div class="btn-col"><button type="button" class="btn small secondary" data-action="view-receipt">' + icon('image', 'sm') + 'הגדלה</button>' +
      '<button type="button" class="btn small secondary" data-action="gift-photo">' + icon('camera', 'sm') + 'צילום אחר</button>' +
      '<button type="button" class="btn small ghost danger-text" data-action="gift-photo-remove">' + icon('trash', 'sm') + 'הסרה</button></div></div>';
  }

  MA.SHEETS.gift = {
    full: true,
    title: (d) => (d.id ? 'עריכת נתינה' : d.fund ? 'נתינה מהקופה' : 'נתינה חדשה'),
    init: (d) => {
      const g = d.id ? MA.state.gifts.find((x) => x.id === d.id) : null;
      const ts = d.month && d.month !== MA.monthKey(Date.now()) ? MA.dayInMonth(d.month, 1) : Date.now();
      ui.form = g ? { id: g.id, amount: String(g.amount), date: MA.dateInput(g.ts), targetId: g.targetId, to: g.to, status: g.status, fromFund: g.fromFund, sec46: g.sec46, receiptNo: g.receiptNo, receipt: g.receipt, note: g.note }
        : { id: '', amount: d.amount ? String(d.amount) : '', date: MA.dateInput(ts), targetId: d.targetId || '', to: '', status: 'paid', fromFund: !!d.fund, sec46: false, receiptNo: '', receipt: '', note: '' };
      ui.form.confirm = false; ui.form.newReceipt = ''; ui.form.removeReceipt = false;
      if (g && g.receipt) setTimeout(MA.loadReceiptThumb, 30);
    },
    render: () => {
      const f = ui.form, S = MA.state, s = MA.summary();
      const t = MA.targetById(f.targetId);
      let h = F.money('gamt', 'amount', 'סכום', f.amount, { big: true, autofocus: !f.id, hint: !f.id && !f.fromFund && s.owed > 0.5 ? 'נשאר לתת ' + money(s.owed) : '' });
      h += '<div class="field"><span class="label">למי?</span><div class="chips">' +
        S.targets.map((x) => '<button type="button" class="chip sm" data-action="gift-target" data-v="' + x.id + '" aria-pressed="' + (f.targetId === x.id) + '">' + esc(x.name) + '</button>').join('') +
        '<button type="button" class="chip sm" data-action="gift-target" data-v="" aria-pressed="' + !f.targetId + '">' + (S.targets.length ? 'מקום אחר' : 'כתיבת שם') + '</button></div></div>';
      if (!f.targetId) h += F.text('gto', 'to', 'שם המקום או האדם', f.to, 'למשל: קופת העיר', 60);
      h += '<div class="seg" role="group" aria-label="מצב">' +
        '<button type="button" data-action="gift-status" data-v="paid" aria-pressed="' + (f.status === 'paid') + '">' + icon('check', 'sm') + 'כבר נתתי</button>' +
        '<button type="button" data-action="gift-status" data-v="pledged" aria-pressed="' + (f.status === 'pledged') + '">' + icon('clock', 'sm') + 'התחייבתי, עוד לא שילמתי</button></div>';
      h += '<div class="card list">' + F.switchRow('fromFund', 'מקופת המעשרות', 'בקופה עכשיו ' + money(MA.fundBalance()) + '. נתינה מהקופה לא מורידה שוב מהחוב, כי הכסף כבר הופרש.', f.fromFund) +
        F.switchRow('sec46', 'מוסד עם סעיף 46', t && t.sec46 ? 'מסומן ככזה ברשימת המקומות' : 'ייכנס לדוח השנתי לזיכוי ממס', f.sec46 || (t && t.sec46)) + '</div>';
      h += F.date('gdate', 'date', 'תאריך', f.date);
      h += '<div class="field"><span class="label">קבלה</span>' + receiptBlock(f) + '</div>';
      h += F.text('grno', 'receiptNo', 'מספר קבלה (לא חובה)', f.receiptNo, '', 40);
      h += F.note('gnote', f.note);
      h += '<button type="button" class="btn" data-action="save-gift">' + icon('check') + (f.id ? 'שמירה' : 'הוספת הנתינה') + '</button>';
      if (f.id) h += F.del('delete-gift', f.confirm);
      return h;
    }
  };

  // The saved photo of an existing gift is read from the phone after the sheet is drawn.
  MA.loadReceiptThumb = async () => {
    const f = ui.form;
    if (!f || !f.receipt || f.newReceipt || f.removeReceipt) return;
    const src = await MA.receipts.src(f.receipt);
    const img = MA.$('#rcpt-img');
    if (img && src) img.src = src;
  };

  MA.SHEETS.receipt = {
    full: true,
    title: () => 'צילום הקבלה',
    render: (d) => '<img class="receipt-full" src="' + esc(d.src || '') + '" alt="צילום הקבלה">' +
      '<button type="button" class="btn secondary" data-action="share-receipt">' + icon('share') + 'שיתוף התמונה</button>' +
      '<button type="button" class="btn" data-action="back-to-gift">' + icon('back') + 'חזרה לנתינה</button>'
  };
})();
