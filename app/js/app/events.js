/* Taps, typing and file choosers. Every button has data-action="name"; its function is MA.A[name] (js/actions/). */
(function () {
  'use strict';
  const MA = window.MA;
  const ui = MA.ui;

  function onClick(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = MA.A[el.dataset.action];
    if (!fn) return;
    e.preventDefault();
    if (el.getAttribute('aria-disabled') === 'true' || el.disabled) return;
    fn(el, e);
  }

  // Live parts of a sheet that change while typing (without redrawing, so the keyboard stays open).
  function live(k, el) {
    if (MA.sheetIs('income') && ['amount', 'expenses', 'rate'].includes(k)) MA.part('inc-live', MA.incomeLive());
    if (k === 'date') {
      const h = document.getElementById(el.id + '-heb');
      const ts = MA.fromInput(el.value);
      if (h) h.textContent = isFinite(ts) ? MA.hebDate(ts) : '';
    }
  }

  function onInput(e) {
    const el = e.target;
    if (el.dataset.setting === 'rate') {
      const n = MA.num(el.value);
      if (n > 0 && n <= 100) { MA.state.settings.rate = n; MA.save(); }
      return;
    }
    if (el.dataset.f && ui.sheet) { ui.form[el.dataset.f] = el.value; live(el.dataset.f, el); }
  }

  function onChange(e) {
    const el = e.target;
    if (el.dataset.setting) { MA.render(true); return; }
    if (el.dataset.f && ui.sheet) {
      ui.form[el.dataset.f] = el.value;
      if (el.dataset.f === 'date' && MA.sheetIs('income') && !ui.form.id) MA.renderSheet();
    }
    if (el.id === 'import-file') { const file = el.files && el.files[0]; if (file) MA.readBackupFile(file); }
  }

  function onKey(e) {
    if (e.key === 'Escape' && ui.sheet) { MA.closeSheet(); return; }
    if (e.key === 'Enter' && e.target && e.target.tagName === 'INPUT') { e.preventDefault(); e.target.blur(); }
  }

  MA.bindEvents = () => {
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('change', onChange);
    document.addEventListener('keydown', onKey);
  };
})();
