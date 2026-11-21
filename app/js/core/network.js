/* Online / offline status. */
(function () {
  'use strict';
  const MA = window.MA;

  let online = typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
  const netListeners = [];
  MA.online = () => online;
  MA.onNetwork = (cb) => netListeners.push(cb);
  function setOnline(v) {
    v = !!v;
    if (v === online) return;
    online = v;
    netListeners.forEach((cb) => { try { cb(v); } catch (e) { console.warn(e); } });
  }
  MA.initNetwork = async () => {
    window.addEventListener('online', () => setOnline(true));
    window.addEventListener('offline', () => setOnline(false));
    if (MA.isNative()) {
      const st = await MA.call('Network', 'getStatus');
      if (st && typeof st.connected === 'boolean') online = st.connected;
      MA.listen('Network', 'networkStatusChange', (s) => setOnline(s && s.connected));
    }
  };
})();
