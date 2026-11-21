/* Bridge to the Android side (Capacitor plugins). */
(function () {
  'use strict';
  const MA = window.MA;

  MA.capacitor = () => { const rt = window.MaasrotiCap; return (rt && rt.Capacitor) || window.Capacitor || null; };
  MA.isNative = () => {
    const C = MA.capacitor();
    if (!C) return false;
    try { return typeof C.isNativePlatform === 'function' ? !!C.isNativePlatform() : C.platform === 'android'; } catch (e) { return false; }
  };
  const pluginCache = {};
  MA.plugin = (name) => {
    if (!MA.isNative()) return null;
    if (Object.prototype.hasOwnProperty.call(pluginCache, name)) return pluginCache[name];
    let p = null;
    try {
      const rt = window.MaasrotiCap;
      if (rt && typeof rt.registerPlugin === 'function') p = rt.registerPlugin(name);
      else if (window.Capacitor && window.Capacitor.Plugins) p = window.Capacitor.Plugins[name] || null;
    } catch (e) { p = null; }
    pluginCache[name] = p;
    return p;
  };
  MA.callRaw = async (name, method, args) => {
    const p = MA.plugin(name);
    if (!p || typeof p[method] !== 'function') throw new Error('no-plugin ' + name + '.' + method);
    return p[method](args);
  };
  MA.call = async (name, method, args) => {
    try { return await MA.callRaw(name, method, args); } catch (e) { console.warn('[native]', name, method, e && (e.message || e)); return undefined; }
  };
  MA.listen = async (name, event, cb) => {
    const p = MA.plugin(name);
    if (!p) return;
    try { await p.addListener(event, cb); } catch (e) { console.warn('[native] listen', name, event, e && e.message); }
  };
})();
