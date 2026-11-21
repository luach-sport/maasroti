/* Backup to one file (all the data and the receipt photos) and restoring from it on any phone. */
(function () {
  'use strict';
  const MA = window.MA;

  MA.exportBackup = async () => {
    const S = MA.state;
    MA.toast('מכין גיבוי…', 20000);
    const receipts = {};
    for (const g of S.gifts) {
      if (!g.receipt) continue;
      const b = await MA.receipts.read(g.receipt);
      if (b) receipts[g.receipt] = b;
    }
    const doc = { app: 'maasroti', v: 1, exportedAt: new Date().toISOString(), version: MA.VERSION.version, state: S, receipts };
    MA.$('#toast-root').innerHTML = '';
    const ok = await MA.shareFile('מעשרותי-גיבוי-' + MA.dateInput(Date.now()) + '.json', JSON.stringify(doc), 'application/json', 'גיבוי מעשרותי');
    if (ok) { S.settings.lastBackup = Date.now(); S.settings.backupSnooze = 0; MA.save(); MA.render(true); }
  };

  MA.importBackup = async (doc) => {
    const incoming = MA.normalize(doc.state);
    const receipts = MA.isObj(doc.receipts) ? doc.receipts : {};
    MA.toast('משחזר…', 30000);
    for (const g of incoming.gifts) {
      const b = g.receipt && receipts[g.receipt];
      if (!b) { g.receipt = ''; continue; }
      try { g.receipt = await MA.receipts.save(g.id, b); } catch (e) { g.receipt = ''; }
    }
    incoming.outbox = MA.state.outbox; incoming.updateSeen = MA.state.updateSeen;
    incoming.onboarded = true;
    MA.state = incoming;
    await MA.save(true);
    MA.applyTheme(); MA.closeSheet();
    MA.ui.stack = []; MA.ui.tab = 'home';
    MA.toast('הנתונים שוחזרו');
    MA.render();
  };

  // Reads a chosen backup file and asks before replacing what's in the app.
  MA.readBackupFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const d = JSON.parse(String(reader.result));
        if (!d || d.app !== 'maasroti' || !d.state) throw new Error('bad');
        MA.openSheet('importConfirm', { doc: d, incomes: (d.state.incomes || []).length, gifts: (d.state.gifts || []).length, at: Date.parse(d.exportedAt) || 0 });
      } catch (err) { MA.toast('הקובץ הזה אינו גיבוי של מעשרותי'); }
    };
    reader.onerror = () => MA.toast('לא הצלחתי לקרוא את הקובץ');
    reader.readAsText(file);
  };
})();
