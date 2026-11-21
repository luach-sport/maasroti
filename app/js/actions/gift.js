/* Gifts: add, edit, delete, pledges marked paid, giving to a place from the suggested split, receipt photos. */
(function () {
  'use strict';
  const MA = window.MA;
  const A = MA.A;
  const ui = MA.ui;

  A['new-gift'] = (el) => MA.openSheet('gift', { month: el && el.dataset && el.dataset.month, fund: el && el.dataset && el.dataset.fund === '1' });
  A['edit-gift'] = (el) => MA.openSheet('gift', { id: el.dataset.id });
  A['give-to'] = (el) => MA.openSheet('gift', { targetId: el.dataset.id, amount: el.dataset.v ? +el.dataset.v : '' });
  A['gift-target'] = (el) => { ui.form.targetId = el.dataset.v; MA.renderSheet(); MA.loadReceiptThumb(); };
  A['gift-status'] = (el) => { ui.form.status = el.dataset.v; MA.renderSheet(); MA.loadReceiptThumb(); };

  A['gift-photo'] = async () => {
    const b64 = await MA.receipts.capture();
    if (!b64 || !MA.sheetIs('gift')) return;
    ui.form.newReceipt = b64; ui.form.removeReceipt = false;
    MA.renderSheet();
  };
  A['gift-photo-remove'] = () => { ui.form.newReceipt = ''; ui.form.removeReceipt = true; MA.renderSheet(); };
  A['view-receipt'] = async () => {
    const f = ui.form;
    const src = f.newReceipt ? 'data:image/jpeg;base64,' + f.newReceipt : await MA.receipts.src(f.receipt);
    if (!src) return;
    ui.giftSaved = { data: ui.sheet.data, form: f };
    MA.openSheet('receipt', { src });
  };
  A['back-to-gift'] = () => {
    const s = ui.giftSaved;
    if (!s) { MA.closeSheet(); return; }
    ui.sheet = { name: 'gift', data: s.data }; ui.form = s.form; ui.giftSaved = null;
    MA.renderSheet(); MA.loadReceiptThumb();
  };
  A['share-receipt'] = async () => {
    const src = ui.sheet.data.src || '';
    const b64 = src.split(',')[1];
    if (!b64) return;
    if (MA.isNative()) {
      const w = await MA.call('Filesystem', 'writeFile', { path: 'קבלה.jpg', data: b64, directory: 'CACHE' });
      if (w && w.uri) { try { await MA.callRaw('Share', 'share', { files: [w.uri], dialogTitle: 'שיתוף הקבלה' }); } catch (e) { /* cancelled */ } }
      return;
    }
    const bin = atob(b64), arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    const file = new File([arr], 'קבלה.jpg', { type: 'image/jpeg' });
    if (MA.webShare) MA.webShare({ files: [file], title: 'קבלה' }); else MA.downloadFiles([file]);
  };

  A['save-gift'] = async () => {
    const f = ui.form, amount = MA.num(f.amount);
    if (!(amount > 0)) { MA.toast('כמה נתת?'); return; }
    if (!f.targetId && !MA.clip(f.to, 60)) { MA.toast('למי נתת? אפשר לכתוב שם'); return; }
    const ts = MA.fromInput(f.date);
    if (!isFinite(ts)) { MA.toast('בחר תאריך'); return; }
    const old = f.id ? MA.state.gifts.find((g) => g.id === f.id) : null;
    const id = f.id || MA.uid();
    let receipt = old ? old.receipt : '';
    if (f.newReceipt) {
      if (receipt) await MA.receipts.remove(receipt);
      try { receipt = await MA.receipts.save(id, f.newReceipt); } catch (e) { MA.toast('לא הצלחתי לשמור את התמונה'); receipt = ''; }
    } else if (f.removeReceipt && receipt) { await MA.receipts.remove(receipt); receipt = ''; }
    const entry = { id, ts, amount: MA.round2(amount), targetId: f.targetId || '', to: f.targetId ? '' : MA.clip(f.to, 60), status: f.status === 'pledged' ? 'pledged' : 'paid', fromFund: !!f.fromFund, sec46: !!f.sec46, receiptNo: MA.clip(f.receiptNo, 40), receipt, note: MA.clip(f.note, 300) };
    if (old) Object.assign(old, entry); else MA.state.gifts.push(entry);
    MA.save(); MA.haptic(); MA.closeSheet();
    const s = MA.summary();
    MA.toast(entry.status === 'pledged' ? 'נרשמה התחייבות' : entry.fromFund ? 'נרשם · בקופה נשארו ' + MA.money(s.fund) : s.owed > 0.5 ? 'תזכה למצוות! נשאר לתת ' + MA.money(s.owed) : 'תזכה למצוות! הכל מסודר');
    MA.render(true);
  };
  A['delete-gift'] = async () => {
    if (!ui.form.confirm) { ui.form.confirm = true; MA.renderSheet(); MA.loadReceiptThumb(); return; }
    const g = MA.state.gifts.find((x) => x.id === ui.form.id);
    if (g && g.receipt) await MA.receipts.remove(g.receipt);
    MA.state.gifts = MA.state.gifts.filter((x) => x.id !== ui.form.id);
    MA.save(); MA.closeSheet(); MA.toast('הנתינה נמחקה'); MA.render(true);
  };
  A['pledge-paid'] = (el) => {
    const g = MA.state.gifts.find((x) => x.id === el.dataset.id);
    if (!g) return;
    g.status = 'paid'; g.ts = Date.now();
    MA.save(); MA.haptic(); MA.toast('תזכה למצוות! סומן כשולם'); MA.render(true);
  };
})();
