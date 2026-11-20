/* Receipt photos: taken with the camera (or picked from the gallery), made smaller, and kept in the app's own
   folder (receipts/<id>.jpg). In a browser / on iPhone they are kept in the browser's storage. */
(function () {
  'use strict';
  const MA = window.MA;
  const R = (MA.receipts = {});
  const BASE = 'maasroti/';
  const LS = 'maasroti.r.';
  const MAX = 1400;

  // Makes a picture at most MAX pixels wide or tall, as JPEG base64 (without the "data:" prefix).
  R.shrink = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, MAX / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const g = c.getContext('2d');
      g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
      g.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/jpeg', 0.72).split(',')[1]);
    };
    img.onerror = () => reject(new Error('bad image'));
    img.src = src;
  });

  // Asks for a picture. Resolves to base64 JPEG, or '' when cancelled.
  R.capture = async () => {
    if (MA.isNative() && MA.plugin('Camera')) {
      try {
        const p = await MA.callRaw('Camera', 'getPhoto', {
          quality: 70, width: MAX, height: MAX, resultType: 'base64', source: 'PROMPT', correctOrientation: true, saveToGallery: false,
          promptLabelHeader: 'צילום קבלה', promptLabelPhoto: 'בחירה מהגלריה', promptLabelPicture: 'צילום עכשיו', promptLabelCancel: 'ביטול'
        });
        return p && p.base64String ? p.base64String : '';
      } catch (e) {
        const m = String(e && (e.message || e));
        if (/cancel/i.test(m)) return '';
        if (/denied|permission/i.test(m)) MA.toast('כדי לצלם קבלה צריך לאשר גישה למצלמה בהגדרות הטלפון', 4000);
        else console.warn('camera', m);
        return '';
      }
    }
    return new Promise((resolve) => {
      const input = MA.$('#receipt-file');
      input.value = '';
      input.onchange = () => {
        const f = input.files && input.files[0];
        if (!f) { resolve(''); return; }
        const fr = new FileReader();
        fr.onload = () => R.shrink(String(fr.result)).then(resolve, () => { MA.toast('לא הצלחתי לקרוא את התמונה'); resolve(''); });
        fr.readAsDataURL(f);
      };
      input.click();
    });
  };

  R.save = async (id, b64) => {
    const key = 'receipts/' + id + '.jpg';
    if (MA.isNative()) {
      await MA.callRaw('Filesystem', 'writeFile', { path: BASE + key, data: b64, directory: 'DATA', recursive: true });
    } else {
      try { localStorage.setItem(LS + key, b64); } catch (e) { MA.toast('אין מספיק מקום לשמור את התמונה בדפדפן'); return ''; }
    }
    return key;
  };
  R.read = async (key) => {
    if (!key) return '';
    if (MA.isNative()) {
      try { const r = await MA.callRaw('Filesystem', 'readFile', { path: BASE + key, directory: 'DATA' }); return (r && r.data) || ''; } catch (e) { return ''; }
    }
    try { return localStorage.getItem(LS + key) || ''; } catch (e) { return ''; }
  };
  R.src = async (key) => { const b = await R.read(key); return b ? 'data:image/jpeg;base64,' + b : ''; };
  R.remove = async (key) => {
    if (!key) return;
    if (MA.isNative()) { try { await MA.callRaw('Filesystem', 'deleteFile', { path: BASE + key, directory: 'DATA' }); } catch (e) { /* gone */ } return; }
    try { localStorage.removeItem(LS + key); } catch (e) { /* ignore */ }
  };
})();
