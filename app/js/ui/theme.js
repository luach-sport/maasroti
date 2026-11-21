/* Light / dark / follow the phone, including the phone's status bar colour. */
(function () {
  'use strict';
  const MA = window.MA;

  MA.resolvedTheme = () => {
    const t = MA.state.settings.theme;
    if (t === 'system') return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return t;
  };
  MA.applyTheme = () => {
    const t = MA.resolvedTheme();
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('maasroti.theme', MA.state.settings.theme); } catch (e) { /* ignore */ }
    const bg = t === 'dark' ? '#0D1220' : '#F4F6FB';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', bg);
    if (MA.isNative()) {
      MA.call('StatusBar', 'setBackgroundColor', { color: bg });
      MA.call('StatusBar', 'setStyle', { style: t === 'dark' ? 'DARK' : 'LIGHT' });
    }
  };
  MA.watchSystemTheme = () => {
    if (!window.matchMedia) return;
    try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (MA.state.settings.theme === 'system') MA.applyTheme(); }); } catch (e) { /* old WebView */ }
  };
})();
