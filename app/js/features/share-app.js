/* Sharing the app with friends: a short personal message with the link to the app's site, or the app
   itself as an APK file (Bluetooth, WhatsApp, Nearby Share, file manager…).
   The APK file is the one installed on this phone, so it works without internet. If that copy can't be
   reached, the latest APK is downloaded from GitHub instead. */
(function () {
  'use strict';
  const MA = window.MA;
  const S = (MA.shareApp = {});
  const FILE = 'share/maasroti.apk';

  S.text = 'היי! אני משתמש באפליקציה מעשרותי. היא מחשבת לבד כמה מעשרות לתת מכל הכנסה, זוכרת כל נתינה, מזכירה כל שבוע ויודעת להכין דוח לסעיף 46. בלי פרסומות ובלי הרשמה. אשמח מאוד לשתף אותך:';
  S.message = () => S.text + '\n' + MA.SITE_URL;

  S.link = () => MA.shareText(S.message(), 'שיתוף מעשרותי');

  // Where Android installed this app: the line with base.apk in the process memory map.
  async function installedApk() {
    const r = await MA.callRaw('Filesystem', 'readFile', { path: '/proc/self/maps', encoding: 'utf8' });
    const m = String((r && r.data) || '').match(/(\/data\/app\/\S+?\/base\.apk)/);
    if (!m) throw new Error('no base.apk');
    return m[1];
  }

  async function prepareFile(onStatus) {
    try { await MA.callRaw('Filesystem', 'deleteFile', { path: FILE, directory: 'CACHE' }); } catch (e) { /* not there */ }
    try { await MA.callRaw('Filesystem', 'mkdir', { path: 'share', directory: 'CACHE', recursive: true }); } catch (e) { /* exists */ }
    try {
      await MA.callRaw('Filesystem', 'copy', { from: await installedApk(), to: FILE, toDirectory: 'CACHE' });
    } catch (e) {
      console.warn('apk copy', e && (e.message || e));
      if (!MA.online()) throw new Error('offline');
      onStatus('מוריד את הקובץ…');
      await MA.callRaw('Filesystem', 'downloadFile', { url: MA.APK_URL, path: FILE, directory: 'CACHE', recursive: true });
    }
    const st = await MA.callRaw('Filesystem', 'stat', { path: FILE, directory: 'CACHE' });
    if (!st || st.size < 500000) throw new Error('small file');
    return (await MA.callRaw('Filesystem', 'getUri', { path: FILE, directory: 'CACHE' })).uri;
  }

  S.apk = async () => {
    if (!MA.isNative()) { window.open(MA.APK_URL, '_blank'); return true; }
    if (S.busy) return false;
    S.busy = true;
    MA.toast('מכין את הקובץ…', 8000);
    try {
      const uri = await prepareFile((t) => MA.toast(t, 30000));
      const t = MA.$('#toast-root'); if (t) t.innerHTML = '';
      await MA.callRaw('Share', 'share', { title: 'מעשרותי', text: S.message(), files: [uri], dialogTitle: 'שליחת האפליקציה כקובץ' });
      return true;
    } catch (e) {
      const msg = String(e && (e.message || e));
      if (/cancel/i.test(msg)) return false;
      console.warn('share apk', msg);
      MA.toast(msg === 'offline' ? 'אין אינטרנט כרגע. אפשר לשלוח קישור לאתר במקום' : 'לא הצלחתי להכין את הקובץ. אפשר לשלוח קישור לאתר במקום', 4000);
      return false;
    } finally {
      S.busy = false;
    }
  };
})();
