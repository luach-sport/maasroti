/* Bottom sheets (dialogs). Each sheet in js/sheets/ has: title(), render(), and optional init(), onClose(), full. */
(function () {
  'use strict';
  const MA = window.MA;
  const ui = MA.ui;
  const SHEETS = MA.SHEETS;

  MA.openSheet = (name, data) => {
    ui.sheet = { name, data: data || {} };
    if (SHEETS[name].init) SHEETS[name].init(ui.sheet.data);
    MA.renderSheet();
    const first = MA.$('#sheet-root [autofocus]');
    if (first) setTimeout(() => first.focus(), 80);
  };

  MA.closeSheet = () => {
    if (!ui.sheet) return;
    if (SHEETS[ui.sheet.name].noClose && SHEETS[ui.sheet.name].noClose()) return;
    if (SHEETS[ui.sheet.name].onClose) SHEETS[ui.sheet.name].onClose();
    ui.sheet = null;
    MA.$('#sheet-root').innerHTML = '';
  };

  MA.renderSheet = () => {
    const root = MA.$('#sheet-root');
    if (!ui.sheet) { root.innerHTML = ''; return; }
    const def = SHEETS[ui.sheet.name];
    const body = def.render(ui.sheet.data);
    const prev = root.querySelector('.sheet');
    const st = prev ? prev.scrollTop : 0;
    const title = def.title(ui.sheet.data);
    const locked = def.noClose && def.noClose();
    root.innerHTML = '<div class="sheet-wrap"><div class="sheet-backdrop"' + (locked ? '' : ' data-action="close-sheet"') + '></div>' +
      '<div class="sheet' + (def.full ? ' full' : '') + '" role="dialog" aria-modal="true" aria-label="' + MA.esc(title) + '">' +
      '<div class="grabber" aria-hidden="true"></div>' +
      '<div class="sheet-head">' + (locked ? '' : '<button type="button" class="icon-btn" aria-label="סגירה" data-action="close-sheet">' + MA.icon('close') + '</button>') + '<h2>' + MA.esc(title) + '</h2></div>' +
      body + '</div></div>';
    if (prev) {
      const s = root.querySelector('.sheet');
      if (s) { s.style.animation = 'none'; s.scrollTop = st; const b = root.querySelector('.sheet-backdrop'); if (b) b.style.animation = 'none'; }
    }
  };
  MA.sheetIs = (name) => !!ui.sheet && ui.sheet.name === name;

  // A list row that can be picked (used by several sheets).
  MA.pickRow = (action, v, label, on, extra) => '<button type="button" class="row" data-action="' + action + '" data-v="' + MA.esc(v) + '" aria-pressed="' + on + '">' + (extra || '') +
    '<span class="grow"><span class="t">' + MA.esc(label) + '</span></span>' + (on ? '<span class="check">' + MA.icon('check') + '</span>' : '') + '</button>';
})();
