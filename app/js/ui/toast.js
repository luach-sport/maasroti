/* Short messages at the bottom of the screen, and a light vibration on the phone. */
(function () {
  'use strict';
  const MA = window.MA;
  let timer;

  MA.toast = (msg, ms) => {
    const root = MA.$('#toast-root');
    root.innerHTML = '<div class="toast">' + MA.esc(msg) + '</div>';
    clearTimeout(timer);
    timer = setTimeout(() => { root.innerHTML = ''; }, ms || 2600);
  };
  MA.haptic = () => { if (MA.isNative()) MA.call('Haptics', 'impact', { style: 'LIGHT' }); };
})();
