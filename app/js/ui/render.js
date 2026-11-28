/* Drawing the current screen: a tab (home, history, fund, targets, settings) or a month on top of them. */
(function () {
  'use strict';
  const MA = window.MA;
  const ui = MA.ui;

  const scrollKey = () => { const v = MA.view(); return v ? v.name + (v.id || '') : 'tab-' + ui.tab; };

  function screenHtml() {
    const V = MA.views, v = MA.view();
    if (v && v.name === 'month') return V.month(v.id);
    if (ui.tab === 'history') return V.history();
    if (ui.tab === 'fund') return V.fund();
    if (ui.tab === 'targets') return V.targets();
    if (ui.tab === 'settings') return V.settings();
    return V.home();
  }

  // keepScroll: true = stay where you are, 'restore' = back to where this screen was left, else top.
  MA.render = (keepScroll) => {
    const main = MA.$('#screen');
    const v = MA.view();
    const prevKey = main.dataset.key;
    if (prevKey) ui.scroll[prevKey] = window.scrollY;
    document.body.classList.toggle('no-tabs', !!v);
    main.classList.toggle('pushed', !!v);
    main.innerHTML = screenHtml();
    const key = scrollKey();
    main.dataset.key = key;
    document.querySelectorAll('#tabs button[data-tab]').forEach((b) => {
      if (b.getAttribute('data-tab') === ui.tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    if (keepScroll === true && prevKey === key) window.scrollTo(0, ui.scroll[key] || 0);
    else if (keepScroll === 'restore') window.scrollTo(0, ui.scroll[key] || 0);
    else window.scrollTo(0, 0);
  };

  MA.rerenderAll = () => { if (ui.sheet) MA.renderSheet(); MA.render(true); };
  MA.pushView = (v) => { ui.scroll[scrollKey()] = window.scrollY; ui.stack.push(v); MA.render(); };
  MA.popView = () => { ui.stack.pop(); MA.render('restore'); };
  MA.part = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
})();
