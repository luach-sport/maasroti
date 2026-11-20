/* Clipboard, the share menu, and files to share (backup, Excel, reports). */
(function () {
  'use strict';
  const MA = window.MA;

  MA.writeClipboard = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { /* fall back below */ }
    try {
      const t = document.createElement('textarea');
      t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      const ok = document.execCommand('copy'); t.remove(); return ok;
    } catch (e) { return false; }
  };
  MA.shareText = async (text, title) => {
    if (MA.isNative()) { try { await MA.callRaw('Share', 'share', { text, title, dialogTitle: title || 'שיתוף' }); return true; } catch (e) { return false; } }
    if (navigator.share) { try { await navigator.share({ text, title }); return true; } catch (e) { return false; } }
    const ok = await MA.writeClipboard(text);
    if (ok && MA.toast) MA.toast('הועתק ללוח');
    return ok;
  };
  // files: [{ name, content, mime }]. Android: written to the cache and shared one by one (Drive, WhatsApp, mail…).
  // iPhone / browser: all together to the share sheet, or downloaded (web-share.js).
  MA.shareFiles = async (files, title) => {
    if (MA.isNative()) {
      for (const f of files) {
        const w = await MA.call('Filesystem', 'writeFile', { path: f.name, data: f.content, directory: 'CACHE', encoding: 'utf8' });
        if (!w || !w.uri) return false;
        try { await MA.callRaw('Share', 'share', { title: title || f.name, files: [w.uri], dialogTitle: title || 'שיתוף' }); } catch (e) {
          try { await MA.callRaw('Share', 'share', { title: title || f.name, url: w.uri, dialogTitle: title || 'שיתוף' }); } catch (e2) { return false; }
        }
      }
      return true;
    }
    const list = files.map((f) => new File([f.content], f.name, { type: f.mime }));
    if (MA.webShare) return (await MA.webShare({ files: list, title })) !== 'cancelled';
    MA.downloadFiles(list);
    return true;
  };
  MA.shareFile = (name, content, mime, title) => MA.shareFiles([{ name, content, mime }], title);
})();
