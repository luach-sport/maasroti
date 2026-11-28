/* Sharing files from the web version and on iPhone: backup, export to Excel and pictures of a trip go to the
   phone's share sheet (save to Files, WhatsApp, mail…), or are downloaded where sharing files isn't possible.
   iPhone opens the share sheet only right after a tap, so when getting a file ready took a moment, a small
   window asks for one more tap. The Android app shares through its own plugin. Loaded after app.js. */
(function () {
  'use strict';
  const MA = window.MA;
  let pending = null;

  MA.downloadFiles = (files) => {
    (files || []).forEach((f, i) => setTimeout(() => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(f); a.download = f.name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, i * 500));
  };

  const canShare = (files) => { try { return !!(navigator.share && navigator.canShare && navigator.canShare({ files })); } catch (e) { return false; } };
  const payload = (d) => (d.title ? { files: d.files, title: d.title } : { files: d.files });

  // d: { files, title, preview? (picture shown in the "ready" window) }.
  // Resolves to 'shared', 'cancelled', 'asked' (the "ready" window is open) or 'saved' (downloaded).
  MA.webShare = async (d) => {
    if (canShare(d.files)) {
      try { await navigator.share(payload(d)); return 'shared'; } catch (e) {
        if (e && e.name === 'AbortError') return 'cancelled';
        if (e && e.name === 'NotAllowedError') { pending = d; MA.openSheet('shareReady'); return 'asked'; }
        console.warn('share', e && e.name, e && e.message);
      }
    }
    MA.downloadFiles(d.files);
    return 'saved';
  };

  MA.SHEETS.shareReady = {
    title: () => (pending && pending.title) || 'מוכן לשיתוף',
    render: () => {
      const d = pending || { files: [] };
      const n = (d.files || []).length;
      return (d.preview ? '<img src="' + MA.esc(d.preview) + '" alt="" style="display:block;width:100%;border-radius:16px;border:1px solid var(--line)">' : '') +
        '<div class="notice gray">' + MA.icon('check', 'sm') + '<span class="grow">' + (n > 1 ? n + ' קבצים מוכנים.' : 'מוכן.') + ' לוחצים "שיתוף" ובוחרים לאן לשלוח או איפה לשמור.</span></div>' +
        '<button type="button" class="btn" data-action="share-ready">' + MA.icon('share') + 'שיתוף</button>' +
        '<button type="button" class="btn secondary" data-action="share-ready-save">' + MA.icon('download') + 'הורדה לטלפון</button>';
    }
  };
  MA.A['share-ready'] = () => {
    const d = pending; pending = null; MA.closeSheet();
    if (d) navigator.share(payload(d)).catch((e) => { if (!e || e.name !== 'AbortError') MA.downloadFiles(d.files); });
  };
  MA.A['share-ready-save'] = () => { const d = pending; pending = null; MA.closeSheet(); if (d) MA.downloadFiles(d.files); };
})();
