/* Small helpers: escaping, ids, timing, numbers and money. */
(function () {
  'use strict';
  const MA = window.MA;

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  MA.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  MA.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  MA.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  MA.debounce = (fn, ms) => { let t; return function () { const a = arguments; clearTimeout(t); t = setTimeout(() => fn.apply(null, a), ms); }; };
  MA.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  MA.isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim());
  MA.isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
  MA.str = (v, n) => String(v == null ? '' : v).slice(0, n);
  MA.clip = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);
  MA.sum = (arr, f) => arr.reduce((t, x) => t + (f ? f(x) : x), 0);
  MA.round2 = (n) => Math.round((+n || 0) * 100) / 100;

  // A typed number: "1,250.5", "₪ 300" → number (NaN when empty or not a number).
  MA.num = (v) => {
    if (typeof v === 'number') return isFinite(v) ? v : NaN;
    const s = String(v == null ? '' : v).replace(/[₪,\s]/g, '').replace(/[٫]/g, '.');
    return s === '' ? NaN : Number(s);
  };
  const nf = {};
  MA.fmt = (n, d) => {
    if (!isFinite(n)) return '–';
    d = d == null ? (Math.abs(n % 1) > 0.004 ? 2 : 0) : d;
    if (!nf[d]) nf[d] = new Intl.NumberFormat('he-IL', { minimumFractionDigits: d, maximumFractionDigits: d });
    return nf[d].format(n);
  };
  MA.money = (n, d) => (isFinite(n) ? '₪' + MA.fmt(Math.abs(n) < 0.005 ? 0 : n, d) : '–');
  MA.money0 = (n) => MA.money(Math.round(n), 0);
  MA.plural = (n, one, many) => (n === 1 ? one : MA.fmt(n, 0) + ' ' + many);
  MA.pct = (r) => MA.fmt(r, r % 1 ? 1 : 0) + '%';
  MA.rateName = (r) => (r === 10 ? 'מעשר' : r === 20 ? 'חומש' : MA.pct(r));
})();
