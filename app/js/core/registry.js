/* Registries the other files fill in: screens (views), bottom sheets (SHEETS) and button actions (A). */
(function () {
  'use strict';
  const MA = window.MA;
  MA.views = MA.views || {};
  MA.SHEETS = MA.SHEETS || {};
  MA.A = MA.A || {};
  MA.$ = (sel, root) => (root || document).querySelector(sel);
})();
